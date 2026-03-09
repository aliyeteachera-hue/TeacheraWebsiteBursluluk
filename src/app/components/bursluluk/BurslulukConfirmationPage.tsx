import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, KeyRound, MessageCircle, PhoneCall, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { getBurslulukApplication } from '../../bursluluk/client';
import { BURSLULUK_ROUTES, BURSLULUK_SUPPORT, BURSLULUK_TECHNICAL_CHECKLIST } from '../../bursluluk/config';
import { readLastBurslulukApplication } from '../../bursluluk/storage';
import type { BurslulukApplicationSummary } from '../../bursluluk/types';
import { notifyError } from '../../lib/notifications';
import { BurslulukCandidateShell, BurslulukDataPanel } from './BurslulukCandidateShell';
import { BurslulukPrimaryButton, BurslulukSecondaryButton } from './BurslulukUi';

const CONFIRMATION_NOTES = [
  'Başvuru tamamlanınca başvuru kodun oluşur ve ekranında görünür.',
  'PDF sınav giriş belgeni indirip saklayabilirsin.',
  'Sınav günü aynı kullanıcı adı ve şifre ile giriş yaparak oturumuna katılırsın.',
  'Sonuçlar açıklandığında yine aynı bilgilerle burs sonucunu görüntülersin.',
] as const;

const EXAM_RULES = [
  'Sınav boyunca tek başına ilerlemeli, başka bir kişiden yardım almamalısın.',
  'Kopya, yönlendirme veya dış destek tespit edilirse kurum sonucu yeniden değerlendirebilir.',
  'Sınav esnasında bağlantın koparsa aynı bilgilerle tekrar giriş yaparak devam etmeyi dene.',
  'Sınav süresi boyunca dikkatini dağıtacak uygulama ve bildirimleri kapatman önerilir.',
] as const;

