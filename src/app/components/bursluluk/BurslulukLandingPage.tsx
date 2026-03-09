import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import heroVideo from '../../../assets/video/home-hero.mp4';
import { CorrectIcon } from '../MethodologyIcons';
import {
  BURSLULUK_BADGES,
  BURSLULUK_FAQ_ITEMS,
  BURSLULUK_HERO_MESSAGES,
  BURSLULUK_SCHOLARSHIP_NOTE,
  BURSLULUK_SCHOLARSHIP_ROWS,
  BURSLULUK_SESSIONS,
} from '../../bursluluk/config';
import { BurslulukApplicationModal } from './BurslulukApplicationModal';
import { BurslulukBackground, BurslulukPanel, BurslulukPrimaryButton } from './BurslulukUi';

const SCHOLARSHIP_HIGHLIGHTS = [
  {
    title: 'Katılım',
    body: 'Sınava katılan her öğrenci burs avantajı ile sürece başlar.',
  },
  {
    title: 'Başarı',
    body: 'Net yükseldikçe burs oranı daha güçlü hale gelir.',
  },
  {
    title: 'Derece',
    body: 'Sınıf dereceleri en yüksek burs oranlarına ulaşır.',
  },
] as const;

const CTA_STEPS = [
  'Formu doldur ve sınıfına uygun oturumu seç.',
  'Giriş bilgilerin SMS ile tarafına iletilsin.',
  'Sonuç açıklandığında aynı bilgilerle sonucunu görüntüle.',
] as const;

