import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const args = new Set(process.argv.slice(2));
const enableAws = args.has('--aws');

function trim(value) {
  return String(value ?? '').trim();
}

function parseDotenvLine(line) {
  const clean = trim(line);
  if (!clean || clean.startsWith('#')) return null;

  const normalized = clean.startsWith('export ') ? clean.slice(7) : clean;
  const eq = normalized.indexOf('=');
  if (eq < 1) return null;

  const key = trim(normalized.slice(0, eq));
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return null;

  let value = normalized.slice(eq + 1);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return { loaded: false, filePath, count: 0 };
  }

  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  let count = 0;

  for (const line of lines) {
    const parsed = parseDotenvLine(line);
    if (!parsed) continue;

    if (!trim(process.env[parsed.key])) {
      process.env[parsed.key] = parsed.value;
      count += 1;
    }
  }

  return { loaded: true, filePath, count };
}

function pullOpsProjectEnv() {
  const tempEnvPath = resolve(tmpdir(), `teachera-ops-prod-${Date.now()}.env`);
  try {
    execFileSync(
      'npx',
      [
        '--yes',
        'vercel',
        'env',
        'pull',
        tempEnvPath,
        '--environment=production',
        '--cwd',
        'apps/ops-api',
      ],
      {
        cwd: ROOT,
        env: process.env,
        stdio: ['ignore', 'ignore', 'ignore'],
      },
    );
  } catch {
    return { loaded: false, values: {} };
  }

  if (!existsSync(tempEnvPath)) {
    return { loaded: false, values: {} };
  }

  try {
    const raw = readFileSync(tempEnvPath, 'utf8');
    const values = {};
    for (const line of raw.split(/\r?\n/)) {
      const parsed = parseDotenvLine(line);
      if (!parsed) continue;
      values[parsed.key] = parsed.value;
    }
    return { loaded: true, values };
  } catch {
    return { loaded: false, values: {} };
  }
}

