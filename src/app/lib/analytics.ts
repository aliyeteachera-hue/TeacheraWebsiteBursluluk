export const COOKIE_CONSENT_KEY = 'teachera_cookie_consent';
export const CONSENT_UPDATED_EVENT = 'teachera:consent-updated';

const ATTRIBUTION_STORAGE_KEY = 'teachera_attribution';
const FUNNEL_CONTEXT_STORAGE_KEY = 'teachera_funnel_context';
const SEO_FUNNEL_NAME = 'konya_turkiye_seo_funnel';
const SEO_LANDING_PATHS = new Set([
  '/konya-ingilizce-kursu',
  '/konya-speaking-club',
  '/konya-online-dil-kursu',
  '/turkiye-online-dil-kursu',
]);
const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'msclkid',
] as const;

type ConsentRequirement = 'none' | 'analytics' | 'marketing';
type EventValue = string | number | boolean | null | undefined;

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

interface TrackEventOptions {
  requires?: ConsentRequirement;
}

interface FunnelContext {
  funnel_name?: string;
  funnel_landing_path?: string;
  funnel_last_cta_id?: string;
  funnel_last_destination?: string;
  funnel_updated_at?: string;
}

interface SeoLandingCtaOptions {
  ctaId: string;
  destination: string;
  position?: string;
}

const fallbackPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  personalization: false,
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    __teacheraTrackingInitialized?: boolean;
  }
}

function toConsentState(value: boolean): 'granted' | 'denied' {
  return value ? 'granted' : 'denied';
}

function parseConsent(raw: string | null): CookiePreferences {
  if (!raw) return fallbackPreferences;

  try {
    const parsed = JSON.parse(raw) as Partial<CookiePreferences>;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      personalization: Boolean(parsed.personalization),
    };
  } catch {
    return fallbackPreferences;
  }
}

function normalizeValue(value: EventValue): EventValue {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return value.trim();
  return value;
}

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

function readAttributionStorage(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function saveAttributionStorage(attribution: Record<string, string>) {
  try {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Ignore storage quota/private mode issues.
  }
}

function readFunnelContext(): FunnelContext {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.sessionStorage.getItem(FUNNEL_CONTEXT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as FunnelContext;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function saveFunnelContext(context: FunnelContext) {
  try {
    window.sessionStorage.setItem(FUNNEL_CONTEXT_STORAGE_KEY, JSON.stringify(context));
  } catch {
    // Ignore storage quota/private mode issues.
  }
}

function resolveSeoLandingPath(pathname: string): string | null {
  return SEO_LANDING_PATHS.has(pathname) ? pathname : null;
}

function getLinkText(element: Element) {
  const text = element.textContent?.replace(/\s+/g, ' ').trim();
  if (text) return text.slice(0, 120);
  return (element.getAttribute('aria-label') || 'link').slice(0, 120);
}

function hasConsent(requirement: ConsentRequirement): boolean {
  if (requirement === 'none') return true;
  const preferences = getConsentPreferences();
  return Boolean(preferences[requirement]);
}

export function getConsentPreferences(): CookiePreferences {
  if (typeof window === 'undefined') return fallbackPreferences;
  return parseConsent(window.localStorage.getItem(COOKIE_CONSENT_KEY));
}

export function applyConsentMode(preferences: CookiePreferences = getConsentPreferences()) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('consent', 'update', {
    ad_storage: toConsentState(preferences.marketing),
    ad_user_data: toConsentState(preferences.marketing),
    ad_personalization: toConsentState(preferences.personalization),
    analytics_storage: toConsentState(preferences.analytics),
    personalization_storage: toConsentState(preferences.personalization),
    functionality_storage: 'granted',
    security_storage: 'granted',
  });
}

export function notifyConsentUpdated(preferences: CookiePreferences) {
  if (typeof window === 'undefined') return;
  applyConsentMode(preferences);
  window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT, { detail: preferences }));
}

export function captureAttributionFromUrl(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const current = readAttributionStorage();
  const params = new URLSearchParams(window.location.search);
  let changed = false;

  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (!value) continue;
    if (current[key] === value) continue;
    current[key] = value;
    changed = true;
  }

  if (changed) {
    saveAttributionStorage(current);
  }

  return current;
}

