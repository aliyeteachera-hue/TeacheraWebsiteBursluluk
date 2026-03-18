import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { getPool } from '../packages/shared/backend/db.js';

function resolveDatabaseUrl() {
  return (process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim();
}

async function listMigrationFiles(migrationsDir) {
  const entries = await readdir(migrationsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort();
}

async function main() {
  const connectionString = resolveDatabaseUrl();
  if (!connectionString) {
    console.error('DATABASE_URL/POSTGRES_URL bulunamadı. Önce env tanımlayın.');
    process.exit(1);
  }

  const currentFile = fileURLToPath(import.meta.url);
  const rootDir = path.resolve(path.dirname(currentFile), '..');
  const migrationsDir = path.join(rootDir, 'db', 'migrations');
  const migrationFiles = await listMigrationFiles(migrationsDir);

  if (migrationFiles.length === 0) {
    console.log('Migration dosyası bulunamadı.');
    return;
  }

  const pool = getPool();

  try {
    for (const fileName of migrationFiles) {
      const filePath = path.join(migrationsDir, fileName);
      const sql = await readFile(filePath, 'utf8');
      console.log(`Applying ${fileName} ...`);
      await pool.query(sql);
      console.log(`Applied ${fileName}`);
    }
    console.log('Tüm migration dosyaları uygulandı.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[db:migrate] failed', error);
  process.exit(1);
});
