import { requireRole } from '../../_lib/auth.js';
import { appendAuditLog, buildPanelActor, readRequestContext } from '../../_lib/auditLog.js';
import {
  APPLICATION_STATUS,
  CREDENTIALS_SMS_STATUS,
  EXAM_STATUS,
  RESULT_STATUS,
  ROLES,
  WA_RESULT_STATUS,
} from '../../_lib/constants.js';
import { query } from '../../_lib/db.js';
import {
  handleRequest,
  methodGuard,
  normalizeArrayFilter,
  parseDateRange,
  parseFiltersFromQuery,
  safeTrim,
} from '../../_lib/http.js';
import { decryptPii, isPrivilegedPiiRole, maskPiiName, maskPiiPhone } from '../../_lib/piiCrypto.js';
import { buildWhereClause } from '../../_lib/sql.js';

function escapeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const asString = String(value);
  if (!/[,"\n]/.test(asString)) return asString;
  return `"${asString.replaceAll('"', '""')}"`;
}

function buildFilterState(req) {
  const filters = parseFiltersFromQuery(req.query?.filters);
  const q = safeTrim(req.query?.q);
  const params = [];
  const clauses = [];

  const campaignCode = safeTrim(filters.campaign_code || filters.campaignCode);
  if (campaignCode) {
    params.push(campaignCode);
    clauses.push(`campaign_code = $${params.length}`);
  }

  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    clauses.push(
      `(LOWER(student_full_name) LIKE $${params.length} OR LOWER(parent_full_name) LIKE $${params.length} OR LOWER(parent_phone_e164) LIKE $${params.length} OR LOWER(application_no) LIKE $${params.length})`,
    );
  }

  const schoolNames = normalizeArrayFilter(filters.school_name || filters.school);
  if (schoolNames.length > 0) {
    params.push(schoolNames);
    clauses.push(`school_name = ANY($${params.length})`);
  }

  const grades = normalizeArrayFilter(filters.grade || filters.grades).map((item) => Number.parseInt(item, 10)).filter(Number.isFinite);
  if (grades.length > 0) {
    params.push(grades);
    clauses.push(`grade = ANY($${params.length})`);
  }

  const applicationStatuses = normalizeArrayFilter(filters.application_status, APPLICATION_STATUS);
  if (applicationStatuses.length > 0) {
    params.push(applicationStatuses);
    clauses.push(`application_status = ANY($${params.length})`);
  }

  const smsStatuses = normalizeArrayFilter(filters.credentials_sms_status, CREDENTIALS_SMS_STATUS);
  if (smsStatuses.length > 0) {
    params.push(smsStatuses);
    clauses.push(`credentials_sms_status = ANY($${params.length})`);
  }

  const examStatuses = normalizeArrayFilter(filters.exam_status, EXAM_STATUS);
  if (examStatuses.length > 0) {
    params.push(examStatuses);
    clauses.push(`exam_status = ANY($${params.length})`);
  }

  const resultStatuses = normalizeArrayFilter(filters.result_status, RESULT_STATUS);
  if (resultStatuses.length > 0) {
    params.push(resultStatuses);
    clauses.push(`result_status = ANY($${params.length})`);
  }

  const waStatuses = normalizeArrayFilter(filters.wa_result_status, WA_RESULT_STATUS);
  if (waStatuses.length > 0) {
    params.push(waStatuses);
    clauses.push(`wa_result_status = ANY($${params.length})`);
  }

  const range = parseDateRange(filters);
  if (range.from) {
    params.push(range.from);
    clauses.push(`updated_at >= $${params.length}::timestamptz`);
  }
  if (range.to) {
    params.push(range.to);
    clauses.push(`updated_at <= $${params.length}::timestamptz`);
  }

  return {
    whereClause: buildWhereClause(clauses),
    params,
  };
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    methodGuard(req, ['GET']);
    const identity = await requireRole(req, [ROLES.SUPER_ADMIN, ROLES.OPERATIONS, ROLES.READ_ONLY]);

    const { whereClause, params } = buildFilterState(req);
    const result = await query(
      `
        SELECT
          candidate_id,
          application_no,
          student_full_name AS student_full_name_legacy,
          student_full_name_enc,
          grade,
          school_name,
          parent_full_name AS parent_full_name_legacy,
          parent_full_name_enc,
          parent_phone_e164 AS parent_phone_e164_legacy,
          parent_phone_e164_enc,
          application_status,
          credentials_sms_status,
          first_login_at,
          exam_status,
          exam_started_at,
          exam_submitted_at,
          result_status,
          result_score,
          result_viewed_at,
          wa_result_status,
          last_error_code,
          updated_at
        FROM v_candidate_operations
        ${whereClause}
        ORDER BY updated_at DESC
        LIMIT 100000
      `,
      params,
    );

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

    const piiScopeFull = isPrivilegedPiiRole(identity.role);
    const mappedRows = await Promise.all(
      result.rows.map(async (row) => {
        const [studentFullNameRaw, parentFullNameRaw, parentPhoneRaw] = await Promise.all([
          decryptPii(row.student_full_name_enc, row.student_full_name_legacy),
          decryptPii(row.parent_full_name_enc, row.parent_full_name_legacy),
          decryptPii(row.parent_phone_e164_enc, row.parent_phone_e164_legacy),
        ]);
        return {
          ...row,
          student_full_name: piiScopeFull ? studentFullNameRaw : maskPiiName(studentFullNameRaw),
          parent_full_name: piiScopeFull ? parentFullNameRaw : maskPiiName(parentFullNameRaw),
          parent_phone_e164: piiScopeFull ? parentPhoneRaw : maskPiiPhone(parentPhoneRaw),
        };
      }),
    );

    const lines = [headers.join(',')];
    for (const row of mappedRows) {
      lines.push(headers.map((header) => escapeCsvCell(row[header])).join(','));
    }

    const now = new Date().toISOString().slice(0, 19).replaceAll(':', '-');
    res.status(200);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="candidate-operations-${now}.csv"`);
    res.end(lines.join('\n'));

    const ctx = readRequestContext(req);
    await appendAuditLog({
      ...buildPanelActor(identity),
      action: 'PANEL_CANDIDATES_EXPORT',
      targetType: 'CANDIDATE_EXPORT',
      targetId: now,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      metadata: {
        q: safeTrim(req.query?.q) || null,
        filters: parseFiltersFromQuery(req.query?.filters),
        rowCount: mappedRows.length,
        piiScope: piiScopeFull ? 'FULL' : 'MASKED',
      },
    });
  });
}
