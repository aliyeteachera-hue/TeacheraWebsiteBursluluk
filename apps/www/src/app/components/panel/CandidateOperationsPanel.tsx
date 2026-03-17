import { useEffect, useMemo, useState } from 'react';
import { panelFetch } from '../../api/panelApi';
import { canExportPanelData, canOperatePanelActions, isReadOnlyPanelRole } from './panelRoleAccess';

type CandidateRow = {
  candidate_id: string;
  application_no: string | null;
  student_full_name: string | null;
  grade: number | null;
  school_name: string | null;
  application_status: string | null;
  credentials_sms_status: string | null;
  first_login_at: string | null;
  exam_status: string | null;
  exam_started_at: string | null;
  exam_submitted_at: string | null;
  result_status: string | null;
  result_score: number | null;
  result_viewed_at: string | null;
  wa_result_status: string | null;
  last_error_code: string | null;
  operator_note: string | null;
  updated_at: string | null;
};

type CandidateSummary = {
  total_candidates?: number;
  exam_completed?: number;
  result_viewed?: number;
  wa_problematic?: number;
};

type CandidateListResponse = {
  items?: CandidateRow[];
  total?: number;
  page?: number;
  per_page?: number;
  summary?: CandidateSummary;
  message?: string;
  error?: string;
};

type CandidateActionResponse = {
  requested?: number;
  enqueued?: number;
  skipped?: number;
  processed?: number;
  message?: string;
  error?: string;
};

type CandidateFilters = {
  campaignCode: string;
  schoolQuery: string;
  grade: string;
  smsStatus: string;
  loginStatus: string;
  examStatus: string;
  resultViewedStatus: string;
  waStatus: string;
};

type CandidateFilterPreset = {
  id: string;
  name: string;
  query: string;
  filters: CandidateFilters;
  created_at: string;
  updated_at: string;
};

const defaultFilters: CandidateFilters = {
  campaignCode: '',
  schoolQuery: '',
  grade: '',
  smsStatus: '',
  loginStatus: '',
  examStatus: '',
  resultViewedStatus: '',
  waStatus: '',
};

const SMS_STATUS_OPTIONS = ['NOT_QUEUED', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'RETRYING', 'DLQ'] as const;
const EXAM_STATUS_OPTIONS = ['WAITING', 'OPEN', 'STARTED', 'SUBMITTED', 'TIMEOUT', 'ABANDONED'] as const;
const WA_STATUS_OPTIONS = ['NOT_QUEUED', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'RETRYING', 'DLQ'] as const;
const LOGIN_STATUS_OPTIONS = ['LOGGED_IN', 'NOT_LOGGED_IN'] as const;
const RESULT_VIEWED_STATUS_OPTIONS = ['VIEWED', 'NOT_VIEWED'] as const;
const GRADE_OPTIONS = Array.from({ length: 10 }, (_, index) => String(index + 2));
const CANDIDATE_PRESET_STORAGE_KEY = 'teachera.panel.candidates.filter-presets.v1';

const ERROR_CODE_DICTIONARY: Record<string, string> = {
  missing_provider_endpoint_SMS: 'SMS sağlayıcı endpoint ayarı eksik. Ops > Settings tarafında endpoint kontrol edilmeli.',
  missing_provider_endpoint_WHATSAPP: 'WhatsApp sağlayıcı endpoint ayarı eksik. Ops > Settings tarafında endpoint kontrol edilmeli.',
  simulated_provider_outage: 'Test amaçlı provider outage simülasyonu tetiklenmiş. Gerçek sağlayıcı arızası değildir.',
  invalid_worker_secret: 'Worker secret doğrulaması başarısız. Ops API secret senkronu kontrol edilmeli.',
  provider_rejected: 'Sağlayıcı isteği reddetti. Payload/kimlik doğrulama bilgilerini kontrol edin.',
  provider_timeout: 'Sağlayıcı zaman aşımı. Retry/backoff politikası devreye girecektir.',
  webhook_signature_invalid: 'Webhook imza doğrulaması başarısız. Provider webhook secret değerini doğrulayın.',
  captcha_failed: 'Turnstile doğrulaması başarısız. Kullanıcıya captcha yenilemesi önerin.',
  rate_limited: 'İstek hız limiti aşıldı. Kısa süre bekleyip tekrar deneyin.',
  db_unavailable: 'Veritabanı erişimi geçici olarak kesildi. Altyapı health metriklerini kontrol edin.',
};

