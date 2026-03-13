BEGIN;

CREATE INDEX IF NOT EXISTS idx_notification_jobs_candidate_channel_template_created
  ON notification_jobs (candidate_id, channel, template_code, created_at DESC);

WITH latest_credentials_sms AS (
  SELECT DISTINCT ON (nj.candidate_id)
    nj.candidate_id,
    nj.status
  FROM notification_jobs nj
  WHERE nj.channel = 'SMS'
    AND nj.template_code IN ('CREDENTIALS_SMS', 'LOGIN_CREDENTIALS')
  ORDER BY nj.candidate_id, nj.created_at DESC
)
UPDATE applications a
SET
  credentials_sms_status = latest.status,
  updated_at = NOW()
FROM latest_credentials_sms latest
WHERE a.candidate_id = latest.candidate_id
  AND a.id = (
    SELECT a2.id
    FROM applications a2
    WHERE a2.candidate_id = latest.candidate_id
    ORDER BY a2.created_at DESC
    LIMIT 1
  );

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
  COALESCE(a.status, 'APPLIED'::application_status) AS application_status,
  COALESCE(nj_sms.status, a.credentials_sms_status, 'NOT_QUEUED'::notification_status) AS credentials_sms_status,
  ae_first_login.occurred_at AS first_login_at,
  COALESCE(ea.status, 'WAITING'::exam_status) AS exam_status,
  ea.started_at AS exam_started_at,
  ea.submitted_at AS exam_submitted_at,
  COALESCE(r.status, 'NOT_READY'::result_status) AS result_status,
  r.score AS result_score,
  r.viewed_at AS result_viewed_at,
  COALESCE(nj_wa.status, 'NOT_QUEUED'::notification_status) AS wa_result_status,
  COALESCE(ne_last.error_code, nj_wa.last_error_code, nj_sms.last_error_code) AS last_error_code,
  GREATEST(
    c.updated_at,
    COALESCE(a.updated_at, c.updated_at),
    COALESCE(ea.updated_at, c.updated_at),
    COALESCE(r.updated_at, c.updated_at),
    COALESCE(nj_sms.updated_at, c.updated_at),
    COALESCE(nj_wa.updated_at, c.updated_at)
  ) AS updated_at,
  c.campaign_code
FROM candidates c
LEFT JOIN LATERAL (
  SELECT a2.*
  FROM applications a2
  WHERE a2.candidate_id = c.id
  ORDER BY a2.created_at DESC
  LIMIT 1
) a ON TRUE
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
    AND nj.channel = 'SMS'
    AND nj.template_code IN ('CREDENTIALS_SMS', 'LOGIN_CREDENTIALS')
  ORDER BY nj.created_at DESC
  LIMIT 1
) nj_sms ON TRUE
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
  COALESCE(ne_wa.read_at, ne_wa.delivered_at, ne_wa.sent_at, ne_wa.created_at) AS wa_last_sent_at,
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
