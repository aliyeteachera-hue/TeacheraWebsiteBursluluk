import { query, withTransaction } from '../../_lib/db.js';
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
import { isAuthorizedLoadTestMode } from '../../_lib/loadTestMode.js';
import { enqueueNotification } from '../../_lib/notifications.js';
import { computePiiLookupHash, encryptPii } from '../../_lib/piiCrypto.js';
import { isRedisUnavailableError } from '../../_lib/redis.js';
import { writeExamSessionCache } from '../../_lib/redisExamSession.js';
import { enforceRateLimit, getRequestIp } from '../../_lib/redisRateLimit.js';

const REDACTED_NAME = '[ENCRYPTED_PII]';
const ensuredCampaignCodes = new Set();
const cachedSchoolIds = new Map();

function buildRedactedPhoneToken(phoneHash) {
  return `pii:${String(phoneHash || '').slice(0, 28)}`;
}

function buildLoadTestGuardianPhoneToken(phoneE164) {
  const compact = String(phoneE164 || '').replace(/\D+/g, '');
  return `lt:${compact.slice(-14)}`;
}

function rememberSchoolId(cacheKey, schoolId) {
  if (!cacheKey || !schoolId) return;
  cachedSchoolIds.set(cacheKey, schoolId);
  if (cachedSchoolIds.size > 2000) {
    cachedSchoolIds.clear();
    cachedSchoolIds.set(cacheKey, schoolId);
  }
}

async function resolveSchoolId(client, schoolName) {
  if (!schoolName) return null;
  const cacheKey = schoolName.toLowerCase();
  const cached = cachedSchoolIds.get(cacheKey);
  if (cached) return cached;

  const inserted = await client.query(
    `
      INSERT INTO schools (name)
      VALUES ($1)
      ON CONFLICT (name) DO NOTHING
      RETURNING id
    `,
    [schoolName],
  );

  if (inserted.rowCount > 0) {
    const schoolId = inserted.rows[0]?.id || null;
    rememberSchoolId(cacheKey, schoolId);
    return schoolId;
  }

  const existing = await client.query(
    `
      SELECT id
      FROM schools
      WHERE name = $1
      LIMIT 1
    `,
    [schoolName],
  );
  const schoolId = existing.rows[0]?.id || null;
  rememberSchoolId(cacheKey, schoolId);
  return schoolId;
}

