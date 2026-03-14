// AUTO-GENERATED FROM packages/shared/backend. DO NOT EDIT DIRECTLY.
import { createHash } from 'node:crypto';
import { HttpError } from './errors.js';
import { safeTrim } from './http.js';
import { isRedisConfigured, isRedisUnavailableError, readRedisKeyPrefix, runRedisCommand } from './redis.js';

const RATE_LIMIT_SCRIPT = `
  local current = redis.call('INCRBY', KEYS[1], ARGV[1])
  if current == tonumber(ARGV[1]) then
    redis.call('EXPIRE', KEYS[1], ARGV[2])
  end
  local ttl = redis.call('TTL', KEYS[1])
  return {current, ttl}
`;

function readBoundedInt(raw, fallback, min, max) {
  const parsed = Number.parseInt(safeTrim(raw || ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function hashIdentity(identity) {
  return createHash('sha256').update(identity).digest('hex').slice(0, 40);
}

function readLoadTestBypassKey() {
  return safeTrim(
    process.env.LOAD_TEST_BYPASS_KEY
    || process.env.CRON_SECRET
    || process.env.NOTIFICATION_WORKER_SECRET,
  );
}

function buildRateLimitKey(scope, identity) {
  const prefix = readRedisKeyPrefix();
  return `${prefix}:rl:${scope}:${hashIdentity(identity)}`;
}

function normalizeTtl(ttl, fallbackWindowSeconds) {
  const parsed = Number.parseInt(String(ttl), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallbackWindowSeconds;
  return parsed;
}

export function getRequestIp(req) {
  const loadTestIp = safeTrim(req.headers?.['x-load-test-ip']);
  const loadTestKey = safeTrim(req.headers?.['x-load-test-key']);
  const expectedLoadTestKey = readLoadTestBypassKey();
  if (loadTestIp && loadTestKey && expectedLoadTestKey && loadTestKey === expectedLoadTestKey) {
    return loadTestIp;
  }

  const xForwardedFor = safeTrim(req.headers?.['x-forwarded-for']);
  if (xForwardedFor) {
    return xForwardedFor
      .split(',')
      .map((item) => item.trim())
      .find(Boolean) || 'unknown';
  }

  const cfConnectingIp = safeTrim(req.headers?.['cf-connecting-ip']);
  if (cfConnectingIp) return cfConnectingIp;

  const xRealIp = safeTrim(req.headers?.['x-real-ip']);
  if (xRealIp) return xRealIp;

  return safeTrim(req.socket?.remoteAddress || '') || 'unknown';
}

export function resolveLimitConfig({
  limitEnv,
  windowSecondsEnv,
  defaultLimit,
  defaultWindowSeconds,
}) {
  return {
    limit: readBoundedInt(process.env[limitEnv], defaultLimit, 1, 100000),
    windowSeconds: readBoundedInt(process.env[windowSecondsEnv], defaultWindowSeconds, 1, 24 * 60 * 60),
  };
}

export async function consumeRateLimit({
  scope,
  identity,
  limit,
  windowSeconds,
  cost = 1,
}) {
  const resolvedIdentity = safeTrim(identity) || 'unknown';
  const increment = readBoundedInt(String(cost), 1, 1, 1000);
  const resolvedWindow = readBoundedInt(String(windowSeconds), 60, 1, 24 * 60 * 60);
  const resolvedLimit = readBoundedInt(String(limit), 60, 1, 100000);

  const response = await runRedisCommand((client) =>
    client.eval(RATE_LIMIT_SCRIPT, {
      keys: [buildRateLimitKey(scope, resolvedIdentity)],
      arguments: [String(increment), String(resolvedWindow)],
    }));

  const currentRaw = Array.isArray(response) ? response[0] : response;
  const ttlRaw = Array.isArray(response) ? response[1] : resolvedWindow;

  const current = readBoundedInt(String(currentRaw), increment, increment, Number.MAX_SAFE_INTEGER);
  const ttlSeconds = normalizeTtl(ttlRaw, resolvedWindow);
  const remaining = Math.max(0, resolvedLimit - current);

  return {
    allowed: current <= resolvedLimit,
    current,
    remaining,
    limit: resolvedLimit,
    windowSeconds: resolvedWindow,
    resetSeconds: ttlSeconds || resolvedWindow,
  };
}

export async function enforceRateLimit(
  req,
  res,
  {
    scope,
    identity,
    limitEnv,
    windowSecondsEnv,
    defaultLimit,
    defaultWindowSeconds,
    cost = 1,
    requireRedis = false,
    errorCode = 'rate_limited',
    errorMessage = 'Too many requests. Please try again shortly.',
  },
) {
  if (!isRedisConfigured()) {
    if (requireRedis) {
      throw new HttpError(
        503,
        'Rate limiter is not configured.',
        'rate_limiter_not_configured',
      );
    }
    return {
      allowed: true,
      bypassed: 'redis_not_configured',
    };
  }

  const { limit, windowSeconds } = resolveLimitConfig({
    limitEnv,
    windowSecondsEnv,
    defaultLimit,
    defaultWindowSeconds,
  });

  let result;
  try {
    result = await consumeRateLimit({
      scope,
      identity,
      limit,
      windowSeconds,
      cost,
    });
  } catch (error) {
    if (isRedisUnavailableError(error)) {
      throw new HttpError(
        503,
        'Rate limiter is temporarily unavailable.',
        'rate_limiter_unavailable',
      );
    }
    throw error;
  }

  if (typeof res?.setHeader === 'function') {
    res.setHeader('X-RateLimit-Limit', String(result.limit));
    res.setHeader('X-RateLimit-Remaining', String(result.remaining));
    res.setHeader('X-RateLimit-Reset', String(result.resetSeconds));
  }

  if (!result.allowed) {
    if (typeof res?.setHeader === 'function') {
      res.setHeader('Retry-After', String(result.resetSeconds));
    }
    throw new HttpError(429, errorMessage, errorCode, {
      retry_after_seconds: result.resetSeconds,
      limit: result.limit,
      window_seconds: result.windowSeconds,
    });
  }

  return result;
}
