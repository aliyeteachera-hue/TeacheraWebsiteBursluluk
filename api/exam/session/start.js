import { withTransaction } from '../../_lib/db.js';
import { readDefaultCampaignCode } from '../../_lib/env.js';
import { HttpError } from '../../_lib/errors.js';
import {
  buildSessionExpiry,
  createSessionToken,
  hashSessionToken,
  normalizeEmail,
  normalizeGrade,
  normalizePhoneE164,
  optionalString,
  requireString,
} from '../../_lib/exam.js';
import { handleRequest, methodGuard, ok, parseBody } from '../../_lib/http.js';
import { enqueueNotification } from '../../_lib/notifications.js';
import { isRedisUnavailableError } from '../../_lib/redis.js';
import { writeExamSessionCache } from '../../_lib/redisExamSession.js';
import { enforceRateLimit, getRequestIp } from '../../_lib/redisRateLimit.js';

async function upsertSchool(client, schoolName) {
  if (!schoolName) return null;
  const { rows } = await client.query(
    `
      INSERT INTO schools (name)
      VALUES ($1)
      ON CONFLICT (name)
      DO UPDATE SET updated_at = NOW()
      RETURNING id
    `,
    [schoolName],
  );
  return rows[0]?.id || null;
}

async function upsertGuardian(client, fullName, phoneE164, email) {
  const { rows } = await client.query(
    `
      INSERT INTO guardians (full_name, phone_e164, email)
      VALUES ($1, $2, $3)
      ON CONFLICT (phone_e164)
      DO UPDATE
      SET
        full_name = EXCLUDED.full_name,
        email = COALESCE(EXCLUDED.email, guardians.email),
        updated_at = NOW()
      RETURNING id
    `,
    [fullName, phoneE164, email],
  );
  return rows[0]?.id || null;
}

