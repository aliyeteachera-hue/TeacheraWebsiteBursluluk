import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Clock3,
  Download,
  EyeOff,
  LoaderCircle,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Table,
  Trash2,
  UserCog,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

import {
  exportPanelCandidatesCsv,
  getPanelCandidates,
  getPanelDashboard,
  getPanelDlq,
  getPanelNotifications,
  getPanelSettings,
  getPanelUnviewedResults,
  runPanelCandidatesAction,
  runPanelDlqAction,
  runPanelNotificationsAction,
  runPanelUnviewedAction,
  updatePanelSettings,
} from '../../panel/client';
import type {
  PanelCandidateRow,
  PanelDashboardPayload,
  PanelDlqRow,
  PanelListResponse,
  PanelNotificationRow,
  PanelRole,
  PanelSettingsPayload,
  PanelUnviewedRow,
} from '../../panel/types';
import { notifyError, notifySuccess } from '../../lib/notifications';
import { BurslulukBackground, BurslulukPanel } from '../bursluluk/BurslulukUi';

type SectionKey = 'dashboard' | 'candidates' | 'notifications' | 'unviewed-results' | 'dlq' | 'settings';

const SECTIONS: Array<{ key: SectionKey; label: string; icon: typeof Table }> = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'candidates', label: 'Aday Operasyon', icon: UserCog },
  { key: 'notifications', label: 'Bildirim Merkezi', icon: Bell },
  { key: 'unviewed-results', label: 'Sonuc Gormeyenler', icon: EyeOff },
  { key: 'dlq', label: 'DLQ ve Hata', icon: AlertTriangle },
  { key: 'settings', label: 'Ayarlar', icon: Settings },
];

const ROLE_OPTIONS: PanelRole[] = ['SUPER_ADMIN', 'OPERATIONS', 'READ_ONLY'];

const BASE_QUERY = {
  page: 1,
  per_page: 25,
  sort_by: 'updated_at',
  sort_order: 'desc' as const,
};

function isSectionKey(value: string): value is SectionKey {
  return SECTIONS.some((item) => item.key === value);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-';

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '-';

  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Istanbul',
  }).format(date);
}

function formatPercent(value: number) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function formatScore(value: number | null | undefined) {
  if (value == null) return '-';
  return Number(value).toFixed(2);
}

