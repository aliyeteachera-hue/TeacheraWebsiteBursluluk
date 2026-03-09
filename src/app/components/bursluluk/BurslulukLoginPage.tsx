import { useState } from 'react';
import { KeyRound, LockKeyhole, MessageCircle, Phone, RefreshCw, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router';
import { loginBursluluk, requestBurslulukPasswordReset } from '../../bursluluk/client';
import { formatBirthYear, formatIdentityNumber } from '../../bursluluk/helpers';
import { BURSLULUK_ROUTES, BURSLULUK_SUPPORT } from '../../bursluluk/config';
import { saveBurslulukAuthToken } from '../../bursluluk/storage';
import { notifyError, notifySuccess } from '../../lib/notifications';
import { trackEvent } from '../../lib/analytics';
import { useFormSubmission } from '../../lib/useFormSubmission';
import { FORM_UI_MESSAGES } from '../../lib/formUiMessages';
import { isValidTrMobilePhone, normalizeTrMobileInput, TR_MOBILE_PATTERN, TR_MOBILE_TITLE } from '../phoneUtils';
import { BurslulukCandidateShell } from './BurslulukCandidateShell';
import { BurslulukPanel, BurslulukPrimaryButton, BurslulukSecondaryButton } from './BurslulukUi';

const INPUT_CLASS_NAME =
  "h-[48px] w-full rounded-[18px] border border-white/10 bg-[#ffffff]/[0.06] px-4 text-[14px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#E70000]/55";

const LOGIN_STEPS = [
  'SMS ile gelen kullanıcı adı ve şifre ile giriş yap.',
  'Sınav saati gelmediyse bekleme ekranına yönlendirilirsin.',
  'Aynı bilgilerle sonuç ekranına tekrar giriş yapabilirsin.',
] as const;

export default function BurslulukLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [resetNationalId, setResetNationalId] = useState('');
  const [resetBirthYear, setResetBirthYear] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetPreviewUsername, setResetPreviewUsername] = useState('');
  const [resetPreviewPassword, setResetPreviewPassword] = useState('');
  const [showReset, setShowReset] = useState(false);
  const {
    isSubmitting,
    fieldError,
    submitError,
    setFieldError,
    setSubmitError,
    clearErrors,
    runSubmission,
  } = useFormSubmission({ defaultSubmitErrorMessage: FORM_UI_MESSAGES.submitFailed });

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    clearErrors();

    if (!username.trim() || !password.trim()) {
      setFieldError(FORM_UI_MESSAGES.required);
      return;
    }

    const success = await runSubmission(async () => {
      try {
        const response = await loginBursluluk(username.trim(), password.trim());
        saveBurslulukAuthToken(response.token);
        trackEvent('exam_login', {
          application_code: response.candidate.applicationCode,
          session_id: response.candidate.sessionId,
          exam_status: response.candidate.examStatus,
          result_status: response.candidate.resultStatus,
        });
        notifySuccess('Giriş başarılı. Oturum alanına yönlendiriliyorsunuz.');

        if (response.candidate.resultStatus === 'published' || response.candidate.examStatus === 'completed') {
          navigate(BURSLULUK_ROUTES.result);
          return true;
        }

        if (response.candidate.examStatus === 'in_progress') {
          navigate(BURSLULUK_ROUTES.exam);
          return true;
        }

        navigate(BURSLULUK_ROUTES.waiting);
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Giriş başarısız.';
        setSubmitError(message);
        notifyError(message);
        return false;
      }
    });

    if (!success) return;
  };

  const handleReset = async () => {
    clearErrors();

    if (formatIdentityNumber(resetNationalId).length !== 11 || formatBirthYear(resetBirthYear).length !== 4 || !isValidTrMobilePhone(resetPhone)) {
      setFieldError('Şifre yenilemek için T.C. kimlik no, doğum yılı ve veli telefonunu eksiksiz girin.');
      return;
    }

    try {
      const response = await requestBurslulukPasswordReset(
        formatIdentityNumber(resetNationalId),
        formatBirthYear(resetBirthYear),
        `+90 ${resetPhone}`,
      );
      setResetPreviewUsername(response.username || '');
      setResetPreviewPassword(response.password || '');
      notifySuccess(
        response.password
          ? 'Geliştirme önizlemesi oluşturuldu. Giriş bilgileri aşağıda gösteriliyor.'
          : 'Şifre yenileme isteği alındı. Kullanıcı adı ve yeni şifre doğrulanan telefonunuza SMS olarak gönderildi.',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Şifre yenileme isteği oluşturulamadı.';
      setSubmitError(message);
      notifyError(message);
    }
  };

  return (
    <BurslulukCandidateShell>
      <div className="mx-auto w-full max-w-[1040px]">
        <BurslulukPanel className="overflow-hidden p-0">
          <div className="grid lg:grid-cols-[minmax(0,1.12fr)_minmax(300px,0.88fr)]">
            <div className="p-5 sm:p-6 md:p-8 lg:p-10">
              <div className="flex items-center gap-3">
                <div className="h-[2px] w-7 bg-[#E70000]" />
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#E70000] sm:text-[11px]">
                  Bursluluk Sınavı Giriş
                </p>
              </div>

              <p className="mt-4 max-w-[560px] text-[15px] leading-[1.8] text-white/68">
                SMS ile gelen kullanıcı adı ve şifreyi doğrudan kullanabilirsin. Bilgilerini bulamıyorsan, şifremi yenile kısmında şifreni yeniden alabilirsin.
              </p>

              <form onSubmit={handleLogin} className="mt-7 space-y-4 sm:mt-8" data-form-id="bursluluk_login_form">
                <label className="flex flex-col gap-2">
                  <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/46">
                    <KeyRound size={14} className="text-[#E70000]" />
                    Kullanıcı Adı
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(inputEvent) => setUsername(inputEvent.target.value)}
                    placeholder="SMS ile iletilen kullanıcı adı"
                    className={INPUT_CLASS_NAME}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/46">
                    <LockKeyhole size={14} className="text-[#E70000]" />
                    Şifre
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(inputEvent) => setPassword(inputEvent.target.value)}
                    placeholder="Şifrenizi girin"
                    className={INPUT_CLASS_NAME}
                  />
                </label>

                {(fieldError || submitError) ? (
                  <div className="rounded-[18px] border border-[#E70000]/20 bg-[#E70000]/10 px-4 py-3 text-[13px] leading-[1.7] text-[#FFD0D2]">
                    {fieldError || submitError}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <BurslulukPrimaryButton type="submit" className="sm:min-w-[220px]">
                    {isSubmitting ? 'Giriş Yapılıyor' : 'Giriş Yap'}
                  </BurslulukPrimaryButton>
                  <button
                    type="button"
                    onClick={() => setShowReset((current) => !current)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/10 px-4 text-left text-[12px] uppercase tracking-[0.16em] text-white/58 transition-colors hover:border-white/18 hover:text-white/80"
                  >
                    <RefreshCw size={14} className="text-[#E70000]" />
                    Şifremi yenile
                  </button>
                </div>
              </form>

              {showReset ? (
                <div className="mt-6 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <RefreshCw size={15} className="text-[#E70000]" />
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/46">Şifre Yenileme</p>
                  </div>

                  <div className="mt-4 grid gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/46">
                        <KeyRound size={14} className="text-[#E70000]" />
                        T.C. Kimlik No
                      </span>
                      <input
                        type="text"
                        value={resetNationalId}
                        onChange={(inputEvent) => setResetNationalId(formatIdentityNumber(inputEvent.target.value))}
                        inputMode="numeric"
                        maxLength={11}
                        placeholder="Öğrenci T.C. kimlik no"
                        className={INPUT_CLASS_NAME}
                      />
                    </label>

                    <div className="grid gap-4 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                      <label className="flex flex-col gap-2">
                        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/46">
                          <RefreshCw size={14} className="text-[#E70000]" />
                          Doğum Yılı
                        </span>
                        <input
                          type="text"
                          value={resetBirthYear}
                          onChange={(inputEvent) => setResetBirthYear(formatBirthYear(inputEvent.target.value))}
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="Örn. 2014"
                          className={INPUT_CLASS_NAME}
                        />
                      </label>

                      <label className="flex flex-col gap-2">
                        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/46">
                          <Phone size={14} className="text-[#E70000]" />
                          Veli Telefon
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="inline-flex h-[48px] min-w-[70px] items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.06] text-[13px] text-white/78">
                            +90
                          </div>
                          <input
                            type="tel"
                            value={resetPhone}
                            onChange={(inputEvent) => setResetPhone(normalizeTrMobileInput(inputEvent.target.value))}
                            inputMode="numeric"
                            maxLength={13}
                            pattern={TR_MOBILE_PATTERN}
                            title={TR_MOBILE_TITLE}
                            placeholder="5XX XXX XX XX"
                            className={INPUT_CLASS_NAME}
                          />
                        </div>
                      </label>
                    </div>

                    <p className="text-[13px] leading-[1.75] text-white/58">
                      Doğrulama başarılı olursa mevcut kullanıcı adı ve yeni şifre doğrulanan telefon numarasına SMS olarak gönderilir. Geliştirme önizlemesinde ayrıca burada da gösterilir.
                    </p>

                    <div>
                      <BurslulukSecondaryButton onClick={handleReset}>
                        <RefreshCw size={14} />
                        Şifreyi Yenile
                      </BurslulukSecondaryButton>
                    </div>

                    {resetPreviewPassword ? (
                      <div className="rounded-[18px] border border-[#E70000]/16 bg-[#E70000]/10 px-4 py-3 text-[13px] leading-[1.7] text-[#FFD0D2]">
                        Geliştirme önizlemesi:
                        {' '}
                        kullanıcı adı <strong className="text-white">{resetPreviewUsername || '-'}</strong>
                        {' '}
                        /
                        {' '}
                        yeni şifre <strong className="text-white">{resetPreviewPassword}</strong>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(50,77,71,0.18)_100%)] p-5 sm:p-6 md:p-8 lg:border-l lg:border-t-0 lg:p-8">
              <div className="flex items-center gap-3">
                <div className="h-[2px] w-6 bg-[#E70000]" />
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">Nasıl İşler</p>
              </div>

              <div className="mt-4 space-y-3 sm:mt-5">
                {LOGIN_STEPS.map((note, index) => (
                  <div
                    key={note}
                    className="flex items-start gap-4 rounded-[20px] border border-white/10 bg-[#0D1218]/55 px-4 py-4 text-[14px] leading-[1.7] text-white/74"
                  >
                    <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E70000]/24 bg-[#E70000]/12 text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#FFD7D8]">
                      0{index + 1}
                    </div>
                    <span>{note}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[24px] border border-white/10 bg-[#0C1117]/70 p-5 sm:mt-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={15} className="text-[#E70000]" />
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/46">Anlık Destek</p>
                </div>
                <p className="mt-3 text-[14px] leading-[1.75] text-white/68">
                  Girişte sorun yaşarsan ekip anlık olarak destek verir. Öncelik WhatsApp hattında, ardından telefon desteğinde.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <SupportLinkCard
                    href={BURSLULUK_SUPPORT.whatsappHref}
                    icon={<MessageCircle size={16} />}
                    label="WhatsApp"
                    value="Hızlı Destek Hattı"
                    accentClassName="border-[#1FAF67]/20 bg-[#1FAF67]/10 text-[#E7FFF3]"
                  />
                  <SupportLinkCard
                    href={BURSLULUK_SUPPORT.phoneHref}
                    icon={<Phone size={16} />}
                    label="Telefon"
                    value={BURSLULUK_SUPPORT.phoneLabel}
                    accentClassName="border-white/10 bg-white/[0.04] text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </BurslulukPanel>
      </div>
    </BurslulukCandidateShell>
  );
}

function SupportLinkCard({
  href,
  icon,
  label,
  value,
  accentClassName,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  accentClassName: string;
}) {
  return (
    <a
      href={href}
      className={`flex min-h-[74px] w-full items-center gap-3 rounded-[20px] border px-4 py-4 text-left transition-colors hover:bg-white/[0.08] ${accentClassName}`}
    >
      <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-current/12 bg-black/10">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.14em] text-current/68">{label}</p>
        <p className="mt-1 font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] leading-[1.45] text-current">{value}</p>
      </div>
    </a>
  );
}
