import { createHash, createHmac, randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { query, withTransaction } from '../api/_lib/db.js';

const STATUS = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  WARN: 'WARN',
};

const DEFAULTS = {
  users: 180,
  startConcurrency: 36,
  answerSubmitConcurrency: 48,
  resultsConcurrency: 64,
  outageJobs: 80,
  outageDlqSeed: 12,
  workerBatch: 120,
  workerMaxLoops: 8,
  requestTimeoutMs: 25000,
  scenarioMinUsers: 10000,
  scenarioMaxUsers: 15000,
  scenarioWindowMinutes: 180,
  minStartSuccessPct: 95,
  minResultsSuccessPct: 95,
  maxStartP95Ms: 2500,
  maxResultsP95Ms: 2200,
  maxOutageResidualPct: 5,
  allowSharedCampaign: false,
  simulateClientIps: true,
  includeResultPii: false,
  prewarmRequests: 8,
  directEvidenceMinUsers: 200,
  directEvidenceMinStartConcurrency: 20,
  allowProjectionOnly: false,
};

function trim(value) {
  return String(value ?? '').trim();
}

function readEnv(...names) {
  for (const name of names) {
    const value = trim(process.env[name]);
    if (value) return value;
  }
  return '';
}

function readInt(value, fallback, min, max) {
  const parsed = Number.parseInt(trim(value), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function readFloat(value, fallback, min, max) {
  const parsed = Number.parseFloat(trim(value));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function readBool(value, fallback) {
  const raw = trim(value).toLowerCase();
  if (!raw) return fallback;
  if (['1', 'true', 'yes', 'on'].includes(raw)) return true;
  if (['0', 'false', 'no', 'off'].includes(raw)) return false;
  return fallback;
}

function parseArgs(argv) {
  const map = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const eqIndex = token.indexOf('=');
    if (eqIndex > -1) {
      map[token.slice(2, eqIndex)] = token.slice(eqIndex + 1);
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      map[key] = 'true';
      continue;
    }
    map[key] = next;
    i += 1;
  }
  return map;
}

function ensureHttpsBase(value, fallback) {
  const raw = trim(value || fallback);
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, '');
  return `https://${raw.replace(/\/+$/, '')}`;
}

function percentile(values, ratio) {
  if (!Array.isArray(values) || values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
  return sorted[idx];
}

function summarizeLatency(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return {
      count: 0,
      min_ms: null,
      p50_ms: null,
      p95_ms: null,
      p99_ms: null,
      max_ms: null,
      avg_ms: null,
    };
  }

  const sum = values.reduce((acc, item) => acc + item, 0);
  const sorted = [...values].sort((a, b) => a - b);

  return {
    count: values.length,
    min_ms: sorted[0],
    p50_ms: percentile(sorted, 0.5),
    p95_ms: percentile(sorted, 0.95),
    p99_ms: percentile(sorted, 0.99),
    max_ms: sorted[sorted.length - 1],
    avg_ms: Math.round((sum / values.length) * 100) / 100,
  };
}

function toPct(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 10000) / 100;
}

function toRps(successCount, durationMs) {
  if (!durationMs || durationMs <= 0) return 0;
  const seconds = durationMs / 1000;
  if (seconds <= 0) return 0;
  return Math.round((successCount / seconds) * 1000) / 1000;
}

function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJson(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function pushCheck(checks, id, status, detail, evidence = {}) {
  checks.push({ id, status, detail, evidence });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildSyntheticIp(index) {
  // RFC 2544 benchmark block (198.18.0.0/15), deterministic per virtual user.
  const second = 18 + (index % 2);
  const third = Math.floor((index / 254) % 254);
  const fourth = 1 + (index % 254);
  return `198.${second}.${third}.${fourth}`;
}

function buildForwardedHeaders(index, enabled, loadTestKey = '') {
  if (!enabled) return {};
  const syntheticIp = buildSyntheticIp(index);
  return {
    'x-forwarded-for': syntheticIp,
    'x-load-test-ip': syntheticIp,
    'x-load-test-mode': 'throughput',
    ...(loadTestKey ? { 'x-load-test-key': loadTestKey } : {}),
  };
}

function summarizeChecks(checks) {
  const totals = {
    pass: 0,
    fail: 0,
    warn: 0,
  };

  for (const check of checks) {
    if (check.status === STATUS.PASS) totals.pass += 1;
    if (check.status === STATUS.FAIL) totals.fail += 1;
    if (check.status === STATUS.WARN) totals.warn += 1;
  }

  return totals;
}

async function runPool(items, concurrency, worker) {
  const safeConcurrency = Math.max(1, Math.min(concurrency, items.length || 1));
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: safeConcurrency }, async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  });

  await Promise.all(runners);
  return results;
}

async function httpJson(url, options = {}) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutMs = readInt(options.timeoutMs, DEFAULTS.requestTimeoutMs, 1000, 120000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const endedAt = Date.now();

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    return {
      ok: response.ok,
      status: response.status,
      latencyMs: endedAt - startedAt,
      payload,
      error: null,
    };
  } catch (error) {
    clearTimeout(timeout);
    return {
      ok: false,
      status: 0,
      latencyMs: Date.now() - startedAt,
      payload: null,
      error: error?.message || String(error),
    };
  }
}

