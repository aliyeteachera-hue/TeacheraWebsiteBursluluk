import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sharedDir = path.join(root, 'packages', 'shared', 'backend');
const targets = ['api/_lib', 'apps/exam-api/api/_lib', 'apps/panel-api/api/_lib', 'apps/ops-api/api/_lib'];
const GENERATED_HEADER = '// AUTO-GENERATED FROM packages/shared/backend. DO NOT EDIT DIRECTLY.\n';

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

for (const relTarget of targets) {
  const targetDir = path.join(root, relTarget);
  fs.mkdirSync(targetDir, { recursive: true });

  const existing = fs.readdirSync(targetDir).filter((file) => file.endsWith('.js'));
  for (const oldFile of existing) {
    if (!files.includes(oldFile)) {
      fs.rmSync(path.join(targetDir, oldFile), { force: true });
    }
  }

  for (const file of files) {
    const sourcePath = path.join(sharedDir, file);
    const targetPath = path.join(targetDir, file);
    const sourceCode = fs.readFileSync(sourcePath, 'utf8');
    fs.writeFileSync(targetPath, `${GENERATED_HEADER}${sourceCode}`);
  }

  console.log(`synced:${relTarget}:${files.length}`);
}

console.log('sync_shared_backend_done');
