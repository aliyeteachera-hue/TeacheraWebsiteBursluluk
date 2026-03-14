// AUTO-GENERATED FROM packages/shared/backend. DO NOT EDIT DIRECTLY.
import {
  assertNotBruteForceLocked,
  clearBruteForceState,
  registerBruteForceFailure,
} from './abuseProtection.js';
import { query } from './db.js';
import { HttpError } from './errors.js';
import { hashSessionToken } from './exam.js';
import { safeTrim } from './http.js';
import { isRedisConfigured, isRedisUnavailableError } from './redis.js';
import { getRequestIp } from './redisRateLimit.js';
import {
  readExamSessionCache,
  touchExamSessionCache,
  writeExamSessionCache,
} from './redisExamSession.js';

function readTokenFromRequest(req) {
  const fromHeader = safeTrim(req.headers?.['x-exam-session-token']);
  if (fromHeader) return fromHeader;

  const authHeader = safeTrim(req.headers?.authorization);
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }

  return safeTrim(req.query?.session_token);
}

function readBoundedIntEnv(name, fallback, min, max) {
  const parsed = Number.parseInt(safeTrim(process.env[name] || ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function tokenFingerprint(token) {
  const normalized = safeTrim(token);
  if (!normalized) return null;
  return hashSessionToken(normalized).slice(0, 24);
}

async function enforceSessionBruteForceGuards(req, token) {
  const ip = getRequestIp(req);
  await assertNotBruteForceLocked({
    scope: 'exam_session_auth_ip',
    identity: ip,
    errorCode: 'exam_session_auth_locked',
    errorMessage: 'Too many invalid exam session attempts. Please retry later.',
  });

  const fingerprint = tokenFingerprint(token);
  if (!fingerprint) {
    return { ip, fingerprint: null };
  }

  await assertNotBruteForceLocked({
    scope: 'exam_session_auth_token',
    identity: fingerprint,
    errorCode: 'exam_session_token_locked',
    errorMessage: 'Exam session token is temporarily locked due to repeated failures.',
  });

  return { ip, fingerprint };
}

async function registerSessionFailure({ ip, fingerprint }) {
  const ipThreshold = readBoundedIntEnv('BRUTE_EXAM_SESSION_IP_THRESHOLD', 30, 3, 1000);
  const ipFailWindow = readBoundedIntEnv('BRUTE_EXAM_SESSION_IP_WINDOW_SECONDS', 5 * 60, 30, 24 * 60 * 60);
  const ipLockSeconds = readBoundedIntEnv('BRUTE_EXAM_SESSION_IP_LOCK_SECONDS', 10 * 60, 30, 24 * 60 * 60);
  await registerBruteForceFailure({
    scope: 'exam_session_auth_ip',
    identity: ip,
    threshold: ipThreshold,
    failWindowSeconds: ipFailWindow,
    lockSeconds: ipLockSeconds,
  });

  if (!fingerprint) return;

  const tokenThreshold = readBoundedIntEnv('BRUTE_EXAM_SESSION_TOKEN_THRESHOLD', 12, 3, 1000);
  const tokenFailWindow = readBoundedIntEnv('BRUTE_EXAM_SESSION_TOKEN_WINDOW_SECONDS', 5 * 60, 30, 24 * 60 * 60);
  const tokenLockSeconds = readBoundedIntEnv('BRUTE_EXAM_SESSION_TOKEN_LOCK_SECONDS', 10 * 60, 30, 24 * 60 * 60);
  await registerBruteForceFailure({
    scope: 'exam_session_auth_token',
    identity: fingerprint,
    threshold: tokenThreshold,
    failWindowSeconds: tokenFailWindow,
    lockSeconds: tokenLockSeconds,
  });
}

export async function requireExamSession(req, attemptId) {
  const token = readTokenFromRequest(req);
  if (!token) {
    const bruteForceIdentity = await enforceSessionBruteForceGuards(req, token);
    await registerSessionFailure(bruteForceIdentity);
    throw new HttpError(401, 'Exam session token is required.', 'missing_exam_session_token');
  }

  const tokenHash = hashSessionToken(token);
  const expectedAttemptId = safeTrim(attemptId);
  let bruteForceIdentity;

  if (isRedisConfigured()) {
    try {
      const cached = await readExamSessionCache(tokenHash);
      if (cached) {
        if (cached.attempt_id !== expectedAttemptId) {
          bruteForceIdentity = await enforceSessionBruteForceGuards(req, token);
          await registerSessionFailure(bruteForceIdentity);
          throw new HttpError(401, 'Exam session token is invalid.', 'invalid_exam_session_token');
        }
        if (cached.revoked_at) {
          bruteForceIdentity = await enforceSessionBruteForceGuards(req, token);
          await registerSessionFailure(bruteForceIdentity);
          throw new HttpError(401, 'Exam session token is revoked.', 'revoked_exam_session_token');
        }
        if (new Date(cached.expires_at).getTime() < Date.now()) {
          bruteForceIdentity = await enforceSessionBruteForceGuards(req, token);
          await registerSessionFailure(bruteForceIdentity);
          throw new HttpError(401, 'Exam session token is expired.', 'expired_exam_session_token');
        }

        await touchExamSessionCache(tokenHash, cached.expires_at);
        return cached;
      }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      if (isRedisUnavailableError(error)) {
        throw new HttpError(503, 'Session store is temporarily unavailable.', 'session_store_unavailable');
      }
      throw error;
    }
  }

  bruteForceIdentity = await enforceSessionBruteForceGuards(req, token);

  const { rows } = await query(
    `
      SELECT id, attempt_id, expires_at, revoked_at
      FROM exam_session_tokens
      WHERE token_hash = $1 AND attempt_id = $2
      LIMIT 1
    `,
    [tokenHash, expectedAttemptId],
  );

  const session = rows[0];
  if (!session) {
    await registerSessionFailure(bruteForceIdentity);
    throw new HttpError(401, 'Exam session token is invalid.', 'invalid_exam_session_token');
  }

  if (session.revoked_at) {
    await registerSessionFailure(bruteForceIdentity);
    throw new HttpError(401, 'Exam session token is revoked.', 'revoked_exam_session_token');
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    await registerSessionFailure(bruteForceIdentity);
    throw new HttpError(401, 'Exam session token is expired.', 'expired_exam_session_token');
  }

  if (isRedisConfigured()) {
    try {
      await writeExamSessionCache(tokenHash, session);
    } catch (error) {
      if (isRedisUnavailableError(error)) {
        throw new HttpError(503, 'Session store is temporarily unavailable.', 'session_store_unavailable');
      }
      throw error;
    }
  }

  await clearBruteForceState({
    scope: 'exam_session_auth_token',
    identity: bruteForceIdentity.fingerprint,
  });

  return session;
}
