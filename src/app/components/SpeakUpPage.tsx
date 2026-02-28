import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowUpRight, ChevronDown, Check, Volume2, VolumeX, ChevronLeft, ChevronRight, Maximize2, X, Play } from 'lucide-react';
import { openMailDraft } from './formMailto';
import { isValidTrMobilePhone, normalizeTrMobileInput, TR_MOBILE_PATTERN, TR_MOBILE_TITLE } from './phoneUtils';

/* ═══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════════ */
const HERO_BG = 'https://images.unsplash.com/photo-1582848890404-ed087c1b3f0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';
const LEGAL_KVKK_URL = '/hukuki/musteri-aydinlatma-metni';
const SPEAKUP_VIDEO_EMBED_BASE =
  'https://player.vimeo.com/video/1168669335?badge=0&autopause=0&player_id=0&app_id=58479';
const SPEAKUP_VIDEO_INLINE_SRC =
  `${SPEAKUP_VIDEO_EMBED_BASE}&api=1&playsinline=1&dnt=1&controls=1&title=0&byline=0&portrait=0&muted=1`;
const SPEAKUP_VIDEO_FULLSCREEN_SRC =
  `${SPEAKUP_VIDEO_EMBED_BASE}&api=1&playsinline=1&dnt=1&controls=1&title=0&byline=0&portrait=0&muted=1`;

const SESSIONS = [
  { id: 's1', label: '14:00 – 15:20', value: '14:00-15:20' },
  { id: 's2', label: '15:30 – 16:50', value: '15:30-16:50' },
  { id: 's3', label: '17:00 – 18:20', value: '17:00-18:20' },
];

const LEVELS = ['Bilmiyorum', 'Başlangıç', 'Orta', 'İleri'];

const TEST_TIMES = ['14:00 – 17:00', '17:00 – 20:00'];

const FLOW_STEPS = [
  { num: '01', title: 'Başvur', desc: 'Formu doldur, biz seni tanıyalım.' },
  { num: '02', title: 'Biz Arayalım', desc: 'Eğitim danışmanlarımız seninle iletişime geçer.' },
  { num: '03', title: 'Seviye Tespiti', desc: "Teachera'da kısa bir sözlü görüşme." },
  { num: '04', title: 'Grup Yerleşimi', desc: 'Seviyene uygun gruba yerleştirme.' },
  { num: '05', title: "SpeakUP'a Başla", desc: "Kampüste konuşma pratiğine başla!" },
];

const FAQ_ITEMS = [
  {
    q: 'Kimler katılabilir?',
    a: 'Tüm Necmettin Erbakan Üniversitesi öğrencileri (öncelik Mühendislik Fakültesi). Seviye fark etmez; gruplar seviye tespitine göre oluşturulur.',
  },
  {
    q: "Hiç konuşamıyorum, SpeakUP Campus'e katılabilir miyim?",
    a: "Evet. Teachera'nın metodolojisi itibariyle konuşarak öğretiyoruz. İlk günden konuşturmaya başlatan bir sistemimiz var. Sen yeter ki katılmak iste.",
  },
  {
    q: 'Seviye tespiti nerede yapılıyor?',
    a: "Sözlü seviye tespiti, Teachera'da yapılır. Başvurunuz sonrası eğitim danışmanlarımız sizi arayarak yönlendirecektir.",
  },
  {
    q: 'Seviye tespiti ne kadar sürer?',
    a: 'Kısa bir sözlü görüşme şeklinde ilerler; amaç doğru seviyede doğru gruba yerleştirmektir.',
  },
  {
    q: 'Aktiviteler ne zaman başlıyor?',
    a: 'Aktiviteler 23 Mart 2026 haftası itibarıyla başlar. Gruplar netleştirilince, net bilgi kuracağımız WhatsApp gruplarından duyurulacaktır.',
  },
  {
    q: 'Bir tur ne kadar sürüyor?',
    a: 'Her tur 1 ay sürer. Grup takvimine göre haftalık oturumlarla ilerlenir.',
  },
  {
    q: 'Başvurular hangi tarihe kadar?',
    a: 'Son başvuru tarihi 16 Mart 2026. Ancak ilk belirleyici olan kontenjanlar; dolduğunda başvurular erken kapanabilir.',
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS — calendar
   ═══════════════════════════════════════════════════════════════════════ */
const TR_MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const TR_DAYS_SHORT = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];

const CAL_MIN = new Date(2026, 1, 27); // 27 Şubat 2026
const CAL_MAX = new Date(2026, 2, 16); // 16 Mart 2026

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const startIdx = firstDay === 0 ? 6 : firstDay - 1; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { startIdx, daysInMonth };
}

function formatDateTr(d: Date) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/* ═══════════════════════════════════════════════════════════════════════
   DROPDOWN CALENDAR — FreeTrialModal style, SpeakUP renkleri
   ═══════════════════════════════════════════════════════════════════════ */
