import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { seedPanelMockData } from './seed_panel_mock_data.mjs';

const thisFile = fileURLToPath(import.meta.url);

function parseCountArg(value, fallback = 160) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[String(name).toLowerCase()] = value;
      return this;
    },
    end(body = '') {
      this.body = body;
      return this;
    },
  };
}

async function invoke(handler, { method = 'GET', query = {}, headers = {}, body = null } = {}) {
  const req = {
    method,
    query,
    headers,
    body,
  };
  const res = createMockRes();
  await handler(req, res);

  let json = null;
  if (typeof res.body === 'string' && res.body.trim()) {
    try {
      json = JSON.parse(res.body);
    } catch {
      json = null;
    }
  }

  return { req, res, json };
}

async function runSmoke() {
  const count = parseCountArg(process.argv[2], 160);
  const storePath = process.env.BURSLULUK_STORE_PATH || `/tmp/teachera-bursluluk-store-smoke-${Date.now()}.json`;

  process.env.BURSLULUK_STORE_PATH = storePath;
  process.env.BURSLULUK_ADMIN_KEY = process.env.BURSLULUK_ADMIN_KEY || 'smoke-admin-key';
  process.env.DEFAULT_CAMPAIGN_CODE = process.env.DEFAULT_CAMPAIGN_CODE || '2026_BURSLULUK';
  process.env.NOTIFICATION_RETRY_LIMIT = process.env.NOTIFICATION_RETRY_LIMIT || '5';

  const seedSummary = await seedPanelMockData({ count, storePath });

  const dashboardHandler = (await import('../api/panel/dashboard.js')).default;
  const candidatesHandler = (await import('../api/panel/candidates/index.js')).default;
  const candidateActionsHandler = (await import('../api/panel/candidates/actions.js')).default;
  const notificationsHandler = (await import('../api/panel/notifications/index.js')).default;
  const dlqHandler = (await import('../api/panel/dlq/index.js')).default;
  const settingsHandler = (await import('../api/panel/settings.js')).default;

  const adminHeaders = {
    'x-admin-key': process.env.BURSLULUK_ADMIN_KEY,
    'x-admin-role': 'SUPER_ADMIN',
  };

  const dashboardBefore = await invoke(dashboardHandler, {
    method: 'GET',
    headers: adminHeaders,
  });

  assert(dashboardBefore.res.statusCode === 200, `dashboard status expected 200, got ${dashboardBefore.res.statusCode}`);
  assert(dashboardBefore.json?.ok === true, 'dashboard ok flag is missing');
  assert(
    dashboardBefore.json?.kpis?.total_applications === count,
    `dashboard total_applications expected ${count}, got ${dashboardBefore.json?.kpis?.total_applications}`,
  );
  assert(
    Array.isArray(dashboardBefore.json?.charts?.hourly_applications) &&
      dashboardBefore.json.charts.hourly_applications.length === 24,
    'dashboard hourly_applications must include 24 buckets',
  );

  const candidates = await invoke(candidatesHandler, {
    method: 'GET',
    headers: adminHeaders,
    query: {
      page: '1',
      per_page: '1',
      sort_by: 'updated_at',
      sort_order: 'desc',
    },
  });

  assert(candidates.res.statusCode === 200, `candidates status expected 200, got ${candidates.res.statusCode}`);
  assert(Array.isArray(candidates.json?.items), 'candidates items list missing');
  assert(candidates.json?.total === count, `candidates total expected ${count}, got ${candidates.json?.total}`);
  assert(candidates.json.items.length === 1, 'candidates per_page=1 did not apply');

  const candidateId = candidates.json.items[0]?.candidate_id;
  assert(candidateId, 'candidate_id is missing in candidates response');

  const notificationsBefore = await invoke(notificationsHandler, {
    method: 'GET',
    headers: adminHeaders,
    query: { page: '1', per_page: '200' },
  });
  assert(notificationsBefore.res.statusCode === 200, `notifications status expected 200, got ${notificationsBefore.res.statusCode}`);

  const actionResult = await invoke(candidateActionsHandler, {
    method: 'POST',
    headers: {
      ...adminHeaders,
      'content-type': 'application/json',
    },
    body: {
      action: 'sms_retry',
      candidate_ids: [candidateId],
    },
  });

  assert(actionResult.res.statusCode === 200, `candidate action status expected 200, got ${actionResult.res.statusCode}`);
  assert(actionResult.json?.affected === 1, `candidate action affected expected 1, got ${actionResult.json?.affected}`);
  assert(actionResult.json?.queued_jobs === 1, `candidate action queued_jobs expected 1, got ${actionResult.json?.queued_jobs}`);

  const notificationsAfter = await invoke(notificationsHandler, {
    method: 'GET',
    headers: adminHeaders,
    query: { page: '1', per_page: '200' },
  });

  assert(
    notificationsAfter.json?.total === notificationsBefore.json?.total + 1,
    `notification total should increase by 1 after sms_retry action (before=${notificationsBefore.json?.total}, after=${notificationsAfter.json?.total})`,
  );

  const dlq = await invoke(dlqHandler, {
    method: 'GET',
    headers: adminHeaders,
    query: { page: '1', per_page: '50' },
  });

  assert(dlq.res.statusCode === 200, `dlq status expected 200, got ${dlq.res.statusCode}`);
  assert(Number(dlq.json?.total || 0) > 0, 'dlq should contain at least one item in seeded data');

  const settings = await invoke(settingsHandler, {
    method: 'GET',
    headers: adminHeaders,
  });

  assert(settings.res.statusCode === 200, `settings status expected 200, got ${settings.res.statusCode}`);
  assert(settings.json?.campaign_code === process.env.DEFAULT_CAMPAIGN_CODE, 'settings campaign_code mismatch');

  const dashboardAfter = await invoke(dashboardHandler, {
    method: 'GET',
    headers: adminHeaders,
  });

  assert(dashboardAfter.res.statusCode === 200, `dashboard (after action) status expected 200, got ${dashboardAfter.res.statusCode}`);
  assert(dashboardAfter.json?.kpis?.total_applications === count, 'dashboard total_applications changed unexpectedly after action');

  console.log('[smoke] panel dashboard smoke passed');
  console.log(
    JSON.stringify(
      {
        storePath,
        seeded: seedSummary,
        dashboardTotal: dashboardAfter.json.kpis.total_applications,
        dlqTotal: dlq.json.total,
        notificationsBefore: notificationsBefore.json.total,
        notificationsAfter: notificationsAfter.json.total,
      },
      null,
      2,
    ),
  );
}

if (resolve(process.argv[1] || '') === thisFile) {
  runSmoke().catch((error) => {
    console.error('[smoke] failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
