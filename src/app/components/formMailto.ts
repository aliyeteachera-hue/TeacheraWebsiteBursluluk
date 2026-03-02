import { trackEvent } from '../lib/analytics';
import { isCaptchaEnabled, resolveCaptchaToken } from '../lib/captcha';

export interface MailDraftOptions {
  to?: string;
  subject: string;
  lines: string[];
}

export function applyRecipientToConfiguredEndpoint(configured: string, to: string) {
  const trimmed = configured.trim();
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

function resolveEndpoint(to: string) {
  if (typeof window === 'undefined') {
    return {
      endpoint: `https://formsubmit.co/ajax/${to}`,
      endpointDomain: 'server_runtime',
    };
  }

  const configuredEndpoint =
    import.meta.env.VITE_FORMS_ENDPOINT_TEMPLATE ||
    import.meta.env.VITE_FORMS_ENDPOINT ||
    '';
  const endpoint = configuredEndpoint
    ? applyRecipientToConfiguredEndpoint(configuredEndpoint, to)
    : `https://formsubmit.co/ajax/${to}`;
  const endpointDomain = (() => {
    try {
      return new URL(endpoint, window.location.origin).hostname;
    } catch {
      return 'invalid_endpoint';
    }
  })();

  return { endpoint, endpointDomain };
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
  return (import.meta.env.VITE_FORMS_PROXY_ENDPOINT || '/api/forms').trim();
}

async function submitViaDirectFallback(
  options: MailDraftOptions,
  subjectKey: string,
  fieldCount: number,
  reason: string,
): Promise<boolean> {
  const { to = 'data@teachera.com.tr', subject, lines } = options;
  const { endpoint, endpointDomain } = resolveEndpoint(to);
  const payload = buildLegacyPayload(subject, lines);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    if (!response.ok) {
      throw new Error(`dev_fallback_status_${response.status}`);
    }

    trackEvent('lead_form_submit_success', {
      form_subject: subjectKey,
      field_count: fieldCount,
      delivery_method: 'direct_fallback',
      endpoint_domain: endpointDomain,
      fallback_reason: reason,
    });
    return true;
  } catch {
    return false;
  }
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

  trackEvent('lead_form_submit_attempt', {
    form_subject: subjectKey,
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

    if (!response.ok) {
      let proxyReason = `proxy_status_${response.status}`;
      try {
        const payload = await response.clone().json() as { error?: string; reason?: string };
        const parts = [proxyReason, payload?.error, payload?.reason].filter(Boolean);
        proxyReason = parts.join('_');
      } catch {
        // Keep generic status message.
      }
      throw new Error(proxyReason);
    }

    trackEvent('lead_form_submit_success', {
      form_subject: subjectKey,
      field_count: fieldCount,
      delivery_method: 'proxy_fetch',
      captcha_enabled: captchaEnabled,
    });
    return true;
  } catch (error) {
    const fallbackReason =
      error instanceof Error && error.message ? error.message.slice(0, 120) : 'proxy_unknown_error';
    const fallbackSent = await submitViaDirectFallback(
      { to, subject, lines },
      subjectKey,
      fieldCount,
      fallbackReason,
    );
    if (fallbackSent) return true;

    trackEvent('lead_form_submit_failure', {
      form_subject: subjectKey,
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
      field_count: lines.filter(Boolean).length,
      delivery_method: 'proxy_beacon',
      captcha_enabled: false,
      error_message: queued ? undefined : 'navigator_send_beacon_rejected',
    });

    return queued;
  } catch (error) {
    trackEvent('lead_form_submit_failure', {
      form_subject: subjectKey,
      field_count: lines.filter(Boolean).length,
      delivery_method: 'proxy_beacon',
      captcha_enabled: false,
      error_message: error instanceof Error ? error.message.slice(0, 120) : 'unknown_error',
    });
    return false;
  }
}
