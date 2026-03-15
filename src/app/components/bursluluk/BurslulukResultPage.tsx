import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { getExamResult, loginCandidate } from '../../api/examApi';
import {
  readBurslulukCandidateSession,
  saveBurslulukCandidateSession,
  type BurslulukCandidateSession,
} from './burslulukFlowSession';

type ResultState = {
  score: number;
  percentage: number;
  status: string;
  placement: string;
  correct: number;
  wrong: number;
  unanswered: number;
  language: string;
  grade: number | null;
  viewedAt: string | null;
};

function formatResultStatus(status: string) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'VIEWED') return 'Görüntülendi';
  if (normalized === 'PUBLISHED') return 'Yayınlandı';
  if (normalized === 'READY') return 'Hazır';
  return normalized || 'Bilinmiyor';
}

function placementLabel(percentage: number, backendLabel: string | null) {
  if (backendLabel) return backendLabel;
  if (percentage >= 85) return 'Advanced';
  if (percentage >= 60) return 'Intermediate';
  return 'Elementary';
}

export default function BurslulukResultPage() {
  const initialSession = readBurslulukCandidateSession();

  const [session, setSession] = useState<BurslulukCandidateSession | null>(initialSession);
  const [username, setUsername] = useState(initialSession?.applicationNo || '');
  const [password, setPassword] = useState(initialSession?.sessionToken || '');
  const [loading, setLoading] = useState(Boolean(initialSession));
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);

  const hasResult = Boolean(result);

  const statusLabel = useMemo(() => (result ? formatResultStatus(result.status) : '-'), [result]);

  const loadResult = async (activeSession: BurslulukCandidateSession) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getExamResult(activeSession.sessionToken, activeSession.attemptId);
      setResult({
        score: Number(response.result.score || 0),
        percentage: Number(response.result.percentage || 0),
        status: String(response.result.status || ''),
        placement: placementLabel(Number(response.result.percentage || 0), response.result.placement_label),
        correct: Number(response.result.correct_count || 0),
        wrong: Number(response.result.wrong_count || 0),
        unanswered: Number(response.result.unanswered_count || 0),
        language: response.result.exam_language || '-',
        grade: typeof response.result.grade === 'number' ? response.result.grade : null,
        viewedAt: response.result.viewed_at || null,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Sonuç bilgisi alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    void loadResult(session);
  }, [session]);

  const onLoginAndLoad = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loggingIn) return;
    setLoggingIn(true);
    setError(null);

    try {
      const response = await loginCandidate(username.trim(), password.trim(), '2026_BURSLULUK');
      const nextSession: BurslulukCandidateSession = {
        applicationNo: response.session.applicationNo,
        sessionToken: response.session.sessionToken,
        attemptId: response.session.attemptId,
        candidateId: response.session.candidateId,
        examLanguage: response.session.examLanguage,
        examAgeRange: response.session.examAgeRange,
        questionCount: Number(response.session.questionCount || 20),
        expiresAt: response.session.expiresAt,
        createdAt: new Date().toISOString(),
      };
      saveBurslulukCandidateSession(nextSession);
      setSession(nextSession);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Giriş başarısız.');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-16 pt-[118px] sm:px-6 lg:px-12 lg:pt-[142px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(34,211,238,0.14),transparent_44%),radial-gradient(circle_at_84%_14%,rgba(217,46,39,0.22),transparent_36%),linear-gradient(138deg,#06050D_0%,#0A0C16_52%,#05070F_100%)]" />

      <div className="relative mx-auto w-full max-w-[820px] rounded-[28px] border border-white/14 bg-white/[0.06] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.44)] backdrop-blur-md sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[#E35347]">Bursluluk Sonuç</p>
        <h1 className="mt-3 text-[36px] font-semibold leading-tight text-white">Sınav Sonuç Ekranı</h1>

        {!session ? (
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onLoginAndLoad}>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Kullanıcı adı"
              className="rounded-xl border border-white/16 bg-[#0b1527]/84 px-4 py-3 text-white outline-none transition focus:border-[#E35347]"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Şifre"
              className="rounded-xl border border-white/16 bg-[#0b1527]/84 px-4 py-3 text-white outline-none transition focus:border-[#E35347]"
              required
            />
            <button
              type="submit"
              disabled={loggingIn}
              className="sm:col-span-2 inline-flex items-center justify-center rounded-xl bg-[#D92E27] px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#bf251f] disabled:opacity-60"
            >
              {loggingIn ? 'Doğrulanıyor...' : 'Sonucu Görüntüle'}
            </button>
          </form>
        ) : null}

        {loading ? <p className="mt-6 text-[14px] text-white/70">Sonuç verisi yükleniyor...</p> : null}
        {error ? <p className="mt-6 rounded-lg border border-[#f87171]/35 bg-[#7f1d1d]/30 px-3 py-2 text-[13px] text-[#fecaca]">{error}</p> : null}

        {hasResult && result ? (
          <div className="mt-7 space-y-4">
            <div className="grid gap-4 rounded-2xl border border-white/10 bg-[#0a1425]/78 p-5 sm:grid-cols-3">
              <div>
                <p className="text-[12px] text-white/50">Toplam Puan</p>
                <p className="mt-1 text-[32px] font-semibold text-white">{result.score}</p>
              </div>
              <div>
                <p className="text-[12px] text-white/50">Yüzde</p>
                <p className="mt-1 text-[32px] font-semibold text-white">%{result.percentage}</p>
              </div>
              <div>
                <p className="text-[12px] text-white/50">Seviye</p>
                <p className="mt-1 text-[24px] font-semibold text-white">{result.placement}</p>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-white/10 bg-[#0a1425]/78 p-5 text-[14px] text-white/74 sm:grid-cols-2">
              <p>Durum: <span className="font-semibold text-white">{statusLabel}</span></p>
              <p>Dil: <span className="font-semibold text-white">{result.language}</span></p>
              <p>Sınıf: <span className="font-semibold text-white">{result.grade ? `${result.grade}. sınıf` : '-'}</span></p>
              <p>Doğru / Yanlış: <span className="font-semibold text-white">{result.correct} / {result.wrong}</span></p>
              <p>Boş: <span className="font-semibold text-white">{result.unanswered}</span></p>
              <p>Son görüntüleme: <span className="font-semibold text-white">{result.viewedAt ? new Date(result.viewedAt).toLocaleString('tr-TR') : 'İlk görüntüleme'}</span></p>
            </div>

            <p className="rounded-xl border border-[#22c55e]/30 bg-[#052e16]/35 px-4 py-3 text-[13px] leading-6 text-[#bbf7d0]">
              Sonuç kaydı panelde <strong>result_viewed</strong> olarak işaretlenmiştir. Sonucunu görüntülemeyen adaylar
              için WhatsApp bot bilgilendirmesi operasyon panelinden takip edilir.
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-4 text-[13px] text-white/68">
          <Link to="/bursluluk/giris" className="hover:text-white">Aday giriş ekranı</Link>
          <Link to="/bursluluk-2026" className="hover:text-white">Başvuru sayfası</Link>
        </div>
      </div>
    </section>
  );
}