function buildStartPayload({ runId, index, campaignCode }) {
  const seq = String(index + 1).padStart(5, '0');
  const phoneTail = String(600000000 + index).slice(-9);
  const schoolBucket = String((index % 12) + 1).padStart(2, '0');

  return {
    campaignCode,
    studentFullName: `P0-11 Student ${runId} ${seq}`,
    parentFullName: `P0-11 Parent ${runId} ${seq}`,
    parentPhoneE164: `+905${phoneTail}`,
    parentEmail: `p011-${runId}-${seq}@example.test`,
    schoolName: `P0-11 Load School ${schoolBucket}`,
    grade: 8,
    ageRange: '13-14',
    language: 'EN',
    source: 'p0_11_load_resilience',
    bankKey: 'placement_en_default',
    questionCount: 60,
    consent: {
      kvkkApproved: true,
      contactConsent: true,
      consentVersion: 'KVKK_v1_2026-03-13',
      legalTextVersion: 'KVKK_v1_2026-03-13',
      source: 'p0_11_load_resilience',
    },
    kvkkConsent: true,
    kvkkConsentVersion: 'KVKK_v1_2026-03-13',
    kvkkLegalTextVersion: 'KVKK_v1_2026-03-13',
    contactConsent: true,
  };
}

async function runStartBurst({
  examBaseUrl,
  runId,
  campaignCode,
  users,
  concurrency,
  timeoutMs,
  simulateClientIps,
  loadTestKey,
}) {
  const indexes = Array.from({ length: users }, (_, i) => i);
  const latencies = [];
  const statusCodes = {};
  const failures = [];
  const sessions = [];
  const startedAt = Date.now();

  const results = await runPool(indexes, concurrency, async (index) => {
    const payload = buildStartPayload({ runId, index, campaignCode });
    const response = await httpJson(`${examBaseUrl}/api/exam/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...buildForwardedHeaders(index, simulateClientIps, loadTestKey),
      },
      body: JSON.stringify(payload),
      timeoutMs,
    });

    statusCodes[String(response.status)] = (statusCodes[String(response.status)] || 0) + 1;
    latencies.push(response.latencyMs);

    if (response.ok && response.payload?.session?.attemptId && response.payload?.session?.sessionToken) {
      sessions.push({
        attemptId: response.payload.session.attemptId,
        sessionToken: response.payload.session.sessionToken,
        candidateId: response.payload.session.candidateId || null,
        syntheticIp: simulateClientIps ? buildSyntheticIp(index) : null,
      });
      return {
        ok: true,
        status: response.status,
        latencyMs: response.latencyMs,
      };
    }

    failures.push({
      index,
      status: response.status,
      error: response.error,
      code: trim(response.payload?.error),
      message: trim(response.payload?.message),
    });

    return {
      ok: false,
      status: response.status,
      latencyMs: response.latencyMs,
    };
  });

  const durationMs = Date.now() - startedAt;
  const successCount = results.filter((item) => item?.ok).length;

  return {
    users,
    concurrency,
    duration_ms: durationMs,
    requests_per_second: toRps(successCount, durationMs),
    success_count: successCount,
    failure_count: users - successCount,
    success_rate_pct: toPct(successCount, users),
    latency_ms: summarizeLatency(latencies),
    status_codes: statusCodes,
    failures: failures.slice(0, 20),
    sessions,
  };
}

async function runAnswerSubmit({
  examBaseUrl,
  sessions,
  concurrency,
  timeoutMs,
  simulateClientIps,
  loadTestKey,
}) {
  const latencies = [];
  const statusCodes = {};
  const failures = [];
  const submitted = [];
  const startedAt = Date.now();

  const results = await runPool(sessions, concurrency, async (session) => {
    const answerResponse = await httpJson(`${examBaseUrl}/api/exam/session/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-exam-session-token': session.sessionToken,
        ...(simulateClientIps && session.syntheticIp
          ? {
              'x-forwarded-for': session.syntheticIp,
              'x-load-test-ip': session.syntheticIp,
              'x-load-test-mode': 'throughput',
              ...(loadTestKey ? { 'x-load-test-key': loadTestKey } : {}),
            }
          : {}),
      },
      body: JSON.stringify({
        attemptId: session.attemptId,
        answers: [
          {
            questionId: 'p0-11-q1',
            selectedOption: 'A',
            isCorrect: true,
            questionWeight: 1,
            scoreDelta: 1,
          },
        ],
      }),
      timeoutMs,
    });

    statusCodes[`answer:${answerResponse.status}`] = (statusCodes[`answer:${answerResponse.status}`] || 0) + 1;
    latencies.push(answerResponse.latencyMs);

    if (!answerResponse.ok) {
      failures.push({
        step: 'answer',
        attemptId: session.attemptId,
        status: answerResponse.status,
        error: answerResponse.error,
        code: trim(answerResponse.payload?.error),
      });
      return { ok: false };
    }

    const submitResponse = await httpJson(`${examBaseUrl}/api/exam/session/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-exam-session-token': session.sessionToken,
        ...(simulateClientIps && session.syntheticIp
          ? {
              'x-forwarded-for': session.syntheticIp,
              'x-load-test-ip': session.syntheticIp,
              'x-load-test-mode': 'throughput',
              ...(loadTestKey ? { 'x-load-test-key': loadTestKey } : {}),
            }
          : {}),
      },
      body: JSON.stringify({
        attemptId: session.attemptId,
        completionStatus: 'completed',
        durationSeconds: 180,
        answers: [
          {
            questionId: 'p0-11-q1',
            selectedOption: 'A',
            isCorrect: true,
            questionWeight: 1,
            scoreDelta: 1,
          },
        ],
        metrics: {
          answeredCount: 1,
          correctCount: 1,
          wrongCount: 0,
          unansweredCount: 59,
          score: 1,
          percentage: 1.67,
        },
      }),
      timeoutMs,
    });

    statusCodes[`submit:${submitResponse.status}`] = (statusCodes[`submit:${submitResponse.status}`] || 0) + 1;
    latencies.push(submitResponse.latencyMs);

    if (!submitResponse.ok) {
      failures.push({
        step: 'submit',
        attemptId: session.attemptId,
        status: submitResponse.status,
        error: submitResponse.error,
        code: trim(submitResponse.payload?.error),
      });
      return { ok: false };
    }

    submitted.push(session);
    return { ok: true };
  });

  const durationMs = Date.now() - startedAt;
  const successCount = results.filter((item) => item?.ok).length;

  return {
    total_attempts: sessions.length,
    concurrency,
    duration_ms: durationMs,
    requests_per_second: toRps(successCount, durationMs),
    success_count: successCount,
    failure_count: sessions.length - successCount,
    success_rate_pct: toPct(successCount, sessions.length),
    latency_ms: summarizeLatency(latencies),
    status_codes: statusCodes,
    failures: failures.slice(0, 20),
    submitted_sessions: submitted,
  };
}

async function runResultsBurst({
  examBaseUrl,
  sessions,
  concurrency,
  timeoutMs,
  includeResultPii,
  simulateClientIps,
  loadTestKey,
}) {
  const latencies = [];
  const statusCodes = {};
  const failures = [];
  const startedAt = Date.now();

  const results = await runPool(sessions, concurrency, async (session) => {
    const includePiiValue = includeResultPii ? '1' : '0';
    const response = await httpJson(
      `${examBaseUrl}/api/exam/results/${encodeURIComponent(session.attemptId)}?include_pii=${includePiiValue}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'x-exam-session-token': session.sessionToken,
          ...(simulateClientIps && session.syntheticIp
            ? {
                'x-forwarded-for': session.syntheticIp,
                'x-load-test-ip': session.syntheticIp,
                'x-load-test-mode': 'throughput',
                ...(loadTestKey ? { 'x-load-test-key': loadTestKey } : {}),
              }
            : {}),
        },
        timeoutMs,
      },
    );

    latencies.push(response.latencyMs);
    statusCodes[String(response.status)] = (statusCodes[String(response.status)] || 0) + 1;

    const ok = response.ok && response.payload?.result?.attempt_id === session.attemptId;
    if (!ok) {
      failures.push({
        attemptId: session.attemptId,
        status: response.status,
        error: response.error,
        code: trim(response.payload?.error),
      });
    }

    return { ok };
  });

  const durationMs = Date.now() - startedAt;
  const successCount = results.filter((item) => item?.ok).length;

  return {
    total_attempts: sessions.length,
    concurrency,
    duration_ms: durationMs,
    requests_per_second: toRps(successCount, durationMs),
    success_count: successCount,
    failure_count: sessions.length - successCount,
    success_rate_pct: toPct(successCount, sessions.length),
    latency_ms: summarizeLatency(latencies),
    status_codes: statusCodes,
    failures: failures.slice(0, 20),
  };
}

