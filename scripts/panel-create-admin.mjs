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

function parseBooleanArg(name, fallback = false) {
  const raw = readArg(name);
  if (!raw) return fallback;
  const normalized = raw.trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  throw new Error(`Invalid boolean for --${name}: ${raw}`);
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

async function readAdminUserColumnAvailability(client) {
  const result = await client.query(
    `
      SELECT
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'admin_users'
            AND column_name = 'password_reset_required'
        ) AS has_password_reset_required,
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'admin_users'
            AND column_name = 'password_updated_at'
        ) AS has_password_updated_at
    `,
  );

  return {
    hasPasswordResetRequired: Boolean(result.rows[0]?.has_password_reset_required),
    hasPasswordUpdatedAt: Boolean(result.rows[0]?.has_password_updated_at),
  };
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
  const requirePasswordReset = parseBooleanArg('require-password-reset', false);

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const availability = await readAdminUserColumnAvailability(client);

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
          ${availability.hasPasswordResetRequired ? 'password_reset_required,' : ''}
          ${availability.hasPasswordUpdatedAt ? 'password_updated_at,' : ''}
          status,
          mfa_enabled,
          mfa_totp_secret,
          updated_at
        )
        VALUES (
          lower($1),
          $2,
          crypt($3, gen_salt('bf', 12)),
          ${availability.hasPasswordResetRequired ? '$4,' : ''}
          ${availability.hasPasswordUpdatedAt ? 'NOW(),' : ''}
          'ACTIVE',
          TRUE,
          $5,
          NOW()
        )
        ON CONFLICT (email)
        DO UPDATE SET
          full_name = EXCLUDED.full_name,
          password_hash = EXCLUDED.password_hash,
          ${availability.hasPasswordResetRequired ? 'password_reset_required = EXCLUDED.password_reset_required,' : ''}
          ${availability.hasPasswordUpdatedAt ? 'password_updated_at = EXCLUDED.password_updated_at,' : ''}
          status = 'ACTIVE',
          mfa_enabled = TRUE,
          mfa_totp_secret = EXCLUDED.mfa_totp_secret,
          updated_at = NOW()
        RETURNING id, email
      `,
      [email, fullName, password, requirePasswordReset, totpSecret],
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
    console.log(`password_reset_required: ${requirePasswordReset ? 'true' : 'false'}`);
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