export default function BurslulukLandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  return (
    <BurslulukBackground>
      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-14 px-6 pb-24 pt-[126px] font-['Neutraface_2_Text:Book',sans-serif] md:gap-[4.5rem] lg:px-12 lg:pt-[144px]">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.96fr)_minmax(420px,0.9fr)] lg:items-center">
          <div className="max-w-[680px]">
            <SectionEyebrow text="Teachera Bursluluk 2026" />
            <h1 className="mt-5 font-['Neutraface_2_Text:Bold',sans-serif] text-[2.55rem] leading-[0.98] text-white sm:text-[3.25rem] lg:text-[4.35rem]">
              {BURSLULUK_HERO_MESSAGES[0]}
            </h1>

            <p className="mt-6 max-w-[620px] text-[15px] leading-[1.85] text-white/70 sm:text-[16px] lg:text-[17px]">
              {BURSLULUK_HERO_MESSAGES[1]}
            </p>

            <div className="mt-8 hidden lg:block">
              <HeroBadgeRow desktop />
            </div>

            <div className="mt-6 hidden lg:block">
              <BurslulukPrimaryButton onClick={() => setIsModalOpen(true)}>
                Hemen Başvur
              </BurslulukPrimaryButton>
            </div>
          </div>

          <div className="space-y-4">
            <BurslulukPanel className="overflow-hidden p-0">
              <div className="relative aspect-[1.03] overflow-hidden rounded-[28px]">
                <video
                  src={heroVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,15,0.16)_0%,rgba(9,9,15,0.08)_32%,rgba(9,9,15,0.78)_100%)]" />
                <motion.div
                  animate={{ opacity: [0.42, 1, 0.42] }}
                  transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                  className="absolute inset-0 flex items-center justify-center px-5 text-center"
                >
                  <span className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-white/14 bg-[#09090F]/62 px-5 py-2 font-['Neutraface_2_Text:Demi',sans-serif] text-[10px] uppercase tracking-[0.18em] text-[#FFE3E4] backdrop-blur-md sm:text-[11px]">
                    Detaylar için önce videoyu izle
                  </span>
                </motion.div>
              </div>
            </BurslulukPanel>

            <div className="space-y-3 lg:hidden">
              <HeroBadgeRow />
              <BurslulukPrimaryButton onClick={() => setIsModalOpen(true)} className="w-full">
                Hemen Başvur
              </BurslulukPrimaryButton>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)] lg:gap-8">
          <div className="space-y-6">
            <div>
              <SectionEyebrow text="Burs Yapısı" />
              <h2 className="mt-4 max-w-[420px] font-['Neutraface_2_Text:Bold',sans-serif] text-[2rem] leading-[1.02] text-white md:text-[2.6rem]">
                Katılan her öğrenci avantajla ayrılır, başarılı olan daha yüksek burs kazanır.
              </h2>
              <p className="mt-4 max-w-[440px] text-[15px] leading-[1.8] text-white/64">
                Katılım ücretsizdir. Burs yapısı nettir; her öğrenci avantaj kazanır, daha yüksek başarı ise daha güçlü burs oranlarına dönüşür.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {SCHOLARSHIP_HIGHLIGHTS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#E70000]">{item.title}</p>
                  <p className="mt-3 text-[14px] leading-[1.7] text-white/68">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <BurslulukPanel className="overflow-hidden p-0">
            <div className="hidden md:grid md:grid-cols-[1.05fr_1.45fr_0.8fr] md:gap-px md:bg-white/8">
              <TableHead text="Kategori" />
              <TableHead text="Şart" />
              <TableHead text="Burs" />

              {BURSLULUK_SCHOLARSHIP_ROWS.map((row) => (
                <TableRow
                  key={`${row.category}-${row.rule}`}
                  category={row.category}
                  rule={row.rule}
                  value={row.value}
                />
              ))}
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {BURSLULUK_SCHOLARSHIP_ROWS.map((row) => (
                <div
                  key={`${row.category}-${row.rule}`}
                  className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">{row.category}</p>
                    <span className="rounded-full border border-[#4A7067]/35 bg-[#324D47]/32 px-3 py-1 font-['Neutraface_2_Text:Demi',sans-serif] text-[11px] uppercase tracking-[0.12em] text-[#E2F1EC]">
                      {row.value}
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] leading-[1.7] text-white/68">{row.rule}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/8 bg-white/[0.03] px-5 py-4 text-[12px] leading-[1.75] text-white/52">
              {BURSLULUK_SCHOLARSHIP_NOTE}
            </div>
          </BurslulukPanel>
        </section>

        <section className="space-y-6">
          <div className="max-w-[720px]">
            <SectionEyebrow text="Sınav Takvimi" />
            <h2 className="mt-4 font-['Neutraface_2_Text:Bold',sans-serif] text-[2rem] leading-[1.02] text-white md:text-[2.6rem]">
              28-29 Mart 2026 oturumları
            </h2>
            <p className="mt-4 text-[15px] leading-[1.8] text-white/64">
              Başvuru sırasında sınıfına uygun oturum seçeneklerinden birini seçebilirsin.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {BURSLULUK_SESSIONS.map((session) => (
              <ScheduleCard
                key={session.id}
                date={new Date(`${session.date}T12:00:00`).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                time={`${session.startsAt} - ${session.endsAt}`}
                grades={`${session.grades[0]}-${session.grades[session.grades.length - 1]}. sınıf`}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.72fr)] lg:gap-8">
          <BurslulukPanel>
            <SectionEyebrow text="Sıkça Sorulan Sorular" />
            <h2 className="mt-4 font-['Neutraface_2_Text:Bold',sans-serif] text-[2rem] leading-[1.02] text-white md:text-[2.45rem]">
              Merak Ettikleriniz
            </h2>

            <div className="mt-7 divide-y divide-white/8">
              {BURSLULUK_FAQ_ITEMS.map((item, index) => (
                <FaqRow
                  key={item.question}
                  question={item.question}
                  answer={item.answer}
                  open={openFaqIndex === index}
                  onToggle={() => setOpenFaqIndex((current) => (current === index ? -1 : index))}
                />
              ))}
            </div>
          </BurslulukPanel>

          <div className="lg:pt-[74px]">
            <BurslulukPanel className="lg:sticky lg:top-28">
              <SectionEyebrow text="Başvuru" />
              <h3 className="mt-4 font-['Neutraface_2_Text:Bold',sans-serif] text-[1.9rem] leading-[1.02] text-white">
                Formu doldur, oturumunu seç, yerini ayırt.
              </h3>
              <p className="mt-4 text-[14px] leading-[1.8] text-white/68">
                Başvurunu tamamladığında sınav giriş bilgilerin SMS ile iletilir. Sonuçlar açıklandığında aynı bilgilerle yeniden giriş yapabilirsin.
              </p>

              <div className="mt-6 space-y-3">
                {CTA_STEPS.map((step) => (
                  <div key={step} className="flex items-start gap-3 rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3">
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#E70000]" />
                    <p className="text-[13px] leading-[1.7] text-white/72">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <BurslulukPrimaryButton onClick={() => setIsModalOpen(true)} className="w-full">
                  Hemen Başvur
                </BurslulukPrimaryButton>
              </div>
            </BurslulukPanel>
          </div>
        </section>
      </main>

      <BurslulukApplicationModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </BurslulukBackground>
  );
}

function SectionEyebrow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-[2px] w-7 bg-[#E70000]" />
      <span className="text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.22em] text-[#E70000] sm:text-[11px]">
        {text}
      </span>
    </div>
  );
}

function HeroBadgeRow({ desktop = false }: { desktop?: boolean }) {
  return (
    <div className={desktop ? 'flex flex-wrap gap-3' : 'grid grid-cols-3 gap-2'}>
      {BURSLULUK_BADGES.map((badge) => (
        <span
          key={badge}
          className={
            desktop
              ? "inline-flex min-h-[38px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.15em] text-white/76"
              : "flex min-h-[74px] flex-col items-center justify-center gap-1.5 rounded-[18px] border border-white/10 bg-white/[0.04] px-2 text-center shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
          }
        >
          <span className={desktop ? '' : 'inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#E70000]/25 bg-[#E70000]/12'}>
            <CorrectIcon color="#E70000" className="h-[16px] w-[16px]" />
          </span>
          <span
            className={
              desktop
                ? ''
                : "font-['Neutraface_2_Text:Demi',sans-serif] text-[9px] uppercase tracking-[0.14em] text-white/82"
            }
          >
            {badge}
          </span>
        </span>
      ))}
    </div>
  );
}

function TableHead({ text }: { text: string }) {
  return (
    <div className="bg-white/[0.08] px-5 py-4 text-[11px] uppercase tracking-[0.18em] text-white/46">
      {text}
    </div>
  );
}

function TableRow({
  category,
  rule,
  value,
}: {
  category: string;
  rule: string;
  value: string;
}) {
  return (
    <>
      <div className="bg-white/[0.03] px-5 py-4 text-[14px] text-white/82">{category}</div>
      <div className="bg-white/[0.03] px-5 py-4 text-[14px] leading-[1.7] text-white/62">{rule}</div>
      <div className="bg-white/[0.03] px-5 py-4 font-['Neutraface_2_Text:Bold',sans-serif] text-[14px] text-white">{value}</div>
    </>
  );
}

function ScheduleCard({
  date,
  time,
  grades,
}: {
  date: string;
  time: string;
  grades: string;
}) {
  return (
    <BurslulukPanel className="rounded-[24px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Tarih</p>
          <p className="mt-2 text-[16px] leading-[1.35] text-white">{date}</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.14em] text-white/72">
          {time}
        </div>
      </div>

      <div className="mt-5 border-t border-white/8 pt-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">Kademe</p>
        <p className="mt-2 text-[15px] text-white/82">{grades}</p>
      </div>
    </BurslulukPanel>
  );
}

function FaqRow({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 py-5 text-left"
      >
        <span className="text-[15px] leading-[1.55] text-white/86 md:text-[16px]">{question}</span>
        <span
          className={`mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-[14px] text-white/60 transition-transform ${
            open ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-2 text-[14px] leading-[1.8] text-white/62">{answer}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
