import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import {
  STORE_PATH,
  SCHOOLS_DATA_PATH,
  getGradeLabel,
  getSessionById,
  resolveResultReleaseAt,
  toMs,
} from './burslulukConfig.js';
import { getExamBankForGrade } from './burslulukExamData.js';
import { normalizePhone, normalizeDigits, safeTrim } from './http.js';
import { getSmsProviderMode, sendBulkSms, sendSms } from './smsProvider.js';

const STORE_VERSION = 1;
const CANDIDATE_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const schoolsCache = {
  value: null,
};

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix) {
  return `${prefix}_${randomBytes(8).toString('hex')}`;
}

function createToken(prefix) {
  return `${prefix}_${randomBytes(24).toString('base64url')}`;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizeName(value) {
  return safeTrim(value)
    .toLocaleLowerCase('tr-TR')
    .replace(/\s+/g, ' ')
    .trim();
}

function scryptPassword(password, salt = randomBytes(16).toString('hex')) {
  return {
    salt,
    hash: scryptSync(password, salt, 64).toString('hex'),
  };
}

function verifyPassword(password, credential) {
  if (!credential?.passwordHash || !credential?.passwordSalt) return false;

  const computed = scryptSync(password, credential.passwordSalt, 64);
  const stored = Buffer.from(credential.passwordHash, 'hex');

  if (computed.length !== stored.length) return false;
  return timingSafeEqual(computed, stored);
}

function generateApplicationCode() {
  return `BRS-2026-${randomBytes(3).toString('hex').toUpperCase()}`;
}

function generateUsername() {
  return `teachera${randomBytes(3).toString('hex')}`;
}

function generatePassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  return Array.from({ length: 10 }, () => alphabet[randomBytes(1)[0] % alphabet.length]).join('');
}

function normalizeNationalId(value) {
  const digits = normalizeDigits(value);
  return digits.length === 11 ? digits : '';
}

function buildInitialState() {
  const createdAt = nowIso();
  return {
    version: STORE_VERSION,
    meta: {
      createdAt,
      updatedAt: createdAt,
    },
    publication: {
      resultReleaseAt: resolveResultReleaseAt(null),
      resultsPublishedAt: null,
    },
    applications: [],
    students: [],
    guardians: [],
    examCredentials: [],
    candidateSessions: [],
    examAttempts: [],
    results: [],
    messageJobs: [],
    salesTasks: [],
    eventLog: [],
  };
}

async function ensureStoreDir() {
  await mkdir(dirname(STORE_PATH), { recursive: true });
}

async function readStore() {
  await ensureStoreDir();

  try {
    const raw = await readFile(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      ...buildInitialState(),
      ...parsed,
      meta: {
        ...buildInitialState().meta,
        ...(parsed.meta || {}),
      },
      publication: {
        ...buildInitialState().publication,
        ...(parsed.publication || {}),
      },
    };
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      const initialState = buildInitialState();
      await writeStore(initialState);
      return initialState;
    }
    throw error;
  }
}

async function writeStore(state) {
  await ensureStoreDir();
  const nextState = {
    ...state,
    version: STORE_VERSION,
    meta: {
      ...(state.meta || {}),
      updatedAt: nowIso(),
    },
  };

  const tempPath = `${STORE_PATH}.${randomBytes(6).toString('hex')}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(nextState, null, 2)}\n`, 'utf-8');
  await rename(tempPath, STORE_PATH);
  return nextState;
}

async function mutateStore(mutator) {
  const state = await readStore();
  const result = await mutator(state);
  await writeStore(state);
  return result;
}

async function readSchools() {
  if (Array.isArray(schoolsCache.value)) {
    return schoolsCache.value;
  }

  const raw = await readFile(SCHOOLS_DATA_PATH, 'utf-8');
  const parsed = JSON.parse(raw);
  schoolsCache.value = Array.isArray(parsed) ? parsed : [];
  return schoolsCache.value;
}

function matchSchool(school, query) {
  if (!query) return true;
  const haystack = `${school.name} ${school.district} ${school.type}`.toLocaleLowerCase('tr-TR');
  return haystack.includes(query.toLocaleLowerCase('tr-TR'));
}

export async function searchSchools(query) {
  const trimmedQuery = safeTrim(query);
  const schools = await readSchools();
  return schools
    .filter((school) => matchSchool(school, trimmedQuery))
    .slice(0, 25);
}

function getSchoolDisplayName(schools, schoolId, fallbackName) {
  const selectedSchool = schools.find((school) => school.id === schoolId);
  return selectedSchool?.name || safeTrim(fallbackName) || 'Diğer okul';
}

function findStudent(state, studentId) {
  return state.students.find((student) => student.id === studentId) || null;
}

function findGuardian(state, guardianId) {
  return state.guardians.find((guardian) => guardian.id === guardianId) || null;
}

function findApplicationById(state, applicationId) {
  return state.applications.find((application) => application.id === applicationId) || null;
}