async function prewarmExamApi({ examBaseUrl, timeoutMs, requests, simulateClientIps, loadTestKey }) {
  if (requests <= 0) {
    return {
      requests: 0,
      success_count: 0,
      failure_count: 0,
    };
  }

  const indexes = Array.from({ length: requests }, (_, index) => index);
  const responses = await runPool(indexes, Math.min(8, requests), async (index) =>
    httpJson(`${examBaseUrl}/api/health`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...buildForwardedHeaders(index, simulateClientIps, loadTestKey),
      },
      timeoutMs,
    }));
  const endpointWarmups = await Promise.all([
    httpJson(`${examBaseUrl}/api/exam/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...buildForwardedHeaders(0, simulateClientIps, loadTestKey),
      },
      body: JSON.stringify({}),
      timeoutMs,
    }),
    httpJson(`${examBaseUrl}/api/exam/session/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...buildForwardedHeaders(1, simulateClientIps, loadTestKey),
      },
      body: JSON.stringify({}),
      timeoutMs,
    }),
    httpJson(`${examBaseUrl}/api/exam/session/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...buildForwardedHeaders(2, simulateClientIps, loadTestKey),
      },
      body: JSON.stringify({}),
      timeoutMs,
    }),
    httpJson(`${examBaseUrl}/api/exam/results/${encodeURIComponent('warmup-attempt')}?include_pii=0`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...buildForwardedHeaders(3, simulateClientIps, loadTestKey),
      },
      timeoutMs,
    }),
  ]);
  const endpointWarmupSuccess = endpointWarmups.filter(
    (item) => item.status >= 200 && item.status < 500,
  ).length;
  const successCount = responses.filter((item) => item?.ok).length;
  return {
    requests: requests + endpointWarmups.length,
    success_count: successCount + endpointWarmupSuccess,
    failure_count: (requests - successCount) + (endpointWarmups.length - endpointWarmupSuccess),
    endpoint_warmup: {
      total: endpointWarmups.length,
      success_count: endpointWarmupSuccess,
      statuses: endpointWarmups.map((item) => item.status),
    },
  };
}

async function seedOutageJobs({
  campaignCode,
  runId,
  count,
  dlqSeedCount,
  candidateIds,
}) {
  if (count <= 0) {
    return {
      jobIds: [],
      seeded_count: 0,
      dlq_seed_count: 0,
    };
  }

  const rows = Array.from({ length: count }, (_, index) => {
    const jobId = randomUUID();
    const channel = index % 2 === 0 ? 'SMS' : 'WHATSAPP';
    const candidateId = candidateIds.length > 0 ? candidateIds[index % candidateIds.length] : null;
    const retryCount = index < dlqSeedCount ? 5 : 0;
    const recipient = `fault://provider-outage/${runId}/${String(index + 1).padStart(4, '0')}`;

    return {
      jobId,
      channel,
      campaignCode,
      candidateId,
      recipient,
      retryCount,
    };
  });

  await withTransaction(async (client) => {
    await client.query(
      `
        INSERT INTO campaigns (code, name, is_active)
        VALUES ($1, $2, TRUE)
        ON CONFLICT (code) DO NOTHING
      `,
      [campaignCode, `${campaignCode} Load Test Campaign`],
    );

    for (const row of rows) {
      await client.query(
        `
          INSERT INTO notification_jobs (
            id,
            campaign_code,
            candidate_id,
            channel,
            template_code,
            recipient,
            payload,
            status,
            retry_count,
            next_retry_at,
            enqueued_at,
            created_at,
            updated_at
          )
          VALUES (
            $1,
            $2,
            $3,
            $4::notification_channel,
            'P0_11_OUTAGE_TEST',
            $5,
            $6::jsonb,
            'QUEUED'::notification_status,
            $7,
            NOW(),
            NOW() - INTERVAL '3650 days',
            NOW() - INTERVAL '3650 days',
            NOW() - INTERVAL '3650 days'
          )
        `,
        [
          row.jobId,
          row.campaignCode,
          row.candidateId,
          row.channel,
          row.recipient,
          JSON.stringify({
            run_id: runId,
            scenario: 'provider_outage',
          }),
          row.retryCount,
        ],
      );

      await client.query(
        `
          INSERT INTO notification_events (
            job_id,
            event_type,
            payload,
            created_at
          )
          VALUES ($1, 'QUEUED', $2::jsonb, NOW() - INTERVAL '3650 days')
        `,
        [
          row.jobId,
          JSON.stringify({
            source: 'p0_11_seed',
            run_id: runId,
          }),
        ],
      );
    }
  });

  return {
    jobIds: rows.map((row) => row.jobId),
    seeded_count: rows.length,
    dlq_seed_count: Math.min(dlqSeedCount, rows.length),
  };
}

