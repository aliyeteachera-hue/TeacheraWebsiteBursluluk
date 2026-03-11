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

  const ssl =
    sslMode === 'disable'
      ? false
      : sslMode === 'strict'
        ? { rejectUnauthorized: true }
        : { rejectUnauthorized: false };

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

