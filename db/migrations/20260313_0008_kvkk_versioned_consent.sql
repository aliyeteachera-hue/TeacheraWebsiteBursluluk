BEGIN;

CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_code TEXT NOT NULL REFERENCES campaigns(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON UPDATE CASCADE ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON UPDATE CASCADE ON DELETE SET NULL,
  attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON UPDATE CASCADE ON DELETE CASCADE,
  consent_scope TEXT NOT NULL CHECK (consent_scope IN ('KVKK', 'WHATSAPP', 'YURTDISI_AKTARIM')),
  consent_granted BOOLEAN NOT NULL,
  consent_version TEXT NOT NULL,
  legal_text_version TEXT,
  contact_consent BOOLEAN NOT NULL DEFAULT FALSE,
  consent_source TEXT NOT NULL DEFAULT 'exam_session_start',
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_consent_records_attempt_scope
  ON consent_records (attempt_id, consent_scope);

CREATE INDEX IF NOT EXISTS idx_consent_records_candidate_scope_consented
  ON consent_records (candidate_id, consent_scope, consented_at DESC);

CREATE INDEX IF NOT EXISTS idx_consent_records_campaign_scope_consented
  ON consent_records (campaign_code, consent_scope, consented_at DESC);

CREATE INDEX IF NOT EXISTS idx_consent_records_version
  ON consent_records (consent_version, legal_text_version);

COMMIT;
