// AUTO-GENERATED FROM packages/shared/backend. DO NOT EDIT DIRECTLY.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { safeTrim } from './http.js';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function readWindowSteps() {
  const parsed = Number.parseInt(safeTrim(process.env.PANEL_TOTP_WINDOW_STEPS || '1'), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 1;
  return Math.min(parsed, 5);
}

function decodeBase32(rawSecret) {
  const normalized = safeTrim(rawSecret)
    .replace(/[\s-]/g, '')
    .toUpperCase();

  if (!normalized) return Buffer.alloc(0);

  let bits = '';
  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index < 0) {
      throw new Error('Invalid Base32 character in TOTP secret.');
    }
    bits += index.toString(2).padStart(5, '0');
  }

  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }

  return Buffer.from(bytes);
}

function hotp(secret, counter, digits = 6) {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac('sha1', secret).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const code =
    ((digest[offset] & 0x7f) << 24)
    | ((digest[offset + 1] & 0xff) << 16)
    | ((digest[offset + 2] & 0xff) << 8)
    | (digest[offset + 3] & 0xff);

  const modulo = 10 ** digits;
  return String(code % modulo).padStart(digits, '0');
}

function safeCodeEquals(left, right) {
  const l = Buffer.from(String(left));
  const r = Buffer.from(String(right));
  if (l.length !== r.length) return false;
  return timingSafeEqual(l, r);
}

export function verifyTotpCode(secret, code, { nowMs = Date.now(), stepSeconds = 30, digits = 6 } = {}) {
  const normalizedCode = safeTrim(code).replace(/\s/g, '');
  if (!/^\d{6}$/.test(normalizedCode)) return false;

  const secretBuffer = decodeBase32(secret);
  if (!secretBuffer.length) return false;

  const currentStep = Math.floor(nowMs / 1000 / stepSeconds);
  const windowSteps = readWindowSteps();
  for (let offset = -windowSteps; offset <= windowSteps; offset += 1) {
    const expected = hotp(secretBuffer, currentStep + offset, digits);
    if (safeCodeEquals(normalizedCode, expected)) {
      return true;
    }
  }

  return false;
}
