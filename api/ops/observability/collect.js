// AUTO-GENERATED FROM apps/*/api (legacy root runtime mirror). DO NOT EDIT DIRECTLY.
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import { query } from '../../_lib/db.js';
import { HttpError } from '../../_lib/errors.js';
import { clampInt, handleRequest, methodGuard, ok, parseBody, safeTrim } from '../../_lib/http.js';
import { isRedisConfigured, isRedisUnavailableError, runRedisCommand } from '../../_lib/redis.js';

const COLLECTOR_VERSION = 'p0-10-2026-03-12';

function extractBearer(req) {
  const header = safeTrim(req.headers?.authorization);
  if (!header) return '';
  if (!header.toLowerCase().startsWith('bearer ')) return '';
  return header.slice(7).trim();
}

function assertCollectorSecret(req) {
  const expected = safeTrim(
    process.env.OBSERVABILITY_COLLECTOR_SECRET
    || process.env.CRON_SECRET
    || process.env.NOTIFICATION_WORKER_SECRET,
  );
  if (!expected) return;

  const provided = safeTrim(
    req.headers?.['x-observability-secret']
    || req.headers?.['x-worker-secret']
    || req.query?.collector_secret
    || extractBearer(req),
  );

  if (!provided || provided !== expected) {
    throw new HttpError(401, 'Collector secret is invalid.', 'invalid_collector_secret');
  }
}

function readRegion() {
  return safeTrim(process.env.OBSERVABILITY_AWS_REGION || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION);
}

function readNamespace() {
  return safeTrim(process.env.OBSERVABILITY_CLOUDWATCH_NAMESPACE || 'Teachera/ExamPlatform');
}

function readBaseUrl(value, fallback) {
  const raw = safeTrim(value || fallback);
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, '');
  return `https://${raw.replace(/\/$/, '')}`;
}

function percentile(values, p) {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = (p / 100) * (sorted.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  const weight = rank - low;
  if (high <= low) return sorted[low];
  return sorted[low] * (1 - weight) + sorted[high] * weight;
}

function finiteNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeRate(successCount, totalCount) {
  const safeTotal = finiteNumber(totalCount, 0);
  const safeSuccess = finiteNumber(successCount, 0);
  if (safeTotal <= 0) return 100;
  return Math.max(0, Math.min(100, (safeSuccess / safeTotal) * 100));
}

async function probeEndpoint(endpoint, sampleSize, timeoutMs) {
  const durations = [];
  let failures = 0;
  const expectedStatuses = new Set(endpoint.expectedStatuses);

  for (let i = 0; i < sampleSize; i += 1) {
    const startedAt = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const durationMs = Date.now() - startedAt;
      durations.push(Math.max(1, durationMs));
      if (!expectedStatuses.has(response.status)) {
        failures += 1;
      }
    } catch {
      const durationMs = Date.now() - startedAt;
      durations.push(Math.max(1, durationMs));
      failures += 1;
    }
  }

  const p95Ms = percentile(durations, 95);
  const p99Ms = percentile(durations, 99);
  const errorRatePct = sampleSize > 0 ? (failures / sampleSize) * 100 : 0;

  return {
    endpointKey: endpoint.key,
    endpointUrl: endpoint.url,
    samples: sampleSize,
    failures,
    successes: Math.max(0, sampleSize - failures),
    p95Ms: finiteNumber(p95Ms, 0),
    p99Ms: finiteNumber(p99Ms, 0),
    errorRatePct: finiteNumber(errorRatePct, 0),
  };
}