export default function BurslulukConfirmationPage() {
  const [searchParams] = useSearchParams();
  const [storedApplication] = useState<BurslulukApplicationSummary | null>(() => readLastBurslulukApplication());
  const [application, setApplication] = useState<BurslulukApplicationSummary | null>(storedApplication);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const code = searchParams.get('code')?.trim() || application?.applicationCode || '';

  useEffect(() => {
    if (!code) {
      setLoadError('Başvuru kodu bulunamadı.');
      return;
    }

    let ignore = false;
    setIsLoading(true);
    void getBurslulukApplication(code)
      .then((response) => {
        if (!ignore) {
          setApplication((current) => ({
            ...current,
            ...response.application,
          }));
          setLoadError('');
        }
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Başvuru bilgileri yüklenemedi.';
        if (!ignore) {
          if (!storedApplication || storedApplication.applicationCode !== code) {
            setLoadError(message);
          }
          notifyError(message);
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [code, storedApplication]);

  return (
    <BurslulukCandidateShell
      eyebrow="Başvuru Onayı"
      title="Başvurun tamamlandı."
      description="Başvuru kodun, giriş bilgin ve sınav giriş belgen hazır. Aşağıdaki alanlardan bilgilerini kontrol edip PDF belgeni indirebilirsin."
      backHref={BURSLULUK_ROUTES.landing}
    >
      {loadError ? (
        <BurslulukDataPanel title="Bilgi Hatası" className="max-w-[760px]">
          <p className="text-[15px] leading-[1.8] text-white/72">{loadError}</p>
          <div className="mt-5">
            <BurslulukPrimaryButton href={BURSLULUK_ROUTES.landing}>
              Başvuru Sayfasına Dön
            </BurslulukPrimaryButton>
          </div>
        </BurslulukDataPanel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.82fr)] lg:gap-8">
          <div className="space-y-6">
            <BurslulukDataPanel title="Başvuru ve Belge">
              {isLoading && !application ? (
                <p className="text-[15px] leading-[1.8] text-white/58">Başvuru bilgileri yükleniyor...</p>
              ) : application ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SummaryCard label="Başvuru Kodu" value={application.applicationCode} />
                    <SummaryCard label="Oturum" value={application.sessionLabel || '-'} />
                    <SummaryCard label="Öğrenci" value={application.studentFullName || '-'} />
                    <SummaryCard label="Okul" value={application.schoolName} />
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <div className="flex items-center gap-3 text-white">
                      <Download size={17} className="text-[#E70000]" />
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/56">PDF Sınav Giriş Belgesi</p>
                    </div>

                    <p className="mt-4 text-[14px] leading-[1.75] text-white/72">
                      Başvuru tamamlandığında sınav giriş belgen oluşur. Belgeyi indirip sınav gününe kadar saklaman önerilir.
                    </p>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <BurslulukPrimaryButton
                        href={`/api/bursluluk/entry-document?code=${encodeURIComponent(application.applicationCode)}`}
                        className="w-full sm:w-auto"
                      >
                        PDF Belgesini İndir
                      </BurslulukPrimaryButton>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-[#324D47]/28 bg-[linear-gradient(180deg,rgba(50,77,71,0.36)_0%,rgba(50,77,71,0.16)_100%)] p-5 sm:p-6">
                    <div className="flex items-center gap-3 text-[#E2F1EC]">
                      <KeyRound size={17} />
                      <p className="text-[11px] uppercase tracking-[0.18em]">Giriş Bilgileri</p>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <SummaryCard label="Kullanıcı Adı" value={application.username || '-'} emphasis />
                      <SummaryCard label="Şifre" value={application.password || 'SMS ile gönderildi'} emphasis />
                    </div>

                    <p className="mt-4 text-[13px] leading-[1.75] text-[#E2F1EC]/78">
                      Bu bilgiler sınav günü giriş için kullanılacaktır. Sonuçlar açıklandığında da aynı bilgiler geçerlidir.
                    </p>
                  </div>
                </div>
              ) : null}
            </BurslulukDataPanel>

            <BurslulukDataPanel title="Başvuru Sonrası">
              <div className="space-y-3">
                {CONFIRMATION_NOTES.map((item) => (
                  <StepRow key={item} text={item} />
                ))}
              </div>
            </BurslulukDataPanel>
          </div>

          <div className="space-y-6 lg:pt-[5.2rem]">
            <BurslulukDataPanel title="Sınava Giriş ve Teknik Öneriler" className="lg:sticky lg:top-28">
              <div className="space-y-3">
                {BURSLULUK_TECHNICAL_CHECKLIST.map((item) => (
                  <StepRow key={item} text={item} />
                ))}
              </div>

              <div className="mt-6 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={16} className="text-[#E70000]" />
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/46">Sınav Esnasında Dikkat</p>
                </div>
                <div className="mt-4 space-y-3">
                  {EXAM_RULES.map((item) => (
                    <StepRow key={item} text={item} icon="alert" />
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-[#E70000]" />
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/46">Sonraki Adım</p>
                </div>
                <p className="mt-3 text-[14px] leading-[1.75] text-white/70">
                  Bilgilerini not ettiysen giriş ekranına geçebilirsin. Bilgilerini kaybettiysen destek ekibiyle hemen iletişime geçebilirsin.
                </p>

                <div className="mt-5 flex flex-col gap-3">
                  <BurslulukPrimaryButton href={BURSLULUK_ROUTES.login} className="w-full">
                    Giriş Ekranına Geç
                  </BurslulukPrimaryButton>
                  <BurslulukSecondaryButton href={BURSLULUK_SUPPORT.whatsappHref}>
                    <MessageCircle size={14} />
                    WhatsApp Destek
                  </BurslulukSecondaryButton>
                  <BurslulukSecondaryButton href={BURSLULUK_SUPPORT.phoneHref}>
                    <PhoneCall size={14} />
                    {BURSLULUK_SUPPORT.phoneLabel}
                  </BurslulukSecondaryButton>
                </div>
              </div>
            </BurslulukDataPanel>
          </div>
        </div>
      )}
    </BurslulukCandidateShell>
  );
}

function SummaryCard({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">{label}</p>
      <p
        className={`mt-2 break-words text-[15px] leading-[1.55] ${
          emphasis ? "font-['Neutraface_2_Text:Bold',sans-serif] text-white" : 'text-white/82'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StepRow({
  text,
  icon,
}: {
  text: string;
  icon?: 'check' | 'alert';
}) {
  const Icon = icon === 'alert' ? AlertTriangle : CheckCircle2;

  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4 text-[14px] leading-[1.75] text-white/72">
      <Icon size={15} className="mt-1 shrink-0 text-[#E70000]" />
      <span>{text}</span>
    </div>
  );
}
