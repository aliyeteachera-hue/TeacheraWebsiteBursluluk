const DEFAULT_UPSTREAM_TEMPLATE = 'https://formsubmit.co/ajax/{to}';
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function sendJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function safeTrim(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseAllowedOrigins() {
  const raw = process.env.FORMS_ALLOWED_ORIGINS;
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin, allowedOrigins) {
  if (!origin) return true;
  if (allowedOrigins.length === 0) return true;
  return allowedOrigins.includes(origin);
}

function resolveUpstreamEndpoint(to) {
  const template = safeTrim(process.env.FORMS_UPSTREAM_TEMPLATE || process.env.FORMS_UPSTREAM) || DEFAULT_UPSTREAM_TEMPLATE;

  if (template.includes('{{to}}')) {
    return template.replaceAll('{{to}}', encodeURIComponent(to));
  }
  if (template.includes('{to}')) {
    return template.replaceAll('{to}', encodeURIComponent(to));
  }
  if (template.includes(':to')) {
    return template.replaceAll(':to', encodeURIComponent(to));
  }

  return template;
}

function sanitizeFields(rawFields) {
  if (!rawFields || typeof rawFields !== 'object' || Array.isArray(rawFields)) return {};
  const entries = Object.entries(rawFields);
  const sanitized = {};

  for (const [key, value] of entries) {
    const normalizedKey = safeTrim(key).slice(0, 80);
    if (!normalizedKey) continue;
    const normalizedValue = typeof value === 'string' ? value.trim().slice(0, 1200) : String(value ?? '').slice(0, 1200);
    sanitized[normalizedKey] = normalizedValue;
  }

  return sanitized;
}

async function verifyTurnstileToken(token, remoteIp) {
  const secret = safeTrim(process.env.TURNSTILE_SECRET_KEY);
  if (!secret) return { enabled: false, ok: true };

  const responseToken = safeTrim(token);
  if (!responseToken) return { enabled: true, ok: false, reason: 'missing_token' };

  const body = new URLSearchParams({
    secret,
    response: responseToken,
  });

  if (remoteIp) {
    body.set('remoteip', remoteIp);
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      return { enabled: true, ok: false, reason: `turnstile_status_${response.status}` };
    }

    const data = await response.json();
    if (!data || data.success !== true) {
      const firstCode = Array.isArray(data?.['error-codes']) ? data['error-codes'][0] : 'validation_failed';
      return { enabled: true, ok: false, reason: String(firstCode) };
    }

    return { enabled: true, ok: true };
  } catch {
    return { enabled: true, ok: false, reason: 'turnstile_network_error' };
  }
}

async function parseBody(req) {
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

export default async function handler(req, res) {
  const allowedOrigins = parseAllowedOrigins();
  const origin = safeTrim(req.headers.origin);

  if (!isOriginAllowed(origin, allowedOrigins)) {
    sendJson(res, 403, { ok: false, error: 'origin_not_allowed' });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    return;
  }

  const body = await parseBody(req);
  if (!body || typeof body !== 'object') {
    sendJson(res, 400, { ok: false, error: 'invalid_json' });
    return;
  }

  const to = safeTrim(body.to || 'data@teachera.com.tr').slice(0, 200);
  const subject = safeTrim(body.subject).slice(0, 200);
  const formSource = safeTrim(body.formSource).slice(0, 500);
  const fields = sanitizeFields(body.fields);
  const captchaToken = safeTrim(body.captchaToken);

  if (!subject) {
    sendJson(res, 400, { ok: false, error: 'missing_subject' });
    return;
  }

  const turnstile = await verifyTurnstileToken(captchaToken, safeTrim(req.headers['x-forwarded-for']));
  if (!turnstile.ok) {
    sendJson(res, 403, { ok: false, error: 'captcha_failed', reason: turnstile.reason || 'unknown' });
    return;
  }

  const upstreamEndpoint = resolveUpstreamEndpoint(to);
  const upstreamPayload = {
    _subject: subject,
    _captcha: 'false',
    _template: 'table',
    form_source: formSource || 'server_proxy',
    ...fields,
  };

  try {
    const upstreamResponse = await fetch(upstreamEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(upstreamPayload),
    });

    if (!upstreamResponse.ok) {
      sendJson(res, 502, { ok: false, error: 'upstream_failed', status: upstreamResponse.status });
      return;
    }

    sendJson(res, 200, { ok: true, captcha: turnstile.enabled ? 'verified' : 'not_configured' });
  } catch {
    sendJson(res, 502, { ok: false, error: 'upstream_network_error' });
  }
}
