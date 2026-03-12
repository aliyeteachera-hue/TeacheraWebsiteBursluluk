import { execFileSync } from 'node:child_process';

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

function readIntEnv(name, fallback, min, max) {
  const parsed = Number.parseInt(trim(process.env[name]), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function readFloatEnv(name, fallback, min, max) {
  const parsed = Number.parseFloat(trim(process.env[name]));
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function runAws(region, args, expectJson = true) {
  const commandArgs = [...args, '--region', region];
  if (expectJson) commandArgs.push('--output', 'json');

  const output = execFileSync('aws', commandArgs, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (!expectJson) return null;
  return output ? JSON.parse(output) : null;
}

function buildDashboard({ namespace, endpointKeys, region }) {
  return {
    widgets: [
      {
        type: 'text',
        x: 0,
        y: 0,
        width: 24,
        height: 2,
        properties: {
          markdown:
            '# Teachera P0-10 Observability\\nLatency, error-rate, queue, worker, DB/Redis ve SMS/WA başarı metrikleri.',
        },
      },
      {
        type: 'metric',
        x: 0,
        y: 2,
        width: 12,
        height: 6,
        properties: {
          view: 'timeSeries',
          stacked: false,
          title: 'API Latency p95/p99 (ms)',
          region,
          stat: 'Average',
          period: 300,
          metrics: endpointKeys.flatMap((endpointKey) => [
            [namespace, 'ApiLatencyP95Ms', 'Endpoint', endpointKey, { label: `${endpointKey} p95` }],
            [namespace, 'ApiLatencyP99Ms', 'Endpoint', endpointKey, { label: `${endpointKey} p99` }],
          ]),
        },
      },
      {
        type: 'metric',
        x: 12,
        y: 2,
        width: 12,
        height: 6,
        properties: {
          view: 'timeSeries',
          stacked: false,
          title: 'API Error Rate (%)',
          region,
          stat: 'Average',
          period: 300,
          metrics: endpointKeys.map((endpointKey) => [
            namespace,
            'ApiErrorRatePct',
            'Endpoint',
            endpointKey,
            { label: `${endpointKey} error` },
          ]),
        },
      },
      {
        type: 'metric',
        x: 0,
        y: 8,
        width: 12,
        height: 6,
        properties: {
          view: 'timeSeries',
          stacked: false,
          title: 'Queue Depth / Lag',
          region,
          stat: 'Average',
          period: 300,
          metrics: [
            [namespace, 'QueueDepth', { label: 'Queue depth' }],
            [namespace, 'QueueLagSeconds', { label: 'Queue lag (sec)' }],
          ],
        },
      },
      {
        type: 'metric',
        x: 12,
        y: 8,
        width: 12,
        height: 6,
        properties: {
          view: 'timeSeries',
          stacked: false,
          title: 'Worker + Delivery Success',
          region,
          stat: 'Average',
          period: 300,
          metrics: [
            [namespace, 'WorkerFailRatePct15m', { label: 'Worker fail rate 15m (%)' }],
            [namespace, 'NotificationSuccessRatePct60m', 'Channel', 'SMS', { label: 'SMS success 60m (%)' }],
            [namespace, 'NotificationSuccessRatePct60m', 'Channel', 'WHATSAPP', { label: 'WA success 60m (%)' }],
          ],
        },
      },
      {
        type: 'metric',
        x: 0,
        y: 14,
        width: 24,
        height: 6,
        properties: {
          view: 'timeSeries',
          stacked: false,
          title: 'DB / Redis Health',
          region,
          stat: 'Average',
          period: 60,
          metrics: [
            [namespace, 'DbHealth', { label: 'DB health (1=up)' }],
            [namespace, 'RedisHealth', { label: 'Redis health (1=up)' }],
          ],
          yAxis: {
            left: {
              min: 0,
              max: 1,
            },
          },
        },
      },
    ],
  };
}

function buildAlarmDefinitions({
  namespace,
  alarmPrefix,
  endpointKeys,
  thresholds,
}) {
  const alarms = [];

  for (const endpointKey of endpointKeys) {
    alarms.push(
      {
        alarmName: `${alarmPrefix}-${endpointKey}-latency-p95`,
        metricName: 'ApiLatencyP95Ms',
        threshold: thresholds.p95,
        comparisonOperator: 'GreaterThanThreshold',
        evaluationPeriods: 3,
        period: 60,
        dimensions: [{ Name: 'Endpoint', Value: endpointKey }],
      },
      {
        alarmName: `${alarmPrefix}-${endpointKey}-latency-p99`,
        metricName: 'ApiLatencyP99Ms',
        threshold: thresholds.p99,
        comparisonOperator: 'GreaterThanThreshold',
        evaluationPeriods: 3,
        period: 60,
        dimensions: [{ Name: 'Endpoint', Value: endpointKey }],
      },
      {
        alarmName: `${alarmPrefix}-${endpointKey}-error-rate`,
        metricName: 'ApiErrorRatePct',
        threshold: thresholds.errorRatePct,
        comparisonOperator: 'GreaterThanThreshold',
        evaluationPeriods: 3,
        period: 60,
        dimensions: [{ Name: 'Endpoint', Value: endpointKey }],
      },
    );
  }

  alarms.push(
    {
      alarmName: `${alarmPrefix}-queue-depth`,
      metricName: 'QueueDepth',
      threshold: thresholds.queueDepth,
      comparisonOperator: 'GreaterThanThreshold',
      evaluationPeriods: 3,
      period: 60,
      dimensions: [],
    },
    {
      alarmName: `${alarmPrefix}-queue-lag`,
      metricName: 'QueueLagSeconds',
      threshold: thresholds.queueLagSeconds,
      comparisonOperator: 'GreaterThanThreshold',
      evaluationPeriods: 3,
      period: 60,
      dimensions: [],
    },
    {
      alarmName: `${alarmPrefix}-worker-fail-rate`,
      metricName: 'WorkerFailRatePct15m',
      threshold: thresholds.workerFailRatePct,
      comparisonOperator: 'GreaterThanThreshold',
      evaluationPeriods: 3,
      period: 60,
      dimensions: [],
    },
    {
      alarmName: `${alarmPrefix}-db-health`,
      metricName: 'DbHealth',
      threshold: 1,
      comparisonOperator: 'LessThanThreshold',
      evaluationPeriods: 2,
      period: 60,
      dimensions: [],
    },
    {
      alarmName: `${alarmPrefix}-redis-health`,
      metricName: 'RedisHealth',
      threshold: 1,
      comparisonOperator: 'LessThanThreshold',
      evaluationPeriods: 2,
      period: 60,
      dimensions: [],
    },
    {
      alarmName: `${alarmPrefix}-sms-success-rate`,
      metricName: 'NotificationSuccessRatePct60m',
      threshold: thresholds.smsSuccessRatePct,
      comparisonOperator: 'LessThanThreshold',
      evaluationPeriods: 3,
      period: 300,
      dimensions: [{ Name: 'Channel', Value: 'SMS' }],
    },
    {
      alarmName: `${alarmPrefix}-wa-success-rate`,
      metricName: 'NotificationSuccessRatePct60m',
      threshold: thresholds.waSuccessRatePct,
      comparisonOperator: 'LessThanThreshold',
      evaluationPeriods: 3,
      period: 300,
      dimensions: [{ Name: 'Channel', Value: 'WHATSAPP' }],
    },
  );

  return alarms.map((alarm) => ({
    ...alarm,
    namespace,
    statistic: 'Average',
  }));
}

function putMetricAlarm({ region, alarm, alarmActions }) {
  const args = [
    'cloudwatch',
    'put-metric-alarm',
    '--alarm-name', alarm.alarmName,
    '--namespace', alarm.namespace,
    '--metric-name', alarm.metricName,
    '--statistic', alarm.statistic,
    '--period', String(alarm.period),
    '--evaluation-periods', String(alarm.evaluationPeriods),
    '--threshold', String(alarm.threshold),
    '--comparison-operator', alarm.comparisonOperator,
    '--treat-missing-data', 'breaching',
  ];

  if (alarm.dimensions.length > 0) {
    args.push(
      '--dimensions',
      ...alarm.dimensions.map((item) => `Name=${item.Name},Value=${item.Value}`),
    );
  }

  if (alarmActions.length > 0) {
    args.push('--alarm-actions', ...alarmActions, '--ok-actions', ...alarmActions);
  }

  runAws(region, args, false);
}

function main() {
  const region = readEnv('AWS_REGION', 'AWS_DEFAULT_REGION', 'OBSERVABILITY_AWS_REGION');
  if (!region) {
    throw new Error('Missing AWS region. Set AWS_REGION or AWS_DEFAULT_REGION.');
  }

  const namespace = readEnv('OBSERVABILITY_CLOUDWATCH_NAMESPACE') || 'Teachera/ExamPlatform';
  const dashboardName = readEnv('OBSERVABILITY_DASHBOARD_NAME') || 'teachera-p0-10-observability';
  const alarmPrefix = readEnv('OBSERVABILITY_ALARM_PREFIX') || 'teachera-p0-10';
  const alarmTopic = readEnv('OBSERVABILITY_ALARM_SNS_TOPIC_ARN');
  const alarmActions = alarmTopic ? [alarmTopic] : [];

  const endpointKeys = ['exam_api', 'panel_api', 'ops_api', 'www_root'];

  const thresholds = {
    p95: readFloatEnv('OBS_SLO_P95_MS', 1200, 50, 60000),
    p99: readFloatEnv('OBS_SLO_P99_MS', 2500, 50, 60000),
    errorRatePct: readFloatEnv('OBS_SLO_ERROR_RATE_PCT', 2, 0.1, 100),
    queueDepth: readFloatEnv('OBS_SLO_QUEUE_DEPTH', 200, 1, 100000),
    queueLagSeconds: readFloatEnv('OBS_SLO_QUEUE_LAG_SECONDS', 300, 1, 86400),
    workerFailRatePct: readFloatEnv('OBS_SLO_WORKER_FAIL_RATE_PCT', 5, 0.1, 100),
    smsSuccessRatePct: readFloatEnv('OBS_SLO_SMS_SUCCESS_RATE_PCT', 85, 1, 100),
    waSuccessRatePct: readFloatEnv('OBS_SLO_WA_SUCCESS_RATE_PCT', 80, 1, 100),
  };

  const dashboardBody = buildDashboard({ namespace, endpointKeys, region });

  runAws(region, [
    'cloudwatch',
    'put-dashboard',
    '--dashboard-name',
    dashboardName,
    '--dashboard-body',
    JSON.stringify(dashboardBody),
  ]);

  const alarms = buildAlarmDefinitions({
    namespace,
    alarmPrefix,
    endpointKeys,
    thresholds,
  });

  for (const alarm of alarms) {
    putMetricAlarm({
      region,
      alarm,
      alarmActions,
    });
  }

  console.log(JSON.stringify({
    ok: true,
    region,
    namespace,
    dashboard_name: dashboardName,
    alarm_prefix: alarmPrefix,
    alarm_count: alarms.length,
    alarm_actions_attached: alarmActions.length > 0,
    thresholds,
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error('[p0-10-observability-provision] failed:', error?.message || error);
  process.exit(1);
}
