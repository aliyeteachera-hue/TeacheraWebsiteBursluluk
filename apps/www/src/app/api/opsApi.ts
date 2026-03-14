type OpsFetchInit = RequestInit & {
  credentials?: RequestCredentials;
};

function trim(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function resolveOpsApiBase() {
  const base = trim(import.meta.env.VITE_OPS_API_BASE);
  if (base) return base;
  if (import.meta.env.DEV && typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  throw new Error('missing_vite_ops_api_base');
}

export function resolveOpsEndpoint(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = resolveOpsApiBase();
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${normalizedBase}${normalizedPath}`;
}

export async function opsFetch(path: string, init: OpsFetchInit = {}) {
  const endpoint = resolveOpsEndpoint(path);
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

export function opsApiHref(path: string) {
  return resolveOpsEndpoint(path);
}
