import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const args = new Set(process.argv.slice(2));
const enableHttpChecks = args.has('--http');
const enableAwsChecks = args.has('--aws');
const preflightOnly = args.has('--preflight-only');

const SERVICE_CONFIG = {
  www: {
    endpointKeys: ['www_root'],
    includeOpsMetrics: false,
  },
  exam: {
    endpointKeys: ['exam_api'],
    includeOpsMetrics: false,
  },
  panel: {
    endpointKeys: ['panel_api'],
    includeOpsMetrics: false,
  },
  ops: {
    endpointKeys: ['ops_api'],
    includeOpsMetrics: true,
  },
};

const SERVICE_ORDER = ['www', 'exam', 'panel', 'ops'];

const STATUS = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  WARN: 'WARN',
  SKIP: 'SKIP',
};

const LATEST_ARTIFACT_PATH = resolve(process.cwd(), 'guidelines', 'p0-10-observability-audit-latest.json');

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

function readBoolEnv(name, fallback) {
  const raw = trim(process.env[name]).toLowerCase();
  if (!raw) return fallback;
  if (['1', 'true', 'yes', 'on'].includes(raw)) return true;
  if (['0', 'false', 'no', 'off'].includes(raw)) return false;
  return fallback;
}

function serviceUpper(service) {
  return service.toUpperCase();
}

function sanitizeCloudWatchToken(value, fallback = '') {
  const cleaned = trim(value)
    .replace(/\\[rn]/g, '')
    .replace(/[^A-Za-z0-9_-]/g, '');
  return cleaned || fallback;
}

function resolveDashboardName(baseName, service) {
  const raw =
    readEnv(`OBSERVABILITY_DASHBOARD_NAME_${serviceUpper(service)}`) ||
    `${baseName}-${service}`;
  return sanitizeCloudWatchToken(raw, `teachera-p0-10-observability-${service}`);
}

function resolveAlarmPrefix(basePrefix, service) {
  const raw =
    readEnv(`OBSERVABILITY_ALARM_PREFIX_${serviceUpper(service)}`) ||
    `${basePrefix}-${service}`;
  return sanitizeCloudWatchToken(raw, `teachera-p0-10-${service}`);
}

function resolveAlarmTopic(defaultTopic, service) {
  return readEnv(`OBSERVABILITY_ALARM_SNS_TOPIC_ARN_${serviceUpper(service)}`) || defaultTopic;
}

function expectedAlarmNames(prefix, endpointKeys, includeOpsMetrics) {
  const names = [];

  for (const endpointKey of endpointKeys) {
    names.push(
      `${prefix}-${endpointKey}-latency-p95`,
      `${prefix}-${endpointKey}-latency-p99`,
      `${prefix}-${endpointKey}-error-rate`,
    );
  }

  if (includeOpsMetrics) {
    names.push(
      `${prefix}-queue-depth`,
      `${prefix}-queue-lag`,
      `${prefix}-worker-fail-rate`,
      `${prefix}-db-health`,
      `${prefix}-redis-health`,
      `${prefix}-sms-success-rate`,
      `${prefix}-wa-success-rate`,
    );
  }

  return names;
}

function requiredMetricNames(includeOpsMetrics) {
  const base = ['ApiLatencyP95Ms', 'ApiLatencyP99Ms', 'ApiErrorRatePct'];
  if (!includeOpsMetrics) return base;

  return [
    ...base,
    'QueueDepth',
    'QueueLagSeconds',
    'WorkerFailRatePct15m',
    'DbHealth',
    'RedisHealth',
    'NotificationSuccessRatePct60m',
  ];
}

function pushCheck(checks, id, status, detail, evidence = {}) {
  checks.push({ id, status, detail, evidence });
}

