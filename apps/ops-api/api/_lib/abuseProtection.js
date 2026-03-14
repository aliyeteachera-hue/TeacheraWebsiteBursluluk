// AUTO-GENERATED FROM packages/shared/backend. DO NOT EDIT DIRECTLY.
import { createHash } from 'node:crypto';
import { HttpError } from './errors.js';
import { safeTrim } from './http.js';
import {
  isRedisConfigured,
  isRedisUnavailableError,
  readRedisKeyPrefix,
  runRedisCommand,
} from './redis.js';

const REGISTER_FAILURE_SCRIPT = `
  local failKey = KEYS[1]
  local lockKey = KEYS[2]
  local threshold = tonumber(ARGV[1])
  local failWindow = tonumber(ARGV[2])
  local lockWindow = tonumber(ARGV[3])

  local failCount = redis.call('INCR', failKey)
  if failCount == 1 then
    redis.call('EXPIRE', failKey, failWindow)
  end

  local lockTtl = redis.call('TTL', lockKey)
  if failCount >= threshold then
    redis.call('SET', lockKey, tostring(failCount), 'EX', lockWindow)
    lockTtl = lockWindow
  end

  return {failCount, redis.call('TTL', failKey), lockTtl}
`;

function readBoundedInt(raw, fallback, min, max) {
  const parsed = Number.parseInt(safeTrim(raw || ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function hashIdentity(identity) {
  return createHash('sha256').update(identity).digest('hex').slice(0, 40);
}

function buildKeys(scope, identity) {
  const prefix = readRedisKeyPrefix();
  const normalizedScope = safeTrim(scope || 'default');
  const normalizedIdentity = safeTrim(identity || 'unknown');
  const hashedIdentity = hashIdentity(normalizedIdentity);
  return {
    failKey: `${prefix}:abuse:${normalizedScope}:fail:${hashedIdentity}`,
    lockKey: `${prefix}:abuse:${normalizedScope}:lock:${hashedIdentity}`,
  };
}

function normalizeTtl(rawTtl) {
  const ttl = Number.parseInt(String(rawTtl), 10);
  if (!Number.isFinite(ttl)) {
    return { exists: false, ttlSeconds: 0, hasExpiry: false };
  }
  if (ttl === -2) {
    // Redis: key does not exist.
    return { exists: false, ttlSeconds: 0, hasExpiry: false };
  }
  if (ttl === -1) {
    // Redis: key exists but has no expire.
    return { exists: true, ttlSeconds: 0, hasExpiry: false };
  }
  return {
    exists: true,
    ttlSeconds: Math.max(0, ttl),
    hasExpiry: true,
  };
}

function readFallbackLockSeconds() {
  return readBoundedInt(safeTrim(process.env.ABUSE_LOCK_FALLBACK_SECONDS || ''), 5 * 60, 10, 24 * 60 * 60);
}

function resolveTtlSeconds(normalized, fallbackSeconds, whenMissing = fallbackSeconds) {
  if (!normalized.exists) return whenMissing;
  if (!normalized.hasExpiry) return fallbackSeconds;
  return normalized.ttlSeconds;
}

function ensureConfigured() {
  if (!isRedisConfigured()) {
    throw new HttpError(
      503,
      'Anti-abuse controls are not configured.',
      'anti_abuse_not_configured',
    );
  }
}

export async function assertNotBruteForceLocked({
  scope,
  identity,
  errorCode = 'brute_force_locked',
  errorMessage = 'Too many failed attempts. Please retry later.',
}) {
  ensureConfigured();
  const { lockKey } = buildKeys(scope, identity);

  try {
    const ttlRaw = await runRedisCommand((client) => client.ttl(lockKey));
    const normalizedTtl = normalizeTtl(ttlRaw);

    if (!normalizedTtl.exists || normalizedTtl.ttlSeconds <= 0) {
      if (normalizedTtl.exists && !normalizedTtl.hasExpiry) {
        const fallbackLockSeconds = readFallbackLockSeconds();
        try {
          await runRedisCommand((client) => client.expire(lockKey, fallbackLockSeconds));
        } catch (setExpiryError) {
          if (!isRedisUnavailableError(setExpiryError)) {
            console.error('[abuse_lock_expire_fix_failed]', setExpiryError);
          }
        }
        throw new HttpError(429, errorMessage, errorCode, {
          retry_after_seconds: fallbackLockSeconds,
          repaired_missing_expiry: true,
        });
      }
      return;
    }

    if (normalizedTtl.ttlSeconds > 0) {
      throw new HttpError(429, errorMessage, errorCode, {
        retry_after_seconds: normalizedTtl.ttlSeconds,
      });
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (isRedisUnavailableError(error)) {
      throw new HttpError(
        503,
        'Anti-abuse controls are temporarily unavailable.',
        'anti_abuse_unavailable',
      );
    }
    throw error;
  }
}

export async function registerBruteForceFailure({
  scope,
  identity,
  threshold = 5,
  failWindowSeconds = 10 * 60,
  lockSeconds = 15 * 60,
}) {
  ensureConfigured();
  const { failKey, lockKey } = buildKeys(scope, identity);
  const normalizedThreshold = readBoundedInt(String(threshold), 5, 1, 1000);
  const normalizedFailWindow = readBoundedInt(String(failWindowSeconds), 600, 10, 24 * 60 * 60);
  const normalizedLockSeconds = readBoundedInt(String(lockSeconds), 900, 10, 24 * 60 * 60);

  try {
    const response = await runRedisCommand((client) =>
      client.eval(REGISTER_FAILURE_SCRIPT, {
        keys: [failKey, lockKey],
        arguments: [
          String(normalizedThreshold),
          String(normalizedFailWindow),
          String(normalizedLockSeconds),
        ],
      }));

    const failCount = Array.isArray(response) ? readBoundedInt(String(response[0]), 1, 1, Number.MAX_SAFE_INTEGER) : 1;
    const failTtl = Array.isArray(response)
      ? resolveTtlSeconds(normalizeTtl(response[1]), normalizedFailWindow, normalizedFailWindow)
      : normalizedFailWindow;
    const lockTtl = Array.isArray(response)
      ? resolveTtlSeconds(normalizeTtl(response[2]), normalizedLockSeconds, 0)
      : 0;

    return {
      failCount,
      failTtl,
      lockActive: lockTtl > 0,
      lockTtl,
    };
  } catch (error) {
    if (isRedisUnavailableError(error)) {
      throw new HttpError(
        503,
        'Anti-abuse controls are temporarily unavailable.',
        'anti_abuse_unavailable',
      );
    }
    throw error;
  }
}

export async function clearBruteForceState({ scope, identity }) {
  if (!isRedisConfigured()) return;
  const { failKey, lockKey } = buildKeys(scope, identity);

  try {
    await runRedisCommand((client) => client.del([failKey, lockKey]));
  } catch (error) {
    if (isRedisUnavailableError(error)) {
      console.error('[abuse_clear_failed_unavailable]', error);
      return;
    }
    console.error('[abuse_clear_failed]', error);
  }
}
