import { trackEvent } from '../lib/analytics';

interface MailDraftOptions {
  to?: string;
  subject: string;
  lines: string[];
}

export async function openMailDraft({ to = 'data@teachera.com.tr', subject, lines }: MailDraftOptions): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const endpoint = import.meta.env.VITE_FORMS_ENDPOINT || `https://formsubmit.co/ajax/${to}`;
  const endpointDomain = (() => {
    try {
      return new URL(endpoint, window.location.origin).hostname;
    } catch {
      return 'invalid_endpoint';
    }
  })();
  const cleanLines = lines.filter(Boolean);
  const subjectKey = subject.toLowerCase().replace(/\s+/g, '_').slice(0, 80);
  const fields = Object.fromEntries(
    cleanLines.map((line, index) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) return [`field_${index + 1}`, line];
      const key = line.slice(0, separatorIndex).trim() || `field_${index + 1}`;
      const value = line.slice(separatorIndex + 1).trim();
      return [key, value];
    }),
  );
  const payload = {
    _subject: subject,
    _captcha: 'false',
    _template: 'table',
    form_source: window.location.href,
    ...fields,
  };

  trackEvent('lead_form_submit_attempt', {
    form_subject: subjectKey,
    field_count: cleanLines.length,
    endpoint_domain: endpointDomain,
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
      field_count: cleanLines.length,
    });
    return true;
  } catch (error) {
    console.error('Form submission error:', error);
    trackEvent('lead_form_submit_failure', {
      form_subject: subjectKey,
      field_count: cleanLines.length,
      error_message: error instanceof Error ? error.message.slice(0, 120) : 'unknown_error',
    });
    return false;
  }
}
