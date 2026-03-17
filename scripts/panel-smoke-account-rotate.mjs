import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function readArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index < 0) return '';
  return String(process.argv[index + 1] || '').trim();
}

function parseBooleanArg(name, fallback = false) {
  const raw = readArg(name);
  if (!raw) return fallback;
  const normalized = raw.toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  throw new Error(`invalid_boolean:${name}:${raw}`);
}

function randomFromAlphabet(length, alphabet) {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

function generatePassword() {
  return `${randomFromAlphabet(20, 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789')}`;
}

function generateTotpSecret(length = 32) {
  return randomFromAlphabet(length, BASE32_ALPHABET);
}

async function main() {
  const email = readArg('email') || 'ops-smoke-panel@teachera.com.tr';
  const fullName = readArg('name') || 'Ops Smoke Panel';
  const outFile = readArg('out-file') || '/tmp/panel-smoke-account-secrets-latest.json';
  const requirePasswordReset = parseBooleanArg('require-password-reset', false);

  const password = generatePassword();
  const totpSecret = generateTotpSecret(32);

  const scriptPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'panel-create-admin.mjs');
  const result = spawnSync(process.execPath, [
    scriptPath,
    '--email', email,
    '--name', fullName,
    '--password', password,
    '--role', 'OPERATIONS',
    '--totp-secret', totpSecret,
    '--require-password-reset', String(requirePasswordReset),
  ], {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`panel_create_admin_failed:${result.status}`);
  }

  const payload = {
    rotated_at_utc: new Date().toISOString(),
    account: {
      email,
      full_name: fullName,
      role: 'OPERATIONS',
      mfa_enabled: true,
      require_password_reset: requirePasswordReset,
    },
    secrets: {
      panel_email: email,
      panel_password: password,
      panel_smoke_totp_secret: totpSecret,
    },
    usage_notes: [
      'Load these values directly into CI/Vercel secret manager.',
      'Do not paste secrets into shell history.',
      'Use PANEL_SMOKE_TOTP_SECRET in pipeline; do not store PANEL_MFA_CODE statically.',
    ],
  };

  await fs.writeFile(outFile, `${JSON.stringify(payload, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  await fs.chmod(outFile, 0o600);

  console.log(`[panel-smoke-account-rotate] rotation_complete email=${email} role=OPERATIONS mfa_enabled=true`);
  console.log(`[panel-smoke-account-rotate] secrets_written_to=${outFile} mode=600`);
  console.log('[panel-smoke-account-rotate] next_step=update CI/Vercel secrets: PANEL_EMAIL, PANEL_PASSWORD, PANEL_SMOKE_TOTP_SECRET');
}

main().catch((error) => {
  console.error('[panel-smoke-account-rotate] failed:', error.message || String(error));
  process.exit(1);
});
