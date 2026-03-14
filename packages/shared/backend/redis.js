import { createClient } from 'redis';
import { safeTrim } from './http.js';

let redisClient = null;
let redisConnectPromise = null;
let hasBoundErrorListener = false;

function readRedisUrl() {
  return safeTrim(process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL);
}

function readConnectTimeoutMs() {
  const parsed = Number.parseInt(safeTrim(process.env.REDIS_CONNECT_TIMEOUT_MS || ''), 10);
  if (!Number.isFinite(parsed) || parsed < 500) return 3000;
  return Math.min(parsed, 15000);
}

function readOperationTimeoutMs() {
  const parsed = Number.parseInt(safeTrim(process.env.REDIS_OPERATION_TIMEOUT_MS || ''), 10);
  if (!Number.isFinite(parsed) || parsed < 200) return 1200;
  return Math.min(parsed, 10000);
}

function readReconnectDelayMs() {
  const parsed = Number.parseInt(safeTrim(process.env.REDIS_RECONNECT_DELAY_MS || ''), 10);
  if (!Number.isFinite(parsed) || parsed < 50) return 250;
  return Math.min(parsed, 5000);
}

function readConnectMaxRetries() {
  const parsed = Number.parseInt(safeTrim(process.env.REDIS_CONNECT_MAX_RETRIES || ''), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 1;
  return Math.min(parsed, 10);
}

function createTimeoutError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function withTimeout(promise, timeoutMs, code, message) {
  let timer = null;
  return Promise.race([
    promise.finally(() => {
      if (timer) clearTimeout(timer);
    }),
    new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(createTimeoutError(code, message));
      }, timeoutMs);
    }),
  ]);
}

function resetClientState() {
  redisClient = null;
  redisConnectPromise = null;
  hasBoundErrorListener = false;
}

function forceCloseClient(client) {
  if (!client) return;
  try {
    client.disconnect();
  } catch {
    // best-effort hard close
  }
}

function buildClient() {
  const maxRetries = readConnectMaxRetries();
  return createClient({
    url: readRedisUrl(),
    socket: {
      connectTimeout: readConnectTimeoutMs(),
      reconnectStrategy: (retries) => {
        if (retries > maxRetries) {
          return createTimeoutError('REDIS_RECONNECT_LIMIT', 'Redis reconnect limit exceeded.');
        }
        return readReconnectDelayMs();
      },
      keepAlive: true,
      noDelay: true,
    },
  });
}

export function isRedisConfigured() {
  return Boolean(readRedisUrl());
}

export async function getRedisClient() {
  if (!isRedisConfigured()) {
    throw new Error('missing_redis_url');
  }

  if (!redisClient) {
    redisClient = buildClient();
  }

  if (!hasBoundErrorListener) {
    redisClient.on('error', (error) => {
      console.error('[redis_client_error]', error);
    });
    hasBoundErrorListener = true;
  }

  if (redisClient.isReady) {
    return redisClient;
  }

  if (!redisConnectPromise) {
    const connectPromise = withTimeout(
      redisClient.connect(),
      readConnectTimeoutMs() + readOperationTimeoutMs(),
      'REDIS_CONNECT_TIMEOUT',
      'Redis connect timeout.',
    );

    redisConnectPromise = connectPromise
      .catch((error) => {
        forceCloseClient(redisClient);
        resetClientState();
        throw error;
      })
      .finally(() => {
        redisConnectPromise = null;
      });
  }

  await redisConnectPromise;
  return redisClient;
}

export function readRedisKeyPrefix() {
  return safeTrim(process.env.REDIS_KEY_PREFIX || 'teachera') || 'teachera';
}

export function readRedisOperationTimeoutMs() {
  return readOperationTimeoutMs();
}

export function isRedisUnavailableError(error) {
  const code = safeTrim(error?.code || '');
  if (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNRESET' ||
    code === 'NR_CLOSED' ||
    code === 'REDIS_CONNECT_TIMEOUT' ||
    code === 'REDIS_RECONNECT_LIMIT' ||
    code === 'REDIS_COMMAND_TIMEOUT' ||
    code === 'SocketClosedUnexpectedlyError'
  ) {
    return true;
  }

  const message = safeTrim(error?.message || '').toLowerCase();
  if (!message) return false;

  return (
    message.includes('missing_redis_url') ||
    message.includes('socket closed') ||
    message.includes('connection is closed') ||
    message.includes('connect timeout') ||
    message.includes('failed to connect') ||
    message.includes('reconnect limit exceeded') ||
    message.includes('socketclosedunexpectedlyerror')
  );
}

export async function runRedisCommand(executor) {
  const client = await getRedisClient();
  try {
    return await withTimeout(
      Promise.resolve().then(() => executor(client)),
      readRedisOperationTimeoutMs(),
      'REDIS_COMMAND_TIMEOUT',
      'Redis command timeout.',
    );
  } catch (error) {
    if (isRedisUnavailableError(error)) {
      forceCloseClient(redisClient);
      resetClientState();
    }
    throw error;
  }
}
