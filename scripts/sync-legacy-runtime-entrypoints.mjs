import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'config', 'runtime-boundaries.json');
const targetRoot = path.join(root, 'api');
const generatedHeader = '// AUTO-GENERATED FROM apps/*/api (legacy root runtime mirror). DO NOT EDIT DIRECTLY.\n';

const serviceSources = {
  'exam-api': path.join(root, 'apps', 'exam-api', 'api'),
  'panel-api': path.join(root, 'apps', 'panel-api', 'api'),
  'ops-api': path.join(root, 'apps', 'ops-api', 'api')
};

const servicePrecedence = ['exam-api', 'panel-api', 'ops-api'];

function normalize(text) {
  return String(text || '').replace(/\r\n/g, '\n').trimEnd();
}

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

function listJsFiles(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listJsFiles(fullPath, base));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.js')) {
      continue;
    }
    const rel = path.relative(base, fullPath).replace(/\\/g, '/');
    files.push(rel);
  }
  return files.sort();
}

function loadManifest() {
  const raw = fs.readFileSync(manifestPath, 'utf8');
  return JSON.parse(raw);
}

function buildPatterns(manifest) {
  const runtimes = manifest.runtimes || {};
  return Object.entries(runtimes).reduce((acc, [runtime, spec]) => {
    acc[runtime] = (spec.api_patterns || []).map((pattern) => globToRegex(pattern));
    return acc;
  }, {});
}

function detectOwner(apiPath, patternsByRuntime) {
  const owners = Object.entries(patternsByRuntime)
    .filter(([, patterns]) => patterns.some((regex) => regex.test(apiPath)))
    .map(([runtime]) => runtime)
    .filter((runtime) => runtime !== 'www');

  if (owners.length <= 1) {
    return owners[0] || null;
  }

  for (const runtime of servicePrecedence) {
    if (owners.includes(runtime)) {
      return runtime;
    }
  }
  return owners[0] || null;
}

function ensureSourceDirs() {
  for (const [runtime, dir] of Object.entries(serviceSources)) {
    if (!fs.existsSync(dir)) {
      throw new Error(`missing_service_source_dir:${runtime}:${dir}`);
    }
  }
}

function main() {
  ensureSourceDirs();
  const manifest = loadManifest();
  const patternsByRuntime = buildPatterns(manifest);

  const desired = new Map();
  const conflicts = [];

  for (const [runtime, serviceDir] of Object.entries(serviceSources)) {
    const files = listJsFiles(serviceDir).filter((file) => !file.startsWith('_lib/'));
    for (const relPath of files) {
      const apiPath = `api/${relPath}`;
      const owner = detectOwner(apiPath, patternsByRuntime);
      if (owner && owner !== runtime && relPath !== 'health.js') {
        continue;
      }

      const sourcePath = path.join(serviceDir, relPath);
      const existing = desired.get(relPath);
      if (existing && relPath === 'health.js' && runtime !== 'exam-api') {
        continue;
      }
      if (existing && existing.sourcePath !== sourcePath) {
        const prevCode = normalize(fs.readFileSync(existing.sourcePath, 'utf8'));
        const nextCode = normalize(fs.readFileSync(sourcePath, 'utf8'));
        if (prevCode !== nextCode) {
          conflicts.push({
            relPath,
            sourceA: existing.sourcePath,
            sourceB: sourcePath
          });
          continue;
        }
      }

      if (!existing || runtime === 'exam-api') {
        desired.set(relPath, { runtime, sourcePath });
      }
    }
  }

  if (conflicts.length > 0) {
    console.error('legacy_runtime_sync_conflicts');
    for (const conflict of conflicts) {
      console.error(`- ${conflict.relPath}: ${conflict.sourceA} <> ${conflict.sourceB}`);
    }
    process.exit(1);
  }

  if (!fs.existsSync(targetRoot)) {
    fs.mkdirSync(targetRoot, { recursive: true });
  }

  const targetFiles = listJsFiles(targetRoot).filter((file) => !file.startsWith('_lib/'));
  const desiredFiles = Array.from(desired.keys()).sort();

  for (const stale of targetFiles) {
    if (!desired.has(stale)) {
      fs.rmSync(path.join(targetRoot, stale), { force: true });
    }
  }

  for (const relPath of desiredFiles) {
    const targetPath = path.join(targetRoot, relPath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    const sourceCode = fs.readFileSync(desired.get(relPath).sourcePath, 'utf8');
    fs.writeFileSync(targetPath, `${generatedHeader}${sourceCode}`);
  }

  console.log(`sync_legacy_runtime_done files=${desiredFiles.length}`);
}

try {
  main();
} catch (error) {
  console.error('[sync:legacy-runtime] failed', error);
  process.exit(1);
}
