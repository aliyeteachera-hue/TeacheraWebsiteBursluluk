import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MessageCircle, PhoneCall, Sparkles, Trophy } from 'lucide-react';
import { BURSLULUK_PACKAGE_LADDER, BURSLULUK_RESULT_RELEASE, BURSLULUK_ROUTES, BURSLULUK_SUPPORT } from '../../bursluluk/config';
import { getBurslulukMe, getBurslulukResults } from '../../bursluluk/client';
import { clearBurslulukAuthToken, readBurslulukAuthToken } from '../../bursluluk/storage';
import type { BurslulukMeResponse, BurslulukResult } from '../../bursluluk/types';
import { trackEvent } from '../../lib/analytics';
import { notifyError } from '../../lib/notifications';
import { BurslulukCandidateShell, BurslulukDataPanel } from './BurslulukCandidateShell';
import { BurslulukPrimaryButton, BurslulukSecondaryButton } from './BurslulukUi';

const RESULT_WAITING_ITEMS = [
  'Telefonunuz acik olsun. Sonuc duyurusu tek seferde SMS ile yapilir.',
  'Ayni kullanici adi ve sifre ile tekrar giris yaparak burs oraninizi goruntuleyebilirsiniz.',
  'Sonuc ekranindaki gorusme cagrisi ile en uygun programi hizla netlestirebilirsiniz.',
] as const;

