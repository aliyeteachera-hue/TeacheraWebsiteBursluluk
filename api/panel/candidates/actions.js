import { requireRole } from '../../_lib/auth.js';
import { ROLES } from '../../_lib/constants.js';
import { query, withTransaction } from '../../_lib/db.js';
import { HttpError } from '../../_lib/errors.js';
import { handleRequest, methodGuard, ok, parseBody, safeTrim } from '../../_lib/http.js';
import { enqueueNotification } from '../../_lib/notifications.js';

function normalizeCandidateIds(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => safeTrim(item)).filter(Boolean).slice(0, 1000);
}

async function getCandidatesByIds(candidateIds) {
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
    `,
    [candidateIds],
  );
  return rows;
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    await requireRole(req, [ROLES.SUPER_ADMIN, ROLES.OPERATIONS]);
    methodGuard(req, ['POST']);

    const body = await parseBody(req);
    if (!body || typeof body !== 'object') {
      throw new HttpError(400, 'Request body must be valid JSON.', 'invalid_json');
    }

    const action = safeTrim(body.action).toLowerCase();
    const candidateIds = normalizeCandidateIds(body.candidate_ids || body.candidateIds);
    if (candidateIds.length === 0) {
      throw new HttpError(400, 'candidateIds is required.', 'missing_candidate_ids');
    }

    if (!['sms_retry', 'wa_send', 'add_note'].includes(action)) {
      throw new HttpError(400, 'Unsupported action.', 'invalid_action');
    }

    const candidates = await getCandidatesByIds(candidateIds);
    if (candidates.length === 0) {
      throw new HttpError(404, 'No matching candidates found.', 'candidates_not_found');
    }

    if (action === 'add_note') {
      const note = safeTrim(body.note).slice(0, 2000);
      if (!note) {
        throw new HttpError(400, 'note is required for add_note action.', 'missing_note');
      }

      await withTransaction(async (client) => {
        for (const candidate of candidates) {
          await client.query(
            `
              INSERT INTO activity_events (candidate_id, attempt_id, event_type, event_payload)
              VALUES ($1, $2, 'OPERATOR_NOTE', $3::jsonb)
            `,
            [
              candidate.candidate_id,
              candidate.attempt_id,
              JSON.stringify({
                note,
                createdAt: new Date().toISOString(),
              }),
            ],
          );
        }
      });

      ok(res, {
        action,
        processed: candidates.length,
      });
      return;
    }

    const jobs = [];
    for (const candidate of candidates) {
      if (!candidate.parent_phone_e164) continue;
      jobs.push(
        enqueueNotification({
          campaignCode: candidate.campaign_code,
          candidateId: candidate.candidate_id,
          attemptId: candidate.attempt_id,
          resultId: candidate.result_id,
          channel: action === 'sms_retry' ? 'SMS' : 'WHATSAPP',
          templateCode: action === 'sms_retry' ? 'CREDENTIALS_SMS' : 'WA_RESULT',
          recipient: candidate.parent_phone_e164,
          payload: {
            trigger: 'manual_panel_action',
            action,
          },
        }),
      );
    }

    const enqueued = await Promise.all(jobs);

    ok(res, {
      action,
      requested: candidateIds.length,
      enqueued: enqueued.length,
      skipped: candidateIds.length - enqueued.length,
      job_ids: enqueued.map((item) => item.jobId),
    });
  });
}

