const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type TurnstileRenderOptions = {
  sitekey: string;
  size?: 'normal' | 'compact' | 'invisible';
  action?: string;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  execute: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptLoadPromise: Promise<boolean> | null = null;

function getTurnstileSiteKey() {
  return (import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim();
}

function loadTurnstileScript(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve(false);
  }

  if (window.turnstile) {
    return Promise.resolve(true);
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[data-turnstile-script="1"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.turnstile)), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.dataset.turnstileScript = '1';
    script.onload = () => resolve(Boolean(window.turnstile));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export function isCaptchaEnabled() {
  return Boolean(getTurnstileSiteKey());
}

export async function resolveCaptchaToken(action = 'lead_form'): Promise<string | null> {
  const siteKey = getTurnstileSiteKey();
  if (!siteKey || typeof window === 'undefined' || typeof document === 'undefined') {
    return null;
  }

  const loaded = await loadTurnstileScript();
  if (!loaded || !window.turnstile) {
    return null;
  }

  return new Promise((resolve) => {
    const container = document.createElement('div');
    container.setAttribute('aria-hidden', 'true');
    container.style.position = 'fixed';
    container.style.width = '1px';
    container.style.height = '1px';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    let settled = false;
    let widgetId: string | null = null;

    const cleanup = () => {
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // Ignore cleanup errors.
        }
      }
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };

    const finish = (token: string | null) => {
      if (settled) return;
      settled = true;
      window.setTimeout(cleanup, 0);
      resolve(token);
    };

    const timeoutId = window.setTimeout(() => finish(null), 10000);
    const wrapFinish = (token: string | null) => {
      window.clearTimeout(timeoutId);
      finish(token);
    };

    try {
      widgetId = window.turnstile.render(container, {
        sitekey: siteKey,
        size: 'invisible',
        action,
        callback: (token) => wrapFinish(token),
        'error-callback': () => wrapFinish(null),
        'expired-callback': () => wrapFinish(null),
      });
      window.turnstile.execute(widgetId);
    } catch {
      wrapFinish(null);
    }
  });
}
