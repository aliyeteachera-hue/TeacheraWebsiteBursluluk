#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT_DIR = fileURLToPath(new URL('..', import.meta.url));
const MATRIX_PATH = path.join(ROOT_DIR, 'config', 'secret-scope-matrix.json');

function safeTrim(value) {
  return String(value ?? '').trim();
}

function parseArgs(argv) {
  const args = {
    environment: 'production',
    apply: false,
  };

  for (const arg of argv.slice(2)) {
    if (arg === '--apply') {
      args.apply = true;
      continue;
    }
    if (arg.startsWith('--environment=')) {
      args.environment = safeTrim(arg.slice('--environment='.length)) || 'production';
      continue;
    }
  }

  return args;
}

function loadMatrix() {
  return JSON.parse(fs.readFileSync(MATRIX_PATH, 'utf8'));
}

function runNpx(args, cwd) {
  const result = spawnSync('npx', args, {
    cwd,
    encoding: 'utf8',
  });

  return {
    ok: result.status === 0,
    stdout: safeTrim(result.stdout || ''),
    stderr: safeTrim(result.stderr || ''),
    status: result.status,
  };
}

function parseVercelEnvList(output, environment) {
  const target = safeTrim(environment).toLowerCase();
  const rows = [];
  const seen = new Set();

  for (const line of output.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(/\s{2,}/).map((part) => part.trim()).filter(Boolean);
    if (parts.length < 3) continue;

    const [name, valueType, environments] = parts;
    if (!/^[A-Z0-9_]+$/.test(name)) continue;
    if (valueType.toLowerCase() !== 'encrypted') continue;

    const envs = environments
      .split(',')
      .map((item) => safeTrim(item).toLowerCase())
      .filter(Boolean);

    if (!envs.includes(target)) continue;
    if (seen.has(name)) continue;

    seen.add(name);
    rows.push(name);
  }

  return rows;
}

function listProjectEnvNames(projectCwd, environment) {
  const result = runNpx(['--yes', 'vercel', 'env', 'ls', environment, '--cwd', projectCwd], ROOT_DIR);
  if (!result.ok) {
    throw new Error(`Failed to list env for ${projectCwd}: ${result.stdout}\n${result.stderr}`);
  }
  return parseVercelEnvList(`${result.stdout}\n${result.stderr}`, environment);
}

function removeEnv(projectCwd, envName, environment) {
  return runNpx(['--yes', 'vercel', 'env', 'rm', envName, environment, '--yes', '--cwd', projectCwd], ROOT_DIR);
}

function buildProtectedSet(projectConfig, rotationGroups) {
  const protectedNames = new Set();

  for (const key of projectConfig.required || []) protectedNames.add(key);
  for (const group of projectConfig.requiredAny || []) {
    for (const key of group) protectedNames.add(key);
  }
  for (const group of rotationGroups || []) {
    const arr = Array.isArray(group) ? group : [group];
    for (const key of arr) {
      protectedNames.add(key);
      protectedNames.add(`${key}_ROTATED_AT`);
    }
  }

  return protectedNames;
}

function unique(list) {
  return Array.from(new Set(list));
}

function main() {
  const args = parseArgs(process.argv);
  const matrix = loadMatrix();
  const deprecatedGlobal = matrix?.deprecated?.global || [];

  const report = {
    timestamp: new Date().toISOString(),
    environment: args.environment,
    apply: args.apply,
    projects: {},
    totals: {
      planned_removals: 0,
      removed: 0,
      failed: 0,
      skipped_protected: 0,
    },
    overall_ok: true,
  };

  for (const [projectId, projectConfig] of Object.entries(matrix.projects || {})) {
    const envNames = new Set(listProjectEnvNames(projectConfig.cwd, args.environment));
    const rotationGroups = matrix?.rotation?.criticalByProject?.[projectId] || [];
    const protectedNames = buildProtectedSet(projectConfig, rotationGroups);

    const forbiddenPresent = (projectConfig.forbidden || []).filter((name) => envNames.has(name));
    const deprecatedPresent = deprecatedGlobal.filter((name) => envNames.has(name));
    const candidates = unique([...forbiddenPresent, ...deprecatedPresent]);

    const projectReport = {
      cwd: projectConfig.cwd,
      forbidden_present: forbiddenPresent,
      deprecated_present: deprecatedPresent,
      planned: [],
      removed: [],
      failed: [],
      skipped_protected: [],
    };

    for (const key of candidates) {
      if (protectedNames.has(key)) {
        projectReport.skipped_protected.push(key);
        report.totals.skipped_protected += 1;
        continue;
      }

      projectReport.planned.push(key);
      report.totals.planned_removals += 1;

      if (!args.apply) continue;

      const result = removeEnv(projectConfig.cwd, key, args.environment);
      if (result.ok) {
        projectReport.removed.push(key);
        report.totals.removed += 1;
      } else {
        projectReport.failed.push({
          key,
          status: result.status,
          stderr: result.stderr,
        });
        report.totals.failed += 1;
        report.overall_ok = false;
      }
    }

    report.projects[projectId] = projectReport;
  }

  console.log(JSON.stringify(report, null, 2));

  if (args.apply && report.totals.failed > 0) {
    process.exitCode = 1;
  }
}

main();