async function readJobState(jobIds) {
  if (!Array.isArray(jobIds) || jobIds.length === 0) {
    return {
      total: 0,
      queued: 0,
      retrying: 0,
      dlq: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      cancelled: 0,
      outage_errors: 0,
      dlq_open: 0,
      dlq_requeued: 0,
      dlq_closed: 0,
    };
  }

  const statusResp = await query(
    `
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'QUEUED')::int AS queued,
        COUNT(*) FILTER (WHERE status = 'RETRYING')::int AS retrying,
        COUNT(*) FILTER (WHERE status = 'DLQ')::int AS dlq,
        COUNT(*) FILTER (WHERE status = 'SENT')::int AS sent,
        COUNT(*) FILTER (WHERE status = 'DELIVERED')::int AS delivered,
        COUNT(*) FILTER (WHERE status = 'READ')::int AS read,
        COUNT(*) FILTER (WHERE status = 'CANCELLED')::int AS cancelled,
        COUNT(*) FILTER (WHERE last_error_code = 'simulated_provider_outage')::int AS outage_errors
      FROM notification_jobs
      WHERE id = ANY($1::uuid[])
    `,
    [jobIds],
  );

  const dlqResp = await query(
    `
      SELECT
        COUNT(*) FILTER (WHERE status = 'OPEN')::int AS dlq_open,
        COUNT(*) FILTER (WHERE status = 'REQUEUED')::int AS dlq_requeued,
        COUNT(*) FILTER (WHERE status = 'CLOSED')::int AS dlq_closed
      FROM dlq_jobs
      WHERE source_job_id = ANY($1::uuid[])
    `,
    [jobIds],
  );

  return {
    ...(statusResp.rows[0] || {}),
    ...(dlqResp.rows[0] || {}),
  };
}

async function updateRecoveryRecipients(jobIds, runId) {
  if (!jobIds.length) return;

  await withTransaction(async (client) => {
    for (const jobId of jobIds) {
      await client.query(
        `
          UPDATE notification_jobs
          SET
            recipient = $2,
            payload = payload || $3::jsonb,
            updated_at = NOW()
          WHERE id = $1
        `,
        [
          jobId,
          `fault://provider-ok/${runId}/${jobId}`,
          JSON.stringify({
            recovery_mode: 'provider_restored',
            run_id: runId,
          }),
        ],
      );
    }
  });
}

async function requeueRetryingJobs(jobIds) {
  if (!jobIds.length) return 0;
  const resp = await query(
    `
      UPDATE notification_jobs
      SET
        status = 'QUEUED',
        next_retry_at = NOW(),
        updated_at = NOW()
      WHERE id = ANY($1::uuid[])
        AND status = 'RETRYING'
      RETURNING id
    `,
    [jobIds],
  );
  return resp.rowCount;
}

async function invokeWorker({
  workerBaseUrl,
  workerSecret,
  limit,
  reconcileLimit,
  campaignCode,
  timeoutMs,
}) {
  const url = new URL(`${workerBaseUrl}/api/notifications/worker`);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('reconcile_limit', String(reconcileLimit));
  if (campaignCode) {
    url.searchParams.set('campaign_code', campaignCode);
  }

  return httpJson(url.toString(), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${workerSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      limit,
      reconcile_limit: reconcileLimit,
      campaign_code: campaignCode || undefined,
    }),
    timeoutMs,
  });
}

async function invokeDlqReplay({
  workerBaseUrl,
  workerSecret,
  campaignCode,
  limit,
  timeoutMs,
}) {
  const url = new URL(`${workerBaseUrl}/api/notifications/dlq-replay`);
  url.searchParams.set('limit', String(limit));
  if (campaignCode) {
    url.searchParams.set('campaign_code', campaignCode);
  }

  return httpJson(url.toString(), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${workerSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      limit,
      campaign_code: campaignCode || undefined,
    }),
    timeoutMs,
  });
}