function CalendarDropdown({
  viewYear, viewMonth, selectedDate,
  onSelect, onPrev, onNext,
}: {
  viewYear: number; viewMonth: number;
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
  onPrev: () => void; onNext: () => void;
}) {
  const { startIdx, daysInMonth } = getMonthGrid(viewYear, viewMonth);
  const cells: (number | null)[] = Array(startIdx).fill(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const today = new Date();

  const isEnabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    return d >= CAL_MIN && d <= CAL_MAX;
  };

  const canPrev = viewYear > CAL_MIN.getFullYear() || (viewYear === CAL_MIN.getFullYear() && viewMonth > CAL_MIN.getMonth());
  const canNext = viewYear < CAL_MAX.getFullYear() || (viewYear === CAL_MAX.getFullYear() && viewMonth < CAL_MAX.getMonth());

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 mt-2 w-[260px] bg-white rounded-[14px] shadow-xl shadow-black/15 border border-[#324D47]/[0.08] overflow-hidden z-30 p-3"
    >
      {/* Month nav */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className="w-6 h-6 rounded-full hover:bg-[#324D47]/[0.06] flex items-center justify-center transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft size={13} className="text-[#324D47]" />
        </button>
        <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] text-[#324D47]">
          {TR_MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="w-6 h-6 rounded-full hover:bg-[#324D47]/[0.06] flex items-center justify-center transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronRight size={13} className="text-[#324D47]" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0 mb-0.5">
        {TR_DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[9px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]/25 py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-0">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const date = new Date(viewYear, viewMonth, day);
          const enabled = isEnabled(day);
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);

          return (
            <button
              key={day}
              type="button"
              disabled={!enabled}
              onClick={() => onSelect(date)}
              className={`w-full aspect-square rounded-full flex items-center justify-center text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] transition-all duration-150 ${
                !enabled
                  ? 'text-[#324D47]/15 cursor-not-allowed'
                  : isSelected
                  ? 'bg-[#324D47] text-white shadow-md'
                  : isToday
                  ? 'bg-[#324D47]/10 text-[#324D47] hover:bg-[#324D47]/20 cursor-pointer'
                  : 'text-[#324D47] hover:bg-[#324D47]/[0.06] cursor-pointer'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Note */}
      <p className="text-center text-[9px] font-['Neutraface_2_Text:Book',sans-serif] text-[#324D47]/25 mt-1.5">
        27 Şubat – 16 Mart arası seçim yapabilirsiniz.
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   REVEAL ANIMATION
   ═══════════════════════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FAQ ITEM
   ═══════════════════════════════════════════════════════════════════════ */
function FaqItem({ item, index }: { item: { q: string; a: string }; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#324D47]/[0.08]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-5 py-6 md:py-7 text-left cursor-pointer group"
      >
        <span className="text-[#E70000]/25 text-[13px] font-['Neutraface_2_Text:Bold',sans-serif] mt-0.5 shrink-0 w-6">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex-1 text-[#324D47] font-['Neutraface_2_Text:Demi',sans-serif] text-[15px] md:text-[16px] leading-snug group-hover:text-[#E70000] transition-colors duration-300">
          {item.q}
        </span>
        <ChevronDown
          size={18}
          className={`text-[#324D47]/30 shrink-0 mt-0.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-11 pr-6 pb-7">
              <p className="text-[#324D47]/60 font-['Neutraface_2_Text:Book',sans-serif] text-[14px] md:text-[15px] leading-[1.75]">
                {item.a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SPEAKUP PAGE
   ══════════════════════════════════════════════════════════════════════ */
export default function SpeakUpPage() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const whatRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);
  const videoCardRef = useRef<HTMLDivElement>(null);
  const inlineIframeRef = useRef<HTMLIFrameElement>(null);
  const fullscreenIframeRef = useRef<HTMLIFrameElement>(null);
  const isInlineVideoInView = useInView(videoCardRef, { margin: '-20% 0px -20% 0px' });

  /* ── Video Mute State ── */
  const [isInlineVideoStarted, setIsInlineVideoStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const [showFullscreenSoundPrompt, setShowFullscreenSoundPrompt] = useState(false);

  const postToPlayer = (
    iframe: HTMLIFrameElement | null,
    method: string,
    value?: number | boolean | string,
  ) => {
    if (!iframe?.contentWindow) return;
    const payload: Record<string, unknown> = { method };
    if (typeof value !== 'undefined') payload.value = value;
    iframe.contentWindow.postMessage(JSON.stringify(payload), '*');
  };

  const syncIframeVolume = (iframe: HTMLIFrameElement | null, muted: boolean) => {
    postToPlayer(iframe, 'setMuted', muted);
    postToPlayer(iframe, 'setVolume', muted ? 0 : 1);
  };

  const syncAllPlayers = (muted: boolean) => {
    syncIframeVolume(inlineIframeRef.current, muted);
    syncIframeVolume(fullscreenIframeRef.current, muted);
  };

  const toggleMute = (event?: { stopPropagation?: () => void }) => {
    event?.stopPropagation?.();
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (!nextMuted) setShowFullscreenSoundPrompt(false);
      return nextMuted;
    });
  };

  const openVideoFullscreen = (event?: { stopPropagation?: () => void }) => {
    event?.stopPropagation?.();
    setIsMuted(true);
    setShowFullscreenSoundPrompt(true);
    setIsVideoFullscreen(true);
  };

  const startInlineVideo = (event?: { stopPropagation?: () => void }) => {
    event?.stopPropagation?.();
    setIsInlineVideoStarted(true);
    setIsMuted(true);
  };

  const enableFullscreenSound = (event?: { stopPropagation?: () => void }) => {
    event?.stopPropagation?.();
    setIsMuted(false);
    setShowFullscreenSoundPrompt(false);
    postToPlayer(fullscreenIframeRef.current, 'setMuted', false);
    postToPlayer(fullscreenIframeRef.current, 'setVolume', 1);
    postToPlayer(fullscreenIframeRef.current, 'play');
    window.setTimeout(() => {
      postToPlayer(fullscreenIframeRef.current, 'setMuted', false);
      postToPlayer(fullscreenIframeRef.current, 'setVolume', 1);
      postToPlayer(fullscreenIframeRef.current, 'play');
    }, 220);
  };

  const handleInlineIframeLoad = () => {
    window.setTimeout(() => {
      postToPlayer(inlineIframeRef.current, 'play');
      syncIframeVolume(inlineIframeRef.current, isMuted);
    }, 350);
  };

  const handleFullscreenIframeLoad = () => {
    window.setTimeout(() => {
      postToPlayer(fullscreenIframeRef.current, 'play');
      syncIframeVolume(fullscreenIframeRef.current, isMuted);
    }, 250);
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => syncAllPlayers(isMuted), 80);
    return () => window.clearTimeout(timerId);
  }, [isMuted]);

  useEffect(() => {
    if (isVideoFullscreen || !isInlineVideoStarted) return;
    const timerId = window.setTimeout(() => {
      postToPlayer(inlineIframeRef.current, isInlineVideoInView ? 'play' : 'pause');
      if (isInlineVideoInView) syncIframeVolume(inlineIframeRef.current, isMuted);
    }, 100);
    return () => window.clearTimeout(timerId);
  }, [isInlineVideoInView, isVideoFullscreen, isInlineVideoStarted, isMuted]);

  useEffect(() => {
    if (!isVideoFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsVideoFullscreen(false);
    };
    document.addEventListener('keydown', keyHandler);

    postToPlayer(inlineIframeRef.current, 'pause');
    const timerId = window.setTimeout(() => {
      postToPlayer(fullscreenIframeRef.current, 'play');
      syncIframeVolume(fullscreenIframeRef.current, isMuted);
    }, 200);

    return () => {
      window.clearTimeout(timerId);
      setShowFullscreenSoundPrompt(false);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keyHandler);
      if (isInlineVideoStarted) {
        postToPlayer(inlineIframeRef.current, isInlineVideoInView ? 'play' : 'pause');
      }
      if (isInlineVideoStarted && isInlineVideoInView) {
        window.setTimeout(() => syncIframeVolume(inlineIframeRef.current, isMuted), 120);
      }
    };
  }, [isVideoFullscreen, isInlineVideoInView, isInlineVideoStarted, isMuted]);

  /* ── Form State ── */
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    department: '',
    sessions: [] as string[],
    level: '',
    testDate: null as Date | null,
    testTime: '',
    kvkk: false,
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calViewYear, setCalViewYear] = useState(CAL_MIN.getFullYear());
  const [calViewMonth, setCalViewMonth] = useState(CAL_MIN.getMonth());
  const calRef = useRef<HTMLDivElement>(null);
  const isPhoneValid = isValidTrMobilePhone(formData.phone);

  /* Close calendar on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) setCalendarOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const calPrev = () => {
    if (calViewMonth === 0) { setCalViewMonth(11); setCalViewYear(y => y - 1); }
    else setCalViewMonth(m => m - 1);
  };
  const calNext = () => {
    if (calViewMonth === 11) { setCalViewMonth(0); setCalViewYear(y => y + 1); }
    else setCalViewMonth(m => m + 1);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToHow = () => {
    howRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleSession = (val: string) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.includes(val)
        ? prev.sessions.filter(s => s !== val)
        : [...prev.sessions, val],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.kvkk || formData.sessions.length === 0 || !isPhoneValid) return;

    const sent = await openMailDraft({
      subject: 'SpeakUP Campus Basvuru Talebi',
      lines: [
        `Ad Soyad: ${formData.name}`,
        `Telefon: +90 ${formData.phone}`,
        `E-posta: ${formData.email || '-'}`,
        `Bolum/Sinif: ${formData.department || '-'}`,
        `Seans Tercihi: ${formData.sessions.join(', ')}`,
        `Seviye: ${formData.level || '-'}`,
        `Seviye Test Tarihi: ${formData.testDate ? formatDateTr(formData.testDate) : '-'}`,
        `Seviye Test Saati: ${formData.testTime || '-'}`,
      ],
    });

    if (!sent) {
      window.alert('Talebiniz gönderilemedi. Lütfen tekrar deneyin.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ═══════════════════════════════════════════════════════
          1 — HERO — Vertical Video + Typography
          ═══════════════════════════════════════════════════════ */}
      <section className="relative bg-[#0a0a10] overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-16 md:py-24 lg:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left — Typography */}
            <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
              {/* Category */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center gap-3 justify-center lg:justify-start mb-8"
              >
                <div className="w-8 h-[1px] bg-[#E70000]/50" />
                <span className="text-[#E70000] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.35em]">
                  SPEAKING CLUB
                </span>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6"
              >
                <h1 className="leading-none">
                  <span
                    className="block text-white font-['Bobby_Jones_Soft',cursive]"
                    style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)', lineHeight: '0.9' }}
                  >
                    SpeakUP
                  </span>
                  <span
                    className="block text-white/20 font-['Neutraface_2_Text:Bold',sans-serif] tracking-[0.25em] mt-2"
                    style={{ fontSize: 'clamp(1rem, 3vw, 1.8rem)' }}
                  >
                    CAMPUS
                  </span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="text-white/35 text-[14px] md:text-[16px] font-['Neutraface_2_Text:Book',sans-serif] leading-[1.7] max-w-md mx-auto lg:mx-0 mb-10"
              >
                NEU Mühendislik öğrencileri için konuşma odaklı, sosyal bir kulüp.
              </motion.p>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="flex items-center gap-8 justify-center lg:justify-start mb-12 flex-wrap"
              >
                {[
                  { val: '72', label: 'Kontenjan' },
                  { val: '12', label: 'Kişi / Grup' },
                  { val: '3', label: 'Oturum / Gün' },
                ].map(s => (
                  <div key={s.label} className="text-center lg:text-left">
                    <p className="text-white text-[28px] md:text-[34px] font-['Neutraface_2_Text:Bold',sans-serif] leading-none">
                      {s.val}
                    </p>
                    <p className="text-white/20 text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.15em] mt-1">
                      {s.label}
                    </p>
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start"
              >
                <button
                  onClick={scrollToForm}
                  className="h-[48px] px-8 rounded-full bg-[#E70000] border border-[#E70000] hover:bg-[#c40000] hover:border-[#c40000] text-white font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-[0.15em] transition-all duration-300 shadow-lg shadow-[#E70000]/20 cursor-pointer hover:shadow-[#E70000]/35 flex items-center gap-2.5"
                >
                  HEMEN BAŞVUR
                  <ArrowUpRight size={15} />
                </button>
              </motion.div>
            </div>

            {/* Right — Vertical Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative order-1 lg:order-2 shrink-0"
            >
              <div className="relative rounded-[30px] p-[1.5px] bg-[linear-gradient(140deg,rgba(231,0,0,0.75),rgba(255,255,255,0.35),rgba(50,77,71,0.65))] shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
                <div
                  ref={videoCardRef}
                  className="relative w-[280px] md:w-[320px] lg:w-[340px] rounded-[24px] overflow-hidden bg-[#1a1a24] shadow-2xl shadow-black/40 cursor-pointer"
                  style={{ aspectRatio: '9/16' }}
                  onClick={isInlineVideoStarted ? openVideoFullscreen : startInlineVideo}
                >
                  {isInlineVideoStarted ? (
                    <>
                      <iframe
                        ref={inlineIframeRef}
                        src={SPEAKUP_VIDEO_INLINE_SRC}
                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        title="Teachera SpeakUP"
                        className="absolute inset-0 w-full h-full border-0"
                        loading="eager"
                        onLoad={handleInlineIframeLoad}
                      />
                      <button
                        onClick={(event) => toggleMute(event)}
                        className="absolute top-2 right-2 w-8 h-8 bg-[#324D47]/[0.8] rounded-full flex items-center justify-center cursor-pointer"
                      >
                        {isMuted ? <VolumeX size={14} className="text-white" /> : <Volume2 size={14} className="text-white" />}
                      </button>
                      <button
                        onClick={openVideoFullscreen}
                        className="absolute top-2 left-2 h-8 px-3 bg-[#00000B]/70 rounded-full flex items-center justify-center gap-1.5 cursor-pointer text-white text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.06em]"
                      >
                        <Maximize2 size={12} />
                        TAM EKRAN
                      </button>
                    </>
                  ) : (
                    <>
                      <img
                        src={HERO_BG}
                        alt="SpeakUP Bilgilendirme Videosu"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,11,0.1),rgba(0,0,11,0.72))]" />
                      <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group cursor-pointer relative block"
                        onClick={startInlineVideo}
                        aria-label="Videoyu oynat"
                      >
                        <div className="absolute inset-0 bg-white/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                        <div className="w-14 h-14 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-all duration-500 relative z-10">
                          <div className="w-9 h-9 bg-[#E70000] rounded-full flex items-center justify-center pl-0.5 shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <Play fill="currentColor" className="text-white w-3 h-3" />
                          </div>
                        </div>
                      </motion.button>
                    </>
                  )}
                </div>
              </div>

              {!isInlineVideoStarted && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: [0.45, 0.9, 0.45], y: [0, -3, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="mt-4 text-center text-white/70 text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.14em] uppercase"
                >
                  Önce Bilgilendirme Videosunu İzle
                </motion.p>
              )}

              {/* Floating glow behind video */}
              <div className="absolute -inset-10 bg-[#E70000] rounded-full filter blur-[120px] opacity-[0.06] -z-10 pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isVideoFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[90] bg-[#00000B]/95 backdrop-blur-sm flex items-center justify-center p-3"
            onClick={() => setIsVideoFullscreen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.95 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[92svh] max-h-[92svh] max-w-[96vw] aspect-[9/16] rounded-[22px] overflow-hidden bg-black shadow-2xl shadow-black/60"
              onClick={(event) => event.stopPropagation()}
            >
              <iframe
                ref={fullscreenIframeRef}
                src={SPEAKUP_VIDEO_FULLSCREEN_SRC}
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Teachera SpeakUP Fullscreen"
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                onLoad={handleFullscreenIframeLoad}
              />

              <button
                onClick={(event) => toggleMute(event)}
                className="absolute top-3 left-3 h-9 px-3 bg-[#324D47]/85 rounded-full flex items-center justify-center gap-2 cursor-pointer text-white text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.05em]"
              >
                {isMuted ? <VolumeX size={15} className="text-white" /> : <Volume2 size={15} className="text-white" />}
                {isMuted ? 'SESİ AÇ' : 'SESİ KAPAT'}
              </button>

              {showFullscreenSoundPrompt && (
                <button
                  onClick={enableFullscreenSound}
                  className="absolute inset-0 flex items-center justify-center bg-[#00000B]/15 cursor-pointer"
                >
                  <span className="px-5 py-3 rounded-full bg-[#324D47]/92 border border-white/20 text-white font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-[0.08em] uppercase">
                    Ekrana Dokun: Sesi Aç
                  </span>
                </button>
              )}

              <button
                onClick={() => setIsVideoFullscreen(false)}
                className="absolute top-3 right-3 w-9 h-9 bg-[#00000B]/75 rounded-full flex items-center justify-center cursor-pointer text-white"
                aria-label="Tam ekran videoyu kapat"
              >
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════
          2 — SPEAKUP NEDIR?
          ═══════════════════════════════════════════════════════ */}
      <section ref={whatRef} className="py-20 md:py-28 scroll-mt-20">
        <div className="max-w-[900px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="text-center mb-14 md:mb-20">
              <div className="flex items-center gap-3 justify-center mb-6">
                <div className="w-8 h-[1px] bg-[#E70000]/40" />
                <span className="text-[#E70000] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.35em]">
                  PROGRAM
                </span>
                <div className="w-8 h-[1px] bg-[#E70000]/40" />
              </div>
              <h2
                className="text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif] leading-[1.05]"
                style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}
              >
                <span className="font-['Bobby_Jones_Soft',cursive] text-[#E70000]">SpeakUP</span> Nedir?
              </h2>
            </div>
          </Reveal>

          <div className="space-y-8">
            <Reveal delay={0.05}>
              <p className="text-[#324D47]/70 font-['Neutraface_2_Text:Book',sans-serif] text-[15px] md:text-[16px] leading-[1.85]">
                <span className="font-['Bobby_Jones_Soft',cursive] text-[#E70000] text-[18px]">SpeakUP</span>, Necmettin Erbakan Üniversitesi Mühendislik Fakültesi ile Teachera Dil Okulu iş birliği kapsamında, kampüs içerisinde yürütülecek bir Speaking Club (Konuşma Kulübü) programıdır.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-[#324D47]/70 font-['Neutraface_2_Text:Book',sans-serif] text-[15px] md:text-[16px] leading-[1.85]">
                Amacımız; öğrencilerimize üniversite içerisinde inşa edeceğimiz, sosyal ve keyifli bir ortamda yabancı dil konuşmanın zor olmadığını deneyimle göstermek ve üniversite içinde motivasyonu yüksek bir ortamı, aynı zamanda fayda üreten bir konsept içinde sunmaktır.
              </p>
            </Reveal>

            {/* Info Cards */}
            <Reveal delay={0.15}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-12 md:my-16">
                {[
                  { num: '01', title: 'Haftalık Program', desc: 'Haftada 1 gün, 3 ayrı oturum. Her oturum 80 dakika.' },
                  { num: '02', title: 'Maks. 12 Kişi', desc: 'Her grup maksimum 12 kişi ile sınırlı. Toplam 72 kontenjan.' },
                  { num: '03', title: '2 Öğretmen', desc: "Teachera'dan 2 profesyonel eğitmen, her oturumda görev alır." },
                ].map(card => (
                  <div key={card.num} className="bg-[#324D47]/[0.04] border border-[#324D47]/[0.06] rounded-[20px] p-6 md:p-7">
                    <span className="text-[#E70000]/15 text-[32px] font-['Neutraface_2_Text:Bold',sans-serif] leading-none block mb-3">
                      {card.num}
                    </span>
                    <h4 className="text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif] text-[14px] mb-2">
                      {card.title}
                    </h4>
                    <p className="text-[#324D47]/50 font-['Neutraface_2_Text:Book',sans-serif] text-[13px] leading-[1.6]">
                      {card.desc}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Oturum saatleri + Tarihler */}
            <Reveal delay={0.1}>
              <div className="bg-[#324D47] rounded-[20px] p-6 md:p-8 my-8 overflow-hidden">
                {/* Oturum Saatleri */}
                <div className="mb-6">
                  <p className="text-white/30 text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.25em] mb-4">
                    OTURUM SAATLERİ
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {['14:00 – 15:20', '15:30 – 16:50', '17:00 – 18:20'].map(time => (
                      <div
                        key={time}
                        className="flex items-center gap-2.5 px-5 py-3 rounded-[14px] bg-white/[0.06] border border-white/[0.08]"
                      >
                        <div className="w-2 h-2 rounded-full bg-[#E70000]/50 shrink-0" />
                        <span className="text-white/80 font-['Neutraface_2_Text:Demi',sans-serif] text-[13px] tracking-[0.03em]">
                          {time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-white/[0.06] mb-6" />

                {/* Tarih bilgileri */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Başlangıç Tarihi */}
                  <div className="flex items-center gap-4 bg-white/[0.04] rounded-[14px] p-4 md:p-5">
                    <div className="w-11 h-11 rounded-[12px] bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                      <span className="text-white/60 text-[16px]">📅</span>
                    </div>
                    <div>
                      <p className="text-white/30 text-[9px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] mb-1">
                        BAŞLANGIÇ TARİHİ
                      </p>
                      <p className="text-white font-['Neutraface_2_Text:Bold',sans-serif] text-[17px] md:text-[18px] leading-none">
                        23 Mart 2026
                      </p>
                    </div>
                  </div>

                  {/* Son Başvuru Tarihi */}
                  <div className="flex items-center gap-4 bg-[#E70000]/[0.08] border border-[#E70000]/[0.12] rounded-[14px] p-4 md:p-5">
                    <div className="w-11 h-11 rounded-[12px] bg-[#E70000]/[0.12] border border-[#E70000]/[0.15] flex items-center justify-center shrink-0">
                      <span className="text-[#E70000]/80 text-[16px]">⏰</span>
                    </div>
                    <div>
                      <p className="text-white/30 text-[9px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] mb-1">
                        SON BAŞVURU
                      </p>
                      <p className="text-[#E70000] font-['Neutraface_2_Text:Bold',sans-serif] text-[17px] md:text-[18px] leading-none">
                        16 Mart 2026
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-[#324D47]/70 font-['Neutraface_2_Text:Book',sans-serif] text-[15px] md:text-[16px] leading-[1.85]">
                Başvurunun ardından eğitim danışmanlarımız sizinle iletişime geçer ve sözlü seviye tespiti için Teachera'ya davet eder. Seviye tespiti sonucuna göre size uygun gruba yerleştirme yapılır. SpeakUP oturumları, "ders anlatımı" formatında değil; sosyal bir ortamda konuşma pratiği odaklı, etkileşimli ve seviyeye uygun bir kulüp düzeninde yürütülür.
              </p>
            </Reveal>

            {/* Katılım Modeli */}
            <Reveal delay={0.1}>
              <div className="border-l-[3px] border-[#E70000]/30 pl-6 md:pl-8 my-10 md:my-14">
                <p className="text-[#E70000] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.25em] mb-4">
                  KATILIM MODELİ
                </p>
                <p className="text-[#324D47]/70 font-['Neutraface_2_Text:Book',sans-serif] text-[15px] md:text-[16px] leading-[1.85] mb-4">
                  Katılım modeli, programın ticari kazanç amacı taşımamasına rağmen tamamen ücretsiz olmasının ciddiyeti ve devamlılığı azaltabileceği değerlendirmesiyle şekillendirilmiştir.
                </p>
                <p className="text-[#324D47]/70 font-['Neutraface_2_Text:Book',sans-serif] text-[15px] md:text-[16px] leading-[1.85]">
                  Bu nedenle katılımcılardan <strong className="text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif]">1.000 TL</strong> tutarında bir katılım katkısı/depozito alınır; bu tutar eğitim ücreti değildir. Kampüs alanının hazırlanması ve ikram/kurulum gibi giderler ile öğretmenlerin yemek ve geliş–gidiş masrafları için kullanılır. Her katılımcıya ayrıca <strong className="text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif]">1.000 TL</strong> değerinde Teachera hediye çeki verilir; bu çek Teachera bünyesinde (kafeterya ve/veya eğitim/ürün-hizmet alımlarında) para yerine kullanılabilir.
                </p>
              </div>
            </Reveal>

            {/* Ek indirim banner */}
            <Reveal delay={0.1}>
              <div className="bg-[#E70000]/[0.04] border border-[#E70000]/[0.08] p-5 md:p-6 flex items-start gap-4 rounded-[12px]">
                <div className="w-12 h-12 bg-[#E70000]/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[#E70000] text-[16px] font-['Neutraface_2_Text:Bold',sans-serif]">%15</span>
                </div>
                <div>
                  <p className="text-[#324D47] font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] mb-1">
                    Ek Kampanya İndirimi
                  </p>
                  <p className="text-[#324D47]/55 font-['Neutraface_2_Text:Book',sans-serif] text-[13px] leading-[1.6]">
                    SpeakUP Campus'e katılan öğrenciler, Teachera bünyesinde mevcut kampanyalara ek +%15 ilave indirimden yararlanır.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          3 — NASIL İŞLİYOR?
          ══════════════════════════════════════════════════════ */}
      <section ref={howRef} className="bg-[#324D47] py-20 md:py-28 relative overflow-hidden scroll-mt-20">
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#E70000] rounded-full filter blur-[200px] opacity-[0.08] pointer-events-none" />

        <div className="max-w-[1100px] mx-auto px-6 md:px-10 relative z-10">
          <Reveal>
            <div className="text-center mb-16 md:mb-20">
              <div className="flex items-center gap-3 justify-center mb-6">
                <div className="w-8 h-[1px] bg-[#E70000]/40" />
                <span className="text-[#E70000] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.35em]">
                  SÜREÇLER
                </span>
                <div className="w-8 h-[1px] bg-[#E70000]/40" />
              </div>
              <h2
                className="text-white font-['Neutraface_2_Text:Bold',sans-serif] leading-[1.1]"
                style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}
              >
                Nasıl İşliyor?
              </h2>
              <p className="text-white/30 font-['Neutraface_2_Text:Book',sans-serif] text-[14px] mt-4 max-w-md mx-auto leading-relaxed">
                Başvurudan ilk oturuma kadar 5 basit adım.
              </p>
            </div>
          </Reveal>

          {/* ── Desktop: Horizontal timeline ── */}
          <div className="hidden md:block">
            {/* Timeline connector bar */}
            <div className="relative mb-14">
              <div className="absolute top-5 left-[10%] right-[10%] h-[1px] bg-white/[0.08]" />
              {/* Animated progress line */}
              <Reveal>
                <div className="absolute top-5 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-[#E70000]/40 via-[#E70000]/20 to-transparent origin-left" />
              </Reveal>
              {/* Step circles */}
              <div className="flex justify-between relative">
                {FLOW_STEPS.map((step, i) => (
                  <Reveal key={step.num} delay={i * 0.1}>
                    <div className="flex flex-col items-center w-[180px]">
                      {/* Circle with number */}
                      <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center mb-5 group-hover:border-[#E70000]/40 transition-all duration-500 relative">
                        <span className="text-[#E70000] text-[11px] font-['Neutraface_2_Text:Bold',sans-serif]">
                          {step.num}
                        </span>
                        {/* Ping ring for first step */}
                        {i === 0 && (
                          <span className="absolute inset-0 rounded-full border border-[#E70000]/20 animate-ping" style={{ animationDuration: '3s' }} />
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Step cards */}
            <div className="grid grid-cols-5 gap-3">
              {FLOW_STEPS.map((step, i) => (
                <Reveal key={step.num} delay={i * 0.1 + 0.15}>
                  <div className="group relative bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] rounded-[16px] p-5 text-center transition-all duration-500 cursor-default">
                    {/* Hover glow */}
                    <div className="absolute inset-0 rounded-[16px] bg-[#E70000]/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <h4 className="text-white font-['Neutraface_2_Text:Bold',sans-serif] text-[14px] mb-2 relative">
                      {step.title}
                    </h4>
                    <p className="text-white/30 group-hover:text-white/50 font-['Neutraface_2_Text:Book',sans-serif] text-[12px] leading-[1.65] transition-colors duration-500 relative">
                      {step.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* ── Mobile: Vertical timeline ── */}
          <div className="md:hidden">
            <div className="relative pl-10">
              {/* Vertical line */}
              <div className="absolute left-[13px] top-2 bottom-2 w-[1px] bg-white/[0.08]" />

              <div className="space-y-6">
                {FLOW_STEPS.map((step, i) => (
                  <Reveal key={step.num} delay={i * 0.08}>
                    <div className="relative flex items-start gap-5">
                      {/* Dot on timeline */}
                      <div className="absolute -left-10 top-1 w-[26px] h-[26px] rounded-full bg-[#324D47] border border-white/[0.12] flex items-center justify-center z-10">
                        <span className="text-[#E70000] text-[9px] font-['Neutraface_2_Text:Bold',sans-serif]">
                          {step.num}
                        </span>
                      </div>
                      {/* Card */}
                      <div className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-[14px] p-5">
                        <h4 className="text-white font-['Neutraface_2_Text:Bold',sans-serif] text-[14px] mb-1.5">
                          {step.title}
                        </h4>
                        <p className="text-white/35 font-['Neutraface_2_Text:Book',sans-serif] text-[12px] leading-[1.65]">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          4 — BAŞVURU FORMU
          ════════════════════════════════════════════════════════ */}
      <section ref={formRef} id="speakup-form" className="py-20 md:py-28 scroll-mt-16">
        <div className="max-w-[700px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="text-center mb-14">
              <div className="flex items-center gap-3 justify-center mb-6">
                <div className="w-8 h-[1px] bg-[#E70000]/40" />
                <span className="text-[#E70000] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.35em]">
                  BAŞVURU
                </span>
                <div className="w-8 h-[1px] bg-[#E70000]/40" />
              </div>
              <h2
                className="text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif] leading-[1.1]"
                style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}
              >
                Hemen Başvur
              </h2>
              <p className="text-[#324D47]/45 font-['Neutraface_2_Text:Book',sans-serif] text-[14px] mt-4 max-w-md mx-auto leading-relaxed">
                Kontenjanlar sınırlıdır. Formu doldur, eğitim danışmanımız seni arasın.
              </p>
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-[#324D47] rounded-[20px] p-10 md:p-14 text-center"
              >
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={28} className="text-white" />
                </div>
                <h3 className="text-white text-[22px] font-['Neutraface_2_Text:Bold',sans-serif] mb-3">
                  Başvurun Alındı!
                </h3>
                <p className="text-white/45 font-['Neutraface_2_Text:Book',sans-serif] text-[14px] leading-relaxed max-w-sm mx-auto mb-8">
                  Eğitim danışmanlarımız en kısa sürede seninle iletişime geçecek. Seviye tespiti için hazırlıklı ol!
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="h-[44px] px-8 rounded-full border border-white/10 hover:border-white/20 text-white/50 hover:text-white font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-kicker tracking-[0.08em] md:tracking-[0.15em] transition-all cursor-pointer"
                >
                  ANA SAYFAYA DÖN
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Ad Soyad */}
                <div>
                  <label className="block text-[#324D47] text-mobile-kicker font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.08em] md:tracking-[0.15em] mb-2">
                    AD SOYAD <span className="text-[#E70000]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full h-[44px] rounded-[30px] px-5 bg-[#324D47]/[0.03] border border-[#324D47]/[0.08] text-[#324D47] font-['Neutraface_2_Text:Book',sans-serif] text-[14px] focus:border-[#E70000]/30 focus:outline-none transition-colors placeholder:text-[#324D47]/25"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>

                {/* Telefon + Email row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#324D47] text-mobile-kicker font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.08em] md:tracking-[0.15em] mb-2">
                      TELEFON <span className="text-[#E70000]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: normalizeTrMobileInput(e.target.value) }))}
                      inputMode="numeric"
                      maxLength={13}
                      pattern={TR_MOBILE_PATTERN}
                      title={TR_MOBILE_TITLE}
                      className="w-full h-[44px] rounded-[30px] px-5 bg-[#324D47]/[0.03] border border-[#324D47]/[0.08] text-[#324D47] font-['Neutraface_2_Text:Book',sans-serif] text-[14px] focus:border-[#E70000]/30 focus:outline-none transition-colors placeholder:text-[#324D47]/25"
                      placeholder="5XX XXX XX XX"
                    />
                  </div>
                  <div>
                    <label className="block text-[#324D47] text-mobile-kicker font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.08em] md:tracking-[0.15em] mb-2">
                      E-POSTA <span className="text-[#324D47]/30 text-mobile-kicker md:text-[9px] tracking-normal">(önerilir)</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      className="w-full h-[44px] rounded-[30px] px-5 bg-[#324D47]/[0.03] border border-[#324D47]/[0.08] text-[#324D47] font-['Neutraface_2_Text:Book',sans-serif] text-[14px] focus:border-[#E70000]/30 focus:outline-none transition-colors placeholder:text-[#324D47]/25"
                      placeholder="ornek@mail.com"
                    />
                  </div>
                </div>

                {/* Bölüm / Sınıf */}
                <div>
                  <label className="block text-[#324D47] text-mobile-kicker font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.08em] md:tracking-[0.15em] mb-2">
                    BÖLÜM / SINIF
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData(p => ({ ...p, department: e.target.value }))}
                    className="w-full h-[44px] rounded-[30px] px-5 bg-[#324D47]/[0.03] border border-[#324D47]/[0.08] text-[#324D47] font-['Neutraface_2_Text:Book',sans-serif] text-[14px] focus:border-[#E70000]/30 focus:outline-none transition-colors placeholder:text-[#324D47]/25"
                    placeholder="Bilgisayar Mühendisliği / 2. Sınıf"
                  />
                </div>

                {/* Seans Tercihi */}
                <div>
                  <label className="block text-[#324D47] text-mobile-kicker font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.08em] md:tracking-[0.15em] mb-2">
                    SEANS TERCİHİN <span className="text-[#E70000]">*</span>
                    <span className="text-[#324D47]/30 text-mobile-kicker md:text-[9px] ml-2 tracking-normal">(müsait olduğun tüm saatleri işaretle)</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {SESSIONS.map(s => {
                      const active = formData.sessions.includes(s.value);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleSession(s.value)}
                          className={`h-[44px] px-5 rounded-full border font-['Neutraface_2_Text:Demi',sans-serif] text-[13px] tracking-[0.05em] transition-all cursor-pointer flex items-center gap-2 ${
                            active
                              ? 'bg-[#324D47] border-[#324D47] text-white'
                              : 'bg-transparent border-[#324D47]/[0.1] text-[#324D47]/50 hover:border-[#324D47]/25'
                          }`}
                        >
                          {active && <Check size={14} />}
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Seviye */}
                <div>
                  <label className="block text-[#324D47] text-mobile-kicker font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.08em] md:tracking-[0.15em] mb-2">
                    KENDİNİ SEVİYEDE NASIL GÖRÜYORSUN?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.map(l => {
                      const active = formData.level === l;
                      return (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, level: l }))}
                          className={`h-[44px] px-5 rounded-full border font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-kicker md:text-[12px] tracking-[0.05em] transition-all cursor-pointer ${
                            active
                              ? 'bg-[#E70000] border-[#E70000] text-white'
                              : 'bg-transparent border-[#324D47]/[0.08] text-[#324D47]/40 hover:border-[#324D47]/20'
                          }`}
                        >
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Seviye Tespiti Tarihi */}
                <div>
                  <label className="block text-[#324D47] text-mobile-kicker font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.08em] md:tracking-[0.15em] mb-2">
                    SEVİYE TESPİTİ İÇİN GELEBİLECEĞİN TARİH
                  </label>
                  <div className="relative" ref={calRef}>
                    <button
                      type="button"
                      onClick={() => setCalendarOpen(!calendarOpen)}
                      className="w-full h-[44px] rounded-[30px] px-5 bg-[#324D47]/[0.03] border border-[#324D47]/[0.08] text-left flex items-center justify-between font-['Neutraface_2_Text:Book',sans-serif] text-[14px] focus:border-[#E70000]/30 focus:outline-none transition-colors cursor-pointer"
                    >
                      <span className={formData.testDate ? 'text-[#324D47]' : 'text-[#324D47]/25'}>
                        {formData.testDate ? formatDateTr(formData.testDate) : 'Tarih Seçiniz'}
                      </span>
                      <ChevronDown size={15} className={`text-[#324D47]/30 transition-transform duration-200 ${calendarOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {calendarOpen && (
                        <CalendarDropdown
                          viewYear={calViewYear}
                          viewMonth={calViewMonth}
                          selectedDate={formData.testDate}
                          onSelect={(d) => { setFormData(p => ({ ...p, testDate: d })); setCalendarOpen(false); }}
                          onPrev={calPrev}
                          onNext={calNext}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Seviye Tespiti Saati */}
                <div>
                  <label className="block text-[#324D47] text-mobile-kicker font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.08em] md:tracking-[0.15em] mb-2">
                    SEVİYE TESPİTİ İÇİN GELEBİLECEĞİN SAAT
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {TEST_TIMES.map(t => {
                      const active = formData.testTime === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, testTime: t }))}
                          className={`h-[44px] px-5 rounded-full border font-['Neutraface_2_Text:Demi',sans-serif] text-[13px] tracking-[0.05em] transition-all cursor-pointer flex items-center gap-2 ${
                            active
                              ? 'bg-[#324D47] border-[#324D47] text-white'
                              : 'bg-transparent border-[#324D47]/[0.1] text-[#324D47]/50 hover:border-[#324D47]/25'
                          }`}
                        >
                          {active && <Check size={14} />}
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-[#324D47]/[0.06] my-2" />

                {/* KVKK */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.kvkk}
                      onChange={e => setFormData(p => ({ ...p, kvkk: e.target.checked }))}
                      className="mt-1 w-4 h-4 accent-[#E70000] cursor-pointer"
                    />
                    <span className="text-[#324D47]/60 font-['Neutraface_2_Text:Book',sans-serif] text-mobile-meta md:text-[12px] leading-[1.6] group-hover:text-[#324D47]/80 transition-colors">
                      <span className="text-[#E70000]">*</span>{' '}
                      <a
                        href={LEGAL_KVKK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="underline cursor-pointer"
                      >
                        KVKK Aydınlatma Metni
                      </a>'ni okudum ve onaylıyorum.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.consent}
                      onChange={e => setFormData(p => ({ ...p, consent: e.target.checked }))}
                      className="mt-1 w-4 h-4 accent-[#E70000] cursor-pointer"
                    />
                    <span className="text-[#324D47]/60 font-['Neutraface_2_Text:Book',sans-serif] text-mobile-meta md:text-[12px] leading-[1.6] group-hover:text-[#324D47]/80 transition-colors">
                      Teachera'nın benimle arama ve SMS yoluyla iletişime geçmesine izin veriyorum. (opsiyonel)
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!formData.name || !isPhoneValid || !formData.kvkk || formData.sessions.length === 0}
                  className="w-full h-[48px] rounded-[30px] bg-[#E70000] hover:bg-[#c40000] disabled:bg-[#324D47]/15 disabled:cursor-not-allowed text-white disabled:text-[#324D47]/30 font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-kicker md:text-[13px] tracking-[0.08em] md:tracking-[0.15em] transition-all duration-300 shadow-lg shadow-[#E70000]/20 disabled:shadow-none cursor-pointer flex items-center justify-center gap-2.5"
                >
                  BAŞVURUYU GÖNDER
                  <ArrowUpRight size={15} />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          5 — SIKCA SORULAN SORULAR
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-[700px] mx-auto px-6 md:px-10">
          <Reveal>
            <div className="text-center mb-14">
              <div className="flex items-center gap-3 justify-center mb-6">
                <div className="w-8 h-[1px] bg-[#E70000]/40" />
                <span className="text-[#E70000] text-mobile-kicker md:text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.12em] md:tracking-[0.35em]">
                  MERAK ETTİKLERİNİZ
                </span>
                <div className="w-8 h-[1px] bg-[#E70000]/40" />
              </div>
              <h2
                className="text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif] leading-[1.1]"
                style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}
              >
                Merak Ettikleriniz
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="border-t border-[#324D47]/[0.08]">
              {FAQ_ITEMS.map((item, i) => (
                <FaqItem key={i} item={item} index={i} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6 — BOTTOM CTA
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#0a0a10] py-20 md:py-28 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#E70000] rounded-full filter blur-[250px] opacity-[0.06] pointer-events-none" />

        <div className="max-w-[600px] mx-auto px-6 md:px-10 text-center relative z-10">
          <Reveal>
            <h2 className="mb-4">
              <span className="text-white font-['Bobby_Jones_Soft',cursive] block" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}>
                SpeakUP
              </span>
              <span className="text-white/15 font-['Neutraface_2_Text:Bold',sans-serif] tracking-[0.3em] block text-[14px] md:text-[16px]">
                CAMPUS
              </span>
            </h2>
            <p className="text-white/30 font-['Neutraface_2_Text:Book',sans-serif] text-[14px] leading-relaxed max-w-sm mx-auto mb-10">
              Kontenjanlar sınırlı. Kampüste İngilizce konuşma pratiğine hemen başla.
            </p>
            <button
              onClick={scrollToForm}
              className="h-[48px] px-10 rounded-full bg-[#E70000] border border-[#E70000] hover:bg-[#c40000] hover:border-[#c40000] text-white font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-[0.15em] transition-all duration-300 shadow-lg shadow-[#E70000]/20 cursor-pointer hover:shadow-[#E70000]/35 flex items-center gap-2.5 mx-auto"
            >
              HEMEN BAŞVUR
              <ArrowUpRight size={15} />
            </button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
