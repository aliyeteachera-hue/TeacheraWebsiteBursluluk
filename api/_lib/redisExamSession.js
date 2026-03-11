import { safeTrim } from './http.js';
import { isRedisConfigured, readRedisKeyPrefix, runRedisCommand } from './redis.js';

function buildSessionKey(tokenHash) {
  const prefix = readRedisKeyPrefix();
  return `${prefix}:exam:session:${safeTrim(tokenHash)}`;
}

function resolveSessionTtlSeconds(expiresAt) {
  const expiresAtMs = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiresAtMs)) return 0;
  const seconds = Math.floor((expiresAtMs - Date.now()) / 1000);
  return Math.max(0, seconds);
}

function normalizeSessionPayload(payload) {
  if (!payload || typeof payload !== 'object') return null;
  if (!safeTrim(payload.attempt_id)) return null;
  if (!payload.expires_at) return null;
  return {
    id: payload.id || null,
    attempt_id: safeTrim(payload.attempt_id),
    expires_at: payload.expires_at,
    revoked_at: payload.revoked_at || null,
  };
}

export async function readExamSessionCache(tokenHash) {
  if (!isRedisConfigured()) return null;
  const normalizedHash = safeTrim(tokenHash);
  if (!normalizedHash) return null;

  const raw = await runRedisCommand((client) => client.get(buildSessionKey(normalizedHash)));
  if (!raw) return null;

  try {
    return normalizeSessionPayload(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function writeExamSessionCache(tokenHash, session) {
  if (!isRedisConfigured()) return false;
  const normalizedHash = safeTrim(tokenHash);
  if (!normalizedHash) return false;

  const normalizedSession = normalizeSessionPayload(session);
  if (!normalizedSession) return false;

  const ttlSeconds = resolveSessionTtlSeconds(normalizedSession.expires_at);
  if (ttlSeconds <= 0) return false;

  await runRedisCommand((client) =>
    client.set(buildSessionKey(normalizedHash), JSON.stringify(normalizedSession), {
      EX: ttlSeconds,
    }));
  return true;
}

export async function touchExamSessionCache(tokenHash, expiresAt) {
  if (!isRedisConfigured()) return false;
  const normalizedHash = safeTrim(tokenHash);
  if (!normalizedHash) return false;

  const ttlSeconds = resolveSessionTtlSeconds(expiresAt);
  if (ttlSeconds <= 0) return false;

  await runRedisCommand((client) => client.expire(buildSessionKey(normalizedHash), ttlSeconds));
  return true;
}
