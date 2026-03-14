BEGIN;

CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_code TEXT NOT NULL REFERENCES campaigns(code) ON UPDATE CASCADE ON DELETE RESTRICT,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON UPDATE CASCADE ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON UPDATE CASCADE ON DELETE SET NULL,
  channel notification_channel NOT NULL DEFAULT 'SMS',
  template_code TEXT NOT NULL DEFAULT 'CREDENTIALS_SMS',
  notification_job_id UUID UNIQUE REFERENCES notification_jobs(id) ON UPDATE CASCADE ON DELETE SET NULL,
  status notification_status NOT NULL DEFAULT 'NOT_QUEUED',
  provider_message_id TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  last_error_code TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credentials_candidate_created
  ON credentials (candidate_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credentials_campaign_status_created
  ON credentials (campaign_code, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credentials_channel_status_created
  ON credentials (channel, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credentials_application_created
  ON credentials (application_id, created_at DESC);

CREATE OR REPLACE FUNCTION sync_credentials_from_notification_job()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  latest_application_id UUID;
BEGIN
  IF NEW.candidate_id IS NULL
     OR NEW.channel <> 'SMS'
     OR UPPER(COALESCE(NEW.template_code, '')) NOT IN ('CREDENTIALS_SMS', 'LOGIN_CREDENTIALS') THEN
    RETURN NEW;
  END IF;

  SELECT a.id
  INTO latest_application_id
  FROM applications a
  WHERE a.candidate_id = NEW.candidate_id
  ORDER BY a.created_at DESC
  LIMIT 1;

  -- Backward-compatibility: keep legacy snapshot field in sync.
  IF latest_application_id IS NOT NULL THEN
    UPDATE applications
    SET
      credentials_sms_status = NEW.status,
      updated_at = NOW()
    WHERE id = latest_application_id;
  END IF;

  INSERT INTO credentials (
    campaign_code,
    candidate_id,
    application_id,
    channel,
    template_code,
    notification_job_id,
    status,
    provider_message_id,
    sent_at,
    delivered_at,
    read_at,
    last_error_code,
    metadata,
    updated_at
  )
  VALUES (
    NEW.campaign_code,
    NEW.candidate_id,
    latest_application_id,
    NEW.channel,
    NEW.template_code,
    NEW.id,
    NEW.status,
    NEW.provider_message_id,
    CASE WHEN NEW.status IN ('SENT', 'DELIVERED', 'READ') THEN NOW() ELSE NULL END,
    CASE WHEN NEW.status IN ('DELIVERED', 'READ') THEN NOW() ELSE NULL END,
    CASE WHEN NEW.status = 'READ' THEN NOW() ELSE NULL END,
    NEW.last_error_code,
    jsonb_build_object(
      'source', 'notification_jobs_trigger',
      'retry_count', NEW.retry_count
    ),
    NOW()
  )
  ON CONFLICT (notification_job_id)
  DO UPDATE SET
    campaign_code = EXCLUDED.campaign_code,
    candidate_id = EXCLUDED.candidate_id,
    application_id = EXCLUDED.application_id,
    channel = EXCLUDED.channel,
    template_code = EXCLUDED.template_code,
    status = EXCLUDED.status,
    provider_message_id = COALESCE(EXCLUDED.provider_message_id, credentials.provider_message_id),
    sent_at = CASE
      WHEN EXCLUDED.status IN ('SENT', 'DELIVERED', 'READ') THEN COALESCE(credentials.sent_at, NOW())
      ELSE credentials.sent_at
    END,
    delivered_at = CASE
      WHEN EXCLUDED.status IN ('DELIVERED', 'READ') THEN COALESCE(credentials.delivered_at, NOW())
      ELSE credentials.delivered_at
    END,
    read_at = CASE
      WHEN EXCLUDED.status = 'READ' THEN COALESCE(credentials.read_at, NOW())
      ELSE credentials.read_at
    END,
    last_error_code = EXCLUDED.last_error_code,
    metadata = credentials.metadata || EXCLUDED.metadata,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_credentials_from_notification_job ON notification_jobs;

CREATE TRIGGER trg_sync_credentials_from_notification_job
AFTER INSERT OR UPDATE OF status, provider_message_id, last_error_code, retry_count
ON notification_jobs
FOR EACH ROW
EXECUTE FUNCTION sync_credentials_from_notification_job();

-- Backfill from historical credentials notification jobs.
INSERT INTO credentials (
  campaign_code,
  candidate_id,
  application_id,
  channel,
  template_code,
  notification_job_id,
  status,
  provider_message_id,
  sent_at,
  delivered_at,
  read_at,
  last_error_code,
  metadata,
  created_at,
  updated_at
)
SELECT
  nj.campaign_code,
  nj.candidate_id,
  latest_app.id AS application_id,
  nj.channel,
  nj.template_code,
  nj.id,
  nj.status,
  nj.provider_message_id,
  ne_agg.sent_at,
  ne_agg.delivered_at,
  ne_agg.read_at,
  nj.last_error_code,
  jsonb_build_object(
    'source', 'notification_jobs_backfill',
    'retry_count', nj.retry_count
  ),
  COALESCE(nj.enqueued_at, nj.created_at, NOW()),
  COALESCE(nj.updated_at, NOW())
FROM notification_jobs nj
LEFT JOIN LATERAL (
  SELECT a.id
  FROM applications a
  WHERE a.candidate_id = nj.candidate_id
  ORDER BY a.created_at DESC
  LIMIT 1
) latest_app ON TRUE
LEFT JOIN LATERAL (
  SELECT
    MIN(ne.sent_at) AS sent_at,
    MIN(ne.delivered_at) AS delivered_at,
    MIN(ne.read_at) AS read_at
  FROM notification_events ne
  WHERE ne.job_id = nj.id
) ne_agg ON TRUE
WHERE nj.candidate_id IS NOT NULL
  AND nj.channel = 'SMS'
  AND UPPER(COALESCE(nj.template_code, '')) IN ('CREDENTIALS_SMS', 'LOGIN_CREDENTIALS')
ON CONFLICT (notification_job_id)
DO UPDATE SET
  status = EXCLUDED.status,
  provider_message_id = COALESCE(EXCLUDED.provider_message_id, credentials.provider_message_id),
  sent_at = COALESCE(credentials.sent_at, EXCLUDED.sent_at),
  delivered_at = COALESCE(credentials.delivered_at, EXCLUDED.delivered_at),
  read_at = COALESCE(credentials.read_at, EXCLUDED.read_at),
  last_error_code = EXCLUDED.last_error_code,
  metadata = credentials.metadata || EXCLUDED.metadata,
  updated_at = NOW();

-- Fallback backfill for legacy rows that only have application snapshot status.
INSERT INTO credentials (
  campaign_code,
  candidate_id,
  application_id,
  channel,
  template_code,
  status,
  metadata,
  created_at,
  updated_at
)
SELECT
  a.campaign_code,
  a.candidate_id,
  a.id,
  'SMS'::notification_channel,
  'CREDENTIALS_SMS',
  a.credentials_sms_status,
  jsonb_build_object('source', 'applications_backfill_fallback'),
  a.created_at,
  NOW()
FROM applications a
WHERE a.credentials_sms_status <> 'NOT_QUEUED'
  AND NOT EXISTS (
    SELECT 1
    FROM credentials c
    WHERE c.application_id = a.id
      AND c.channel = 'SMS'
  );

COMMIT;
