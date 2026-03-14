import { Pool } from 'pg';

let poolSingleton = null;

function resolveConnectionString() {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
}

function buildPool() {
  const connectionString = resolveConnectionString();
  if (!connectionString) {
    throw new Error('Missing DATABASE_URL/POSTGRES_URL env for database access.');
  }

  const max = Number.parseInt(process.env.PG_POOL_MAX || '20', 10);
  const idleTimeoutMillis = Number.parseInt(process.env.PG_IDLE_TIMEOUT_MS || '30000', 10);
  const connectionTimeoutMillis = Number.parseInt(process.env.PG_CONNECTION_TIMEOUT_MS || '5000', 10);
  const sslMode = (process.env.PG_SSL_MODE || '').trim().toLowerCase();
  const nodeEnv = (process.env.NODE_ENV || '').trim().toLowerCase();
  const isProduction = nodeEnv === 'production';

  let ssl;
  if (sslMode === 'disable') {
    if (isProduction) {
      throw new Error('PG_SSL_MODE=disable is not allowed in production.');
    }
    ssl = false;
  } else if (sslMode === 'relaxed') {
    if (isProduction) {
      throw new Error('PG_SSL_MODE=relaxed is not allowed in production.');
    }
    ssl = { rejectUnauthorized: false };
  } else if (sslMode === 'strict') {
    ssl = { rejectUnauthorized: true };
  } else if (!sslMode) {
    ssl = isProduction ? { rejectUnauthorized: true } : { rejectUnauthorized: false };
  } else {
    throw new Error('Invalid PG_SSL_MODE. Allowed values: strict, relaxed, disable.');
  }

  return new Pool({
    connectionString,
    max: Number.isFinite(max) ? Math.min(Math.max(max, 1), 100) : 20,
    idleTimeoutMillis: Number.isFinite(idleTimeoutMillis) ? idleTimeoutMillis : 30000,
    connectionTimeoutMillis: Number.isFinite(connectionTimeoutMillis) ? connectionTimeoutMillis : 5000,
    ssl,
  });
}

export function getPool() {
  if (!poolSingleton) {
    poolSingleton = buildPool();
  }
  return poolSingleton;
}

export async function query(sql, params = []) {
  const pool = getPool();
  return pool.query(sql, params);
}

export async function withTransaction(callback) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
