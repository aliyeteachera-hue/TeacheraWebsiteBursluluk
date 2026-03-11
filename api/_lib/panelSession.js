import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { HttpError } from './errors.js';
import { safeTrim } from './http.js';

const PANEL_TOKEN_ISSUER = 'teachera_panel';
const PANEL_TOKEN_AUDIENCE = 'panel_api';
const DEFAULT_COOKIE_NAME = 'teachera_panel_session';
const DEFAULT_TTL_MINUTES = 8 * 60;

function toBase64Url(value) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value) {
  const normalized = safeTrim(value).replace(/-/g, '+').replace(/_/g, '/');
  if (!normalized) return '';
  const remainder = normalized.length % 4;
  const padded = remainder === 0 ? normalized : `${normalized}${'='.repeat(4 - remainder)}`;
  return Buffer.from(padded, 'base64').toString('utf8');
}

function signSegment(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function readSessionSecret() {
  const secret = safeTrim(process.env.PANEL_SESSION_SECRET);
  if (!secret) {
    throw new HttpError(500, 'Panel session secret is missing.', 'missing_panel_session_secret');
  }
  return secret;
}

function parseJsonSafe(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isFiniteUnixSeconds(value) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return parsed;
}

function parseCookieHeader(cookieHeader) {
  const header = safeTrim(cookieHeader);
  if (!header) return {};

  return header
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((acc, chunk) => {
      const separator = chunk.indexOf('=');
      if (separator <= 0) return acc;
      const name = chunk.slice(0, separator).trim();
      const value = chunk.slice(separator + 1).trim();
      if (!name) return acc;
      try {
        acc[name] = decodeURIComponent(value);
      } catch {
        acc[name] = value;
      }
      return acc;
    }, {});
}

export function readPanelSessionCookieName() {
  return safeTrim(process.env.PANEL_SESSION_COOKIE_NAME || DEFAULT_COOKIE_NAME);
}

export function readPanelSessionTtlMinutes() {
  const parsed = Number.parseInt(safeTrim(process.env.PANEL_SESSION_TTL_MINUTES || `${DEFAULT_TTL_MINUTES}`), 10);
  if (!Number.isFinite(parsed) || parsed < 15) return DEFAULT_TTL_MINUTES;
  return Math.min(parsed, 24 * 60);
}

export function hashPanelSessionToken(token) {
  return createHash('sha256').update(safeTrim(token)).digest('hex');
}

export function createPanelSessionToken({
  userId,
  sessionId,
  role,
  email,
  mfaVerified = true,
  ttlMinutes = readPanelSessionTtlMinutes(),
  nowMs = Date.now(),
}) {
  const normalizedUserId = safeTrim(userId);
  const normalizedSessionId = safeTrim(sessionId);
  const normalizedRole = safeTrim(role).toUpperCase();
  const normalizedEmail = safeTrim(email).toLowerCase();

  if (!normalizedUserId || !normalizedSessionId || !normalizedRole || !normalizedEmail) {
    throw new HttpError(500, 'Panel session token claims are incomplete.', 'invalid_panel_session_claims');
  }

  const nowSeconds = Math.floor(nowMs / 1000);
  const expSeconds = nowSeconds + Math.max(15 * 60, ttlMinutes * 60);
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  const payload = {
    iss: PANEL_TOKEN_ISSUER,
    aud: PANEL_TOKEN_AUDIENCE,
    sub: normalizedUserId,
    sid: normalizedSessionId,
    role: normalizedRole,
    email: normalizedEmail,
    mfa: Boolean(mfaVerified),
    iat: nowSeconds,
    exp: expSeconds,
  };

  const headerEncoded = toBase64Url(JSON.stringify(header));
  const payloadEncoded = toBase64Url(JSON.stringify(payload));
  const signingInput = `${headerEncoded}.${payloadEncoded}`;
  const signature = signSegment(signingInput, readSessionSecret());

  return {
    token: `${signingInput}.${signature}`,
    expiresAt: new Date(expSeconds * 1000).toISOString(),
    expiresAtSeconds: expSeconds,
    issuedAtSeconds: nowSeconds,
  };
}

export function verifyPanelSessionToken(token, { nowMs = Date.now() } = {}) {
  const normalizedToken = safeTrim(token);
  if (!normalizedToken) {
    throw new HttpError(401, 'Panel session token is required.', 'missing_panel_session_token');
  }

  const segments = normalizedToken.split('.');
  if (segments.length !== 3) {
    throw new HttpError(401, 'Panel session token is malformed.', 'invalid_panel_session_token');
  }

  const [headerEncoded, payloadEncoded, signatureEncoded] = segments;
  const signingInput = `${headerEncoded}.${payloadEncoded}`;
  const expectedSignature = signSegment(signingInput, readSessionSecret());
  const provided = Buffer.from(signatureEncoded);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw new HttpError(401, 'Panel session signature is invalid.', 'invalid_panel_session_signature');
  }

  const header = parseJsonSafe(fromBase64Url(headerEncoded));
  const payload = parseJsonSafe(fromBase64Url(payloadEncoded));
  if (!header || !payload) {
    throw new HttpError(401, 'Panel session token payload is invalid.', 'invalid_panel_session_payload');
  }

  if (safeTrim(header.alg).toUpperCase() !== 'HS256') {
    throw new HttpError(401, 'Panel session algorithm is not supported.', 'invalid_panel_session_algorithm');
  }

  if (safeTrim(payload.iss) !== PANEL_TOKEN_ISSUER || safeTrim(payload.aud) !== PANEL_TOKEN_AUDIENCE) {
    throw new HttpError(401, 'Panel session token issuer is invalid.', 'invalid_panel_session_issuer');
  }

  const expSeconds = isFiniteUnixSeconds(payload.exp);
  if (!expSeconds || expSeconds * 1000 <= nowMs) {
    throw new HttpError(401, 'Panel session token is expired.', 'expired_panel_session_token');
  }

  const iatSeconds = isFiniteUnixSeconds(payload.iat);
  if (!iatSeconds) {
    throw new HttpError(401, 'Panel session token issue time is invalid.', 'invalid_panel_session_iat');
  }

  return {
    userId: safeTrim(payload.sub),
    sessionId: safeTrim(payload.sid),
    role: safeTrim(payload.role).toUpperCase(),
    email: safeTrim(payload.email).toLowerCase(),
    mfaVerified: Boolean(payload.mfa),
    exp: expSeconds,
    iat: iatSeconds,
  };
}

export function extractPanelSessionToken(req) {
  const authHeader = safeTrim(req.headers?.authorization);
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieName = readPanelSessionCookieName();
  const cookies = parseCookieHeader(req.headers?.cookie);
  return safeTrim(cookies[cookieName]);
}

function shouldUseSecureCookies(req) {
  const forwardedProto = safeTrim(req.headers?.['x-forwarded-proto']).toLowerCase();
  if (forwardedProto.includes('https')) return true;
  return safeTrim(process.env.NODE_ENV).toLowerCase() === 'production';
}

export function buildPanelSessionCookie(token, req, maxAgeSeconds) {
  const cookieName = readPanelSessionCookieName();
  const attributes = [
    `${cookieName}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${Math.max(0, Number.parseInt(String(maxAgeSeconds || 0), 10) || 0)}`,
  ];

  if (shouldUseSecureCookies(req)) {
    attributes.push('Secure');
  }

  return attributes.join('; ');
}

export function buildClearPanelSessionCookie(req) {
  const cookieName = readPanelSessionCookieName();
  const attributes = [
    `${cookieName}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ];

  if (shouldUseSecureCookies(req)) {
    attributes.push('Secure');
  }

  return attributes.join('; ');
}
