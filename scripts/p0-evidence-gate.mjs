import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
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

  steps.push(runStep('p0-11-verify-signature', npmCmd, ['run', 'p0:load-resilience:verify-signature']));

  if (steps[0].ok) {
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
    },
    env: {
      production_env_file_loaded: envMeta.loaded,
      loaded_variable_count: envMeta.count,
      env_file: envMeta.filePath,
      signing_key_present: Boolean(signingKey),
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
