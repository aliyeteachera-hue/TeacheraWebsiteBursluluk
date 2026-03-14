#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

function safeTrim(value) {
  return String(value ?? '').trim();
}

function runStep(step, args) {
  const result = spawnSync('node', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

  const text = safeTrim(`${result.stdout || ''}\n${result.stderr || ''}`);
  let parsed = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  const summary = {
    ok: result.status === 0,
    status: result.status,
    overall_ok: parsed?.overall_ok ?? parsed?.ok ?? null,
    totals: parsed?.totals ?? null,
    projects: parsed?.projects
      ? Object.fromEntries(
          Object.entries(parsed.projects).map(([name, report]) => [
            name,
            {
              env_count: report?.env_count,
              forbidden_present: report?.forbidden_present?.length || 0,
              deprecated_present: report?.deprecated_present?.length || 0,
            },
          ]),
        )
      : null,
  };

  return {
    step,
    summary,
    parsed,
    raw: parsed ? '' : text,
  };
}

function parseArgs(argv) {
  return {
    applyCleanup: argv.includes('--apply-cleanup'),
    environment:
      argv.find((arg) => arg.startsWith('--environment='))?.split('=')[1]?.trim() || 'production',
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const steps = [];

  const auditArgs = ['scripts/vercel-env-secret-scope-audit.mjs', `--environment=${args.environment}`];
  const cleanupArgs = ['scripts/vercel-env-secret-scope-cleanup.mjs', `--environment=${args.environment}`, '--apply'];
  const smokeArgs = ['scripts/vercel-env-secret-prod-smoke.mjs'];

  const initialAudit = runStep('secret_scope_audit_initial', auditArgs);
  steps.push(initialAudit);

  if (!initialAudit.summary.ok && args.applyCleanup) {
    const cleanup = runStep('secret_scope_cleanup_apply', cleanupArgs);
    steps.push(cleanup);
    steps.push(runStep('secret_scope_audit_after_cleanup', auditArgs));
  }

  steps.push(runStep('prod_smoke', smokeArgs));

  const overallOk = steps.every((item) => item.summary.ok);
  const payload = {
    timestamp: new Date().toISOString(),
    environment: args.environment,
    apply_cleanup: args.applyCleanup,
    overall_ok: overallOk,
    steps: steps.map((item) => ({
      step: item.step,
      ...item.summary,
      error_preview: item.summary.ok ? undefined : safeTrim(item.raw).slice(0, 400),
    })),
  };

  console.log(JSON.stringify(payload, null, 2));
  if (!overallOk) {
    process.exitCode = 1;
  }
}

main();
