import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { panelApiHref, panelFetch } from '../../api/panelApi';

type PanelView = 'inbox' | 'operations' | 'tasks' | 'settings';
type PanelOpsFocus = 'candidates' | 'notifications' | 'dlq' | 'unviewed' | null;

type PanelIdentity = {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  mfa_verified: boolean;
  session_id: string;
};

type DashboardPayload = {
  summary?: {
    total_applications?: number;
    sms_success_rate?: number;
    first_login_rate?: number;
    exam_completion_rate?: number;
    result_view_rate?: number;
    wa_delivery_rate?: number;
  };
  operations?: {
    open_dlq_jobs?: number;
    active_dlq_jobs?: number;
    last_30m_failures?: number;
  };
};

type SettingsPayload = {
  items?: Array<{
    key: string;
    value: unknown;
  }>;
};

type UnviewedResultItem = {
  candidate_id: string;
  student_full_name: string;
  school_name: string;
  grade: number | null;
  result_published_at: string | null;
  last_login_at: string | null;
  wa_result_status: string;
  wa_last_sent_at: string | null;
};

type UnviewedResultsPayload = {
  items?: UnviewedResultItem[];
  total?: number;
  summary?: {
    total_unviewed?: number;
    wa_problematic?: number;
    wa_reached?: number;
  };
};

const VIEW_ITEMS: Array<{ id: PanelView; title: string; subtitle: string }> = [
  {
    id: 'inbox',
    title: 'CRM / Mobikob Inbox',
    subtitle: 'Danışman mesajları, geri dönüş talepleri ve kanal bildirimleri',
  },
  {
    id: 'operations',
    title: 'Bursluluk Operasyonu',
    subtitle: 'Sınav başvuru, tamamlama, sonuç ve bildirim KPI ekranı',
  },
  {
    id: 'tasks',
    title: 'Görevler',
    subtitle: 'Günlük operasyon takip listesi ve manuel aksiyon kuyruğu',
  },
  {
    id: 'settings',
    title: 'Ayarlar',
    subtitle: 'Panel konfigürasyonu, rol erişimi ve operasyon anahtarları',
  },
];

const PANEL_VIEW_ROUTE_MAP: Record<PanelView, string> = {
  inbox: '/panel/inbox',
  operations: '/panel/operations',
  tasks: '/panel/tasks',
  settings: '/panel/settings',
};

const defaultTasks = [
  'DLQ kuyruğunu kontrol et ve gerekli retry/assign işlemlerini tamamla.',
  'Sonuç görüntülemeyen adaylara WhatsApp planını gözden geçir.',
  'Yeni kampanya ayarlarının app_settings üzerinde aktif olduğunu doğrula.',
  'Panel audit log üzerinde kritik hata kodlarını tarayıp not al.',
] as const;

function readView(raw: string | null): PanelView {
  const normalized = String(raw || '').toLowerCase();
  if (normalized === 'inbox' || normalized === 'operations' || normalized === 'tasks' || normalized === 'settings') {
    return normalized;
  }
  return 'inbox';
}

function readOpsFocus(raw: string | null): PanelOpsFocus {
  const normalized = String(raw || '').toLowerCase();
  if (normalized === 'candidates' || normalized === 'notifications' || normalized === 'dlq' || normalized === 'unviewed') {
    return normalized;
  }
  return null;
}

async function readJsonSafe<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function formatPercent(value: number | undefined) {
  if (!Number.isFinite(value)) return '-';
  return `${Number(value).toFixed(2)}%`;
}

function formatNumber(value: number | undefined) {
  if (!Number.isFinite(value)) return '-';
  return new Intl.NumberFormat('tr-TR').format(Number(value));
}

const sectionClassName =
  'rounded-[22px] border border-[#1A273A] bg-[#071021]/82 p-5 shadow-[0_14px_38px_rgba(0,0,0,0.28)]';

