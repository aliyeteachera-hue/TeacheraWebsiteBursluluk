import { requireRole } from '../../_lib/auth.js';
import { ROLES, UNVIEWED_RESULTS_COLUMNS, WA_RESULT_STATUS } from '../../_lib/constants.js';
import { query } from '../../_lib/db.js';
import { buildListResponse } from '../../_lib/listResponse.js';
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
  student_full_name: 'student_full_name',
  school_name: 'school_name',
  grade: 'grade',
  result_published_at: 'result_published_at',
  last_login_at: 'last_login_at',
  wa_result_status: 'wa_result_status',
  wa_last_sent_at: 'wa_last_sent_at',
};

function buildFilters(listQuery) {
  const { q, filters } = listQuery;
  const clauses = [];
  const params = [];

  const campaignCode = safeTrim(filters.campaign_code || filters.campaignCode);
  if (campaignCode) {
    params.push(campaignCode);
    clauses.push(`campaign_code = $${params.length}`);
  }

  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    clauses.push(`(LOWER(student_full_name) LIKE $${params.length} OR LOWER(school_name) LIKE $${params.length})`);
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

  const waStatuses = normalizeArrayFilter(filters.wa_result_status, WA_RESULT_STATUS);
  if (waStatuses.length > 0) {
    params.push(waStatuses);
    clauses.push(`wa_result_status = ANY($${params.length})`);
  }

  const range = parseDateRange(filters);
  if (range.from) {
    params.push(range.from);
    clauses.push(`result_published_at >= $${params.length}::timestamptz`);
  }
  if (range.to) {
    params.push(range.to);
    clauses.push(`result_published_at <= $${params.length}::timestamptz`);
  }

  return { whereClause: buildWhereClause(clauses), params };
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    methodGuard(req, ['GET']);
    await requireRole(req, [ROLES.SUPER_ADMIN, ROLES.OPERATIONS, ROLES.READ_ONLY]);

    const listQuery = parseListQuery(req, UNVIEWED_RESULTS_COLUMNS, 'result_published_at', 'desc');
    const { whereClause, params } = buildFilters(listQuery);
    const sortColumn = SORT_COLUMN_MAP[listQuery.sortBy] || SORT_COLUMN_MAP.result_published_at;
    const sortOrder = toSqlOrder(listQuery.sortOrder);

    params.push(listQuery.perPage);
    const limitIndex = params.length;
    params.push(listQuery.offset);
    const offsetIndex = params.length;

    const dataResult = await query(
      `
        SELECT
          candidate_id,
          student_full_name,
          school_name,
          grade,
          result_published_at,
          last_login_at,
          wa_result_status,
          wa_last_sent_at
        FROM v_unviewed_results
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
        FROM v_unviewed_results
        ${whereClause}
      `,
      params.slice(0, -2),
    );

    const summaryResult = await query(
      `
        SELECT
          COUNT(*)::int AS total_unviewed,
          COUNT(*) FILTER (WHERE wa_result_status IN ('FAILED', 'DLQ'))::int AS wa_problematic,
          COUNT(*) FILTER (WHERE wa_result_status IN ('DELIVERED', 'READ'))::int AS wa_reached
        FROM v_unviewed_results
        ${whereClause}
      `,
      params.slice(0, -2),
    );

    ok(
      res,
      buildListResponse({
        items: dataResult.rows,
        total: Number(countResult.rows[0]?.total || 0),
        page: listQuery.page,
        perPage: listQuery.perPage,
        summary: summaryResult.rows[0] || {},
      }),
    );
  });
}

