// AUTO-GENERATED FROM apps/*/api (legacy root runtime mirror). DO NOT EDIT DIRECTLY.
import { readDefaultCampaignCode } from '../_lib/env.js';
import { HttpError } from '../_lib/errors.js';
import { resolveExamGateStatus } from '../_lib/examGate.js';
import { enqueueExamOpenSmsIfNeeded } from '../_lib/examOpenSms.js';
import { clampInt, handleRequest, methodGuard, ok, parseBody, safeTrim } from '../_lib/http.js';
import { decryptPii } from '../_lib/piiCrypto.js';
import { query } from '../_lib/db.js';

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

    if (!campaignCode) {
      throw new HttpError(400, 'campaignCode is required.', 'missing_campaign_code');
    }

    const gate = await resolveExamGateStatus(campaignCode);
    if (!gate.exam_open) {
      ok(res, {
        campaign_code: campaignCode,
        exam_open: false,
        gate,
        scanned: 0,
        enqueued: 0,
        skipped_no_phone: 0,
        skipped_errors: 0,
      });
      return;
    }

    const { rows } = await query(
      `
        SELECT
          ea.id AS attempt_id,
          ea.candidate_id,
          ea.campaign_code,
          a.application_no,
          g.phone_e164 AS parent_phone_e164_legacy,
          g.phone_e164_enc AS parent_phone_e164_enc
        FROM exam_attempts ea
        JOIN applications a ON a.id = ea.application_id
        JOIN candidates c ON c.id = ea.candidate_id
        LEFT JOIN guardians g ON g.id = c.guardian_id
        WHERE ea.campaign_code = $1
          AND ea.status IN ('STARTED', 'OPEN')
          AND NOT EXISTS (
            SELECT 1
            FROM notification_jobs nj
            WHERE nj.attempt_id = ea.id
              AND nj.channel = 'SMS'
              AND nj.template_code = 'EXAM_OPEN_SMS'
              AND nj.status IN ('QUEUED', 'RETRYING', 'SENT', 'DELIVERED', 'READ')
          )
        ORDER BY ea.created_at ASC
        LIMIT $2
      `,
      [campaignCode, limit],
    );

    let enqueued = 0;
    let skippedNoPhone = 0;
    let skippedErrors = 0;
    const enqueuedJobIds = [];

    for (const row of rows) {
      const parentPhoneE164 = await decryptPii(row.parent_phone_e164_enc, row.parent_phone_e164_legacy);
      if (!parentPhoneE164) {
        skippedNoPhone += 1;
        continue;
      }

      try {
        const job = await enqueueExamOpenSmsIfNeeded({
          campaignCode: row.campaign_code,
          candidateId: row.candidate_id,
          attemptId: row.attempt_id,
          parentPhoneE164,
          applicationNo: row.application_no,
          trigger: 'ops_exam_open_broadcast',
        });
        if (job?.jobId) {
          enqueued += 1;
          enqueuedJobIds.push(job.jobId);
        }
      } catch (error) {
        skippedErrors += 1;
        console.error('[ops_exam_open_broadcast_enqueue_failed]', error);
      }
    }

    ok(res, {
      campaign_code: campaignCode,
      exam_open: true,
      gate,
      scanned: rows.length,
      enqueued,
      skipped_no_phone: skippedNoPhone,
      skipped_errors: skippedErrors,
      job_ids: enqueuedJobIds,
    });
  });
}