function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const stored = window.localStorage.getItem(key);
      if (!stored) return initialValue;
      return JSON.parse(stored) as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const sectionFromPath = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const candidate = parts[1] || 'dashboard';
    return isSectionKey(candidate) ? candidate : null;
  }, [location.pathname]);

  useEffect(() => {
    if (!sectionFromPath) {
      navigate('/panel/dashboard', { replace: true });
    }
  }, [navigate, sectionFromPath]);

  const activeSection: SectionKey = sectionFromPath || 'dashboard';

  const [adminKey, setAdminKey] = usePersistentState<string>('teachera.panel.adminKey', '');
  const [role, setRole] = usePersistentState<PanelRole>('teachera.panel.role', 'SUPER_ADMIN');

  const [settings, setSettings] = useState<PanelSettingsPayload | null>(null);
  const [settingsDraft, setSettingsDraft] = useState({
    campaign_code: '',
    poll_interval_seconds: 15,
    result_release_at: '',
    credentials_sms_template: 'CREDENTIALS_SMS',
    result_wa_template: 'WA_RESULT',
  });

  const [dashboard, setDashboard] = useState<PanelDashboardPayload | null>(null);
  const [candidates, setCandidates] = useState<PanelListResponse<PanelCandidateRow> | null>(null);
  const [notifications, setNotifications] = useState<PanelListResponse<PanelNotificationRow> | null>(null);
  const [unviewed, setUnviewed] = useState<PanelListResponse<PanelUnviewedRow> | null>(null);
  const [dlq, setDlq] = useState<PanelListResponse<PanelDlqRow> | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastRefreshAt, setLastRefreshAt] = useState<string>('');

  const [candidateQuery, setCandidateQuery] = useState({
    ...BASE_QUERY,
    sort_by: 'updated_at',
    q: '',
    school_name: '',
    grade: '',
    exam_status: '',
    result_status: '',
  });
  const [notificationQuery, setNotificationQuery] = useState({
    ...BASE_QUERY,
    sort_by: 'created_at',
    q: '',
    channel: '',
    status: '',
  });
  const [unviewedQuery, setUnviewedQuery] = useState({
    ...BASE_QUERY,
    sort_by: 'result_published_at',
    q: '',
    school_name: '',
    grade: '',
  });
  const [dlqQuery, setDlqQuery] = useState({
    ...BASE_QUERY,
    sort_by: 'updated_at',
    q: '',
    channel: '',
    error_code: '',
  });

  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<string[]>([]);
  const [selectedUnviewedIds, setSelectedUnviewedIds] = useState<string[]>([]);
  const [selectedDlqIds, setSelectedDlqIds] = useState<string[]>([]);

  const context = useMemo(
    () => ({
      adminKey,
      role,
    }),
    [adminKey, role],
  );

  const isReadOnly = role === 'READ_ONLY';
  const isSuperAdmin = role === 'SUPER_ADMIN';

  const refreshSettings = useCallback(async () => {
    const payload = await getPanelSettings(context);
    setSettings(payload);
    setSettingsDraft({
      campaign_code: payload.campaign_code,
      poll_interval_seconds: payload.poll_interval_seconds,
      result_release_at: payload.result_release_at || '',
      credentials_sms_template: payload.message_templates.credentials_sms_template,
      result_wa_template: payload.message_templates.result_wa_template,
    });
  }, [context]);

  const refreshActiveSection = useCallback(
    async (silent = false) => {
      setLoading(true);
      if (!silent) setErrorMessage('');

      try {
        await refreshSettings();

        if (activeSection === 'dashboard') {
          setDashboard(await getPanelDashboard(context));
        } else if (activeSection === 'candidates') {
          setCandidates(
            await getPanelCandidates(context, {
              page: candidateQuery.page,
              per_page: candidateQuery.per_page,
              sort_by: candidateQuery.sort_by,
              sort_order: candidateQuery.sort_order,
              q: candidateQuery.q,
              filters: {
                school_name: candidateQuery.school_name,
                grade: candidateQuery.grade,
                exam_status: candidateQuery.exam_status,
                result_status: candidateQuery.result_status,
              },
            }),
          );
        } else if (activeSection === 'notifications') {
          setNotifications(
            await getPanelNotifications(context, {
              page: notificationQuery.page,
              per_page: notificationQuery.per_page,
              sort_by: notificationQuery.sort_by,
              sort_order: notificationQuery.sort_order,
              q: notificationQuery.q,
              filters: {
                channel: notificationQuery.channel,
                status: notificationQuery.status,
              },
            }),
          );
        } else if (activeSection === 'unviewed-results') {
          setUnviewed(
            await getPanelUnviewedResults(context, {
              page: unviewedQuery.page,
              per_page: unviewedQuery.per_page,
              sort_by: unviewedQuery.sort_by,
              sort_order: unviewedQuery.sort_order,
              q: unviewedQuery.q,
              filters: {
                school_name: unviewedQuery.school_name,
                grade: unviewedQuery.grade,
              },
            }),
          );
        } else if (activeSection === 'dlq') {
          setDlq(
            await getPanelDlq(context, {
              page: dlqQuery.page,
              per_page: dlqQuery.per_page,
              sort_by: dlqQuery.sort_by,
              sort_order: dlqQuery.sort_order,
              q: dlqQuery.q,
              filters: {
                channel: dlqQuery.channel,
                error_code: dlqQuery.error_code,
              },
            }),
          );
        }

        setLastRefreshAt(new Date().toISOString());
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Panel verisi yuklenemedi.';
        setErrorMessage(message);
        if (!silent) {
          notifyError(message);
        }
      } finally {
        setLoading(false);
      }
    },
    [
      activeSection,
      candidateQuery,
      context,
      dlqQuery,
      notificationQuery,
      refreshSettings,
      unviewedQuery,
    ],
  );

  useEffect(() => {
    void refreshActiveSection();
  }, [refreshActiveSection]);

  useEffect(() => {
    const intervalSeconds = settings?.poll_interval_seconds || 15;
    const timer = window.setInterval(() => {
      void refreshActiveSection(true);
    }, intervalSeconds * 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [refreshActiveSection, settings?.poll_interval_seconds]);

  const handleCandidatesAction = useCallback(
    async (action: 'sms_retry' | 'wa_send' | 'add_note') => {
      if (selectedCandidateIds.length === 0) {
        notifyError('Lutfen en az bir aday secin.');
        return;
      }

      let note = '';
      if (action === 'add_note') {
        note = window.prompt('Aday notu:') || '';
        if (!note.trim()) {
          notifyError('Not bos birakilamaz.');
          return;
        }
      }

      try {
        const payload = await runPanelCandidatesAction(context, {
          action,
          candidate_ids: selectedCandidateIds,
          note,
        });
        notifySuccess(`Islem tamamlandi. Etkilenen aday: ${payload.affected}`);
        setSelectedCandidateIds([]);
        await refreshActiveSection(true);
      } catch (error) {
        notifyError(error instanceof Error ? error.message : 'Aday aksiyonu basarisiz.');
      }
    },
    [context, refreshActiveSection, selectedCandidateIds],
  );

  const handleNotificationsAction = useCallback(
    async (action: 'retry' | 'cancel' | 'requeue') => {
      if (selectedNotificationIds.length === 0) {
        notifyError('Lutfen en az bir bildirim secin.');
        return;
      }

      try {
        const payload = await runPanelNotificationsAction(context, {
          action,
          job_ids: selectedNotificationIds,
        });
        notifySuccess(`Islem tamamlandi. Etkilenen kayit: ${payload.affected}`);
        setSelectedNotificationIds([]);
        await refreshActiveSection(true);
      } catch (error) {
        notifyError(error instanceof Error ? error.message : 'Bildirim aksiyonu basarisiz.');
      }
    },
    [context, refreshActiveSection, selectedNotificationIds],
  );

  const handleUnviewedAction = useCallback(async () => {
    if (selectedUnviewedIds.length === 0) {
      notifyError('Lutfen en az bir aday secin.');
      return;
    }

    try {
      const payload = await runPanelUnviewedAction(context, {
        action: 'send_wa',
        candidate_ids: selectedUnviewedIds,
      });
      notifySuccess(`WA kuyruguna alindi. Etkilenen aday: ${payload.affected}`);
      setSelectedUnviewedIds([]);
      await refreshActiveSection(true);
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'WA gonderim aksiyonu basarisiz.');
    }
  }, [context, refreshActiveSection, selectedUnviewedIds]);

  const handleDlqAction = useCallback(
    async (action: 'retry' | 'assign' | 'close') => {
      if (selectedDlqIds.length === 0) {
        notifyError('Lutfen en az bir DLQ kaydi secin.');
        return;
      }

      let rootCauseNote = '';
      let assignedTo = '';

      if (action === 'close') {
        rootCauseNote = window.prompt('Root cause notu:') || '';
        if (!rootCauseNote.trim()) {
          notifyError('Root cause notu zorunludur.');
          return;
        }
      }

      if (action === 'assign') {
        assignedTo = window.prompt('Atanacak operator:') || '';
        if (!assignedTo.trim()) {
          notifyError('Operator bilgisi bos birakilamaz.');
          return;
        }
      }

      try {
        const payload = await runPanelDlqAction(context, {
          action,
          job_ids: selectedDlqIds,
          root_cause_note: rootCauseNote,
          assigned_to: assignedTo,
        });
        notifySuccess(`DLQ aksiyonu tamamlandi. Etkilenen kayit: ${payload.affected}`);
        setSelectedDlqIds([]);
        await refreshActiveSection(true);
      } catch (error) {
        notifyError(error instanceof Error ? error.message : 'DLQ aksiyonu basarisiz.');
      }
    },
    [context, refreshActiveSection, selectedDlqIds],
  );

  const handleSettingsSave = useCallback(async () => {
    try {
      await updatePanelSettings(context, {
        campaign_code: settingsDraft.campaign_code,
        poll_interval_seconds: Number(settingsDraft.poll_interval_seconds),
        result_release_at: settingsDraft.result_release_at,
        message_templates: {
          credentials_sms_template: settingsDraft.credentials_sms_template,
          result_wa_template: settingsDraft.result_wa_template,
        },
      });

      notifySuccess('Panel ayarlari guncellendi.');
      await refreshActiveSection(true);
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Panel ayarlari kaydedilemedi.');
    }
  }, [context, refreshActiveSection, settingsDraft]);

  const handleDownloadCandidates = useCallback(async () => {
    try {
      const csv = await exportPanelCandidatesCsv(context, {
        sort_by: candidateQuery.sort_by,
        sort_order: candidateQuery.sort_order,
        q: candidateQuery.q,
        filters: {
          school_name: candidateQuery.school_name,
          grade: candidateQuery.grade,
          exam_status: candidateQuery.exam_status,
          result_status: candidateQuery.result_status,
        },
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `panel-candidates-${Date.now()}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'CSV export basarisiz.');
    }
  }, [candidateQuery, context]);

  const renderSection = () => {
    if (activeSection === 'dashboard') {
      return <DashboardSection payload={dashboard} />;
    }

    if (activeSection === 'candidates') {
      return (
        <CandidatesSection
          payload={candidates}
          query={candidateQuery}
          onQueryChange={setCandidateQuery}
          selectedIds={selectedCandidateIds}
          onSelectedIdsChange={setSelectedCandidateIds}
          onAction={handleCandidatesAction}
          onExport={handleDownloadCandidates}
          canMutate={!isReadOnly}
        />
      );
    }

    if (activeSection === 'notifications') {
      return (
        <NotificationsSection
          payload={notifications}
          query={notificationQuery}
          onQueryChange={setNotificationQuery}
          selectedIds={selectedNotificationIds}
          onSelectedIdsChange={setSelectedNotificationIds}
          onAction={handleNotificationsAction}
          canMutate={!isReadOnly}
        />
      );
    }

    if (activeSection === 'unviewed-results') {
      return (
        <UnviewedSection
          payload={unviewed}
          query={unviewedQuery}
          onQueryChange={setUnviewedQuery}
          selectedIds={selectedUnviewedIds}
          onSelectedIdsChange={setSelectedUnviewedIds}
          onSendWa={handleUnviewedAction}
          canMutate={!isReadOnly}
        />
      );
    }

    if (activeSection === 'dlq') {
      return (
        <DlqSection
          payload={dlq}
          query={dlqQuery}
          onQueryChange={setDlqQuery}
          selectedIds={selectedDlqIds}
          onSelectedIdsChange={setSelectedDlqIds}
          onAction={handleDlqAction}
          canMutate={!isReadOnly}
        />
      );
    }

    return (
      <SettingsSection
        payload={settings}
        draft={settingsDraft}
        onDraftChange={setSettingsDraft}
        onSave={handleSettingsSave}
        canSave={isSuperAdmin}
      />
    );
  };

  return (
    <BurslulukBackground className="pb-12">
      <div className="mx-auto w-full max-w-[1520px] px-4 pb-10 pt-8 lg:px-8 lg:pt-10">
        <header className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#E70000]">Teachera Ops</p>
              <h1 className="mt-2 font-['Neutraface_2_Text:Bold',sans-serif] text-[1.45rem] text-white sm:text-[1.9rem]">
                Online Bursluluk Admin Panel
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[12px] text-white/70">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
                <Clock3 size={14} />
                Son yenileme: {lastRefreshAt ? formatDateTime(lastRefreshAt) : '-'}
              </span>
              <button
                type="button"
                onClick={() => refreshActiveSection()}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white/80 transition-colors hover:bg-white/10"
              >
                <RefreshCw size={14} />
                Yenile
              </button>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside>
            <BurslulukPanel className="space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-white/48">Admin Key</p>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(event) => setAdminKey(event.target.value)}
                  placeholder="X-Admin-Key"
                  className="mt-2 h-[44px] w-full rounded-[14px] border border-white/15 bg-white/6 px-3 text-[13px] text-white outline-none focus:border-[#E70000]/60"
                />
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-white/48">Rol</p>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as PanelRole)}
                  className="mt-2 h-[44px] w-full rounded-[14px] border border-white/15 bg-[#0E131B] px-3 text-[13px] text-white outline-none focus:border-[#E70000]/60"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 border-t border-white/10 pt-3">
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const active = activeSection === section.key;
                  return (
                    <button
                      key={section.key}
                      type="button"
                      onClick={() => navigate(`/panel/${section.key}`)}
                      className={`flex w-full items-center gap-2 rounded-[14px] px-3 py-2 text-left text-[13px] transition-colors ${
                        active
                          ? 'border border-[#E70000]/40 bg-[#E70000]/15 text-white'
                          : 'border border-transparent bg-white/5 text-white/75 hover:border-white/10 hover:bg-white/8'
                      }`}
                    >
                      <Icon size={15} />
                      {section.label}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-[14px] border border-white/10 bg-white/5 px-3 py-2 text-[12px] leading-[1.6] text-white/65">
                {isReadOnly ? (
                  <span className="inline-flex items-center gap-2 text-[#FFD6D7]">
                    <Shield size={14} />
                    READ_ONLY modunda aksiyonlar kapali.
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-[#D8F8E9]">
                    <Shield size={14} />
                    Islem yetkisi aktif.
                  </span>
                )}
              </div>
            </BurslulukPanel>
          </aside>

          <section className="space-y-4">
            {loading ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] text-white/80">
                <LoaderCircle className="animate-spin" size={14} />
                Veriler yukleniyor...
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded-[16px] border border-[#E70000]/30 bg-[#E70000]/12 px-4 py-3 text-[13px] text-[#FFD9DB]">
                {errorMessage}
              </div>
            ) : null}

            {renderSection()}
          </section>
        </div>
      </div>
    </BurslulukBackground>
  );
}

function DashboardSection({ payload }: { payload: PanelDashboardPayload | null }) {
  if (!payload) {
    return <Placeholder message="Dashboard verisi henuz gelmedi." />;
  }

  const kpiItems = [
    { label: 'Toplam Basvuru', value: String(payload.kpis.total_applications) },
    { label: 'SMS Basari', value: formatPercent(payload.kpis.sms_success_pct) },
    { label: 'Ilk Giris', value: formatPercent(payload.kpis.first_login_pct) },
    { label: 'Sinav Tamamlama', value: formatPercent(payload.kpis.exam_completion_pct) },
    { label: 'Sonuc Goruntuleme', value: formatPercent(payload.kpis.result_viewed_pct) },
    { label: 'WA Ulasim', value: formatPercent(payload.kpis.wa_reach_pct) },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {kpiItems.map((item) => (
          <BurslulukPanel key={item.label} className="p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/48">{item.label}</p>
            <p className="mt-2 font-['Neutraface_2_Text:Bold',sans-serif] text-[1.65rem] text-white">{item.value}</p>
          </BurslulukPanel>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <BurslulukPanel className="p-4">
          <h3 className="text-[13px] uppercase tracking-[0.14em] text-white/62">Saatlik Basvuru Trendi (24s)</h3>
          <div className="mt-3 max-h-[300px] overflow-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="text-white/45">
                <tr>
                  <th className="px-2 py-1">Saat</th>
                  <th className="px-2 py-1">Adet</th>
                </tr>
              </thead>
              <tbody>
                {payload.charts.hourly_applications.map((row) => (
                  <tr key={row.hour_utc} className="border-t border-white/8 text-white/80">
                    <td className="px-2 py-1">{formatDateTime(row.hour_utc)}</td>
                    <td className="px-2 py-1">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BurslulukPanel>

        <BurslulukPanel className="p-4">
          <h3 className="text-[13px] uppercase tracking-[0.14em] text-white/62">Kanal Bazli Bildirim Basarisi</h3>
          <div className="mt-3 max-h-[300px] overflow-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="text-white/45">
                <tr>
                  <th className="px-2 py-1">Kanal</th>
                  <th className="px-2 py-1">Toplam</th>
                  <th className="px-2 py-1">Teslim</th>
                  <th className="px-2 py-1">Hata</th>
                  <th className="px-2 py-1">Basari %</th>
                </tr>
              </thead>
              <tbody>
                {payload.charts.notification_success_by_channel.map((row) => (
                  <tr key={row.channel} className="border-t border-white/8 text-white/80">
                    <td className="px-2 py-1">{row.channel}</td>
                    <td className="px-2 py-1">{row.total}</td>
                    <td className="px-2 py-1">{row.delivered}</td>
                    <td className="px-2 py-1">{row.failed}</td>
                    <td className="px-2 py-1">{formatPercent(row.success_pct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BurslulukPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <BurslulukPanel className="p-4">
          <h3 className="text-[13px] uppercase tracking-[0.14em] text-white/62">Operasyon Kutusu</h3>
          <ul className="mt-3 space-y-2 text-[13px] text-white/80">
            <li>DLQ Job Sayisi: {payload.operations.dlq_job_count}</li>
            <li>Son 30 dk Basarisizlik: {payload.operations.failed_last_30_minutes}</li>
            <li>Son 24 saat Basarisizlik: {payload.operations.failed_last_24_hours}</li>
          </ul>
          <div className="mt-4">
            <p className="text-[12px] uppercase tracking-[0.12em] text-white/55">Kritik Hata Kodlari</p>
            <ul className="mt-2 space-y-1 text-[12px] text-white/78">
              {payload.operations.critical_error_codes.length === 0 ? (
                <li>-</li>
              ) : (
                payload.operations.critical_error_codes.map((item) => (
                  <li key={item.error_code}>{item.error_code} ({item.count})</li>
                ))
              )}
            </ul>
          </div>
        </BurslulukPanel>

        <BurslulukPanel className="p-4">
          <h3 className="text-[13px] uppercase tracking-[0.14em] text-white/62">Okul/Sinif Dagilimi</h3>
          <div className="mt-3 max-h-[300px] overflow-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="text-white/45">
                <tr>
                  <th className="px-2 py-1">Okul</th>
                  <th className="px-2 py-1">Sinif</th>
                  <th className="px-2 py-1">Adet</th>
                </tr>
              </thead>
              <tbody>
                {payload.charts.school_grade_distribution.map((item, index) => (
                  <tr key={`${item.school_name}-${item.grade}-${index}`} className="border-t border-white/8 text-white/80">
                    <td className="px-2 py-1">{item.school_name}</td>
                    <td className="px-2 py-1">{item.grade ?? '-'}</td>
                    <td className="px-2 py-1">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BurslulukPanel>
      </div>
    </div>
  );
}

function CandidatesSection({
  payload,
  query,
  onQueryChange,
  selectedIds,
  onSelectedIdsChange,
  onAction,
  onExport,
  canMutate,
}: {
  payload: PanelListResponse<PanelCandidateRow> | null;
  query: {
    page: number;
    per_page: number;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    q: string;
    school_name: string;
    grade: string;
    exam_status: string;
    result_status: string;
  };
  onQueryChange: (value: any) => void;
  selectedIds: string[];
  onSelectedIdsChange: (value: string[]) => void;
  onAction: (action: 'sms_retry' | 'wa_send' | 'add_note') => void;
  onExport: () => void;
  canMutate: boolean;
}) {
  return (
    <BurslulukPanel className="space-y-4 p-4">
      <SectionHeader title="Aday Operasyon" />

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        <input
          type="text"
          value={query.q}
          onChange={(event) => onQueryChange({ ...query, q: event.target.value, page: 1 })}
          placeholder="Ara: aday, veli, telefon"
          className="h-[42px] rounded-[12px] border border-white/15 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
        <input
          type="text"
          value={query.school_name}
          onChange={(event) => onQueryChange({ ...query, school_name: event.target.value, page: 1 })}
          placeholder="Okul"
          className="h-[42px] rounded-[12px] border border-white/15 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
        <input
          type="text"
          value={query.grade}
          onChange={(event) => onQueryChange({ ...query, grade: event.target.value, page: 1 })}
          placeholder="Sinif"
          className="h-[42px] rounded-[12px] border border-white/15 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
        <input
          type="text"
          value={query.exam_status}
          onChange={(event) => onQueryChange({ ...query, exam_status: event.target.value, page: 1 })}
          placeholder="Sinav Durumu"
          className="h-[42px] rounded-[12px] border border-white/15 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
        <input
          type="text"
          value={query.result_status}
          onChange={(event) => onQueryChange({ ...query, result_status: event.target.value, page: 1 })}
          placeholder="Sonuc Durumu"
          className="h-[42px] rounded-[12px] border border-white/15 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton label="SMS Retry" icon={RefreshCw} disabled={!canMutate} onClick={() => onAction('sms_retry')} />
        <ActionButton label="WA Gonder" icon={Bell} disabled={!canMutate} onClick={() => onAction('wa_send')} />
        <ActionButton label="Not Ekle" icon={Save} disabled={!canMutate} onClick={() => onAction('add_note')} />
        <ActionButton label="CSV Export" icon={Download} onClick={onExport} />
      </div>

      <div className="overflow-auto rounded-[12px] border border-white/10">
        <table className="min-w-[1200px] w-full text-left text-[12px]">
          <thead className="bg-white/6 text-white/45">
            <tr>
              <th className="px-2 py-2">
                <input
                  type="checkbox"
                  checked={Boolean(payload?.items.length) && payload?.items.every((item) => selectedIds.includes(item.candidate_id))}
                  onChange={(event) =>
                    onSelectedIdsChange(event.target.checked ? (payload?.items.map((item) => item.candidate_id) || []) : [])
                  }
                />
              </th>
              <th className="px-2 py-2">Aday</th>
              <th className="px-2 py-2">Okul</th>
              <th className="px-2 py-2">Sinif</th>
              <th className="px-2 py-2">Basvuru</th>
              <th className="px-2 py-2">SMS</th>
              <th className="px-2 py-2">Sinav</th>
              <th className="px-2 py-2">Sonuc</th>
              <th className="px-2 py-2">WA</th>
              <th className="px-2 py-2">Hata</th>
              <th className="px-2 py-2">Guncellendi</th>
            </tr>
          </thead>
          <tbody>
            {(payload?.items || []).map((item) => (
              <tr key={item.candidate_id} className="border-t border-white/8 text-white/80">
                <td className="px-2 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.candidate_id)}
                    onChange={(event) => {
                      if (event.target.checked) {
                        onSelectedIdsChange([...selectedIds, item.candidate_id]);
                      } else {
                        onSelectedIdsChange(selectedIds.filter((id) => id !== item.candidate_id));
                      }
                    }}
                  />
                </td>
                <td className="px-2 py-2">{item.student_full_name}<br /><span className="text-white/45">{item.application_no}</span></td>
                <td className="px-2 py-2">{item.school_name}</td>
                <td className="px-2 py-2">{item.grade ?? '-'}</td>
                <td className="px-2 py-2">{item.application_status}</td>
                <td className="px-2 py-2">{item.credentials_sms_status}</td>
                <td className="px-2 py-2">{item.exam_status}</td>
                <td className="px-2 py-2">{item.result_status} ({formatScore(item.result_score)})</td>
                <td className="px-2 py-2">{item.wa_result_status}</td>
                <td className="px-2 py-2">{item.last_error_code || '-'}</td>
                <td className="px-2 py-2">{formatDateTime(item.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationBar
        page={payload?.page || 1}
        perPage={payload?.per_page || query.per_page}
        total={payload?.total || 0}
        onPrev={() => onQueryChange({ ...query, page: Math.max(1, query.page - 1) })}
        onNext={() => onQueryChange({ ...query, page: query.page + 1 })}
      />
    </BurslulukPanel>
  );
}

function NotificationsSection({
  payload,
  query,
  onQueryChange,
  selectedIds,
  onSelectedIdsChange,
  onAction,
  canMutate,
}: {
  payload: PanelListResponse<PanelNotificationRow> | null;
  query: {
    page: number;
    per_page: number;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    q: string;
    channel: string;
    status: string;
  };
  onQueryChange: (value: any) => void;
  selectedIds: string[];
  onSelectedIdsChange: (value: string[]) => void;
  onAction: (action: 'retry' | 'cancel' | 'requeue') => void;
  canMutate: boolean;
}) {
  return (
    <BurslulukPanel className="space-y-4 p-4">
      <SectionHeader title="Bildirim Merkezi" />

      <div className="grid gap-2 md:grid-cols-3">
        <input
          type="text"
          value={query.q}
          onChange={(event) => onQueryChange({ ...query, q: event.target.value, page: 1 })}
          placeholder="Ara: job id, recipient"
          className="h-[42px] rounded-[12px] border border-white/15 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
        <input
          type="text"
          value={query.channel}
          onChange={(event) => onQueryChange({ ...query, channel: event.target.value, page: 1 })}
          placeholder="Kanal"
          className="h-[42px] rounded-[12px] border border-white/15 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
        <input
          type="text"
          value={query.status}
          onChange={(event) => onQueryChange({ ...query, status: event.target.value, page: 1 })}
          placeholder="Durum"
          className="h-[42px] rounded-[12px] border border-white/15 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton label="Retry" icon={RefreshCw} disabled={!canMutate} onClick={() => onAction('retry')} />
        <ActionButton label="Cancel" icon={Trash2} disabled={!canMutate} onClick={() => onAction('cancel')} />
        <ActionButton label="Requeue" icon={Bell} disabled={!canMutate} onClick={() => onAction('requeue')} />
      </div>

      <div className="overflow-auto rounded-[12px] border border-white/10">
        <table className="min-w-[1100px] w-full text-left text-[12px]">
          <thead className="bg-white/6 text-white/45">
            <tr>
              <th className="px-2 py-2">
                <input
                  type="checkbox"
                  checked={Boolean(payload?.items.length) && payload?.items.every((item) => selectedIds.includes(item.job_id))}
                  onChange={(event) =>
                    onSelectedIdsChange(event.target.checked ? (payload?.items.map((item) => item.job_id) || []) : [])
                  }
                />
              </th>
              <th className="px-2 py-2">Job</th>
              <th className="px-2 py-2">Kanal</th>
              <th className="px-2 py-2">Template</th>
              <th className="px-2 py-2">Alici</th>
              <th className="px-2 py-2">Durum</th>
              <th className="px-2 py-2">Retry</th>
              <th className="px-2 py-2">Error</th>
              <th className="px-2 py-2">Olusturma</th>
            </tr>
          </thead>
          <tbody>
            {(payload?.items || []).map((item) => (
              <tr key={item.job_id} className="border-t border-white/8 text-white/80">
                <td className="px-2 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.job_id)}
                    onChange={(event) => {
                      if (event.target.checked) {
                        onSelectedIdsChange([...selectedIds, item.job_id]);
                      } else {
                        onSelectedIdsChange(selectedIds.filter((id) => id !== item.job_id));
                      }
                    }}
                  />
                </td>
                <td className="px-2 py-2">{item.job_id}</td>
                <td className="px-2 py-2">{item.channel}</td>
                <td className="px-2 py-2">{item.template_code}</td>
                <td className="px-2 py-2">{item.recipient}</td>
                <td className="px-2 py-2">{item.status}</td>
                <td className="px-2 py-2">{item.retry_count}</td>
                <td className="px-2 py-2">{item.error_code || '-'}</td>
                <td className="px-2 py-2">{formatDateTime(item.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationBar
        page={payload?.page || 1}
        perPage={payload?.per_page || query.per_page}
        total={payload?.total || 0}
        onPrev={() => onQueryChange({ ...query, page: Math.max(1, query.page - 1) })}
        onNext={() => onQueryChange({ ...query, page: query.page + 1 })}
      />
    </BurslulukPanel>
  );
}

function UnviewedSection({
  payload,
  query,
  onQueryChange,
  selectedIds,
  onSelectedIdsChange,
  onSendWa,
  canMutate,
}: {
  payload: PanelListResponse<PanelUnviewedRow> | null;
  query: {
    page: number;
    per_page: number;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    q: string;
    school_name: string;
    grade: string;
  };
  onQueryChange: (value: any) => void;
  selectedIds: string[];
  onSelectedIdsChange: (value: string[]) => void;
  onSendWa: () => void;
  canMutate: boolean;
}) {
  return (
    <BurslulukPanel className="space-y-4 p-4">
      <SectionHeader title="Sonuc Gormeyenler" />

      <div className="grid gap-2 md:grid-cols-3">
        <input
          type="text"
          value={query.q}
          onChange={(event) => onQueryChange({ ...query, q: event.target.value, page: 1 })}
          placeholder="Aday veya okul ara"
          className="h-[42px] rounded-[12px] border border-white/15 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
        <input
          type="text"
          value={query.school_name}
          onChange={(event) => onQueryChange({ ...query, school_name: event.target.value, page: 1 })}
          placeholder="Okul"
          className="h-[42px] rounded-[12px] border border-white/15 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
        <input
          type="text"
          value={query.grade}
          onChange={(event) => onQueryChange({ ...query, grade: event.target.value, page: 1 })}
          placeholder="Sinif"
          className="h-[42px] rounded-[12px] border border-white/15 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton label="Secili adaylara WA gonder" icon={Bell} disabled={!canMutate} onClick={onSendWa} />
      </div>

      <div className="overflow-auto rounded-[12px] border border-white/10">
        <table className="min-w-[980px] w-full text-left text-[12px]">
          <thead className="bg-white/6 text-white/45">
            <tr>
              <th className="px-2 py-2">
                <input
                  type="checkbox"
                  checked={Boolean(payload?.items.length) && payload?.items.every((item) => selectedIds.includes(item.candidate_id))}
                  onChange={(event) =>
                    onSelectedIdsChange(event.target.checked ? (payload?.items.map((item) => item.candidate_id) || []) : [])
                  }
                />
              </th>
              <th className="px-2 py-2">Aday</th>
              <th className="px-2 py-2">Okul</th>
              <th className="px-2 py-2">Sinif</th>
              <th className="px-2 py-2">Sonuc Yayin</th>
              <th className="px-2 py-2">Son Giris</th>
              <th className="px-2 py-2">WA Durum</th>
              <th className="px-2 py-2">WA Son Gonderim</th>
            </tr>
          </thead>
          <tbody>
            {(payload?.items || []).map((item) => (
              <tr key={item.candidate_id} className="border-t border-white/8 text-white/80">
                <td className="px-2 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.candidate_id)}
                    onChange={(event) => {
                      if (event.target.checked) {
                        onSelectedIdsChange([...selectedIds, item.candidate_id]);
                      } else {
                        onSelectedIdsChange(selectedIds.filter((id) => id !== item.candidate_id));
                      }
                    }}
                  />
                </td>
                <td className="px-2 py-2">{item.student_full_name}</td>
                <td className="px-2 py-2">{item.school_name}</td>
                <td className="px-2 py-2">{item.grade}</td>
                <td className="px-2 py-2">{formatDateTime(item.result_published_at)}</td>
                <td className="px-2 py-2">{formatDateTime(item.last_login_at)}</td>
                <td className="px-2 py-2">{item.wa_result_status}</td>
                <td className="px-2 py-2">{formatDateTime(item.wa_last_sent_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationBar
        page={payload?.page || 1}
        perPage={payload?.per_page || query.per_page}
        total={payload?.total || 0}
        onPrev={() => onQueryChange({ ...query, page: Math.max(1, query.page - 1) })}
        onNext={() => onQueryChange({ ...query, page: query.page + 1 })}
      />
    </BurslulukPanel>
  );
}

function DlqSection({
  payload,
  query,
  onQueryChange,
  selectedIds,
  onSelectedIdsChange,
  onAction,
  canMutate,
}: {
  payload: PanelListResponse<PanelDlqRow> | null;
  query: {
    page: number;
    per_page: number;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    q: string;
    channel: string;
    error_code: string;
  };
  onQueryChange: (value: any) => void;
  selectedIds: string[];
  onSelectedIdsChange: (value: string[]) => void;
  onAction: (action: 'retry' | 'assign' | 'close') => void;
  canMutate: boolean;
}) {
  return (
    <BurslulukPanel className="space-y-4 p-4">
      <SectionHeader title="DLQ ve Hata" />

      <div className="grid gap-2 md:grid-cols-3">
        <input
          type="text"
          value={query.q}
          onChange={(event) => onQueryChange({ ...query, q: event.target.value, page: 1 })}
          placeholder="Ara: job id, operator, hata"
          className="h-[42px] rounded-[12px] border border-white/15 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
        <input
          type="text"
          value={query.channel}
          onChange={(event) => onQueryChange({ ...query, channel: event.target.value, page: 1 })}
          placeholder="Kanal"
          className="h-[42px] rounded-[12px] border border-white/15 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
        <input
          type="text"
          value={query.error_code}
          onChange={(event) => onQueryChange({ ...query, error_code: event.target.value, page: 1 })}
          placeholder="Hata kodu"
          className="h-[42px] rounded-[12px] border border-white/15 bg-white/5 px-3 text-[13px] text-white outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ActionButton label="Retry" icon={RefreshCw} disabled={!canMutate} onClick={() => onAction('retry')} />
        <ActionButton label="Operatore ata" icon={UserCog} disabled={!canMutate} onClick={() => onAction('assign')} />
        <ActionButton label="Kapat" icon={Trash2} disabled={!canMutate} onClick={() => onAction('close')} />
      </div>

      <div className="overflow-auto rounded-[12px] border border-white/10">
        <table className="min-w-[1050px] w-full text-left text-[12px]">
          <thead className="bg-white/6 text-white/45">
            <tr>
              <th className="px-2 py-2">
                <input
                  type="checkbox"
                  checked={Boolean(payload?.items.length) && payload?.items.every((item) => selectedIds.includes(item.job_id))}
                  onChange={(event) =>
                    onSelectedIdsChange(event.target.checked ? (payload?.items.map((item) => item.job_id) || []) : [])
                  }
                />
              </th>
              <th className="px-2 py-2">Job</th>
              <th className="px-2 py-2">Kanal</th>
              <th className="px-2 py-2">Durum</th>
              <th className="px-2 py-2">Retry</th>
              <th className="px-2 py-2">Hata</th>
              <th className="px-2 py-2">Operator</th>
              <th className="px-2 py-2">Root Cause</th>
              <th className="px-2 py-2">Guncellendi</th>
            </tr>
          </thead>
          <tbody>
            {(payload?.items || []).map((item) => (
              <tr key={item.job_id} className="border-t border-white/8 text-white/80">
                <td className="px-2 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.job_id)}
                    onChange={(event) => {
                      if (event.target.checked) {
                        onSelectedIdsChange([...selectedIds, item.job_id]);
                      } else {
                        onSelectedIdsChange(selectedIds.filter((id) => id !== item.job_id));
                      }
                    }}
                  />
                </td>
                <td className="px-2 py-2">{item.job_id}</td>
                <td className="px-2 py-2">{item.channel}</td>
                <td className="px-2 py-2">{item.status}</td>
                <td className="px-2 py-2">{item.retry_count}</td>
                <td className="px-2 py-2">{item.error_code}</td>
                <td className="px-2 py-2">{item.assigned_to || '-'}</td>
                <td className="px-2 py-2">{item.root_cause_note || '-'}</td>
                <td className="px-2 py-2">{formatDateTime(item.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationBar
        page={payload?.page || 1}
        perPage={payload?.per_page || query.per_page}
        total={payload?.total || 0}
        onPrev={() => onQueryChange({ ...query, page: Math.max(1, query.page - 1) })}
        onNext={() => onQueryChange({ ...query, page: query.page + 1 })}
      />
    </BurslulukPanel>
  );
}

function SettingsSection({
  payload,
  draft,
  onDraftChange,
  onSave,
  canSave,
}: {
  payload: PanelSettingsPayload | null;
  draft: {
    campaign_code: string;
    poll_interval_seconds: number;
    result_release_at: string;
    credentials_sms_template: string;
    result_wa_template: string;
  };
  onDraftChange: (value: any) => void;
  onSave: () => void;
  canSave: boolean;
}) {
  return (
    <BurslulukPanel className="space-y-4 p-4">
      <SectionHeader title="Ayarlar" />

      {!payload ? <Placeholder message="Ayarlar yukleniyor..." /> : null}

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Kampanya Kodu"
          value={draft.campaign_code}
          onChange={(value) => onDraftChange({ ...draft, campaign_code: value })}
        />
        <Field
          label="Polling (sn)"
          value={String(draft.poll_interval_seconds)}
          onChange={(value) => onDraftChange({ ...draft, poll_interval_seconds: Number(value) || 15 })}
        />
        <Field
          label="Result Release (ISO)"
          value={draft.result_release_at}
          onChange={(value) => onDraftChange({ ...draft, result_release_at: value })}
        />
        <Field
          label="Credentials SMS Template"
          value={draft.credentials_sms_template}
          onChange={(value) => onDraftChange({ ...draft, credentials_sms_template: value })}
        />
        <Field
          label="Result WA Template"
          value={draft.result_wa_template}
          onChange={(value) => onDraftChange({ ...draft, result_wa_template: value })}
        />
        <div className="rounded-[12px] border border-white/10 bg-white/5 px-3 py-2 text-[12px] text-white/70">
          Son guncelleme: {formatDateTime(payload?.updated_at)}
          <br />
          Okul kaydi: {payload?.school_count ?? '-'}
        </div>
      </div>

      <div>
        <ActionButton label="Ayar Kaydet" icon={Save} disabled={!canSave} onClick={onSave} />
      </div>
    </BurslulukPanel>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[1.2rem] text-white">{title}</h2>;
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
  disabled = false,
}: {
  label: string;
  icon: typeof Save;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-[36px] items-center gap-2 rounded-[10px] border border-white/15 bg-white/5 px-3 text-[12px] text-white/85 transition-colors hover:bg-white/9 disabled:cursor-not-allowed disabled:opacity-45"
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function PaginationBar({
  page,
  perPage,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  perPage: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-white/70">
      <span>
        {from}-{to} / {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="h-[32px] rounded-[10px] border border-white/15 bg-white/5 px-3 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Onceki
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={to >= total}
          className="h-[32px] rounded-[10px] border border-white/15 bg-white/5 px-3 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sonraki
        </button>
      </div>
    </div>
  );
}

function Placeholder({ message }: { message: string }) {
  return (
    <div className="rounded-[12px] border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white/70">{message}</div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-[12px] text-white/65">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[40px] rounded-[10px] border border-white/15 bg-white/5 px-3 text-[12px] text-white outline-none"
      />
    </label>
  );
}
