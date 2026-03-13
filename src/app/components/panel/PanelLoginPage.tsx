import { useState, type FormEvent } from 'react';

type ApiResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  next_step?: string;
  session?: {
    password_reset_required?: boolean;
    force_password_reset?: boolean;
  };
  user?: {
    password_reset_required?: boolean;
    force_password_reset?: boolean;
  };
};

function normalizeMessage(payload: ApiResponse | null, fallback: string) {
  const message = String(payload?.message || '').trim();
  if (message) return message;
  const error = String(payload?.error || '').trim();
  if (error) return error;
  return fallback;
}

function readRequiresPasswordReset(payload: ApiResponse | null) {
  if (!payload) return false;
  if (String(payload.next_step || '').toLowerCase() === 'password_reset') return true;
  if (payload.session?.password_reset_required || payload.session?.force_password_reset) return true;
  if (payload.user?.password_reset_required || payload.user?.force_password_reset) return true;
  return false;
}

function resolveSafeNextPath() {
  const params = new URLSearchParams(window.location.search);
  const next = String(params.get('next') || '').trim();
  if (!next) return '/panel/dashboard';
  if (!next.startsWith('/panel/')) return '/panel/dashboard';
  return next;
}

async function readJsonSafe(response: Response) {
  try {
    return (await response.json()) as ApiResponse;
  } catch {
    return null;
  }
}

const inputClassName =
  'h-[58px] w-full rounded-2xl border border-[#1A273A] bg-[#020A16] px-5 text-[15px] text-white/90 outline-none transition placeholder:text-white/25 focus:border-[#2D4363] focus:ring-2 focus:ring-[#2D4363]/35';

export default function PanelLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const canSubmit = email.trim() && password && !isSubmitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setErrorMessage('');
    setSuccessMessage('');

    const promptValue = window.prompt('MFA kodu (6 hane)');
    const mfaCode = (promptValue || '').replace(/\D+/g, '').slice(0, 6);
    if (mfaCode.length !== 6) {
      setErrorMessage('Giriş için geçerli bir MFA kodu gereklidir.');
      return;
    }

    setIsSubmitting(true);

    try {
      const loginResponse = await fetch('/api/panel/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          password,
          mfaCode,
        }),
      });

      const loginPayload = await readJsonSafe(loginResponse);
      if (!loginResponse.ok || loginPayload?.ok === false) {
        setErrorMessage(normalizeMessage(loginPayload, 'Panel girişi başarısız.'));
        return;
      }

      const requiresPasswordReset = readRequiresPasswordReset(loginPayload);
      const targetPath = requiresPasswordReset ? '/panel/password-reset' : resolveSafeNextPath();
      setSuccessMessage(
        requiresPasswordReset
          ? 'Geçici şifre algılandı. Şifre yenileme ekranına yönlendiriliyorsunuz...'
          : 'Giriş başarılı. Operasyon paneline yönlendiriliyorsunuz...',
      );

      window.setTimeout(() => {
        window.location.assign(targetPath);
      }, 450);
    } catch {
      setErrorMessage('Ağ hatası nedeniyle giriş tamamlanamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-14 sm:px-6 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_2%_28%,rgba(110,17,30,0.35),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(22,75,90,0.22),transparent_34%),linear-gradient(160deg,#00020B_0%,#000918_45%,#02122A_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_0.7px,transparent_0.7px)] [background-size:13px_13px] opacity-[0.12]" />

      <div className="relative mx-auto mt-10 grid w-full max-w-[1020px] gap-5 lg:grid-cols-[0.95fr_1.15fr]">
        <aside className="rounded-[28px] border border-[#1A2535] bg-[#0A1323]/78 p-8 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm lg:p-9">
          <p className="text-[14px] font-semibold uppercase tracking-[0.23em] text-white/52">Teachera Ops</p>
          <h1 className="mt-3 text-[48px] font-semibold leading-[1.1] text-white sm:text-[50px]">Panel Girişi</h1>
          <p className="mt-4 text-[27px] leading-[1.9] text-white/45 sm:text-[20px]">
            Eğitim danışmanı, admin ve owner kullanıcılar tek operasyon yüzeyine bu ekrandan giriş yapar.
          </p>

          <div className="mt-7 space-y-3">
            <div className="rounded-[22px] border border-[#1A273A] bg-[#071021]/82 p-5">
              <p className="text-[13px] font-semibold uppercase tracking-[0.21em] text-white/45">Giriş Sonrası</p>
              <p className="mt-2 text-[25px] leading-[1.8] text-white/38 sm:text-[17px]">
                CRM/Mobikob inbox, bursluluk operasyonu, görevler ve ayar ekranları aynı panelde açılır.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#1A273A] bg-[#071021]/82 p-5">
              <p className="text-[23px] leading-[1.8] text-white/38 sm:text-[17px]">
                Geçici şifre ile giriş yapan kullanıcılar otomatik olarak şifre yenileme ekranına yönlendirilir.
              </p>
            </div>
          </div>
        </aside>

        <div className="rounded-[28px] border border-[#1A2535] bg-[#0A1323]/82 p-7 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8 lg:p-9">
          <p className="text-[14px] font-semibold uppercase tracking-[0.23em] text-white/52">Kimlik Doğrulama</p>
          <p className="mt-3 text-[25px] leading-[1.8] text-white/45 sm:text-[18px]">
            Size tanımlanan kullanıcı adı ve şifre ile giriş yapın.
          </p>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.2em] text-white/48">Kullanıcı Adı</span>
              <input
                autoComplete="email"
                className={inputClassName}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="aliye@teachera.com.tr"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.2em] text-white/48">Şifre</span>
              <input
                autoComplete="current-password"
                className={inputClassName}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                required
              />
            </label>

            <button
              className="mt-2 h-[58px] w-full rounded-2xl bg-[#CA3C35] px-4 text-[13px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#b4332d] disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={!canSubmit}
            >
              {isSubmitting ? 'GİRİŞ YAPILIYOR' : 'GİRİŞ YAP'}
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
      </div>
    </section>
  );
}
