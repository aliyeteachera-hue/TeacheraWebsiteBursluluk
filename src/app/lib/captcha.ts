const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type TurnstileRenderOptions = {
  sitekey: string;
  size?: 'normal' | 'compact' | 'flexible';
  execution?: 'render' | 'execute';
  appearance?: 'always' | 'execute' | 'interaction-only';
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

function removeRenderedWidget(container: HTMLElement, widgetId: string | null) {
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
}

async function resolveHiddenToken(siteKey: string, action: string): Promise<string | null> {
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

    const finish = (token: string | null) => {
      if (settled) return;
      settled = true;
      window.setTimeout(() => removeRenderedWidget(container, widgetId), 0);
      resolve(token);
    };

    const timeoutId = window.setTimeout(() => finish(null), 8000);
    const wrapFinish = (token: string | null) => {
      window.clearTimeout(timeoutId);
      finish(token);
    };

    try {
      widgetId = window.turnstile!.render(container, {
        sitekey: siteKey,
        execution: 'execute',
        appearance: 'interaction-only',
        action,
        callback: (token) => wrapFinish(token),
        'error-callback': () => wrapFinish(null),
        'expired-callback': () => wrapFinish(null),
      });
      window.turnstile!.execute(widgetId);
    } catch {
      wrapFinish(null);
    }
  });
}

async function resolveInteractiveToken(siteKey: string, action: string): Promise<string | null> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0, 0, 0, 0.55)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '2147483647';

    const panel = document.createElement('div');
    panel.style.background = '#ffffff';
    panel.style.color = '#0f172a';
    panel.style.borderRadius = '14px';
    panel.style.padding = '14px';
    panel.style.minWidth = '320px';
    panel.style.maxWidth = '92vw';
    panel.style.boxShadow = '0 12px 36px rgba(0, 0, 0, 0.25)';
    panel.style.fontFamily = 'system-ui, -apple-system, sans-serif';

    const title = document.createElement('div');
    title.textContent = 'Güvenlik doğrulaması';
    title.style.fontSize = '15px';
    title.style.fontWeight = '600';
    title.style.marginBottom = '8px';

    const desc = document.createElement('div');
    desc.textContent = 'Lütfen aşağıdaki doğrulamayı tamamlayın.';
    desc.style.fontSize = '13px';
    desc.style.marginBottom = '10px';
    desc.style.color = '#334155';

    const widgetContainer = document.createElement('div');

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.justifyContent = 'flex-end';
    actions.style.marginTop = '10px';

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = 'İptal';
    cancel.style.border = '1px solid #cbd5e1';
    cancel.style.background = '#fff';
    cancel.style.borderRadius = '8px';
    cancel.style.padding = '6px 12px';
    cancel.style.cursor = 'pointer';

    actions.appendChild(cancel);
    panel.appendChild(title);
    panel.appendChild(desc);
    panel.appendChild(widgetContainer);
    panel.appendChild(actions);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    let settled = false;
    let widgetId: string | null = null;

    const finish = (token: string | null) => {
      if (settled) return;
      settled = true;
      removeRenderedWidget(widgetContainer, widgetId);
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      resolve(token);
    };

    const timeoutId = window.setTimeout(() => finish(null), 120000);
    const wrapFinish = (token: string | null) => {
      window.clearTimeout(timeoutId);
      finish(token);
    };

    cancel.addEventListener('click', () => wrapFinish(null), { once: true });

    try {
      widgetId = window.turnstile!.render(widgetContainer, {
        sitekey: siteKey,
        size: 'normal',
        appearance: 'always',
        action,
        callback: (token) => wrapFinish(token),
        'error-callback': () => wrapFinish(null),
        'expired-callback': () => wrapFinish(null),
      });
    } catch {
      wrapFinish(null);
    }
  });
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

  const hiddenToken = await resolveHiddenToken(siteKey, action);
  if (hiddenToken) return hiddenToken;
  return resolveInteractiveToken(siteKey, action);
}
