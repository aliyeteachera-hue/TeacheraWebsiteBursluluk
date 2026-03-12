import { createHmac } from 'node:crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function decodeBase32(rawSecret) {
  const normalized = String(rawSecret || '')
    .trim()
    .replace(/[\s-]/g, '')
    .toUpperCase();

  if (!normalized) {
    throw new Error('Missing TOTP secret.');
  }

  let bits = '';
  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index < 0) {
      throw new Error(`Invalid Base32 char: ${char}`);
    }
    bits += index.toString(2).padStart(5, '0');
  }

  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function hotp(secretBuffer, counter, digits = 6) {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac('sha1', secretBuffer).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const code =
    ((digest[offset] & 0x7f) << 24)
    | ((digest[offset + 1] & 0xff) << 16)
    | ((digest[offset + 2] & 0xff) << 8)
    | (digest[offset + 3] & 0xff);
  return String(code % (10 ** digits)).padStart(digits, '0');
}

function main() {
  const secret = process.argv[2] || process.env.PANEL_TOTP_SECRET || '';
  const step = Math.floor(Date.now() / 1000 / 30);
  const secretBuffer = decodeBase32(secret);
  const code = hotp(secretBuffer, step, 6);
  process.stdout.write(code);
}

try {
  main();
} catch (error) {
  console.error('[panel-generate-totp-code] failed:', error.message || String(error));
  process.exit(1);
}