export default function PanelDashboardPage() {
  const [searchParams] = useSearchParams();
  const [activeView, setActiveView] = useState<PanelView>(() => readView(searchParams.get('view')));
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [identity, setIdentity] = useState<PanelIdentity | null>(null);
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [settingsCount, setSettingsCount] = useState(0);
  const [unviewedResults, setUnviewedResults] = useState<UnviewedResultsPayload | null>(null);
  const [unviewedLoading, setUnviewedLoading] = useState(false);
  const [selectedUnviewedCandidateIds, setSelectedUnviewedCandidateIds] = useState<string[]>([]);
  const [isUnviewedActionRunning, setIsUnviewedActionRunning] = useState(false);
  const [opsMessage, setOpsMessage] = useState('');
  const activeOpsFocus = useMemo(() => readOpsFocus(searchParams.get('focus')), [searchParams]);

  useEffect(() => {
    const next = readView(searchParams.get('view'));
    setActiveView(next);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const meResponse = await panelFetch('/api/panel/auth/me', {
          method: 'GET',
        });

        if (meResponse.status === 401 || meResponse.status === 403) {
          window.location.assign('/panel/login?next=/panel/dashboard');
          return;
        }

        const mePayload = await readJsonSafe<{ identity?: PanelIdentity }>(meResponse);
        if (!meResponse.ok || !mePayload?.identity) {
          throw new Error('Panel oturumu doğrulanamadı.');
        }

        const [dashboardResponse, settingsResponse] = await Promise.all([
          panelFetch('/api/panel/dashboard', {
            method: 'GET',
          }),
          panelFetch('/api/panel/settings', {
            method: 'GET',
          }),
        ]);

        const dashboardPayload = await readJsonSafe<DashboardPayload>(dashboardResponse);
        const settingsPayload = await readJsonSafe<SettingsPayload>(settingsResponse);

        if (cancelled) return;
        setIdentity(mePayload.identity);
        setDashboard(dashboardResponse.ok ? dashboardPayload : null);
        setSettingsCount(Array.isArray(settingsPayload?.items) ? settingsPayload.items.length : 0);

        if (!dashboardResponse.ok) {
          setErrorMessage('Panel dashboard verileri şu anda yüklenemiyor. Oturum doğrulandı, ekran kısmi modda açıldı.');
        }
      } catch {
        if (cancelled) return;
        setErrorMessage('Panel verileri alınamadı. Lütfen tekrar deneyin.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeView !== 'operations' || activeOpsFocus !== 'unviewed') return;

    let cancelled = false;
    const loadUnviewedResults = async () => {
      setUnviewedLoading(true);
      setOpsMessage('');

      try {
        const response = await panelFetch('/api/panel/unviewed-results?per_page=20', {
          method: 'GET',
        });
        const payload = await readJsonSafe<UnviewedResultsPayload>(response);
        if (!response.ok || !payload) {
          throw new Error('Sonuç görmeyen aday listesi alınamadı.');
        }
        if (cancelled) return;
        const items = Array.isArray(payload.items) ? payload.items : [];
        setUnviewedResults(payload);
        setSelectedUnviewedCandidateIds(items.map((item) => item.candidate_id).filter(Boolean));
      } catch {
        if (cancelled) return;
        setUnviewedResults(null);
        setSelectedUnviewedCandidateIds([]);
        setOpsMessage('Sonuç görmeyen aday listesi şu anda yüklenemiyor.');
      } finally {
        if (!cancelled) {
          setUnviewedLoading(false);
        }
      }
    };

    void loadUnviewedResults();
    return () => {
      cancelled = true;
    };
  }, [activeOpsFocus, activeView]);

  const viewMeta = useMemo(
    () => VIEW_ITEMS.find((item) => item.id === activeView) || VIEW_ITEMS[0],
    [activeView],
  );

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await panelFetch('/api/panel/auth/logout', {
        method: 'POST',
      });
    } finally {
      window.location.assign('/panel/login');
    }
  };

  const handleSendUnviewedWhatsapp = async () => {
    if (isUnviewedActionRunning || selectedUnviewedCandidateIds.length === 0) return;
    setIsUnviewedActionRunning(true);
    setOpsMessage('');

    try {
      const response = await panelFetch('/api/panel/unviewed-results/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_whatsapp',
          candidate_ids: selectedUnviewedCandidateIds,
          template_code: 'WA_RESULT',
        }),
      });

      const payload = await readJsonSafe<{ enqueued?: number; requested?: number; message?: string }>(response);
      if (!response.ok) {
        throw new Error(payload?.message || 'WhatsApp kuyruğu tetiklenemedi.');
      }

      setOpsMessage(
        `WhatsApp kuyruğu tetiklendi. Enqueued: ${formatNumber(payload?.enqueued)} / Requested: ${formatNumber(payload?.requested)}`,
      );

      const reload = await panelFetch('/api/panel/unviewed-results?per_page=20', { method: 'GET' });
      const reloadPayload = await readJsonSafe<UnviewedResultsPayload>(reload);
      if (reload.ok && reloadPayload) {
        const items = Array.isArray(reloadPayload.items) ? reloadPayload.items : [];
        setUnviewedResults(reloadPayload);
        setSelectedUnviewedCandidateIds(items.map((item) => item.candidate_id).filter(Boolean));
      }
    } catch (error) {
      setOpsMessage(error instanceof Error ? error.message : 'WhatsApp işlemi başarısız.');
    } finally {
      setIsUnviewedActionRunning(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,rgba(110,17,30,0.38),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(22,75,90,0.24),transparent_34%),linear-gradient(160deg,#00020B_0%,#000918_45%,#02122A_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_0.7px,transparent_0.7px)] [background-size:13px_13px] opacity-[0.1]" />

      <div className="relative mx-auto w-full max-w-[1200px] space-y-5">
        <header className="rounded-[24px] border border-[#1A2535] bg-[#0A1323]/82 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/52">Teachera Panel</p>
              <h1 className="mt-2 text-[32px] font-semibold leading-[1.15] text-white sm:text-[38px]">Tek Operasyon Yüzeyi</h1>
              <p className="mt-2 text-[14px] text-white/58 sm:text-[16px]">
                {viewMeta.title} • {viewMeta.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-[#1A273A] bg-[#071021]/82 px-4 py-3 text-right">
                <p className="text-[12px] uppercase tracking-[0.14em] text-white/48">Oturum</p>
                <p className="text-[14px] font-semibold text-white/85">{identity?.full_name || '-'}</p>
                <p className="text-[12px] text-white/55">{identity?.role || '-'}</p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="h-[46px] rounded-2xl border border-[#80312C] bg-[#561D1A] px-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#FFC9C5] transition hover:bg-[#6B2420] disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isSigningOut ? 'Çıkış...' : 'Çıkış'}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {VIEW_ITEMS.map((item) => {
              const active = item.id === activeView;
              return (
                <Link
                  key={item.id}
                  to={PANEL_VIEW_ROUTE_MAP[item.id]}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? 'border-[#D34840] bg-[#4B1817] text-white'
                      : 'border-[#1A273A] bg-[#071021]/82 text-white/72 hover:border-[#2D4363]'
                  }`}
                >
                  <p className="text-[13px] font-semibold uppercase tracking-[0.12em]">{item.title}</p>
                  <p className="mt-1 text-[12px] leading-[1.5] text-white/55">{item.subtitle}</p>
                </Link>
              );
            })}
          </div>
        </header>

        {errorMessage ? (
          <p className="rounded-xl border border-[#6F2824] bg-[#2B1214]/80 px-4 py-3 text-[14px] text-[#FFB8B1]">
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <div className={`${sectionClassName} text-[15px] text-white/72`}>Panel verileri yükleniyor...</div>
        ) : null}

        {!isLoading && activeView === 'inbox' ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className={sectionClassName}>
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/54">CRM / Mobikob Inbox</p>
              <h2 className="mt-2 text-[24px] font-semibold text-white">İletişim Kuyruğu</h2>
              <p className="mt-2 text-[14px] leading-[1.7] text-white/62">
                Danışmanlara atanmış görüşmeler, WhatsApp geri dönüşleri ve başvuru sonrası takip mesajları tek yerden izlenir.
              </p>
              <div className="mt-4 rounded-xl border border-[#1D3047] bg-[#0A192B]/82 p-4 text-[13px] text-white/70">
                Entegrasyon durumu: hazır yüzey. Canlı CRM/Mobikob API bağlantısı aktif olduğunda bu karta gerçek konuşma listesi bağlanır.
              </div>
            </section>

            <section className={sectionClassName}>
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/54">Aksiyonlar</p>
              <h2 className="mt-2 text-[24px] font-semibold text-white">Hızlı İşlemler</h2>
              <ul className="mt-3 space-y-2 text-[14px] text-white/72">
                <li>• Bekleyen başvuru geri dönüşlerini danışmanlara ata</li>
                <li>• Sonuç görüntülemeyen adayları öncelik listesine al</li>
                <li>• DLQ uyarılarını operasyon görevine çevir</li>
              </ul>
            </section>
          </div>
        ) : null}

        {!isLoading && activeView === 'operations' ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <section className={sectionClassName}>
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/54">Bursluluk KPI</p>
              <h2 className="mt-2 text-[24px] font-semibold text-white">Operasyon Özeti</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#1A273A] bg-[#071021]/82 p-3">
                  <p className="text-[12px] text-white/52">Toplam Başvuru</p>
                  <p className="mt-1 text-[22px] font-semibold text-white">{formatNumber(dashboard?.summary?.total_applications)}</p>
                </div>
                <div className="rounded-xl border border-[#1A273A] bg-[#071021]/82 p-3">
                  <p className="text-[12px] text-white/52">SMS Başarı</p>
                  <p className="mt-1 text-[22px] font-semibold text-white">{formatPercent(dashboard?.summary?.sms_success_rate)}</p>
                </div>
                <div className="rounded-xl border border-[#1A273A] bg-[#071021]/82 p-3">
                  <p className="text-[12px] text-white/52">Sınav Tamamlama</p>
                  <p className="mt-1 text-[22px] font-semibold text-white">{formatPercent(dashboard?.summary?.exam_completion_rate)}</p>
                </div>
                <div className="rounded-xl border border-[#1A273A] bg-[#071021]/82 p-3">
                  <p className="text-[12px] text-white/52">Sonuç Görüntüleme</p>
                  <p className="mt-1 text-[22px] font-semibold text-white">{formatPercent(dashboard?.summary?.result_view_rate)}</p>
                </div>
              </div>
            </section>

            <section className={sectionClassName}>
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/54">Operasyon Sağlığı</p>
              <h2 className="mt-2 text-[24px] font-semibold text-white">DLQ ve Hata Takibi</h2>
              <ul className="mt-4 space-y-3 text-[14px] text-white/72">
                <li>• Açık DLQ işi: <span className="font-semibold text-white">{formatNumber(dashboard?.operations?.open_dlq_jobs)}</span></li>
                <li>• Aktif DLQ işi: <span className="font-semibold text-white">{formatNumber(dashboard?.operations?.active_dlq_jobs)}</span></li>
                <li>• Son 30 dk hata: <span className="font-semibold text-white">{formatNumber(dashboard?.operations?.last_30m_failures)}</span></li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
                <Link className="rounded-full border border-[#1A273A] bg-[#071021]/82 px-3 py-2 text-white/72 hover:border-[#2D4363]" to="/panel/candidates">Adaylar</Link>
                <Link className="rounded-full border border-[#1A273A] bg-[#071021]/82 px-3 py-2 text-white/72 hover:border-[#2D4363]" to="/panel/notifications">Bildirimler</Link>
                <Link className="rounded-full border border-[#1A273A] bg-[#071021]/82 px-3 py-2 text-white/72 hover:border-[#2D4363]" to="/panel/dlq">DLQ</Link>
                <Link className="rounded-full border border-[#1A273A] bg-[#071021]/82 px-3 py-2 text-white/72 hover:border-[#2D4363]" to="/panel/unviewed-results">Sonuç Görmeyenler</Link>
                <a className="rounded-full border border-[#1A273A] bg-[#071021]/82 px-3 py-2 text-white/72 hover:border-[#2D4363]" href={panelApiHref('/api/panel/candidates')} target="_blank" rel="noreferrer">Aday API</a>
                <a className="rounded-full border border-[#1A273A] bg-[#071021]/82 px-3 py-2 text-white/72 hover:border-[#2D4363]" href={panelApiHref('/api/panel/notifications')} target="_blank" rel="noreferrer">Bildirim API</a>
                <a className="rounded-full border border-[#1A273A] bg-[#071021]/82 px-3 py-2 text-white/72 hover:border-[#2D4363]" href={panelApiHref('/api/panel/dlq')} target="_blank" rel="noreferrer">DLQ API</a>
                <a className="rounded-full border border-[#1A273A] bg-[#071021]/82 px-3 py-2 text-white/72 hover:border-[#2D4363]" href={panelApiHref('/api/panel/unviewed-results')} target="_blank" rel="noreferrer">Unviewed API</a>
              </div>
            </section>

            {activeOpsFocus ? (
              <section className={`${sectionClassName} lg:col-span-2`}>
                <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/54">Route Odak</p>
                <h3 className="mt-2 text-[22px] font-semibold text-white">
                  {activeOpsFocus === 'candidates'
                    ? 'Adaylar Ekranı'
                    : activeOpsFocus === 'notifications'
                      ? 'Bildirimler Ekranı'
                      : activeOpsFocus === 'dlq'
                        ? 'DLQ Ekranı'
                        : 'Sonuç Görmeyenler Ekranı'}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.7] text-white/64">
                  Bu route, operasyonu tek panel yüzeyinde ilgili alt başlığa odaklayacak şekilde açar.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
                  {activeOpsFocus === 'candidates' ? (
                    <a className="rounded-full border border-[#1A273A] bg-[#071021]/82 px-3 py-2 text-white/72 hover:border-[#2D4363]" href={panelApiHref('/api/panel/candidates')} target="_blank" rel="noreferrer">Aday verisini aç</a>
                  ) : null}
                  {activeOpsFocus === 'notifications' ? (
                    <a className="rounded-full border border-[#1A273A] bg-[#071021]/82 px-3 py-2 text-white/72 hover:border-[#2D4363]" href={panelApiHref('/api/panel/notifications')} target="_blank" rel="noreferrer">Bildirim verisini aç</a>
                  ) : null}
                  {activeOpsFocus === 'dlq' ? (
                    <a className="rounded-full border border-[#1A273A] bg-[#071021]/82 px-3 py-2 text-white/72 hover:border-[#2D4363]" href={panelApiHref('/api/panel/dlq')} target="_blank" rel="noreferrer">DLQ verisini aç</a>
                  ) : null}
                  {activeOpsFocus === 'unviewed' ? (
                    <a className="rounded-full border border-[#1A273A] bg-[#071021]/82 px-3 py-2 text-white/72 hover:border-[#2D4363]" href={panelApiHref('/api/panel/unviewed-results')} target="_blank" rel="noreferrer">Sonuç görmeyen adayları aç</a>
                  ) : null}
                </div>

                {activeOpsFocus === 'unviewed' ? (
                  <div className="mt-5 rounded-2xl border border-[#1A273A] bg-[#071021]/82 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[13px] text-white/55">
                          Toplam: <span className="font-semibold text-white">{formatNumber(unviewedResults?.summary?.total_unviewed)}</span>
                          {' '}• WA sorunlu: <span className="font-semibold text-white">{formatNumber(unviewedResults?.summary?.wa_problematic)}</span>
                          {' '}• WA ulaştı: <span className="font-semibold text-white">{formatNumber(unviewedResults?.summary?.wa_reached)}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSendUnviewedWhatsapp}
                        disabled={isUnviewedActionRunning || selectedUnviewedCandidateIds.length === 0}
                        className="rounded-xl bg-[#D92E27] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.11em] text-white transition hover:bg-[#bf251f] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUnviewedActionRunning ? 'Gönderiliyor...' : `WhatsApp Gönder (${selectedUnviewedCandidateIds.length})`}
                      </button>
                    </div>

                    {opsMessage ? (
                      <p className="mt-3 rounded-lg border border-[#254163] bg-[#0a1728] px-3 py-2 text-[12px] text-white/75">{opsMessage}</p>
                    ) : null}

                    {unviewedLoading ? (
                      <p className="mt-3 text-[13px] text-white/60">Sonuç görmeyen adaylar yükleniyor...</p>
                    ) : null}

                    {!unviewedLoading && Array.isArray(unviewedResults?.items) && unviewedResults.items.length > 0 ? (
                      <div className="mt-3 overflow-x-auto">
                        <table className="min-w-full text-left text-[12px] text-white/78">
                          <thead>
                            <tr className="border-b border-white/12 text-white/55">
                              <th className="px-2 py-2">#</th>
                              <th className="px-2 py-2">Aday</th>
                              <th className="px-2 py-2">Okul</th>
                              <th className="px-2 py-2">Sınıf</th>
                              <th className="px-2 py-2">WA Durumu</th>
                              <th className="px-2 py-2">Yayın</th>
                            </tr>
                          </thead>
                          <tbody>
                            {unviewedResults.items.map((item) => (
                              <tr key={item.candidate_id} className="border-b border-white/6">
                                <td className="px-2 py-2">{item.candidate_id.slice(0, 8)}</td>
                                <td className="px-2 py-2">{item.student_full_name || '-'}</td>
                                <td className="px-2 py-2">{item.school_name || '-'}</td>
                                <td className="px-2 py-2">{item.grade ? `${item.grade}` : '-'}</td>
                                <td className="px-2 py-2">{item.wa_result_status || '-'}</td>
                                <td className="px-2 py-2">{item.result_published_at ? new Date(item.result_published_at).toLocaleString('tr-TR') : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>
        ) : null}

        {!isLoading && activeView === 'tasks' ? (
          <section className={sectionClassName}>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/54">Görevler</p>
            <h2 className="mt-2 text-[24px] font-semibold text-white">Operasyon Kontrol Listesi</h2>
            <ul className="mt-4 space-y-3 text-[14px] leading-[1.7] text-white/72">
              {defaultTasks.map((task) => (
                <li key={task} className="rounded-xl border border-[#1A273A] bg-[#071021]/82 px-4 py-3">• {task}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {!isLoading && activeView === 'settings' ? (
          <section className={sectionClassName}>
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/54">Ayarlar</p>
            <h2 className="mt-2 text-[24px] font-semibold text-white">Panel Konfigürasyonu</h2>
            <p className="mt-2 text-[14px] leading-[1.7] text-white/64">
              Geçici şifre ile giriş yapan kullanıcılar login cevabındaki `password_reset_required`/`next_step=password_reset` sinyali ile otomatik olarak
              şifre yenileme ekranına yönlendirilir.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#1A273A] bg-[#071021]/82 p-3">
                <p className="text-[12px] text-white/52">App Settings Kaydı</p>
                <p className="mt-1 text-[22px] font-semibold text-white">{formatNumber(settingsCount)}</p>
              </div>
              <div className="rounded-xl border border-[#1A273A] bg-[#071021]/82 p-3">
                <p className="text-[12px] text-white/52">Şifre Yenileme Ekranı</p>
                <p className="mt-1 text-[16px] font-semibold text-white">/panel/password-reset</p>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
