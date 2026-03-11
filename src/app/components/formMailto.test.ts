import { describe, expect, it } from 'vitest';
import {
  applyRecipientToConfiguredEndpoint,
  buildFields,
  buildLegacyPayload,
  toSubjectKey,
} from './formMailto';

describe('formMailto helpers', () => {
  it('applies recipient to endpoint templates', () => {
    expect(applyRecipientToConfiguredEndpoint('https://formsubmit.co/ajax/{{to}}', 'data+team@teachera.com.tr')).toBe(
      'https://formsubmit.co/ajax/data%2Bteam%40teachera.com.tr',
    );
    expect(applyRecipientToConfiguredEndpoint('https://example.com/forms/{to}', 'a@b.com')).toBe(
      'https://example.com/forms/a%40b.com',
    );
    expect(applyRecipientToConfiguredEndpoint('https://example.com/forms/:to', 'a@b.com')).toBe(
      'https://example.com/forms/a%40b.com',
    );
  });

  it('auto-completes /ajax endpoints with recipient and falls back when empty', () => {
    expect(applyRecipientToConfiguredEndpoint('https://formsubmit.co/ajax', 'data@teachera.com.tr')).toBe(
      'https://formsubmit.co/ajax/data%40teachera.com.tr',
    );
    expect(applyRecipientToConfiguredEndpoint('', 'data@teachera.com.tr')).toBe(
      'https://formsubmit.co/ajax/data@teachera.com.tr',
    );
  });

  it('builds field map from key-value lines', () => {
    expect(
      buildFields([
        'Ad Soyad: Ada Lovelace',
        'Telefon: +90 532 123 45 67',
        'Sadece Mesaj',
        '',
      ]),
    ).toEqual({
      'Ad Soyad': 'Ada Lovelace',
      Telefon: '+90 532 123 45 67',
      field_3: 'Sadece Mesaj',
    });
  });

  it('builds legacy payload with subject, defaults and form source fallback', () => {
    expect(buildLegacyPayload('Demo Subject', ['Ad Soyad: Test User'])).toEqual({
      _subject: 'Demo Subject',
      _captcha: 'false',
      _template: 'table',
      form_source: 'server_runtime',
      'Ad Soyad': 'Test User',
    });
  });

  it('normalizes subject to analytics key and trims length', () => {
    expect(toSubjectKey('  Speak Up   Campus  Talebi ')).toBe('speak_up_campus_talebi');
    expect(toSubjectKey('A'.repeat(120)).length).toBe(80);
  });
});
