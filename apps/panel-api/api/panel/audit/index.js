import { requireRole } from '../../_lib/auth.js';
import { ROLES } from '../../_lib/constants.js';
import { query } from '../../_lib/db.js';
import {
  clampInt,
  handleRequest,
  methodGuard,
  ok,
  parseDateRange,
  parseFiltersFromQuery,
  safeTrim,
} from '../../_lib/http.js';

function buildFilters(req) {
  const filters = parseFiltersFromQuery(req.query?.filters);
  const params = [];
  const clauses = [];

  const actorId = safeTrim(filters.actor_id || filters.actorId);
  if (actorId) {
    params.push(actorId);
    clauses.push(`actor_id = $${params.length}`);
  }

  const actorType = safeTrim(filters.actor_type || filters.actorType).toUpperCase();
  if (actorType) {
    params.push(actorType);
    clauses.push(`actor_type = $${params.length}`);
  }

  const action = safeTrim(filters.action);
  if (action) {
    params.push(action);
    clauses.push(`action = $${params.length}`);
  }

  const targetType = safeTrim(filters.target_type || filters.targetType);
  if (targetType) {
    params.push(targetType);
    clauses.push(`target_type = $${params.length}`);
  }

  const range = parseDateRange(filters);
  if (range.from) {
    params.push(range.from);
    clauses.push(`created_at >= $${params.length}::timestamptz`);
  }
  if (range.to) {
    params.push(range.to);
    clauses.push(`created_at <= $${params.length}::timestamptz`);
  }

  return {
    whereClause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  };
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    methodGuard(req, ['GET']);
    await requireRole(req, [ROLES.SUPER_ADMIN, ROLES.OPERATIONS]);

    const page = clampInt(req.query?.page, 1, 100000, 1);
    const perPage = clampInt(req.query?.per_page, 1, 200, 50);
    const offset = (page - 1) * perPage;
    const { whereClause, params } = buildFilters(req);

    const rowsPromise = query(
      `
        SELECT
          id,
          seq,
          actor_type,
          actor_id,
          actor_role,
          action,
          target_type,
          target_id,
          request_id,
          ip_address,
          user_agent,
          metadata,
          prev_hash,
          entry_hash,
          created_at
        FROM audit_log_entries
        ${whereClause}
        ORDER BY seq DESC
        LIMIT $${params.length + 1}
        OFFSET $${params.length + 2}
      `,
      [...params, perPage, offset],
    );

    const countPromise = query(
      `
        SELECT COUNT(*)::int AS total
        FROM audit_log_entries
        ${whereClause}
      `,
      params,
    );

    const headPromise = query(
      `
        SELECT last_hash, updated_at
        FROM audit_log_chain_head
        WHERE id = 1
      `,
    );

    const [rowsResult, countResult, headResult] = await Promise.all([
      rowsPromise,
      countPromise,
      headPromise,
    ]);

    ok(res, {
      items: rowsResult.rows,
      page,
      per_page: perPage,
      total: Number(countResult.rows[0]?.total || 0),
      chain_head: {
        last_hash: headResult.rows[0]?.last_hash || null,
        updated_at: headResult.rows[0]?.updated_at || null,
      },
    });
  });
}
