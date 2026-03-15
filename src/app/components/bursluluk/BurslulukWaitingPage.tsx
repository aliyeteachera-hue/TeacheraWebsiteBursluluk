import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { getExamSessionStatus } from '../../api/examApi';
import { clearBurslulukCandidateSession, readBurslulukCandidateSession } from './burslulukFlowSession';

function formatRemaining(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function BurslulukWaitingPage() {
  const navigate = useNavigate();
  const session = readBurslulukCandidateSession();

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [openAt, setOpenAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      navigate('/bursluluk/giris', { replace: true });
      return;
    }

    let active = true;

    const checkGate = async (markRefreshing = false) => {
      if (!active) return;
      if (markRefreshing) setRefreshing(true);
      setError(null);
      try {
        const response = await getExamSessionStatus(session.sessionToken, session.attemptId);
        if (!active) return;
        setServerTime(response.gate.server_time_utc);
        setOpenAt(response.gate.exam_open_at);
        setRemainingSeconds(Number(response.gate.remaining_seconds || 0));
        if (response.gate.exam_open) {
          navigate('/bursluluk/sinav', { replace: true });
        }
      } catch (requestError) {
        if (!active) return;
        setError(requestError instanceof Error ? requestError.message : 'Sınav durumu alınamadı.');
      } finally {
        if (!active) return;
        setLoading(false);
        if (markRefreshing) setRefreshing(false);
      }
    };

    checkGate(false);
    const poll = window.setInterval(() => checkGate(false), 15000);

    return () => {
      active = false;
      window.clearInterval(poll);
    };
  }, [navigate, session]);

  const statusText = useMemo(() => {
    if (loading) return 'Sınav durumu kontrol ediliyor...';
    if (remainingSeconds > 0) return `Sınavın açılmasına ${formatRemaining(remainingSeconds)} kaldı.`;
    return 'Sınav açılışı bekleniyor. Sistem güncellendiğinde otomatik yönlendirileceksiniz.';
  }, [loading, remainingSeconds]);

  if (!session) return null;

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-16 pt-[118px] sm:px-6 lg:px-12 lg:pt-[142px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(56,189,248,0.16),transparent_44%),radial-gradient(circle_at_84%_14%,rgba(217,46,39,0.2),transparent_36%),linear-gradient(138deg,#06050D_0%,#0A0C16_52%,#05070F_100%)]" />

      <div className="relative mx-auto w-full max-w-[700px] rounded-[28px] border border-white/14 bg-white/[0.06] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.44)] backdrop-blur-md sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[#E35347]">Bekleme Ekranı</p>
        <h1 className="mt-3 text-[34px] font-semibold leading-tight text-white">Sınav Saatini Bekliyorsunuz</h1>

        <div className="mt-7 rounded-2xl border border-white/12 bg-[#0b1527]/78 p-5">
          <p className="text-[15px] text-white/75">{statusText}</p>
          <p className="mt-2 text-[13px] text-white/50">Başvuru No: <span className="font-semibold text-white/85">{session.applicationNo}</span></p>
          {openAt ? <p className="mt-1 text-[13px] text-white/50">Planlanan açılış: {new Date(openAt).toLocaleString('tr-TR')}</p> : null}
          {serverTime ? <p className="mt-1 text-[13px] text-white/50">Sunucu saati: {new Date(serverTime).toLocaleString('tr-TR')}</p> : null}
        </div>

        {error ? <p className="mt-4 rounded-lg border border-[#f87171]/35 bg-[#7f1d1d]/30 px-3 py-2 text-[13px] text-[#fecaca]">{error}</p> : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={async () => {
              setRefreshing(true);
              setError(null);
              try {
                const response = await getExamSessionStatus(session.sessionToken, session.attemptId);
                setServerTime(response.gate.server_time_utc);
                setOpenAt(response.gate.exam_open_at);
                setRemainingSeconds(Number(response.gate.remaining_seconds || 0));
                if (response.gate.exam_open) navigate('/bursluluk/sinav', { replace: true });
              } catch (requestError) {
                setError(requestError instanceof Error ? requestError.message : 'Durum yenilenemedi.');
              } finally {
                setRefreshing(false);
              }
            }}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl bg-[#D92E27] px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#bf251f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? 'Yenileniyor...' : 'Durumu Yenile'}
          </button>

          <button
            type="button"
            onClick={() => {
              clearBurslulukCandidateSession();
              navigate('/bursluluk/giris');
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/16 px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/82 transition hover:bg-white/10"
          >
            Hesaptan Çık
          </button>
          <Link to="/bursluluk/onay" className="text-[13px] text-white/65 hover:text-white">Onay ekranı</Link>
        </div>
      </div>
    </section>
  );
}
