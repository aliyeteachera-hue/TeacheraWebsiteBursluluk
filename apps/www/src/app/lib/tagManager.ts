const DEFAULT_GTM_ID = 'GTM-K9JW67GT';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    __teacheraGtmInitialized?: boolean;
  }
}

function toConsentState(value: boolean) {
  return value ? 'granted' : 'denied';
}

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

function initGtagShim() {
  if (typeof window.gtag === 'function') return;
  window.gtag = (...args: unknown[]) => {
    (ensureDataLayer() as unknown[]).push(args as unknown as Record<string, unknown>);
  };
}

function applyDefaultConsent() {
  if (typeof window.gtag !== 'function') return;
  window.gtag('consent', 'default', {
    ad_storage: toConsentState(false),
    ad_user_data: toConsentState(false),
    ad_personalization: toConsentState(false),
    analytics_storage: toConsentState(false),
    personalization_storage: toConsentState(false),
    functionality_storage: 'granted',
    security_storage: 'granted',
  });
}

export function initTagManager() {
  if (typeof window === 'undefined' || window.__teacheraGtmInitialized) return;

  const gtmId = (import.meta.env.VITE_GTM_ID || DEFAULT_GTM_ID || '').trim();
  if (!gtmId) return;

  const dataLayer = ensureDataLayer();
  initGtagShim();
  applyDefaultConsent();

  dataLayer.push({
    'gtm.start': Date.now(),
    event: 'gtm.js',
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
  script.setAttribute('data-teachera-gtm-id', gtmId);
  document.head.appendChild(script);

  window.__teacheraGtmInitialized = true;
}
