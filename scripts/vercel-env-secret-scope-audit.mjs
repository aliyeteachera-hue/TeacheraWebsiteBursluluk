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
    maxAgeDays: null,
  };

  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--environment=')) {
      args.environment = safeTrim(arg.slice('--environment='.length)) || 'production';
      continue;
    }
    if (arg.startsWith('--max-age-days=')) {
      const raw = Number.parseInt(safeTrim(arg.slice('--max-age-days='.length)), 10);
      if (!Number.isNaN(raw) && raw > 0) args.maxAgeDays = raw;
      continue;
    }
  }

  return args;
}

function loadMatrix() {
  return JSON.parse(fs.readFileSync(MATRIX_PATH, 'utf8'));
}

function runVercelEnvLs(projectCwd, environment) {
  const args = ['--yes', 'vercel', 'env', 'ls', environment, '--cwd', projectCwd];
  const result = spawnSync('npx', args, {
    cwd: ROOT_DIR,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    const details = safeTrim(`${result.stdout || ''}\n${result.stderr || ''}`);
    throw new Error(`Failed to list env for ${projectCwd}: ${details}`);
  }

  return safeTrim(`${result.stdout || ''}\n${result.stderr || ''}`);
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

    const [name, valueType, environments, ...tail] = parts;
    if (!/^[A-Z0-9_]+$/.test(name)) continue;
    if (valueType.toLowerCase() !== 'encrypted') continue;

    const envs = environments
      .split(',')
      .map((item) => safeTrim(item).toLowerCase())
      .filter(Boolean);

    if (!envs.includes(target)) continue;
    if (seen.has(name)) continue;

    seen.add(name);
    rows.push({
      name,
      created: safeTrim(tail.join(' ')),
    });
  }

  return rows;
}

function parseAgeDays(createdText) {
  const raw = safeTrim(createdText).toLowerCase().replace(/\s+ago$/, '').trim();
  if (!raw) return null;

  const match = raw.match(/^(\d+)\s*(s|m|h|d|w|mo|y)$/i);
  if (!match) return null;

  const value = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1 / 86400,
    m: 1 / 1440,
    h: 1 / 24,
    d: 1,
    w: 7,
    mo: 30,
    y: 365,
  };

  const mult = multipliers[unit];
  if (!mult) return null;
  return value * mult;
}

function pushCheck(checks, project, id, ok, detail, evidence = {}) {
  checks.push({
    project,
    id,
    status: ok ? 'PASS' : 'FAIL',
    detail,
    evidence,
  });
}

function flattenGroups(groups) {
  return (groups || []).flatMap((group) => (Array.isArray(group) ? group : [group]));
}