async function runNotificationResilience({
  runId,
  campaignCode,
  candidateIds,
  outageJobs,
  outageDlqSeed,
  workerBaseUrl,
  workerSecret,
  workerBatch,
  workerMaxLoops,
  timeoutMs,
}) {
  const seeded = await seedOutageJobs({
    campaignCode,
    runId,
    count: outageJobs,
    dlqSeedCount: outageDlqSeed,
    candidateIds,
  });

  const jobIds = seeded.jobIds;
  const outageRuns = [];
  let postOutage = await readJobState(jobIds);

  for (let loop = 0; loop < workerMaxLoops; loop += 1) {
    // Keep retriable jobs eligible in test mode so recovery convergence can be measured deterministically.
    await requeueRetryingJobs(jobIds);

    const queuedOrRetrying = Number(postOutage.queued || 0) + Number(postOutage.retrying || 0);
    if (queuedOrRetrying === 0) break;

    const workerResp = await invokeWorker({
      workerBaseUrl,
      workerSecret,
      limit: Math.max(workerBatch, outageJobs),
      reconcileLimit: Math.max(workerBatch, outageJobs),
      campaignCode,
      timeoutMs,
    });
    outageRuns.push({
      loop: loop + 1,
      status: workerResp.status,
      ok: workerResp.ok,
      payload: workerResp.payload,
      error: workerResp.error,
    });

    if (workerResp.payload?.reason === 'worker_lock_held') {
      await sleep(1200);
    }

    postOutage = await readJobState(jobIds);

    if (Number(postOutage.queued || 0) === 0) break;
  }

  const outageState = await readJobState(jobIds);

  await updateRecoveryRecipients(jobIds, runId);

  const dlqReplay = await invokeDlqReplay({
    workerBaseUrl,
    workerSecret,
    campaignCode,
    limit: Math.max(workerBatch, outageJobs),
    timeoutMs,
  });

  const retryingRequeued = await requeueRetryingJobs(jobIds);

  const recoveryRuns = [];
  let finalState = await readJobState(jobIds);
  for (let loop = 0; loop < workerMaxLoops; loop += 1) {
    // Re-queue RETRYING jobs before each recovery attempt to avoid waiting real backoff windows.
    await requeueRetryingJobs(jobIds);

    const pending = Number(finalState.queued || 0) + Number(finalState.retrying || 0) + Number(finalState.dlq || 0);
    if (pending === 0) break;

    if (Number(finalState.dlq || 0) > 0) {
      await invokeDlqReplay({
        workerBaseUrl,
        workerSecret,
        campaignCode,
        limit: Math.max(workerBatch, outageJobs),
        timeoutMs,
      });
    }

    const workerResp = await invokeWorker({
      workerBaseUrl,
      workerSecret,
      limit: Math.max(workerBatch, outageJobs),
      reconcileLimit: Math.max(workerBatch, outageJobs),
      campaignCode,
      timeoutMs,
    });

    recoveryRuns.push({
      loop: loop + 1,
      status: workerResp.status,
      ok: workerResp.ok,
      payload: workerResp.payload,
      error: workerResp.error,
    });

    if (workerResp.payload?.reason === 'worker_lock_held') {
      await sleep(1200);
    }

    finalState = await readJobState(jobIds);
  }

  return {
    seeded,
    outage_runs: outageRuns,
    outage_state: outageState,
    dlq_replay: {
      status: dlqReplay.status,
      ok: dlqReplay.ok,
      payload: dlqReplay.payload,
      error: dlqReplay.error,
    },
    retrying_requeued_count: retryingRequeued,
    recovery_runs: recoveryRuns,
    final_state: finalState,
  };
}

function buildMarkdownSummary(report) {
  const checksLines = report.checks
    .map((check) => `| ${check.id} | ${check.status} | ${check.detail.replace(/\|/g, '/')} |`)
    .join('\n');

  return [
    '# Teachera P0-11 Certified Load & Resilience Report',
    '',
    `- Run ID: \`${report.run_id}\``,
    `- Generated At (UTC): \`${report.generated_at_utc}\``,
    `- Overall Ready: \`${report.overall_ready_for_p0_11}\``,
    `- Signed: \`${Boolean(report.signature?.signature)}\``,
    '',
    '## Burst Metrics',
    '',
    `- Direct executed users: **${report.config.users_executed}**`,
    `- Start concurrency: **${report.config.start_concurrency}**`,
    `- Start success: **${report.metrics.start_burst.success_rate_pct}%**`,
    `- Start p95: **${report.metrics.start_burst.latency_ms.p95_ms} ms**`,
    `- Results success: **${report.metrics.results_burst.success_rate_pct}%**`,
    `- Results p95: **${report.metrics.results_burst.latency_ms.p95_ms} ms**`,
    '',
    '## Scenario Projection',
    '',
    `- Effective RPS: **${report.metrics.scenario_projection.effective_rps}**`,
    `- Window: **${report.config.scenario_window_minutes} minutes**`,
    `- Projected max users in window: **${report.metrics.scenario_projection.projected_capacity_users}**`,
    '',
    '## Resilience',
    '',
    `- Outage errors captured: **${report.metrics.notification_resilience.outage_state.outage_errors}**`,
    `- Final pending after recovery (queued+retrying+dlq): **${report.metrics.notification_resilience.final_pending_count}**`,
    '',
    '## Checks',
    '',
    '| Check | Status | Detail |',
    '|---|---|---|',
    checksLines,
    '',
  ].join('\n');
}