function buildServiceDefinitions() {
  const dashboardBaseName = readEnv('OBSERVABILITY_DASHBOARD_NAME') || 'teachera-p0-10-observability';
  const alarmBasePrefix = readEnv('OBSERVABILITY_ALARM_PREFIX') || 'teachera-p0-10';
  const defaultAlarmTopic = readEnv('OBSERVABILITY_ALARM_SNS_TOPIC_ARN', 'OBSERVABILITY_ALARM_SNS_TOPIC_ARN_ALL');
  const requireAlarmActions = readBoolEnv('OBSERVABILITY_ALARM_ACTIONS_REQUIRED', true);

  const services = SERVICE_ORDER.map((service) => {
    const cfg = SERVICE_CONFIG[service];
    return {
      service,
      endpointKeys: cfg.endpointKeys,
      includeOpsMetrics: cfg.includeOpsMetrics,
      dashboardName: resolveDashboardName(dashboardBaseName, service),
      alarmPrefix: resolveAlarmPrefix(alarmBasePrefix, service),
      expectedAlarmTopic: resolveAlarmTopic(defaultAlarmTopic, service),
    };
  });

  return {
    requireAlarmActions,
    services,
  };
}

function runRequiredEnvPreflight(checks) {
  const missing = [];
  const { requireAlarmActions, services } = buildServiceDefinitions();

  if (enableHttpChecks) {
    if (!readEnv('OPS_API_BASE_URL')) missing.push('OPS_API_BASE_URL');
    if (!readEnv('OBSERVABILITY_COLLECTOR_SECRET', 'CRON_SECRET', 'NOTIFICATION_WORKER_SECRET')) {
      missing.push('OBSERVABILITY_COLLECTOR_SECRET|CRON_SECRET|NOTIFICATION_WORKER_SECRET');
    }
  }

  if (enableAwsChecks) {
    if (!readEnv('AWS_REGION', 'AWS_DEFAULT_REGION', 'OBSERVABILITY_AWS_REGION')) {
      missing.push('AWS_REGION');
    }

    for (const svc of services) {
      if (!svc.dashboardName) missing.push(`OBSERVABILITY_DASHBOARD_NAME_${serviceUpper(svc.service)}|OBSERVABILITY_DASHBOARD_NAME`);
      if (!svc.alarmPrefix) missing.push(`OBSERVABILITY_ALARM_PREFIX_${serviceUpper(svc.service)}|OBSERVABILITY_ALARM_PREFIX`);
      if (requireAlarmActions && !svc.expectedAlarmTopic) {
        missing.push(`OBSERVABILITY_ALARM_SNS_TOPIC_ARN_${serviceUpper(svc.service)}|OBSERVABILITY_ALARM_SNS_TOPIC_ARN`);
      }
    }
  }

  pushCheck(
    checks,
    'preflight_required_env',
    missing.length === 0 ? STATUS.PASS : STATUS.FAIL,
    missing.length === 0
      ? 'All required environment variables are present for selected mode.'
      : `Missing required env: ${missing.join(', ')}`,
    {
      missing,
      mode: {
        http: enableHttpChecks,
        aws: enableAwsChecks,
      },
      service_scoped: true,
      require_alarm_actions: requireAlarmActions,
    },
  );

  return missing.length === 0;
}

