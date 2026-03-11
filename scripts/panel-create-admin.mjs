import process from 'node:process';
import { Pool } from 'pg';

const ALLOWED_ROLES = new Set(['SUPER_ADMIN', 'OPERATIONS', 'READ_ONLY']);

function readArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index < 0) return '';
  return (process.argv[index + 1] || '').trim();
}

function requireArg(name) {
  const value = readArg(name);
  if (!value) {
    throw new Error(`Missing required argument: --${name}`);
  }
  return value;
}

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function parseRole(value) {
  const role = value.trim().toUpperCase();
  if (!ALLOWED_ROLES.has(role)) {
    throw new Error(`Invalid role: ${value}. Allowed: ${Array.from(ALLOWED_ROLES).join(', ')}`);
  }
  return role;
}

function resolveConnectionString() {
  return (process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim();
}

async function main() {
  const connectionString = resolveConnectionString();
  if (!connectionString) {
    throw new Error('Missing DATABASE_URL/POSTGRES_URL env.');
  }

  const email = normalizeEmail(requireArg('email'));
  const fullName = requireArg('name');
  const password = requireArg('password');
  const role = parseRole(requireArg('role'));
  const totpSecret = requireArg('totp-secret').replace(/[\s-]/g, '').toUpperCase();

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `
        INSERT INTO roles (code, name)
        VALUES ($1, $2)
        ON CONFLICT (code)
        DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
      `,
      [role, role.replace('_', ' ')],
    );

    const userResult = await client.query(
      `
        INSERT INTO admin_users (
          email,
          full_name,
          password_hash,
          status,
          mfa_enabled,
          mfa_totp_secret,
          updated_at
        )
        VALUES (
          lower($1),
          $2,
          crypt($3, gen_salt('bf', 12)),
          'ACTIVE',
          TRUE,
          $4,
          NOW()
        )
        ON CONFLICT (email)
        DO UPDATE SET
          full_name = EXCLUDED.full_name,
          password_hash = EXCLUDED.password_hash,
          status = 'ACTIVE',
          mfa_enabled = TRUE,
          mfa_totp_secret = EXCLUDED.mfa_totp_secret,
          updated_at = NOW()
        RETURNING id, email
      `,
      [email, fullName, password, totpSecret],
    );

    const user = userResult.rows[0];
    await client.query(
      `
        DELETE FROM admin_user_roles
        WHERE admin_user_id = $1::uuid
      `,
      [user.id],
    );

    await client.query(
      `
        INSERT INTO admin_user_roles (admin_user_id, role_id)
        SELECT $1::uuid, r.id
        FROM roles r
        WHERE r.code = $2
      `,
      [user.id, role],
    );

    await client.query('COMMIT');
    console.log(`Admin user ready: ${user.email} (${role})`);
    console.log('MFA: enabled');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[panel:create-admin] failed:', error.message || String(error));
  process.exit(1);
});
