function trim(value) {
  return String(value || '').trim();
}

function readAnyEnv(names) {
  for (const name of names) {
    const value = trim(process.env[name]);
    if (value) return { name, value };
  }
  return { name: null, value: '' };
}

function parseArg(name, fallback = '') {
  const prefix = `${name}=`;
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith(prefix)) return trim(arg.slice(prefix.length));
  }
  return fallback;
}

function pushCheck(checks, id, ok, detail, evidence = {}) {
  checks.push({
    id,
    status: ok ? 'PASS' : 'FAIL',
    detail,
    evidence,
  });
}

function splitHosts(raw) {
  return String(raw || '')
    .split(',')
    .map((item) => trim(item).toLowerCase())
    .filter(Boolean);
}

function runServiceChecks(service) {
  const checks = [];
  const canonicalHostByService = {
    www: 'teachera.com.tr',
    'exam-api': 'exam-api.teachera.com.tr',
    'panel-api': 'panel-api.teachera.com.tr',
    'ops-api': 'ops-api.teachera.com.tr',
  };

  if (service === 'www') {
    const site = readAnyEnv(['VITE_SITE_URL']);
    pushCheck(checks, 'www_site_url', Boolean(site.value), site.value ? `${site.name} is set.` : 'Missing VITE_SITE_URL.');

    const examBase = readAnyEnv(['VITE_EXAM_API_BASE', 'EXAM_API_BASE_URL']);
    pushCheck(
      checks,
      'www_exam_api_base',
      Boolean(examBase.value),
      examBase.value ? `${examBase.name} is set.` : 'Missing VITE_EXAM_API_BASE or EXAM_API_BASE_URL.',
    );

    const panelBase = readAnyEnv(['VITE_PANEL_API_BASE', 'PANEL_API_BASE_URL']);
    pushCheck(
      checks,
      'www_panel_api_base',
      Boolean(panelBase.value),
      panelBase.value ? `${panelBase.name} is set.` : 'Missing VITE_PANEL_API_BASE or PANEL_API_BASE_URL.',
    );

    return checks;
  }

  const runtime = readAnyEnv(['SERVICE_RUNTIME']);
  pushCheck(
    checks,
    `${service}_runtime_name`,
    runtime.value === service,
    runtime.value
      ? `SERVICE_RUNTIME=${runtime.value}${runtime.value === service ? '' : ` (expected ${service})`}`
      : `Missing SERVICE_RUNTIME (expected ${service}).`,
  );

  const guardMode = readAnyEnv(['SERVICE_HOST_GUARD_MODE']);
  pushCheck(
    checks,
    `${service}_host_guard_mode`,
    guardMode.value.toLowerCase() === 'enforce',
    guardMode.value
      ? `SERVICE_HOST_GUARD_MODE=${guardMode.value} (expected enforce).`
      : 'Missing SERVICE_HOST_GUARD_MODE (expected enforce).',
  );

  const corsGuardMode = readAnyEnv(['CORS_GUARD_MODE']);
  const corsGuardEffective = corsGuardMode.value ? corsGuardMode.value.toLowerCase() : 'enforce(default)';
  pushCheck(
    checks,
    `${service}_cors_guard_mode`,
    !corsGuardMode.value || corsGuardMode.value.toLowerCase() === 'enforce',
    corsGuardMode.value
      ? `CORS_GUARD_MODE=${corsGuardMode.value} (expected enforce).`
      : `CORS_GUARD_MODE is unset; secure default applies (${corsGuardEffective}).`,
  );

  const expectedHostSource = readAnyEnv(['EXPECTED_SERVICE_HOST']);
  const expectedHost = trim(expectedHostSource.value).toLowerCase();
  const expectedHosts = splitHosts(readAnyEnv(['EXPECTED_SERVICE_HOSTS']).value);
  pushCheck(
    checks,
    `${service}_expected_service_host_declared`,
    Boolean(expectedHost),
    expectedHost ? `${expectedHostSource.name} is set.` : 'Missing EXPECTED_SERVICE_HOST (mandatory).',
  );

  const canonicalHost = canonicalHostByService[service];
  pushCheck(
    checks,
    `${service}_expected_service_host_matches_canonical`,
    expectedHost === canonicalHost,
    expectedHost === canonicalHost
      ? `EXPECTED_SERVICE_HOST matches canonical: ${canonicalHost}.`
      : `EXPECTED_SERVICE_HOST must be ${canonicalHost}.`,
    { expected_service_host: expectedHost || null },
  );

  if (expectedHosts.length > 0) {
    pushCheck(
      checks,
      `${service}_expected_service_hosts_contains_expected_service_host`,
      expectedHosts.includes(expectedHost),
      expectedHosts.includes(expectedHost)
        ? 'EXPECTED_SERVICE_HOSTS includes EXPECTED_SERVICE_HOST.'
        : 'EXPECTED_SERVICE_HOSTS does not include EXPECTED_SERVICE_HOST.',
      { expected_service_host: expectedHost, expected_service_hosts: expectedHosts },
    );
  }

  const db = readAnyEnv(['DATABASE_URL', 'POSTGRES_URL']);
  pushCheck(
    checks,
    `${service}_database_url`,
    Boolean(db.value),
    db.value ? `${db.name} is set.` : 'Missing DATABASE_URL or POSTGRES_URL.',
  );

  const redis = readAnyEnv(['REDIS_URL']);
  pushCheck(
    checks,
    `${service}_redis_url`,
    Boolean(redis.value),
    redis.value ? 'REDIS_URL is set.' : 'Missing REDIS_URL.',
  );

  if (service === 'exam-api') {
    const campaign = readAnyEnv(['DEFAULT_CAMPAIGN_CODE']);
    pushCheck(
      checks,
      'exam_api_default_campaign',
      Boolean(campaign.value),
      campaign.value ? 'DEFAULT_CAMPAIGN_CODE is set.' : 'Missing DEFAULT_CAMPAIGN_CODE.',
    );

    const turnstile = readAnyEnv(['TURNSTILE_SECRET_KEY']);
    pushCheck(
      checks,
      'exam_api_turnstile_secret',
      Boolean(turnstile.value),
      turnstile.value ? 'TURNSTILE_SECRET_KEY is set.' : 'Missing TURNSTILE_SECRET_KEY.',
    );
  }

  if (service === 'panel-api') {
    const panelSecret = readAnyEnv(['PANEL_SESSION_SECRET']);
    pushCheck(
      checks,
      'panel_api_session_secret',
      Boolean(panelSecret.value),
      panelSecret.value ? 'PANEL_SESSION_SECRET is set.' : 'Missing PANEL_SESSION_SECRET.',
    );

    const idleTimeout = readAnyEnv(['PANEL_SESSION_IDLE_TIMEOUT_MINUTES']);
    pushCheck(
      checks,
      'panel_api_session_idle_timeout',
      true,
      idleTimeout.value
        ? 'PANEL_SESSION_IDLE_TIMEOUT_MINUTES is set.'
        : 'PANEL_SESSION_IDLE_TIMEOUT_MINUTES is unset; secure default will be used.',
    );

    const maxActiveSessions = readAnyEnv(['PANEL_MAX_ACTIVE_SESSIONS']);
    pushCheck(
      checks,
      'panel_api_max_active_sessions',
      true,
      maxActiveSessions.value
        ? 'PANEL_MAX_ACTIVE_SESSIONS is set.'
        : 'PANEL_MAX_ACTIVE_SESSIONS is unset; secure default will be used.',
    );
  }

  if (service === 'ops-api') {
    const workerRuntimeOwner = readAnyEnv(['NOTIFICATION_WORKER_RUNTIME']);
    const workerRuntimeOwnerValue = workerRuntimeOwner.value.toLowerCase() || 'ops-api';
    pushCheck(
      checks,
      'ops_api_worker_runtime_owner',
      workerRuntimeOwnerValue === 'ops-api',
      workerRuntimeOwner.value
        ? `NOTIFICATION_WORKER_RUNTIME=${workerRuntimeOwner.value} (expected ops-api).`
        : 'NOTIFICATION_WORKER_RUNTIME is unset; secure default ops-api applies.',
      { effective_worker_runtime_owner: workerRuntimeOwnerValue },
    );

    const workerSecret = readAnyEnv(['NOTIFICATION_WORKER_SECRET', 'CRON_SECRET']);
    pushCheck(
      checks,
      'ops_api_worker_secret',
      Boolean(workerSecret.value),
      workerSecret.value
        ? `${workerSecret.name} is set.`
        : 'Missing NOTIFICATION_WORKER_SECRET or CRON_SECRET.',
    );

    const webhookSecret = readAnyEnv(['NOTIFICATION_PROVIDER_WEBHOOK_SECRET']);
    pushCheck(
      checks,
      'ops_api_webhook_secret',
      Boolean(webhookSecret.value),
      webhookSecret.value
        ? 'NOTIFICATION_PROVIDER_WEBHOOK_SECRET is set.'
        : 'Missing NOTIFICATION_PROVIDER_WEBHOOK_SECRET.',
    );

    const queueUrl = readAnyEnv(['SQS_QUEUE_URL']);
    pushCheck(
      checks,
      'ops_api_sqs_queue_url',
      Boolean(queueUrl.value),
      queueUrl.value ? 'SQS_QUEUE_URL is set.' : 'Missing SQS_QUEUE_URL.',
    );
  }

  return checks;
}