function tryReadAwsConfiguredRegion() {
  try {
    const output = execFileSync('aws', ['configure', 'get', 'region'], {
      cwd: ROOT,
      env: process.env,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return trim(output);
  } catch {
    return '';
  }
}

function readLatestObservabilityTopic() {
  const path = resolve(ROOT, 'guidelines', 'p0-10-observability-audit-latest.json');
  if (!existsSync(path)) return '';

  try {
    const payload = JSON.parse(readFileSync(path, 'utf8'));
    const checks = Array.isArray(payload?.checks) ? payload.checks : [];
    for (const check of checks) {
      const topic = trim(check?.evidence?.expected_alarm_topic);
      if (topic) return topic;
    }
  } catch {
    return '';
  }
  return '';
}

function tryDiscoverAlarmTopicArn(regionHint) {
  const region = trim(regionHint) || 'eu-north-1';
  try {
    const output = execFileSync(
      'aws',
      ['sns', 'list-topics', '--region', region, '--output', 'json'],
      {
        cwd: ROOT,
        env: process.env,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    );
    const payload = JSON.parse(output || '{}');
    const topics = Array.isArray(payload?.Topics) ? payload.Topics : [];
    const arns = topics.map((item) => trim(item?.TopicArn)).filter(Boolean);
    const exact = arns.find((arn) => arn.endsWith(':teachera-p0-10-alarms'));
    if (exact) return exact;
    return arns.find((arn) => arn.includes('p0-10') && arn.includes('alarm')) || '';
  } catch {
    return '';
  }
}

function applyObservabilityDefaults() {
  const applied = [];
  const opsEnv = pullOpsProjectEnv();
  const getOpsValue = (key) => trim(opsEnv.values?.[key]).replace(/\\[rn]/g, '').trim();

  if (!trim(process.env.OPS_API_BASE_URL)) {
    process.env.OPS_API_BASE_URL =
      getOpsValue('OPS_API_BASE_URL') || 'https://ops-api.teachera.com.tr';
    applied.push('OPS_API_BASE_URL');
  }

  if (!trim(process.env.AWS_REGION)) {
    const region =
      trim(process.env.OBSERVABILITY_AWS_REGION) ||
      getOpsValue('AWS_REGION') ||
      getOpsValue('OBSERVABILITY_AWS_REGION') ||
      tryReadAwsConfiguredRegion() ||
      'eu-north-1';
    process.env.AWS_REGION = region;
    applied.push('AWS_REGION');
  }

  if (!trim(process.env.OBSERVABILITY_COLLECTOR_SECRET)) {
    const collectorSecret =
      getOpsValue('OBSERVABILITY_COLLECTOR_SECRET') ||
      getOpsValue('CRON_SECRET') ||
      getOpsValue('NOTIFICATION_WORKER_SECRET');
    if (collectorSecret) {
      process.env.OBSERVABILITY_COLLECTOR_SECRET = collectorSecret;
      applied.push('OBSERVABILITY_COLLECTOR_SECRET');
    }
  }

  if (!trim(process.env.OBSERVABILITY_ALARM_SNS_TOPIC_ARN)) {
    const topic =
      getOpsValue('OBSERVABILITY_ALARM_SNS_TOPIC_ARN') ||
      readLatestObservabilityTopic() ||
      tryDiscoverAlarmTopicArn(trim(process.env.AWS_REGION) || trim(process.env.OBSERVABILITY_AWS_REGION));
    if (topic) {
      process.env.OBSERVABILITY_ALARM_SNS_TOPIC_ARN = topic;
      applied.push('OBSERVABILITY_ALARM_SNS_TOPIC_ARN');
    }
  }

  return {
    applied,
    ops_project_env_loaded: opsEnv.loaded,
  };
}

function runStep(label, command, commandArgs) {
  console.log(`[p0:evidence:gate] ${label}...`);
  try {
    execFileSync(command, commandArgs, {
      cwd: ROOT,
      stdio: 'inherit',
      env: process.env,
    });
    return { id: label, ok: true, command: [command, ...commandArgs].join(' ') };
  } catch (error) {
    return {
      id: label,
      ok: false,
      command: [command, ...commandArgs].join(' '),
      code: Number(error?.status ?? 1),
      message: trim(error?.message) || 'step_failed',
    };
  }
}

function main() {
  const envMeta = loadEnvFile(resolve(ROOT, '.env.production.local'));
  const defaultsMeta = applyObservabilityDefaults();

  const signingKey = trim(process.env.P0_11_REPORT_SIGNING_KEY || process.env.CRON_SECRET);
  if (!signingKey) {
    const fail = {
      ok: false,
      error: 'missing_signing_key',
      message: 'P0_11_REPORT_SIGNING_KEY veya CRON_SECRET gerekli. .env.production.local veya environment içine ekleyin.',
      env: {
        production_env_file_loaded: envMeta.loaded,
        loaded_variable_count: envMeta.count,
        env_file: envMeta.filePath,
      },
    };
    console.log(JSON.stringify(fail, null, 2));
    process.exit(1);
  }

  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const steps = [];

  steps.push(runStep('ci-path-filter-selftest', npmCmd, ['run', 'ci:path-filter:selftest']));

  const observabilityArgs = ['run', 'p0:observability:audit', '--', '--http'];
  if (enableAws) observabilityArgs.push('--aws');
  if (steps[0].ok) {
    steps.push(runStep('p0-10-observability-audit', npmCmd, observabilityArgs));
  }

  if (steps[0].ok && steps[1]?.ok) {
    steps.push(runStep('p0-11-verify-signature', npmCmd, ['run', 'p0:load-resilience:verify-signature']));
  }

  if (steps[0].ok && steps[1]?.ok && steps[2]?.ok) {
    const auditArgs = ['run', 'p0:go-live:package:audit', '--', '--http'];
    if (enableAws) auditArgs.push('--aws');
    steps.push(runStep('p0-12-go-live-package-audit', npmCmd, auditArgs));
  }

  const summary = {
    timestamp: new Date().toISOString(),
    ok: steps.every((step) => step.ok),
    mode: {
      http: true,
      aws: enableAws,
      observability_included: true,
      ci_path_filter_selftest_included: true,
    },
    env: {
      production_env_file_loaded: envMeta.loaded,
      loaded_variable_count: envMeta.count,
      env_file: envMeta.filePath,
      signing_key_present: Boolean(signingKey),
      applied_observability_defaults: defaultsMeta.applied,
      ops_project_env_loaded: defaultsMeta.ops_project_env_loaded,
    },
    steps,
  };

  console.log(JSON.stringify(summary, null, 2));
  if (!summary.ok) {
    process.exit(1);
  }
}

try {
  main();
} catch (error) {
  console.error('[p0:evidence:gate] failed:', error?.message || error);
  process.exit(1);
}
