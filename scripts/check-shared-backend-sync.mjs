import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sharedDir = path.join(root, 'packages', 'shared', 'backend');
const targets = ['api/_lib', 'apps/exam-api/api/_lib', 'apps/panel-api/api/_lib', 'apps/ops-api/api/_lib'];
const GENERATED_HEADER = '// AUTO-GENERATED FROM packages/shared/backend. DO NOT EDIT DIRECTLY.\n';

function normalize(text) {
  return String(text || '').replace(/\r\n/g, '\n').trimEnd();
}

if (!fs.existsSync(sharedDir)) {
  console.error('missing_shared_backend_dir');
  process.exit(1);
}

const files = fs
  .readdirSync(sharedDir)
  .filter((file) => file.endsWith('.js'))
  .sort();

if (files.length === 0) {
  console.error('no_shared_backend_modules');
  process.exit(1);
}

const problems = [];

for (const relTarget of targets) {
  const targetDir = path.join(root, relTarget);
  if (!fs.existsSync(targetDir)) {
    problems.push(`${relTarget}:missing_target_dir`);
    continue;
  }

  const existing = fs.readdirSync(targetDir).filter((file) => file.endsWith('.js')).sort();
  for (const file of existing) {
    if (!files.includes(file)) {
      problems.push(`${relTarget}/${file}:extra_file`);
    }
  }

  for (const file of files) {
    const sourcePath = path.join(sharedDir, file);
    const targetPath = path.join(targetDir, file);

    if (!fs.existsSync(targetPath)) {
      problems.push(`${relTarget}/${file}:missing_file`);
      continue;
    }

    const sourceCode = normalize(fs.readFileSync(sourcePath, 'utf8'));
    let targetCode = fs.readFileSync(targetPath, 'utf8');
    if (targetCode.startsWith(GENERATED_HEADER)) {
      targetCode = targetCode.slice(GENERATED_HEADER.length);
    }
    targetCode = normalize(targetCode);

    if (sourceCode !== targetCode) {
      problems.push(`${relTarget}/${file}:content_mismatch`);
    }
  }
}

if (problems.length > 0) {
  console.error('shared_backend_sync_mismatch');
  for (const item of problems) {
    console.error(`- ${item}`);
  }
  console.error('run: npm run sync:shared-backend');
  process.exit(1);
}

console.log(`shared_backend_sync_ok files=${files.length} targets=${targets.length}`);
