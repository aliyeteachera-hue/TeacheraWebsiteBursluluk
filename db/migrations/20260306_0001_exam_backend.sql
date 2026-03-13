BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
    CREATE TYPE application_status AS ENUM ('APPLIED', 'DUPLICATE_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN
    CREATE TYPE notification_status AS ENUM ('NOT_QUEUED', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'RETRYING', 'DLQ', 'CANCELLED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exam_status') THEN
    CREATE TYPE exam_status AS ENUM ('WAITING', 'OPEN', 'STARTED', 'SUBMITTED', 'TIMEOUT', 'ABANDONED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'result_status') THEN
    CREATE TYPE result_status AS ENUM ('NOT_READY', 'PUBLISHED', 'VIEWED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel') THEN
    CREATE TYPE notification_channel AS ENUM ('SMS', 'WHATSAPP');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS campaigns (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  district TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone_e164 TEXT NOT NULL UNIQUE,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_code TEXT NOT NULL REFERENCES campaigns(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  full_name TEXT NOT NULL,
  grade SMALLINT NOT NULL CHECK (grade BETWEEN 2 AND 11),
  school_id UUID REFERENCES schools(id) ON UPDATE CASCADE ON DELETE SET NULL,
  guardian_id UUID REFERENCES guardians(id) ON UPDATE CASCADE ON DELETE SET NULL,
  age_range TEXT,
  preferred_language TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_campaign_created ON candidates (campaign_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_school_grade ON candidates (school_id, grade);
CREATE INDEX IF NOT EXISTS idx_candidates_guardian ON candidates (guardian_id);

CREATE SEQUENCE IF NOT EXISTS application_no_seq START WITH 100000;

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON UPDATE CASCADE ON DELETE CASCADE,
  campaign_code TEXT NOT NULL REFERENCES campaigns(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  application_no TEXT NOT NULL UNIQUE DEFAULT (
    TO_CHAR(NOW() AT TIME ZONE 'Europe/Istanbul', 'YYYYMMDD') || '-' || LPAD(nextval('application_no_seq')::TEXT, 6, '0')
  ),
  status application_status NOT NULL DEFAULT 'APPLIED',
  credentials_sms_status notification_status NOT NULL DEFAULT 'NOT_QUEUED',
  dedupe_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications (candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_campaign_status ON applications (campaign_code, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_sms_status ON applications (credentials_sms_status, updated_at DESC);

CREATE TABLE IF NOT EXISTS exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON UPDATE CASCADE ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES applications(id) ON UPDATE CASCADE ON DELETE CASCADE,
  campaign_code TEXT NOT NULL REFERENCES campaigns(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  exam_language TEXT NOT NULL,
  exam_age_range TEXT NOT NULL,
  bank_key TEXT,
  question_count INTEGER NOT NULL DEFAULT 0,
  status exam_status NOT NULL DEFAULT 'WAITING',
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  completion_status TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_candidate ON exam_attempts (candidate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON exam_attempts (status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_campaign_started ON exam_attempts (campaign_code, started_at DESC);

CREATE TABLE IF NOT EXISTS exam_answers (
  attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON UPDATE CASCADE ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_option TEXT,
  is_correct BOOLEAN,
  question_weight NUMERIC(8,2) NOT NULL DEFAULT 1,
  score_delta NUMERIC(8,2) NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_exam_answers_attempt ON exam_answers (attempt_id, answered_at DESC);

CREATE TABLE IF NOT EXISTS exam_session_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON UPDATE CASCADE ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exam_session_tokens_attempt ON exam_session_tokens (attempt_id, expires_at DESC);

CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL UNIQUE REFERENCES exam_attempts(id) ON UPDATE CASCADE ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON UPDATE CASCADE ON DELETE CASCADE,
  campaign_code TEXT NOT NULL REFERENCES campaigns(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  status result_status NOT NULL DEFAULT 'NOT_READY',
  score NUMERIC(5,2),
  percentage NUMERIC(5,2),
  correct_count INTEGER,
  wrong_count INTEGER,
  unanswered_count INTEGER,
  placement_label TEXT,
  cefr_band TEXT,
  published_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_results_status_published ON results (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_results_campaign_created ON results (campaign_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_results_viewed ON results (viewed_at);

CREATE TABLE IF NOT EXISTS activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON UPDATE CASCADE ON DELETE CASCADE,
  attempt_id UUID REFERENCES exam_attempts(id) ON UPDATE CASCADE ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_events_candidate_type ON activity_events (candidate_id, event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_events_attempt ON activity_events (attempt_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_code TEXT NOT NULL REFERENCES campaigns(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  candidate_id UUID REFERENCES candidates(id) ON UPDATE CASCADE ON DELETE SET NULL,
  attempt_id UUID REFERENCES exam_attempts(id) ON UPDATE CASCADE ON DELETE SET NULL,
  result_id UUID REFERENCES results(id) ON UPDATE CASCADE ON DELETE SET NULL,
  channel notification_channel NOT NULL,
  template_code TEXT NOT NULL,
  recipient TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status notification_status NOT NULL DEFAULT 'NOT_QUEUED',
  retry_count INTEGER NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  provider_message_id TEXT,
  last_error_code TEXT,
  enqueued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_status_retry ON notification_jobs (status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_candidate ON notification_jobs (candidate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_channel_status ON notification_jobs (channel, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_jobs_campaign ON notification_jobs (campaign_code, created_at DESC);

CREATE TABLE IF NOT EXISTS notification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES notification_jobs(id) ON UPDATE CASCADE ON DELETE CASCADE,
  provider_message_id TEXT,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_events_job_created ON notification_events (job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_events_provider_message_id ON notification_events (provider_message_id);

CREATE TABLE IF NOT EXISTS dlq_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_job_id UUID REFERENCES notification_jobs(id) ON UPDATE CASCADE ON DELETE SET NULL,
  channel notification_channel NOT NULL,
  campaign_code TEXT NOT NULL REFERENCES campaigns(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  candidate_id UUID REFERENCES candidates(id) ON UPDATE CASCADE ON DELETE SET NULL,
  error_code TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'OPEN',
  root_cause_note TEXT,
  assigned_to TEXT,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dlq_jobs_status_created ON dlq_jobs (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dlq_jobs_channel_error ON dlq_jobs (channel, error_code, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_dlq_jobs_source_job_id ON dlq_jobs (source_job_id) WHERE source_job_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO campaigns (code, name, is_active)
VALUES ('2026_BURSLULUK', '2026 Bursluluk Kampanyası', TRUE)
ON CONFLICT (code) DO NOTHING;

DROP VIEW IF EXISTS v_candidate_operations;
DROP VIEW IF EXISTS v_unviewed_results;
DROP VIEW IF EXISTS v_notifications;

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
  c.campaign_code
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

CREATE VIEW v_notifications AS
SELECT
  nj.id AS job_id,
  nj.channel,
  nj.template_code,
  nj.recipient,
  nj.status,
  nj.retry_count,
  nj.next_retry_at,
  COALESCE(ne.provider_message_id, nj.provider_message_id) AS provider_message_id,
  ne.sent_at,
  ne.delivered_at,
  ne.read_at,
  COALESCE(ne.error_code, nj.last_error_code) AS error_code,
  nj.campaign_code,
  nj.created_at
FROM notification_jobs nj
LEFT JOIN LATERAL (
  SELECT ne2.*
  FROM notification_events ne2
  WHERE ne2.job_id = nj.id
  ORDER BY ne2.created_at DESC
  LIMIT 1
) ne ON TRUE;

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
  c.campaign_code
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
