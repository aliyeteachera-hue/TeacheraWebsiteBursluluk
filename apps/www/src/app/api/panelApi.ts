type PanelFetchInit = RequestInit & {
  credentials?: RequestCredentials;
};

function trim(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function resolvePanelApiBase() {
  const base = trim(import.meta.env.VITE_PANEL_API_BASE);
  if (base) return base;
  if (import.meta.env.DEV && typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  throw new Error('missing_vite_panel_api_base');
}

export function resolvePanelEndpoint(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = resolvePanelApiBase();
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${normalizedBase}${normalizedPath}`;
}

export async function panelFetch(path: string, init: PanelFetchInit = {}) {
  const endpoint = resolvePanelEndpoint(path);
  const headers = new Headers(init.headers || {});
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const requestInit: RequestInit = {
    ...init,
    headers,
    credentials: init.credentials || 'include',
  };

  return fetch(endpoint, requestInit);
}

export function panelApiHref(path: string) {
  return resolvePanelEndpoint(path);
}
