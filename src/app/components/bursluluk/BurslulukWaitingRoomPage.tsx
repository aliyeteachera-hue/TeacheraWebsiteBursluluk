import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { ArrowRight, Clock3, MessageCircle, PhoneCall, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { getBurslulukMe } from '../../bursluluk/client';
import { BURSLULUK_ROUTES, BURSLULUK_SUPPORT } from '../../bursluluk/config';
import { formatCountdown, getSessionWindowStatus } from '../../bursluluk/helpers';
import { clearBurslulukAuthToken, readBurslulukAuthToken } from '../../bursluluk/storage';
import type { BurslulukMeResponse } from '../../bursluluk/types';
import { trackEvent } from '../../lib/analytics';
import { notifyError } from '../../lib/notifications';
import { BurslulukCandidateShell, BurslulukDataPanel } from './BurslulukCandidateShell';
import { BurslulukPrimaryButton, BurslulukSecondaryButton } from './BurslulukUi';

const PREP_ITEMS = [
  'Oturum saatinden en az 10 dakika once giris yapmis olun.',
  'Tek cihaz ve guncel bir tarayici kullanmaniz sinav akisini daha guvenli hale getirir.',
  'Kullanici adi ve sifrenizi sinav bitene kadar ulasilabilir bir yerde tutun.',
] as const;

const EXAM_ITEMS = [
  'Baglanti kesilirse ayni bilgilerle tekrar giris yaparak devam etmeyi deneyin.',
  'Sinav bireysel katilim esasina gore yapilir; dis destek alinmamasi gerekir.',
  'Sinav bitiminde sonuc hemen aciklanmaz, sonraki bilgilendirme SMS ile yapilir.',
] as const;

export default function BurslulukWaitingRoomPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => readBurslulukAuthToken());
  const [payload, setPayload] = useState<BurslulukMeResponse | null>(null);
  const [loadError, setLoadError] = useState('');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!token) return;

    let ignore = false;
    const load = async () => {
      try {
        const response = await getBurslulukMe(token);
        if (!ignore) {
          setPayload(response);
          setLoadError('');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Oturum bilgisi alinamadi.';
        if (!ignore) {
          setLoadError(message);
          clearBurslulukAuthToken();
          setToken(null);
          notifyError(message);
        }
      }
    };

    void load();
    const pollId = window.setInterval(() => {
      void load();
      setNow(new Date());
    }, 20000);

    return () => {
      ignore = true;
      window.clearInterval(pollId);
    };
  }, [token]);

  useEffect(() => {
    if (!payload) return;
    if (payload.candidate.resultStatus === 'published' || payload.candidate.examStatus === 'submitted') {
      navigate(BURSLULUK_ROUTES.result);
      return;
    }
    if (payload.candidate.examStatus === 'in_progress') {
      navigate(BURSLULUK_ROUTES.exam);
    }
  }, [navigate, payload]);

  if (!token) {
    return (
      <BurslulukCandidateShell
        eyebrow="Bekleme Alani"
        title="Bu alani gormek icin once giris yapmalisin."
        description="Basvuru sonrasi SMS ile paylasilan kullanici adi ve sifre ile giris yaparak bekleme ekranina ulasabilirsin."
      >
        <BurslulukDataPanel title="Giris Gerekli" className="max-w-[760px]">
          <p className="text-[15px] leading-[1.8] text-white/72">
            Aktif bir bursluluk oturumu bulunamadi. Once giris ekranina donerek oturumunu ac.
          </p>
          <div className="mt-5">
            <BurslulukPrimaryButton href={BURSLULUK_ROUTES.login}>
              Aday Girisine Gec
            </BurslulukPrimaryButton>
          </div>
        </BurslulukDataPanel>
      </BurslulukCandidateShell>
    );
  }

  const sessionStatus =
    payload?.session ? getSessionWindowStatus(payload.session.startsAt, payload.session.endsAt, now) : 'unknown';
  const countdownTarget =
    sessionStatus === 'waiting'
      ? payload?.session?.startsAt || ''
      : sessionStatus === 'open'
        ? payload?.session?.endsAt || ''
        : '';
  const canStart = payload?.candidate.examStatus === 'available' || sessionStatus === 'open';
  const isMissed = payload?.candidate.examStatus === 'missed';

  return (
    <BurslulukCandidateShell
      eyebrow="Sinav Gunu"
      title={canStart ? 'Oturumunuz acildi. Sinava simdi baslayabilirsiniz.' : 'Oturumunuz hazir. Sinav saati geldiginde buradan ilerleyeceksiniz.'}
      description={
        canStart
          ? 'Hazirliklar tamamlandi. Ortaminizi kontrol edip sinav ekranina gecebilirsiniz.'
          : 'Bu alan, sinav baslayana kadar durumunuzu takip etmeniz ve son hazirliklari tamamlamaniz icin acik tutulur.'
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.06fr)_minmax(320px,0.82fr)] lg:gap-8">
        <div className="space-y-6">
          <BurslulukDataPanel title="Oturum Durumu">
            {payload ? (
              <div className="space-y-6">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3 text-[#FFD7D8]">
                    <Clock3 size={16} className="text-[#E70000]" />
                    <p className="text-[11px] uppercase tracking-[0.18em]">Canli Durum</p>
                  </div>
                  <p className="mt-3 text-[15px] leading-[1.8] text-white/72">
                    {canStart
                      ? 'Sinav penceresi acildi. Giris yaptiktan sonra sistem cevaplarinizi otomatik kaydeder.'
                      : isMissed
                        ? 'Bu oturumun giris penceresi kapandi. Destek ekibiyle goruserek sonraki adimi netlestirin.'
                        : 'Sistem oturum saatini otomatik izler. Sure geldiginde sinav alani kullanima acilir.'}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <StateCard label="Ogrenci" value={payload.candidate.studentFullName} />
                  <StateCard label="Okul" value={payload.candidate.schoolName} />
                  <StateCard label="Oturum" value={payload.session?.label || '-'} />
                  <StateCard label="Durum" value={toExamStatusLabel(payload.candidate.examStatus)} />
                </div>

                {countdownTarget ? (
                  <div className="rounded-[28px] border border-[#324D47]/28 bg-[linear-gradient(180deg,rgba(50,77,71,0.34)_0%,rgba(50,77,71,0.12)_100%)] p-6">
                    <div className="flex items-center gap-3 text-[#E2F1EC]">
                      <Sparkles size={16} />
                      <p className="text-[11px] uppercase tracking-[0.18em]">
                        {sessionStatus === 'waiting'
                          ? 'Sinav Baslangicina Kalan Sure'
                          : 'Sinav Penceresinin Kapanmasina Kalan Sure'}
                      </p>
                    </div>
                    <p className="mt-4 font-['Neutraface_2_Text:Bold',sans-serif] text-[2.8rem] leading-none text-white sm:text-[3.2rem]">
                      {formatCountdown(countdownTarget, now)}
                    </p>
                    <p className="mt-3 max-w-[620px] text-[14px] leading-[1.75] text-white/66">
                      Sinav basladiginda bu sayfadan ilerleyebilir, oturum bittiginde sonuc aciklama asamasina otomatik gecersiniz.
                    </p>
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  {canStart ? (
                    <BurslulukPrimaryButton href={BURSLULUK_ROUTES.exam}>
                      Sinava Basla
                    </BurslulukPrimaryButton>
                  ) : null}
                  <BurslulukSecondaryButton
                    href={BURSLULUK_SUPPORT.whatsappHref}
                    onClick={() =>
                      trackEvent('whatsapp_click', {
                        source: 'waiting_room_support',
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
              </div>
            ) : (
              <p className="text-[15px] leading-[1.8] text-white/58">{loadError || 'Bekleme odasi bilgileri yukleniyor...'}</p>
            )}
          </BurslulukDataPanel>
        </div>

        <div className="space-y-6">
          <BurslulukDataPanel title="Sinava Girmeden Once">
            <div className="space-y-3">
              {PREP_ITEMS.map((item) => (
                <ChecklistRow key={item} icon={<ShieldCheck size={15} className="mt-1 shrink-0 text-[#E70000]" />}>
                  {item}
                </ChecklistRow>
              ))}
            </div>
          </BurslulukDataPanel>

          <BurslulukDataPanel title="Sinav Esnasinda">
            <div className="space-y-3">
              {EXAM_ITEMS.map((item) => (
                <ChecklistRow key={item} icon={<ArrowRight size={15} className="mt-1 shrink-0 text-[#E70000]" />}>
                  {item}
                </ChecklistRow>
              ))}
            </div>
          </BurslulukDataPanel>

          <BurslulukDataPanel title="Destek">
            <p className="text-[14px] leading-[1.75] text-white/68">
              Giris, oturum veya teknik bir aksaklik yasarsan destek ekibimiz hizli yonlendirme yapar.
            </p>
            <div className="mt-5 grid gap-3">
              <SupportCard
                icon={<MessageCircle size={15} className="text-[#E70000]" />}
                title="WhatsApp"
                value={BURSLULUK_SUPPORT.whatsappLabel}
                href={BURSLULUK_SUPPORT.whatsappHref}
                onClick={() =>
                  trackEvent('whatsapp_click', {
                    source: 'waiting_room_support_card',
                    href: BURSLULUK_SUPPORT.whatsappHref,
                    phone_number: BURSLULUK_SUPPORT.whatsappHref.replace('https://wa.me/', ''),
                    link_text: BURSLULUK_SUPPORT.whatsappLabel,
                  })
                }
              />
              <SupportCard
                icon={<PhoneCall size={15} className="text-[#E70000]" />}
                title="Telefon"
                value={BURSLULUK_SUPPORT.phoneLabel}
                href={BURSLULUK_SUPPORT.phoneHref}
              />
            </div>
            <p className="mt-4 text-[12px] uppercase tracking-[0.16em] text-white/38">
              Destek Saatleri: {BURSLULUK_SUPPORT.supportWindow}
            </p>
          </BurslulukDataPanel>
        </div>
      </div>
    </BurslulukCandidateShell>
  );
}

function ChecklistRow({
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

function SupportCard({
  icon,
  title,
  value,
  href,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  href: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4 transition-colors hover:border-white/16 hover:bg-white/[0.05]"
    >
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        {icon}
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">{title}</p>
        <p className="mt-1 text-[14px] leading-[1.6] text-white/84">{value}</p>
      </div>
    </a>
  );
}

function StateCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">{label}</p>
      <p className="mt-2 text-[15px] leading-[1.6] text-white/84">{value}</p>
    </div>
  );
}

function toExamStatusLabel(status: string) {
  if (status === 'waiting_room') return 'Beklemede';
  if (status === 'available') return 'Baslatilabilir';
  if (status === 'in_progress') return 'Devam Ediyor';
  if (status === 'submitted') return 'Tamamlandi';
  if (status === 'missed') return 'Kacirildi';
  return 'Hazirlaniyor';
}