function findCredentialByApplicationId(state, applicationId) {
  return state.examCredentials.find((credential) => credential.applicationId === applicationId) || null;
}

function stripAnswers(bank) {
  return bank.map(({ answer, ...question }) => question);
}

function getAttemptPublic(attempt) {
  if (!attempt) return null;
  return {
    attemptId: attempt.id,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
    questionCount: attempt.questionCount,
  };
}

function resolveExamStatus(state, application, sessionId, nowMs = Date.now()) {
  const session = getSessionById(sessionId);
  const attempt = state.examAttempts
    .filter((item) => item.applicationId === application.id)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0];

  if (attempt?.status === 'submitted') return 'submitted';
  if (!session) return 'scheduled';

  const startMs = toMs(session.startsAt);
  const endMs = toMs(session.endsAt);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return 'scheduled';
  if (attempt?.status === 'in_progress') return 'in_progress';
  if (nowMs < startMs) return 'waiting_room';
  if (nowMs >= startMs && nowMs <= endMs) return 'available';
  return 'missed';
}

function resolveResultStatus(state, applicationId) {
  const result = state.results.find((item) => item.applicationId === applicationId) || null;
  if (!result) return 'not_ready';
  if (result.status === 'published') return 'published';
  return result.status || 'awaiting_publication';
}

function buildCandidateEnvelope(state, application, tokenSession = null) {
  const student = findStudent(state, application.studentId);
  const result = state.results.find((item) => item.applicationId === application.id) || null;
  const session = getSessionById(application.sessionId);

  return {
    applicationCode: application.applicationCode,
    studentFullName: student?.fullName || '',
    schoolName: application.schoolName,
    grade: application.grade,
    gradeLabel: getGradeLabel(application.grade),
    sessionId: application.sessionId,
    examStatus: resolveExamStatus(state, application, application.sessionId),
    resultStatus: resolveResultStatus(state, application.id),
    session: session
      ? {
          id: session.id,
          label: session.label,
          startsAt: session.startsAt,
          endsAt: session.endsAt,
        }
      : null,
    result:
      result?.status === 'published'
        ? {
            scholarshipRate: result.scholarshipRate,
            percentage: result.percentage,
            score: result.score,
            correctCount: result.correctCount,
            wrongCount: result.wrongCount,
            unansweredCount: result.unansweredCount,
            summary: result.summary,
            publishedAt: result.publishedAt,
          }
        : null,
    tokenExpiresAt: tokenSession?.expiresAt || null,
  };
}