function writeLatestArtifact(payload) {
  const targetDir = dirname(LATEST_ARTIFACT_PATH);
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }
  writeFileSync(LATEST_ARTIFACT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
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

function emitOutput(checks) {
  const totals = summarize(checks);
  const output = {
    timestamp: new Date().toISOString(),
    mode: {
      http: enableHttpChecks,
      aws: enableAwsChecks,
      service_scoped: true,
    },
    totals,
    overall_ready_for_p0_10: totals.fail === 0,
    checks,
  };

  writeLatestArtifact(output);
  console.log(JSON.stringify(output, null, 2));

  if (totals.fail > 0) {
    process.exitCode = 1;
  }
}

function runAwsJson(region, argsList) {
  const output = execFileSync('aws', [...argsList, '--region', region, '--output', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return JSON.parse(output);
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
  const { requireAlarmActions, services } = buildServiceDefinitions();

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

  for (const svc of services) {
    try {
      const dashboardResp = runAwsJson(region, [
        'cloudwatch',
        'get-dashboard',
        '--dashboard-name',
        svc.dashboardName,
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

      const requiredMetrics = requiredMetricNames(svc.includeOpsMetrics);
      const missingMetrics = requiredMetrics.filter((metric) => !metricNames.has(metric));
      pushCheck(
        checks,
        `dashboard_exists_${svc.service}`,
        STATUS.PASS,
        `CloudWatch dashboard found (${svc.service}): ${svc.dashboardName}`,
        {
          service: svc.service,
          dashboard_name: svc.dashboardName,
        },
      );

      pushCheck(
        checks,
        `dashboard_metric_coverage_${svc.service}`,
        missingMetrics.length === 0 ? STATUS.PASS : STATUS.FAIL,
        missingMetrics.length === 0
          ? `Dashboard contains required metric families (${svc.service}).`
          : `Dashboard missing metric families (${svc.service}): ${missingMetrics.join(', ')}`,
        {
          service: svc.service,
          dashboard_name: svc.dashboardName,
          missing_metrics: missingMetrics,
        },
      );
    } catch (error) {
      pushCheck(
        checks,
        `dashboard_exists_${svc.service}`,
        STATUS.FAIL,
        `CloudWatch dashboard audit failed (${svc.service}): ${error?.message || String(error)}`,
        {
          service: svc.service,
          dashboard_name: svc.dashboardName,
        },
      );
    }

    try {
      const alarmResp = runAwsJson(region, [
        'cloudwatch',
        'describe-alarms',
        '--alarm-name-prefix',
        svc.alarmPrefix,
        '--max-records',
        '100',
      ]);

      const expected = expectedAlarmNames(svc.alarmPrefix, svc.endpointKeys, svc.includeOpsMetrics);
      const alarmMap = new Map((alarmResp?.MetricAlarms || []).map((alarm) => [trim(alarm.AlarmName), alarm]));
      const missing = expected.filter((alarmName) => !alarmMap.has(alarmName));

      pushCheck(
        checks,
        `alarm_set_coverage_${svc.service}`,
        missing.length === 0 ? STATUS.PASS : STATUS.FAIL,
        missing.length === 0
          ? `All required alarms exist (${svc.service}, ${expected.length}).`
          : `Missing alarms (${svc.service}): ${missing.join(', ')}`,
        {
          service: svc.service,
          alarm_prefix: svc.alarmPrefix,
          expected_count: expected.length,
          found_count: alarmMap.size,
        },
      );

      if (missing.length === 0) {
        const withoutActions = [];
        const wrongTopic = [];

        for (const alarmName of expected) {
          const alarm = alarmMap.get(alarmName);
          const actions = Array.isArray(alarm?.AlarmActions) ? alarm.AlarmActions : [];
          if (requireAlarmActions && actions.length === 0) {
            withoutActions.push(alarmName);
          }
          if (svc.expectedAlarmTopic && actions.length > 0 && !actions.includes(svc.expectedAlarmTopic)) {
            wrongTopic.push(alarmName);
          }
        }

        pushCheck(
          checks,
          `alarm_actions_attached_${svc.service}`,
          (!requireAlarmActions || withoutActions.length === 0) && wrongTopic.length === 0
            ? STATUS.PASS
            : STATUS.FAIL,
          (!requireAlarmActions || withoutActions.length === 0) && wrongTopic.length === 0
            ? `SNS alarm actions attached and scoped (${svc.service}).`
            : `Alarm action issues (${svc.service})${withoutActions.length ? ` | missing_actions=${withoutActions.length}` : ''}${wrongTopic.length ? ` | wrong_topic=${wrongTopic.length}` : ''}.`,
          {
            service: svc.service,
            require_alarm_actions: requireAlarmActions,
            expected_alarm_topic: svc.expectedAlarmTopic || null,
            missing_actions_for: withoutActions,
            wrong_topic_for: wrongTopic,
          },
        );
      }
    } catch (error) {
      pushCheck(
        checks,
        `alarm_set_coverage_${svc.service}`,
        STATUS.FAIL,
        `CloudWatch alarm audit failed (${svc.service}): ${error?.message || String(error)}`,
        {
          service: svc.service,
          alarm_prefix: svc.alarmPrefix,
        },
      );
    }
  }
}

async function main() {
  const checks = [];
  const preflightOk = runRequiredEnvPreflight(checks);

  if (preflightOnly || !preflightOk) {
    emitOutput(checks);
    return;
  }

  await runCollectorHttpCheck(checks);
  runAwsChecks(checks);
  emitOutput(checks);
}

main().catch((error) => {
  console.error('[p0-10-observability-audit] failed:', error);
  process.exit(1);
});
