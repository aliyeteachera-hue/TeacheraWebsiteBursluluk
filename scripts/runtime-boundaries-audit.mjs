import fs from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const apiRoot = path.join(projectRoot, 'api');
const manifestPath = path.join(projectRoot, 'config', 'runtime-boundaries.json');

function globToRegex(glob) {
  const normalized = glob.replace(/\\/g, '/');
  let regex = '^';

  for (let i = 0; i < normalized.length; i += 1) {
    const ch = normalized[i];

    if (ch === '*') {
      const next = normalized[i + 1];
      if (next === '*') {
        regex += '.*';
        i += 1;
      } else {
        regex += '[^/]*';
      }
      continue;
    }

    if ('\\^$+?.()|{}[]'.includes(ch)) {
      regex += `\\${ch}`;
      continue;
    }

    regex += ch;
  }

  regex += '$';
  return new RegExp(regex);
}

async function listApiFiles(dir, root = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listApiFiles(fullPath, root)));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.js')) {
      continue;
    }

    const relative = path.relative(root, fullPath).replace(/\\/g, '/');
    files.push(`api/${relative}`);
  }

  return files.sort();
}

async function main() {
  const manifestRaw = await fs.readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);
  const runtimes = manifest.runtimes || {};

  const runtimePatterns = Object.entries(runtimes).map(([runtime, spec]) => ({
    runtime,
    patterns: (spec.api_patterns || []).map((pattern) => ({
      pattern,
      regex: globToRegex(pattern)
    }))
  }));

  const apiFiles = await listApiFiles(apiRoot);
  const endpointFiles = apiFiles.filter((f) => !f.startsWith('api/_lib/'));

  const unowned = [];
  const conflicts = [];
  const ownership = [];

  for (const file of endpointFiles) {
    const owners = runtimePatterns
      .filter((entry) => entry.patterns.some((p) => p.regex.test(file)))
      .map((entry) => entry.runtime);

    if (owners.length === 0) {
      unowned.push(file);
    } else if (owners.length > 1 && file !== 'api/health.js') {
      conflicts.push({ file, owners });
    }

    ownership.push({ file, owners });
  }

  console.log(
    JSON.stringify(
      {
        ok: unowned.length === 0 && conflicts.length === 0,
        totals: {
          endpoint_files: endpointFiles.length,
          unowned: unowned.length,
          conflicts: conflicts.length
        },
        unowned,
        conflicts,
        ownership
      },
      null,
      2
    )
  );

  if (unowned.length > 0 || conflicts.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[runtime-boundaries:audit] failed', error);
  process.exit(1);
});