function summarize(checks) {
  const totals = {
    pass: 0,
    fail: 0,
  };
  for (const check of checks) {
    if (check.status === 'PASS') totals.pass += 1;
    if (check.status === 'FAIL') totals.fail += 1;
  }
  return totals;
}

function main() {
  const service = parseArg('--service', 'all').toLowerCase();
  const available = ['www', 'exam-api', 'panel-api', 'ops-api'];
  const targetServices = service === 'all' ? available : [service];

  if (!targetServices.every((item) => available.includes(item))) {
    console.error(
      JSON.stringify(
        {
          ok: false,
          error: 'invalid_service',
          message: 'Use --service=www|exam-api|panel-api|ops-api|all',
        },
        null,
        2,
      ),
    );
    process.exit(1);
  }

  const serviceReports = targetServices.map((item) => {
    const checks = runServiceChecks(item);
    const totals = summarize(checks);
    return {
      service: item,
      ok: totals.fail === 0,
      totals,
      checks,
    };
  });

  const output = {
    timestamp: new Date().toISOString(),
    service: service === 'all' ? 'all' : service,
    ok: serviceReports.every((report) => report.ok),
    reports: serviceReports,
  };

  console.log(JSON.stringify(output, null, 2));
  if (!output.ok) {
    process.exitCode = 1;
  }
}

main();
