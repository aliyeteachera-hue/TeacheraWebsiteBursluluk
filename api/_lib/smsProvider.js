import { normalizePhone, safeTrim } from './http.js';

const DEFAULT_BASE_URL = 'https://mobikob.com';
const DEFAULT_TENANT_ID = '3616';

function trimTrailingSlash(value) {
  return safeTrim(value).replace(/\/+$/, '');
}

function readSmsConfig() {
  return {
    baseUrl: trimTrailingSlash(process.env.MOBIKOB_SMS_BASE_URL || DEFAULT_BASE_URL) || DEFAULT_BASE_URL,
    tenantId: safeTrim(process.env.MOBIKOB_SMS_TENANT_ID || DEFAULT_TENANT_ID) || DEFAULT_TENANT_ID,
    apiUser: safeTrim(process.env.MOBIKOB_SMS_API_USER),
    apiPass: safeTrim(process.env.MOBIKOB_SMS_API_PASS),
    head: safeTrim(process.env.MOBIKOB_SMS_HEAD),
  };
}

function ensureConfig(config) {
  if (config.apiUser && config.apiPass && config.head) {
    return config;
  }
  throw new Error('sms_provider_not_configured');
}

function normalizeRecipientPhone(value) {
  const normalized = normalizePhone(value);
  if (normalized.length !== 12) {
    throw new Error('invalid_sms_recipient');
  }
  return normalized;
}

async function parseProviderResponse(response) {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    return {
      raw: rawText,
    };
  }
}

function buildTenantUrl(config, path) {
  return `${config.baseUrl}/tenant/${config.tenantId}${path}`;
}

export function isSmsProviderConfigured() {
  const config = readSmsConfig();
  return Boolean(config.apiUser && config.apiPass && config.head);
}

export function getSmsProviderMode() {
  return isSmsProviderConfigured() ? 'provider' : 'preview';
}

export async function sendSms({ to, msg }) {
  const config = ensureConfig(readSmsConfig());
  const normalizedPhone = normalizeRecipientPhone(to);
  const message = safeTrim(msg);

  const url = new URL(buildTenantUrl(config, '/sms/send'));
  url.searchParams.set('api_user', config.apiUser);
  url.searchParams.set('api_pass', config.apiPass);
  url.searchParams.set('head', config.head);
  url.searchParams.set('to', normalizedPhone);
  url.searchParams.set('msg', message);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  const payload = await parseProviderResponse(response);

  if (!response.ok) {
    throw new Error(
      safeTrim(payload?.message) || safeTrim(payload?.error) || `sms_provider_http_${response.status}`,
    );
  }

  return {
    provider: 'mobikob',
    mode: 'single',
    status: safeTrim(payload?.status) || 'wait',
    messageId: safeTrim(payload?.message_id),
    head: safeTrim(payload?.head) || config.head,
    to: safeTrim(payload?.to) || normalizedPhone,
    rawResponse: payload,
  };
}

function extractBulkResponses(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.messages)) return payload.messages;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  return null;
}

export async function sendBulkSms(messages) {
  const config = ensureConfig(readSmsConfig());
  const items = Array.isArray(messages)
    ? messages
        .map((item) => {
          const to = normalizeRecipientPhone(item?.to);
          const msg = safeTrim(item?.msg);
          if (!msg) return null;
          return { to, msg };
        })
        .filter(Boolean)
    : [];

  if (items.length === 0) {
    return {
      provider: 'mobikob',
      mode: 'bulk',
      status: 'skipped',
      responses: [],
      rawResponse: null,
    };
  }

  const response = await fetch(buildTenantUrl(config, '/sms/bulk/api/'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_user: config.apiUser,
      api_pass: config.apiPass,
      head: config.head,
      messages: items,
    }),
  });

  const payload = await parseProviderResponse(response);
  if (!response.ok) {
    throw new Error(
      safeTrim(payload?.message) || safeTrim(payload?.error) || `sms_provider_http_${response.status}`,
    );
  }

  const responses = extractBulkResponses(payload);
  return {
    provider: 'mobikob',
    mode: 'bulk',
    status: safeTrim(payload?.status) || 'wait',
    responses: Array.isArray(responses) ? responses : null,
    rawResponse: payload,
  };
}

export async function querySmsStatus(messageId) {
  const config = ensureConfig(readSmsConfig());
  const normalizedMessageId = safeTrim(messageId);
  if (!normalizedMessageId) {
    throw new Error('missing_message_id');
  }

  const url = new URL(buildTenantUrl(config, `/sms/${normalizedMessageId}/status`));
  url.searchParams.set('api_user', config.apiUser);
  url.searchParams.set('api_pass', config.apiPass);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  const payload = await parseProviderResponse(response);

  if (!response.ok) {
    throw new Error(
      safeTrim(payload?.message) || safeTrim(payload?.error) || `sms_provider_http_${response.status}`,
    );
  }

  return {
    provider: 'mobikob',
    status: safeTrim(payload?.status) || 'unknown',
    messageId: safeTrim(payload?.message_id) || normalizedMessageId,
    sentAt: payload?.sent_at || null,
    rawResponse: payload,
  };
}

export async function getSmsBalance() {
  const config = ensureConfig(readSmsConfig());

  const url = new URL(buildTenantUrl(config, '/sms/balance'));
  url.searchParams.set('api_user', config.apiUser);
  url.searchParams.set('api_pass', config.apiPass);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  const payload = await parseProviderResponse(response);

  if (!response.ok) {
    throw new Error(
      safeTrim(payload?.message) || safeTrim(payload?.error) || `sms_provider_http_${response.status}`,
    );
  }

  return {
    provider: 'mobikob',
    balance: Number(payload?.balance || 0),
    rawResponse: payload,
  };
}
