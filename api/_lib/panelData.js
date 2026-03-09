import { randomBytes } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { SCHOOLS_DATA_PATH, STORE_PATH, getSessionById } from './burslulukConfig.js';
import { safeTrim } from './http.js';

const DEFAULT_CAMPAIGN_CODE = safeTrim(process.env.DEFAULT_CAMPAIGN_CODE) || '2026_BURSLULUK';
const DEFAULT_PER_PAGE = 25;
const MAX_PER_PAGE = 200;
const ROLES = ['SUPER_ADMIN', 'OPERATIONS', 'READ_ONLY'];
const RETRY_LIMIT = Number.parseInt(process.env.NOTIFICATION_RETRY_LIMIT || '5', 10) || 5;

const schoolsCache = {
  value: null,
};

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix) {
  return `${prefix}_${randomBytes(8).toString('hex')}`;
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function parseDateMs(value) {
  const time = new Date(value || '').getTime();
  return Number.isFinite(time) ? time : Number.NaN;
}

function toIsoOrNull(value) {
  if (!value) return null;
  const ms = parseDateMs(value);
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeRole(value) {
  const upper = safeTrim(value).toUpperCase();
  if (ROLES.includes(upper)) return upper;
  return 'SUPER_ADMIN';
}

export function resolveAdminRole(req) {
  return normalizeRole(req?.headers?.['x-admin-role']);
}

function ensureCanMutate(role) {
  if (normalizeRole(role) === 'READ_ONLY') {
    throw new Error('forbidden_read_only');
  }
}

async function ensureStoreDir() {
  await mkdir(dirname(STORE_PATH), { recursive: true });
}

function buildInitialState() {
  const createdAt = nowIso();
  return {
    version: 1,
    meta: {
      createdAt,
      updatedAt: createdAt,
    },
    publication: {
      resultReleaseAt: null,
      resultsPublishedAt: null,
    },
    panelSettings: {
      campaignCode: DEFAULT_CAMPAIGN_CODE,
      pollIntervalSeconds: 15,
      templates: {
        credentialsSmsTemplate: 'CREDENTIALS_SMS',
        resultWaTemplate: 'WA_RESULT',
      },
      updatedAt: createdAt,
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

async function readStore() {
  await ensureStoreDir();

  try {
    const raw = await readFile(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    const base = buildInitialState();
    return {
      ...base,
      ...parsed,
      meta: {
        ...base.meta,
        ...(parsed.meta || {}),
      },
      publication: {
        ...base.publication,
        ...(parsed.publication || {}),
      },
      panelSettings: {
        ...base.panelSettings,
        ...(parsed.panelSettings || {}),
        templates: {
          ...base.panelSettings.templates,
          ...(parsed.panelSettings?.templates || {}),
        },
      },
      applications: toArray(parsed.applications),
      students: toArray(parsed.students),
      guardians: toArray(parsed.guardians),
      examCredentials: toArray(parsed.examCredentials),
      candidateSessions: toArray(parsed.candidateSessions),
      examAttempts: toArray(parsed.examAttempts),
      results: toArray(parsed.results),
      messageJobs: toArray(parsed.messageJobs),
      salesTasks: toArray(parsed.salesTasks),
      eventLog: toArray(parsed.eventLog),
    };
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      const initial = buildInitialState();
      await writeStore(initial);
      return initial;
    }
    throw error;
  }
}

async function writeStore(state) {
  await ensureStoreDir();
  const next = {
    ...state,
    meta: {
      ...(state.meta || {}),
      updatedAt: nowIso(),
    },
  };
  const tempPath = `${STORE_PATH}.${randomBytes(6).toString('hex')}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(next, null, 2)}\n`, 'utf-8');
  await rename(tempPath, STORE_PATH);
  return next;
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

function byCreatedDesc(left, right) {
  return parseDateMs(right?.createdAt || right?.updatedAt) - parseDateMs(left?.createdAt || left?.updatedAt);
}

function buildMap(items, key) {
  return items.reduce((acc, item) => {
    const value = item?.[key];
    if (value) acc[value] = item;
    return acc;
  }, {});
}

function normalizeMessageStatus(rawStatus) {
  const status = safeTrim(rawStatus).toLowerCase();
  if (!status) return 'NOT_QUEUED';

  if (status === 'queued') return 'QUEUED';
  if (status === 'retrying') return 'RETRYING';
  if (status === 'wait') return 'SENT';
  if (status === 'success') return 'DELIVERED';
  if (status === 'delivered') return 'DELIVERED';
  if (status === 'read') return 'READ';
  if (status === 'failed') return 'FAILED';
  if (status === 'dlq') return 'DLQ';
  if (status === 'cancelled' || status === 'canceled' || status === 'closed') return 'CANCELLED';
  if (status === 'preview') return 'SENT';
  return status.toUpperCase();
}

function mapCredentialSmsStatus(credentialStatus, latestMessageStatus) {
  if (latestMessageStatus && latestMessageStatus !== 'NOT_QUEUED') {
    return latestMessageStatus;
  }

  const status = safeTrim(credentialStatus).toLowerCase();
  if (!status) return 'NOT_QUEUED';
  if (status.includes('queued') || status.includes('pending')) return 'QUEUED';
  if (status.includes('failed') || status.includes('issue_failed')) return 'FAILED';
  if (status.includes('preview')) return 'SENT';
  if (status.includes('issued') || status.includes('sent')) return 'DELIVERED';
  return 'NOT_QUEUED';
}

function mapExamStatus(application, attempt) {
  const now = Date.now();
  const session = getSessionById(application?.sessionId);

  if (attempt) {
    const status = safeTrim(attempt.status).toLowerCase();
    if (status === 'submitted') return 'SUBMITTED';
    if (status === 'in_progress') {
      const expiresAt = parseDateMs(attempt.expiresAt || session?.endsAt);
      if (!Number.isNaN(expiresAt) && now > expiresAt) return 'TIMEOUT';
      return 'STARTED';
    }
  }

  const start = parseDateMs(session?.startsAt);
  const end = parseDateMs(session?.endsAt);
  if (!Number.isNaN(start) && now < start) return 'WAITING';
  if (!Number.isNaN(start) && !Number.isNaN(end) && now >= start && now <= end) return 'OPEN';
  if (!Number.isNaN(end) && now > end) return 'ABANDONED';
  return 'WAITING';
}

function mapResultStatus(result) {
  if (!result) return 'NOT_READY';
  if (result.viewedAt) return 'VIEWED';
  if (safeTrim(result.status).toLowerCase() === 'published') return 'PUBLISHED';
  return 'NOT_READY';
}

function mapApplicationStatus(application) {
  const raw = safeTrim(application?.status).toUpperCase();
  if (!raw) return 'APPLIED';
  return raw;
}

function messageTemplateCode(job) {
  const explicit = safeTrim(job?.templateCode || job?.template_code).toUpperCase();
  if (explicit) return explicit;

  const type = safeTrim(job?.type).toLowerCase();
  if (type === 'application_sms') return 'CREDENTIALS_SMS';
  if (type === 'password_reset_sms') return 'PASSWORD_RESET_SMS';
  if (type === 'result_sms') return 'RESULT_SMS';
  if (type === 'wa_result') return 'WA_RESULT';
  return safeTrim(job?.type).toUpperCase() || 'MESSAGE';
}

function messageChannel(job) {
  const explicit = safeTrim(job?.channel).toUpperCase();
  if (explicit === 'SMS' || explicit === 'WHATSAPP') return explicit;

  const type = safeTrim(job?.type).toLowerCase();
  if (type.includes('wa')) return 'WHATSAPP';
  return 'SMS';
}

function getApplicationForStudent(applications, studentId) {
  return applications.find((application) => application.studentId === studentId) || null;
}

function computeUpdatedAt(values) {
  const valid = values
    .map((value) => parseDateMs(value))
    .filter((value) => !Number.isNaN(value));
  if (valid.length === 0) return nowIso();
  return new Date(Math.max(...valid)).toISOString();
}

function readQueryFilters(query) {
  const raw = query?.filters;
  if (!raw) return {};
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw;

  try {
    const parsed = JSON.parse(safeTrim(raw));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function parseListQuery(query, { allowedSortBy, defaultSortBy }) {
  const page = clamp(Number.parseInt(String(query?.page || '1'), 10) || 1, 1, 100000);
  const perPage = clamp(Number.parseInt(String(query?.per_page || DEFAULT_PER_PAGE), 10) || DEFAULT_PER_PAGE, 1, MAX_PER_PAGE);
  const sortByRaw = safeTrim(query?.sort_by);
  const sortBy = allowedSortBy.includes(sortByRaw) ? sortByRaw : defaultSortBy;
  const sortOrder = safeTrim(query?.sort_order).toLowerCase() === 'asc' ? 'asc' : 'desc';
  const q = safeTrim(query?.q).toLocaleLowerCase('tr-TR');
  const filters = readQueryFilters(query);

  return {
    page,
    perPage,
    sortBy,
    sortOrder,
    q,
    filters,
  };
}

function compareValues(left, right) {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;

  const leftNumber = Number(left);
  const rightNumber = Number(right);
  const leftIsNumber = Number.isFinite(leftNumber) && String(left).trim() !== '';
  const rightIsNumber = Number.isFinite(rightNumber) && String(right).trim() !== '';

  if (leftIsNumber && rightIsNumber) {
    return leftNumber - rightNumber;
  }

  return String(left).localeCompare(String(right), 'tr-TR', { sensitivity: 'base' });
}

function applySort(items, sortBy, sortOrder) {
  const sorted = [...items].sort((left, right) => compareValues(left?.[sortBy], right?.[sortBy]));
  if (sortOrder === 'desc') sorted.reverse();
  return sorted;
}

function applyPagination(items, page, perPage) {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return items.slice(start, end);
}

function buildListResponse(items, query, summary) {
  const sorted = applySort(items, query.sortBy, query.sortOrder);
  const paged = applyPagination(sorted, query.page, query.perPage);

  return {
    items: paged,
    total: sorted.length,
    page: query.page,
    per_page: query.perPage,
    summary,
  };
}

function toStatusSummary(items, key) {
  return items.reduce((acc, item) => {
    const status = safeTrim(item?.[key]) || 'UNKNOWN';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
}

function applyDateRangeFilter(items, key, filters) {
  const fromMs = parseDateMs(filters?.date_from || filters?.from || null);
  const toMs = parseDateMs(filters?.date_to || filters?.to || null);

  if (Number.isNaN(fromMs) && Number.isNaN(toMs)) return items;

  return items.filter((item) => {
    const valueMs = parseDateMs(item?.[key]);
    if (Number.isNaN(valueMs)) return false;
    if (!Number.isNaN(fromMs) && valueMs < fromMs) return false;
    if (!Number.isNaN(toMs) && valueMs > toMs) return false;
    return true;
  });
}

function buildCandidateRows(state, schools) {
  const studentById = buildMap(state.students, 'id');
  const guardianById = buildMap(state.guardians, 'id');
  const credentialByAppId = buildMap(state.examCredentials, 'applicationId');
  const schoolById = buildMap(schools, 'id');

  const eventByApplicationId = state.eventLog.reduce((acc, event) => {
    const applicationId = event?.payload?.applicationId;
    if (!applicationId) return acc;
    if (!acc[applicationId]) acc[applicationId] = [];
    acc[applicationId].push(event);
    return acc;
  }, {});

  return state.applications.map((application) => {
    const student = studentById[application.studentId] || null;
    const guardian = guardianById[application.guardianId] || null;
    const credential = credentialByAppId[application.id] || null;
    const attempts = state.examAttempts.filter((attempt) => attempt.applicationId === application.id).sort(byCreatedDesc);
    const attempt = attempts[0] || null;
    const result = state.results.find((item) => item.applicationId === application.id) || null;

    const appMessageJobs = state.messageJobs.filter((job) => job.applicationId === application.id).sort(byCreatedDesc);
    const latestSmsJob = appMessageJobs.find((job) => ['application_sms', 'password_reset_sms'].includes(safeTrim(job.type)));
    const latestWaJob = appMessageJobs.find((job) => safeTrim(job.type) === 'wa_result');
    const latestErrorJob = appMessageJobs.find((job) => normalizeMessageStatus(job.status) === 'FAILED');

    const loginEvents = toArray(eventByApplicationId[application.id]).filter((event) => safeTrim(event.type) === 'candidate_login');
    const firstLoginAt = loginEvents
      .map((event) => toIsoOrNull(event.createdAt))
      .filter(Boolean)
      .sort()[0] || null;

    const credentialsSmsStatus = mapCredentialSmsStatus(
      credential?.status,
      latestSmsJob ? normalizeMessageStatus(latestSmsJob.status) : 'NOT_QUEUED',
    );

    const waResultStatus = latestWaJob ? normalizeMessageStatus(latestWaJob.status) : 'NOT_QUEUED';

    const resultStatus = mapResultStatus(result);
    const resultViewedAt = toIsoOrNull(result?.viewedAt);
    const resultPublishedAt = toIsoOrNull(result?.publishedAt);

    const schoolName =
      schoolById[application.schoolId]?.name ||
      safeTrim(application.schoolName) ||
      'Bilinmeyen Okul';

    return {
      candidate_id: student?.id || application.id,
      application_no: safeTrim(application.applicationNo) || safeTrim(application.applicationCode) || application.id,
      student_full_name: safeTrim(student?.fullName) || 'Bilinmeyen Aday',
      grade: Number(application.grade) || null,
      school_id: safeTrim(application.schoolId) || null,
      school_name: schoolName,
      parent_full_name: safeTrim(guardian?.fullName) || '',
      parent_phone_e164: safeTrim(guardian?.phone) || '',
      application_status: mapApplicationStatus(application),
      credentials_sms_status: credentialsSmsStatus,
      first_login_at: firstLoginAt,
      exam_status: mapExamStatus(application, attempt),
      exam_started_at: toIsoOrNull(attempt?.startedAt),
      exam_submitted_at: toIsoOrNull(attempt?.submittedAt),
      result_status: resultStatus,
      result_score: result?.score ?? null,
      result_viewed_at: resultViewedAt,
      result_published_at: resultPublishedAt,
      wa_result_status: waResultStatus,
      wa_last_sent_at: toIsoOrNull(latestWaJob?.sentAt || latestWaJob?.updatedAt || latestWaJob?.createdAt),
      last_error_code: safeTrim(latestErrorJob?.failureReason || latestErrorJob?.errorCode) || null,
      updated_at: computeUpdatedAt([
        application.createdAt,
        credential?.updatedAt,
        attempt?.startedAt,
        attempt?.submittedAt,
        attempt?.updatedAt,
        result?.updatedAt,
        result?.viewedAt,
        latestSmsJob?.updatedAt,
        latestWaJob?.updatedAt,
      ]),
      created_at: toIsoOrNull(application.createdAt),
      application_id: application.id,
      campaign_code: DEFAULT_CAMPAIGN_CODE,
    };
  });
}

function buildNotificationRows(state) {
  const applicationById = buildMap(state.applications, 'id');
  const guardianById = buildMap(state.guardians, 'id');
  const studentById = buildMap(state.students, 'id');

  return state.messageJobs
    .map((job) => {
      const application = applicationById[job.applicationId] || null;
      const guardian = application ? guardianById[application.guardianId] || null : null;
      const student = application ? studentById[application.studentId] || null : null;
      const status = normalizeMessageStatus(job.status);
      const retryCount = Number.parseInt(String(job.retryCount ?? job.retry_count ?? 0), 10) || 0;

      return {
        job_id: job.id,
        channel: messageChannel(job),
        template_code: messageTemplateCode(job),
        recipient: safeTrim(job.recipient) || safeTrim(guardian?.phone) || '',
        status,
        retry_count: retryCount,
        next_retry_at: toIsoOrNull(job.nextRetryAt || job.next_retry_at),
        provider_message_id: safeTrim(job.providerMessageId || job.provider_message_id) || null,
        sent_at: toIsoOrNull(job.sentAt),
        delivered_at: toIsoOrNull(job.deliveredAt || (status === 'DELIVERED' || status === 'READ' ? job.sentAt : null)),
        read_at: toIsoOrNull(job.readAt || (status === 'READ' ? job.sentAt : null)),
        error_code: safeTrim(job.failureReason || job.errorCode || job.lastErrorCode) || null,
        campaign_code: safeTrim(job.campaignCode || job.campaign_code) || DEFAULT_CAMPAIGN_CODE,
        created_at: toIsoOrNull(job.createdAt),
        updated_at: toIsoOrNull(job.updatedAt),
        candidate_id: student?.id || null,
        application_id: application?.id || null,
      };
    })
    .sort(byCreatedDesc);
}

function buildUnviewedRows(candidateRows) {
  return candidateRows
    .filter((row) => row.result_published_at && !row.result_viewed_at)
    .map((row) => ({
      candidate_id: row.candidate_id,
      student_full_name: row.student_full_name,
      school_name: row.school_name,
      grade: row.grade,
      result_published_at: row.result_published_at,
      last_login_at: row.first_login_at,
      wa_result_status: row.wa_result_status,
      wa_last_sent_at: row.wa_last_sent_at,
      campaign_code: row.campaign_code,
      application_id: row.application_id,
      updated_at: row.updated_at,
    }))
    .sort((left, right) => parseDateMs(right.result_published_at) - parseDateMs(left.result_published_at));
}

function buildDlqRows(state, notificationRows) {
  const jobsById = buildMap(state.messageJobs, 'id');

  return notificationRows
    .filter((row) => row.status === 'FAILED' || row.status === 'DLQ' || row.retry_count >= RETRY_LIMIT)
    .map((row) => {
      const job = jobsById[row.job_id] || {};
      return {
        job_id: row.job_id,
        channel: row.channel,
        template_code: row.template_code,
        recipient: row.recipient,
        status: row.retry_count >= RETRY_LIMIT ? 'DLQ' : row.status,
        retry_count: row.retry_count,
        error_code: row.error_code || 'provider_failed',
        root_cause_note: safeTrim(job.rootCauseNote || job.root_cause_note) || '',
        assigned_to: safeTrim(job.assignedTo || job.assigned_to) || '',
        campaign_code: row.campaign_code,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    })
    .sort(byCreatedDesc);
}

function ratio(yes, total) {
  if (!total) return 0;
  return Number(((yes / total) * 100).toFixed(2));
}

function buildHourlyApplications(candidates) {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const buckets = new Map();

  for (let i = 23; i >= 0; i -= 1) {
    const slot = new Date(now - i * oneHour);
    slot.setMinutes(0, 0, 0);
    buckets.set(slot.toISOString(), 0);
  }

  for (const row of candidates) {
    const createdMs = parseDateMs(row.created_at);
    if (Number.isNaN(createdMs)) continue;

    const hour = new Date(createdMs);
    hour.setMinutes(0, 0, 0);
    const key = hour.toISOString();
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
  }

  return [...buckets.entries()].map(([hour_utc, count]) => ({ hour_utc, count }));
}

function buildChannelSuccess(notifications) {
  return ['SMS', 'WHATSAPP'].map((channel) => {
    const rows = notifications.filter((item) => item.channel === channel);
    const delivered = rows.filter((item) => ['DELIVERED', 'READ'].includes(item.status)).length;
    const sent = rows.filter((item) => ['SENT', 'DELIVERED', 'READ'].includes(item.status)).length;
    const failed = rows.filter((item) => ['FAILED', 'DLQ'].includes(item.status)).length;
    return {
      channel,
      total: rows.length,
      sent,
      delivered,
      failed,
      success_pct: ratio(delivered, rows.length),
    };
  });
}

function buildSchoolGradeDistribution(candidates) {
  const map = new Map();

  for (const row of candidates) {
    const key = `${row.school_name}::${row.grade}`;
    map.set(key, (map.get(key) || 0) + 1);
  }

  return [...map.entries()]
    .map(([key, count]) => {
      const [school_name, grade] = key.split('::');
      return {
        school_name,
        grade: Number(grade) || null,
        count,
      };
    })
    .sort((left, right) => right.count - left.count)
    .slice(0, 12);
}

function buildCriticalErrors(notifications) {
  const errors = notifications
    .filter((row) => row.error_code)
    .reduce((acc, row) => {
      const key = row.error_code;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

  return Object.entries(errors)
    .map(([error_code, count]) => ({ error_code, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);
}

function buildDashboardPayload(candidates, notifications, dlqRows) {
  const total = candidates.length;
  const publishedCount = candidates.filter((row) => ['PUBLISHED', 'VIEWED'].includes(row.result_status)).length;
  const viewedCount = candidates.filter((row) => row.result_status === 'VIEWED').length;

  const kpis = {
    total_applications: total,
    sms_success_pct: ratio(
      candidates.filter((row) => ['SENT', 'DELIVERED', 'READ'].includes(row.credentials_sms_status)).length,
      total,
    ),
    first_login_pct: ratio(candidates.filter((row) => Boolean(row.first_login_at)).length, total),
    exam_completion_pct: ratio(candidates.filter((row) => row.exam_status === 'SUBMITTED').length, total),
    result_viewed_pct: ratio(viewedCount, publishedCount || total),
    wa_reach_pct: ratio(
      candidates.filter((row) => ['SENT', 'DELIVERED', 'READ'].includes(row.wa_result_status)).length,
      publishedCount || total,
    ),
  };

  const now = Date.now();
  const last30Min = now - 30 * 60 * 1000;
  const last24h = now - 24 * 60 * 60 * 1000;

  const failedRows = notifications.filter((row) => ['FAILED', 'DLQ'].includes(row.status));

  return {
    generated_at: nowIso(),
    kpis,
    charts: {
      hourly_applications: buildHourlyApplications(candidates),
      notification_success_by_channel: buildChannelSuccess(notifications),
      school_grade_distribution: buildSchoolGradeDistribution(candidates),
    },
    operations: {
      dlq_job_count: dlqRows.length,
      critical_error_codes: buildCriticalErrors(notifications),
      failed_last_30_minutes: failedRows.filter((row) => parseDateMs(row.created_at) >= last30Min).length,
      failed_last_24_hours: failedRows.filter((row) => parseDateMs(row.created_at) >= last24h).length,
    },
  };
}

function filterByTextQuery(items, q, fields) {
  if (!q) return items;

  return items.filter((item) =>
    fields.some((field) =>
      safeTrim(item?.[field])
        .toLocaleLowerCase('tr-TR')
        .includes(q),
    ),
  );
}

function applyCandidatesFilters(items, filters) {
  let list = items;
  const schoolId = safeTrim(filters.school_id || filters.schoolId);
  const schoolName = safeTrim(filters.school_name || filters.schoolName).toLocaleLowerCase('tr-TR');
  const grade = Number.parseInt(String(filters.grade || ''), 10);
  const applicationStatus = safeTrim(filters.application_status || filters.applicationStatus).toUpperCase();
  const credentialsSmsStatus = safeTrim(filters.credentials_sms_status || filters.credentialsSmsStatus).toUpperCase();
  const examStatus = safeTrim(filters.exam_status || filters.examStatus).toUpperCase();
  const resultStatus = safeTrim(filters.result_status || filters.resultStatus).toUpperCase();
  const waStatus = safeTrim(filters.wa_result_status || filters.waResultStatus).toUpperCase();

  if (schoolId) list = list.filter((row) => safeTrim(row.school_id) === schoolId);
  if (schoolName) {
    list = list.filter((row) => safeTrim(row.school_name).toLocaleLowerCase('tr-TR').includes(schoolName));
  }
  if (Number.isFinite(grade)) list = list.filter((row) => Number(row.grade) === grade);
  if (applicationStatus) list = list.filter((row) => row.application_status === applicationStatus);
  if (credentialsSmsStatus) list = list.filter((row) => row.credentials_sms_status === credentialsSmsStatus);
  if (examStatus) list = list.filter((row) => row.exam_status === examStatus);
  if (resultStatus) list = list.filter((row) => row.result_status === resultStatus);
  if (waStatus) list = list.filter((row) => row.wa_result_status === waStatus);

  return applyDateRangeFilter(list, 'updated_at', filters);
}

function applyNotificationsFilters(items, filters) {
  let list = items;
  const channel = safeTrim(filters.channel).toUpperCase();
  const status = safeTrim(filters.status).toUpperCase();
  const templateCode = safeTrim(filters.template_code || filters.templateCode).toUpperCase();
  const campaignCode = safeTrim(filters.campaign_code || filters.campaignCode).toUpperCase();
  const errorCode = safeTrim(filters.error_code || filters.errorCode).toLowerCase();

  if (channel) list = list.filter((row) => row.channel === channel);
  if (status) list = list.filter((row) => row.status === status);
  if (templateCode) list = list.filter((row) => row.template_code === templateCode);
  if (campaignCode) list = list.filter((row) => safeTrim(row.campaign_code).toUpperCase() === campaignCode);
  if (errorCode) {
    list = list.filter((row) => safeTrim(row.error_code).toLocaleLowerCase('tr-TR').includes(errorCode));
  }

  return applyDateRangeFilter(list, 'created_at', filters);
}

function applyUnviewedFilters(items, filters) {
  let list = items;
  const schoolName = safeTrim(filters.school_name || filters.schoolName).toLocaleLowerCase('tr-TR');
  const grade = Number.parseInt(String(filters.grade || ''), 10);
  const waStatus = safeTrim(filters.wa_result_status || filters.waResultStatus).toUpperCase();

  if (schoolName) {
    list = list.filter((row) => safeTrim(row.school_name).toLocaleLowerCase('tr-TR').includes(schoolName));
  }
  if (Number.isFinite(grade)) list = list.filter((row) => Number(row.grade) === grade);
  if (waStatus) list = list.filter((row) => row.wa_result_status === waStatus);

  return applyDateRangeFilter(list, 'result_published_at', filters);
}

function applyDlqFilters(items, filters) {
  let list = items;
  const channel = safeTrim(filters.channel).toUpperCase();
  const campaignCode = safeTrim(filters.campaign_code || filters.campaignCode).toUpperCase();
  const errorCode = safeTrim(filters.error_code || filters.errorCode).toLowerCase();
  const retryCount = Number.parseInt(String(filters.retry_count || ''), 10);
  const status = safeTrim(filters.status).toUpperCase();

  if (channel) list = list.filter((row) => row.channel === channel);
  if (campaignCode) list = list.filter((row) => safeTrim(row.campaign_code).toUpperCase() === campaignCode);
  if (errorCode) {
    list = list.filter((row) => safeTrim(row.error_code).toLocaleLowerCase('tr-TR').includes(errorCode));
  }
  if (Number.isFinite(retryCount)) list = list.filter((row) => Number(row.retry_count) === retryCount);
  if (status) list = list.filter((row) => row.status === status);

  return applyDateRangeFilter(list, 'updated_at', filters);
}

function escapeCsv(value) {
  const stringValue = value == null ? '' : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export async function getDashboardData() {
  const [state, schools] = await Promise.all([readStore(), readSchools()]);
  const candidates = buildCandidateRows(state, schools);
  const notifications = buildNotificationRows(state);
  const dlqRows = buildDlqRows(state, notifications);
  return buildDashboardPayload(candidates, notifications, dlqRows);
}

export async function listCandidateOperations(query = {}) {
  const [state, schools] = await Promise.all([readStore(), readSchools()]);
  const allowedSortBy = [
    'candidate_id',
    'application_no',
    'student_full_name',
    'grade',
    'school_name',
    'parent_full_name',
    'application_status',
    'credentials_sms_status',
    'first_login_at',
    'exam_status',
    'exam_started_at',
    'exam_submitted_at',
    'result_status',
    'result_score',
    'result_viewed_at',
    'wa_result_status',
    'updated_at',
  ];

  const parsed = parseListQuery(query, {
    allowedSortBy,
    defaultSortBy: 'updated_at',
  });

  let rows = buildCandidateRows(state, schools);
  rows = applyCandidatesFilters(rows, parsed.filters);
  rows = filterByTextQuery(rows, parsed.q, [
    'application_no',
    'student_full_name',
    'school_name',
    'parent_full_name',
    'parent_phone_e164',
    'last_error_code',
  ]);

  return buildListResponse(rows, parsed, {
    statuses: toStatusSummary(rows, 'application_status'),
    exam_statuses: toStatusSummary(rows, 'exam_status'),
    result_statuses: toStatusSummary(rows, 'result_status'),
  });
}

export async function exportCandidateOperationsCsv(query = {}) {
  const [state, schools] = await Promise.all([readStore(), readSchools()]);
  const parsed = parseListQuery(query, {
    allowedSortBy: ['updated_at', 'application_no', 'student_full_name', 'school_name', 'grade'],
    defaultSortBy: 'updated_at',
  });

  let rows = buildCandidateRows(state, schools);
  rows = applyCandidatesFilters(rows, parsed.filters);
  rows = filterByTextQuery(rows, parsed.q, [
    'application_no',
    'student_full_name',
    'school_name',
    'parent_full_name',
    'parent_phone_e164',
  ]);

  rows = applySort(rows, parsed.sortBy, parsed.sortOrder);

  const headers = [
    'candidate_id',
    'application_no',
    'student_full_name',
    'grade',
    'school_name',
    'parent_full_name',
    'parent_phone_e164',
    'application_status',
    'credentials_sms_status',
    'first_login_at',
    'exam_status',
    'exam_started_at',
    'exam_submitted_at',
    'result_status',
    'result_score',
    'result_viewed_at',
    'wa_result_status',
    'last_error_code',
    'updated_at',
  ];

  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(',')),
  ];

  return lines.join('\n');
}

export async function listNotifications(query = {}) {
  const state = await readStore();
  const allowedSortBy = [
    'job_id',
    'channel',
    'template_code',
    'status',
    'retry_count',
    'next_retry_at',
    'sent_at',
    'delivered_at',
    'read_at',
    'error_code',
    'created_at',
  ];

  const parsed = parseListQuery(query, {
    allowedSortBy,
    defaultSortBy: 'created_at',
  });

  let rows = buildNotificationRows(state);
  rows = applyNotificationsFilters(rows, parsed.filters);
  rows = filterByTextQuery(rows, parsed.q, ['job_id', 'template_code', 'recipient', 'provider_message_id', 'error_code']);

  return buildListResponse(rows, parsed, {
    statuses: toStatusSummary(rows, 'status'),
    channels: toStatusSummary(rows, 'channel'),
  });
}

export async function listUnviewedResults(query = {}) {
  const [state, schools] = await Promise.all([readStore(), readSchools()]);
  const allowedSortBy = [
    'candidate_id',
    'student_full_name',
    'school_name',
    'grade',
    'result_published_at',
    'last_login_at',
    'wa_result_status',
    'wa_last_sent_at',
  ];

  const parsed = parseListQuery(query, {
    allowedSortBy,
    defaultSortBy: 'result_published_at',
  });

  const candidates = buildCandidateRows(state, schools);
  let rows = buildUnviewedRows(candidates);
  rows = applyUnviewedFilters(rows, parsed.filters);
  rows = filterByTextQuery(rows, parsed.q, ['student_full_name', 'school_name', 'candidate_id']);

  return buildListResponse(rows, parsed, {
    wa_statuses: toStatusSummary(rows, 'wa_result_status'),
  });
}

export async function listDlqJobs(query = {}) {
  const state = await readStore();
  const allowedSortBy = [
    'job_id',
    'channel',
    'template_code',
    'status',
    'retry_count',
    'error_code',
    'assigned_to',
    'updated_at',
    'created_at',
  ];

  const parsed = parseListQuery(query, {
    allowedSortBy,
    defaultSortBy: 'updated_at',
  });

  const notifications = buildNotificationRows(state);
  let rows = buildDlqRows(state, notifications);
  rows = applyDlqFilters(rows, parsed.filters);
  rows = filterByTextQuery(rows, parsed.q, ['job_id', 'recipient', 'error_code', 'assigned_to', 'root_cause_note']);

  return buildListResponse(rows, parsed, {
    statuses: toStatusSummary(rows, 'status'),
    channels: toStatusSummary(rows, 'channel'),
  });
}

function findApplicationsByCandidateIds(state, candidateIds) {
  const studentById = buildMap(state.students, 'id');
  const candidateSet = new Set(toArray(candidateIds).map((id) => safeTrim(id)).filter(Boolean));
  if (candidateSet.size === 0) return [];

  return state.applications.filter((application) => {
    const student = studentById[application.studentId];
    return student && candidateSet.has(student.id);
  });
}

function queueJob(state, {
  application,
  channel,
  templateCode,
  recipient,
  payload = {},
  status = 'queued',
}) {
  const type = channel === 'WHATSAPP' ? 'wa_result' : 'application_sms';
  const createdAt = nowIso();

  const job = {
    id: createId('msg'),
    applicationId: application.id,
    channel,
    type,
    templateCode,
    recipient,
    payload,
    status,
    retryCount: 0,
    createdAt,
    updatedAt: createdAt,
  };

  state.messageJobs.push(job);
  return job;
}

function recordAdminEvent(state, type, payload) {
  state.eventLog.push({
    id: createId('evt'),
    type,
    payload,
    createdAt: nowIso(),
  });
}

export async function applyCandidatesAction({ action, candidateIds, note, role }) {
  ensureCanMutate(role);

  const normalizedAction = safeTrim(action).toLowerCase();
  if (!normalizedAction) throw new Error('missing_action');

  return mutateStore((state) => {
    const applications = findApplicationsByCandidateIds(state, candidateIds);
    if (applications.length === 0) {
      return { affected: 0, queued_jobs: 0 };
    }

    let queuedJobs = 0;

    if (normalizedAction === 'sms_retry') {
      for (const application of applications) {
        const guardian = state.guardians.find((item) => item.id === application.guardianId) || null;
        queueJob(state, {
          application,
          channel: 'SMS',
          templateCode: 'CREDENTIALS_SMS',
          recipient: safeTrim(guardian?.phone),
          payload: {
            applicationCode: application.applicationCode,
            source: 'panel_sms_retry',
          },
        });
        queuedJobs += 1;
      }
    } else if (normalizedAction === 'wa_send') {
      for (const application of applications) {
        const guardian = state.guardians.find((item) => item.id === application.guardianId) || null;
        queueJob(state, {
          application,
          channel: 'WHATSAPP',
          templateCode: 'WA_RESULT',
          recipient: safeTrim(guardian?.phone),
          payload: {
            applicationCode: application.applicationCode,
            source: 'panel_wa_send',
          },
        });
        queuedJobs += 1;
      }
    } else if (normalizedAction === 'add_note') {
      const text = safeTrim(note);
      if (!text) throw new Error('missing_note');
      for (const application of applications) {
        recordAdminEvent(state, 'admin_candidate_note', {
          applicationId: application.id,
          note: text,
        });
      }
    } else {
      throw new Error('unsupported_action');
    }

    return {
      affected: applications.length,
      queued_jobs: queuedJobs,
    };
  });
}

export async function applyNotificationsAction({ action, jobIds, role }) {
  ensureCanMutate(role);

  const normalizedAction = safeTrim(action).toLowerCase();
  if (!normalizedAction) throw new Error('missing_action');

  return mutateStore((state) => {
    const selectedIds = new Set(toArray(jobIds).map((id) => safeTrim(id)).filter(Boolean));
    let affected = 0;

    for (const job of state.messageJobs) {
      if (!selectedIds.has(job.id)) continue;

      if (normalizedAction === 'retry') {
        job.retryCount = Number.parseInt(String(job.retryCount || 0), 10) + 1;
        job.status = 'queued';
        job.nextRetryAt = null;
        job.failureReason = '';
      } else if (normalizedAction === 'cancel') {
        job.status = 'cancelled';
      } else if (normalizedAction === 'requeue') {
        job.status = 'queued';
        job.nextRetryAt = null;
      } else {
        throw new Error('unsupported_action');
      }

      job.updatedAt = nowIso();
      affected += 1;
    }

    return { affected };
  });
}

export async function applyUnviewedResultsAction({ action, candidateIds, role }) {
  ensureCanMutate(role);

  const normalizedAction = safeTrim(action).toLowerCase();
  if (normalizedAction !== 'send_wa') {
    throw new Error('unsupported_action');
  }

  return mutateStore((state) => {
    const applications = findApplicationsByCandidateIds(state, candidateIds);
    let queuedJobs = 0;

    for (const application of applications) {
      const result = state.results.find((item) => item.applicationId === application.id) || null;
      if (!result || !result.publishedAt || result.viewedAt) continue;

      const guardian = state.guardians.find((item) => item.id === application.guardianId) || null;
      queueJob(state, {
        application,
        channel: 'WHATSAPP',
        templateCode: 'WA_RESULT',
        recipient: safeTrim(guardian?.phone),
        payload: {
          applicationCode: application.applicationCode,
          source: 'panel_unviewed_wa_send',
        },
      });
      queuedJobs += 1;
    }

    return {
      affected: applications.length,
      queued_jobs: queuedJobs,
    };
  });
}

export async function applyDlqAction({ action, jobIds, role, rootCauseNote, assignedTo }) {
  ensureCanMutate(role);

  const normalizedAction = safeTrim(action).toLowerCase();
  if (!normalizedAction) throw new Error('missing_action');

  return mutateStore((state) => {
    const selectedIds = new Set(toArray(jobIds).map((id) => safeTrim(id)).filter(Boolean));
    let affected = 0;

    for (const job of state.messageJobs) {
      if (!selectedIds.has(job.id)) continue;

      if (normalizedAction === 'retry') {
        job.retryCount = Number.parseInt(String(job.retryCount || 0), 10) + 1;
        job.status = 'queued';
        job.failureReason = '';
        job.nextRetryAt = null;
      } else if (normalizedAction === 'assign') {
        job.assignedTo = safeTrim(assignedTo);
      } else if (normalizedAction === 'close') {
        const note = safeTrim(rootCauseNote);
        if (!note) throw new Error('missing_root_cause_note');
        job.status = 'closed';
        job.rootCauseNote = note;
      } else {
        throw new Error('unsupported_action');
      }

      job.updatedAt = nowIso();
      affected += 1;
    }

    return { affected };
  });
}

function buildSettingsPayload(state, role, schools) {
  const settings = state.panelSettings || {};
  const templates = settings.templates || {};

  return {
    campaign_code: safeTrim(settings.campaignCode) || DEFAULT_CAMPAIGN_CODE,
    poll_interval_seconds: clamp(Number.parseInt(String(settings.pollIntervalSeconds || 15), 10) || 15, 5, 300),
    result_release_at: toIsoOrNull(state.publication?.resultReleaseAt),
    message_templates: {
      credentials_sms_template: safeTrim(templates.credentialsSmsTemplate) || 'CREDENTIALS_SMS',
      result_wa_template: safeTrim(templates.resultWaTemplate) || 'WA_RESULT',
    },
    school_count: schools.length,
    available_roles: ROLES,
    user_role: normalizeRole(role),
    updated_at: toIsoOrNull(settings.updatedAt || state.meta?.updatedAt) || nowIso(),
  };
}

export async function getPanelSettings({ role }) {
  const [state, schools] = await Promise.all([readStore(), readSchools()]);
  return buildSettingsPayload(state, role, schools);
}

export async function updatePanelSettings({ role, payload }) {
  if (normalizeRole(role) !== 'SUPER_ADMIN') {
    throw new Error('forbidden_role');
  }

  await mutateStore((state) => {
    const next = {
      ...(state.panelSettings || {}),
      templates: {
        ...((state.panelSettings && state.panelSettings.templates) || {}),
      },
    };

    const campaignCode = safeTrim(payload?.campaign_code || payload?.campaignCode);
    if (campaignCode) next.campaignCode = campaignCode;

    const pollInterval = Number.parseInt(String(payload?.poll_interval_seconds ?? payload?.pollIntervalSeconds ?? ''), 10);
    if (Number.isFinite(pollInterval)) {
      next.pollIntervalSeconds = clamp(pollInterval, 5, 300);
    }

    const releaseAt = safeTrim(payload?.result_release_at || payload?.resultReleaseAt);
    if (releaseAt) {
      state.publication = {
        ...(state.publication || {}),
        resultReleaseAt: releaseAt,
      };
    }

    const templates = payload?.message_templates || payload?.messageTemplates || {};
    const credentialsTemplate = safeTrim(templates.credentials_sms_template || templates.credentialsSmsTemplate);
    const waTemplate = safeTrim(templates.result_wa_template || templates.resultWaTemplate);
    if (credentialsTemplate) next.templates.credentialsSmsTemplate = credentialsTemplate;
    if (waTemplate) next.templates.resultWaTemplate = waTemplate;

    next.updatedAt = nowIso();
    state.panelSettings = next;
  });

  return getPanelSettings({ role });
}
