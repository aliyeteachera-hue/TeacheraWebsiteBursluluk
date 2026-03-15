import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { loginCandidate } from '../../api/examApi';
import {
  readBurslulukApplicationRecord,
  saveBurslulukCandidateSession,
} from './burslulukFlowSession';

export default function BurslulukCandidateLoginPage() {
  const navigate = useNavigate();
  const application = readBurslulukApplicationRecord();

  const [username, setUsername] = useState(application?.applicationNo || '');
  const [password, setPassword] = useState(application?.sessionToken || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => username.trim().length >= 6 && password.trim().length >= 6, [username, password]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await loginCandidate(username.trim(), password.trim(), '2026_BURSLULUK');
      saveBurslulukCandidateSession({
        applicationNo: response.session.applicationNo,
        sessionToken: response.session.sessionToken,
        attemptId: response.session.attemptId,
        candidateId: response.session.candidateId,
        examLanguage: response.session.examLanguage,
        examAgeRange: response.session.examAgeRange,
        questionCount: Number(response.session.questionCount || 20),
        expiresAt: response.session.expiresAt,
      });

      if (response.gate?.exam_open) {
        navigate('/bursluluk/sinav');
        return;
      }

      navigate('/bursluluk/bekleme');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Giriş başarısız. Bilgileri kontrol edip tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-16 pt-[118px] sm:px-6 lg:px-12 lg:pt-[142px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_14%,rgba(60,122,255,0.16),transparent_46%),radial-gradient(circle_at_84%_16%,rgba(217,46,39,0.22),transparent_36%),linear-gradient(138deg,#06050D_0%,#0A0C16_52%,#05070F_100%)]" />

      <div className="relative mx-auto w-full max-w-[560px] rounded-[28px] border border-white/14 bg-white/[0.06] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.44)] backdrop-blur-md sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[#E35347]">Aday Giriş</p>
        <h1 className="mt-3 text-[34px] font-semibold leading-tight text-white">Bursluluk Sınavı Girişi</h1>
        <p className="mt-3 text-[14px] leading-7 text-white/70">
          SMS ile gelen <span className="font-semibold text-white/90">kullanıcı adı</span> ve <span className="font-semibold text-white/90">şifre</span> ile giriş yapın.
          Sınav saati gelmediyse bekleme ekranına yönlendirileceksiniz.
        </p>

        <form className="mt-7 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-[13px] font-medium text-white/84">Kullanıcı Adı</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Örn: 20260315-101673"
              className="w-full rounded-xl border border-white/16 bg-[#0b1527]/84 px-4 py-3 text-white outline-none transition focus:border-[#E35347]"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-[13px] font-medium text-white/84">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="SMS ile gönderilen şifre"
              className="w-full rounded-xl border border-white/16 bg-[#0b1527]/84 px-4 py-3 text-white outline-none transition focus:border-[#E35347]"
              required
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-[#f87171]/35 bg-[#7f1d1d]/30 px-3 py-2 text-[13px] text-[#fecaca]">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D92E27] px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#bf251f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-[13px] text-white/65">
          <Link to="/bursluluk/onay" className="hover:text-white">Onay ekranına dön</Link>
          <Link to="/bursluluk-2026" className="hover:text-white">Başvuru sayfasına dön</Link>
        </div>
      </div>
    </section>
  );
}
