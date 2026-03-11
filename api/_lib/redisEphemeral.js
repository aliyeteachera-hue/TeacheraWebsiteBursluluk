import { randomUUID } from 'node:crypto';
import { HttpError } from './errors.js';
import { safeTrim } from './http.js';
import { isRedisConfigured, isRedisUnavailableError, readRedisKeyPrefix, runRedisCommand } from './redis.js';

const COUNTER_SCRIPT = `
  local current = redis.call('INCRBY', KEYS[1], ARGV[1])
  if current == tonumber(ARGV[1]) then
    redis.call('EXPIRE', KEYS[1], ARGV[2])
  end
  local ttl = redis.call('TTL', KEYS[1])
  return {current, ttl}
`;

const RELEASE_LOCK_SCRIPT = `
  if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
  end
  return 0
`;

function readBoundedInt(raw, fallback, min, max) {
  const parsed = Number.parseInt(safeTrim(raw || ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function buildEphemeralKey(scope, identity) {
  const prefix = readRedisKeyPrefix();
  const normalizedIdentity = safeTrim(identity) || 'unknown';
  return `${prefix}:ephemeral:${scope}:${normalizedIdentity}`;
}

function normalizeTtl(ttl, fallbackWindowSeconds) {
  const parsed = Number.parseInt(String(ttl), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallbackWindowSeconds;
  return parsed;
}

export async function incrementWindowCounter({
  scope,
  identity,
  increment = 1,
  windowSeconds = 60,
  requireRedis = false,
}) {
  if (!isRedisConfigured()) {
    if (requireRedis) {
      throw new HttpError(
        503,
        'Short-lived counter store is not configured.',
        'ephemeral_counter_not_configured',
      );
    }
    return {
      count: 0,
      resetSeconds: windowSeconds,
      bypassed: 'redis_not_configured',
    };
  }

  try {
    const normalizedIncrement = readBoundedInt(String(increment), 1, 1, 1000);
    const normalizedWindow = readBoundedInt(String(windowSeconds), 60, 1, 24 * 60 * 60);

    const response = await runRedisCommand((client) =>
      client.eval(COUNTER_SCRIPT, {
        keys: [buildEphemeralKey(scope, identity)],
        arguments: [String(normalizedIncrement), String(normalizedWindow)],
      }));

    const countRaw = Array.isArray(response) ? response[0] : response;
    const ttlRaw = Array.isArray(response) ? response[1] : normalizedWindow;

    const count = readBoundedInt(String(countRaw), normalizedIncrement, normalizedIncrement, Number.MAX_SAFE_INTEGER);
    const resetSeconds = normalizeTtl(ttlRaw, normalizedWindow);

    return {
      count,
      resetSeconds,
    };
  } catch (error) {
    if (isRedisUnavailableError(error)) {
      throw new HttpError(503, 'Short-lived counter store is unavailable.', 'ephemeral_counter_unavailable');
    }
    throw error;
  }
}

export async function enforceCounterThreshold({
  scope,
  identity,
  increment = 1,
  windowSeconds = 30,
  maxCount = 30,
  requireRedis = false,
  errorCode = 'counter_threshold_exceeded',
  errorMessage = 'Request burst threshold exceeded.',
}) {
  const result = await incrementWindowCounter({
    scope,
    identity,
    increment,
    windowSeconds,
    requireRedis,
  });

  if (!result.bypassed && result.count > maxCount) {
    throw new HttpError(429, errorMessage, errorCode, {
      current: result.count,
      max_count: maxCount,
      retry_after_seconds: result.resetSeconds,
    });
  }

  return result;
}

export async function acquireShortLock({
  scope,
  identity,
  ttlSeconds = 20,
  owner = randomUUID(),
  requireRedis = false,
}) {
  if (!isRedisConfigured()) {
    if (requireRedis) {
      throw new HttpError(
        503,
        'Submission lock store is not configured.',
        'short_lock_not_configured',
      );
    }
    return {
      acquired: true,
      bypassed: 'redis_not_configured',
      owner,
      lockKey: null,
    };
  }

  try {
    const normalizedTtl = readBoundedInt(String(ttlSeconds), 20, 1, 300);
    const lockKey = buildEphemeralKey(scope, identity);
    const result = await runRedisCommand((client) =>
      client.set(lockKey, owner, {
        NX: true,
        EX: normalizedTtl,
      }));

    return {
      acquired: result === 'OK',
      owner,
      lockKey,
      ttlSeconds: normalizedTtl,
    };
  } catch (error) {
    if (isRedisUnavailableError(error)) {
      throw new HttpError(503, 'Submission lock store is unavailable.', 'short_lock_unavailable');
    }
    throw error;
  }
}

export async function releaseShortLock({ lockKey, owner }) {
  if (!isRedisConfigured()) return;
  if (!lockKey || !owner) return;

  try {
    await runRedisCommand((client) =>
      client.eval(RELEASE_LOCK_SCRIPT, {
        keys: [lockKey],
        arguments: [owner],
      }));
  } catch (error) {
    console.error('[redis_release_short_lock_failed]', error);
  }
}