export default function BurslulukResultPage() {
  const [token, setToken] = useState<string | null>(() => readBurslulukAuthToken());
  const [me, setMe] = useState<BurslulukMeResponse | null>(null);
  const [resultStatus, setResultStatus] = useState('not_ready');
  const [result, setResult] = useState<BurslulukResult | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!token) return;

    let ignore = false;
    const load = async () => {
      try {
        const [meResponse, resultResponse] = await Promise.all([getBurslulukMe(token), getBurslulukResults(token)]);
        if (ignore) return;
        setMe(meResponse);
        setResultStatus(resultResponse.resultStatus);
        setResult(resultResponse.result);
        if (resultResponse.result) {
          trackEvent('result_view', {
            application_code: meResponse.candidate.applicationCode,
            scholarship_rate: resultResponse.result.scholarshipRate,
            score: resultResponse.result.score,
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Sonuc bilgisi alinamadi.';
        if (!ignore) {
          setLoadError(message);
          clearBurslulukAuthToken();
          setToken(null);
          notifyError(message);
        }
      }
    };

    void load();
    return () => {
      ignore = true;
    };
  }, [token]);

  const recommendedPackage = useMemo(() => {
    if (!result) return BURSLULUK_PACKAGE_LADDER[0];
    return BURSLULUK_PACKAGE_LADDER.find((item) => item.id === getRecommendedPackageId(result.scholarshipRate)) || BURSLULUK_PACKAGE_LADDER[0];
  }, [result]);

  const alternativePackages = useMemo(
    () => BURSLULUK_PACKAGE_LADDER.filter((item) => item.id !== recommendedPackage.id),
    [recommendedPackage],
  );

  if (!token) {
    return (
      <BurslulukCandidateShell
        eyebrow="Sonuc Girisi"
        title="Sonucu goruntulemek icin tekrar giris yap."
        description="Sonuc SMS duyurusu geldikten sonra ayni kullanici adi ve sifre ile tekrar giris yapabilirsiniz."
      >
        <BurslulukDataPanel title="Giris Gerekli" className="max-w-[760px]">
          <BurslulukPrimaryButton href={BURSLULUK_ROUTES.login}>Sonuc Girisine Gec</BurslulukPrimaryButton>
        </BurslulukDataPanel>
      </BurslulukCandidateShell>
    );
  }

  if (loadError) {
    return (
      <BurslulukCandidateShell
        eyebrow="Sonuc Girisi"
        title="Sonuc bilgisi alinamadi."
        description={loadError}
      >
        <BurslulukDataPanel title="Tekrar Dene" className="max-w-[760px]">
          <BurslulukPrimaryButton href={BURSLULUK_ROUTES.login}>Giris Ekranina Don</BurslulukPrimaryButton>
        </BurslulukDataPanel>
      </BurslulukCandidateShell>
    );
  }

  return (
    <BurslulukCandidateShell
      eyebrow="Burs Sonucu"
      title={result ? 'Burs sonucun hazir.' : 'Sonuc aciklama asamasi devam ediyor.'}
      description={
        result
          ? 'Burada burs oranini, performans ozetini ve sana en uygun program yonlendirmesini gorebilirsin.'
          : BURSLULUK_RESULT_RELEASE.summary
      }
    >
      {!result ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)]">
          <BurslulukDataPanel title="Durum">
            <div className="rounded-[26px] border border-[#E70000]/16 bg-[#E70000]/10 p-6">
              <div className="flex items-center gap-3 text-[#FFD0D2]">
                <Sparkles size={16} />
                <p className="text-[11px] uppercase tracking-[0.18em]">Sonuc Durumu</p>
              </div>
              <h2 className="mt-4 font-['Neutraface_2_Text:Bold',sans-serif] text-[2rem] leading-[1.02] text-white">
                {resultStatus === 'awaiting_publication' ? 'Sonuclar son kontrol asamasinda.' : 'Toplu SMS aciklamasi bekleniyor.'}
              </h2>
              <p className="mt-4 max-w-[680px] text-[15px] leading-[1.8] text-white/74">
                Sonuc aciklama ani geldiginde once SMS ile bilgilendirileceksiniz. Ardindan bu ekrana donerek burs oraninizi goruntuleyebilirsiniz.
              </p>
            </div>
          </BurslulukDataPanel>

          <div className="space-y-6">
            <BurslulukDataPanel title="Hazir Ol">
              <div className="space-y-3">
                {RESULT_WAITING_ITEMS.map((item) => (
                  <InfoRow key={item} icon={<ArrowRight size={15} className="mt-1 shrink-0 text-[#E70000]" />}>
                    {item}
                  </InfoRow>
                ))}
              </div>
            </BurslulukDataPanel>

            <BurslulukDataPanel title="Destek">
              <p className="text-[14px] leading-[1.75] text-white/68">
                Sonuc aciklama aninda giris ya da sifre konusunda yardima ihtiyacin olursa destek ekibimiz hizla yonlendirme yapar.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <BurslulukSecondaryButton
                  href={BURSLULUK_SUPPORT.whatsappHref}
                  onClick={() =>
                    trackEvent('whatsapp_click', {
                      source: 'result_waiting_support',
                      href: BURSLULUK_SUPPORT.whatsappHref,
                      phone_number: BURSLULUK_SUPPORT.whatsappHref.replace('https://wa.me/', ''),
                      link_text: BURSLULUK_SUPPORT.whatsappLabel,
                    })
                  }
                >
                  <MessageCircle size={14} />
                  WhatsApp Destek
                </BurslulukSecondaryButton>
              </div>
            </BurslulukDataPanel>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.98fr)_minmax(340px,0.92fr)]">
          <div className="space-y-6">
            <BurslulukDataPanel title="Burs Ozeti">
              <div className="rounded-[26px] border border-[#E70000]/16 bg-[#E70000]/10 p-6">
                <div className="flex items-center gap-3 text-[#FFD0D2]">
                  <Trophy size={18} />
                  <p className="text-[11px] uppercase tracking-[0.18em]">Yayinlanan Burs Orani</p>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-[auto_1fr] md:items-end">
                  <p className="font-['Neutraface_2_Text:Bold',sans-serif] text-[4rem] leading-none text-white sm:text-[4.4rem]">
                    %{result.scholarshipRate}
                  </p>
                  <p className="max-w-[420px] text-[15px] leading-[1.8] text-white/74">
                    {result.summary}
                  </p>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <IdentityCard label="Ogrenci" value={me?.candidate.studentFullName || '-'} />
                  <IdentityCard label="Okul" value={me?.candidate.schoolName || '-'} />
                  <IdentityCard label="Sinif" value={String(me?.candidate.grade || '-')} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard label="Dogru" value={String(result.correctCount)} />
                <MetricCard label="Yanlis" value={String(result.wrongCount)} />
                <MetricCard label="Bos" value={String(result.unansweredCount)} />
                <MetricCard label="Basari" value={`%${result.percentage}`} />
              </div>
            </BurslulukDataPanel>

            <BurslulukDataPanel title="Kayit Gorusmesi">
              <p className="text-[14px] leading-[1.8] text-white/72">
                Burs oranin kayit gorusmesi boyunca referans alinir. En uygun program yapisini ve kalan detaylari hizla netlestirmek icin destek ekibimizle gorusme planlayabilirsin.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <BurslulukPrimaryButton
                  href={BURSLULUK_SUPPORT.whatsappHref}
                  onClick={() =>
                    trackEvent('booking_cta_click', {
                      application_code: me?.candidate.applicationCode,
                      source: 'result_primary',
                      channel: 'whatsapp',
                    })
                  }
                >
                  Kayit Gorusmesi Planla
                </BurslulukPrimaryButton>
                <BurslulukSecondaryButton
                  href={BURSLULUK_SUPPORT.phoneHref}
                  onClick={() =>
                    trackEvent('booking_cta_click', {
                      application_code: me?.candidate.applicationCode,
                      source: 'result_secondary',
                      channel: 'phone',
                    })
                  }
                >
                  <PhoneCall size={14} />
                  {BURSLULUK_SUPPORT.phoneLabel}
                </BurslulukSecondaryButton>
              </div>
            </BurslulukDataPanel>
          </div>

          <div className="space-y-6">
            <BurslulukDataPanel title="Size Onerilen Program">
              <div className="rounded-[24px] border border-[#E70000]/24 bg-[linear-gradient(180deg,rgba(231,0,0,0.14)_0%,rgba(231,0,0,0.06)_100%)] p-5">
                <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#FFD0D2]">
                  <Sparkles size={14} />
                  Onerilen Yol
                </div>
                <h3 className="mt-4 font-['Neutraface_2_Text:Bold',sans-serif] text-[2rem] leading-[1.02] text-white">
                  {recommendedPackage.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.8] text-white/72">{recommendedPackage.subtitle}</p>
                <div className="mt-5 space-y-3">
                  {recommendedPackage.bullets.map((bullet) => (
                    <InfoRow key={bullet} icon={<ArrowRight size={15} className="mt-1 shrink-0 text-[#FFD0D2]" />}>
                      {bullet}
                    </InfoRow>
                  ))}
                </div>
              </div>
            </BurslulukDataPanel>

            <BurslulukDataPanel title="Diger Paketler">
              <div className="space-y-4">
                {alternativePackages.map((item) => (
                  <div key={item.id} className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Alternatif</p>
                    <h4 className="mt-3 font-['Neutraface_2_Text:Bold',sans-serif] text-[1.3rem] text-white">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-[14px] leading-[1.75] text-white/64">{item.subtitle}</p>
                  </div>
                ))}
              </div>
            </BurslulukDataPanel>
          </div>
        </div>
      )}
    </BurslulukCandidateShell>
  );
}

function IdentityCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">{label}</p>
      <p className="mt-2 text-[14px] leading-[1.65] text-white/84">{value}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">{label}</p>
      <p className="mt-2 text-[1.35rem] font-['Neutraface_2_Text:Bold',sans-serif] text-white">{value}</p>
    </div>
  );
}

function InfoRow({
  children,
  icon,
}: {
  children: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4 text-[14px] leading-[1.75] text-white/72">
      {icon}
      <span>{children}</span>
    </div>
  );
}

function getRecommendedPackageId(rate: number) {
  if (rate >= 60) return 'mastery';
  if (rate >= 40) return 'accelerate';
  return 'core';
}