export function setFunnelContext(patch: Partial<FunnelContext>) {
  if (typeof window === 'undefined') return;
  const current = readFunnelContext();
  const next: FunnelContext = {
    ...current,
    ...patch,
    funnel_updated_at: new Date().toISOString(),
  };
  saveFunnelContext(next);
}

export function trackSeoLandingCta({ ctaId, destination, position = 'unknown' }: SeoLandingCtaOptions) {
  if (typeof window === 'undefined') return false;
  const landingPath = resolveSeoLandingPath(window.location.pathname);

  if (landingPath) {
    setFunnelContext({
      funnel_name: SEO_FUNNEL_NAME,
      funnel_landing_path: landingPath,
      funnel_last_cta_id: ctaId,
      funnel_last_destination: destination,
    });
  }

  return trackEvent('seo_landing_cta_click', {
    funnel_name: SEO_FUNNEL_NAME,
    funnel_step: 'cta_click',
    landing_path: landingPath || window.location.pathname,
    cta_id: ctaId,
    cta_destination: destination,
    cta_position: position,
  });
}

export function trackEvent(eventName: string, params: Record<string, EventValue> = {}, options: TrackEventOptions = {}) {
  if (typeof window === 'undefined') return false;

  const requires = options.requires ?? 'analytics';
  if (!hasConsent(requires)) return false;

  const normalizedEventName = eventName.trim().toLowerCase();
  if (!normalizedEventName) return false;

  const context = {
    page_path: window.location.pathname,
    page_location: window.location.href,
    page_title: document.title,
    ...captureAttributionFromUrl(),
    ...readFunnelContext(),
  };

  const normalizedParams: Record<string, EventValue> = {};
  for (const [key, value] of Object.entries(params)) {
    normalizedParams[key] = normalizeValue(value);
  }

  const payload = {
    ...context,
    ...normalizedParams,
  };

  ensureDataLayer().push({
    event: normalizedEventName,
    ...payload,
  });

  if (typeof window.gtag === 'function') {
    window.gtag('event', normalizedEventName, payload);
  }

  return true;
}

export function trackPageView() {
  if (typeof window === 'undefined') return false;
  const landingPath = resolveSeoLandingPath(window.location.pathname);

  if (landingPath) {
    setFunnelContext({
      funnel_name: SEO_FUNNEL_NAME,
      funnel_landing_path: landingPath,
    });
    trackEvent('seo_landing_view', {
      funnel_name: SEO_FUNNEL_NAME,
      funnel_step: 'landing_view',
      landing_path: landingPath,
    });
  }

  return trackEvent('page_view');
}

export function initTracking() {
  if (typeof window === 'undefined' || window.__teacheraTrackingInitialized) {
    return () => {};
  }

  window.__teacheraTrackingInitialized = true;
  captureAttributionFromUrl();
  applyConsentMode();

  const onConsentUpdated = () => {
    applyConsentMode();
  };

  const onDocumentClick = (event: MouseEvent) => {
    const target = event.target as Element | null;
    const link = target?.closest('a');
    if (!link) return;

    const href = link.getAttribute('href')?.trim();
    if (!href) return;

    if (href.startsWith('tel:')) {
      trackEvent('phone_click', {
        phone_number: href.replace(/^tel:/, ''),
        link_text: getLinkText(link),
      });
      return;
    }

    if (href.startsWith('mailto:')) {
      trackEvent('mailto_click', {
        email: href.replace(/^mailto:/, ''),
        link_text: getLinkText(link),
      });
      return;
    }

    if (/wa\.me|whatsapp\.com/i.test(href)) {
      trackEvent('whatsapp_click', {
        source: 'anchor',
        href,
        link_text: getLinkText(link),
      });
    }
  };

  window.addEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated as EventListener);
  document.addEventListener('click', onDocumentClick, true);

  return () => {
    document.removeEventListener('click', onDocumentClick, true);
    window.removeEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated as EventListener);
    window.__teacheraTrackingInitialized = false;
  };
}