function formatNumber(value: number | undefined) {
  if (!Number.isFinite(value)) return '-';
  return new Intl.NumberFormat('tr-TR').format(Number(value));
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '-';
  return date.toLocaleString('tr-TR');
}

function normalizeMessage(payload: { message?: string; error?: string } | null, fallback: string) {
  const message = String(payload?.message || '').trim();
  if (message) return message;
  const error = String(payload?.error || '').trim();
  if (error) return error;
  return fallback;
}

function readActionBoolean(value: boolean) {
  return value ? 'Evet' : 'Hayır';
}

function buildFiltersPayload(filters: CandidateFilters) {
  const payload: Record<string, unknown> = {};
  const campaignCode = filters.campaignCode.trim();
  if (campaignCode) payload.campaign_code = campaignCode;
  const schoolQuery = filters.schoolQuery.trim();
  if (schoolQuery) payload.school_query = schoolQuery;
  if (filters.grade) payload.grade = [filters.grade];
  if (filters.smsStatus) payload.credentials_sms_status = [filters.smsStatus];
  if (filters.loginStatus) payload.login_status = [filters.loginStatus];
  if (filters.examStatus) payload.exam_status = [filters.examStatus];
  if (filters.resultViewedStatus) payload.result_viewed_status = [filters.resultViewedStatus];
  if (filters.waStatus) payload.wa_result_status = [filters.waStatus];
  return payload;
}

function buildCandidatesPath(query: string, filters: CandidateFilters, page: number, perPage: number) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('per_page', String(perPage));
  params.set('sort_by', 'updated_at');
  params.set('sort_order', 'desc');
  const normalizedQuery = query.trim();
  if (normalizedQuery) {
    params.set('q', normalizedQuery);
  }
  const filtersPayload = buildFiltersPayload(filters);
  if (Object.keys(filtersPayload).length > 0) {
    params.set('filters', JSON.stringify(filtersPayload));
  }
  return `/api/panel/candidates?${params.toString()}`;
}

function buildExportPath(query: string, filters: CandidateFilters, format: 'csv' | 'xls') {
  const params = new URLSearchParams();
  const normalizedQuery = query.trim();
  if (normalizedQuery) {
    params.set('q', normalizedQuery);
  }
  const filtersPayload = buildFiltersPayload(filters);
  if (Object.keys(filtersPayload).length > 0) {
    params.set('filters', JSON.stringify(filtersPayload));
  }
  params.set('format', format);
  return `/api/panel/candidates/export?${params.toString()}`;
}

function readBooleanStates(row: CandidateRow) {
  const credentialsSmsStatus = String(row.credentials_sms_status || '').toUpperCase();
  const examStatus = String(row.exam_status || '').toUpperCase();
  const resultStatus = String(row.result_status || '').toUpperCase();
  const waStatus = String(row.wa_result_status || '').toUpperCase();

  const credentialsSmsSent = ['SENT', 'DELIVERED', 'READ'].includes(credentialsSmsStatus);
  const smsDelivered = ['DELIVERED', 'READ'].includes(credentialsSmsStatus);
  const loggedIn = Boolean(row.first_login_at);
  const examStarted = Boolean(row.exam_started_at) || ['STARTED', 'SUBMITTED', 'TIMEOUT', 'ABANDONED'].includes(examStatus);
  const examCompleted = ['SUBMITTED', 'TIMEOUT'].includes(examStatus);
  const resultPublished = ['PUBLISHED', 'VIEWED'].includes(resultStatus);
  const resultViewed = Boolean(row.result_viewed_at) || resultStatus === 'VIEWED';
  const waSent = ['QUEUED', 'SENT', 'DELIVERED', 'READ'].includes(waStatus);

  return {
    credentialsSmsSent,
    smsDelivered,
    loggedIn,
    examStarted,
    examCompleted,
    resultPublished,
    resultViewed,
    waSent,
  };
}

function readFileName(contentDisposition: string | null, fallback: string) {
  if (!contentDisposition) return fallback;
  const match = /filename="?([^"]+)"?/i.exec(contentDisposition);
  if (!match?.[1]) return fallback;
  return match[1];
}

