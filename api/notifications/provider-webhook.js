// AUTO-GENERATED FROM apps/*/api (legacy root runtime mirror). DO NOT EDIT DIRECTLY.
import { HttpError } from '../_lib/errors.js';
import { handleRequest, methodGuard, ok, safeTrim } from '../_lib/http.js';
import {
  applyWebhookEventToJob,
  extractWebhookReferences,
  normalizeNotificationEventStatus,
  pickWebhookErrorCode,
  queueWebhookInbox,
  resolveNotificationJobId,
} from '../_lib/notificationWebhookReconciliation.js';
import { assertWebhookSignature } from '../_lib/webhookSignature.js';

function toObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

async function readRawBodyAndJson(req) {
  if (typeof req.body === 'string') {
    const rawBody = req.body;
    try {
      const parsed = JSON.parse(rawBody);
      return { rawBody, body: toObject(parsed) };
    } catch {
      return { rawBody, body: null };
    }
  }

  if (req.body && typeof req.body === 'object') {
    const body = toObject(req.body);
    return {
      rawBody: JSON.stringify(body),
      body,
    };
  }

  return new Promise((resolve) => {
    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk;
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(rawBody || '{}');
        resolve({ rawBody, body: toObject(parsed) });
      } catch {
        resolve({ rawBody, body: null });
      }
    });
    req.on('error', () => resolve({ rawBody, body: null }));
  });
}

function pickWebhookHeaders(req, signatureMeta) {
  return {
    provider_name: safeTrim(req.headers?.['x-provider-name'] || req.headers?.['x-provider'] || ''),
    signature_header_key: signatureMeta?.signature_header_key || null,
    timestamp: signatureMeta?.timestamp || null,
    x_provider_signature: safeTrim(req.headers?.['x-provider-signature']),
    x_provider_signature_256: safeTrim(req.headers?.['x-provider-signature-256']),
    x_webhook_signature: safeTrim(req.headers?.['x-webhook-signature']),
    x_signature: safeTrim(req.headers?.['x-signature']),
    x_hub_signature_256: safeTrim(req.headers?.['x-hub-signature-256']),
    x_provider_timestamp: safeTrim(req.headers?.['x-provider-timestamp']),
    x_webhook_timestamp: safeTrim(req.headers?.['x-webhook-timestamp']),
    x_signature_timestamp: safeTrim(req.headers?.['x-signature-timestamp']),
  };
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    methodGuard(req, ['POST']);

    const { rawBody, body } = await readRawBodyAndJson(req);
    if (!body || typeof body !== 'object') {
      throw new HttpError(400, 'Request body must be valid JSON.', 'invalid_json');
    }

    const signatureMeta = assertWebhookSignature(req, rawBody || '{}');
    const status = normalizeNotificationEventStatus(body.status || body.event_type || body.eventType);
    const errorCode = pickWebhookErrorCode(body);
    const references = extractWebhookReferences(body);
    const resolvedJobId = await resolveNotificationJobId(references);
    const providerMessageId = references.providerMessageId;

    if (!resolvedJobId) {
      const inboxId = await queueWebhookInbox({
        payload: body,
        headers: pickWebhookHeaders(req, signatureMeta),
        status,
        errorCode,
        references,
        signatureValid: true,
      });

      res.status(202).setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({
        ok: true,
        queued_for_reconciliation: true,
        webhook_inbox_id: inboxId,
        status,
      }));
      return;
    }

    const eventPayload = toObject(body.event_payload || body.eventPayload || body.data);
    await applyWebhookEventToJob({
      jobId: resolvedJobId,
      status,
      providerMessageId,
      errorCode,
      eventPayload: {
        ...eventPayload,
        source: 'provider_webhook',
      },
    });

    ok(res, {
      job_id: resolvedJobId,
      status,
      reconciled_from_inbox: false,
    });
  });
}
