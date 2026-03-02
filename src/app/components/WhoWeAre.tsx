import { motion, useScroll, useTransform, AnimatePresence, useInView, useMotionValueEvent, useReducedMotion } from 'motion/react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { MapPin, Mail, Clock, BookOpen, Sparkles, GraduationCap, Languages, ArrowRight, ArrowUpRight, Play, Globe, Monitor, Users, Wifi, ChevronRight, Briefcase } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import FAQ from './FAQ';
import { useFreeTrial } from './FreeTrialContext';
import { useLevelAssessment } from './LevelAssessmentContext';
import imgHero from "figma:asset/2060cbe8e93368901498b0f200d4a7cd60ff1640.webp";
import { useNavigate } from 'react-router';
import { languages, LANGUAGE_GROUP_PROGRAM_SLUGS } from './Programs';
import { ALL_PROGRAMS } from './AllPrograms';
import { useLiteMode } from '../lib/useLiteMode';

/* ─── Animated Counter ──────────────────────────────────────────────── */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20% 0px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let current = 0;
    const duration = 1200;
    const step = value > 100 ? Math.ceil(value / 40) : 1;
    const interval = duration / (value / step);
    const timer = setInterval(() => {
      current += step;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(current);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {display}{suffix}
    </span>
  );
}

/* ─── Divider ───────────────────────────────────────────────────────── */
function SectionDivider({ dark = false }: { dark?: boolean }) {
  const color = dark ? 'bg-white/10' : 'bg-[#324D47]/20';
  const dotColor = dark ? 'bg-white/15' : 'bg-[#324D47]/30';
  return (
    <div className={`flex items-center justify-center py-4 ${dark ? 'bg-[#0D0D14]' : ''}`}>
      <div className={`h-px w-16 ${color}`} />
      <div className={`mx-4 w-2 h-2 rounded-full ${dotColor}`} />
      <div className={`h-px w-16 ${color}`} />
    </div>
  );
}

