import { safeTrim } from './http.js';

function readValue(name, fallback = '') {
  return safeTrim(process.env[name] || fallback);
}

export function requireEnv(name) {
  const value = readValue(name);
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export function readDefaultCampaignCode() {
  return readValue('DEFAULT_CAMPAIGN_CODE', '2026_BURSLULUK');
}

export function readExamSessionTtlMinutes() {
  const raw = Number.parseInt(readValue('EXAM_SESSION_TTL_MINUTES', '180'), 10);
  if (!Number.isFinite(raw) || raw < 10) return 180;
  return Math.min(raw, 24 * 60);
}

export function readNotificationRetryLimit() {
  const raw = Number.parseInt(readValue('NOTIFICATION_RETRY_LIMIT', '5'), 10);
  if (!Number.isFinite(raw) || raw < 0) return 5;
  return Math.min(raw, 25);
}
