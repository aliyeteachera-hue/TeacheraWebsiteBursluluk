BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE guardians
  ADD COLUMN IF NOT EXISTS full_name_enc BYTEA,
  ADD COLUMN IF NOT EXISTS phone_e164_enc BYTEA,
  ADD COLUMN IF NOT EXISTS email_enc BYTEA,
  ADD COLUMN IF NOT EXISTS phone_e164_hash TEXT,
  ADD COLUMN IF NOT EXISTS pii_key_version TEXT NOT NULL DEFAULT 'v1';

ALTER TABLE candidates
  ADD COLUMN IF NOT EXISTS full_name_enc BYTEA,
  ADD COLUMN IF NOT EXISTS full_name_hash TEXT,
  ADD COLUMN IF NOT EXISTS pii_key_version TEXT NOT NULL DEFAULT 'v1';

ALTER TABLE guardians
  ALTER COLUMN full_name DROP NOT NULL,
  ALTER COLUMN phone_e164 DROP NOT NULL,
  ALTER COLUMN email DROP NOT NULL;

ALTER TABLE candidates
  ALTER COLUMN full_name DROP NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'guardians_phone_e164_key'
      AND conrelid = 'guardians'::regclass
  ) THEN
    ALTER TABLE guardians
      DROP CONSTRAINT guardians_phone_e164_key;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_guardians_phone_e164_hash
  ON guardians (phone_e164_hash)
  WHERE phone_e164_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_guardians_phone_e164_hash
  ON guardians (phone_e164_hash);

CREATE INDEX IF NOT EXISTS idx_candidates_campaign_full_name_hash
  ON candidates (campaign_code, full_name_hash);

CREATE TABLE IF NOT EXISTS audit_log_chain_head (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_hash TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO audit_log_chain_head (id, last_hash)
VALUES (1, NULL)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS audit_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seq BIGSERIAL NOT NULL UNIQUE,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('PANEL_USER', 'SYSTEM', 'WEBHOOK', 'CANDIDATE')),
  actor_id TEXT NOT NULL,
  actor_role TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  request_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  prev_hash TEXT,
  entry_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_entries_actor_created
  ON audit_log_entries (actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_entries_action_created
  ON audit_log_entries (action, created_at DESC);

CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_log_entries is append-only';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_mutation ON audit_log_entries;

CREATE TRIGGER trg_prevent_audit_log_mutation
BEFORE UPDATE OR DELETE ON audit_log_entries
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_mutation();

DROP VIEW IF EXISTS v_candidate_operations;
DROP VIEW IF EXISTS v_unviewed_results;

CREATE VIEW v_candidate_operations AS
SELECT
  c.id AS candidate_id,
  a.application_no,
  c.full_name AS student_full_name,
  c.grade,
  s.name AS school_name,
  g.full_name AS parent_full_name,
  g.phone_e164 AS parent_phone_e164,
  a.status AS application_status,
  a.credentials_sms_status,
  ae_first_login.occurred_at AS first_login_at,
  ea.status AS exam_status,
  ea.started_at AS exam_started_at,
  ea.submitted_at AS exam_submitted_at,
  r.status AS result_status,
  r.score AS result_score,
  r.viewed_at AS result_viewed_at,
  COALESCE(nj_wa.status, 'NOT_QUEUED'::notification_status) AS wa_result_status,
  COALESCE(ne_last.error_code, nj_wa.last_error_code) AS last_error_code,
  GREATEST(
    c.updated_at,
    a.updated_at,
    COALESCE(ea.updated_at, c.updated_at),
    COALESCE(r.updated_at, c.updated_at),
    COALESCE(nj_wa.updated_at, c.updated_at)
  ) AS updated_at,
  c.campaign_code,
  c.full_name_enc AS student_full_name_enc,
  c.full_name_hash AS student_full_name_hash,
  g.full_name_enc AS parent_full_name_enc,
  g.phone_e164_enc AS parent_phone_e164_enc,
  g.phone_e164_hash AS parent_phone_e164_hash
FROM candidates c
LEFT JOIN applications a ON a.candidate_id = c.id
LEFT JOIN schools s ON s.id = c.school_id
LEFT JOIN guardians g ON g.id = c.guardian_id
LEFT JOIN LATERAL (
  SELECT ea2.*
  FROM exam_attempts ea2
  WHERE ea2.candidate_id = c.id
  ORDER BY ea2.created_at DESC
  LIMIT 1
) ea ON TRUE
LEFT JOIN results r ON r.attempt_id = ea.id
LEFT JOIN LATERAL (
  SELECT ev.*
  FROM activity_events ev
  WHERE ev.candidate_id = c.id
    AND ev.event_type = 'FIRST_LOGIN'
  ORDER BY ev.occurred_at ASC
  LIMIT 1
) ae_first_login ON TRUE
LEFT JOIN LATERAL (
  SELECT nj.*
  FROM notification_jobs nj
  WHERE nj.candidate_id = c.id
    AND nj.channel = 'WHATSAPP'
    AND (nj.template_code = 'RESULT' OR nj.template_code = 'WA_RESULT')
  ORDER BY nj.created_at DESC
  LIMIT 1
) nj_wa ON TRUE
LEFT JOIN LATERAL (
  SELECT ne.*
  FROM notification_events ne
  WHERE ne.job_id = nj_wa.id
  ORDER BY ne.created_at DESC
  LIMIT 1
) ne_last ON TRUE;

CREATE VIEW v_unviewed_results AS
SELECT
  c.id AS candidate_id,
  c.full_name AS student_full_name,
  s.name AS school_name,
  c.grade,
  r.published_at AS result_published_at,
  ae_last_login.occurred_at AS last_login_at,
  COALESCE(nj_wa.status, 'NOT_QUEUED'::notification_status) AS wa_result_status,
  ne_wa.sent_at AS wa_last_sent_at,
  c.campaign_code,
  c.full_name_enc AS student_full_name_enc,
  c.full_name_hash AS student_full_name_hash
FROM results r
JOIN candidates c ON c.id = r.candidate_id
LEFT JOIN schools s ON s.id = c.school_id
LEFT JOIN LATERAL (
  SELECT ev.*
  FROM activity_events ev
  WHERE ev.candidate_id = c.id
    AND ev.event_type = 'LOGIN'
  ORDER BY ev.occurred_at DESC
  LIMIT 1
) ae_last_login ON TRUE
LEFT JOIN LATERAL (
  SELECT nj.*
  FROM notification_jobs nj
  WHERE nj.candidate_id = c.id
    AND nj.channel = 'WHATSAPP'
    AND (nj.template_code = 'RESULT' OR nj.template_code = 'WA_RESULT')
  ORDER BY nj.created_at DESC
  LIMIT 1
) nj_wa ON TRUE
LEFT JOIN LATERAL (
  SELECT ne.*
  FROM notification_events ne
  WHERE ne.job_id = nj_wa.id
  ORDER BY ne.created_at DESC
  LIMIT 1
) ne_wa ON TRUE
WHERE r.published_at IS NOT NULL
  AND r.viewed_at IS NULL;

COMMIT;
