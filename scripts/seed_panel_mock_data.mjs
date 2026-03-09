import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { EXAM_SESSIONS } from '../api/_lib/burslulukConfig.js';

const thisFile = fileURLToPath(import.meta.url);
const thisDir = dirname(thisFile);
const projectRoot = resolve(thisDir, '..');
const schoolsPath = resolve(projectRoot, 'api/_data/bursluluk-schools.json');

function toIso(value) {
  return new Date(value).toISOString();
}

function parseCountArg(value, fallback = 160) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function pickSessionIdForGrade(grade, index) {
  const eligible = EXAM_SESSIONS.filter((session) => session.grades.includes(grade));
  if (eligible.length === 0) return EXAM_SESSIONS[0]?.id || '';
  return eligible[index % eligible.length].id;
}

function buildInitialState(nowIso, campaignCode) {
  return {
    version: 1,
    meta: {
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    publication: {
      resultReleaseAt: nowIso,
      resultsPublishedAt: nowIso,
    },
    panelSettings: {
      campaignCode,
      pollIntervalSeconds: 15,
      templates: {
        credentialsSmsTemplate: 'CREDENTIALS_SMS',
        resultWaTemplate: 'WA_RESULT',
      },
      updatedAt: nowIso,
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

function createId(prefix, index) {
  return `${prefix}_${String(index).padStart(6, '0')}`;
}

function createPhone(index) {
  const tail = String(5300000000 + index).slice(-10);
  return `90${tail}`;
}

function createResultMetrics(index) {
  const percentage = 60 + (index % 41);
  const questionCount = 40;
  const score = Math.round((percentage / 100) * questionCount);
  const wrongCount = Math.max(0, Math.round(((100 - percentage) / 100) * questionCount) - 2);
  const unansweredCount = Math.max(0, questionCount - score - wrongCount);

  let scholarshipRate = 20;
  if (percentage >= 90) scholarshipRate = 60;
  else if (percentage >= 80) scholarshipRate = 50;
  else if (percentage >= 70) scholarshipRate = 40;

  return {
    percentage,
    score,
    questionCount,
    wrongCount,
    unansweredCount,
    scholarshipRate,
  };
}

function messageStatusByScenario(scenario) {
  switch (scenario) {
    case 0:
      return { status: 'success', retryCount: 0, errorCode: '' };
    case 1:
      return { status: 'wait', retryCount: 0, errorCode: '' };
    case 2:
      return { status: 'failed', retryCount: 5, errorCode: 'gateway_timeout' };
    case 3:
      return { status: 'queued', retryCount: 0, errorCode: '' };
    case 4:
      return { status: 'success', retryCount: 0, errorCode: '' };
    case 5:
      return { status: 'failed', retryCount: 2, errorCode: 'invalid_number' };
    case 6:
      return { status: 'read', retryCount: 0, errorCode: '' };
    default:
      return { status: 'failed', retryCount: 6, errorCode: 'provider_down' };
  }
}

function waStatusByScenario(scenario) {
  switch (scenario) {
    case 0:
      return { status: 'success', retryCount: 0, errorCode: '' };
    case 1:
      return { status: 'failed', retryCount: 5, errorCode: 'wa_provider_timeout' };
    case 6:
      return { status: 'read', retryCount: 0, errorCode: '' };
    default:
      return null;
  }
}

export async function seedPanelMockData({
  count = 160,
  storePath = process.env.BURSLULUK_STORE_PATH || '/tmp/teachera-bursluluk-store.json',
  campaignCode = process.env.DEFAULT_CAMPAIGN_CODE || '2026_BURSLULUK',
} = {}) {
  const normalizedCount = parseCountArg(count);
  const now = Date.now();
  const nowIso = toIso(now);
  const schoolsRaw = await readFile(schoolsPath, 'utf-8');
  const schools = JSON.parse(schoolsRaw);
  if (!Array.isArray(schools) || schools.length === 0) {
    throw new Error('No school data found in api/_data/bursluluk-schools.json');
  }

  const state = buildInitialState(nowIso, campaignCode);

  let submittedCount = 0;
  let publishedCount = 0;
  let viewedCount = 0;
  let failedNotificationCount = 0;
  let dlqCandidateCount = 0;

  for (let i = 0; i < normalizedCount; i += 1) {
    const rowIndex = i + 1;
    const scenario = i % 8;
    const grade = 1 + (i % 12);
    const school = schools[i % schools.length];
    const sessionId = pickSessionIdForGrade(grade, i);

    const createdAtMs = now - ((i % 24) * 60 * 60 * 1000 + (i % 60) * 60 * 1000);
    const createdAt = toIso(createdAtMs);
    const updatedAt = toIso(createdAtMs + 20 * 60 * 1000);

    const studentId = createId('stu', rowIndex);
    const guardianId = createId('grd', rowIndex);
    const applicationId = createId('app', rowIndex);
    const credentialId = createId('cred', rowIndex);
    const attemptId = createId('att', rowIndex);
    const resultId = createId('res', rowIndex);

    const studentFullName = `Mock Ogrenci ${rowIndex}`;
    const guardianFullName = `Veli ${rowIndex}`;
    const guardianPhone = createPhone(rowIndex);
    const applicationCode = `BRS-2026-${String(rowIndex).padStart(5, '0')}`;

    state.students.push({
      id: studentId,
      fullName: studentFullName,
      birthYear: String(2015 - (grade % 8)),
      nationalIdHash: `hash_${rowIndex}`,
      nationalIdLast4: String(1000 + (rowIndex % 9000)),
      createdAt,
    });

    state.guardians.push({
      id: guardianId,
      fullName: guardianFullName,
      phone: guardianPhone,
      email: `veli${rowIndex}@example.test`,
      createdAt,
    });

    state.applications.push({
      id: applicationId,
      applicationNo: applicationCode,
      applicationCode,
      studentId,
      guardianId,
      schoolId: school.id,
      schoolKey: school.id,
      schoolName: school.name,
      grade,
      branch: 'MERKEZ',
      sessionId,
      kvkkConsent: true,
      marketingConsent: true,
      guardianPhone,
      nationalIdHash: `hash_${rowIndex}`,
      studentNameNormalized: studentFullName.toLowerCase('tr-TR'),
      status: 'APPLIED',
      createdAt,
    });

    const smsStatus = messageStatusByScenario(scenario);

    state.examCredentials.push({
      id: credentialId,
      applicationId,
      username: `teachera${String(rowIndex).padStart(5, '0')}`,
      passwordHash: 'seed-hash',
      passwordSalt: 'seed-salt',
      status: smsStatus.status === 'failed' ? 'issue_failed' : 'issued',
      createdAt,
      updatedAt,
    });

    if (scenario !== 5) {
      state.eventLog.push({
        id: createId('evt_login', rowIndex),
        type: 'candidate_login',
        payload: {
          applicationId,
        },
        createdAt: toIso(createdAtMs + 30 * 60 * 1000),
      });
    }

    const smsJobId = createId('msg_sms', rowIndex);
    const smsSentAt = ['success', 'wait', 'read'].includes(smsStatus.status)
      ? toIso(createdAtMs + 10 * 60 * 1000)
      : null;

    state.messageJobs.push({
      id: smsJobId,
      applicationId,
      channel: 'SMS',
      type: 'application_sms',
      templateCode: 'CREDENTIALS_SMS',
      recipient: guardianPhone,
      payload: {
        source: 'seed_script',
      },
      status: smsStatus.status,
      retryCount: smsStatus.retryCount,
      nextRetryAt: smsStatus.status === 'failed' ? toIso(now + 15 * 60 * 1000) : null,
      providerMessageId: smsSentAt ? `sms_${rowIndex}` : null,
      sentAt: smsSentAt,
      deliveredAt: smsStatus.status === 'success' ? toIso(createdAtMs + 15 * 60 * 1000) : null,
      readAt: smsStatus.status === 'read' ? toIso(createdAtMs + 17 * 60 * 1000) : null,
      failureReason: smsStatus.errorCode,
      campaignCode,
      createdAt,
      updatedAt,
      assignedTo: smsStatus.retryCount >= 5 ? 'ops-oncall' : '',
      rootCauseNote: smsStatus.retryCount >= 5 ? 'Auto promoted to DLQ by retry limit' : '',
    });

    if (smsStatus.status === 'failed') {
      failedNotificationCount += 1;
      if (smsStatus.retryCount >= 5) {
        dlqCandidateCount += 1;
      }
    }

    if ([0, 1, 2, 3, 6].includes(scenario)) {
      const startedAtMs = createdAtMs + 45 * 60 * 1000;
      const submitted = [0, 1, 2, 6].includes(scenario);

      state.examAttempts.push({
        id: attemptId,
        applicationId,
        sessionId,
        createdAt: toIso(startedAtMs),
        startedAt: toIso(startedAtMs),
        expiresAt: submitted ? toIso(startedAtMs + 2 * 60 * 60 * 1000) : toIso(now + 2 * 60 * 60 * 1000),
        lastAutosaveAt: toIso(startedAtMs + 20 * 60 * 1000),
        submittedAt: submitted ? toIso(startedAtMs + 70 * 60 * 1000) : null,
        answers: {},
        score: submitted ? createResultMetrics(rowIndex).score : null,
        percentage: submitted ? createResultMetrics(rowIndex).percentage : null,
        questionCount: 40,
        status: submitted ? 'submitted' : 'in_progress',
        updatedAt: toIso(startedAtMs + 75 * 60 * 1000),
      });

      if (submitted) {
        submittedCount += 1;
      }
    }

    if (scenario === 7) {
      const startedAtMs = createdAtMs + 45 * 60 * 1000;
      state.examAttempts.push({
        id: attemptId,
        applicationId,
        sessionId,
        createdAt: toIso(startedAtMs),
        startedAt: toIso(startedAtMs),
        expiresAt: toIso(now - 60 * 60 * 1000),
        lastAutosaveAt: toIso(startedAtMs + 10 * 60 * 1000),
        submittedAt: null,
        answers: {},
        score: null,
        percentage: null,
        questionCount: 40,
        status: 'in_progress',
        updatedAt: toIso(startedAtMs + 15 * 60 * 1000),
      });
    }

    if ([0, 1, 2, 6].includes(scenario)) {
      const metrics = createResultMetrics(rowIndex);
      const resultPublishedAt = [0, 1, 6].includes(scenario) ? toIso(createdAtMs + 2 * 60 * 60 * 1000) : null;
      const viewedAt = [0, 6].includes(scenario) ? toIso(createdAtMs + 3 * 60 * 60 * 1000) : null;

      state.results.push({
        id: resultId,
        applicationId,
        attemptId,
        score: metrics.score,
        percentage: metrics.percentage,
        correctCount: metrics.score,
        wrongCount: metrics.wrongCount,
        unansweredCount: metrics.unansweredCount,
        scholarshipRate: metrics.scholarshipRate,
        summary: 'Seeded result summary',
        status: [0, 1, 6].includes(scenario) ? 'published' : 'awaiting_publication',
        publishedAt: resultPublishedAt,
        updatedAt: toIso(createdAtMs + 2 * 60 * 60 * 1000),
        viewedAt,
      });

      if (resultPublishedAt) {
        publishedCount += 1;
      }
      if (viewedAt) {
        viewedCount += 1;
      }

      const waStatus = waStatusByScenario(scenario);
      if (waStatus) {
        const waJobId = createId('msg_wa', rowIndex);
        const waSentAt = ['success', 'wait', 'read'].includes(waStatus.status)
          ? toIso(createdAtMs + 2.5 * 60 * 60 * 1000)
          : null;

        state.messageJobs.push({
          id: waJobId,
          applicationId,
          channel: 'WHATSAPP',
          type: 'wa_result',
          templateCode: 'WA_RESULT',
          recipient: guardianPhone,
          payload: {
            source: 'seed_script',
          },
          status: waStatus.status,
          retryCount: waStatus.retryCount,
          nextRetryAt: waStatus.status === 'failed' ? toIso(now + 20 * 60 * 1000) : null,
          providerMessageId: waSentAt ? `wa_${rowIndex}` : null,
          sentAt: waSentAt,
          deliveredAt: waStatus.status === 'success' ? toIso(createdAtMs + 2.7 * 60 * 60 * 1000) : null,
          readAt: waStatus.status === 'read' ? toIso(createdAtMs + 2.9 * 60 * 60 * 1000) : null,
          failureReason: waStatus.errorCode,
          campaignCode,
          createdAt: toIso(createdAtMs + 2.4 * 60 * 60 * 1000),
          updatedAt: toIso(createdAtMs + 2.9 * 60 * 60 * 1000),
          assignedTo: waStatus.retryCount >= 5 ? 'ops-oncall' : '',
          rootCauseNote: waStatus.retryCount >= 5 ? 'WA retry limit reached' : '',
        });

        if (waStatus.status === 'failed') {
          failedNotificationCount += 1;
          if (waStatus.retryCount >= 5) {
            dlqCandidateCount += 1;
          }
        }
      }
    }
  }

  state.meta.updatedAt = toIso(Date.now());
  state.panelSettings.updatedAt = state.meta.updatedAt;

  await mkdir(dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(state, null, 2)}\n`, 'utf-8');

  return {
    storePath,
    count: normalizedCount,
    applications: state.applications.length,
    examAttempts: state.examAttempts.length,
    results: state.results.length,
    notifications: state.messageJobs.length,
    submittedCount,
    publishedCount,
    viewedCount,
    failedNotificationCount,
    dlqCandidateCount,
  };
}

async function runFromCli() {
  const count = parseCountArg(process.argv[2], 160);
  const summary = await seedPanelMockData({ count });
  console.log('[seed] panel mock data generated');
  console.log(JSON.stringify(summary, null, 2));
}

if (resolve(process.argv[1] || '') === thisFile) {
  runFromCli().catch((error) => {
    console.error('[seed] failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
