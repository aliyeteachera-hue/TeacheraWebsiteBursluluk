import { requireRole } from '../../_lib/auth.js';
import { appendAuditLog, buildPanelActor, readRequestContext } from '../../_lib/auditLog.js';
import {
  APPLICATION_STATUS,
  CANDIDATE_GRID_COLUMNS,
  CREDENTIALS_SMS_STATUS,
  EXAM_STATUS,
  RESULT_STATUS,
  ROLES,
  WA_RESULT_STATUS,
} from '../../_lib/constants.js';
import { query } from '../../_lib/db.js';
import { buildListResponse } from '../../_lib/listResponse.js';
import { decryptPii, isPrivilegedPiiRole, maskPiiName, maskPiiPhone } from '../../_lib/piiCrypto.js';
import {
  handleRequest,
  methodGuard,
  normalizeArrayFilter,
  ok,
  parseDateRange,
  parseListQuery,
  safeTrim,
} from '../../_lib/http.js';
import { buildWhereClause, toSqlOrder } from '../../_lib/sql.js';

const SORT_COLUMN_MAP = {
  candidate_id: 'candidate_id',
  application_no: 'application_no',
  student_full_name: 'student_full_name',
  grade: 'grade',
  school_name: 'school_name',
  parent_full_name: 'parent_full_name',
  parent_phone_e164: 'parent_phone_e164',
  application_status: 'application_status',
  credentials_sms_status: 'credentials_sms_status',
  first_login_at: 'first_login_at',
  exam_status: 'exam_status',
  exam_started_at: 'exam_started_at',
  exam_submitted_at: 'exam_submitted_at',
  result_status: 'result_status',
  result_score: 'result_score',
  result_viewed_at: 'result_viewed_at',
  wa_result_status: 'wa_result_status',
  last_error_code: 'last_error_code',
  updated_at: 'updated_at',
};

function appendInFilter(clauses, params, column, values) {
  if (!values || values.length === 0) return;
  params.push(values);
  clauses.push(`${column} = ANY($${params.length})`);
}

function addDateRangeFilter(clauses, params, column, range) {
  if (range.from) {
    params.push(range.from);
    clauses.push(`${column} >= $${params.length}::timestamptz`);
  }
  if (range.to) {
    params.push(range.to);
    clauses.push(`${column} <= $${params.length}::timestamptz`);
  }
}

function buildFilters(listQuery) {
  const { q, filters } = listQuery;
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

  const schools = normalizeArrayFilter(filters.school_name || filters.school);
  appendInFilter(clauses, params, 'school_name', schools);

  const grades = normalizeArrayFilter(filters.grade || filters.grades).map((item) => Number.parseInt(item, 10)).filter(Number.isFinite);
  appendInFilter(clauses, params, 'grade', grades);

  appendInFilter(
    clauses,
    params,
    'application_status',
    normalizeArrayFilter(filters.application_status, APPLICATION_STATUS),
  );
  appendInFilter(
    clauses,
    params,
    'credentials_sms_status',
    normalizeArrayFilter(filters.credentials_sms_status, CREDENTIALS_SMS_STATUS),
  );
  appendInFilter(clauses, params, 'exam_status', normalizeArrayFilter(filters.exam_status, EXAM_STATUS));
  appendInFilter(clauses, params, 'result_status', normalizeArrayFilter(filters.result_status, RESULT_STATUS));
  appendInFilter(clauses, params, 'wa_result_status', normalizeArrayFilter(filters.wa_result_status, WA_RESULT_STATUS));

  addDateRangeFilter(clauses, params, 'updated_at', parseDateRange(filters));

  return { whereClause: buildWhereClause(clauses), params };
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    methodGuard(req, ['GET']);
    const identity = await requireRole(req, [ROLES.SUPER_ADMIN, ROLES.OPERATIONS, ROLES.READ_ONLY]);

    const listQuery = parseListQuery(req, CANDIDATE_GRID_COLUMNS, 'updated_at', 'desc');
    const { whereClause, params } = buildFilters(listQuery);
    const sortColumn = SORT_COLUMN_MAP[listQuery.sortBy] || SORT_COLUMN_MAP.updated_at;
    const sortOrder = toSqlOrder(listQuery.sortOrder);

    params.push(listQuery.perPage);
    const limitIndex = params.length;
    params.push(listQuery.offset);
    const offsetIndex = params.length;

    const dataResult = await query(
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
        ORDER BY ${sortColumn} ${sortOrder} NULLS LAST
        LIMIT $${limitIndex}
        OFFSET $${offsetIndex}
      `,
      params,
    );

    const countResult = await query(
      `
        SELECT COUNT(*)::int AS total
        FROM v_candidate_operations
        ${whereClause}
      `,
      params.slice(0, -2),
    );

    const summaryResult = await query(
      `
        SELECT
          COUNT(*)::int AS total_candidates,
          COUNT(*) FILTER (WHERE exam_status IN ('SUBMITTED', 'TIMEOUT'))::int AS exam_completed,
          COUNT(*) FILTER (WHERE result_status = 'VIEWED')::int AS result_viewed,
          COUNT(*) FILTER (WHERE wa_result_status IN ('FAILED', 'DLQ'))::int AS wa_problematic
        FROM v_candidate_operations
        ${whereClause}
      `,
      params.slice(0, -2),
    );

    const piiScopeFull = isPrivilegedPiiRole(identity.role);
    const items = await Promise.all(
      dataResult.rows.map(async (row) => {
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

    ok(
      res,
      buildListResponse({
        items: items.map((item) => {
          const {
            student_full_name_legacy: _studentLegacy,
            student_full_name_enc: _studentEnc,
            parent_full_name_legacy: _parentLegacy,
            parent_full_name_enc: _parentEnc,
            parent_phone_e164_legacy: _phoneLegacy,
            parent_phone_e164_enc: _phoneEnc,
            ...rest
          } = item;
          return rest;
        }),
        total: Number(countResult.rows[0]?.total || 0),
        page: listQuery.page,
        perPage: listQuery.perPage,
        summary: summaryResult.rows[0] || {},
      }),
    );

    const ctx = readRequestContext(req);
    await appendAuditLog({
      ...buildPanelActor(identity),
      action: 'PANEL_CANDIDATES_READ',
      targetType: 'CANDIDATE_LIST',
      targetId: `${listQuery.page}:${listQuery.perPage}`,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      metadata: {
        q: listQuery.q || null,
        filters: listQuery.filters,
        returned: items.length,
        piiScope: piiScopeFull ? 'FULL' : 'MASKED',
      },
    });
  });
}