async function upsertGuardian(
  client,
  {
    fullNameEnc,
    phoneEnc,
    emailEnc,
    phoneHash,
    phoneE164,
  },
) {
  const redactedPhone = buildRedactedPhoneToken(phoneHash);
  const existingGuardian = await client.query(
    `
      SELECT id
      FROM guardians
      WHERE phone_e164_hash = $1
        OR phone_e164 = $2
        OR phone_e164 = $3
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [phoneHash, redactedPhone, phoneE164],
  );

  if (existingGuardian.rowCount > 0) {
    const guardianId = existingGuardian.rows[0].id;
    await client.query(
      `
        UPDATE guardians
        SET
          full_name = $2,
          phone_e164 = $3,
          email = NULL,
          full_name_enc = COALESCE($4, full_name_enc),
          phone_e164_enc = COALESCE($5, phone_e164_enc),
          email_enc = COALESCE($6, email_enc),
          phone_e164_hash = $7,
          updated_at = NOW()
        WHERE id = $1
      `,
      [guardianId, REDACTED_NAME, redactedPhone, fullNameEnc, phoneEnc, emailEnc, phoneHash],
    );
    return guardianId;
  }

  const inserted = await client.query(
    `
      INSERT INTO guardians (
        full_name,
        phone_e164,
        email,
        full_name_enc,
        phone_e164_enc,
        email_enc,
        phone_e164_hash
      )
      VALUES ($1, $2, NULL, $3, $4, $5, $6)
      RETURNING id
    `,
    [REDACTED_NAME, redactedPhone, fullNameEnc, phoneEnc, emailEnc, phoneHash],
  );

  return inserted.rows[0]?.id || null;
}

async function resolveCandidate(client, payload) {
  const {
    campaignCode,
    studentFullNameHash,
    studentFullNameEnc,
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
        AND full_name_hash = $4
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [campaignCode, guardianId, grade, studentFullNameHash],
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
          full_name = $6,
          full_name_enc = COALESCE($7, full_name_enc),
          full_name_hash = COALESCE($8, full_name_hash),
          updated_at = NOW()
        WHERE id = $1
      `,
      [candidateId, schoolId, ageRange, language, source, REDACTED_NAME, studentFullNameEnc, studentFullNameHash],
    );
    return { candidateId, isDuplicate: true };
  }

  const inserted = await client.query(
    `
      INSERT INTO candidates (
        campaign_code,
        full_name,
        full_name_enc,
        full_name_hash,
        grade,
        school_id,
        guardian_id,
        age_range,
        preferred_language,
        source
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `,
    [
      campaignCode,
      REDACTED_NAME,
      studentFullNameEnc,
      studentFullNameHash,
      grade,
      schoolId,
      guardianId,
      ageRange,
      language,
      source,
    ],
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

async function ensureCampaign(campaignCode) {
  if (ensuredCampaignCodes.has(campaignCode)) return;

  await query(
    `
      INSERT INTO campaigns (code, name, is_active)
      VALUES ($1, $2, TRUE)
      ON CONFLICT (code) DO NOTHING
    `,
    [campaignCode, campaignCode],
  );

  ensuredCampaignCodes.add(campaignCode);
  if (ensuredCampaignCodes.size > 2000) {
    ensuredCampaignCodes.clear();
    ensuredCampaignCodes.add(campaignCode);
  }
}

async function createSession(client, attemptId) {
  const sessionToken = createSessionToken();
  const tokenHash = hashSessionToken(sessionToken);
  const expiresAt = buildSessionExpiry();

  const sessionInserted = await client.query(
    `
      INSERT INTO exam_session_tokens (attempt_id, token_hash, expires_at)
      VALUES ($1, $2, $3::timestamptz)
      RETURNING id
    `,
    [attemptId, tokenHash, expiresAt],
  );

  try {
    await writeExamSessionCache(tokenHash, {
      id: sessionInserted.rows[0]?.id || null,
      attempt_id: attemptId,
      expires_at: expiresAt,
      revoked_at: null,
    });
  } catch (error) {
    if (isRedisUnavailableError(error)) {
      throw new HttpError(503, 'Session cache is temporarily unavailable.', 'session_cache_unavailable');
    }
    throw error;
  }

  return {
    sessionToken,
    expiresAt,
  };
}

async function startLoadTestSession(client, payload) {
  const {
    campaignCode,
    grade,
    schoolName,
    ageRange,
    language,
    source,
    bankKey,
    questionCount,
    parentPhoneE164,
  } = payload;
  const schoolId = await resolveSchoolId(client, schoolName);
  const guardianPhone = buildLoadTestGuardianPhoneToken(parentPhoneE164);

  const guardianInserted = await client.query(
    `
      INSERT INTO guardians (
        full_name,
        phone_e164,
        email,
        full_name_enc,
        phone_e164_enc,
        email_enc,
        phone_e164_hash
      )
      VALUES ($1, $2, NULL, NULL, NULL, NULL, NULL)
      RETURNING id
    `,
    [REDACTED_NAME, guardianPhone],
  );
  const guardianId = guardianInserted.rows[0]?.id;

  const candidateInserted = await client.query(
    `
      INSERT INTO candidates (
        campaign_code,
        full_name,
        full_name_enc,
        full_name_hash,
        grade,
        school_id,
        guardian_id,
        age_range,
        preferred_language,
        source
      )
      VALUES ($1, $2, NULL, NULL, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `,
    [campaignCode, REDACTED_NAME, grade, schoolId, guardianId, ageRange, language, source],
  );
  const candidateId = candidateInserted.rows[0]?.id;

  const applicationInserted = await client.query(
    `
      INSERT INTO applications (candidate_id, campaign_code, status)
      VALUES ($1, $2, 'APPLIED'::application_status)
      RETURNING id, application_no, status, credentials_sms_status
    `,
    [candidateId, campaignCode],
  );
  const application = applicationInserted.rows[0];

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
  const session = await createSession(client, attempt.id);

  return {
    candidateId,
    applicationNo: application.application_no,
    applicationStatus: application.status,
    attemptId: attempt.id,
    sessionToken: session.sessionToken,
    expiresAt: session.expiresAt,
    startedAt: attempt.started_at,
    credentialsSmsStatus: application.credentials_sms_status || 'NOT_QUEUED',
    hasCredentialsSmsJob: false,
    parentPhoneE164,
  };
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
    const loadTestMode = isAuthorizedLoadTestMode(req);
    const requestIp = getRequestIp(req);
    const studentFullNameHash = loadTestMode ? null : computePiiLookupHash(studentFullName);
    if (!loadTestMode && !studentFullNameHash) {
      throw new HttpError(503, 'PII hashing is not configured.', 'pii_hash_not_configured');
    }
    const parentPhoneHash = loadTestMode ? null : computePiiLookupHash(parentPhoneE164);
    if (!loadTestMode && !parentPhoneHash) {
      throw new HttpError(503, 'PII hashing is not configured.', 'pii_hash_not_configured');
    }

    const [studentFullNameEnc, parentFullNameEnc, parentPhoneEnc, parentEmailEnc] = loadTestMode
      ? [null, null, null, null]
      : await Promise.all([
          encryptPii(studentFullName, 240),
          encryptPii(parentFullName, 240),
          encryptPii(parentPhoneE164, 60),
          encryptPii(parentEmail, 320),
        ]);

    if (!loadTestMode) {
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
    }

    await ensureCampaign(campaignCode);

    const started = await withTransaction(async (client) => {
      if (loadTestMode) {
        return startLoadTestSession(client, {
          campaignCode,
          grade,
          schoolName,
          ageRange,
          language,
          source,
          bankKey,
          questionCount,
          parentPhoneE164,
        });
      }

      const schoolId = await resolveSchoolId(client, schoolName);
      const guardianId = await upsertGuardian(client, {
        fullNameEnc: parentFullNameEnc,
        phoneEnc: parentPhoneEnc,
        emailEnc: parentEmailEnc,
        phoneHash: parentPhoneHash,
        phoneE164: parentPhoneE164,
      });
      const { candidateId, isDuplicate } = await resolveCandidate(client, {
        campaignCode,
        studentFullNameHash,
        studentFullNameEnc,
        grade,
        schoolId,
        guardianId,
        ageRange,
        language,
        source,
      });
      const application = await resolveApplication(client, candidateId, campaignCode, isDuplicate);

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
      const session = await createSession(client, attempt.id);

      if (!loadTestMode) {
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
      }

      return {
        candidateId,
        applicationNo: application.application_no,
        applicationStatus: application.status,
        attemptId: attempt.id,
        sessionToken: session.sessionToken,
        expiresAt: session.expiresAt,
        startedAt: attempt.started_at,
        credentialsSmsStatus: application.credentials_sms_status || 'NOT_QUEUED',
        hasCredentialsSmsJob: String(application.credentials_sms_status || 'NOT_QUEUED').toUpperCase() !== 'NOT_QUEUED',
        parentPhoneE164,
      };
    });

    if (!loadTestMode && !started.hasCredentialsSmsJob && started.parentPhoneE164) {
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
