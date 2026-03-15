import { query } from './db.js';
import { safeTrim } from './http.js';
import { enqueueNotification } from './notifications.js';

const ACTIVE_JOB_STATUSES = ['QUEUED', 'RETRYING', 'SENT', 'DELIVERED', 'READ'];

function resolveLoginUrl(campaignCode) {
  const campaign = safeTrim(campaignCode).toLowerCase();
  if (campaign.includes('bursluluk')) {
    return safeTrim(process.env.EXAM_LOGIN_URL) || 'https://teachera.com.tr/bursluluk/giris';
  }
  return safeTrim(process.env.EXAM_LOGIN_URL) || 'https://teachera.com.tr/seviye-tespit-sinavi';
}

async function findExistingExamOpenSms(candidateId, attemptId) {
  const { rows } = await query(
    `
      SELECT id, status
      FROM notification_jobs
      WHERE candidate_id = $1
        AND attempt_id = $2
        AND template_code = 'EXAM_OPEN_SMS'
        AND status = ANY($3::notification_status[])
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [candidateId, attemptId, ACTIVE_JOB_STATUSES],
  );

  return rows[0] || null;
}

export async function enqueueExamOpenSmsIfNeeded({
  campaignCode,
  candidateId,
  attemptId,
  parentPhoneE164,
  applicationNo,
  trigger = 'exam_open',
}) {
  const recipient = safeTrim(parentPhoneE164);
  if (!candidateId || !attemptId || !recipient) {
    return {
      enqueued: false,
      reason: 'missing_fields',
    };
  }

  const existing = await findExistingExamOpenSms(candidateId, attemptId);
  if (existing) {
    return {
      enqueued: false,
      reason: 'already_exists',
      jobId: existing.id,
      status: existing.status,
    };
  }

  const payload = {
    applicationNo: safeTrim(applicationNo) || null,
    loginUrl: resolveLoginUrl(campaignCode),
    trigger: safeTrim(trigger) || 'exam_open',
  };

  const enqueued = await enqueueNotification({
    campaignCode,
    candidateId,
    attemptId,
    channel: 'SMS',
    templateCode: 'EXAM_OPEN_SMS',
    recipient,
    payload,
  });

  return {
    enqueued: true,
    jobId: enqueued.jobId,
  };
}
