import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const generatedHeader = '// AUTO-GENERATED FROM apps/*/api (legacy root runtime mirror). DO NOT EDIT DIRECTLY.\n';
const targetRoot = path.join(root, 'api');

function normalize(text) {
  return String(text || '').replace(/\r\n/g, '\n').trimEnd();
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

function runCheck() {
  if (!fs.existsSync(targetRoot)) {
    console.error('legacy_api_root_missing');
    process.exit(1);
  }

  const targetFiles = listJsFiles(targetRoot).filter((file) => !file.startsWith('_lib/'));
  if (targetFiles.length === 0) {
    console.error('legacy_runtime_empty');
    process.exit(1);
  }

  const problems = [];
  for (const relPath of targetFiles) {
    const filePath = path.join(targetRoot, relPath);
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.startsWith(generatedHeader)) {
      problems.push(`${relPath}:missing_generated_header`);
      continue;
    }

    const sourceCode = normalize(raw.slice(generatedHeader.length));
    if (sourceCode.length === 0) {
      problems.push(`${relPath}:empty_after_header`);
    }
  }

  if (problems.length > 0) {
    console.error('legacy_runtime_sync_mismatch');
    for (const problem of problems) {
      console.error(`- ${problem}`);
    }
    console.error('run: npm run sync:legacy-runtime');
    process.exit(1);
  }

  console.log(`legacy_runtime_sync_ok files=${targetFiles.length}`);
}

try {
  runCheck();
} catch (error) {
  console.error('[check:legacy-runtime-sync] failed', error);
  process.exit(1);
}
