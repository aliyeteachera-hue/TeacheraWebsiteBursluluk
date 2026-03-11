import { query, withTransaction } from './db.js';
import { safeTrim } from './http.js';
import {
  markNotificationDelivered,
  markNotificationFailed,
  markNotificationRead,
  markNotificationSent,
  updateNotificationEvent,
} from './notifications.js';

const RECONCILE_BACKOFF_SECONDS = [60, 5 * 60, 15 * 60, 60 * 60, 6 * 60 * 60];

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(safeTrim(value));
}

function readMaxReconcileAttempts() {
  const parsed = Number.parseInt(safeTrim(process.env.NOTIFICATION_WEBHOOK_RECONCILE_MAX_ATTEMPTS || '6'), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 6;
  return Math.min(parsed, 30);
}

function toObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function normalizeErrorCode(value) {
  return safeTrim(value).slice(0, 120) || null;
}

function computeNextRetryAt(attemptCount) {
  const delay = RECONCILE_BACKOFF_SECONDS[Math.min(Math.max(0, attemptCount - 1), RECONCILE_BACKOFF_SECONDS.length - 1)];
  return new Date(Date.now() + delay * 1000).toISOString();
}

export function normalizeNotificationEventStatus(raw) {
  const value = safeTrim(raw).toUpperCase();
  if (!value) return 'UNKNOWN';

  if (value === 'ERROR') return 'FAILED';
  if (value === 'UNDELIVERED' || value === 'BOUNCED') return 'FAILED';
  if (value === 'DELIVERY' || value === 'DELIVERY_SUCCESS') return 'DELIVERED';
  if (value === 'MESSAGE_DELIVERED') return 'DELIVERED';
  if (value === 'MESSAGE_READ' || value === 'READ_RECEIPT') return 'READ';
  if (value === 'ACCEPTED' || value === 'QUEUED') return 'SENT';

  return value;
}

export function extractWebhookReferences(payload = {}) {
  const root = toObject(payload);
  const data = toObject(root.data);
  const eventPayload = toObject(root.event_payload || root.eventPayload || data.event_payload || data.eventPayload);

  const jobIdCandidate = safeTrim(
    root.job_id
      || root.jobId
      || data.job_id
      || data.jobId
      || eventPayload.job_id
      || eventPayload.jobId,
  );

  const providerMessageId = safeTrim(
    root.provider_message_id
      || root.providerMessageId
      || root.message_id
      || root.messageId
      || data.provider_message_id
      || data.providerMessageId
      || data.message_id
      || data.messageId,
  );

  const clientReferenceId = safeTrim(
    root.client_reference_id
      || root.clientReferenceId
      || root.client_reference
      || root.clientReference
      || root.reference
      || data.client_reference_id
      || data.clientReferenceId
      || data.client_reference
      || data.clientReference
      || data.reference
      || eventPayload.client_reference_id
      || eventPayload.clientReferenceId
      || eventPayload.reference,
  );

  return {
    jobId: isUuid(jobIdCandidate) ? jobIdCandidate : null,
    providerMessageId: providerMessageId || null,
    clientReferenceId: clientReferenceId || null,
  };
}

export function pickWebhookErrorCode(payload = {}) {
  const root = toObject(payload);
  const data = toObject(root.data);
  return normalizeErrorCode(
    root.error_code
      || root.errorCode
      || data.error_code
      || data.errorCode
      || root.reason
      || data.reason,
  );
}

export async function resolveNotificationJobId({ jobId, providerMessageId, clientReferenceId }) {
  if (jobId && isUuid(jobId)) {
    const direct = await query(
      'SELECT id FROM notification_jobs WHERE id = $1 LIMIT 1',
      [jobId],
    );
    if (direct.rowCount > 0) return direct.rows[0].id;
  }

  if (providerMessageId) {
    const byProviderMessage = await query(
      `
        SELECT id
        FROM notification_jobs
        WHERE provider_message_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [providerMessageId],
    );
    if (byProviderMessage.rowCount > 0) return byProviderMessage.rows[0].id;
  }

  if (clientReferenceId && isUuid(clientReferenceId)) {
    const byReference = await query(
      'SELECT id FROM notification_jobs WHERE id = $1 LIMIT 1',
      [clientReferenceId],
    );
    if (byReference.rowCount > 0) return byReference.rows[0].id;
  }

  return null;
}

async function moveToDlqIfNeeded(jobId, currentState = null) {
  let job = currentState;
  if (!job) {
    const state = await query(
      `
        SELECT id, channel, campaign_code, candidate_id, status, retry_count, last_error_code
        FROM notification_jobs
        WHERE id = $1
        LIMIT 1
      `,
      [jobId],
    );
    job = state.rows[0];
  }

  if (!job || job.status !== 'DLQ') return;

  await query(
    `
      INSERT INTO dlq_jobs (
        source_job_id,
        channel,
        campaign_code,
        candidate_id,
        error_code,
        retry_count,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'OPEN')
      ON CONFLICT DO NOTHING
    `,
    [
      job.id,
      job.channel,
      job.campaign_code,
      job.candidate_id,
      job.last_error_code || 'provider_failed',
      job.retry_count,
    ],
  );
}

export async function applyWebhookEventToJob({
  jobId,
  status,
  providerMessageId = null,
  errorCode = null,
  eventPayload = {},
}) {
  const normalizedStatus = normalizeNotificationEventStatus(status);
  const normalizedErrorCode = normalizeErrorCode(errorCode);

  if (providerMessageId) {
    await query(
      `
        UPDATE notification_jobs
        SET provider_message_id = COALESCE(provider_message_id, $2), updated_at = NOW()
        WHERE id = $1
      `,
      [jobId, providerMessageId],
    );
  }

  let failedState = null;
  if (normalizedStatus === 'SENT') {
    await markNotificationSent(jobId, providerMessageId || null);
  } else if (normalizedStatus === 'DELIVERED') {
    await markNotificationDelivered(jobId);
  } else if (normalizedStatus === 'READ') {
    await markNotificationRead(jobId);
  } else if (normalizedStatus === 'FAILED') {
    failedState = await markNotificationFailed(jobId, normalizedErrorCode || 'provider_failed');
    if (failedState?.status === 'RETRYING') {
      await updateNotificationEvent({
        jobId,
        providerMessageId: providerMessageId || null,
        eventType: 'RETRYING',
        errorCode: normalizedErrorCode,
        eventPayload: {
          ...toObject(eventPayload),
          retry_count: failedState.retry_count,
          next_retry_at: failedState.next_retry_at,
          effective_retry_limit: failedState.effective_retry_limit,
        },
      });
    } else if (failedState?.status === 'DLQ') {
      await updateNotificationEvent({
        jobId,
        providerMessageId: providerMessageId || null,
        eventType: 'DLQ',
        errorCode: normalizedErrorCode,
        eventPayload: {
          ...toObject(eventPayload),
          retry_count: failedState.retry_count,
          effective_retry_limit: failedState.effective_retry_limit,
        },
      });
      await moveToDlqIfNeeded(jobId);
    }
  }

  await updateNotificationEvent({
    jobId,
    providerMessageId: providerMessageId || null,
    eventType: normalizedStatus,
    errorCode: normalizedErrorCode,
    eventPayload: toObject(eventPayload),
  });

  return {
    status: normalizedStatus,
    failedStateStatus: failedState?.status || null,
    retryCount: failedState?.retry_count ?? null,
  };
}

export async function queueWebhookInbox({
  payload,
  headers,
  status,
  errorCode = null,
  references,
  signatureValid = false,
}) {
  const { rows } = await query(
    `
      INSERT INTO notification_webhook_inbox (
        provider_name,
        job_id,
        provider_message_id,
        client_reference_id,
        event_status,
        error_code,
        payload,
        headers,
        signature_valid,
        reconciliation_status,
        next_attempt_at
      )
      VALUES (
        $1,
        $2::uuid,
        $3,
        $4,
        $5,
        $6,
        $7::jsonb,
        $8::jsonb,
        $9,
        'PENDING',
        NOW()
      )
      RETURNING id
    `,
    [
      safeTrim(headers?.provider_name || headers?.['x-provider-name'] || 'generic'),
      references?.jobId || null,
      references?.providerMessageId || null,
      references?.clientReferenceId || null,
      normalizeNotificationEventStatus(status),
      normalizeErrorCode(errorCode),
      JSON.stringify(toObject(payload)),
      JSON.stringify(toObject(headers)),
      Boolean(signatureValid),
    ],
  );

  return rows[0]?.id || null;
}

function parseInboxPayload(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  return {};
}

export async function reconcileWebhookInbox({ limit = 50 } = {}) {
  const boundedLimit = Math.max(0, Math.min(500, Number.parseInt(String(limit || 0), 10) || 0));
  if (boundedLimit <= 0) {
    return {
      fetched: 0,
      applied: 0,
      pending: 0,
      dropped: 0,
      failed: 0,
    };
  }

  const maxAttempts = readMaxReconcileAttempts();
  const result = {
    fetched: 0,
    applied: 0,
    pending: 0,
    dropped: 0,
    failed: 0,
  };

  await withTransaction(async (client) => {
    const picked = await client.query(
      `
        SELECT
          id,
          job_id,
          provider_message_id,
          client_reference_id,
          event_status,
          error_code,
          payload,
          reconcile_attempt_count
        FROM notification_webhook_inbox
        WHERE reconciliation_status = 'PENDING'
          AND next_attempt_at <= NOW()
        ORDER BY received_at ASC
        LIMIT $1
        FOR UPDATE SKIP LOCKED
      `,
      [boundedLimit],
    );

    result.fetched = picked.rowCount;
    for (const row of picked.rows) {
      const attemptCount = Number(row.reconcile_attempt_count || 0) + 1;
      const payload = parseInboxPayload(row.payload);
      const eventPayload = payload.event_payload || payload.eventPayload || {};

      try {
        const resolvedJobId = await resolveNotificationJobId({
          jobId: row.job_id,
          providerMessageId: row.provider_message_id,
          clientReferenceId: row.client_reference_id,
        });

        if (!resolvedJobId) {
          if (attemptCount >= maxAttempts) {
            await client.query(
              `
                UPDATE notification_webhook_inbox
                SET
                  reconciliation_status = 'DROPPED',
                  reconcile_attempt_count = $2,
                  last_error = 'job_not_found',
                  updated_at = NOW()
                WHERE id = $1
              `,
              [row.id, attemptCount],
            );
            result.dropped += 1;
          } else {
            await client.query(
              `
                UPDATE notification_webhook_inbox
                SET
                  reconcile_attempt_count = $2,
                  next_attempt_at = $3::timestamptz,
                  last_error = 'job_not_found',
                  updated_at = NOW()
                WHERE id = $1
              `,
              [row.id, attemptCount, computeNextRetryAt(attemptCount)],
            );
            result.pending += 1;
          }
          continue;
        }

        await applyWebhookEventToJob({
          jobId: resolvedJobId,
          status: row.event_status,
          providerMessageId: row.provider_message_id,
          errorCode: row.error_code,
          eventPayload: {
            ...toObject(eventPayload),
            reconciled_from_webhook_inbox_id: row.id,
          },
        });

        await client.query(
          `
            UPDATE notification_webhook_inbox
            SET
              reconciliation_status = 'APPLIED',
              reconcile_attempt_count = $2,
              resolved_job_id = $3::uuid,
              resolved_at = NOW(),
              last_error = NULL,
              updated_at = NOW()
            WHERE id = $1
          `,
          [row.id, attemptCount, resolvedJobId],
        );
        result.applied += 1;
      } catch (error) {
        const message = safeTrim(error instanceof Error ? error.message : String(error)).slice(0, 400) || 'reconcile_failed';

        if (attemptCount >= maxAttempts) {
          await client.query(
            `
              UPDATE notification_webhook_inbox
              SET
                reconciliation_status = 'DROPPED',
                reconcile_attempt_count = $2,
                last_error = $3,
                updated_at = NOW()
              WHERE id = $1
            `,
            [row.id, attemptCount, message],
          );
          result.dropped += 1;
        } else {
          await client.query(
            `
              UPDATE notification_webhook_inbox
              SET
                reconcile_attempt_count = $2,
                next_attempt_at = $3::timestamptz,
                last_error = $4,
                updated_at = NOW()
              WHERE id = $1
            `,
            [row.id, attemptCount, computeNextRetryAt(attemptCount), message],
          );
          result.failed += 1;
        }
      }
    }
  });

  return result;
}
