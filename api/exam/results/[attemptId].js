import { getPanelIdentity } from '../../_lib/auth.js';
import { withTransaction } from '../../_lib/db.js';
import { HttpError } from '../../_lib/errors.js';
import { handleRequest, methodGuard, ok, safeTrim } from '../../_lib/http.js';
import { enforceRateLimit, getRequestIp } from '../../_lib/redisRateLimit.js';
import { requireExamSession } from '../../_lib/sessionAuth.js';

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    methodGuard(req, ['GET']);
    const attemptId = Array.isArray(req.query?.attemptId)
      ? safeTrim(req.query.attemptId[0])
      : safeTrim(req.query?.attemptId);
    if (!attemptId) {
      throw new HttpError(400, 'attemptId parameter is required.', 'missing_attempt_id');
    }

    const panelIdentity = await getPanelIdentity(req);
    const isPanelRequest = panelIdentity.authenticated;

    if (isPanelRequest) {
      await enforceRateLimit(req, res, {
        scope: 'exam_result_panel',
        identity: panelIdentity.keyId || getRequestIp(req),
        limitEnv: 'RL_EXAM_RESULT_PANEL_LIMIT',
        windowSecondsEnv: 'RL_EXAM_RESULT_PANEL_WINDOW_SECONDS',
        defaultLimit: 500,
        defaultWindowSeconds: 60,
        requireRedis: true,
        errorCode: 'exam_result_panel_rate_limited',
        errorMessage: 'Panel result requests are temporarily throttled.',
      });
    } else {
      await enforceRateLimit(req, res, {
        scope: 'exam_result_candidate_ip',
        identity: getRequestIp(req),
        limitEnv: 'RL_EXAM_RESULT_IP_LIMIT',
        windowSecondsEnv: 'RL_EXAM_RESULT_IP_WINDOW_SECONDS',
        defaultLimit: 90,
        defaultWindowSeconds: 60,
        requireRedis: true,
        errorCode: 'exam_result_rate_limited',
        errorMessage: 'Too many result requests. Please retry shortly.',
      });

      await requireExamSession(req, attemptId);

      await enforceRateLimit(req, res, {
        scope: 'exam_result_candidate_attempt',
        identity: attemptId,
        limitEnv: 'RL_EXAM_RESULT_ATTEMPT_LIMIT',
        windowSecondsEnv: 'RL_EXAM_RESULT_ATTEMPT_WINDOW_SECONDS',
        defaultLimit: 30,
        defaultWindowSeconds: 60,
        requireRedis: true,
        errorCode: 'exam_result_attempt_rate_limited',
        errorMessage: 'Result view rate exceeded for this attempt. Please retry shortly.',
      });
    }

    const payload = await withTransaction(async (client) => {
      const resultLookup = await client.query(
        `
          SELECT
            r.id AS result_id,
            r.status,
            r.score,
            r.percentage,
            r.correct_count,
            r.wrong_count,
            r.unanswered_count,
            r.placement_label,
            r.cefr_band,
            r.published_at,
            r.viewed_at,
            ea.id AS attempt_id,
            ea.status AS exam_status,
            ea.exam_language,
            ea.exam_age_range,
            ea.question_count,
            ea.started_at,
            ea.submitted_at,
            c.id AS candidate_id,
            c.full_name AS student_full_name,
            c.grade,
            s.name AS school_name,
            g.full_name AS parent_full_name,
            g.phone_e164 AS parent_phone_e164
          FROM results r
          JOIN exam_attempts ea ON ea.id = r.attempt_id
          JOIN candidates c ON c.id = r.candidate_id
          LEFT JOIN schools s ON s.id = c.school_id
          LEFT JOIN guardians g ON g.id = c.guardian_id
          WHERE r.attempt_id = $1
          LIMIT 1
        `,
        [attemptId],
      );

      if (resultLookup.rowCount === 0) {
        throw new HttpError(404, 'Result was not found.', 'result_not_found');
      }

      const row = resultLookup.rows[0];
      if (!isPanelRequest && !row.viewed_at) {
        await client.query(
          `
            UPDATE results
            SET status = 'VIEWED', viewed_at = NOW(), updated_at = NOW()
            WHERE attempt_id = $1
          `,
          [attemptId],
        );

        await client.query(
          `
            INSERT INTO activity_events (candidate_id, attempt_id, event_type, event_payload)
            VALUES ($1, $2, 'RESULT_VIEWED', $3::jsonb)
          `,
          [
            row.candidate_id,
            row.attempt_id,
            JSON.stringify({
              viewedVia: isPanelRequest ? 'panel' : 'candidate',
            }),
          ],
        );

        row.status = 'VIEWED';
        row.viewed_at = new Date().toISOString();
      }

      return row;
    });

    ok(res, {
      result: {
        result_id: payload.result_id,
        attempt_id: payload.attempt_id,
        candidate_id: payload.candidate_id,
        student_full_name: payload.student_full_name,
        parent_full_name: payload.parent_full_name,
        parent_phone_e164: payload.parent_phone_e164,
        school_name: payload.school_name,
        grade: payload.grade,
        exam_status: payload.exam_status,
        exam_language: payload.exam_language,
        exam_age_range: payload.exam_age_range,
        question_count: payload.question_count,
        score: Number(payload.score ?? 0),
        percentage: Number(payload.percentage ?? 0),
        correct_count: payload.correct_count,
        wrong_count: payload.wrong_count,
        unanswered_count: payload.unanswered_count,
        placement_label: payload.placement_label,
        cefr_band: payload.cefr_band,
        status: payload.status,
        started_at: payload.started_at,
        submitted_at: payload.submitted_at,
        published_at: payload.published_at,
        viewed_at: payload.viewed_at,
      },
    });
  });
}
