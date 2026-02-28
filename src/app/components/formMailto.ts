import { trackEvent } from '../lib/analytics';

export interface MailDraftOptions {
  to?: string;
  subject: string;
  lines: string[];
}

function applyRecipientToConfiguredEndpoint(configured: string, to: string) {
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

function buildPayload(subject: string, lines: string[]) {
  const cleanLines = lines.filter(Boolean);
  const fields = Object.fromEntries(
    cleanLines.map((line, index) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) return [`field_${index + 1}`, line];

      const key = line.slice(0, separatorIndex).trim() || `field_${index + 1}`;
      const value = line.slice(separatorIndex + 1).trim();
      return [key, value];
    }),
  );

  return {
    _subject: subject,
    _captcha: 'false',
    _template: 'table',
    form_source: typeof window === 'undefined' ? 'server_runtime' : window.location.href,
    ...fields,
  };
}

function toSubjectKey(subject: string) {
  return subject.toLowerCase().replace(/\s+/g, '_').slice(0, 80);
}

export async function openMailDraft({ to = 'data@teachera.com.tr', subject, lines }: MailDraftOptions): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const { endpoint, endpointDomain } = resolveEndpoint(to);
  const payload = buildPayload(subject, lines);
  const subjectKey = toSubjectKey(subject);

  trackEvent('lead_form_submit_attempt', {
    form_subject: subjectKey,
    field_count: lines.filter(Boolean).length,
    endpoint_domain: endpointDomain,
    delivery_method: 'fetch',
  });

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
      throw new Error(`Form submission failed with status ${response.status}`);
    }

    trackEvent('lead_form_submit_success', {
      form_subject: subjectKey,
      field_count: lines.filter(Boolean).length,
      delivery_method: 'fetch',
    });
    return true;
  } catch (error) {
    trackEvent('lead_form_submit_failure', {
      form_subject: subjectKey,
      field_count: lines.filter(Boolean).length,
      delivery_method: 'fetch',
      error_message: error instanceof Error ? error.message.slice(0, 120) : 'unknown_error',
    });
    return false;
  }
}

export function openMailDraftOnUnload({ to = 'data@teachera.com.tr', subject, lines }: MailDraftOptions): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (typeof navigator.sendBeacon !== 'function') return false;

  const { endpoint, endpointDomain } = resolveEndpoint(to);
  const payload = buildPayload(subject, lines);
  const subjectKey = toSubjectKey(subject);

  trackEvent('lead_form_submit_attempt', {
    form_subject: subjectKey,
    field_count: lines.filter(Boolean).length,
    endpoint_domain: endpointDomain,
    delivery_method: 'beacon',
  });

  try {
    const body = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const queued = navigator.sendBeacon(endpoint, body);

    trackEvent(queued ? 'lead_form_submit_success' : 'lead_form_submit_failure', {
      form_subject: subjectKey,
      field_count: lines.filter(Boolean).length,
      delivery_method: 'beacon',
      error_message: queued ? undefined : 'navigator_send_beacon_rejected',
    });

    return queued;
  } catch (error) {
    trackEvent('lead_form_submit_failure', {
      form_subject: subjectKey,
      field_count: lines.filter(Boolean).length,
      delivery_method: 'beacon',
      error_message: error instanceof Error ? error.message.slice(0, 120) : 'unknown_error',
    });
    return false;
  }
}
