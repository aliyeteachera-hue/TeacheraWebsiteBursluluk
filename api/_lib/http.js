import { HttpError, isHttpError } from './errors.js';

function sendRawJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export function sendJson(res, status, payload) {
  sendRawJson(res, status, payload);
}

export function ok(res, payload) {
  sendRawJson(res, 200, { ok: true, ...payload });
}

export function fail(res, status, code, message, details) {
  sendRawJson(res, status, {
    ok: false,
    error: code,
    message,
    ...(details ? { details } : {}),
  });
}

export function safeTrim(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function clampInt(value, min, max, fallback) {
  const num = Number.parseInt(String(value), 10);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

export function parseJsonSafe(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  if (typeof raw !== 'string') return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    const parsed = parseJsonSafe(req.body);
    return parsed;
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      resolve(parseJsonSafe(raw));
    });
    req.on('error', () => resolve(null));
  });
}

export function methodGuard(req, allowedMethods) {
  const method = safeTrim(req.method).toUpperCase();
  if (!allowedMethods.includes(method)) {
    throw new HttpError(405, 'Method is not allowed for this endpoint.', 'method_not_allowed');
  }
}

export function parseFiltersFromQuery(filtersRaw) {
  if (!filtersRaw) return {};
  if (typeof filtersRaw === 'object') return filtersRaw;
  const parsed = parseJsonSafe(filtersRaw);
  return parsed && typeof parsed === 'object' ? parsed : {};
}

export function parseDateRange(filters = {}) {
  const from = safeTrim(filters.from || filters.start_date || filters.date_from);
  const to = safeTrim(filters.to || filters.end_date || filters.date_to);
  return {
    from: from || null,
    to: to || null,
  };
}

export function parseListQuery(req, allowedSortKeys, defaultSortBy, defaultSortOrder = 'desc') {
  const page = clampInt(req.query?.page, 1, 100000, 1);
  const perPage = clampInt(req.query?.per_page, 1, 200, 25);
  const q = safeTrim(req.query?.q);
  const sortByCandidate = safeTrim(req.query?.sort_by);
  const sortOrderCandidate = safeTrim(req.query?.sort_order).toLowerCase();
  const filters = parseFiltersFromQuery(req.query?.filters);

  const sortBy = allowedSortKeys.includes(sortByCandidate) ? sortByCandidate : defaultSortBy;
  const sortOrder = sortOrderCandidate === 'asc' ? 'asc' : defaultSortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

  return {
    page,
    perPage,
    q,
    filters,
    sortBy,
    sortOrder,
    offset: (page - 1) * perPage,
  };
}

export function normalizeArrayFilter(value, allowedValues = null) {
  if (Array.isArray(value)) {
    const items = value.map((item) => safeTrim(item)).filter(Boolean);
    if (!allowedValues) return items;
    return items.filter((item) => allowedValues.includes(item));
  }

  if (typeof value === 'string') {
    const items = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (!allowedValues) return items;
    return items.filter((item) => allowedValues.includes(item));
  }

  return [];
}

export async function handleRequest(req, res, handler) {
  try {
    await handler();
  } catch (error) {
    if (isHttpError(error)) {
      fail(res, error.status, error.code, error.message, error.details);
      return;
    }

    console.error('[api_unhandled_error]', error);
    fail(res, 500, 'internal_error', 'Unexpected server error.');
  }
}

