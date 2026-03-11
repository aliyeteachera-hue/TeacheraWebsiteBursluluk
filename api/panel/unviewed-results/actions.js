import { requireRole } from '../../_lib/auth.js';
import { ROLES } from '../../_lib/constants.js';
import { query } from '../../_lib/db.js';
import { HttpError } from '../../_lib/errors.js';
import { handleRequest, methodGuard, ok, parseBody, safeTrim } from '../../_lib/http.js';
import { enqueueNotification } from '../../_lib/notifications.js';

function normalizeCandidateIds(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => safeTrim(item)).filter(Boolean).slice(0, 1000);
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    methodGuard(req, ['POST']);
    await requireRole(req, [ROLES.SUPER_ADMIN, ROLES.OPERATIONS]);

    const body = await parseBody(req);
    if (!body || typeof body !== 'object') {
      throw new HttpError(400, 'Request body must be valid JSON.', 'invalid_json');
    }

    const action = safeTrim(body.action).toLowerCase();
    if (!['send_whatsapp'].includes(action)) {
      throw new HttpError(400, 'Unsupported action.', 'invalid_action');
    }

    const candidateIds = normalizeCandidateIds(body.candidate_ids || body.candidateIds);
    if (candidateIds.length === 0) {
      throw new HttpError(400, 'candidateIds is required.', 'missing_candidate_ids');
    }

    const templateCode = safeTrim(body.template_code || body.templateCode || 'WA_RESULT');
    const { rows } = await query(
      `
        SELECT
          c.id AS candidate_id,
          c.campaign_code,
          g.phone_e164 AS parent_phone_e164,
          ea.id AS attempt_id,
          r.id AS result_id
        FROM candidates c
        LEFT JOIN guardians g ON g.id = c.guardian_id
        LEFT JOIN LATERAL (
          SELECT id
          FROM exam_attempts
          WHERE candidate_id = c.id
          ORDER BY created_at DESC
          LIMIT 1
        ) ea ON TRUE
        LEFT JOIN results r ON r.attempt_id = ea.id
        WHERE c.id = ANY($1::uuid[])
          AND r.published_at IS NOT NULL
          AND r.viewed_at IS NULL
      `,
      [candidateIds],
    );

    const jobs = rows
      .filter((row) => row.parent_phone_e164)
      .map((row) =>
        enqueueNotification({
          campaignCode: row.campaign_code,
          candidateId: row.candidate_id,
          attemptId: row.attempt_id,
          resultId: row.result_id,
          channel: 'WHATSAPP',
          templateCode,
          recipient: row.parent_phone_e164,
          payload: {
            trigger: 'panel_unviewed_results',
            templateCode,
          },
        }),
      );

    const created = await Promise.all(jobs);

    ok(res, {
      action,
      requested: candidateIds.length,
      enqueued: created.length,
      skipped: candidateIds.length - created.length,
      job_ids: created.map((item) => item.jobId),
    });
  });
}

