import { requireRole } from '../../_lib/auth.js';
import { appendAuditLog, buildPanelActor, readRequestContext } from '../../_lib/auditLog.js';
import { ROLES } from '../../_lib/constants.js';
import { withTransaction } from '../../_lib/db.js';
import { HttpError } from '../../_lib/errors.js';
import { handleRequest, methodGuard, ok, parseBody, safeTrim } from '../../_lib/http.js';

function normalizeIds(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => safeTrim(item)).filter(Boolean).slice(0, 1000);
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    methodGuard(req, ['POST']);
    const identity = await requireRole(req, [ROLES.SUPER_ADMIN, ROLES.OPERATIONS]);

    const body = await parseBody(req);
    if (!body || typeof body !== 'object') {
      throw new HttpError(400, 'Request body must be valid JSON.', 'invalid_json');
    }

    const action = safeTrim(body.action).toLowerCase();
    const jobIds = normalizeIds(body.job_ids || body.jobIds);
    if (jobIds.length === 0) {
      throw new HttpError(400, 'jobIds is required.', 'missing_job_ids');
    }
    if (!['retry', 'cancel', 'requeue_dlq'].includes(action)) {
      throw new HttpError(400, 'Unsupported action.', 'invalid_action');
    }

    const updated = await withTransaction(async (client) => {
      if (action === 'cancel') {
        const { rowCount } = await client.query(
          `
            UPDATE notification_jobs
            SET
              status = 'CANCELLED',
              next_retry_at = NULL,
              updated_at = NOW()
            WHERE id = ANY($1::uuid[])
          `,
          [jobIds],
        );
        return rowCount;
      }

      if (action === 'retry') {
        const { rowCount } = await client.query(
          `
            UPDATE notification_jobs
            SET
              status = 'QUEUED',
              next_retry_at = NOW(),
              updated_at = NOW()
            WHERE id = ANY($1::uuid[])
          `,
          [jobIds],
        );
        return rowCount;
      }

      const { rowCount } = await client.query(
        `
          UPDATE notification_jobs
          SET
            status = 'QUEUED',
            next_retry_at = NOW(),
            updated_at = NOW()
          WHERE id = ANY($1::uuid[])
            AND status = 'DLQ'
        `,
        [jobIds],
      );

      await client.query(
        `
          UPDATE dlq_jobs
          SET
            status = 'REQUEUED',
            updated_at = NOW()
          WHERE source_job_id = ANY($1::uuid[])
            AND status <> 'CLOSED'
        `,
        [jobIds],
      );

      return rowCount;
    });

    ok(res, {
      action,
      requested: jobIds.length,
      updated,
    });

    const ctx = readRequestContext(req);
    await appendAuditLog({
      ...buildPanelActor(identity),
      action: `PANEL_NOTIFICATIONS_${action.toUpperCase()}`,
      targetType: 'NOTIFICATION_JOB_BATCH',
      targetId: String(jobIds.length),
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      metadata: {
        jobIds,
        updated,
      },
    });
  });
}
