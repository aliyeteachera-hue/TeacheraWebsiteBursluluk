import { trackEvent } from '../lib/analytics';
import { isCaptchaEnabled, resolveCaptchaToken } from '../lib/captcha';

export interface MailDraftOptions {
  to?: string;
  subject: string;
  lines: string[];
}

function normalizeConfiguredValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function applyRecipientToConfiguredEndpoint(configured: string, to: string) {
  const trimmed = normalizeConfiguredValue(configured);
  if (!trimmed) return `https://formsubmit.co/ajax/${to}`;

  if (trimmed.includes('{{to}}')) {
    return trimmed.replaceAll('{{to}}', encodeURIComponent(to));
  }

  if (trimmed.includes('{to}')) {
    return trimmed.replaceAll('{to}', encodeURIComponent(to));
  }

  if (trimmed.includes(':to')) {
    return trimmed.replaceAll(':to', encodeURIComponent(to));
  }

  try {
    const fallbackOrigin = typeof window === 'undefined' ? 'https://teachera.com.tr' : window.location.origin;
    const resolvedUrl = new URL(trimmed, fallbackOrigin);
    const normalizedPath = resolvedUrl.pathname.replace(/\/+$/, '');

    // Auto-complete common formsubmit style base endpoints.
    if (normalizedPath === '/ajax' || normalizedPath.endsWith('/ajax')) {
      resolvedUrl.pathname = `${normalizedPath}/${encodeURIComponent(to)}`;
    }

    return resolvedUrl.toString();
  } catch {
    return trimmed;
  }
}

export function buildFields(lines: string[]) {
  const cleanLines = lines.filter(Boolean);
  return Object.fromEntries(
    cleanLines.map((line, index) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) return [`field_${index + 1}`, line];

      const key = line.slice(0, separatorIndex).trim() || `field_${index + 1}`;
      const value = line.slice(separatorIndex + 1).trim();
      return [key, value];
    }),
  );
}

export function buildLegacyPayload(subject: string, lines: string[]) {
  const fields = buildFields(lines);

  return {
    _subject: subject,
    _captcha: 'false',
    _template: 'table',
    form_source: typeof window === 'undefined' ? 'server_runtime' : window.location.href,
    ...fields,
  };
}

export function toSubjectKey(subject: string) {
  return subject.trim().toLowerCase().replace(/\s+/g, '_').slice(0, 80);
}

function getProxyEndpoint() {
  return normalizeConfiguredValue(import.meta.env.VITE_FORMS_PROXY_ENDPOINT || '/api/forms');
}

export async function openMailDraft({ to = 'data@teachera.com.tr', subject, lines }: MailDraftOptions): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const fields = buildFields(lines);
  const proxyEndpoint = getProxyEndpoint();
  const endpointDomain = (() => {
    try {
      return new URL(proxyEndpoint, window.location.origin).hostname;
    } catch {
      return 'invalid_proxy_endpoint';
    }
  })();
  const fieldCount = lines.filter(Boolean).length;
  const subjectKey = toSubjectKey(subject);
  const captchaEnabled = isCaptchaEnabled();
  const captchaToken = await resolveCaptchaToken('lead_form');

  if (captchaEnabled && !captchaToken) {
    trackEvent('lead_form_submit_failure', {
      form_subject: subjectKey,
      form_id: `lead_${subjectKey}`,
      field_count: fieldCount,
      delivery_method: 'proxy_fetch',
      captcha_enabled: true,
      error_message: 'captcha_token_unavailable',
    });
    return false;
  }

  trackEvent('lead_form_submit_attempt', {
    form_subject: subjectKey,
    form_id: `lead_${subjectKey}`,
    field_count: fieldCount,
    endpoint_domain: endpointDomain,
    delivery_method: 'proxy_fetch',
    captcha_enabled: captchaEnabled,
  });

  try {
    const response = await fetch(proxyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        fields,
        formSource: window.location.href,
        captchaToken: captchaToken || null,
      }),
      keepalive: true,
    });

    let proxyPayload: {
      ok?: boolean;
      error?: string;
      reason?: string;
      delivery?: string;
      upstream_status?: number;
    } | null = null;
    try {
      proxyPayload = await response.clone().json() as {
        ok?: boolean;
        error?: string;
        reason?: string;
      };
    } catch {
      // Ignore non-JSON payload.
    }

    if (!response.ok || proxyPayload?.ok === false) {
      const proxyReason = [
        `proxy_status_${response.status}`,
        proxyPayload?.error,
        proxyPayload?.reason,
      ].filter(Boolean).join('_');
      throw new Error(proxyReason || `proxy_status_${response.status}`);
    }

    trackEvent('lead_form_submit_success', {
      form_subject: subjectKey,
      form_id: `lead_${subjectKey}`,
      field_count: fieldCount,
      delivery_method: 'proxy_fetch',
      captcha_enabled: captchaEnabled,
    });
    return true;
  } catch (error) {
    const fallbackReason =
      error instanceof Error && error.message ? error.message.slice(0, 120) : 'proxy_unknown_error';
    trackEvent('lead_form_submit_failure', {
      form_subject: subjectKey,
      form_id: `lead_${subjectKey}`,
      field_count: fieldCount,
      delivery_method: 'proxy_fetch',
      captcha_enabled: captchaEnabled,
      error_message: fallbackReason,
    });
    return false;
  }
}

export function openMailDraftOnUnload({ to = 'data@teachera.com.tr', subject, lines }: MailDraftOptions): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (typeof navigator.sendBeacon !== 'function') return false;
  if (isCaptchaEnabled()) {
    trackEvent('lead_form_submit_failure', {
      form_subject: toSubjectKey(subject),
      form_id: `lead_${toSubjectKey(subject)}`,
      field_count: lines.filter(Boolean).length,
      delivery_method: 'proxy_beacon',
      captcha_enabled: true,
      error_message: 'beacon_blocked_by_captcha_requirement',
    });
    return false;
  }

  const endpoint = getProxyEndpoint();
  const endpointDomain = (() => {
    try {
      return new URL(endpoint, window.location.origin).hostname;
    } catch {
      return 'invalid_proxy_endpoint';
    }
  })();
  const payload = {
    to,
    subject,
    fields: buildFields(lines),
    formSource: window.location.href,
    captchaToken: null,
  };
  const subjectKey = toSubjectKey(subject);

  trackEvent('lead_form_submit_attempt', {
    form_subject: subjectKey,
    form_id: `lead_${subjectKey}`,
    field_count: lines.filter(Boolean).length,
    endpoint_domain: endpointDomain,
    delivery_method: 'proxy_beacon',
    captcha_enabled: false,
  });

  try {
    const body = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const queued = navigator.sendBeacon(endpoint, body);

    trackEvent(queued ? 'lead_form_submit_success' : 'lead_form_submit_failure', {
      form_subject: subjectKey,
      form_id: `lead_${subjectKey}`,
      field_count: lines.filter(Boolean).length,
      delivery_method: 'proxy_beacon',
      captcha_enabled: false,
      error_message: queued ? undefined : 'navigator_send_beacon_rejected',
    });

    return queued;
  } catch (error) {
    trackEvent('lead_form_submit_failure', {
      form_subject: subjectKey,
      form_id: `lead_${subjectKey}`,
      field_count: lines.filter(Boolean).length,
      delivery_method: 'proxy_beacon',
      captcha_enabled: false,
      error_message: error instanceof Error ? error.message.slice(0, 120) : 'unknown_error',
    });
    return false;
  }
}