/* ─── Languages Section (uses shared data from Programs.tsx) ─────────── */
function LanguagesAccordionSection() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string>('en');
  const [mobileIndex, setMobileIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const scrollPosition = container.scrollLeft;
      const cardWidth = container.offsetWidth * 0.85;
      const index = Math.round(scrollPosition / cardWidth);
      setMobileIndex(Math.min(Math.max(index, 0), languages.length - 1));
    }
  };

  return (
    <section className="relative py-24 bg-[#00000B] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(50,77,71,0.08),transparent_70%)]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[1px] bg-[#E70000]" />
            <span className="text-[#E70000] text-xs font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] uppercase">
              7 Dil · Eğitim Programları
            </span>
            <span className="w-8 h-[1px] bg-[#E70000]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-['Neutraface_2_Text:Bold',sans-serif] text-white mb-4">
            Eğitim Programları
          </h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="hidden md:flex items-center justify-center gap-2 text-[rgba(255,255,255,0.4)] text-sm font-['Neutraface_2_Text:Book',sans-serif]"
          >
            <span>Program detayları için kartların üzerine gelin</span>
            <ArrowUpRight size={16} />
          </motion.div>
        </motion.div>

        {/* === DESKTOP: Interactive grid === */}
        <div className="hidden md:flex gap-3 h-[500px]">
          {languages.map((lang) => {
            const isActive = lang.id === activeId;
            return (
              <motion.div
                key={lang.id}
                className="relative rounded-2xl overflow-hidden cursor-pointer"
                animate={{ flex: isActive ? 4 : 1 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                onMouseEnter={() => setActiveId(lang.id)}
              >
                {/* Image */}
                <ImageWithFallback
                  src={lang.image}
                  alt={lang.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.9)] via-[rgba(0,0,0,0.4)] to-transparent" />

                {/* Collapsed state */}
                {!isActive && (
                  <div className="absolute inset-0 flex items-end p-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.accent }} />
                      <span className="text-white text-sm font-['Neutraface_2_Text:Demi',sans-serif] [writing-mode:vertical-lr] rotate-180">
                        {lang.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Expanded state */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="absolute inset-0 flex flex-col justify-end p-8"
                    >
                      {/* Language badge */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.accent }} />
                        <span className="text-white/60 text-sm font-['Neutraface_2_Text:Book',sans-serif]">{lang.nativeName}</span>
                      </div>

                      <h3 className="text-3xl font-['Neutraface_2_Text:Bold',sans-serif] text-white mb-2">{lang.name}</h3>
                      <p className="text-white/60 text-sm font-['Neutraface_2_Text:Book',sans-serif] mb-6">{lang.description}</p>

                      {/* Categories */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        {lang.categories.map((cat, ci) => (
                          <div key={ci} className="bg-[rgba(255,255,255,0.08)] backdrop-blur-sm rounded-xl px-4 py-3 border border-[rgba(255,255,255,0.06)]">
                            <div className="flex items-center gap-2 mb-2 text-white/80 text-xs font-['Neutraface_2_Text:Demi',sans-serif]">
                              {cat.icon}
                              <span>{cat.title}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {cat.items?.map((item, i) => (
                                <span key={i} className="text-[11px] text-[rgba(255,255,255,0.6)] bg-[rgba(0,0,0,0.2)] px-2 py-0.5 rounded-md">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => navigate(`/egitimlerimiz/${LANGUAGE_GROUP_PROGRAM_SLUGS[lang.id]}`)}
                        className="group flex items-center gap-3 px-8 py-4 bg-[rgba(255,255,255,1)] text-[rgba(0,0,0,1)] rounded-full font-['Neutraface_2_Text:Bold',sans-serif] hover:bg-[#f0f0f0] transition-all"
                      >
                        <span>Programı Keşfet</span>
                        <div className="w-6 h-6 rounded-full bg-[rgba(0,0,0,1)] text-[rgba(255,255,255,1)] flex items-center justify-center group-hover:rotate-45 transition-transform">
                          <ArrowUpRight size={12} />
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* === MOBILE: Horizontal scroll cards === */}
        <div className="md:hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 no-scrollbar"
          >
            {languages.map((lang) => (
              <motion.div
                key={lang.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative min-w-[85vw] h-[470px] rounded-2xl overflow-hidden snap-center flex-shrink-0"
              >
                <ImageWithFallback src={lang.image} alt={lang.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.88)] via-[rgba(0,0,0,0.48)] to-[rgba(0,0,0,0.06)]" />

                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.accent }} />
                    <span className="text-white/70 text-xs font-['Neutraface_2_Text:Book',sans-serif] drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]">{lang.nativeName}</span>
                  </div>

                  <h3 className="text-2xl font-['Neutraface_2_Text:Bold',sans-serif] text-white mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]">{lang.name}</h3>
                  <p className="text-white/75 text-xs font-['Neutraface_2_Text:Book',sans-serif] mb-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]">{lang.description}</p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {lang.categories.map((cat, ci) => (
                      <div key={ci} className="bg-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 border border-[rgba(255,255,255,0.08)]">
                        <span className="text-white/85 text-[10px] font-['Neutraface_2_Text:Demi',sans-serif]">{cat.title}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cat.items?.map((item, i) => (
                            <span key={i} className="text-[9px] text-white/70 bg-[rgba(0,0,0,0.34)] px-1.5 py-0.5 rounded">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate(`/egitimlerimiz/${LANGUAGE_GROUP_PROGRAM_SLUGS[lang.id]}`)}
                    className="group flex items-center gap-2 self-start px-6 py-3 bg-white text-black rounded-full text-sm font-['Neutraface_2_Text:Bold',sans-serif]"
                  >
                    <span>Keşfet</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {languages.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === mobileIndex ? 'w-6 bg-[#E70000]' : 'w-1.5 bg-[rgba(255,255,255,0.2)]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Journey Step (scroll-activated) ───────────────────────────────── */
const journeySteps = [
  {
    num: '01',
    title: 'Herşeyden Önce Analiz',
    desc: 'Seviyeniz, hedefleriniz ve bu hedefe ulaşmak için ayırabileceğiniz zaman baz alınarak yol haritası oluşturulur.',
  },
  {
    num: '02',
    title: 'Planlama',
    desc: 'Kişisel yol haritanıza en uygun planlama size sunulur.',
  },
  {
    num: '03',
    title: 'Uygulama',
    desc: 'Teachera uzmanları beyninizin tüm sinaps yapılarını, ince bir ustalıkla örer!',
  },
  {
    num: '04',
    title: 'Ölçüm',
    desc: 'Hedefinize nisbetle aldığınız mesafe sürekli ölçümlenir ve takip edilir.',
  },
  {
    num: '05',
    title: 'Topluluk',
    desc: 'Yolda topluluğun kıymetli üyeleri ile tanıştığınız, birbirinize destek olduğunuzdan emin olunur.',
  },
];

function JourneyStepItem({ step, index, onActivate }: {
  step: typeof journeySteps[number];
  index: number;
  onActivate: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40% 0px -40% 0px' });

  useEffect(() => {
    if (isInView) onActivate(index);
  }, [isInView, index, onActivate]);

  return (
    <div ref={ref} className="relative flex gap-5 md:gap-7">
      {/* Dot column */}
      <div className="flex flex-col items-center shrink-0 w-8 md:w-10">
        {/* The dot */}
        <motion.div
          animate={{
            scale: isInView ? 1 : 0.5,
            opacity: isInView ? 1 : 0.3,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative z-10 flex items-center justify-center"
        >
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
            isInView
              ? 'bg-[#324D47] shadow-[0_0_0_4px_rgba(50,77,71,0.12),0_0_16px_rgba(50,77,71,0.2)]'
              : 'bg-[#E8E8E4]'
          }`}>
            <span className={`font-['Neutraface_2_Text:Bold',sans-serif] text-[10px] md:text-[11px] tracking-wide transition-colors duration-500 ${
              isInView ? 'text-white' : 'text-[#484848]/30'
            }`}>
              {step.num}
            </span>
          </div>
        </motion.div>
        {/* Connecting line (not on last) */}
        {index < journeySteps.length - 1 && (
          <div className="w-[2px] flex-1 min-h-[40px] bg-[#E8E8E4] relative mt-1">
            <motion.div
              className="absolute inset-x-0 top-0 bg-[#324D47] origin-top"
              animate={{ height: isInView ? '100%' : '0%' }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <motion.div
        animate={{ opacity: isInView ? 1 : 0.2, y: isInView ? 0 : 6 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`pb-6 md:pb-8 ${index === journeySteps.length - 1 ? 'pb-0' : ''} relative`}
      >
        {/* Ambient glow behind active content */}
        <motion.div
          animate={{ opacity: isInView ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          className="absolute -left-3 top-0 w-24 h-10 bg-[#324D47]/[0.04] blur-[18px] rounded-full pointer-events-none"
        />
        <h3 className={`font-['Neutraface_2_Text:Bold',sans-serif] text-[15px] md:text-base leading-[1.3] mb-1 transition-colors duration-400 relative ${
          isInView ? 'text-[#09090F]' : 'text-[#09090F]/20'
        }`}>
          {step.title}
        </h3>
        <p className={`font-['Neutraface_2_Text:Book',sans-serif] text-[12px] md:text-[13px] leading-relaxed max-w-[440px] transition-colors duration-400 relative ${
          isInView ? 'text-[#484848]/60' : 'text-[#484848]/15'
        }`}>
          {step.desc}
        </p>
      </motion.div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────── */
export default function WhoWeAre() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isLiteMode = useLiteMode();
  const [activeGoal, setActiveGoal] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [scrollDrivenStep, setScrollDrivenStep] = useState<number>(0);
  const [userOverride, setUserOverride] = useState(false);
  const [enableScrollEffects, setEnableScrollEffects] = useState(false);
  const { open: openFreeTrial } = useFreeTrial();
  const { open: openLevelAssessment } = useLevelAssessment();
  const [journeyReached, setJourneyReached] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ['start 0.85', 'end 0.3'],
  });
  const timelineStepCount = 4;
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const timelineWidth = useTransform(timelineProgress, [0, 1], ['0%', '100%']);
  const timelineFill = enableScrollEffects
    ? timelineWidth
    : `${((activeStep + 1) / timelineStepCount) * 100}%`;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const update = () => {
      setEnableScrollEffects(mediaQuery.matches && !shouldReduceMotion && !isLiteMode);
    };

    update();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, [isLiteMode, shouldReduceMotion]);

  // Auto-drive activeStep based on scroll progress
  useMotionValueEvent(timelineProgress, 'change', (latest) => {
    if (!enableScrollEffects) return;
    const newStep = Math.min(Math.floor(latest * timelineStepCount), timelineStepCount - 1);
    setScrollDrivenStep(Math.max(0, newStep));
    if (!userOverride) {
      setActiveStep(Math.max(0, newStep));
    }
  });

  // Reset user override after a timeout so scroll takes over again
  const overrideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleManualStep = useCallback((idx: number) => {
    setActiveStep(idx);
    setUserOverride(true);
    if (overrideTimerRef.current) clearTimeout(overrideTimerRef.current);
    overrideTimerRef.current = setTimeout(() => {
      setUserOverride(false);
    }, 3000);
  }, []);

  const handleJourneyActivate = useCallback((idx: number) => {
    setJourneyReached((prev) => Math.max(prev, idx + 1));
  }, []);

  const stats = [
    { value: 6, suffix: ' Yıl', label: 'AR-GE Süreci', icon: Sparkles },
    { value: 7, suffix: ' Dil', label: 'Eğitim Dili', icon: Languages },
    { value: 23, suffix: '+', label: 'Özgün Program', icon: BookOpen },
    { value: 1000, suffix: '+', label: 'Mutlu Öğrenci', icon: GraduationCap },
  ];

  const timelineSteps = [
    {
      year: '2016',
      label: 'Başlangıç',
      summary: 'Türkiye\'deki dil eğitimindeki sorunları tespit etmek için yola çıktık.',
      detail: 'Klasik ezber odaklı yöntemlerin neden işe yaramadığını anlamak için sahaya indik. Yüzlerce öğrenci ve eğitmenle birebir görüşmeler yaptık, mevcut sistemin kırılma noktalarını haritaladık.',
    },
    {
      year: '2018',
      label: 'Keşif',
      summary: 'Dünya genelinde farklı öğrenci tiplerinde uygulanan metotları test ettik.',
      detail: 'İngiltere, ABD, Kanada ve Avrupa\'daki dil okullarının metodolojilerini analiz ettik. Farklı yaş grupları ve öğrenme stillerine göre hangi yaklaşımların sonuç verdiğini deneysel olarak ölçtük.',
    },
    {
      year: '2020',
      label: 'İnşa',
      summary: 'Kendi özgün metodolojimizi inşa ettik: minimum süre, maksimum performans.',
      detail: 'Beynin doğal dil edinim reflekslerini harekete geçiren, kültür entegrasyonlu ve konuşma odaklı bir sistem kurduk. 29 farklı programa uyarlanabilecek esnek bir müfredat altyapısı geliştirdik.',
    },
    {
      year: '2022',
      label: 'Büyüme',
      summary: '7 dilde eğitim, binlerce öğrenci ve sürekli gelişen bir ekosistem.',
      detail: 'Yüz yüze ve online eğitim modellerini harmanlayarak Türkiye\'nin her yerinden ve yurt dışından öğrencilere ulaştık. Kurumsal programlar, çocuk eğitimleri ve akademik hazırlık modülleri ile yelpazeyi genişlettik.',
    },
  ];

  return (
    <div className="bg-[#FDFDFD] min-h-screen overflow-x-hidden">

      {/* ── 1. HERO ────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-auto min-h-[80vh] md:min-h-[88vh] overflow-hidden">
        {/* Parallax background */}
        <motion.div className="absolute inset-0" style={enableScrollEffects ? { y: heroY } : undefined}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#00000B]/75 via-[#00000B]/45 to-[#00000B]/90 z-10" />
          <ImageWithFallback
            src={imgHero}
            className="w-full h-full object-cover scale-110"
            alt="Teachera Community"
          />
        </motion.div>

        {/* Content */}
        <motion.div
          className="relative z-20 min-h-[80vh] md:min-h-[88vh] flex flex-col items-center justify-center text-center px-6 py-16"
          style={enableScrollEffects ? { opacity: heroOpacity } : undefined}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="space-y-5"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 60 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-[2px] bg-[#E70000] mx-auto"
            />
            
            <span className="text-[#E70000] font-['Neutraface_2_Text:Bold',sans-serif] tracking-[0.3em] text-xs uppercase block">
              TEACHERA AİLESİ
            </span>

            <h1 className="text-5xl md:text-7xl font-['Neutraface_2_Text:Bold',sans-serif] text-white leading-none" style={{ textShadow: '0 2px 30px rgba(0,0,0,0.4), 0 8px 60px rgba(50,77,71,0.15)' }}>
              WHO WE ARE?
            </h1>

            <p className="text-[#EEEBF5]/75 font-['Neutraface_2_Text:Book',sans-serif] italic text-lg md:text-[1.35rem] max-w-lg mx-auto tracking-wide" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
              "Bir dil okulundan çok daha fazlası.."
            </p>

            <span className="text-[#E70000] font-['Neutraface_2_Text:Bold',sans-serif] tracking-[0.3em] text-xs uppercase block">
              BİZ KİMİZ
            </span>



            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 60 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-[2px] bg-[#E70000] mx-auto"
            />

            {/* ── Vizyon yazısı (kırmızı çizginin altı) ── */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="max-w-lg mx-auto pt-1"
            >
              <span className="text-[#EEEBF5]/50 font-['Neutraface_2_Text:Book',sans-serif] text-sm md:text-base leading-relaxed">
                Öğrenmeyi öğrenebileceğiniz, kültürler arası bir topluluğun inşa edildiği
              </span>
              <br />
              <span className="text-white/90 font-['Neutraface_2_Text:Bold',sans-serif] text-sm md:text-base">
                sosyal bir yaşam alanıdır.
              </span>
            </motion.p>

            {/* ── Play Button (hero içinde) ── */}
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mx-auto mt-2 group cursor-pointer relative block"
              onClick={() => { /* Video oynatma mantığı */ }}
            >
              <div className="absolute inset-0 bg-white/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              <div className="w-14 h-14 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-all duration-500 relative z-10">
                <div className="w-9 h-9 bg-[#E70000] rounded-full flex items-center justify-center pl-0.5 shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <Play fill="currentColor" className="text-white w-3 h-3" />
                </div>
              </div>
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-white/35 text-[9px] font-['Neutraface_2_Text:Book',sans-serif] tracking-[0.2em] uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                Tanıtım Filmi
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. GÜVEN MİKRO-ŞERİT ──────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-[#09090F] border-t border-b border-white/[0.06] relative overflow-hidden"
      >
        <div className="max-w-[1200px] mx-auto px-6 py-4 md:py-5">
          <div className="flex items-center justify-center gap-3 md:gap-5 flex-wrap">
            {[
              { label: "2016'dan beri", accent: false },
              { label: '6 yıl Ar‑Ge', accent: true },
              { label: '7 dil', accent: false },
              { label: '23 özelleştirilmiş program', accent: true },
            ].map((item, i) => (
              <span key={item.label} className="flex items-center gap-3 md:gap-5">
                <span
                  className={`font-['Neutraface_2_Text:${item.accent ? 'Bold' : 'Book'}',sans-serif] text-xs md:text-sm tracking-wide ${
                    item.accent ? 'text-white/80' : 'text-white/45'
                  }`}
                >
                  {item.label}
                </span>
                {i < 3 && (
                  <span className="text-[#E70000]/60 text-[8px] select-none">●</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── 3. HEDEFİNİ SEÇ ─────────────────────────────────────────────────��� */}
      <section className="py-10 md:py-14 bg-[#09090F] relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#324D47]/[0.06] blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#324D47]/[0.04] blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#E70000]/[0.015] blur-[100px] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-6 md:mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 24 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="h-[1px] bg-[#E70000]"
              />
              <span className="text-[#E70000] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] text-[10px] uppercase">
                Hedefe Özel Sistem
              </span>
            </div>
            <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-2xl md:text-[2.2rem] leading-[1.15] tracking-tight">
              Hedefini seç,{' '}
              <span className="text-[#ffffff]/25 font-['Neutraface_2_Text:Book',sans-serif] italic">
                biz sistemi sana uyarlayalım.
              </span>
            </h2>
          </motion.div>

          {/* 3 Goal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
            {[
              {
                id: 0,
                num: '01',
                title: 'Konuşma\nAkıcılığı',
                subtitle: 'Günlük iletişimde kendini doğal ve akıcı ifade et.',
                desc: 'Gerçek yaşam senaryoları, native speaker eğitmenler ve konuşma odaklı müfredatımızla dilinizi akıcı ve doğal bir şekilde kullanmanızı sağlıyoruz. Telaffuzdan tonlamaya, günlük kalıplardan sosyal etkileşime kadar her detay planlanmıştır.',
              },
              {
                id: 1,
                num: '02',
                title: 'Hedeflerim\nVar',
                subtitle: 'IELTS, TOEFL, YDS ve akademik hedefler için stratejik plan.',
                desc: 'Akademik sınavlara hazırlık sürecinizi stratejik bir planla yönetiyoruz. Okuma, yazma, dinleme ve konuşma modüllerinin her biri için özelleştirilmiş çalışma programları ve birebir geri bildirimlerle hedef puanınıza ulaşmanızı sağlıyoruz.',
              },
              {
                id: 2,
                num: '03',
                title: 'Kariyer\nİş İngilizcesi',
                subtitle: 'Profesyonel dünyada fark yaratan dil yetkinliği.',
                desc: 'İş toplantılarından e-posta yazımına, müzakerelerden networking becerilerine kadar iş dünyasının gerektirdiği dil yetkinliklerini kazanmanızı sağlıyoruz. Sektöre özel terminoloji ve iş kültürü entegrasyonu ile profesyonel kimliğinizi güçlendiriyoruz.',
              },
            ].map((card, i) => {
              const isSelected = activeGoal === card.id;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  onClick={() => setActiveGoal(isSelected ? null : card.id)}
                  className="relative cursor-pointer group"
                >
                  {/* Ambient card glow */}
                  <motion.div
                    animate={{ opacity: isSelected ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute -inset-3 rounded-3xl bg-[#324D47]/[0.08] blur-[25px] pointer-events-none"
                  />
                  <motion.div
                    animate={{ y: isSelected ? -4 : 0 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
                      isSelected
                        ? 'bg-[#324D47] shadow-[0_16px_50px_rgba(50,77,71,0.35),0_0_80px_rgba(50,77,71,0.1)] border border-[#324D47]/80'
                        : 'bg-[#ffffff]/[0.03] border border-[#ffffff]/[0.06] hover:bg-[#6B1D2A] hover:border-[#6B1D2A]/70 hover:shadow-[0_16px_50px_rgba(107,29,42,0.35),0_0_80px_rgba(107,29,42,0.1)]'
                    }`}
                  >
                    {/* Top accent */}
                    <motion.div
                      initial={false}
                      animate={{ scaleX: isSelected ? 1 : 0 }}
                      transition={{ duration: 0.4 }}
                      className="h-[2px] bg-[#E70000] origin-left"
                    />

                    <div className="p-6 md:p-7">
                      {/* Number + Selection dot */}
                      <div className="flex items-center justify-between mb-5">
                        <span className={`font-['Neutraface_2_Text:Demi',sans-serif] text-xs tracking-[0.15em] transition-colors duration-500 ${
                          isSelected ? 'text-[#ffffff]/50' : 'text-[#ffffff]/15 group-hover:text-[#ffffff]/40'
                        }`}>
                          {card.num}
                        </span>

                        <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-all duration-400 ${
                          isSelected
                            ? 'border-white'
                            : 'border-[#ffffff]/12 group-hover:border-[#ffffff]/35'
                        }`}>
                          <motion.div
                            initial={false}
                            animate={{
                              scale: isSelected ? 1 : 0,
                              opacity: isSelected ? 1 : 0,
                            }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="w-2 h-2 rounded-full bg-white"
                          />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className={`font-['Neutraface_2_Text:Bold',sans-serif] text-[1.35rem] md:text-[1.5rem] leading-[1.2] whitespace-pre-line mb-2 transition-colors duration-500 ${
                        isSelected ? 'text-white' : 'text-[#ffffff]/70 group-hover:text-white'
                      }`}>
                        {card.title}
                      </h3>

                      {/* Subtitle */}
                      <p className={`font-['Neutraface_2_Text:Book',sans-serif] text-[12px] leading-relaxed transition-colors duration-500 ${
                        isSelected ? 'text-[#ffffff]/55' : 'text-[#ffffff]/20 group-hover:text-[#ffffff]/50'
                      }`}>
                        {card.subtitle}
                      </p>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="overflow-hidden"
                          >
                            <div className="pt-5 mt-5 border-t border-[#ffffff]/10">
                              <p className="text-[#ffffff]/45 font-['Neutraface_2_Text:Book',sans-serif] text-[13px] leading-relaxed mb-5">
                                {card.desc}
                              </p>

                              <motion.button
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.15 }}
                                className="group/cta inline-flex items-center gap-2.5 bg-transparent border border-white/40 text-white font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-wide px-5 py-2.5 rounded-full hover:bg-white/10 hover:border-white/60 transition-all duration-300 cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); navigate('/egitimlerimiz'); }}
                              >
                                Kişisel Yol Haritamı Göster
                                <motion.span
                                  className="inline-block"
                                  animate={{ x: [0, 3, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                  <ArrowRight size={14} />
                                </motion.span>
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. FELSEFEMİZ ──────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-[#FDFDFD] relative overflow-hidden">
        {/* Subtle decorative */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#324D47]/[0.02] blur-[140px] pointer-events-none" />

        <div className="max-w-[760px] mx-auto px-6 relative z-10">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-3"
          >
            <div className="h-[1px] w-6 bg-[#E70000]" />
            <span className="text-[#E70000] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] text-[10px] uppercase">
              Felsefemiz
            </span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-2xl md:text-[2.2rem] leading-[1.1] tracking-tight mb-6 md:mb-8 relative inline-block"
          >
            Neden varız?
            <motion.span
              className="absolute -bottom-1.5 left-0 h-[3px] bg-[#E70000]/15 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: '40%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </motion.h2>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mb-6 md:mb-8 pl-6 border-l-[2px] border-[#E70000] relative"
          >
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-32 h-16 bg-[#E70000]/[0.05] blur-[35px] rounded-full pointer-events-none" />
            <p className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-lg md:text-[1.5rem] leading-[1.35] tracking-tight italic relative" style={{ textShadow: '0 1px 20px rgba(231,0,0,0.04)' }}>
              "Kaliteli eğitim, lüks değildir."
            </p>
          </motion.div>

          {/* Body block 1 */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-['Neutraface_2_Text:Book',sans-serif] text-[#484848]/80 text-[15px] md:text-base leading-[1.8] mb-4"
          >
            Biz, kaliteli eğitimi bir ayrıcalık olmaktan çıkarıp herkes için ulaşılabilir kılmaya çalışan bir topluluğuz.
          </motion.p>

          {/* Body block 2 */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="font-['Neutraface_2_Text:Book',sans-serif] text-[#484848]/60 text-[15px] md:text-base leading-[1.8]"
          >
            Dil öğrenme sürecini yalnızca kaliteli ve verimli değil; keyifli ve herkes için sürdürülebilir bir deneyime dönüştürmek için yıllardır çaba gösteriyoruz.
          </motion.p>
        </div>
      </section>

      {/* ── 5. HİKAYE / TIMELINE ─────────────────────────────────────────── */}
      <section ref={timelineRef} className="py-12 md:py-16 bg-white relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-6 bg-[#E70000]" />
              <span className="text-[#E70000] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] text-[10px] uppercase">
                Hikayemiz
              </span>
            </div>
            <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-2xl md:text-[2.2rem] leading-[1.1] tracking-tight mb-6">
              Kilometre Taşlarımız
            </h2>
          </motion.div>

          {/* Lead quote */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-[800px] mb-8 md:mb-10 pl-6 border-l-[2px] border-[#324D47]"
          >
            <p className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-lg md:text-xl leading-[1.45] tracking-tight">
              "2016'da başladık. 6 yıl boyunca sadece şunu yaptık:{' '}
              <span className="text-[#324D47]">Dil eğitimindeki hataları bulup sistemi yeniden kurduk.</span>"
            </p>
          </motion.div>

          {/* ─── DESKTOP: Horizontal Timeline ─── */}
          <div className="hidden md:block">
            {/* Timeline bar */}
            <div className="relative mb-12">
              <div className="h-[2px] bg-[#E8E8E4] w-full rounded-full" />
              <motion.div
                className="absolute top-0 left-0 h-[2px] rounded-full origin-left"
                style={{
                  width: timelineFill,
                  background: 'linear-gradient(90deg, #324D47, #70C0AE)',
                }}
              />

              {/* Dots */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between">
                {timelineSteps.map((step, i) => {
                  const isActive = activeStep === i;
                  const isPast = i <= scrollDrivenStep;
                  return (
                    <button
                      key={step.year}
                      onClick={() => handleManualStep(i)}
                      className="relative group cursor-pointer"
                    >
                      {/* Pulse ring for active */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute -inset-1.5 rounded-full bg-[#324D47]/30"
                        />
                      )}
                      {/* Glow */}
                      {isActive && (
                        <motion.div
                          layoutId="timeline-dot-glow"
                          className="absolute -inset-3 rounded-full blur-[8px]"
                          style={{ background: 'radial-gradient(circle, rgba(50,77,71,0.35) 0%, transparent 70%)' }}
                          transition={{ duration: 0.4 }}
                        />
                      )}
                      <motion.div
                        animate={{
                          scale: isActive ? 1.5 : isPast ? 1.15 : 1,
                          backgroundColor: isActive ? '#324D47' : isPast ? '#70C0AE' : '#E8E8E4',
                        }}
                        whileHover={{ scale: 1.3, backgroundColor: '#324D47' }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="relative z-10 w-3.5 h-3.5 rounded-full border-[2.5px] border-white"
                        style={{
                          boxShadow: isActive
                            ? '0 0 0 2.5px #324D47, 0 0 16px rgba(50,77,71,0.35)'
                            : isPast
                            ? '0 0 0 2px #70C0AE'
                            : '0 0 0 2px #E8E8E4',
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Year + Label row */}
            <div className="grid grid-cols-4 gap-6 mb-5">
              {timelineSteps.map((step, i) => {
                const isActive = activeStep === i;
                const isPast = i <= scrollDrivenStep;
                return (
                  <button
                    key={step.year}
                    onClick={() => handleManualStep(i)}
                    className="text-left cursor-pointer group"
                  >
                    <motion.span
                      animate={{
                        color: isActive ? '#324D47' : isPast ? 'rgba(50,77,71,0.55)' : 'rgba(9,9,15,0.2)',
                      }}
                      transition={{ duration: 0.5 }}
                      className="block font-['Neutraface_2_Text:Bold',sans-serif] text-[1.75rem] leading-none tracking-tight group-hover:!text-[#324D47]/70"
                    >
                      {step.year}
                    </motion.span>
                    <motion.span
                      animate={{
                        color: isActive ? '#E70000' : isPast ? 'rgba(231,0,0,0.35)' : 'rgba(72,72,72,0.3)',
                      }}
                      transition={{ duration: 0.5 }}
                      className="block font-['Neutraface_2_Text:Demi',sans-serif] text-[11px] tracking-[0.12em] uppercase mt-2"
                    >
                      {step.label}
                    </motion.span>
                  </button>
                );
              })}
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-4 gap-6">
              {timelineSteps.map((step, i) => {
                const isActive = activeStep === i;
                const isPast = i <= scrollDrivenStep;
                return (
                  <motion.div
                    key={step.year}
                    className="min-h-[120px]"
                    animate={{ opacity: isActive ? 1 : isPast ? 0.7 : 0.35 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className={`font-['Neutraface_2_Text:Book',sans-serif] text-[13px] leading-[1.7] transition-colors duration-500 ${
                      isActive ? 'text-[#484848]/90' : 'text-[#484848]/40'
                    }`}>
                      {step.summary}
                    </p>

                    {/* Expandable detail */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <motion.div
                            initial={{ y: 8 }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="pt-3 mt-3 border-t border-[#324D47]/20"
                          >
                            <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[12.5px] leading-[1.7] text-[#484848]/60">
                              {step.detail}
                            </p>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ─── MOBILE: Vertical Timeline ─── */}
          <div className="md:hidden">
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-[5px] top-0 bottom-0 w-[2px] bg-[#E8E8E4]" />
              <motion.div
                className="absolute left-[5px] top-0 w-[2px] origin-top"
                style={{
                  height: timelineFill,
                  background: 'linear-gradient(180deg, #324D47, #70C0AE)',
                }}
              />

              <div className="space-y-8">
                {timelineSteps.map((step, i) => {
                  const isActive = activeStep === i;
                  const isPast = i <= scrollDrivenStep;
                  return (
                    <div key={step.year} className="relative">
                      {/* Dot */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: [1, 1.6, 1], opacity: [0.35, 0, 0.35] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute -left-[34px] top-[2px] w-3.5 h-3.5 rounded-full bg-[#324D47]/30"
                        />
                      )}
                      <motion.div
                        animate={{
                          scale: isActive ? 1.4 : isPast ? 1.15 : 1,
                          backgroundColor: isActive ? '#324D47' : isPast ? '#70C0AE' : '#E8E8E4',
                        }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute -left-8 top-1 w-3 h-3 rounded-full border-[2px] border-white"
                        style={{
                          boxShadow: isActive
                            ? '0 0 0 1.5px #324D47, 0 0 10px rgba(50,77,71,0.3)'
                            : isPast
                            ? '0 0 0 1.5px #70C0AE'
                            : '0 0 0 1.5px #E8E8E4',
                        }}
                      />

                      <button
                        onClick={() => handleManualStep(i)}
                        className="text-left w-full cursor-pointer"
                      >
                        <motion.span
                          animate={{
                            color: isActive ? '#324D47' : isPast ? 'rgba(50,77,71,0.5)' : 'rgba(9,9,15,0.2)',
                          }}
                          transition={{ duration: 0.5 }}
                          className="font-['Neutraface_2_Text:Bold',sans-serif] text-[1.35rem] tracking-tight block"
                        >
                          {step.year}
                        </motion.span>
                        <motion.span
                          animate={{
                            color: isActive ? '#E70000' : isPast ? 'rgba(231,0,0,0.3)' : 'rgba(72,72,72,0.3)',
                          }}
                          transition={{ duration: 0.5 }}
                          className="block font-['Neutraface_2_Text:Demi',sans-serif] text-[10px] tracking-[0.12em] uppercase mt-1"
                        >
                          {step.label}
                        </motion.span>
                        <motion.p
                          animate={{ opacity: isActive ? 0.8 : isPast ? 0.5 : 0.3 }}
                          transition={{ duration: 0.5 }}
                          className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] leading-[1.7] mt-2.5 text-[#484848]"
                        >
                          {step.summary}
                        </motion.p>
                      </button>

                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <motion.div
                              initial={{ y: 6 }}
                              animate={{ y: 0 }}
                              transition={{ duration: 0.35, delay: 0.1 }}
                              className="pt-3 mt-2 border-t border-[#324D47]/20"
                            >
                              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[12.5px] leading-[1.7] text-[#484848]/60">
                                {step.detail}
                              </p>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Closing quote + CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8 md:mt-10 pt-6 border-t border-[#E8E8E4]"
          >
            <p className="font-['Neutraface_2_Text:BookItalic',sans-serif] italic text-[#484848]/50 text-sm md:text-base leading-relaxed max-w-[700px] mb-8">
              "Dünyada farklı öğrenci tiplerinde uzun yıllardır uygulanan birçok metodu denedik; metodolojimiz bu tecrübelerin üzerine kurgulandı."
            </p>

            <motion.button
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
              className="group inline-flex items-center gap-2.5 font-['Neutraface_2_Text:Bold',sans-serif] text-[#324D47] text-sm tracking-wide cursor-pointer"
            >
              Metodolojiyi Gör
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── 6. NEDEN TEACHERA? ─────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-[#F7F7F5] to-[#FDFDFD] overflow-hidden relative">
        {/* Subtle BG decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#324D47]/[0.02] blur-[120px] pointer-events-none" />

        <div className="max-w-[960px] mx-auto px-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-7 md:mb-9"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[1px] w-6 bg-[#E70000]" />
              <span className="text-[#E70000] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] text-[10px] uppercase">
                Farkımız
              </span>
            </div>
            <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-2xl md:text-[2.2rem] leading-[1.1] tracking-tight">
              Neden{' '}
              <span className="text-[#324D47] relative">
                Teachera
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#324D47]/10 rounded-full" />
              </span>?
            </h2>
          </motion.div>

          {/* 4 Numbered Items */}
          <div className="space-y-0">
            {[
              {
                num: '01',
                title: 'Standardize Öğretmen Kalitesi',
                desc: 'Her Teachera öğretmeni, native speaker, tecrübeli ve eğitimli olmasının yanı sıra metodolojimizin eğitimini alır; süreç boyunca değerlendirilir ve standardı karşılayanlar Teachera içerisinde ders vermeye yetkilendirilir.',
              },
              {
                num: '02',
                title: 'Hedefe Göre Optimize Müfredat',
                desc: 'Herkese her şeyi değil; her bireye ihtiyacı olanı öğretme prensibi.',
              },
              {
                num: '03',
                title: 'Özelleştirilmiş Eğitim Sistemi',
                desc: 'Her yaş ve koşul için sonuç odaklı mekanizmalar.',
              },
              {
                num: '04',
                title: 'Sosyal Yaşam Alanı & Topluluk',
                desc: 'Sadece okul değil; öğrencinin sosyal olarak da tatmin olduğu, kopamayacağı bir topluluk.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group border-t border-[#09090F]/[0.06] last:border-b relative"
              >
                {/* Hover glow line */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#324D47] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-20 h-10 bg-[#324D47]/[0.03] blur-[20px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

                <div className="flex items-start gap-5 md:gap-7 py-5 md:py-6 group-hover:pl-2 transition-all duration-300">
                  {/* Number */}
                  <span className="font-['Neutraface_2_Text:Bold',sans-serif] text-[1.6rem] md:text-[2rem] leading-none tracking-tight text-[#09090F]/[0.06] group-hover:text-[#324D47]/25 transition-colors duration-400 select-none shrink-0 w-10 md:w-14">
                    {item.num}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[15px] md:text-base leading-[1.3] mb-1 group-hover:text-[#324D47] transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="font-['Neutraface_2_Text:BookItalic',sans-serif] italic text-[#484848]/45 text-[12px] md:text-[13px] leading-relaxed max-w-[600px] group-hover:text-[#484848]/60 transition-colors duration-300">
                      "{item.desc}"
                    </p>
                  </div>

                  {/* Hover arrow */}
                  <div className="hidden md:flex items-center h-full pt-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-4px] group-hover:translate-x-0">
                    <ArrowRight size={14} className="text-[#324D47]/40" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 md:mt-10 flex justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={openFreeTrial}
              className="group px-6 py-2.5 border border-[#324D47]/60 text-[#324D47] rounded-full text-sm font-['Neutraface_2_Text:Demi',sans-serif] hover:bg-[#324D47] hover:text-white transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              Ücretsiz Deneme Seansı
              <Play size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openLevelAssessment}
              className="px-6 py-2.5 border border-[#09090F]/15 text-[#484848] rounded-full text-sm font-['Neutraface_2_Text:Book',sans-serif] hover:bg-[#09090F]/5 hover:border-[#09090F]/30 transition-all duration-300 cursor-pointer"
            >
              Seviyeni Öğren
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── 7. ÖĞRENCİ YOLCULUĞU ─────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#324D47]/[0.015] blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-[#E70000]/[0.01] blur-[80px] pointer-events-none" />

        <div className="max-w-[960px] mx-auto px-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-7 md:mb-9"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[1px] w-6 bg-[#E70000]" />
              <span className="text-[#E70000] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] text-[10px] uppercase">
                Öğrenci Yolculuğu
              </span>
            </div>
            <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-2xl md:text-[2.2rem] leading-[1.1] tracking-tight">
              Başlamak{' '}
              <span className="text-[#324D47] relative">başarmanın yarısıdır!
                <motion.span
                  className="absolute -bottom-1 left-0 h-[3px] bg-[#324D47]/15 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </span>
            </h2>
          </motion.div>

          {/* Two-column layout */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            {/* Left: Progress Path */}
            <div className="flex-1">
              {journeySteps.map((step, i) => (
                <JourneyStepItem
                  key={step.num}
                  step={step}
                  index={i}
                  onActivate={handleJourneyActivate}
                />
              ))}
            </div>

            {/* Right: Progress ring (desktop) */}
            <div className="hidden md:flex flex-col items-center justify-center w-48 shrink-0">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center sticky top-1/2"
              >
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {/* Ring glow */}
                  <div className="absolute inset-0 rounded-full bg-[#324D47]/[0.06] blur-[12px] scale-110 pointer-events-none" />
                  <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#E8E8E4" strokeWidth="2.5" />
                    <motion.circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="#324D47"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{
                        strokeDashoffset: 2 * Math.PI * 42 * (1 - journeyReached / journeySteps.length),
                      }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#324D47] text-xl tracking-tight">
                      {journeyReached}/{journeySteps.length}
                    </span>
                  </div>
                </div>
                <p className="font-['Neutraface_2_Text:Demi',sans-serif] text-[10px] tracking-[0.15em] uppercase text-[#484848]/35">
                  Adım tamamlandı
                </p>
              </motion.div>
            </div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 md:mt-10 flex flex-wrap gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate('/egitimlerimiz')}
              className="group inline-flex items-center gap-2.5 px-6 py-2.5 border border-[#324D47]/60 text-[#324D47] rounded-full text-sm font-['Neutraface_2_Text:Demi',sans-serif] hover:bg-[#324D47] hover:text-white transition-all duration-300 cursor-pointer"
            >
              Yol Haritamı Oluştur
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openFreeTrial}
              className="group inline-flex items-center gap-2 px-6 py-2.5 border border-[#09090F]/15 text-[#484848] rounded-full text-sm font-['Neutraface_2_Text:Book',sans-serif] hover:bg-[#09090F]/5 hover:border-[#09090F]/30 transition-all duration-300 cursor-pointer"
            >
              Ücretsiz Deneme Seansı
              <Play size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── 8. DİLLERİMİZ — 7 Dil Accordion Kartları ─────────────────── */}
      <LanguagesAccordionSection />

      {/* ── 9. TÜM PROGRAMLARIMIZ — 23+ Özelleştirilmiş Program ──────── */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-[#09090F] to-[#0D0D14] relative overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:48px_48px]" />
        </div>

        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 md:mb-10"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[1px] w-6 bg-[#E70000]" />
              <span className="text-[#E70000] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] text-[10px] uppercase">
                Programlarımız
              </span>
            </div>
            <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-2xl md:text-[2.2rem] leading-[1.1] tracking-tight mb-2">
              {ALL_PROGRAMS.length}+ Özelleştirilmiş{' '}
              <span className="text-white/25 font-['Neutraface_2_Text:Book',sans-serif] italic">
                Eğitim Programı
              </span>
            </h2>
            <p className="font-['Neutraface_2_Text:Book',sans-serif] text-white/35 text-[13px] md:text-[14px] leading-relaxed max-w-[620px]">
              Her yaş, seviye ve hedef için özel olarak tasarlanmış programlarımız. Herkese her şeyi değil; her bireye ihtiyacı olanı öğretiyoruz.
            </p>
          </motion.div>

          {/* Program Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {(() => {
              /* ── Yaş grubuna göre dil listesini ALL_PROGRAMS'dan dinamik hesapla ── */
              type ProgramAge = (typeof ALL_PROGRAMS)[number]['ages'][number];
              const langsByAge = (age: ProgramAge) =>
                [...new Set(ALL_PROGRAMS.filter(p => p.ages.includes(age) && p.category !== 'exam' && p.category !== 'career').map(p => p.languageLabel))];
              const childLangs = langsByAge('child');
              const teenLangs = langsByAge('teen');
              const adultLangs = langsByAge('adult');

              const categories: { cat: string; num: string; accent: string; programs: { name: string; detail: string; tag: string; badge?: string }[] }[] = [
                {
                  cat: 'Yaş Gruplarına Göre',
                  num: '01',
                  accent: '#70C0AE',
                  programs: [
                    { name: 'Mini Kids (4–6 yaş)', detail: 'İngilizce · Oyunla öğrenme', tag: 'Çocuk', badge: 'Sadece Yüz Yüze' },
                    { name: 'Kids (7–12 yaş)', detail: childLangs.join(', '), tag: 'Çocuk' },
                    { name: 'Teens (13–17 yaş)', detail: teenLangs.join(', '), tag: 'Genç' },
                    { name: 'Yetişkin Genel', detail: `${adultLangs.length} dilde · A1–C2 seviye`, tag: 'Yetişkin' },
                  ],
                },
                {
                  cat: 'Sınav Hazırlık',
                  num: '02',
                  accent: '#E70000',
                  programs: [
                    { name: 'IELTS Hazırlık', detail: 'Akademik & General Training', tag: 'İngilizce' },
                    { name: 'TOEFL IBT', detail: 'Reading, Writing, Speaking, Listening', tag: 'İngilizce' },
                    { name: 'PTE Academic', detail: 'Pearson uluslararası sınav', tag: 'İngilizce' },
                    { name: 'YDS / YÖKDİL', detail: 'Türkiye akademik sınavları', tag: 'İngilizce' },
                    { name: 'DELE / SIELE', detail: 'İspanyolca resmi sertifika', tag: 'İspanyolca' },
                    { name: 'Goethe / TestDaF', detail: 'Almanca yeterlilik sınavları', tag: 'Almanca' },
                    { name: 'DELF / DALF', detail: 'Fransızca akademik sınavlar', tag: 'Fransızca' },
                    { name: 'CILS / CELI', detail: 'İtalyanca resmi sertifika', tag: 'İtalyanca' },
                    { name: 'TORFL', detail: 'Rusça yeterlilik sınavı', tag: 'Rusça' },
                  ],
                },
                {
                  cat: 'İş Dünyası & Kariyer',
                  num: '03',
                  accent: '#6B1D2A',
                  programs: [
                    { name: 'Business English', detail: 'Toplantı, müzakere, sunum', tag: 'İngilizce' },
                    { name: 'Marketing English', detail: 'Pazarlama terminolojisi', tag: 'İngilizce' },
                    { name: 'Finance English', detail: 'Finans ve yatırımcı iletişimi', tag: 'İngilizce' },
                    { name: 'Legal English', detail: 'Hukuk terminolojisi', tag: 'İngilizce' },
                    { name: 'Medical English', detail: 'Tıp terminolojisi', tag: 'İngilizce' },
                    { name: 'Hukuki Fransızca', detail: 'Hukuk terminolojisi', tag: 'Fransızca' },
                  ],
                },
                {
                  cat: 'Kurumsal Çözümler',
                  num: '04',
                  accent: '#EEEBF5',
                  programs: [
                    { name: 'Şirket İçi Eğitim', detail: 'Sektöre özel müfredat', tag: 'Kurumsal' },
                    { name: 'Akademik İş Birliği', detail: 'Üniversite, okul, bakanlık protokolleri', tag: 'Kurumsal' },
                  ],
                },
                {
                  cat: 'Özel Modüller',
                  num: '05',
                  accent: '#FFC400',
                  programs: [
                    { name: 'Yoğun Kamp', detail: '1–3 aylık hızlandırılmış', tag: 'İntensif' },
                    { name: 'Birebir VIP', detail: 'Tamamen kişiselleştirilmiş', tag: 'Premium' },
                    { name: 'Aile Paketi', detail: 'Ebeveyn + çocuk birlikte', tag: 'Aile' },
                  ],
                },
              ];

              return categories.map((category, catIdx) => (
              <motion.article
                key={category.cat}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: catIdx * 0.07 }}
                className="group/card relative rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#6B1D2A]/40 transition-all duration-500 overflow-hidden"
              >
                {/* Bordo left accent bar — reveals on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#6B1D2A] to-[#6B1D2A]/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                {/* Top glow */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#6B1D2A]/[0.06] to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Category header */}
                <div className="relative p-5 pb-3 border-b border-white/[0.04] group-hover/card:border-[#6B1D2A]/15 transition-colors duration-500">
                  <div className="flex items-center gap-3">
                    <span
                      className="font-['Neutraface_2_Text:Bold',sans-serif] text-[22px] leading-none tracking-tight opacity-25 group-hover/card:opacity-60 transition-opacity duration-500"
                      style={{ color: category.accent }}
                    >
                      {category.num}
                    </span>
                    <div>
                      <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-[14px] leading-tight">
                        {category.cat}
                      </h3>

                    </div>
                  </div>
                </div>

                {/* Program list */}
                <div className="relative p-3">
                  {category.programs.map((prog, pIdx) => (
                    <div
                      key={prog.name}
                      className={`group/item relative flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-[#6B1D2A]/[0.08] transition-all duration-300 cursor-default ${
                        pIdx < category.programs.length - 1 ? 'border-b border-white/[0.03]' : ''
                      }`}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 opacity-40 group-hover/item:opacity-100 group-hover/item:scale-[1.6] group-hover/item:shadow-[0_0_8px_rgba(107,29,42,0.4)] transition-all duration-300"
                        style={{ backgroundColor: category.accent }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-white/70 group-hover/item:text-white text-[12px] leading-tight transition-colors duration-300">
                            {prog.name}
                          </span>
                          <span className="inline-block px-1.5 py-px rounded text-[8px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-wider uppercase border border-white/[0.06] text-white/20 bg-white/[0.01] group-hover/item:border-[#6B1D2A]/30 group-hover/item:text-[#6B1D2A]/50 group-hover/item:bg-[#6B1D2A]/[0.06] transition-all duration-300">
                            {prog.tag}
                          </span>
                          {prog.badge && (
                            <span className="inline-flex items-center gap-1 px-2 py-px rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300/80 text-[8px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-wide uppercase">
                              <MapPin size={7} />
                              {prog.badge}
                            </span>
                          )}
                        </div>
                        <p className="font-['Neutraface_2_Text:Book',sans-serif] text-white/25 group-hover/item:text-white/45 text-[10px] leading-relaxed mt-0.5 transition-colors duration-300">
                          {prog.detail}
                        </p>
                      </div>
                      <ChevronRight size={12} className="mt-1.5 shrink-0 text-white/0 group-hover/item:text-[#6B1D2A]/50 transition-all duration-300 group-hover/item:translate-x-0.5" />
                    </div>
                  ))}
                </div>
              </motion.article>
            ));})()}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 md:mt-10 flex flex-wrap justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={openLevelAssessment}
              className="group inline-flex items-center gap-2.5 px-6 py-2.5 border border-[#324D47]/60 text-[#324D47] rounded-full text-sm font-['Neutraface_2_Text:Demi',sans-serif] hover:bg-[#324D47] hover:text-white transition-all duration-300 cursor-pointer"
            >
              Seviyeni Öğren, Programını Bul
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openFreeTrial}
              className="group inline-flex items-center gap-2 px-6 py-2.5 border border-white/15 text-white/60 rounded-full text-sm font-['Neutraface_2_Text:Book',sans-serif] hover:bg-white/5 hover:border-white/25 transition-all duration-300 cursor-pointer"
            >
              Ücretsiz Deneme Seansı
              <Play size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <SectionDivider dark />

      {/* ── 10. LOKASYON ──────────────────────────────────────────────────── */}
      <section className="relative py-14 md:py-20 bg-[#09090F] text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:40px_40px]" />
        </div>
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#324D47]/[0.04] blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#E70000]/[0.02] blur-[120px] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 md:mb-5"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 24 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="h-[1px] bg-[#E70000]"
              />
              <span className="text-[#E70000] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] text-[10px] uppercase">
                Neredeyiz
              </span>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 24 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="h-[1px] bg-[#E70000]"
              />
            </div>
            <h2 className="text-2xl md:text-[2.2rem] font-['Neutraface_2_Text:Bold',sans-serif] text-white leading-[1.1] tracking-tight mb-3">
              Güçlü topluluk ve online eğitim ile{' '}
              <span className="text-white/30 font-['Neutraface_2_Text:Book',sans-serif] italic">
                aslında her yerdeyiz!
              </span>
            </h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#324D47] text-base md:text-lg tracking-wide"
            >
              "Konya'da yüz yüze, dünyada online."
            </motion.p>
          </motion.div>

          {/* Intro paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center text-[#EEEBF5]/50 font-['Neutraface_2_Text:Book',sans-serif] text-mobile-meta md:text-[14px] leading-relaxed max-w-[680px] mx-auto mb-10 md:mb-14"
          >
            Teachera, Milli Eğitim Bakanlığına bağlı olarak Konya'da Kule Plaza 26. katta yüz yüze eğitimlerimize devam ederken, aynı zamanda online eğitim platformumuz üzerinden{' '}
            <span className="text-white/80 font-['Neutraface_2_Text:Bold',sans-serif]">tüm dünyadan</span>{' '}
            öğrencilerimize hizmet vermekteyiz.
          </motion.p>

          {/* ── Two Cards ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">

            {/* ─ LEFT: Yüz Yüze / Kampüs ─ */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative rounded-2xl overflow-hidden bg-[#ffffff]/[0.03] border border-[#ffffff]/[0.06] hover:border-[#324D47]/30 transition-all duration-500"
            >
              {/* Card image */}
              <div className="relative h-[220px] md:h-[260px] overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758448656987-cfae6bf225e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBnbGFzcyUyMHRvd2VyJTIwYnVpbGRpbmclMjBsb2JieSUyMHByZW1pdW18ZW58MXx8fHwxNzcxOTcwMDYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700"
                  alt="Kule Plaza Kampüs"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090F] via-[#09090F]/40 to-transparent" />

                {/* "26. KAT" branding motif — top right */}
                <div className="absolute top-4 right-4 flex flex-col items-end">
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <span className="font-['Neutraface_2_Text:Bold',sans-serif] text-[2.2rem] md:text-[2.8rem] leading-none tracking-tighter text-white/[0.08]">
                      26
                    </span>
                    <span className="block font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-kicker md:text-[9px] tracking-[0.12em] md:tracking-[0.25em] uppercase text-white/20 text-right -mt-1">
                      . KAT
                    </span>
                  </motion.div>
                </div>

                {/* Pulsing pin */}
                <div className="absolute bottom-5 left-5">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="absolute inset-0 w-8 h-8 rounded-full bg-[#E70000]/20 animate-ping" style={{ animationDuration: '2.5s' }} />
                      <div className="w-8 h-8 rounded-full bg-[#E70000]/20 backdrop-blur-sm flex items-center justify-center relative z-10">
                        <MapPin size={14} className="text-[#E70000]" />
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-['Neutraface_2_Text:Bold',sans-serif] text-mobile-meta md:text-[13px] leading-tight">Kule Plaza, Kat 26</p>
                      <p className="text-white/40 font-['Neutraface_2_Text:Book',sans-serif] text-mobile-kicker md:text-[10px]">Selçuklu, Konya</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="p-6 md:p-7">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#324D47]" />
                  <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-kicker md:text-[10px] tracking-[0.1em] md:tracking-[0.2em] uppercase text-[#324D47]">
                    Yüz Yüze Eğitim
                  </span>
                </div>

                <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-[1.15rem] md:text-[1.25rem] leading-[1.25] mb-3">
                  Kampüs Deneyimi
                </h3>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  {[
                    { icon: MapPin, text: 'Kule Plâza Kat: 26, Selçuklu – Konya', color: '#E70000' },
                    { icon: Users, text: 'Native Speaker Eğitmenler', color: '#70C0AE' },
                    { icon: BookOpen, text: 'Standardize Edilmiş Eğitim ve Metod', color: '#EEEBF5' },
                    { icon: Sparkles, text: 'Sosyal Yaşam Alanı', color: '#FFC400' },
                    { icon: GraduationCap, text: 'Güçlü Topluluk', color: '#70C0AE' },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${item.color}12` }}
                      >
                        <item.icon size={13} style={{ color: item.color }} />
                      </div>
                      <span className="font-['Neutraface_2_Text:Book',sans-serif] text-mobile-meta md:text-[12px] text-[#EEEBF5]/50">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <motion.a
                  href="https://maps.google.com/?q=Kule+Plaza+Konya"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="group/cta inline-flex min-h-[44px] items-center gap-2.5 px-5 py-2.5 border border-[#324D47]/50 text-[#324D47] rounded-full text-mobile-kicker md:text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.05em] md:tracking-wide hover:bg-[#324D47] hover:text-white hover:border-[#324D47] transition-all duration-300 cursor-pointer"
                >
                  Kampüsü Ziyaret Et
                  <MapPin size={13} className="group-hover/cta:translate-y-[-1px] transition-transform" />
                </motion.a>
              </div>
            </motion.div>

            {/* ─ RIGHT: Online Eğitim ─ */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="group relative rounded-2xl overflow-hidden bg-[#ffffff]/[0.03] border border-[#ffffff]/[0.06] hover:border-[#6B1D2A]/30 transition-all duration-500"
            >
              {/* Card image */}
              <div className="relative h-[220px] md:h-[260px] overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1614793351079-11dd79b922ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBlZHVjYXRpb24lMjBsYXB0b3AlMjBzdHVkZW50JTIwaG9tZSUyMGNvenl8ZW58MXx8fHwxNzcxOTcwMDY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  className="w-full h-full object-cover opacity-40 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700"
                  alt="Online Eğitim"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090F] via-[#09090F]/40 to-transparent" />

                {/* Globe motif — top right */}
                <div className="absolute top-4 right-4">
                  <motion.div
                    initial={{ opacity: 0, rotate: -10 }}
                    whileInView={{ opacity: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] flex items-center justify-center"
                  >
                    <Globe size={20} className="text-white/15" />
                  </motion.div>
                </div>

                {/* Online badge */}
                <div className="absolute bottom-5 left-5">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-2 h-2 rounded-full bg-[#70C0AE] animate-pulse" />
                      <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#70C0AE]/50 animate-ping" style={{ animationDuration: '2s' }} />
                    </div>
                    <p className="text-white/60 font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-kicker md:text-[10px] tracking-[0.08em] md:tracking-[0.15em] uppercase">
                      Online · Canlı
                    </p>
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="p-6 md:p-7">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E70000]" />
                  <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-kicker md:text-[10px] tracking-[0.1em] md:tracking-[0.2em] uppercase text-[#E70000]/80">
                    Online Eğitim
                  </span>
                </div>

                <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-[1.15rem] md:text-[1.25rem] leading-[1.25] mb-3">
                  Her Yerden Erişim
                </h3>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  {[
                    { icon: Globe, text: 'Dünyanın her yerinden katılım', color: '#70C0AE' },
                    { icon: Users, text: 'Native Speaker Eğitmenler', color: '#E70000' },
                    { icon: BookOpen, text: 'Standardize Edilmiş Eğitim ve Metod', color: '#EEEBF5' },
                    { icon: Monitor, text: 'Güçlü dijital altyapı', color: '#FFC400' },
                    { icon: Clock, text: 'Esnek Ders Programı', color: '#70C0AE' },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${item.color}12` }}
                      >
                        <item.icon size={13} style={{ color: item.color }} />
                      </div>
                      <span className="font-['Neutraface_2_Text:Book',sans-serif] text-mobile-meta md:text-[12px] text-[#EEEBF5]/50">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openFreeTrial}
                  className="group/cta inline-flex min-h-[44px] items-center gap-2.5 px-5 py-2.5 border border-white/20 text-white/80 rounded-full text-mobile-kicker md:text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.05em] md:tracking-wide hover:bg-white/10 hover:border-white/40 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                >
                  Online Tanışma Planla
                  <Wifi size={13} className="group-hover/cta:translate-x-0.5 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* ── Bottom: İletişim bilgileri (compact) ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 md:mt-10 pt-6 border-t border-white/[0.06]"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10">
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-white/25" />
                <span className="font-['Neutraface_2_Text:Book',sans-serif] text-mobile-meta md:text-[12px] text-[#EEEBF5]/40">
                  sales@teachera.com.tr
                </span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-white/10" />
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-white/25" />
                <span className="font-['Neutraface_2_Text:Book',sans-serif] text-mobile-meta md:text-[12px] text-[#EEEBF5]/40">
                  partners@teachera.com.tr
                </span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-white/10" />
              <div className="flex items-center gap-3">
                <Clock size={14} className="text-white/25" />
                <span className="font-['Neutraface_2_Text:Book',sans-serif] text-mobile-meta md:text-[12px] text-[#EEEBF5]/40">
                  Her Gün: 09:00 – 21:30
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 9. FAQ ─────────────────────────────────────────────────────────── */}
      <FAQ />
    </div>
  );
}
