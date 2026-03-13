BEGIN;

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMPTZ;

UPDATE admin_users
SET password_updated_at = COALESCE(password_updated_at, created_at)
WHERE password_updated_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_admin_users_password_reset_required
  ON admin_users (password_reset_required)
  WHERE password_reset_required = TRUE;

COMMIT;
