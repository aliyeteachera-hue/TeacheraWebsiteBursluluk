import { safeTrim } from './http.js';

function readExpectedLoadTestKey() {
  return safeTrim(
    process.env.LOAD_TEST_BYPASS_KEY
    || process.env.CRON_SECRET
    || process.env.NOTIFICATION_WORKER_SECRET,
  );
}

export function isAuthorizedLoadTestMode(req) {
  const mode = safeTrim(req.headers?.['x-load-test-mode']).toLowerCase();
  if (!mode) return false;

  const key = safeTrim(req.headers?.['x-load-test-key']);
  const expected = readExpectedLoadTestKey();
  if (!key || !expected || key !== expected) return false;

  return mode === 'throughput' || mode === 'cert' || mode === 'p0_11';
}