function createMessageJob(state, applicationId, type, payload, status = 'queued') {
  const job = {
    id: createId('msg'),
    applicationId,
    type,
    status,
    payload,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  state.messageJobs.push(job);
  return job;
}

function updateMessageJob(job, patch) {
  if (!job) return null;
  Object.assign(job, patch, {
    updatedAt: nowIso(),
  });
  return job;
}

function createSalesTask(state, applicationId, priority, notes) {
  const existing = state.salesTasks.find(
    (task) => task.applicationId === applicationId && task.status === 'open' && task.type === 'whatsapp_followup',
  );
  if (existing) return existing;

  const task = {
    id: createId('task'),
    applicationId,
    type: 'whatsapp_followup',
    status: 'open',
    priority,
    notes,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  state.salesTasks.push(task);
  return task;
}

function recordEvent(state, type, payload) {
  state.eventLog.push({
    id: createId('evt'),
    type,
    payload,
    createdAt: nowIso(),
  });
}

function getLatestMessageJob(state, applicationId, type) {
  return state.messageJobs
    .filter((job) => job.applicationId === applicationId && job.type === type)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0] || null;
}

function getPublicSiteUrl() {
  const value =
    safeTrim(process.env.BURSLULUK_PUBLIC_BASE_URL) ||
    safeTrim(process.env.SITE_URL) ||
    'https://teachera.com.tr';
  return value.replace(/\/+$/, '');
}

function buildCandidateLoginUrl() {
  return `${getPublicSiteUrl()}/bursluluk/giris`;
}

function buildResultLookupUrl() {
  return `${getPublicSiteUrl()}/bursluluk/giris`;
}

function buildSmsMessageText(type, context) {
  const loginUrl = buildCandidateLoginUrl();
  const resultUrl = buildResultLookupUrl();

  if (type === 'application_sms') {
    return [
      'Teachera Online Bursluluk Sinavi Basvurunuz alindi.',
      '',
      'Kullanici adi',
      `${context.username}`,
      '',
      'Sifre',
      `${context.password}`,
      '',
      'Giris Linki:',
      `${loginUrl}`,
    ].join('\n');
  }

  if (type === 'password_reset_sms') {
    return [
      'Teachera Online Bursluluk Sinavi Sifre yenilendi.',
      '',
      'Kullanici adi',
      `${context.username}`,
      '',
      'Sifre',
      `${context.password}`,
      '',
      'Giris Linki:',
      `${loginUrl}`,
    ].join('\n');
  }

  if (type === 'result_sms') {
    return [
      'Teachera Online Bursluluk Sinavi Sonucunuz aciklandi.',
      '',
      'Kullanici adi',
      `${context.username}`,
      '',
      'Ayni sifre ile giris yapabilirsiniz.',
      '',
      'Giris Linki:',
      `${resultUrl}`,
    ].join('\n');
  }

  return '';
}

function getMessageDispatchContext(state, job) {
  const application = findApplicationById(state, job?.applicationId);
  const guardian = application ? findGuardian(state, application.guardianId) : null;
  const credential = application ? findCredentialByApplicationId(state, application.id) : null;
  const session = application ? getSessionById(application.sessionId) : null;
  const result = application ? state.results.find((item) => item.applicationId === application.id) || null : null;

  if (!job || !application || !guardian) return null;

  const context = {
    applicationId: application.id,
    applicationCode: application.applicationCode,
    guardianPhone: guardian.phone,
    username: safeTrim(job.payload?.username) || safeTrim(credential?.username),
    password: safeTrim(job.payload?.password),
    sessionLabel: safeTrim(job.payload?.sessionLabel) || safeTrim(session?.label),
    resultStatus: safeTrim(job.payload?.resultStatus) || safeTrim(result?.status),
  };

  return {
    jobId: job.id,
    applicationId: application.id,
    type: job.type,
    to: guardian.phone,
    messageText: buildSmsMessageText(job.type, context),
  };
}

function mapCredentialStatusFromMessage(type, messageStatus) {
  if (type === 'application_sms') {
    if (messageStatus === 'failed') return 'issue_failed';
    if (messageStatus === 'preview') return 'preview';
    if (['wait', 'success'].includes(messageStatus)) return 'issued';
    return 'queued';
  }

  if (type === 'password_reset_sms') {
    if (messageStatus === 'failed') return 'reset_failed';
    if (messageStatus === 'preview') return 'reset_preview';
    if (['wait', 'success'].includes(messageStatus)) return 'reset_sent';
    return 'reset_pending';
  }

  return '';
}

function syncCredentialStatusWithMessage(state, applicationId, type, messageStatus) {
  const credential = findCredentialByApplicationId(state, applicationId);
  if (!credential) return;

  const nextStatus = mapCredentialStatusFromMessage(type, messageStatus);
  if (!nextStatus) return;

  credential.status = nextStatus;
  credential.updatedAt = nowIso();
}

function normalizeDispatchError(error) {
  if (error instanceof Error) {
    return safeTrim(error.message) || 'sms_dispatch_failed';
  }
  return 'sms_dispatch_failed';
}

async function markPreviewMessageJobs(envelopes) {
  if (envelopes.length === 0) return [];

  return mutateStore((state) =>
    envelopes
      .map((envelope) => {
        const job = state.messageJobs.find((item) => item.id === envelope.jobId);
        if (!job) return null;

        updateMessageJob(job, {
          status: 'preview',
          provider: 'preview',
          providerStatus: 'preview',
          providerMessageId: '',
          messageText: envelope.messageText,
          failureReason: 'sms_provider_not_configured',
        });
        syncCredentialStatusWithMessage(state, envelope.applicationId, envelope.type, 'preview');
        recordEvent(state, 'sms_preview_created', {
          applicationId: envelope.applicationId,
          jobId: envelope.jobId,
          type: envelope.type,
        });
        return job;
      })
      .filter(Boolean),
  );
}

async function markFailedMessageJobs(envelopes, errorMessage) {
  if (envelopes.length === 0) return [];

  return mutateStore((state) =>
    envelopes
      .map((envelope) => {
        const job = state.messageJobs.find((item) => item.id === envelope.jobId);
        if (!job) return null;

        updateMessageJob(job, {
          status: 'failed',
          provider: 'mobikob',
          providerStatus: 'failed',
          providerMessageId: '',
          messageText: envelope.messageText,
          failureReason: errorMessage,
        });
        syncCredentialStatusWithMessage(state, envelope.applicationId, envelope.type, 'failed');
        recordEvent(state, 'sms_failed', {
          applicationId: envelope.applicationId,
          jobId: envelope.jobId,
          type: envelope.type,
          error: errorMessage,
        });
        return job;
      })
      .filter(Boolean),
  );
}

async function markSentMessageJobs(envelopes, providerResult) {
  if (envelopes.length === 0) return [];

  return mutateStore((state) =>
    envelopes
      .map((envelope, index) => {
        const job = state.messageJobs.find((item) => item.id === envelope.jobId);
        if (!job) return null;

        const item = Array.isArray(providerResult?.responses) ? providerResult.responses[index] : null;
        const providerStatus = safeTrim(item?.status) || safeTrim(providerResult?.status) || 'wait';
        const providerMessageId = safeTrim(item?.message_id) || safeTrim(providerResult?.messageId);

        updateMessageJob(job, {
          status: providerStatus,
          provider: safeTrim(providerResult?.provider) || 'mobikob',
          providerStatus,
          providerMessageId,
          messageText: envelope.messageText,
          providerResponse: item || providerResult?.rawResponse || null,
          sentAt: nowIso(),
          failureReason: '',
        });
        syncCredentialStatusWithMessage(state, envelope.applicationId, envelope.type, providerStatus);
        recordEvent(state, 'sms_sent', {
          applicationId: envelope.applicationId,
          jobId: envelope.jobId,
          type: envelope.type,
          providerStatus,
          providerMessageId,
        });
        return job;
      })
      .filter(Boolean),
  );
}

async function loadDispatchEnvelopes(jobIds) {
  const state = await readStore();
  return jobIds
    .map((jobId) => {
      const job = state.messageJobs.find((item) => item.id === jobId) || null;
      if (!job) return null;
      return getMessageDispatchContext(state, job);
    })
    .filter((item) => item && item.messageText && item.to);
}

async function dispatchMessageJobs(jobIds) {
  const envelopes = await loadDispatchEnvelopes(jobIds);
  if (envelopes.length === 0) return [];

  if (getSmsProviderMode() !== 'provider') {
    return markPreviewMessageJobs(envelopes);
  }

  try {
    if (envelopes.length === 1) {
      const sent = await sendSms({
        to: envelopes[0].to,
        msg: envelopes[0].messageText,
      });
      return markSentMessageJobs(envelopes, {
        provider: sent.provider,
        status: sent.status,
        messageId: sent.messageId,
        rawResponse: sent.rawResponse,
      });
    }

    const bulk = await sendBulkSms(
      envelopes.map((item) => ({
        to: item.to,
        msg: item.messageText,
      })),
    );
    return markSentMessageJobs(envelopes, bulk);
  } catch (error) {
    return markFailedMessageJobs(envelopes, normalizeDispatchError(error));
  }
}

function computeScholarship(percentage) {
  if (percentage >= 90) return 60;
  if (percentage >= 80) return 50;
  if (percentage >= 70) return 40;
  return 20;
}

function buildResultSummary(percentage) {
  if (percentage >= 90) {
    return 'Oldukça güçlü bir performans gösterdin. İleri seviye ve yoğun programlar için yüksek uyum sinyali veriyorsun.';
  }
  if (percentage >= 80) {
    return 'Başarılı bir sınav performansı gösterdin. Düzenli bir programla hızlı ilerleme potansiyelin yüksek.';
  }
  if (percentage >= 70) {
    return 'Temel kazanımların iyi seviyede. Doğru grup ve düzenli takip ile güçlü bir gelişim beklenir.';
  }
  return 'Katılım bursu hakkın hazır. Düzenli program ve destekle güçlü bir başlangıç rotası oluşturulabilir.';
}

function resolveDuplicateApplication(state, dedupe) {
  return state.applications.find((application) => {
    if (dedupe.nationalIdHash && application.nationalIdHash === dedupe.nationalIdHash) {
      return true;
    }

    return (
      application.guardianPhone === dedupe.guardianPhone &&
      application.studentNameNormalized === dedupe.studentNameNormalized &&
      application.schoolKey === dedupe.schoolKey &&
      application.grade === dedupe.grade
    );
  }) || null;
}

export async function createOrReissueApplication(payload) {
  const schools = await readSchools();

  const created = await mutateStore((state) => {
    const nationalId = normalizeNationalId(payload.nationalId);
    const nationalIdHash = nationalId ? sha256(nationalId) : '';
    const birthYear = normalizeDigits(payload.birthYear).slice(0, 4);
    const guardianPhone = normalizePhone(payload.guardianPhone);
    const studentNameNormalized = normalizeName(payload.studentFullName);
    const grade = Number(payload.grade);
    const schoolName = getSchoolDisplayName(schools, payload.schoolId, payload.schoolName);
    const schoolKey = safeTrim(payload.schoolId) || normalizeName(schoolName);
    const dedupe = { nationalIdHash, guardianPhone, studentNameNormalized, schoolKey, grade };

    const session = getSessionById(payload.sessionId);
    if (!session || !session.grades.includes(grade)) {
      throw new Error('invalid_session');
    }

    let application = resolveDuplicateApplication(state, dedupe);
    let student = application ? findStudent(state, application.studentId) : null;
    let guardian = application ? findGuardian(state, application.guardianId) : null;

    if (!application) {
      student = {
        id: createId('stu'),
        fullName: safeTrim(payload.studentFullName),
        birthYear,
        nationalIdHash,
        nationalIdLast4: nationalId.slice(-4),
        createdAt: nowIso(),
      };
      guardian = {
        id: createId('grd'),
        fullName: safeTrim(payload.guardianFullName),
        phone: guardianPhone,
        email: safeTrim(payload.guardianEmail),
        createdAt: nowIso(),
      };
      application = {
        id: createId('app'),
        applicationCode: generateApplicationCode(),
        studentId: student.id,
        guardianId: guardian.id,
        schoolId: safeTrim(payload.schoolId),
        schoolKey,
        schoolName,
        grade,
        branch: safeTrim(payload.branch),
        sessionId: payload.sessionId,
        kvkkConsent: Boolean(payload.kvkkConsent),
        marketingConsent: Boolean(payload.marketingConsent),
        guardianPhone,
        nationalIdHash,
        studentNameNormalized,
        createdAt: nowIso(),
      };
      state.students.push(student);
      state.guardians.push(guardian);
      state.applications.push(application);
      recordEvent(state, 'application_created', {
        applicationId: application.id,
        schoolId: application.schoolId,
        grade,
      });
    } else {
      application.schoolId = safeTrim(payload.schoolId);
      application.schoolName = schoolName;
      application.schoolKey = schoolKey;
      application.grade = grade;
      application.branch = safeTrim(payload.branch);
      application.sessionId = payload.sessionId;
      application.kvkkConsent = Boolean(payload.kvkkConsent);
      application.marketingConsent = Boolean(payload.marketingConsent);
      application.guardianPhone = guardianPhone;
      application.studentNameNormalized = studentNameNormalized;
      application.nationalIdHash = nationalIdHash || application.nationalIdHash;
      if (student) {
        student.fullName = safeTrim(payload.studentFullName);
        student.birthYear = birthYear;
        student.nationalIdHash = nationalIdHash || student.nationalIdHash;
        student.nationalIdLast4 = nationalId ? nationalId.slice(-4) : student.nationalIdLast4;
      }
      if (guardian) {
        guardian.fullName = safeTrim(payload.guardianFullName);
        guardian.phone = guardianPhone;
        guardian.email = safeTrim(payload.guardianEmail);
      }
      recordEvent(state, 'application_reissued', {
        applicationId: application.id,
      });
    }

    const password = generatePassword();
    const credential = findCredentialByApplicationId(state, application.id);
    const hashed = scryptPassword(password);
    if (credential) {
      credential.username = credential.username || generateUsername();
      credential.passwordHash = hashed.hash;
      credential.passwordSalt = hashed.salt;
      credential.status = 'queued';
      credential.updatedAt = nowIso();
    } else {
      state.examCredentials.push({
        id: createId('cred'),
        applicationId: application.id,
        username: generateUsername(),
        passwordHash: hashed.hash,
        passwordSalt: hashed.salt,
        status: 'queued',
        createdAt: nowIso(),
        updatedAt: nowIso(),
      });
    }

    const activeCredential = findCredentialByApplicationId(state, application.id);
    const messageJob = createMessageJob(state, application.id, 'application_sms', {
      applicationCode: application.applicationCode,
      username: activeCredential.username,
      password,
      sessionLabel: session.label,
    });

    return {
      application,
      credential: {
        username: activeCredential.username,
        password,
        credentialStatus: activeCredential.status,
      },
      messageJobId: messageJob.id,
    };
  });

  await dispatchMessageJobs([created.messageJobId]);
  const refreshed = await getApplicationConfirmation(created.application.applicationCode);

  return {
    application: created.application,
    credential: {
      ...created.credential,
      credentialStatus: refreshed?.credentialStatus || created.credential.credentialStatus,
    },
  };
}

export async function getApplicationConfirmation(applicationCode) {
  const schools = await readSchools();
  const state = await readStore();
  const application = state.applications.find((item) => item.applicationCode === safeTrim(applicationCode)) || null;
  if (!application) return null;

  const student = findStudent(state, application.studentId);
  const guardian = findGuardian(state, application.guardianId);
  const credential = findCredentialByApplicationId(state, application.id);
  const session = getSessionById(application.sessionId);
  const previewJob = getLatestMessageJob(state, application.id, 'application_sms');

  return {
    applicationCode: application.applicationCode,
    schoolId: application.schoolId,
    schoolName: getSchoolDisplayName(schools, application.schoolId, application.schoolName),
    grade: application.grade,
    gradeLabel: getGradeLabel(application.grade),
    branch: application.branch,
    sessionId: application.sessionId,
    sessionLabel: session?.label || '',
    studentFullName: student?.fullName || '',
    guardianFullName: guardian?.fullName || '',
    guardianEmail: guardian?.email || '',
    username: credential?.username || previewJob?.payload?.username || '',
    password: previewJob?.payload?.password || '',
    credentialStatus: credential?.status || 'missing',
    createdAt: application.createdAt,
  };
}

export async function loginCandidate(username, password) {
  return mutateStore((state) => {
    const credential = state.examCredentials.find((item) => item.username === safeTrim(username)) || null;
    if (!credential || !verifyPassword(password, credential)) {
      return null;
    }

    const application = findApplicationById(state, credential.applicationId);
    if (!application) return null;

    const rawToken = createToken('cand');
    state.candidateSessions = state.candidateSessions.filter((session) => new Date(session.expiresAt).getTime() > Date.now());
    const session = {
      id: createId('sess'),
      applicationId: application.id,
      tokenHash: sha256(rawToken),
      createdAt: nowIso(),
      expiresAt: new Date(Date.now() + CANDIDATE_SESSION_TTL_MS).toISOString(),
      lastSeenAt: nowIso(),
    };
    state.candidateSessions.push(session);
    recordEvent(state, 'candidate_login', { applicationId: application.id });

    return {
      token: rawToken,
      candidate: buildCandidateEnvelope(state, application, session),
    };
  });
}

async function resolveCandidateSession(token) {
  const state = await readStore();
  const tokenHash = sha256(safeTrim(token));
  const session = state.candidateSessions.find((item) => item.tokenHash === tokenHash) || null;
  if (!session) return { state, session: null, application: null };
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    return { state, session: null, application: null };
  }

  const application = findApplicationById(state, session.applicationId);
  return { state, session, application };
}

