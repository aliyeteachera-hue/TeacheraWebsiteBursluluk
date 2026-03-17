import { readDefaultCampaignCode } from '../../_lib/env.js';
import { HttpError } from '../../_lib/errors.js';
import { clampInt, handleRequest, methodGuard, ok, parseBody, safeTrim } from '../../_lib/http.js';
import { enqueueNotification } from '../../_lib/notifications.js';
import { decryptPii } from '../../_lib/piiCrypto.js';
import { query } from '../../_lib/db.js';

function extractBearer(req) {
  const header = safeTrim(req.headers?.authorization);
  if (!header || !header.toLowerCase().startsWith('bearer ')) return '';
  return header.slice(7).trim();
}

function assertOpsSecret(req) {
  const expected = safeTrim(process.env.CRON_SECRET || process.env.NOTIFICATION_WORKER_SECRET);
  if (!expected) return;

  const provided = safeTrim(
    req.headers?.['x-worker-secret']
      || req.headers?.['x-ops-secret']
      || req.query?.worker_secret
      || extractBearer(req),
  );

  if (!provided || provided !== expected) {
    throw new HttpError(401, 'Ops secret is invalid.', 'invalid_ops_secret');
  }
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    methodGuard(req, ['GET', 'POST']);
    assertOpsSecret(req);

    const body = req.method === 'POST' ? await parseBody(req) : null;
    const campaignCode = safeTrim(
      body?.campaign_code
        || body?.campaignCode
        || req.query?.campaign_code
        || readDefaultCampaignCode(),
    ).slice(0, 120);
    const limit = clampInt(body?.limit ?? req.query?.limit ?? 250, 1, 2000);
    const delayMinutes = clampInt(
      body?.delay_minutes
        ?? body?.delayMinutes
        ?? req.query?.delay_minutes
        ?? process.env.UNVIEWED_RESULTS_WA_DELAY_MINUTES
        ?? 30,
      0,
      24 * 60,
    );

    if (!campaignCode) {
      throw new HttpError(400, 'campaignCode is required.', 'missing_campaign_code');
    }

    const { rows } = await query(
      `
        SELECT
          c.id AS candidate_id,
          ea.id AS attempt_id,
          ea.campaign_code,
          r.id AS result_id,
          r.score,
          r.percentage,
          r.placement_label,
          g.phone_e164 AS parent_phone_e164_legacy,
          g.phone_e164_enc AS parent_phone_e164_enc
        FROM results r
        JOIN exam_attempts ea ON ea.id = r.attempt_id
        JOIN candidates c ON c.id = ea.candidate_id
        LEFT JOIN guardians g ON g.id = c.guardian_id
        WHERE ea.campaign_code = $1
          AND r.published_at IS NOT NULL
          AND r.viewed_at IS NULL
          AND r.published_at <= NOW() - make_interval(mins => $2::int)
          AND NOT EXISTS (
            SELECT 1
            FROM notification_jobs nj
            WHERE nj.result_id = r.id
              AND nj.channel = 'WHATSAPP'
              AND nj.template_code = 'WA_RESULT'
              AND nj.status IN ('QUEUED', 'RETRYING', 'SENT', 'DELIVERED', 'READ')
          )
        ORDER BY r.published_at ASC
        LIMIT $3
      `,
      [campaignCode, delayMinutes, limit],
    );

    let enqueued = 0;
    let skippedNoPhone = 0;
    const jobIds = [];

    for (const row of rows) {
      const parentPhoneE164 = await decryptPii(row.parent_phone_e164_enc, row.parent_phone_e164_legacy);
      if (!parentPhoneE164) {
        skippedNoPhone += 1;
        continue;
      }

      const created = await enqueueNotification({
        campaignCode: row.campaign_code,
        candidateId: row.candidate_id,
        attemptId: row.attempt_id,
        resultId: row.result_id,
        channel: 'WHATSAPP',
        templateCode: 'WA_RESULT',
        recipient: parentPhoneE164,
        payload: {
          trigger: 'ops_unviewed_results_auto_whatsapp',
          score: Number(row.score || 0),
          percentage: Number(row.percentage || 0),
          placementLabel: row.placement_label || null,
        },
      });

      if (created?.jobId) {
        enqueued += 1;
        jobIds.push(created.jobId);
      }
    }

    ok(res, {
      campaign_code: campaignCode,
      delay_minutes: delayMinutes,
      scanned: rows.length,
      enqueued,
      skipped_no_phone: skippedNoPhone,
      job_ids: jobIds,
    });
  });
}