function loadCandidateFilterPresets(): CandidateFilterPreset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CANDIDATE_PRESET_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        id: String(item.id || ''),
        name: String(item.name || '').trim(),
        query: String(item.query || ''),
        filters: {
          ...defaultFilters,
          ...(item.filters && typeof item.filters === 'object' ? item.filters : {}),
        },
        created_at: String(item.created_at || new Date().toISOString()),
        updated_at: String(item.updated_at || new Date().toISOString()),
      }))
      .filter((item) => item.id && item.name);
  } catch {
    return [];
  }
}

function saveCandidateFilterPresets(presets: CandidateFilterPreset[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CANDIDATE_PRESET_STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // ignore storage write errors
  }
}

function resolveErrorCodeHelp(code: string | null | undefined) {
  const normalized = String(code || '').trim();
  if (!normalized) return '';
  return ERROR_CODE_DICTIONARY[normalized] || 'Sözlükte tanım yok. Audit log ve provider response detayını kontrol edin.';
}

export default function CandidateOperationsPanel({
  active,
  seedQuery = '',
  seedCampaignCode = '',
  role,
}: {
  active: boolean;
  seedQuery?: string;
  seedCampaignCode?: string;
  role?: string;
}) {
  const normalizedSeedQuery = seedQuery.trim();
  const normalizedSeedCampaignCode = seedCampaignCode.trim();
  const [query, setQuery] = useState(normalizedSeedQuery);
  const [draftFilters, setDraftFilters] = useState<CandidateFilters>({
    ...defaultFilters,
    campaignCode: normalizedSeedCampaignCode,
  });
  const [appliedQuery, setAppliedQuery] = useState(normalizedSeedQuery);
  const [appliedFilters, setAppliedFilters] = useState<CandidateFilters>({
    ...defaultFilters,
    campaignCode: normalizedSeedCampaignCode,
  });
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [items, setItems] = useState<CandidateRow[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<CandidateSummary>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [operatorNoteDraft, setOperatorNoteDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isActionRunning, setIsActionRunning] = useState(false);
  const [isExportRunning, setIsExportRunning] = useState(false);
  const [presets, setPresets] = useState<CandidateFilterPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const canOperate = canOperatePanelActions(role);
  const canExport = canExportPanelData(role);
  const isReadOnly = isReadOnlyPanelRole(role);

  const pageCount = useMemo(() => {
    const value = Math.ceil(total / perPage);
    return value > 0 ? value : 1;
  }, [perPage, total]);

  const allSelectedOnPage = items.length > 0 && items.every((item) => selectedIds.includes(item.candidate_id));

  useEffect(() => {
    if (!active) return;
    const loaded = loadCandidateFilterPresets();
    setPresets(loaded);
    setSelectedPresetId((prev) => (prev && loaded.some((item) => item.id === prev) ? prev : ''));
    setQuery(normalizedSeedQuery);
    setAppliedQuery(normalizedSeedQuery);
    setDraftFilters((prev) => ({ ...prev, campaignCode: normalizedSeedCampaignCode }));
    setAppliedFilters((prev) => ({ ...prev, campaignCode: normalizedSeedCampaignCode }));
    setPage(1);
  }, [active, normalizedSeedCampaignCode, normalizedSeedQuery]);

  const handleSavePreset = () => {
    const suggested = `Preset ${new Date().toLocaleDateString('tr-TR')}`;
    const rawName = window.prompt('Preset adı girin', suggested);
    const name = String(rawName || '').trim();
    if (!name) {
      setErrorMessage('Preset kaydı iptal edildi: geçerli bir isim girilmedi.');
      return;
    }
    const now = new Date().toISOString();
    const existing = presets.find((item) => item.name.toLocaleLowerCase('tr-TR') === name.toLocaleLowerCase('tr-TR'));
    const nextPreset: CandidateFilterPreset = existing
      ? {
          ...existing,
          query: query.trim(),
          filters: { ...draftFilters },
          updated_at: now,
        }
      : {
          id: `preset_${Math.random().toString(36).slice(2, 10)}`,
          name,
          query: query.trim(),
          filters: { ...draftFilters },
          created_at: now,
          updated_at: now,
        };
    const next = [...presets.filter((item) => item.id !== nextPreset.id), nextPreset].sort((a, b) =>
      a.name.localeCompare(b.name, 'tr-TR'),
    );
    setPresets(next);
    setSelectedPresetId(nextPreset.id);
    saveCandidateFilterPresets(next);
    setMessage(`Preset kaydedildi: ${nextPreset.name}`);
    setErrorMessage('');
  };

  const handleApplyPreset = () => {
    const preset = presets.find((item) => item.id === selectedPresetId);
    if (!preset) {
      setErrorMessage('Uygulanacak bir preset seçin.');
      return;
    }
    setQuery(preset.query);
    setDraftFilters({ ...preset.filters });
    setAppliedQuery(preset.query);
    setAppliedFilters({ ...preset.filters });
    setPage(1);
    setMessage(`Preset uygulandı: ${preset.name}`);
    setErrorMessage('');
  };

  const handleDeletePreset = () => {
    const preset = presets.find((item) => item.id === selectedPresetId);
    if (!preset) {
      setErrorMessage('Silinecek bir preset seçin.');
      return;
    }
    const confirmed = window.confirm(`"${preset.name}" presetini silmek istiyor musunuz?`);
    if (!confirmed) return;
    const next = presets.filter((item) => item.id !== preset.id);
    setPresets(next);
    setSelectedPresetId('');
    saveCandidateFilterPresets(next);
    setMessage(`Preset silindi: ${preset.name}`);
    setErrorMessage('');
  };

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const loadCandidates = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await panelFetch(buildCandidatesPath(appliedQuery, appliedFilters, page, perPage), {
          method: 'GET',
        });
        const payload = (await response.json()) as CandidateListResponse;
        if (!response.ok) {
          throw new Error(normalizeMessage(payload, 'Aday operasyon listesi alınamadı.'));
        }
        if (cancelled) return;
        const nextItems = Array.isArray(payload.items) ? payload.items : [];
        setItems(nextItems);
        setTotal(Number(payload.total || 0));
        setSummary(payload.summary || {});
        setSelectedIds((prev) => prev.filter((id) => nextItems.some((item) => item.candidate_id === id)));
      } catch (error) {
        if (!cancelled) {
          setItems([]);
          setTotal(0);
          setSummary({});
          setSelectedIds([]);
          setErrorMessage(error instanceof Error ? error.message : 'Aday operasyon listesi alınamadı.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadCandidates();
    return () => {
      cancelled = true;
    };
  }, [active, appliedFilters, appliedQuery, page, perPage]);

  const runAction = async (
    action: 'sms_retry' | 'wa_send' | 'add_note',
    candidateIds: string[],
    extraBody: Record<string, unknown> = {},
  ) => {
    if (!canOperate) {
      setErrorMessage('Bu rol için işlem aksiyonları kapalıdır (READ_ONLY).');
      return;
    }
    if (candidateIds.length === 0 || isActionRunning) return;
    setIsActionRunning(true);
    setErrorMessage('');
    setMessage('');
    try {
      const response = await panelFetch('/api/panel/candidates/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          action,
          candidate_ids: candidateIds,
          ...extraBody,
        }),
      });
      const payload = (await response.json()) as CandidateActionResponse;
      if (!response.ok) {
        throw new Error(normalizeMessage(payload, 'Aksiyon başarısız.'));
      }

      if (action === 'add_note') {
        setMessage(`Operatör notu kaydedildi. İşlenen aday: ${formatNumber(payload.processed)}.`);
      } else {
        setMessage(
          `Aksiyon tamamlandı. Requested: ${formatNumber(payload.requested)} • Enqueued: ${formatNumber(payload.enqueued)} • Skipped: ${formatNumber(payload.skipped)}`,
        );
      }

      const refresh = await panelFetch(buildCandidatesPath(appliedQuery, appliedFilters, page, perPage), { method: 'GET' });
      if (refresh.ok) {
        const refreshedPayload = (await refresh.json()) as CandidateListResponse;
        const refreshedItems = Array.isArray(refreshedPayload.items) ? refreshedPayload.items : [];
        setItems(refreshedItems);
        setTotal(Number(refreshedPayload.total || 0));
        setSummary(refreshedPayload.summary || {});
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Aksiyon tamamlanamadı.');
    } finally {
      setIsActionRunning(false);
    }
  };

  const handleExport = async (format: 'csv' | 'xls') => {
    if (!canExport) {
      setErrorMessage('Bu rol için export izni bulunmuyor.');
      return;
    }
    if (isExportRunning) return;
    setIsExportRunning(true);
    setErrorMessage('');
    setMessage('');
    try {
      const response = await panelFetch(buildExportPath(appliedQuery, appliedFilters, format), {
        method: 'GET',
      });
      if (!response.ok) {
        let payload: { message?: string; error?: string } | null = null;
        try {
          payload = (await response.json()) as { message?: string; error?: string };
        } catch {
          payload = null;
        }
        throw new Error(normalizeMessage(payload, 'Export işlemi başarısız.'));
      }

      const blob = await response.blob();
      const fallbackName = `candidate-operations.${format}`;
      const fileName = readFileName(response.headers.get('content-disposition'), fallbackName);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage(`${format.toUpperCase()} export indirildi.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Export işlemi tamamlanamadı.');
    } finally {
      setIsExportRunning(false);
    }
  };

  return (
    <section className="rounded-[22px] border border-[#1A273A] bg-[#071021]/82 p-5 shadow-[0_14px_38px_rgba(0,0,0,0.28)] lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/54">Aday Operasyon Gridi</p>
          <h3 className="mt-2 text-[22px] font-semibold text-white">Bursluluk Durum Takibi</h3>
          <p className="mt-2 text-[13px] leading-[1.7] text-white/64">
            Başvuru, SMS, login, sınav, sonuç ve WhatsApp akışını aday bazında tek tabloda yönetin.
          </p>
          {appliedFilters.campaignCode ? (
            <p className="mt-2 inline-flex rounded-full border border-[#1A273A] bg-[#0A192B]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/70">
              Global Kampanya: {appliedFilters.campaignCode}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleExport('csv')}
            disabled={!canExport || isExportRunning}
            className="rounded-xl border border-[#1A273A] bg-[#0A192B]/90 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.11em] text-white/80 transition hover:border-[#2D4363] disabled:cursor-not-allowed disabled:opacity-60"
          >
            CSV Export
          </button>
          <button
            type="button"
            onClick={() => void handleExport('xls')}
            disabled={!canExport || isExportRunning}
            className="rounded-xl border border-[#1A273A] bg-[#0A192B]/90 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.11em] text-white/80 transition hover:border-[#2D4363] disabled:cursor-not-allowed disabled:opacity-60"
          >
            XLS Export
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#1A273A] bg-[#071021]/92 p-3">
          <p className="text-[12px] text-white/50">Toplam Aday</p>
          <p className="mt-1 text-[22px] font-semibold text-white">{formatNumber(summary.total_candidates ?? total)}</p>
        </div>
        <div className="rounded-xl border border-[#1A273A] bg-[#071021]/92 p-3">
          <p className="text-[12px] text-white/50">Sınav Tamamlayan</p>
          <p className="mt-1 text-[22px] font-semibold text-white">{formatNumber(summary.exam_completed)}</p>
        </div>
        <div className="rounded-xl border border-[#1A273A] bg-[#071021]/92 p-3">
          <p className="text-[12px] text-white/50">Sonuç Görüntüleyen</p>
          <p className="mt-1 text-[22px] font-semibold text-white">{formatNumber(summary.result_viewed)}</p>
        </div>
        <div className="rounded-xl border border-[#1A273A] bg-[#071021]/92 p-3">
          <p className="text-[12px] text-white/50">WA Problemli</p>
          <p className="mt-1 text-[22px] font-semibold text-white">{formatNumber(summary.wa_problematic)}</p>
        </div>
      </div>

      {isReadOnly ? (
        <p className="mt-3 rounded-lg border border-[#274063] bg-[#0A192B]/80 px-3 py-2 text-[12px] text-[#9FC7FF]">
          READ_ONLY modu: listeleme ve export açık, aksiyon butonları kapalı.
        </p>
      ) : null}

      <div className="sticky top-[70px] z-20 mt-4 space-y-3 rounded-2xl border border-[#1A273A] bg-[#050f1f]/95 p-3 backdrop-blur-sm">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
          <select
            value={selectedPresetId}
            onChange={(event) => setSelectedPresetId(event.target.value)}
            className="h-[42px] rounded-xl border border-[#1A273A] bg-[#030B18] px-3 text-[13px] text-white/90 outline-none focus:border-[#2D4363]"
          >
            <option value="">Kayıtlı filtre preset seçin</option>
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSavePreset}
            className="rounded-xl border border-[#1A273A] bg-[#0A192B]/90 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.11em] text-white/80 transition hover:border-[#2D4363]"
          >
            Preset Kaydet
          </button>
          <button
            type="button"
            onClick={handleApplyPreset}
            disabled={!selectedPresetId}
            className="rounded-xl border border-[#1A273A] bg-[#0A192B]/90 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.11em] text-white/80 transition hover:border-[#2D4363] disabled:cursor-not-allowed disabled:opacity-55"
          >
            Preset Uygula
          </button>
          <button
            type="button"
            onClick={handleDeletePreset}
            disabled={!selectedPresetId}
            className="rounded-xl border border-[#6F2824] bg-[#2B1214]/80 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.11em] text-[#FFB8B1] transition hover:border-[#8D3430] disabled:cursor-not-allowed disabled:opacity-55"
          >
            Preset Sil
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Aday / veli / telefon / başvuru no ara"
          className="h-[42px] rounded-xl border border-[#1A273A] bg-[#030B18] px-3 text-[13px] text-white/90 outline-none focus:border-[#2D4363]"
        />
        <input
          value={draftFilters.schoolQuery}
          onChange={(event) => setDraftFilters((prev) => ({ ...prev, schoolQuery: event.target.value }))}
          placeholder="Okul filtresi (metin)"
          className="h-[42px] rounded-xl border border-[#1A273A] bg-[#030B18] px-3 text-[13px] text-white/90 outline-none focus:border-[#2D4363]"
        />
        <select
          value={draftFilters.grade}
          onChange={(event) => setDraftFilters((prev) => ({ ...prev, grade: event.target.value }))}
          className="h-[42px] rounded-xl border border-[#1A273A] bg-[#030B18] px-3 text-[13px] text-white/90 outline-none focus:border-[#2D4363]"
        >
          <option value="">Sınıf (tümü)</option>
          {GRADE_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          value={draftFilters.smsStatus}
          onChange={(event) => setDraftFilters((prev) => ({ ...prev, smsStatus: event.target.value }))}
          className="h-[42px] rounded-xl border border-[#1A273A] bg-[#030B18] px-3 text-[13px] text-white/90 outline-none focus:border-[#2D4363]"
        >
          <option value="">SMS durumu (tümü)</option>
          {SMS_STATUS_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          value={draftFilters.loginStatus}
          onChange={(event) => setDraftFilters((prev) => ({ ...prev, loginStatus: event.target.value }))}
          className="h-[42px] rounded-xl border border-[#1A273A] bg-[#030B18] px-3 text-[13px] text-white/90 outline-none focus:border-[#2D4363]"
        >
          <option value="">Login durumu (tümü)</option>
          {LOGIN_STATUS_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          value={draftFilters.examStatus}
          onChange={(event) => setDraftFilters((prev) => ({ ...prev, examStatus: event.target.value }))}
          className="h-[42px] rounded-xl border border-[#1A273A] bg-[#030B18] px-3 text-[13px] text-white/90 outline-none focus:border-[#2D4363]"
        >
          <option value="">Sınav durumu (tümü)</option>
          {EXAM_STATUS_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          value={draftFilters.resultViewedStatus}
          onChange={(event) => setDraftFilters((prev) => ({ ...prev, resultViewedStatus: event.target.value }))}
          className="h-[42px] rounded-xl border border-[#1A273A] bg-[#030B18] px-3 text-[13px] text-white/90 outline-none focus:border-[#2D4363]"
        >
          <option value="">Sonuç görüntüleme (tümü)</option>
          {RESULT_VIEWED_STATUS_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select
          value={draftFilters.waStatus}
          onChange={(event) => setDraftFilters((prev) => ({ ...prev, waStatus: event.target.value }))}
          className="h-[42px] rounded-xl border border-[#1A273A] bg-[#030B18] px-3 text-[13px] text-white/90 outline-none focus:border-[#2D4363]"
        >
          <option value="">WhatsApp durumu (tümü)</option>
          {WA_STATUS_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        </div>

        <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setAppliedQuery(query.trim());
            setAppliedFilters({ ...draftFilters });
            setPage(1);
            setMessage('');
            setErrorMessage('');
          }}
          className="rounded-xl bg-[#D92E27] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.11em] text-white transition hover:bg-[#bf251f]"
        >
          Filtreleri Uygula
        </button>
        <button
          type="button"
          onClick={() => {
            setQuery('');
            setDraftFilters({ ...defaultFilters, campaignCode: normalizedSeedCampaignCode });
            setAppliedQuery('');
            setAppliedFilters({ ...defaultFilters, campaignCode: normalizedSeedCampaignCode });
            setPage(1);
            setMessage('');
            setErrorMessage('');
          }}
          className="rounded-xl border border-[#1A273A] bg-[#0A192B]/90 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.11em] text-white/80 transition hover:border-[#2D4363]"
        >
          Filtreleri Temizle
        </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void runAction('sms_retry', selectedIds)}
            disabled={!canOperate || isActionRunning || selectedIds.length === 0}
          className="rounded-xl border border-[#1A273A] bg-[#0A192B]/90 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/78 transition hover:border-[#2D4363] disabled:cursor-not-allowed disabled:opacity-55"
        >
          Manual SMS Resend ({selectedIds.length})
        </button>
          <button
            type="button"
            onClick={() => void runAction('wa_send', selectedIds)}
            disabled={!canOperate || isActionRunning || selectedIds.length === 0}
          className="rounded-xl border border-[#1A273A] bg-[#0A192B]/90 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/78 transition hover:border-[#2D4363] disabled:cursor-not-allowed disabled:opacity-55"
        >
          Toplu WhatsApp Gönder ({selectedIds.length})
        </button>
        <input
          value={operatorNoteDraft}
          onChange={(event) => setOperatorNoteDraft(event.target.value)}
          placeholder="Operatör notu (seçili adaylara)"
          disabled={!canOperate}
          className="h-[38px] min-w-[240px] flex-1 rounded-xl border border-[#1A273A] bg-[#030B18] px-3 text-[13px] text-white/90 outline-none focus:border-[#2D4363]"
        />
        <button
          type="button"
          onClick={() =>
            void runAction('add_note', selectedIds, {
              note: operatorNoteDraft,
            })
          }
          disabled={!canOperate || isActionRunning || selectedIds.length === 0 || operatorNoteDraft.trim().length === 0}
          className="rounded-xl border border-[#1A273A] bg-[#0A192B]/90 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/78 transition hover:border-[#2D4363] disabled:cursor-not-allowed disabled:opacity-55"
        >
          Operatör Notu Ekle
        </button>
      </div>

      {message ? (
        <p className="mt-3 rounded-lg border border-[#244B39] bg-[#0E261E] px-3 py-2 text-[12px] text-[#9FE4D0]">{message}</p>
      ) : null}
      {errorMessage ? (
        <p className="mt-3 rounded-lg border border-[#6F2824] bg-[#2B1214]/80 px-3 py-2 text-[12px] text-[#FFB8B1]">{errorMessage}</p>
      ) : null}

      {isLoading ? <p className="mt-3 text-[13px] text-white/65">Aday operasyon listesi yükleniyor...</p> : null}

      {!isLoading ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[1750px] text-left text-[12px] text-white/80">
            <thead>
              <tr className="border-b border-white/12 text-white/56">
                <th className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={allSelectedOnPage}
                      disabled={!canOperate}
                      onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedIds((prev) => Array.from(new Set([...prev, ...items.map((item) => item.candidate_id)])));
                      } else {
                        const pageIds = new Set(items.map((item) => item.candidate_id));
                        setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
                      }
                    }}
                  />
                </th>
                <th className="px-2 py-2">Aday</th>
                <th className="px-2 py-2">Okul / Sınıf</th>
                <th className="px-2 py-2">Başvuru Alındı</th>
                <th className="px-2 py-2">Credentials SMS Gönderildi</th>
                <th className="px-2 py-2">SMS Teslim</th>
                <th className="px-2 py-2">Login</th>
                <th className="px-2 py-2">Sınava Başladı</th>
                <th className="px-2 py-2">Sınavı Tamamladı</th>
                <th className="px-2 py-2">Sonuç Yayınlandı</th>
                <th className="px-2 py-2">Sonuç Görüntülendi</th>
                <th className="px-2 py-2">WA Sonucu Gönderildi</th>
                <th className="px-2 py-2">WA Delivery/Read</th>
                <th className="px-2 py-2">Son Hata Kodu</th>
                <th className="px-2 py-2">Son İşlem Zamanı</th>
                <th className="px-2 py-2">Operatör Notu</th>
                <th className="px-2 py-2">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={17} className="px-2 py-6 text-center text-white/55">
                    Filtreye uygun kayıt bulunamadı.
                  </td>
                </tr>
              ) : null}
              {items.map((item) => {
                const booleans = readBooleanStates(item);
                return (
                  <tr key={item.candidate_id} className="border-b border-white/6 align-top">
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.candidate_id)}
                        disabled={!canOperate}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setSelectedIds((prev) => Array.from(new Set([...prev, item.candidate_id])));
                          } else {
                            setSelectedIds((prev) => prev.filter((id) => id !== item.candidate_id));
                          }
                        }}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <p className="font-semibold text-white">{item.student_full_name || '-'}</p>
                      <p className="text-white/55">{item.application_no || item.candidate_id.slice(0, 8)}</p>
                    </td>
                    <td className="px-2 py-2">
                      <p>{item.school_name || '-'}</p>
                      <p className="text-white/55">Sınıf: {item.grade ? String(item.grade) : '-'}</p>
                    </td>
                    <td className="px-2 py-2">{readActionBoolean(Boolean(item.application_status))}</td>
                    <td className="px-2 py-2">{readActionBoolean(booleans.credentialsSmsSent)}</td>
                    <td className="px-2 py-2">{readActionBoolean(booleans.smsDelivered)}</td>
                    <td className="px-2 py-2">{readActionBoolean(booleans.loggedIn)}</td>
                    <td className="px-2 py-2">{readActionBoolean(booleans.examStarted)}</td>
                    <td className="px-2 py-2">{readActionBoolean(booleans.examCompleted)}</td>
                    <td className="px-2 py-2">{readActionBoolean(booleans.resultPublished)}</td>
                    <td className="px-2 py-2">{readActionBoolean(booleans.resultViewed)}</td>
                    <td className="px-2 py-2">{readActionBoolean(booleans.waSent)}</td>
                    <td className="px-2 py-2">{item.wa_result_status || '-'}</td>
                    <td className="px-2 py-2">
                      {item.last_error_code ? (
                        <span
                          className="cursor-help rounded border border-[#1A273A] bg-[#0A192B]/90 px-2 py-1 text-[11px] text-white/85"
                          title={resolveErrorCodeHelp(item.last_error_code)}
                        >
                          {item.last_error_code}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-2 py-2">{formatDate(item.updated_at)}</td>
                    <td className="max-w-[280px] px-2 py-2">
                      <p className="line-clamp-2">{item.operator_note || '-'}</p>
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => void runAction('wa_send', [item.candidate_id])}
                        disabled={!canOperate || isActionRunning}
                        className="rounded-lg border border-[#1A273A] bg-[#0A192B]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/78 transition hover:border-[#2D4363] disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        Tekil WA
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-white/58">
          Toplam {formatNumber(total)} kayıt • Sayfa {page} / {pageCount}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1 || isLoading}
            className="rounded-lg border border-[#1A273A] bg-[#0A192B]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/78 transition hover:border-[#2D4363] disabled:cursor-not-allowed disabled:opacity-55"
          >
            Önceki
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
            disabled={page >= pageCount || isLoading}
            className="rounded-lg border border-[#1A273A] bg-[#0A192B]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/78 transition hover:border-[#2D4363] disabled:cursor-not-allowed disabled:opacity-55"
          >
            Sonraki
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-[#1A273A] bg-[#0A192B]/70 px-3 py-2 text-[11px] text-white/62">
        Hata kodu sözlüğü: <span className="text-white/78">Son Hata Kodu</span> kolonunda kodun üzerine gelerek açıklamayı görebilirsiniz.
      </div>
    </section>
  );
}