export async function getCandidateMe(token) {
  const resolved = await resolveCandidateSession(token);
  if (!resolved.session || !resolved.application) return null;

  resolved.session.lastSeenAt = nowIso();
  await writeStore(resolved.state);

  const envelope = buildCandidateEnvelope(resolved.state, resolved.application, resolved.session);
  return {
    candidate: {
      applicationCode: envelope.applicationCode,
      studentFullName: envelope.studentFullName,
      schoolName: envelope.schoolName,
      grade: envelope.grade,
      sessionId: envelope.sessionId,
      examStatus: envelope.examStatus,
      resultStatus: envelope.resultStatus,
    },
    session: envelope.session,
    result: envelope.result,
  };
}

export async function startExam(token) {
  return mutateStore((state) => {
    const tokenHash = sha256(safeTrim(token));
    const candidateSession = state.candidateSessions.find((item) => item.tokenHash === tokenHash) || null;
    if (!candidateSession || new Date(candidateSession.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    const application = findApplicationById(state, candidateSession.applicationId);
    const session = getSessionById(application?.sessionId);
    if (!application || !session) {
      return null;
    }

    const examStatus = resolveExamStatus(state, application, session.id);
    if (!['available', 'in_progress'].includes(examStatus)) {
      throw new Error('exam_not_open');
    }

    const bank = getExamBankForGrade(application.grade);
    let attempt = state.examAttempts.find(
      (item) => item.applicationId === application.id && item.sessionId === session.id && item.status === 'in_progress',
    );

    if (!attempt) {
      attempt = {
        id: createId('attempt'),
        applicationId: application.id,
        sessionId: session.id,
        createdAt: nowIso(),
        startedAt: nowIso(),
        expiresAt: session.endsAt,
        lastAutosaveAt: null,
        submittedAt: null,
        answers: {},
        score: null,
        percentage: null,
        questionCount: bank.length,
        status: 'in_progress',
      };
      state.examAttempts.push(attempt);
      recordEvent(state, 'exam_started', { applicationId: application.id, attemptId: attempt.id });
    }

    return {
      attempt: getAttemptPublic(attempt),
      questions: stripAnswers(bank),
    };
  });
}

export async function saveExamProgress(token, answers) {
  return mutateStore((state) => {
    const tokenHash = sha256(safeTrim(token));
    const candidateSession = state.candidateSessions.find((item) => item.tokenHash === tokenHash) || null;
    if (!candidateSession || new Date(candidateSession.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    const attempt = state.examAttempts.find(
      (item) => item.applicationId === candidateSession.applicationId && item.status === 'in_progress',
    );
    if (!attempt) return null;

    attempt.answers = {
      ...(attempt.answers || {}),
      ...(answers && typeof answers === 'object' ? answers : {}),
    };
    attempt.lastAutosaveAt = nowIso();
    recordEvent(state, 'exam_autosaved', { attemptId: attempt.id });
    return { ok: true };
  });
}

export async function submitExam(token, answers) {
  return mutateStore((state) => {
    const tokenHash = sha256(safeTrim(token));
    const candidateSession = state.candidateSessions.find((item) => item.tokenHash === tokenHash) || null;
    if (!candidateSession || new Date(candidateSession.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    const application = findApplicationById(state, candidateSession.applicationId);
    if (!application) return null;

    const attempt = state.examAttempts.find(
      (item) => item.applicationId === application.id && item.status === 'in_progress',
    );
    if (!attempt) return null;

    const bank = getExamBankForGrade(application.grade);
    const mergedAnswers = {
      ...(attempt.answers || {}),
      ...(answers && typeof answers === 'object' ? answers : {}),
    };
    attempt.answers = mergedAnswers;
    attempt.status = 'submitted';
    attempt.submittedAt = nowIso();

    const correctCount = bank.reduce((total, question) => total + (mergedAnswers[question.id] === question.answer ? 1 : 0), 0);
    const answeredCount = Object.keys(mergedAnswers).length;
    const wrongCount = Math.max(0, answeredCount - correctCount);
    const unansweredCount = Math.max(0, bank.length - answeredCount);
    const percentage = Math.round((correctCount / bank.length) * 100);

    attempt.score = correctCount;
    attempt.percentage = percentage;
    attempt.correctCount = correctCount;
    attempt.wrongCount = wrongCount;
    attempt.unansweredCount = unansweredCount;

    const result = state.results.find((item) => item.applicationId === application.id);
    const nextResult = {
      id: result?.id || createId('res'),
      applicationId: application.id,
      attemptId: attempt.id,
      score: correctCount,
      percentage,
      correctCount,
      wrongCount,
      unansweredCount,
      scholarshipRate: computeScholarship(percentage),
      summary: buildResultSummary(percentage),
      status: 'awaiting_publication',
      publishedAt: result?.publishedAt || null,
      updatedAt: nowIso(),
      viewedAt: result?.viewedAt || null,
    };
    if (result) {
      Object.assign(result, nextResult);
    } else {
      state.results.push(nextResult);
    }

    recordEvent(state, 'exam_submitted', { applicationId: application.id, attemptId: attempt.id });
    return { examStatus: 'submitted' };
  });
}

function findApplicationByStudentId(state, studentId) {
  return state.applications.find((application) => application.studentId === studentId) || null;
}

export async function requestPasswordReset({ nationalId, birthYear, guardianPhone }) {
  const reset = await mutateStore((state) => {
    const normalizedNationalId = normalizeNationalId(nationalId);
    const normalizedBirthYear = normalizeDigits(birthYear).slice(0, 4);
    const normalizedGuardianPhone = normalizePhone(guardianPhone);
    if (!normalizedNationalId || normalizedBirthYear.length !== 4 || !normalizedGuardianPhone) return null;

    const nationalIdHash = sha256(normalizedNationalId);
    const student =
      state.students.find(
        (item) => item.nationalIdHash === nationalIdHash && safeTrim(item.birthYear) === normalizedBirthYear,
      ) || null;
    if (!student) return null;

    const application = findApplicationByStudentId(state, student.id);
    const guardian = application ? findGuardian(state, application.guardianId) : null;
    if (!application || !guardian) return null;
    if (normalizedGuardianPhone !== guardian.phone) {
      return null;
    }

    const credential = findCredentialByApplicationId(state, application.id);
    if (!credential) return null;

    const password = generatePassword();
    const hashed = scryptPassword(password);
    credential.passwordHash = hashed.hash;
    credential.passwordSalt = hashed.salt;
    credential.status = 'reset_pending';
    credential.updatedAt = nowIso();

    const messageJob = createMessageJob(state, application.id, 'password_reset_sms', {
      applicationCode: application.applicationCode,
      username: credential.username,
      password,
    });
    recordEvent(state, 'password_reset_requested', { applicationId: application.id });

    return {
      credentialStatus: credential.status,
      username: credential.username,
      password,
      messageJobId: messageJob.id,
    };
  });

  if (!reset) return null;

  const [job] = await dispatchMessageJobs([reset.messageJobId]);
  return {
    credentialStatus: mapCredentialStatusFromMessage('password_reset_sms', safeTrim(job?.status) || 'preview') || reset.credentialStatus,
    username: safeTrim(job?.status) === 'preview' ? reset.username : '',
    password: safeTrim(job?.status) === 'preview' ? reset.password : '',
    smsStatus: safeTrim(job?.status) || 'preview',
  };
}

export async function getResultByToken(token) {
  return mutateStore((state) => {
    const tokenHash = sha256(safeTrim(token));
    const candidateSession = state.candidateSessions.find((item) => item.tokenHash === tokenHash) || null;
    if (!candidateSession || new Date(candidateSession.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    const application = findApplicationById(state, candidateSession.applicationId);
    if (!application) return null;

    const result = state.results.find((item) => item.applicationId === application.id) || null;
    if (!result) {
      return {
        resultStatus: 'not_ready',
        result: null,
      };
    }

    if (result.status !== 'published') {
      return {
        resultStatus: result.status,
        result: null,
      };
    }

    result.viewedAt = result.viewedAt || nowIso();
    const priority = result.scholarshipRate >= 50 ? 'high' : 'normal';
    createSalesTask(state, application.id, priority, 'Sonuç görüntülendi. WhatsApp ile kayıt görüşmesi planla.');
    recordEvent(state, 'result_viewed', { applicationId: application.id, resultId: result.id });

    return {
      resultStatus: 'published',
      result: {
        scholarshipRate: result.scholarshipRate,
        percentage: result.percentage,
        score: result.score,
        correctCount: result.correctCount,
        wrongCount: result.wrongCount,
        unansweredCount: result.unansweredCount,
        summary: result.summary,
        publishedAt: result.publishedAt,
        viewedAt: result.viewedAt,
      },
    };
  });
}

export async function publishResults({ releaseAt }) {
  const published = await mutateStore((state) => {
    const nextReleaseAt = safeTrim(releaseAt) || resolveResultReleaseAt(state);
    state.publication.resultReleaseAt = nextReleaseAt;
    state.publication.resultsPublishedAt = nowIso();

    let publishedCount = 0;
    const messageJobIds = [];
    for (const result of state.results) {
      if (result.status === 'published') continue;
      result.status = 'published';
      result.publishedAt = state.publication.resultsPublishedAt;
      result.updatedAt = nowIso();
      publishedCount += 1;

      const application = findApplicationById(state, result.applicationId);
      const credential = application ? findCredentialByApplicationId(state, application.id) : null;
      const messageJob = createMessageJob(state, result.applicationId, 'result_sms', {
        applicationCode: application?.applicationCode || '',
        username: credential?.username || '',
        resultStatus: 'published',
      });
      messageJobIds.push(messageJob.id);
      createSalesTask(
        state,
        result.applicationId,
        result.scholarshipRate >= 50 ? 'high' : 'normal',
        'Sonuç SMS sonrası WhatsApp ilk teması planlandı.',
      );
    }

    recordEvent(state, 'results_published', { publishedCount, releaseAt: nextReleaseAt });
    return {
      publishedCount,
      releaseAt: nextReleaseAt,
      publishedAt: state.publication.resultsPublishedAt,
      messageJobIds,
    };
  });

  const smsJobs = await dispatchMessageJobs(published.messageJobIds);
  return {
    publishedCount: published.publishedCount,
    releaseAt: published.releaseAt,
    publishedAt: published.publishedAt,
    smsQueuedCount: published.messageJobIds.length,
    smsSentCount: smsJobs.filter((job) => ['wait', 'success'].includes(safeTrim(job?.status))).length,
    smsPreviewCount: smsJobs.filter((job) => safeTrim(job?.status) === 'preview').length,
    smsFailedCount: smsJobs.filter((job) => safeTrim(job?.status) === 'failed').length,
  };
}

export async function listApplications(filters = {}) {
  const state = await readStore();
  const schools = await readSchools();
  const schoolFilter = safeTrim(filters.schoolId);
  const resultStatusFilter = safeTrim(filters.resultStatus);
  const examStatusFilter = safeTrim(filters.examStatus);

  return state.applications
    .map((application) => {
      const student = findStudent(state, application.studentId);
      const guardian = findGuardian(state, application.guardianId);
      const credential = findCredentialByApplicationId(state, application.id);
      const session = getSessionById(application.sessionId);
      const resultStatus = resolveResultStatus(state, application.id);
      const examStatus = resolveExamStatus(state, application, application.sessionId);
      const applicationSms = getLatestMessageJob(state, application.id, 'application_sms');
      const resultSms = getLatestMessageJob(state, application.id, 'result_sms');

      return {
        applicationCode: application.applicationCode,
        schoolId: application.schoolId,
        schoolName: getSchoolDisplayName(schools, application.schoolId, application.schoolName),
        grade: application.grade,
        gradeLabel: getGradeLabel(application.grade),
        sessionId: application.sessionId,
        sessionLabel: session?.label || '',
        studentFullName: student?.fullName || '',
        guardianFullName: guardian?.fullName || '',
        guardianPhone: guardian?.phone || '',
        guardianEmail: guardian?.email || '',
        credentialStatus: credential?.status || 'missing',
        applicationSmsStatus: applicationSms?.status || 'missing',
        resultSmsStatus: resultSms?.status || 'missing',
        examStatus,
        resultStatus,
        createdAt: application.createdAt,
      };
    })
    .filter((item) => {
      if (schoolFilter && item.schoolId !== schoolFilter) return false;
      if (resultStatusFilter && item.resultStatus !== resultStatusFilter) return false;
      if (examStatusFilter && item.examStatus !== examStatusFilter) return false;
      return true;
    })
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function escapeCsv(value) {
  const stringValue = value == null ? '' : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export async function exportApplicationsCsv(filters = {}) {
  const items = await listApplications(filters);
  const headers = [
    'applicationCode',
    'schoolName',
    'gradeLabel',
    'sessionLabel',
    'studentFullName',
    'guardianFullName',
    'guardianPhone',
    'guardianEmail',
    'credentialStatus',
    'applicationSmsStatus',
    'resultSmsStatus',
    'examStatus',
    'resultStatus',
    'createdAt',
  ];
  const lines = [
    headers.join(','),
    ...items.map((item) => headers.map((header) => escapeCsv(item[header])).join(',')),
  ];
  return lines.join('\n');
}
