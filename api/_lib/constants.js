export const TIMEZONE = 'Europe/Istanbul';

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OPERATIONS: 'OPERATIONS',
  READ_ONLY: 'READ_ONLY',
};

export const APPLICATION_STATUS = [
  'APPLIED',
  'DUPLICATE_REVIEW',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
];

export const CREDENTIALS_SMS_STATUS = [
  'NOT_QUEUED',
  'QUEUED',
  'SENT',
  'DELIVERED',
  'FAILED',
  'RETRYING',
  'DLQ',
];

export const EXAM_STATUS = [
  'WAITING',
  'OPEN',
  'STARTED',
  'SUBMITTED',
  'TIMEOUT',
  'ABANDONED',
];

export const RESULT_STATUS = ['NOT_READY', 'PUBLISHED', 'VIEWED'];

export const WA_RESULT_STATUS = [
  'NOT_QUEUED',
  'QUEUED',
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED',
  'RETRYING',
  'DLQ',
];

export const NOTIFICATION_CHANNELS = ['SMS', 'WHATSAPP'];

export const CANDIDATE_GRID_COLUMNS = [
  'candidate_id',
  'application_no',
  'student_full_name',
  'grade',
  'school_name',
  'parent_full_name',
  'parent_phone_e164',
  'application_status',
  'credentials_sms_status',
  'first_login_at',
  'exam_status',
  'exam_started_at',
  'exam_submitted_at',
  'result_status',
  'result_score',
  'result_viewed_at',
  'wa_result_status',
  'last_error_code',
  'updated_at',
];

export const NOTIFICATION_GRID_COLUMNS = [
  'job_id',
  'channel',
  'template_code',
  'recipient',
  'status',
  'retry_count',
  'next_retry_at',
  'provider_message_id',
  'sent_at',
  'delivered_at',
  'read_at',
  'error_code',
];

export const UNVIEWED_RESULTS_COLUMNS = [
  'candidate_id',
  'student_full_name',
  'school_name',
  'grade',
  'result_published_at',
  'last_login_at',
  'wa_result_status',
  'wa_last_sent_at',
];

export const JOB_STATUS = [
  'NOT_QUEUED',
  'QUEUED',
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED',
  'RETRYING',
  'DLQ',
  'CANCELLED',
];

