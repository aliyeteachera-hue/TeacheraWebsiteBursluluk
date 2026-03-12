import { createHash, createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function trim(value) {
  return String(value ?? '').trim();
}

function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJson(item)).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readArg(name) {
  const withPrefix = `--${name}=`;
  const token = process.argv.find((item) => item.startsWith(withPrefix));
  if (token) return token.slice(withPrefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index > -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return '';
}

function main() {
  const reportPath = resolve(trim(readArg('report') || 'guidelines/p0-11-load-resilience-report-latest.json'));
  const signingKey = trim(readArg('signing-key') || process.env.P0_11_REPORT_SIGNING_KEY || process.env.CRON_SECRET);
  if (!signingKey) {
    throw new Error('Missing signing key. Set P0_11_REPORT_SIGNING_KEY or CRON_SECRET.');
  }

  const raw = readFileSync(reportPath, 'utf8');
  const parsed = JSON.parse(raw);
  const signatureBlock = parsed?.signature || {};
  const expectedSignature = trim(signatureBlock.signature);

  if (!expectedSignature) {
    throw new Error('Report does not contain signature.');
  }

  const clone = deepClone(parsed);
  delete clone.signature;
  delete clone.totals;
  delete clone.overall_ready_for_p0_11;
  if (Array.isArray(clone.checks)) {
    clone.checks = clone.checks.filter((item) => item?.id !== 'signed_report');
  }

  const canonicalBody = stableJson(clone);
  const canonicalSha256 = createHash('sha256').update(canonicalBody).digest('hex');
  const computedSignature = createHmac('sha256', signingKey).update(canonicalBody).digest('hex');

  const shaOk = canonicalSha256 === trim(signatureBlock.canonical_sha256);
  const signatureOk = computedSignature === expectedSignature;

  const result = {
    ok: shaOk && signatureOk,
    report_path: reportPath,
    sha_ok: shaOk,
    signature_ok: signatureOk,
    signer: signatureBlock.signer || null,
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.ok) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error('[p0-11-load-resilience-verify-signature] failed:', error?.message || error);
  process.exit(1);
}
