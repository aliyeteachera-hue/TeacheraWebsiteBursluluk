import { Pool } from 'pg';
import { computePiiLookupHash, decryptPii, encryptPii } from '../api/_lib/piiCrypto.js';

const REDACTED_NAME = '[ENCRYPTED_PII]';

function resolveDatabaseUrl() {
  return (process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim();
}

function readArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return '';
  return String(process.argv[index + 1] || '').trim();
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function buildRedactedPhoneToken(phoneHash) {
  return `pii:${String(phoneHash || '').slice(0, 28)}`;
}

function normalizeLegacyString(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed === REDACTED_NAME) return '';
  if (trimmed.toLowerCase().startsWith('pii:')) return '';
  return trimmed;
}

function sameBuffer(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return Buffer.isBuffer(a) && Buffer.isBuffer(b) ? a.equals(b) : false;
}

async function backfillGuardians(pool, dryRun, limit, repairHashAll) {
  const selectResult = await pool.query(
    `
      SELECT id, full_name, phone_e164, email, full_name_enc, phone_e164_enc, email_enc, phone_e164_hash
      FROM guardians
      WHERE ${
        repairHashAll
          ? `phone_e164_enc IS NOT NULL OR phone_e164 IS NOT NULL`
          : `
            full_name_enc IS NULL
            OR phone_e164_enc IS NULL
            OR phone_e164_hash IS NULL
            OR (email IS NOT NULL AND email_enc IS NULL)
          `
      }
      ORDER BY created_at ASC
      LIMIT $1
    `,
    [limit],
  );

  let updated = 0;
  let skipped = 0;
  let decryptFailures = 0;

  for (const row of selectResult.rows) {
    const legacyFullName = normalizeLegacyString(row.full_name);
    const legacyPhone = normalizeLegacyString(row.phone_e164);
    const legacyEmail = normalizeLegacyString(row.email);
    const [fullNamePlain, phonePlain, emailPlain] = await Promise.all([
      decryptPii(row.full_name_enc, legacyFullName),
      decryptPii(row.phone_e164_enc, legacyPhone),
      decryptPii(row.email_enc, legacyEmail),
    ]);
    if (row.phone_e164_enc && !phonePlain) {
      decryptFailures += 1;
    }
    const [fullNameEnc, phoneEnc, emailEnc] = await Promise.all([
      row.full_name_enc || (fullNamePlain ? await encryptPii(fullNamePlain, 240) : null),
      row.phone_e164_enc || (phonePlain ? await encryptPii(phonePlain, 60) : null),
      row.email_enc || (emailPlain ? await encryptPii(emailPlain, 320) : null),
    ]);
    const phoneHash = phonePlain ? computePiiLookupHash(phonePlain) : '';

    if (!fullNameEnc || !phoneEnc || !phoneHash) {
      skipped += 1;
      continue;
    }

    const nextPhoneToken = buildRedactedPhoneToken(phoneHash);
    const requiresUpdate =
      !row.phone_e164_hash ||
      row.phone_e164_hash !== phoneHash ||
      row.full_name !== REDACTED_NAME ||
      row.phone_e164 !== nextPhoneToken ||
      row.email !== null ||
      !sameBuffer(row.full_name_enc, fullNameEnc) ||
      !sameBuffer(row.phone_e164_enc, phoneEnc) ||
      (emailEnc && !sameBuffer(row.email_enc, emailEnc));

    if (!requiresUpdate) {
      skipped += 1;
      continue;
    }

    if (!dryRun) {
      await pool.query(
        `
          UPDATE guardians
          SET
            full_name = $2,
            phone_e164 = $3,
            email = NULL,
            full_name_enc = $4,
            phone_e164_enc = $5,
            email_enc = COALESCE($6, email_enc),
            phone_e164_hash = $7,
            updated_at = NOW()
          WHERE id = $1
        `,
        [row.id, REDACTED_NAME, nextPhoneToken, fullNameEnc, phoneEnc, emailEnc, phoneHash],
      );
    }
    updated += 1;
  }

  return {
    scanned: selectResult.rowCount,
    updated,
    skipped,
    decrypt_failures: decryptFailures,
  };
}

async function backfillCandidates(pool, dryRun, limit, repairHashAll) {
  const selectResult = await pool.query(
    `
      SELECT id, full_name, full_name_enc, full_name_hash
      FROM candidates
      WHERE ${
        repairHashAll
          ? `full_name_enc IS NOT NULL OR full_name IS NOT NULL`
          : `full_name_enc IS NULL OR full_name_hash IS NULL`
      }
      ORDER BY created_at ASC
      LIMIT $1
    `,
    [limit],
  );

  let updated = 0;
  let skipped = 0;
  let decryptFailures = 0;

  for (const row of selectResult.rows) {
    const legacyFullName = normalizeLegacyString(row.full_name);
    const fullNamePlain = await decryptPii(row.full_name_enc, legacyFullName);
    if (row.full_name_enc && !fullNamePlain) {
      decryptFailures += 1;
    }
    const fullNameEnc = row.full_name_enc || (fullNamePlain ? await encryptPii(fullNamePlain, 240) : null);
    const fullNameHash = fullNamePlain ? computePiiLookupHash(fullNamePlain) : '';

    if (!fullNameEnc || !fullNameHash) {
      skipped += 1;
      continue;
    }

    const requiresUpdate =
      !row.full_name_hash ||
      row.full_name_hash !== fullNameHash ||
      row.full_name !== REDACTED_NAME ||
      !sameBuffer(row.full_name_enc, fullNameEnc);

    if (!requiresUpdate) {
      skipped += 1;
      continue;
    }

    if (!dryRun) {
      await pool.query(
        `
          UPDATE candidates
          SET
            full_name = $2,
            full_name_enc = $3,
            full_name_hash = $4,
            updated_at = NOW()
          WHERE id = $1
        `,
        [row.id, REDACTED_NAME, fullNameEnc, fullNameHash],
      );
    }
    updated += 1;
  }

  return {
    scanned: selectResult.rowCount,
    updated,
    skipped,
    decrypt_failures: decryptFailures,
  };
}

async function main() {
  const connectionString = resolveDatabaseUrl();
  if (!connectionString) {
    console.error('[p0-8-backfill-pii] DATABASE_URL/POSTGRES_URL is missing.');
    process.exit(1);
  }

  const limit = Number.parseInt(readArg('--limit') || '500', 10);
  const batchSize = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 5000)) : 500;
  const dryRun = hasFlag('--dry-run');
  const repairHashAll = hasFlag('--repair-hash-all');

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const guardians = await backfillGuardians(pool, dryRun, batchSize, repairHashAll);
    const candidates = await backfillCandidates(pool, dryRun, batchSize, repairHashAll);

    console.log(
      JSON.stringify(
        {
          ok: true,
          dry_run: dryRun,
          repair_hash_all: repairHashAll,
          batch_size: batchSize,
          guardians,
          candidates,
        },
        null,
        2,
      ),
    );
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[p0-8-backfill-pii] failed', error);
  process.exit(1);
});
