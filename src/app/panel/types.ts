export type PanelRole = 'SUPER_ADMIN' | 'OPERATIONS' | 'READ_ONLY';

export interface PanelListResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  summary?: Record<string, unknown>;
}

export interface PanelDashboardPayload {
  generated_at: string;
  kpis: {
    total_applications: number;
    sms_success_pct: number;
    first_login_pct: number;
    exam_completion_pct: number;
    result_viewed_pct: number;
    wa_reach_pct: number;
  };
  charts: {
    hourly_applications: Array<{ hour_utc: string; count: number }>;
    notification_success_by_channel: Array<{
      channel: 'SMS' | 'WHATSAPP';
      total: number;
      sent: number;
      delivered: number;
      failed: number;
      success_pct: number;
    }>;
    school_grade_distribution: Array<{
      school_name: string;
      grade: number | null;
      count: number;
    }>;
  };
  operations: {
    dlq_job_count: number;
    critical_error_codes: Array<{ error_code: string; count: number }>;
    failed_last_30_minutes: number;
    failed_last_24_hours: number;
  };
}

export interface PanelCandidateRow {
  candidate_id: string;
  application_no: string;
  student_full_name: string;
  grade: number | null;
  school_id: string | null;
  school_name: string;
  parent_full_name: string;
  parent_phone_e164: string;
  application_status: string;
  credentials_sms_status: string;
  first_login_at: string | null;
  exam_status: string;
  exam_started_at: string | null;
  exam_submitted_at: string | null;
  result_status: string;
  result_score: number | null;
  result_viewed_at: string | null;
  result_published_at: string | null;
  wa_result_status: string;
  wa_last_sent_at: string | null;
  last_error_code: string | null;
  updated_at: string;
  created_at: string | null;
  application_id: string;
  campaign_code: string;
}

export interface PanelNotificationRow {
  job_id: string;
  channel: 'SMS' | 'WHATSAPP';
  template_code: string;
  recipient: string;
  status: string;
  retry_count: number;
  next_retry_at: string | null;
  provider_message_id: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  error_code: string | null;
  campaign_code: string;
  created_at: string | null;
  updated_at: string | null;
  candidate_id: string | null;
  application_id: string | null;
}

export interface PanelUnviewedRow {
  candidate_id: string;
  student_full_name: string;
  school_name: string;
  grade: number;
  result_published_at: string;
  last_login_at: string | null;
  wa_result_status: string;
  wa_last_sent_at: string | null;
  campaign_code: string;
  application_id: string;
  updated_at: string;
}

export interface PanelDlqRow {
  job_id: string;
  channel: 'SMS' | 'WHATSAPP';
  template_code: string;
  recipient: string;
  status: string;
  retry_count: number;
  error_code: string;
  root_cause_note: string;
  assigned_to: string;
  campaign_code: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface PanelSettingsPayload {
  campaign_code: string;
  poll_interval_seconds: number;
  result_release_at: string | null;
  message_templates: {
    credentials_sms_template: string;
    result_wa_template: string;
  };
  school_count: number;
  available_roles: PanelRole[];
  user_role: PanelRole;
  updated_at: string;
}

export interface PanelActionResult {
  affected: number;
  queued_jobs?: number;
}
