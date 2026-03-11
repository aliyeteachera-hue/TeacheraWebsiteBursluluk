BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_user_status') THEN
    CREATE TYPE admin_user_status AS ENUM ('ACTIVE', 'DISABLED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO roles (code, name)
VALUES
  ('SUPER_ADMIN', 'Super Admin'),
  ('OPERATIONS', 'Operations'),
  ('READ_ONLY', 'Read Only')
ON CONFLICT (code)
DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  status admin_user_status NOT NULL DEFAULT 'ACTIVE',
  mfa_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  mfa_totp_secret TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_admin_users_mfa_secret
    CHECK (
      mfa_enabled = FALSE
      OR (
        mfa_totp_secret IS NOT NULL
        AND length(btrim(mfa_totp_secret)) > 0
      )
    )
);

CREATE INDEX IF NOT EXISTS idx_admin_users_status_created
  ON admin_users (status, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_user_roles (
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (admin_user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_admin_user_roles_role
  ON admin_user_roles (role_id, admin_user_id);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  role_code TEXT NOT NULL REFERENCES roles(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  token_hash TEXT NOT NULL UNIQUE,
  mfa_verified_at TIMESTAMPTZ NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_admin_sessions_expiry CHECK (expires_at > issued_at)
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_active
  ON admin_sessions (admin_user_id, expires_at DESC)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash
  ON admin_sessions (token_hash);

COMMIT;