async function resolveCandidate(client, payload) {
  const {
    campaignCode,
    studentFullName,
    grade,
    schoolId,
    guardianId,
    ageRange,
    language,
    source,
  } = payload;

  const duplicate = await client.query(
    `
      SELECT id
      FROM candidates
      WHERE campaign_code = $1
        AND guardian_id = $2
        AND grade = $3
        AND lower(full_name) = lower($4)
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [campaignCode, guardianId, grade, studentFullName],
  );

  if (duplicate.rowCount > 0) {
    const candidateId = duplicate.rows[0].id;
    await client.query(
      `
        UPDATE candidates
        SET
          school_id = COALESCE($2, school_id),
          age_range = COALESCE($3, age_range),
          preferred_language = COALESCE($4, preferred_language),
          source = COALESCE($5, source),
          updated_at = NOW()
        WHERE id = $1
      `,
      [candidateId, schoolId, ageRange, language, source],
    );
    return { candidateId, isDuplicate: true };
  }

  const inserted = await client.query(
    `
      INSERT INTO candidates (
        campaign_code,
        full_name,
        grade,
        school_id,
        guardian_id,
        age_range,
        preferred_language,
        source
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `,
    [campaignCode, studentFullName, grade, schoolId, guardianId, ageRange, language, source],
  );

  return { candidateId: inserted.rows[0].id, isDuplicate: false };
}

async function resolveApplication(client, candidateId, campaignCode, isDuplicate) {
  const existing = await client.query(
    `
      SELECT id, application_no, status, credentials_sms_status
      FROM applications
      WHERE candidate_id = $1
      ORDER BY created_at ASC
      LIMIT 1
    `,
    [candidateId],
  );

  if (existing.rowCount > 0) {
    const application = existing.rows[0];
    if (isDuplicate && application.status !== 'DUPLICATE_REVIEW') {
      await client.query(
        `
          UPDATE applications
          SET status = 'DUPLICATE_REVIEW', updated_at = NOW()
          WHERE id = $1
        `,
        [application.id],
      );
      application.status = 'DUPLICATE_REVIEW';
    }
    return application;
  }

  const inserted = await client.query(
    `
      INSERT INTO applications (candidate_id, campaign_code, status)
      VALUES ($1, $2, $3::application_status)
      RETURNING id, application_no, status, credentials_sms_status
    `,
    [candidateId, campaignCode, isDuplicate ? 'DUPLICATE_REVIEW' : 'APPLIED'],
  );

  return inserted.rows[0];
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    methodGuard(req, ['POST']);
    const body = await parseBody(req);
    if (!body || typeof body !== 'object') {
      throw new HttpError(400, 'Request body must be valid JSON.', 'invalid_json');
    }

    const campaignCode = optionalString(body.campaignCode, 120) || readDefaultCampaignCode();
    const studentFullName = requireString(body.studentFullName || body.fullName, 'studentFullName', 200);
    const parentFullName = requireString(body.parentFullName || body.fullName, 'parentFullName', 200);
    const parentPhoneE164 = normalizePhoneE164(requireString(body.parentPhoneE164 || body.phone, 'parentPhoneE164', 30));
    const parentEmail = normalizeEmail(optionalString(body.parentEmail || body.email, 250));
    const schoolName = optionalString(body.schoolName, 200) || 'Belirtilmedi';
    const grade = normalizeGrade(body.grade ?? 8);
    const ageRange = requireString(body.ageRange || body.age, 'ageRange', 30);
    const language = requireString(body.language, 'language', 80);
    const source = optionalString(body.source || body.formSource || 'placement_exam', 160);
    const bankKey = optionalString(body.bankKey, 120);
    const questionCountRaw = Number.parseInt(String(body.questionCount ?? 0), 10);
    const questionCount = Number.isFinite(questionCountRaw) ? Math.max(0, Math.min(questionCountRaw, 500)) : 0;
    const requestIp = getRequestIp(req);

    await enforceRateLimit(req, res, {
      scope: 'exam_start_ip',
      identity: requestIp,
      limitEnv: 'RL_EXAM_START_IP_LIMIT',
      windowSecondsEnv: 'RL_EXAM_START_IP_WINDOW_SECONDS',
      defaultLimit: 25,
      defaultWindowSeconds: 60,
      requireRedis: true,
      errorCode: 'exam_start_rate_limited',
      errorMessage: 'Too many exam start requests. Please retry shortly.',
    });

    await enforceRateLimit(req, res, {
      scope: 'exam_start_phone',
      identity: parentPhoneE164,
      limitEnv: 'RL_EXAM_START_PHONE_LIMIT',
      windowSecondsEnv: 'RL_EXAM_START_PHONE_WINDOW_SECONDS',
      defaultLimit: 6,
      defaultWindowSeconds: 10 * 60,
      requireRedis: true,
      errorCode: 'exam_start_phone_rate_limited',
      errorMessage: 'Too many attempts for this phone number. Please retry later.',
    });

    const started = await withTransaction(async (client) => {
      await client.query(
        `
          INSERT INTO campaigns (code, name, is_active)
          VALUES ($1, $2, TRUE)
          ON CONFLICT (code) DO NOTHING
        `,
        [campaignCode, campaignCode],
      );

      const schoolId = await upsertSchool(client, schoolName);
      const guardianId = await upsertGuardian(client, parentFullName, parentPhoneE164, parentEmail);
      const { candidateId, isDuplicate } = await resolveCandidate(client, {
        campaignCode,
        studentFullName,
        grade,
        schoolId,
        guardianId,
        ageRange,
        language,
        source,
      });
      const application = await resolveApplication(client, candidateId, campaignCode, isDuplicate);
      const credentialsSmsState = await client.query(
        `
          SELECT id
          FROM notification_jobs
          WHERE candidate_id = $1
            AND channel = 'SMS'
            AND template_code IN ('CREDENTIALS_SMS', 'LOGIN_CREDENTIALS')
          ORDER BY created_at DESC
          LIMIT 1
        `,
        [candidateId],
      );

      const attemptInserted = await client.query(
        `
          INSERT INTO exam_attempts (
            candidate_id,
            application_id,
            campaign_code,
            exam_language,
            exam_age_range,
            bank_key,
            question_count,
            status,
            started_at,
            source
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'STARTED', NOW(), $8)
          RETURNING id, started_at
        `,
        [candidateId, application.id, campaignCode, language, ageRange, bankKey, questionCount, source],
      );

      const attempt = attemptInserted.rows[0];
      const sessionToken = createSessionToken();
      const tokenHash = hashSessionToken(sessionToken);
      const expiresAt = buildSessionExpiry();

      const sessionInserted = await client.query(
        `
          INSERT INTO exam_session_tokens (attempt_id, token_hash, expires_at)
          VALUES ($1, $2, $3::timestamptz)
          RETURNING id
        `,
        [attempt.id, tokenHash, expiresAt],
      );

      try {
        await writeExamSessionCache(tokenHash, {
          id: sessionInserted.rows[0]?.id || null,
          attempt_id: attempt.id,
          expires_at: expiresAt,
          revoked_at: null,
        });
      } catch (error) {
        if (isRedisUnavailableError(error)) {
          throw new HttpError(503, 'Session cache is temporarily unavailable.', 'session_cache_unavailable');
        }
        throw error;
      }

      await client.query(
        `
          INSERT INTO activity_events (candidate_id, attempt_id, event_type, event_payload)
          VALUES ($1, $2, 'LOGIN', $3::jsonb)
        `,
        [candidateId, attempt.id, JSON.stringify({ source: 'exam_session_start' })],
      );

      await client.query(
        `
          INSERT INTO activity_events (candidate_id, attempt_id, event_type, event_payload)
          SELECT $1, $2, 'FIRST_LOGIN', $3::jsonb
          WHERE NOT EXISTS (
            SELECT 1
            FROM activity_events
            WHERE candidate_id = $1
              AND event_type = 'FIRST_LOGIN'
          )
        `,
        [candidateId, attempt.id, JSON.stringify({ source: 'exam_session_start' })],
      );

      return {
        candidateId,
        applicationNo: application.application_no,
        applicationStatus: application.status,
        attemptId: attempt.id,
        sessionToken,
        expiresAt,
        startedAt: attempt.started_at,
        credentialsSmsStatus: application.credentials_sms_status || 'NOT_QUEUED',
        hasCredentialsSmsJob: credentialsSmsState.rowCount > 0,
        parentPhoneE164,
      };
    });

    if (!started.hasCredentialsSmsJob && started.parentPhoneE164) {
      try {
        const enqueued = await enqueueNotification({
          campaignCode,
          candidateId: started.candidateId,
          attemptId: started.attemptId,
          channel: 'SMS',
          templateCode: 'CREDENTIALS_SMS',
          recipient: started.parentPhoneE164,
          payload: {
            applicationNo: started.applicationNo,
            trigger: 'session_start_auto_credentials',
          },
        });
        started.credentialsSmsStatus = 'QUEUED';
        started.credentialsSmsJobId = enqueued.jobId;
      } catch (error) {
        console.error('[exam_session_start_sms_enqueue_failed]', error);
      }
    }

    const { parentPhoneE164: _parentPhoneE164, hasCredentialsSmsJob: _hasCredentialsSmsJob, ...sessionPayload } = started;
    ok(res, {
      session: sessionPayload,
    });
  });
}
