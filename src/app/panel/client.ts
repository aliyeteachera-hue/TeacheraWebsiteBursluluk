import type {
  PanelActionResult,
  PanelCandidateRow,
  PanelDashboardPayload,
  PanelDlqRow,
  PanelListResponse,
  PanelNotificationRow,
  PanelRole,
  PanelSettingsPayload,
  PanelUnviewedRow,
} from './types';

export interface PanelClientContext {
  adminKey?: string;
  role?: PanelRole;
}

type ApiResponse<T> = {
  ok: boolean;
  error?: string;
  message?: string;
} & T;

type QueryValue = string | number | boolean | null | undefined | Record<string, unknown>;

function buildHeaders(context: PanelClientContext, contentType = '') {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  if (context.adminKey?.trim()) {
    headers['X-Admin-Key'] = context.adminKey.trim();
  }

  if (context.role?.trim()) {
    headers['X-Admin-Role'] = context.role.trim();
  }

  return headers;
}

function toQueryString(params: Record<string, QueryValue>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') return;

    if (key === 'filters' && typeof value === 'object') {
      query.set('filters', JSON.stringify(value));
      return;
    }

    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

async function parseJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    if (!response.ok) {
      throw new Error(fallbackMessage);
    }
    throw new Error('Sunucudan beklenen yanit alinamadi.');
  }

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.message || payload?.error || fallbackMessage);
  }

  return payload as T;
}

async function getJson<T>(
  path: string,
  context: PanelClientContext,
  params: Record<string, QueryValue> = {},
  fallbackMessage = 'Panel istegi basarisiz.',
) {
  const response = await fetch(`${path}${toQueryString(params)}`, {
    method: 'GET',
    headers: buildHeaders(context),
  });

  return parseJson<T>(response, fallbackMessage);
}

async function postJson<T>(
  path: string,
  context: PanelClientContext,
  body: Record<string, unknown>,
  fallbackMessage = 'Panel aksiyonu basarisiz.',
) {
  const response = await fetch(path, {
    method: 'POST',
    headers: buildHeaders(context, 'application/json'),
    body: JSON.stringify(body),
  });

  return parseJson<T>(response, fallbackMessage);
}

async function putJson<T>(
  path: string,
  context: PanelClientContext,
  body: Record<string, unknown>,
  fallbackMessage = 'Panel ayari guncellenemedi.',
) {
  const response = await fetch(path, {
    method: 'PUT',
    headers: buildHeaders(context, 'application/json'),
    body: JSON.stringify(body),
  });

  return parseJson<T>(response, fallbackMessage);
}

export function getPanelDashboard(context: PanelClientContext) {
  return getJson<PanelDashboardPayload>('/api/panel/dashboard', context, {}, 'Dashboard verisi yuklenemedi.');
}

export function getPanelCandidates(
  context: PanelClientContext,
  params: {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    q?: string;
    filters?: Record<string, unknown>;
  } = {},
) {
  return getJson<PanelListResponse<PanelCandidateRow>>(
    '/api/panel/candidates',
    context,
    params,
    'Aday operasyon listesi yuklenemedi.',
  );
}

export async function exportPanelCandidatesCsv(
  context: PanelClientContext,
  params: {
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    q?: string;
    filters?: Record<string, unknown>;
  } = {},
) {
  const response = await fetch(`/api/panel/candidates/export${toQueryString(params)}`, {
    method: 'GET',
    headers: buildHeaders(context),
  });

  if (!response.ok) {
    throw new Error('CSV export basarisiz.');
  }

  return response.text();
}

export function runPanelCandidatesAction(
  context: PanelClientContext,
  body: {
    action: 'sms_retry' | 'wa_send' | 'add_note';
    candidate_ids: string[];
    note?: string;
  },
) {
  return postJson<PanelActionResult>('/api/panel/candidates/actions', context, body, 'Aday aksiyonu basarisiz.');
}

export function getPanelNotifications(
  context: PanelClientContext,
  params: {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    q?: string;
    filters?: Record<string, unknown>;
  } = {},
) {
  return getJson<PanelListResponse<PanelNotificationRow>>(
    '/api/panel/notifications',
    context,
    params,
    'Bildirim listesi yuklenemedi.',
  );
}

export function runPanelNotificationsAction(
  context: PanelClientContext,
  body: {
    action: 'retry' | 'cancel' | 'requeue';
    job_ids: string[];
  },
) {
  return postJson<PanelActionResult>('/api/panel/notifications/actions', context, body, 'Bildirim aksiyonu basarisiz.');
}

export function getPanelUnviewedResults(
  context: PanelClientContext,
  params: {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    q?: string;
    filters?: Record<string, unknown>;
  } = {},
) {
  return getJson<PanelListResponse<PanelUnviewedRow>>(
    '/api/panel/unviewed-results',
    context,
    params,
    'Sonuc gormeyenler listesi yuklenemedi.',
  );
}

export function runPanelUnviewedAction(
  context: PanelClientContext,
  body: {
    action: 'send_wa';
    candidate_ids: string[];
  },
) {
  return postJson<PanelActionResult>(
    '/api/panel/unviewed-results/actions',
    context,
    body,
    'Sonuc gormeyenler aksiyonu basarisiz.',
  );
}

export function getPanelDlq(
  context: PanelClientContext,
  params: {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    q?: string;
    filters?: Record<string, unknown>;
  } = {},
) {
  return getJson<PanelListResponse<PanelDlqRow>>('/api/panel/dlq', context, params, 'DLQ listesi yuklenemedi.');
}

export function runPanelDlqAction(
  context: PanelClientContext,
  body: {
    action: 'retry' | 'assign' | 'close';
    job_ids: string[];
    assigned_to?: string;
    root_cause_note?: string;
  },
) {
  return postJson<PanelActionResult>('/api/panel/dlq/actions', context, body, 'DLQ aksiyonu basarisiz.');
}

export function getPanelSettings(context: PanelClientContext) {
  return getJson<PanelSettingsPayload>('/api/panel/settings', context, {}, 'Panel ayarlari yuklenemedi.');
}

export function updatePanelSettings(context: PanelClientContext, body: Record<string, unknown>) {
  return putJson<PanelSettingsPayload>('/api/panel/settings', context, body, 'Panel ayarlari guncellenemedi.');
}
