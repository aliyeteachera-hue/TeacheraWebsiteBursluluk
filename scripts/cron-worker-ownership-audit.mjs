import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();

function toPosix(filePath) {
  return filePath.replace(/\\/g, '/');
}

function pushCheck(checks, id, ok, detail, evidence = {}) {
  checks.push({
    id,
    status: ok ? 'PASS' : 'FAIL',
    detail,
    evidence,
  });
}

async function readJsonIfExists(relativePath) {
  const fullPath = path.join(rootDir, relativePath);
  try {
    const raw = await fs.readFile(fullPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readWorkerCrons(config) {
  const crons = Array.isArray(config?.crons) ? config.crons : [];
  return crons.filter((item) => String(item?.path || '').startsWith('/api/notifications/worker'));
}

function readCollectorCrons(config) {
  const crons = Array.isArray(config?.crons) ? config.crons : [];
  return crons.filter((item) => String(item?.path || '').startsWith('/api/ops/observability/collect'));
}

async function fileExists(relativePath) {
  try {
    await fs.access(path.join(rootDir, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const checks = [];

  const appConfigs = [
    { service: 'www', file: 'apps/www/vercel.json' },
    { service: 'exam-api', file: 'apps/exam-api/vercel.json' },
    { service: 'panel-api', file: 'apps/panel-api/vercel.json' },
    { service: 'ops-api', file: 'apps/ops-api/vercel.json' },
  ];

  const legacyConfigs = [
    'vercel.json',
    'vercel.www.json',
    'vercel.exam-api.json',
    'vercel.panel-api.json',
    'vercel.ops-api.json',
  ];

  const appConfigStates = [];
  for (const item of appConfigs) {
    const config = await readJsonIfExists(item.file);
    const workerCrons = readWorkerCrons(config);
    const collectorCrons = readCollectorCrons(config);
    appConfigStates.push({
      ...item,
      exists: Boolean(config),
      workerCrons,
      collectorCrons,
    });
  }

  const opsState = appConfigStates.find((item) => item.service === 'ops-api');
  pushCheck(
    checks,
    'ops_api_worker_cron_single',
    Boolean(opsState?.exists) && opsState.workerCrons.length === 1,
    opsState?.exists
      ? `ops-api worker cron count=${opsState.workerCrons.length} (expected 1).`
      : 'apps/ops-api/vercel.json is missing.',
    {
      file: 'apps/ops-api/vercel.json',
      crons: opsState?.workerCrons || [],
    },
  );

  pushCheck(
    checks,
    'ops_api_observability_cron_single',
    Boolean(opsState?.exists) && opsState.collectorCrons.length === 1,
    opsState?.exists
      ? `ops-api observability cron count=${opsState.collectorCrons.length} (expected 1).`
      : 'apps/ops-api/vercel.json is missing.',
    {
      file: 'apps/ops-api/vercel.json',
      crons: opsState?.collectorCrons || [],
    },
  );

  for (const state of appConfigStates.filter((item) => item.service !== 'ops-api')) {
    pushCheck(
      checks,
      `${state.service}_no_worker_cron`,
      state.exists && state.workerCrons.length === 0,
      state.exists
        ? `${state.service} worker cron count=${state.workerCrons.length} (expected 0).`
        : `${state.file} is missing.`,
      {
        file: state.file,
        crons: state.workerCrons,
      },
    );
  }

  const legacyWorkerCronFiles = [];
  for (const file of legacyConfigs) {
    const config = await readJsonIfExists(file);
    if (!config) continue;
    const workerCrons = readWorkerCrons(config);
    if (workerCrons.length > 0) {
      legacyWorkerCronFiles.push({ file, worker_crons: workerCrons });
    }
  }

  pushCheck(
    checks,
    'legacy_configs_no_worker_cron',
    legacyWorkerCronFiles.length === 0,
    legacyWorkerCronFiles.length === 0
      ? 'Legacy/root vercel configs do not declare worker cron.'
      : 'Found worker cron in legacy/root vercel config(s).',
    {
      files: legacyWorkerCronFiles,
    },
  );

  const opsWorkerFile = 'apps/ops-api/api/notifications/worker.js';
  const examWorkerFile = 'apps/exam-api/api/notifications/worker.js';
  const panelWorkerFile = 'apps/panel-api/api/notifications/worker.js';

  const opsWorkerExists = await fileExists(opsWorkerFile);
  const examWorkerExists = await fileExists(examWorkerFile);
  const panelWorkerExists = await fileExists(panelWorkerFile);

  pushCheck(
    checks,
    'ops_api_worker_endpoint_exists',
    opsWorkerExists,
    opsWorkerExists
      ? 'ops-api worker endpoint exists.'
      : 'ops-api worker endpoint is missing.',
    { file: opsWorkerFile },
  );
  pushCheck(
    checks,
    'exam_api_worker_endpoint_absent',
    !examWorkerExists,
    examWorkerExists
      ? 'exam-api unexpectedly has worker endpoint.'
      : 'exam-api does not include worker endpoint.',
    { file: examWorkerFile, exists: examWorkerExists },
  );
  pushCheck(
    checks,
    'panel_api_worker_endpoint_absent',
    !panelWorkerExists,
    panelWorkerExists
      ? 'panel-api unexpectedly has worker endpoint.'
      : 'panel-api does not include worker endpoint.',
    { file: panelWorkerFile, exists: panelWorkerExists },
  );

  const totals = checks.reduce(
    (acc, check) => {
      if (check.status === 'PASS') acc.pass += 1;
      else acc.fail += 1;
      return acc;
    },
    { pass: 0, fail: 0 },
  );

  const output = {
    timestamp: new Date().toISOString(),
    ok: totals.fail === 0,
    totals,
    checks,
  };

  console.log(JSON.stringify(output, null, 2));
  if (!output.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error('[cron-worker-ownership-audit] failed', error);
  process.exit(1);
});

