#!/usr/bin/env node
import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minimatch } from 'minimatch';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const WORKFLOW_PATH = resolve(ROOT, '.github/workflows/ci.yml');
const OUTPUT_PATH = resolve(ROOT, 'guidelines/ci-path-filter-selftest-latest.json');
const REQUIRED_FILTERS = ['www', 'exam_api', 'panel_api', 'ops_api', 'force_all'];

function trim(value) {
  return String(value ?? '').trim();
}

function toBool(value) {
  return Boolean(value);
}

function pushCheck(checks, id, ok, detail, evidence = {}) {
  checks.push({
    id,
    status: ok ? 'PASS' : 'FAIL',
    detail,
    evidence,
  });
}

function parseWorkflowFilters(raw) {
  const lines = raw.split(/\r?\n/);
  const start = lines.findIndex((line) => line.includes('filters: |'));
  if (start < 0) return {};

  const filters = {};
  let current = null;
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^\s{6}-\s+name:/.test(line)) break;

    const filterMatch = line.match(/^\s{12}([a-z_]+):\s*$/);
    if (filterMatch) {
      current = filterMatch[1];
      if (!filters[current]) filters[current] = [];
      continue;
    }

    const patternMatch = line.match(/^\s{14}-\s+'([^']+)'\s*$/);
    if (patternMatch && current) {
      filters[current].push(patternMatch[1]);
    }
  }

  return filters;
}

function evaluateFilterMatches(filters, changedPaths) {
  const result = {};
  for (const [filterName, patterns] of Object.entries(filters)) {
    result[filterName] = patterns.some((pattern) =>
      changedPaths.some((candidate) => minimatch(candidate, pattern, { dot: true })),
    );
  }
  return result;
}

function evaluateDeployDecisions(matches) {
  const forceAll = toBool(matches.force_all);
  return {
    deploy_www: toBool(matches.www) || forceAll,
    deploy_exam_api: toBool(matches.exam_api) || forceAll,
    deploy_panel_api: toBool(matches.panel_api) || forceAll,
    deploy_ops_api: toBool(matches.ops_api) || forceAll,
  };
}

function main() {
  const checks = [];
  const raw = readFileSync(WORKFLOW_PATH, 'utf8');
  const filters = parseWorkflowFilters(raw);

  for (const required of REQUIRED_FILTERS) {
    const patterns = filters[required];
    pushCheck(
      checks,
      `filter_${required}_declared`,
      Array.isArray(patterns) && patterns.length > 0,
      Array.isArray(patterns) && patterns.length > 0
        ? `Filter "${required}" contains ${patterns.length} pattern(s).`
        : `Filter "${required}" is missing or empty.`,
    );
  }

  const scenarios = [
    {
      id: 'www_only_change',
      paths: ['apps/www/src/app/main.tsx'],
      expectMatches: { www: true, exam_api: false, panel_api: false, ops_api: false, force_all: false },
      expectDeploy: { deploy_www: true, deploy_exam_api: false, deploy_panel_api: false, deploy_ops_api: false },
    },
    {
      id: 'exam_only_change',
      paths: ['apps/exam-api/api/exam/session/start.js'],
      expectMatches: { www: false, exam_api: true, panel_api: false, ops_api: false, force_all: false },
      expectDeploy: { deploy_www: false, deploy_exam_api: true, deploy_panel_api: false, deploy_ops_api: false },
    },
    {
      id: 'panel_only_change',
      paths: ['apps/panel-api/api/panel/dashboard.js'],
      expectMatches: { www: false, exam_api: false, panel_api: true, ops_api: false, force_all: false },
      expectDeploy: { deploy_www: false, deploy_exam_api: false, deploy_panel_api: true, deploy_ops_api: false },
    },
    {
      id: 'ops_only_change',
      paths: ['apps/ops-api/api/notifications/worker.js'],
      expectMatches: { www: false, exam_api: false, panel_api: false, ops_api: true, force_all: false },
      expectDeploy: { deploy_www: false, deploy_exam_api: false, deploy_panel_api: false, deploy_ops_api: true },
    },
    {
      id: 'shared_backend_change',
      paths: ['packages/shared/backend/http.js'],
      expectMatches: { www: false, exam_api: true, panel_api: true, ops_api: true, force_all: true },
      expectDeploy: { deploy_www: true, deploy_exam_api: true, deploy_panel_api: true, deploy_ops_api: true },
    },
    {
      id: 'scripts_change_force_all',
      paths: ['scripts/p0-evidence-gate.mjs'],
      expectMatches: { www: false, exam_api: false, panel_api: false, ops_api: false, force_all: true },
      expectDeploy: { deploy_www: true, deploy_exam_api: true, deploy_panel_api: true, deploy_ops_api: true },
    },
    {
      id: 'docs_only_no_deploy',
      paths: ['guidelines/architecture-notes.md'],
      expectMatches: { www: false, exam_api: false, panel_api: false, ops_api: false, force_all: false },
      expectDeploy: { deploy_www: false, deploy_exam_api: false, deploy_panel_api: false, deploy_ops_api: false },
    },
  ];

  for (const scenario of scenarios) {
    const matches = evaluateFilterMatches(filters, scenario.paths);
    const deploy = evaluateDeployDecisions(matches);

    let matchesOk = true;
    for (const [key, expected] of Object.entries(scenario.expectMatches)) {
      if (toBool(matches[key]) !== expected) {
        matchesOk = false;
        break;
      }
    }
    pushCheck(
      checks,
      `${scenario.id}_matches`,
      matchesOk,
      matchesOk ? 'Path filter outputs match expected values.' : 'Path filter outputs do not match expected values.',
      { paths: scenario.paths, expected: scenario.expectMatches, actual: matches },
    );

    let deployOk = true;
    for (const [key, expected] of Object.entries(scenario.expectDeploy)) {
      if (toBool(deploy[key]) !== expected) {
        deployOk = false;
        break;
      }
    }
    pushCheck(
      checks,
      `${scenario.id}_deploy`,
      deployOk,
      deployOk ? 'Deploy decisions match expected values.' : 'Deploy decisions do not match expected values.',
      { expected: scenario.expectDeploy, actual: deploy },
    );
  }

  const totals = {
    pass: checks.filter((item) => item.status === 'PASS').length,
    fail: checks.filter((item) => item.status === 'FAIL').length,
  };

  const payload = {
    timestamp: new Date().toISOString(),
    workflow_path: '.github/workflows/ci.yml',
    overall_ok: totals.fail === 0,
    totals,
    checks,
  };

  writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(payload, null, 2));
  if (!payload.overall_ok) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error('[ci-path-filter-selftest] failed:', trim(error?.message || error));
  process.exit(1);
}
