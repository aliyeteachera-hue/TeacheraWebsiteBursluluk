// AUTO-GENERATED FROM packages/shared/backend. DO NOT EDIT DIRECTLY.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { HttpError } from './errors.js';
import { safeTrim } from './http.js';

const SIGNATURE_HEADER_KEYS = [
  'x-provider-signature',
  'x-provider-signature-256',
  'x-webhook-signature',
  'x-signature',
  'x-hub-signature-256',
];

const TIMESTAMP_HEADER_KEYS = [
  'x-provider-timestamp',
  'x-webhook-timestamp',
  'x-signature-timestamp',
];

function readSigningSecret() {
  return safeTrim(
    process.env.NOTIFICATION_PROVIDER_WEBHOOK_SIGNING_SECRET
      || process.env.NOTIFICATION_PROVIDER_WEBHOOK_SECRET,
  );
}

function readMaxAgeSeconds() {
  const parsed = Number.parseInt(
    safeTrim(process.env.NOTIFICATION_PROVIDER_WEBHOOK_MAX_AGE_SECONDS || '300'),
    10,
  );
  if (!Number.isFinite(parsed) || parsed <= 0) return 300;
  return Math.min(parsed, 24 * 60 * 60);
}

function readHeader(req, keys) {
  for (const key of keys) {
    const value = safeTrim(req.headers?.[key]);
    if (value) return value;
  }
  return '';
}

function parseTimestamp(rawSignatureHeader, req) {
  const explicit = readHeader(req, TIMESTAMP_HEADER_KEYS);
  if (explicit) return explicit;

  const match = rawSignatureHeader.match(/(?:^|,)\s*t=(\d{1,20})(?:,|$)/i);
  return match?.[1] || '';
}

function normalizeSignatureValue(value) {
  const trimmed = safeTrim(value);
  if (!trimmed) return '';

  if (trimmed.toLowerCase().startsWith('sha256=')) {
    return safeTrim(trimmed.slice('sha256='.length));
  }

  return trimmed;
}

function extractSignatureCandidates(rawSignatureHeader) {
  const header = safeTrim(rawSignatureHeader);
  if (!header) return [];

  const candidates = new Set();
  const chunks = header.split(',');
  for (const chunk of chunks) {
    const piece = safeTrim(chunk);
    if (!piece) continue;

    const eqIndex = piece.indexOf('=');
    if (eqIndex > -1) {
      const key = safeTrim(piece.slice(0, eqIndex)).toLowerCase();
      const value = normalizeSignatureValue(piece.slice(eqIndex + 1).replace(/^"|"$/g, ''));
      if (value && key !== 't' && key !== 'ts' && key !== 'timestamp') {
        candidates.add(value);
      }
    } else {
      const value = normalizeSignatureValue(piece.replace(/^"|"$/g, ''));
      if (value) candidates.add(value);
    }
  }

  const hexMatches = header.match(/[a-fA-F0-9]{64}/g) || [];
  for (const hex of hexMatches) {
    candidates.add(hex);
  }

  return Array.from(candidates);
}

function hmacHex(secret, raw) {
  return createHmac('sha256', secret).update(raw).digest('hex');
}

function hmacBase64(secret, raw) {
  return createHmac('sha256', secret).update(raw).digest('base64');
}

function safeEqual(left, right) {
  const l = Buffer.from(left);
  const r = Buffer.from(right);
  if (l.length !== r.length) return false;
  return timingSafeEqual(l, r);
}

function verifyTimestampFreshness(timestampRaw, maxAgeSeconds) {
  if (!timestampRaw) return true;

  const timestamp = Number.parseInt(safeTrim(timestampRaw), 10);
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    throw new HttpError(401, 'Webhook timestamp is invalid.', 'invalid_webhook_timestamp');
  }

  // Accept both seconds and milliseconds.
  const timestampMs = timestamp > 1e12 ? timestamp : timestamp * 1000;
  const driftMs = Math.abs(Date.now() - timestampMs);
  if (driftMs > maxAgeSeconds * 1000) {
    throw new HttpError(401, 'Webhook signature timestamp is expired.', 'expired_webhook_signature');
  }

  return true;
}

export function assertWebhookSignature(req, rawBody) {
  const secret = readSigningSecret();
  if (!secret) {
    throw new HttpError(500, 'Webhook signing secret is not configured.', 'missing_webhook_signing_secret');
  }

  const rawSignatureHeader = readHeader(req, SIGNATURE_HEADER_KEYS);
  if (!rawSignatureHeader) {
    throw new HttpError(401, 'Webhook signature header is missing.', 'missing_webhook_signature');
  }

  const timestamp = parseTimestamp(rawSignatureHeader, req);
  verifyTimestampFreshness(timestamp, readMaxAgeSeconds());

  const messageRaw = timestamp ? `${timestamp}.${rawBody}` : rawBody;
  const altMessageRaw = timestamp ? `${timestamp}:${rawBody}` : rawBody;
  const expectedHex = hmacHex(secret, messageRaw);
  const expectedBase64 = hmacBase64(secret, messageRaw);
  const altExpectedHex = hmacHex(secret, altMessageRaw);
  const altExpectedBase64 = hmacBase64(secret, altMessageRaw);

  const candidates = extractSignatureCandidates(rawSignatureHeader);
  const verified = candidates.some((candidate) => {
    const value = normalizeSignatureValue(candidate);
    if (!value) return false;

    const lower = value.toLowerCase();
    return (
      safeEqual(lower, expectedHex)
      || safeEqual(value, expectedBase64)
      || safeEqual(lower, altExpectedHex)
      || safeEqual(value, altExpectedBase64)
    );
  });

  if (!verified) {
    throw new HttpError(401, 'Webhook signature verification failed.', 'invalid_webhook_signature');
  }

  return {
    verified: true,
    timestamp: timestamp || null,
    signature_header_key: SIGNATURE_HEADER_KEYS.find((key) => safeTrim(req.headers?.[key])) || 'unknown',
  };
}
