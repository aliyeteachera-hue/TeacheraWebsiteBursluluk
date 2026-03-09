function send(res, status, body, contentType) {
  res.status(status).setHeader('Content-Type', contentType);
  res.end(body);
}

export function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload), 'application/json; charset=utf-8');
}

export function sendText(res, status, body) {
  send(res, status, body, 'text/plain; charset=utf-8');
}

export function safeTrim(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeDigits(value) {
  if (typeof value === 'number' || typeof value === 'bigint') {
    return String(value).replace(/\D+/g, '');
  }
  return safeTrim(value).replace(/\D+/g, '');
}

export function normalizePhone(value) {
  const digits = normalizeDigits(value);
  if (digits.startsWith('90') && digits.length === 12) return digits;
  if (digits.length === 10) return `90${digits}`;
  return digits;
}

export function parseAllowedOrigins(envKey) {
  const raw = process.env[envKey] || process.env.FORMS_ALLOWED_ORIGINS || '';
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function applyCors(req, res, envKey = 'BURSLULUK_ALLOWED_ORIGINS') {
  const allowedOrigins = parseAllowedOrigins(envKey);
  const origin = safeTrim(req.headers.origin);

  if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
    sendJson(res, 403, { ok: false, error: 'origin_not_allowed' });
    return false;
  }

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Admin-Key');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return false;
  }

  return true;
}

export async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        resolve(null);
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

export function requireMethod(req, res, method) {
  if (req.method !== method) {
    sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    return false;
  }
  return true;
}

export function readToken(req, body = null) {
  const authorization = safeTrim(req.headers.authorization);
  if (authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }

  const fromQuery = safeTrim(req.query?.token);
  if (fromQuery) return fromQuery;

  return safeTrim(body?.token);
}

export function requireAdmin(req, res) {
  const configuredKey = safeTrim(process.env.BURSLULUK_ADMIN_KEY);
  if (!configuredKey) return true;

  const providedKey = safeTrim(req.headers['x-admin-key']);
  if (providedKey && providedKey === configuredKey) return true;

  sendJson(res, 401, { ok: false, error: 'admin_auth_required' });
  return false;
}
