import { useEffect, useState, type FormEvent } from 'react';
import { panelFetch } from '../../api/panelApi';

async function readJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

const inputClassName =
  'h-[56px] w-full rounded-2xl border border-[#1A273A] bg-[#020A16] px-5 text-[15px] text-white/90 outline-none transition placeholder:text-white/25 focus:border-[#2D4363] focus:ring-2 focus:ring-[#2D4363]/35';

export default function PanelPasswordResetPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      try {
        const response = await panelFetch('/api/panel/auth/me', {
          method: 'GET',
        });
        if (!cancelled && (response.status === 401 || response.status === 403)) {
          window.location.assign('/panel/login?next=/panel/password-reset');
        }
      } catch {
        if (!cancelled) {
          window.location.assign('/panel/login?next=/panel/password-reset');
        }
      }
    };

    void verifySession();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword.length < 10) {
      setErrorMessage('Yeni şifre en az 10 karakter olmalıdır.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Şifre tekrarı eşleşmiyor.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await panelFetch('/api/panel/auth/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          newPassword,
        }),
      });

      const payload = await readJsonSafe(response);
      if (response.status === 404) {
        setErrorMessage('Şifre yenileme API endpointi henüz aktif değil. Backend endpointi açıldığında bu ekran doğrudan çalışacaktır.');
        return;
      }

      if (!response.ok) {
        const message = String(payload?.message || payload?.error || 'Şifre yenileme başarısız.');
        setErrorMessage(message);
        return;
      }

      setSuccessMessage('Şifreniz güncellendi. Dashboard ekranına yönlendiriliyorsunuz...');
      window.setTimeout(() => {
        window.location.assign('/panel/dashboard');
      }, 700);
    } catch {
      setErrorMessage('Ağ hatası nedeniyle şifre yenileme tamamlanamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-14 sm:px-6 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_4%_26%,rgba(110,17,30,0.35),transparent_34%),radial-gradient(circle_at_84%_12%,rgba(22,75,90,0.24),transparent_34%),linear-gradient(160deg,#00020B_0%,#000918_45%,#02122A_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_0.7px,transparent_0.7px)] [background-size:13px_13px] opacity-[0.12]" />

      <div className="relative mx-auto mt-10 w-full max-w-[760px] rounded-[28px] border border-[#1A2535] bg-[#0A1323]/82 p-7 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8 lg:p-9">
        <p className="text-[14px] font-semibold uppercase tracking-[0.23em] text-white/52">Teachera Ops</p>
        <h1 className="mt-3 text-[42px] font-semibold leading-[1.1] text-white sm:text-[46px]">Şifre Yenileme</h1>
        <p className="mt-3 text-[17px] leading-[1.8] text-white/52">
          Geçici şifre ile giriş yaptığınız için yeni şifre belirlemeniz gerekiyor.
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.2em] text-white/48">Yeni Şifre</span>
            <input
              autoComplete="new-password"
              className={inputClassName}
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="En az 10 karakter"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.2em] text-white/48">Yeni Şifre (Tekrar)</span>
            <input
              autoComplete="new-password"
              className={inputClassName}
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Şifreyi tekrar girin"
              required
            />
          </label>

          <button
            className="mt-2 h-[56px] w-full rounded-2xl bg-[#CA3C35] px-4 text-[13px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#b4332d] disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'KAYDEDİLİYOR' : 'ŞİFREYİ GÜNCELLE'}
          </button>
        </form>

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-[#6F2824] bg-[#2B1214]/80 px-4 py-3 text-[14px] text-[#FFB8B1]">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="mt-4 rounded-xl border border-[#1E5A4C] bg-[#0F2C27]/80 px-4 py-3 text-[14px] text-[#9FE4D0]">
            {successMessage}
          </p>
        ) : null}
      </div>
    </section>
  );
}