async function collectDbAndWorkerMetrics() {
  const queueStats = await query(
    `
      SELECT
        COUNT(*) FILTER (
          WHERE status IN ('QUEUED', 'RETRYING')
            AND (next_retry_at IS NULL OR next_retry_at <= NOW())
        )::int AS queue_depth,
        COALESCE(
          MAX(EXTRACT(EPOCH FROM (NOW() - enqueued_at))) FILTER (
            WHERE status IN ('QUEUED', 'RETRYING')
              AND (next_retry_at IS NULL OR next_retry_at <= NOW())
          ),
          0
        )::numeric AS queue_lag_seconds
      FROM notification_jobs
    `,
  );

  const workerStats = await query(
    `
      SELECT
        COUNT(*) FILTER (
          WHERE event_type IN ('FAILED', 'DLQ')
            AND created_at >= NOW() - INTERVAL '15 minutes'
        )::int AS failed_events_15m,
        COUNT(*) FILTER (
          WHERE event_type IN ('SENT', 'FAILED', 'DLQ')
            AND created_at >= NOW() - INTERVAL '15 minutes'
        )::int AS total_events_15m
      FROM notification_events
    `,
  );

  const channelStats = await query(
    `
      SELECT
        channel,
        COUNT(*) FILTER (
          WHERE status IN ('DELIVERED', 'READ')
            AND created_at >= NOW() - INTERVAL '60 minutes'
        )::int AS success_count_60m,
        COUNT(*) FILTER (
          WHERE status IN ('SENT', 'DELIVERED', 'READ', 'FAILED', 'DLQ')
            AND created_at >= NOW() - INTERVAL '60 minutes'
        )::int AS total_count_60m
      FROM notification_jobs
      WHERE channel IN ('SMS', 'WHATSAPP')
      GROUP BY channel
    `,
  );

  const queueRow = queueStats.rows[0] || {};
  const workerRow = workerStats.rows[0] || {};
  const channelMap = new Map(channelStats.rows.map((row) => [safeTrim(row.channel).toUpperCase(), row]));

  const smsRow = channelMap.get('SMS') || { success_count_60m: 0, total_count_60m: 0 };
  const waRow = channelMap.get('WHATSAPP') || { success_count_60m: 0, total_count_60m: 0 };

  const workerFailedEvents15m = finiteNumber(workerRow.failed_events_15m, 0);
  const workerTotalEvents15m = finiteNumber(workerRow.total_events_15m, 0);
  const workerFailRatePct15m = workerTotalEvents15m > 0
    ? (workerFailedEvents15m / workerTotalEvents15m) * 100
    : 0;

  return {
    queueDepth: finiteNumber(queueRow.queue_depth, 0),
    queueLagSeconds: finiteNumber(queueRow.queue_lag_seconds, 0),
    workerFailedEvents15m,
    workerTotalEvents15m,
    workerFailRatePct15m: Math.max(0, Math.min(100, workerFailRatePct15m)),
    smsSuccessRatePct60m: normalizeRate(smsRow.success_count_60m, smsRow.total_count_60m),
    waSuccessRatePct60m: normalizeRate(waRow.success_count_60m, waRow.total_count_60m),
  };
}

async function collectRedisHealth() {
  if (!isRedisConfigured()) {
    return {
      redisHealth: 0,
      redisState: 'not_configured',
      redisErrorCode: 'redis_not_configured',
    };
  }

  try {
    await runRedisCommand((redisClient) => redisClient.ping());
    return {
      redisHealth: 1,
      redisState: 'up',
      redisErrorCode: null,
    };
  } catch (error) {
    if (isRedisUnavailableError(error)) {
      return {
        redisHealth: 0,
        redisState: 'down',
        redisErrorCode: safeTrim(error?.code || 'redis_unavailable') || 'redis_unavailable',
      };
    }
    throw error;
  }
}

