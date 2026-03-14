/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COOKIE_CONSENT_KEY,
  derivePageType,
  getLeadSegment,
  trackEvent,
} from './analytics';

type MemoryStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

function createMemoryStorage(): MemoryStorage {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) || null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

function bootstrapDom(search = '') {
  const localStorage = createMemoryStorage();
  const sessionStorage = createMemoryStorage();
  const location = {
    pathname: '/fiyatlar',
    href: `https://teachera.com.tr/fiyatlar${search}`,
    search,
  };

  const globals = globalThis as any;

  globals.window = {
    location,
    localStorage,
    sessionStorage,
    dataLayer: [],
    gtag: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    setTimeout,
    clearTimeout,
  };
  globals.document = {
    title: 'Teachera Pricing',
    forms: [],
    visibilityState: 'visible',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    documentElement: {
      scrollHeight: 1000,
    },
  };
  return {
    localStorage,
    sessionStorage,
    location,
  };
}

describe('analytics', () => {
  beforeEach(() => {
    bootstrapDom('?utm_source=google&utm_medium=cpc&gclid=test123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    const globals = globalThis as any;
    delete globals.window;
    delete globals.document;
  });

  it('blocks analytics events when consent is missing', () => {
    const tracked = trackEvent('page_view', {});
    expect(tracked).toBe(false);
    const globals = globalThis as any;
    expect(globals.window?.dataLayer || []).toHaveLength(0);
  });

  it('tracks lead score and attribution context when consent is granted', () => {
    const globals = globalThis as any;
    globals.window?.localStorage.setItem(
      COOKIE_CONSENT_KEY,
      JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: true,
        personalization: true,
      }),
    );

    const first = trackEvent('lead_form_submit_success', {
      form_subject: 'test_subject',
      form_id: 'lead_test_subject',
    });
    const second = trackEvent('phone_click', {
      phone_number: '905551112233',
    });

    expect(first).toBe(true);
    expect(second).toBe(true);

    const [firstPayload, secondPayload] = globals.window?.dataLayer || [];
    expect(firstPayload.event).toBe('lead_form_submit_success');
    expect(firstPayload.utm_source).toBe('google');
    expect(firstPayload.last_touch_utm_medium).toBe('cpc');
    expect(firstPayload.gclid).toBe('test123');
    expect(firstPayload.lead_score).toBe(40);
    expect(firstPayload.lead_segment).toBe('warm');

    expect(secondPayload.event).toBe('phone_click');
    expect(secondPayload.lead_score).toBe(65);
    expect(secondPayload.lead_segment).toBe('hot');
  });

  it('derives stable page and lead segment classes', () => {
    expect(derivePageType('/')).toBe('home');
    expect(derivePageType('/egitimlerimiz/ingilizce/grup-programi')).toBe('program');
    expect(derivePageType('/konya-online-dil-kursu')).toBe('seo_landing');
    expect(derivePageType('/seviye-tespit-sinavi')).toBe('placement_exam');
    expect(getLeadSegment(10)).toBe('cold');
    expect(getLeadSegment(35)).toBe('warm');
    expect(getLeadSegment(80)).toBe('hot');
  });
});