function runProjectChecks(projectId, config, matrix, envRows, maxAgeDays, checks) {
  const names = new Set(envRows.map((item) => item.name));
  const createdByName = new Map(envRows.map((item) => [item.name, item.created]));

  for (const name of config.required || []) {
    pushCheck(
      checks,
      projectId,
      `${projectId}_required_${name.toLowerCase()}`,
      names.has(name),
      names.has(name) ? `${name} is set.` : `Missing required env: ${name}`,
      { env: name },
    );
  }

  for (const group of config.requiredAny || []) {
    const present = group.filter((name) => names.has(name));
    const idSuffix = group.join('_or_').toLowerCase();
    pushCheck(
      checks,
      projectId,
      `${projectId}_required_any_${idSuffix}`,
      present.length > 0,
      present.length > 0
        ? `Required-any group satisfied by: ${present.join(', ')}`
        : `Missing required-any group: ${group.join(' | ')}`,
      { group, present },
    );
  }

  for (const name of config.forbidden || []) {
    pushCheck(
      checks,
      projectId,
      `${projectId}_forbidden_${name.toLowerCase()}`,
      !names.has(name),
      names.has(name) ? `Forbidden env exists: ${name}` : `${name} is not present (ok).`,
      { env: name },
    );
  }

  for (const name of matrix?.deprecated?.global || []) {
    pushCheck(
      checks,
      projectId,
      `${projectId}_deprecated_${name.toLowerCase()}`,
      !names.has(name),
      names.has(name) ? `Deprecated env must be revoked: ${name}` : `${name} is not present (ok).`,
      { env: name },
    );
  }

  const rotationGroups = matrix?.rotation?.criticalByProject?.[projectId] || [];
  for (const group of rotationGroups) {
    const present = group.filter((name) => names.has(name));
    const groupLabel = group.join(' | ');
    const groupId = group.join('_or_').toLowerCase();

    pushCheck(
      checks,
      projectId,
      `${projectId}_rotation_group_present_${groupId}`,
      present.length > 0,
      present.length > 0
        ? `Rotation critical group present via: ${present.join(', ')}`
        : `Critical secret group missing: ${groupLabel}`,
      { group, present },
    );

    for (const key of present) {
      const markerKey = `${key}_ROTATED_AT`;
      const hasMarker = names.has(markerKey);
      pushCheck(
        checks,
        projectId,
        `${projectId}_rotation_marker_${key.toLowerCase()}`,
        hasMarker,
        hasMarker ? `Rotation marker is set: ${markerKey}` : `Missing rotation marker: ${markerKey}`,
        { key, marker: markerKey },
      );

      const createdText = createdByName.get(key);
      const markerCreatedText = createdByName.get(markerKey);
      const keyAge = parseAgeDays(createdText);
      const markerAge = parseAgeDays(markerCreatedText);

      if (createdText) {
        pushCheck(
          checks,
          projectId,
          `${projectId}_rotation_age_secret_${key.toLowerCase()}`,
          keyAge !== null && keyAge <= maxAgeDays,
          keyAge === null
            ? `Cannot parse age for ${key}: "${createdText}"`
            : `${key} age=${keyAge.toFixed(2)}d (max ${maxAgeDays}d)`,
          { key, created: createdText, age_days: keyAge, max_age_days: maxAgeDays },
        );
      }

      if (hasMarker && markerCreatedText) {
        pushCheck(
          checks,
          projectId,
          `${projectId}_rotation_age_marker_${key.toLowerCase()}`,
          markerAge !== null && markerAge <= maxAgeDays,
          markerAge === null
            ? `Cannot parse age for ${markerKey}: "${markerCreatedText}"`
            : `${markerKey} age=${markerAge.toFixed(2)}d (max ${maxAgeDays}d)`,
          {
            key,
            marker: markerKey,
            created: markerCreatedText,
            age_days: markerAge,
            max_age_days: maxAgeDays,
          },
        );
      }
    }
  }

  const forbiddenPresent = (config.forbidden || []).filter((name) => names.has(name));
  const deprecatedPresent = (matrix?.deprecated?.global || []).filter((name) => names.has(name));

  return {
    env_count: envRows.length,
    forbidden_present: forbiddenPresent,
    deprecated_present: deprecatedPresent,
  };
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
  const args = parseArgs(process.argv);
  const matrix = loadMatrix();
  const maxAgeDays = args.maxAgeDays || matrix?.rotation?.maxAgeDays || 90;
  const checks = [];
  const projectReports = {};

  for (const [projectId, config] of Object.entries(matrix.projects || {})) {
    const output = runVercelEnvLs(config.cwd, args.environment);
    const envRows = parseVercelEnvList(output, args.environment);

    projectReports[projectId] = runProjectChecks(projectId, config, matrix, envRows, maxAgeDays, checks);
  }

  const totals = summarize(checks);
  const response = {
    timestamp: new Date().toISOString(),
    matrix_version: matrix.version,
    environment: args.environment,
    rotation_max_age_days: maxAgeDays,
    totals,
    overall_ok: totals.fail === 0,
    projects: projectReports,
    checks,
  };

  console.log(JSON.stringify(response, null, 2));
  if (!response.overall_ok) {
    process.exitCode = 1;
  }
}

main();