function buildMetricData(latencyRows, dbMetrics, redisMetrics, timestamp) {
  const metrics = [];

  for (const row of latencyRows) {
    metrics.push(
      {
        MetricName: 'ApiLatencyP95Ms',
        Unit: 'Milliseconds',
        Value: finiteNumber(row.p95Ms, 0),
        Timestamp: timestamp,
        Dimensions: [{ Name: 'Endpoint', Value: row.endpointKey }],
      },
      {
        MetricName: 'ApiLatencyP99Ms',
        Unit: 'Milliseconds',
        Value: finiteNumber(row.p99Ms, 0),
        Timestamp: timestamp,
        Dimensions: [{ Name: 'Endpoint', Value: row.endpointKey }],
      },
      {
        MetricName: 'ApiErrorRatePct',
        Unit: 'Percent',
        Value: finiteNumber(row.errorRatePct, 0),
        Timestamp: timestamp,
        Dimensions: [{ Name: 'Endpoint', Value: row.endpointKey }],
      },
    );
  }

  metrics.push(
    {
      MetricName: 'QueueDepth',
      Unit: 'Count',
      Value: finiteNumber(dbMetrics.queueDepth, 0),
      Timestamp: timestamp,
    },
    {
      MetricName: 'QueueLagSeconds',
      Unit: 'Seconds',
      Value: finiteNumber(dbMetrics.queueLagSeconds, 0),
      Timestamp: timestamp,
    },
    {
      MetricName: 'WorkerFailRatePct15m',
      Unit: 'Percent',
      Value: finiteNumber(dbMetrics.workerFailRatePct15m, 0),
      Timestamp: timestamp,
    },
    {
      MetricName: 'DbHealth',
      Unit: 'Count',
      Value: 1,
      Timestamp: timestamp,
    },
    {
      MetricName: 'RedisHealth',
      Unit: 'Count',
      Value: finiteNumber(redisMetrics.redisHealth, 0),
      Timestamp: timestamp,
    },
    {
      MetricName: 'NotificationSuccessRatePct60m',
      Unit: 'Percent',
      Value: finiteNumber(dbMetrics.smsSuccessRatePct60m, 0),
      Timestamp: timestamp,
      Dimensions: [{ Name: 'Channel', Value: 'SMS' }],
    },
    {
      MetricName: 'NotificationSuccessRatePct60m',
      Unit: 'Percent',
      Value: finiteNumber(dbMetrics.waSuccessRatePct60m, 0),
      Timestamp: timestamp,
      Dimensions: [{ Name: 'Channel', Value: 'WHATSAPP' }],
    },
  );

  return metrics;
}

async function publishMetrics({ namespace, region, metricData }) {
  const client = new CloudWatchClient({ region });

  for (let i = 0; i < metricData.length; i += 20) {
    const chunk = metricData.slice(i, i + 20);
    await client.send(
      new PutMetricDataCommand({
        Namespace: namespace,
        MetricData: chunk,
      }),
    );
  }
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    methodGuard(req, ['GET', 'POST']);
    assertCollectorSecret(req);

    const body = req.method === 'POST' ? (await parseBody(req)) || {} : {};
    const sampleSize = clampInt(body.sample_size ?? req.query?.sample_size, 3, 25, 7);
    const timeoutMs = clampInt(body.timeout_ms ?? req.query?.timeout_ms, 1000, 10000, 5000);

    const wwwBase = readBaseUrl(process.env.WWW_BASE_URL || process.env.VITE_SITE_URL, 'https://teachera.com.tr');
    const examBase = readBaseUrl(process.env.EXAM_API_BASE_URL, 'https://exam-api.teachera.com.tr');
    const panelBase = readBaseUrl(process.env.PANEL_API_BASE_URL, 'https://panel-api.teachera.com.tr');
    const opsBase = readBaseUrl(process.env.OPS_API_BASE_URL, 'https://ops-api.teachera.com.tr');

    const endpoints = [
      {
        key: 'exam_api',
        url: `${examBase}/api/health`,
        expectedStatuses: [200],
      },
      {
        key: 'panel_api',
        url: `${panelBase}/api/panel/auth/me`,
        expectedStatuses: [200, 401, 403],
      },
      {
        key: 'ops_api',
        url: `${opsBase}/api/health`,
        expectedStatuses: [200],
      },
      {
        key: 'www_root',
        url: `${wwwBase}/`,
        expectedStatuses: [200, 301, 302, 308],
      },
    ];

    const dbMetrics = await collectDbAndWorkerMetrics();
    const redisMetrics = await collectRedisHealth();
    const latencyRows = [];

    for (const endpoint of endpoints) {
      // Sequential probing keeps load predictable and makes p95/p99 stable for alarms.
      const row = await probeEndpoint(endpoint, sampleSize, timeoutMs);
      latencyRows.push(row);
    }

    const region = readRegion();
    if (!region) {
      throw new HttpError(500, 'AWS region missing for observability collector.', 'missing_aws_region');
    }

    const namespace = readNamespace();
    const timestamp = new Date();
    const metricData = buildMetricData(latencyRows, dbMetrics, redisMetrics, timestamp);

    await publishMetrics({
      namespace,
      region,
      metricData,
    });

    ok(res, {
      collector_version: COLLECTOR_VERSION,
      namespace,
      region,
      sample_size: sampleSize,
      timeout_ms: timeoutMs,
      latency: latencyRows,
      db_metrics: dbMetrics,
      redis: redisMetrics,
      published_metric_count: metricData.length,
      observed_at: timestamp.toISOString(),
    });
  });
}
