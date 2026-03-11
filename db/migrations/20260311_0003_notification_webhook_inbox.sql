CREATE TABLE IF NOT EXISTS notification_webhook_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL DEFAULT 'generic',
  job_id UUID,
  provider_message_id TEXT,
  client_reference_id TEXT,
  event_status TEXT NOT NULL,
  error_code TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  headers JSONB NOT NULL DEFAULT '{}'::jsonb,
  signature_valid BOOLEAN NOT NULL DEFAULT FALSE,
  reconciliation_status TEXT NOT NULL DEFAULT 'PENDING',
  reconcile_attempt_count INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_job_id UUID REFERENCES notification_jobs(id) ON UPDATE CASCADE ON DELETE SET NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  last_error TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_notification_webhook_inbox_reconciliation_status
    CHECK (reconciliation_status IN ('PENDING', 'APPLIED', 'DROPPED'))
);

CREATE INDEX IF NOT EXISTS idx_notification_webhook_inbox_reconcile
  ON notification_webhook_inbox (reconciliation_status, next_attempt_at, received_at);

CREATE INDEX IF NOT EXISTS idx_notification_webhook_inbox_provider_message
  ON notification_webhook_inbox (provider_message_id);

CREATE INDEX IF NOT EXISTS idx_notification_webhook_inbox_client_reference
  ON notification_webhook_inbox (client_reference_id);

CREATE INDEX IF NOT EXISTS idx_notification_webhook_inbox_job
  ON notification_webhook_inbox (job_id);
