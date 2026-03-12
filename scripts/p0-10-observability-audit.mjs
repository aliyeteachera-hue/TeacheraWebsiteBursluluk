import { execFileSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const enableHttpChecks = args.has('--http');
const enableAwsChecks = args.has('--aws');

const STATUS = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  WARN: 'WARN',
  SKIP: 'SKIP',
};

function trim(value) {
  return String(value || '').trim();
}

function readEnv(...names) {
  for (const name of names) {
    const value = trim(process.env[name]);
    if (value) return value;
  }
  return '';
}

function pushCheck(checks, id, status, detail, evidence = {}) {
  checks.push({ id, status, detail, evidence });
}

function summarize(checks) {
  const counts = {
    pass: 0,
    fail: 0,
    warn: 0,
    skip: 0,
  };

  for (const check of checks) {
    if (check.status === STATUS.PASS) counts.pass += 1;
    if (check.status === STATUS.FAIL) counts.fail += 1;
    if (check.status === STATUS.WARN) counts.warn += 1;
    if (check.status === STATUS.SKIP) counts.skip += 1;
  }

  return counts;
}

function runAwsJson(region, argsList) {
  const output = execFileSync('aws', [...argsList, '--region', region, '--output', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return JSON.parse(output);
}

function expectedAlarmNames(prefix) {
  const endpointKeys = ['exam_api', 'panel_api', 'ops_api', 'www_root'];
  const names = [];

  for (const endpointKey of endpointKeys) {
    names.push(
      `${prefix}-${endpointKey}-latency-p95`,
      `${prefix}-${endpointKey}-latency-p99`,
      `${prefix}-${endpointKey}-error-rate`,
    );
  }

  names.push(
    `${prefix}-queue-depth`,
    `${prefix}-queue-lag`,
    `${prefix}-worker-fail-rate`,
    `${prefix}-db-health`,
    `${prefix}-redis-health`,
    `${prefix}-sms-success-rate`,
    `${prefix}-wa-success-rate`,
  );

  return names;
}

function normalizeBase(raw, fallback) {
  const value = trim(raw || fallback);
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value.replace(/\/$/, '');
  return `https://${value.replace(/\/$/, '')}`;
}

async function runCollectorHttpCheck(checks) {
  if (!enableHttpChecks) {
    pushCheck(checks, 'collector_http', STATUS.SKIP, 'HTTP checks disabled (use --http).');
    return;
  }

  const opsBase = normalizeBase(readEnv('OPS_API_BASE_URL'), 'https://ops-api.teachera.com.tr');
  const collectorUrl = `${opsBase}/api/ops/observability/collect?sample_size=3&timeout_ms=3000`;
  const secret = readEnv('OBSERVABILITY_COLLECTOR_SECRET', 'CRON_SECRET', 'NOTIFICATION_WORKER_SECRET');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(collectorUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (response.status !== 200) {
      pushCheck(checks, 'collector_http', STATUS.FAIL, `Collector returned HTTP ${response.status}.`, {
        collector_url: collectorUrl,
        status: response.status,
        payload,
      });
      return;
    }

    const metricsPublished = Number(payload?.published_metric_count || 0);
    const hasLatency = Array.isArray(payload?.latency) && payload.latency.length >= 3;

    pushCheck(
      checks,
      'collector_http',
      payload?.ok && metricsPublished >= 10 && hasLatency ? STATUS.PASS : STATUS.FAIL,
      payload?.ok && metricsPublished >= 10 && hasLatency
        ? `Collector HTTP 200 and published ${metricsPublished} metrics.`
        : 'Collector payload missing expected observability fields.',
      {
        collector_url: collectorUrl,
        metrics_published: metricsPublished,
      },
    );
  } catch (error) {
    pushCheck(checks, 'collector_http', STATUS.FAIL, `Collector request failed: ${error?.message || String(error)}`, {
      collector_url: collectorUrl,
    });
  }
}

function runAwsChecks(checks) {
  if (!enableAwsChecks) {
    pushCheck(checks, 'aws_checks', STATUS.SKIP, 'AWS checks disabled (use --aws).');
    return;
  }

  const region = readEnv('AWS_REGION', 'AWS_DEFAULT_REGION', 'OBSERVABILITY_AWS_REGION');
  const dashboardName = readEnv('OBSERVABILITY_DASHBOARD_NAME') || 'teachera-p0-10-observability';
  const alarmPrefix = readEnv('OBSERVABILITY_ALARM_PREFIX') || 'teachera-p0-10';

  if (!region) {
    pushCheck(checks, 'aws_region', STATUS.FAIL, 'AWS region is missing (AWS_REGION).');
    return;
  }

  try {
    runAwsJson(region, ['sts', 'get-caller-identity']);
    pushCheck(checks, 'aws_identity', STATUS.PASS, 'AWS credentials are valid for observability audit.');
  } catch (error) {
    pushCheck(checks, 'aws_identity', STATUS.FAIL, `AWS auth failed: ${error?.message || String(error)}`);
    return;
  }

  try {
    const dashboardResp = runAwsJson(region, [
      'cloudwatch',
      'get-dashboard',
      '--dashboard-name',
      dashboardName,
    ]);

    const dashboardBody = JSON.parse(dashboardResp?.DashboardBody || '{}');
    const metricNames = new Set();

    for (const widget of dashboardBody.widgets || []) {
      for (const metric of widget?.properties?.metrics || []) {
        if (Array.isArray(metric) && metric.length >= 2) {
          metricNames.add(String(metric[1]));
        }
      }
    }

    const requiredMetrics = [
      'ApiLatencyP95Ms',
      'ApiLatencyP99Ms',
      'ApiErrorRatePct',
      'QueueDepth',
      'QueueLagSeconds',
      'WorkerFailRatePct15m',
      'DbHealth',
      'RedisHealth',
      'NotificationSuccessRatePct60m',
    ];

    const missingMetrics = requiredMetrics.filter((metric) => !metricNames.has(metric));
    pushCheck(
      checks,
      'dashboard_exists',
      STATUS.PASS,
      `CloudWatch dashboard found: ${dashboardName}`,
      { dashboard_name: dashboardName },
    );

    pushCheck(
      checks,
      'dashboard_metric_coverage',
      missingMetrics.length === 0 ? STATUS.PASS : STATUS.FAIL,
      missingMetrics.length === 0
        ? 'Dashboard contains required P0-10 metric families.'
        : `Dashboard missing metric families: ${missingMetrics.join(', ')}`,
      {
        dashboard_name: dashboardName,
        missing_metrics: missingMetrics,
      },
    );
  } catch (error) {
    pushCheck(checks, 'dashboard_exists', STATUS.FAIL, `CloudWatch dashboard audit failed: ${error?.message || String(error)}`, {
      dashboard_name: dashboardName,
    });
  }

  try {
    const alarmResp = runAwsJson(region, [
      'cloudwatch',
      'describe-alarms',
      '--alarm-name-prefix',
      alarmPrefix,
      '--max-records',
      '100',
    ]);

    const expected = expectedAlarmNames(alarmPrefix);
    const found = new Set((alarmResp?.MetricAlarms || []).map((alarm) => trim(alarm.AlarmName)));
    const missing = expected.filter((alarmName) => !found.has(alarmName));

    pushCheck(
      checks,
      'alarm_set_coverage',
      missing.length === 0 ? STATUS.PASS : STATUS.FAIL,
      missing.length === 0
        ? `All required observability alarms exist (${expected.length}).`
        : `Missing alarms: ${missing.join(', ')}`,
      {
        alarm_prefix: alarmPrefix,
        expected_count: expected.length,
        found_count: found.size,
      },
    );
  } catch (error) {
    pushCheck(checks, 'alarm_set_coverage', STATUS.FAIL, `CloudWatch alarm audit failed: ${error?.message || String(error)}`, {
      alarm_prefix: alarmPrefix,
    });
  }
}

async function main() {
  const checks = [];

  await runCollectorHttpCheck(checks);
  runAwsChecks(checks);

  const totals = summarize(checks);
  const output = {
    timestamp: new Date().toISOString(),
    mode: {
      http: enableHttpChecks,
      aws: enableAwsChecks,
    },
    totals,
    overall_ready_for_p0_10: totals.fail === 0,
    checks,
  };

  console.log(JSON.stringify(output, null, 2));

  if (totals.fail > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[p0-10-observability-audit] failed:', error);
  process.exit(1);
});