async function main() {
  const cli = parseArgs(process.argv.slice(2));
  const runId = new Date().toISOString().replace(/[:.]/g, '-');

  const examBaseUrl = ensureHttpsBase(
    cli.exam_api_base_url || readEnv('EXAM_API_BASE_URL', 'OPS_API_BASE_URL'),
    'https://exam-api.teachera.com.tr',
  );
  const workerBaseUrl = ensureHttpsBase(
    cli.worker_base_url || readEnv('EXAM_API_BASE_URL', 'OPS_API_BASE_URL'),
    'https://exam-api.teachera.com.tr',
  );
  const workerSecret = trim(cli.worker_secret || readEnv('NOTIFICATION_WORKER_SECRET', 'CRON_SECRET'));
  const campaignCode = trim(cli.campaign_code || readEnv('P0_11_CAMPAIGN_CODE') || `P0_11_${runId}`);
  const signingKey = trim(cli.signing_key || readEnv('P0_11_REPORT_SIGNING_KEY', 'CRON_SECRET'));
  const signer = trim(cli.signer || readEnv('P0_11_REPORT_SIGNER') || 'teachera-ops');
  const reportOut = resolve(trim(cli.report_out || readEnv('P0_11_REPORT_OUT') || 'guidelines/p0-11-load-resilience-report-latest.json'));
  const summaryOut = resolve(trim(cli.summary_out || readEnv('P0_11_REPORT_SUMMARY_OUT') || 'guidelines/p0-11-load-resilience-report-latest.md'));

  const config = {
    exam_api_base_url: examBaseUrl,
    worker_base_url: workerBaseUrl,
    users: readInt(cli.users, DEFAULTS.users, 20, 5000),
    start_concurrency: readInt(cli.start_concurrency, DEFAULTS.startConcurrency, 1, 500),
    answer_submit_concurrency: readInt(cli.answer_submit_concurrency, DEFAULTS.answerSubmitConcurrency, 1, 500),
    results_concurrency: readInt(cli.results_concurrency, DEFAULTS.resultsConcurrency, 1, 500),
    outage_jobs: readInt(cli.outage_jobs, DEFAULTS.outageJobs, 1, 2000),
    outage_dlq_seed: readInt(cli.outage_dlq_seed, DEFAULTS.outageDlqSeed, 0, 1000),
    worker_batch: readInt(cli.worker_batch, DEFAULTS.workerBatch, 1, 200),
    worker_max_loops: readInt(cli.worker_max_loops, DEFAULTS.workerMaxLoops, 1, 20),
    timeout_ms: readInt(cli.timeout_ms, DEFAULTS.requestTimeoutMs, 1000, 120000),
    scenario_min_users: readInt(cli.scenario_min_users, DEFAULTS.scenarioMinUsers, 1000, 50000),
    scenario_max_users: readInt(cli.scenario_max_users, DEFAULTS.scenarioMaxUsers, 1000, 50000),
    scenario_window_minutes: readInt(cli.scenario_window_minutes, DEFAULTS.scenarioWindowMinutes, 15, 720),
    min_start_success_pct: readFloat(cli.min_start_success_pct, DEFAULTS.minStartSuccessPct, 1, 100),
    min_results_success_pct: readFloat(cli.min_results_success_pct, DEFAULTS.minResultsSuccessPct, 1, 100),
    max_start_p95_ms: readInt(cli.max_start_p95_ms, DEFAULTS.maxStartP95Ms, 50, 120000),
    max_results_p95_ms: readInt(cli.max_results_p95_ms, DEFAULTS.maxResultsP95Ms, 50, 120000),
    max_outage_residual_pct: readFloat(cli.max_outage_residual_pct, DEFAULTS.maxOutageResidualPct, 0, 100),
    allow_shared_campaign: trim(cli.allow_shared_campaign || '').toLowerCase() === 'true' || DEFAULTS.allowSharedCampaign,
    simulate_client_ips: readBool(cli.simulate_client_ips || readEnv('P0_11_SIMULATE_CLIENT_IPS'), DEFAULTS.simulateClientIps),
    include_result_pii: readBool(cli.include_result_pii || readEnv('P0_11_INCLUDE_RESULT_PII'), DEFAULTS.includeResultPii),
    prewarm_requests: readInt(cli.prewarm_requests || readEnv('P0_11_PREWARM_REQUESTS'), DEFAULTS.prewarmRequests, 0, 200),
    direct_evidence_min_users: readInt(
      cli.direct_evidence_min_users || readEnv('P0_11_DIRECT_EVIDENCE_MIN_USERS'),
      DEFAULTS.directEvidenceMinUsers,
      1,
      50000,
    ),
    direct_evidence_min_start_concurrency: readInt(
      cli.direct_evidence_min_start_concurrency || readEnv('P0_11_DIRECT_EVIDENCE_MIN_START_CONCURRENCY'),
      DEFAULTS.directEvidenceMinStartConcurrency,
      1,
      5000,
    ),
    independent_evidence_uri: trim(cli.independent_evidence_uri || readEnv('P0_11_INDEPENDENT_EVIDENCE_URI')),
    independent_evidence_reference: trim(
      cli.independent_evidence_reference || readEnv('P0_11_INDEPENDENT_EVIDENCE_REFERENCE'),
    ),
    allow_projection_only: readBool(
      cli.allow_projection_only || readEnv('P0_11_ALLOW_PROJECTION_ONLY'),
      DEFAULTS.allowProjectionOnly,
    ),
    load_test_key: trim(
      cli.load_test_key
      || readEnv('P0_11_LOAD_TEST_KEY', 'LOAD_TEST_BYPASS_KEY')
      || workerSecret,
    ),
  };

  if (!readEnv('DATABASE_URL', 'POSTGRES_URL')) {
    throw new Error('DATABASE_URL/POSTGRES_URL is required for P0-11 certification run.');
  }
  if (!workerSecret) {
    throw new Error('NOTIFICATION_WORKER_SECRET or CRON_SECRET is required for worker resilience test.');
  }
  if (!config.allow_shared_campaign && !campaignCode.startsWith('P0_11_')) {
    throw new Error('For safety, use a dedicated campaign code that starts with P0_11_ (or pass --allow_shared_campaign true).');
  }

  const prewarm = await prewarmExamApi({
    examBaseUrl,
    timeoutMs: config.timeout_ms,
    requests: config.prewarm_requests,
    simulateClientIps: config.simulate_client_ips,
    loadTestKey: config.load_test_key,
  });

  const startBurst = await runStartBurst({
    examBaseUrl,
    runId,
    campaignCode,
    users: config.users,
    concurrency: config.start_concurrency,
    timeoutMs: config.timeout_ms,
    simulateClientIps: config.simulate_client_ips,
    loadTestKey: config.load_test_key,
  });

  const answerSubmit = await runAnswerSubmit({
    examBaseUrl,
    sessions: startBurst.sessions,
    concurrency: config.answer_submit_concurrency,
    timeoutMs: config.timeout_ms,
    simulateClientIps: config.simulate_client_ips,
    loadTestKey: config.load_test_key,
  });

  const resultsBurst = await runResultsBurst({
    examBaseUrl,
    sessions: answerSubmit.submitted_sessions,
    concurrency: config.results_concurrency,
    timeoutMs: config.timeout_ms,
    includeResultPii: config.include_result_pii,
    simulateClientIps: config.simulate_client_ips,
    loadTestKey: config.load_test_key,
  });

  const candidateIds = startBurst.sessions
    .map((item) => item.candidateId)
    .filter((item) => typeof item === 'string' && item.length > 0);

  const notificationResilience = await runNotificationResilience({
    runId,
    campaignCode,
    candidateIds,
    outageJobs: config.outage_jobs,
    outageDlqSeed: config.outage_dlq_seed,
    workerBaseUrl,
    workerSecret,
    workerBatch: config.worker_batch,
    workerMaxLoops: config.worker_max_loops,
    timeoutMs: config.timeout_ms,
  });

  const finalPendingCount =
    Number(notificationResilience.final_state.queued || 0)
    + Number(notificationResilience.final_state.retrying || 0)
    + Number(notificationResilience.final_state.dlq || 0);
  notificationResilience.final_pending_count = finalPendingCount;

  const effectiveRps = Math.min(
    startBurst.requests_per_second || 0,
    resultsBurst.requests_per_second || 0,
  );
  const projectedCapacityUsers = Math.floor(effectiveRps * config.scenario_window_minutes * 60);
  const directEvidenceUserOk = config.users >= config.direct_evidence_min_users;
  const directEvidenceConcurrencyOk = config.start_concurrency >= config.direct_evidence_min_start_concurrency;
  const hasIndependentEvidence = Boolean(config.independent_evidence_uri || config.independent_evidence_reference);
  const directEvidencePass = (directEvidenceUserOk && directEvidenceConcurrencyOk) || hasIndependentEvidence;

  const checks = [];
  const { sessions: _startSessions, ...startBurstPublic } = startBurst;
  const { submitted_sessions: _submittedSessions, ...answerSubmitPublic } = answerSubmit;

  pushCheck(
    checks,
    'burst_exam_start_success_rate',
    startBurst.success_rate_pct >= config.min_start_success_pct ? STATUS.PASS : STATUS.FAIL,
    `Start success ${startBurst.success_rate_pct}% (target >= ${config.min_start_success_pct}%).`,
    {
      success_rate_pct: startBurst.success_rate_pct,
      target_pct: config.min_start_success_pct,
    },
  );

  pushCheck(
    checks,
    'burst_exam_start_p95_latency',
    (startBurst.latency_ms.p95_ms || Infinity) <= config.max_start_p95_ms ? STATUS.PASS : STATUS.FAIL,
    `Start p95 ${startBurst.latency_ms.p95_ms}ms (target <= ${config.max_start_p95_ms}ms).`,
    {
      p95_ms: startBurst.latency_ms.p95_ms,
      target_ms: config.max_start_p95_ms,
    },
  );

  pushCheck(
    checks,
    'burst_results_success_rate',
    resultsBurst.success_rate_pct >= config.min_results_success_pct ? STATUS.PASS : STATUS.FAIL,
    `Results success ${resultsBurst.success_rate_pct}% (target >= ${config.min_results_success_pct}%).`,
    {
      success_rate_pct: resultsBurst.success_rate_pct,
      target_pct: config.min_results_success_pct,
    },
  );

  pushCheck(
    checks,
    'burst_results_p95_latency',
    (resultsBurst.latency_ms.p95_ms || Infinity) <= config.max_results_p95_ms ? STATUS.PASS : STATUS.FAIL,
    `Results p95 ${resultsBurst.latency_ms.p95_ms}ms (target <= ${config.max_results_p95_ms}ms).`,
    {
      p95_ms: resultsBurst.latency_ms.p95_ms,
      target_ms: config.max_results_p95_ms,
    },
  );

  const outageErrors = Number(notificationResilience.outage_state.outage_errors || 0);
  const outageWorkerFailures = notificationResilience.outage_runs.reduce((acc, run) => {
    const failed = Number(run?.payload?.failed || 0);
    const dlq = Number(run?.payload?.dlq || 0);
    return acc + failed + dlq;
  }, 0);
  pushCheck(
    checks,
    'provider_outage_simulation',
    outageErrors > 0 || outageWorkerFailures > 0 ? STATUS.PASS : STATUS.FAIL,
    outageErrors > 0 || outageWorkerFailures > 0
      ? `Outage simulation captured failures (error-tagged=${outageErrors}, worker_failed_or_dlq=${outageWorkerFailures}).`
      : 'Outage simulation did not produce simulated provider outage failures.',
    {
      outage_errors: outageErrors,
      worker_failed_or_dlq: outageWorkerFailures,
    },
  );

  const dlqReplayCount = Number(notificationResilience.dlq_replay?.payload?.replayed || 0);
  const expectedDlqSeed = Number(notificationResilience.seeded.dlq_seed_count || 0);
  pushCheck(
    checks,
    'dlq_replay_recovery',
    dlqReplayCount >= Math.min(1, expectedDlqSeed) ? STATUS.PASS : STATUS.WARN,
    `DLQ replay returned ${dlqReplayCount} requeued jobs (seeded immediate-DLQ: ${expectedDlqSeed}).`,
    {
      replayed: dlqReplayCount,
      dlq_seed_count: expectedDlqSeed,
    },
  );

  const residualPct = toPct(finalPendingCount, config.outage_jobs);
  pushCheck(
    checks,
    'queue_backlog_recovery',
    residualPct <= config.max_outage_residual_pct ? STATUS.PASS : STATUS.FAIL,
    `Backlog residual ${finalPendingCount}/${config.outage_jobs} (${residualPct}%) after recovery (target <= ${config.max_outage_residual_pct}%).`,
    {
      pending_jobs: finalPendingCount,
      outage_jobs: config.outage_jobs,
      residual_pct: residualPct,
      max_residual_pct: config.max_outage_residual_pct,
    },
  );

  pushCheck(
    checks,
    'direct_peak_evidence',
    directEvidencePass
      ? STATUS.PASS
      : (config.allow_projection_only ? STATUS.WARN : STATUS.FAIL),
    directEvidencePass
      ? (
          hasIndependentEvidence
            ? 'Independent peak-evidence attached (external/distributed proof provided).'
            : `Direct execution evidence met (${config.users} users, start concurrency ${config.start_concurrency}).`
        )
      : (
          config.allow_projection_only
            ? `Projection-only mode enabled; direct evidence below threshold (${config.users}/${config.direct_evidence_min_users} users, start concurrency ${config.start_concurrency}/${config.direct_evidence_min_start_concurrency}).`
            : `Direct peak evidence is insufficient (${config.users}/${config.direct_evidence_min_users} users, start concurrency ${config.start_concurrency}/${config.direct_evidence_min_start_concurrency}). Re-run with higher direct load or attach independent evidence.`
        ),
    {
      users_executed: config.users,
      min_users_required: config.direct_evidence_min_users,
      start_concurrency: config.start_concurrency,
      min_start_concurrency_required: config.direct_evidence_min_start_concurrency,
      independent_evidence_uri_present: Boolean(config.independent_evidence_uri),
      independent_evidence_reference_present: Boolean(config.independent_evidence_reference),
      allow_projection_only: config.allow_projection_only,
    },
  );

  pushCheck(
    checks,
    'scenario_10k_projection',
    projectedCapacityUsers >= config.scenario_min_users ? STATUS.PASS : STATUS.FAIL,
    `Projected capacity ${projectedCapacityUsers} users in ${config.scenario_window_minutes}m (target >= ${config.scenario_min_users}).`,
    {
      projected_capacity_users: projectedCapacityUsers,
      target_users: config.scenario_min_users,
    },
  );

  pushCheck(
    checks,
    'scenario_15k_projection',
    projectedCapacityUsers >= config.scenario_max_users ? STATUS.PASS : STATUS.FAIL,
    `Projected capacity ${projectedCapacityUsers} users in ${config.scenario_window_minutes}m (target >= ${config.scenario_max_users}).`,
    {
      projected_capacity_users: projectedCapacityUsers,
      target_users: config.scenario_max_users,
    },
  );

  const reportCore = {
    run_id: runId,
    generated_at_utc: new Date().toISOString(),
    doD_target: 'P0-11 Run certified load and resilience tests',
    config: {
      ...config,
      campaign_code: campaignCode,
      users_executed: config.users,
      worker_secret_present: Boolean(workerSecret),
      signing_key_present: Boolean(signingKey),
    },
    metrics: {
      start_burst: startBurstPublic,
      answer_submit: answerSubmitPublic,
      results_burst: resultsBurst,
      prewarm,
      notification_resilience: notificationResilience,
      direct_execution_evidence: {
        users_executed: config.users,
        start_concurrency: config.start_concurrency,
        min_users_required: config.direct_evidence_min_users,
        min_start_concurrency_required: config.direct_evidence_min_start_concurrency,
        direct_user_gate_ok: directEvidenceUserOk,
        direct_concurrency_gate_ok: directEvidenceConcurrencyOk,
        independent_evidence_uri: config.independent_evidence_uri || null,
        independent_evidence_reference: config.independent_evidence_reference || null,
        allow_projection_only: config.allow_projection_only,
      },
      scenario_projection: {
        effective_rps: effectiveRps,
        projected_capacity_users: projectedCapacityUsers,
      },
    },
    checks,
  };

  const canonicalBody = stableJson(reportCore);
  const canonicalSha256 = createHash('sha256').update(canonicalBody).digest('hex');
  const signature = signingKey
    ? createHmac('sha256', signingKey).update(canonicalBody).digest('hex')
    : '';

  const signedReport = {
    ...reportCore,
    signature: {
      algorithm: 'HMAC-SHA256',
      signer,
      signed_at_utc: new Date().toISOString(),
      canonical_sha256: canonicalSha256,
      signature: signature || null,
    },
  };

  pushCheck(
    signedReport.checks,
    'signed_report',
    signature ? STATUS.PASS : STATUS.FAIL,
    signature
      ? 'Signed report generated with HMAC-SHA256.'
      : 'Signing key missing. Set P0_11_REPORT_SIGNING_KEY or CRON_SECRET.',
    {
      signer,
      signed: Boolean(signature),
    },
  );

  const totals = summarizeChecks(signedReport.checks);
  signedReport.totals = totals;
  signedReport.overall_ready_for_p0_11 = totals.fail === 0;

  mkdirSync(dirname(reportOut), { recursive: true });
  writeFileSync(reportOut, `${JSON.stringify(signedReport, null, 2)}\n`, 'utf8');

  mkdirSync(dirname(summaryOut), { recursive: true });
  writeFileSync(summaryOut, `${buildMarkdownSummary(signedReport)}\n`, 'utf8');

  console.log(JSON.stringify(signedReport, null, 2));

  if (totals.fail > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[p0-11-load-resilience-certify] failed:', error?.message || error);
  process.exit(1);
});
