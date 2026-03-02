import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { RotateCcw, ArrowRight, Play, MessageCircle, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLevelAssessment } from './LevelAssessmentContext';
import { useFreeTrial } from './FreeTrialContext';
import methodologyHeroVideo from '../../assets/video/methodology-hero.mp4';
import methodologyHeroVideoWebm from '../../assets/video/methodology-hero.webm';
import { ListenIcon, SpeakIcon, CorrectIcon, RepeatIcon as RepeatCustomIcon } from './MethodologyIcons';
import Group1000004255 from '../../imports/Group1000004255';
import TeachingMethod from './TeachingMethod';

/* ═══════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */

const CYCLE_STEPS = [
  {
    num: '01',
    tag: 'DİNLE',
    tagEn: 'LISTEN',
    headline: 'Her An Dinle!',
    customIcon: ListenIcon,
    color: '#324D47',
    body: 'Native Speaker eğitmen yeni bir yapı ya da kavramı sistemli şekilde tanıtır. Ardından o yapıyı kullanmanı gerektiren soru gelir: beklemez, başlatır.',
  },
  {
    num: '02',
    tag: 'KONUŞ',
    tagEn: 'SPEAK',
    headline: 'Her An Konuş!',
    customIcon: SpeakIcon,
    color: '#E70000',
    body: 'Yeni öğrendiğin yapı, daha soğumadan… Native Speaker eğitmenin yönlendirmesiyle tam ve doğru cümle kurarsın. Bilgi "içeride" kalmaz; dışarı çıkar.',
  },
  {
    num: '03',
    tag: 'DÜZELT',
    tagEn: 'CORRECT',
    headline: 'Düzelt!',
    customIcon: CorrectIcon,
    color: '#324D47',
    body: 'Hata yaptıysan korkma. En ufak hata bile yanlış olarak yerleşmeden anında düzeltilir. Yanlışı tekrar ettirmeyiz; doğrusunu kurdururuz.',
  },
  {
    num: '04',
    tag: 'TEKRAR ET',
    tagEn: 'REPEAT',
    headline: 'Tekrar Et!',
    customIcon: RepeatCustomIcon,
    color: '#E70000',
    body: 'Bu döngü, seri bir "soru bombardımanı" gibi devam eder. Tekrar sayısı artar; düşünme azalır. Bir süre sonra cümleler… refleks olur.',
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   REUSABLE: Section Reveal Wrapper
   ═══════════════════════════════════════════════════════════════════════ */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 1 — HERO
   ═══════════════════════════════════════════════════════════════════════ */
function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const shouldReduceMotion = useReducedMotion();
  const [shouldLoadVideo, setShouldLoadVideo] = useState(!shouldReduceMotion);

  useEffect(() => {
    if (shouldReduceMotion) {
      setShouldLoadVideo(false);
      return;
    }

    const timer = window.setTimeout(() => setShouldLoadVideo(true), 80);
    return () => window.clearTimeout(timer);
  }, [shouldReduceMotion]);

  return (
    <section ref={ref} className="relative h-auto min-h-[80vh] md:min-h-[88vh] overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00000B]/75 via-[#00000B]/45 to-[#00000B]/90 z-10" />
        {shouldLoadVideo ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            onLoadedData={(event) => {
              void event.currentTarget.play().catch(() => {});
            }}
          >
            <source src="/video/methodology-hero-mobile.mp4" type="video/mp4" media="(max-width: 1023px)" />
            <source src="/video/methodology-hero-mobile.webm" type="video/webm" media="(max-width: 1023px)" />
            <source src={methodologyHeroVideoWebm} type="video/webm" />
            <source src={methodologyHeroVideo} type="video/mp4" />
          </video>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(70% 60% at 50% 40%, rgba(50,77,71,0.45) 0%, rgba(0,0,11,0.85) 68%, rgba(0,0,11,1) 100%)',
            }}
          />
        )}
      </div>

      {/* Content */}
      <motion.div
        className="relative z-20 min-h-[80vh] md:min-h-[88vh] flex flex-col items-center justify-center text-center px-6 py-16"
        style={{ opacity: heroOpacity }}
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
            TEACHERA TEACHING METHOD
          </span>
          <h1
            className="text-5xl md:text-7xl font-['Neutraface_2_Text:Bold',sans-serif] text-white leading-none"
            style={{ textShadow: '0 2px 30px rgba(0,0,0,0.4), 0 8px 60px rgba(50,77,71,0.15)' }}
          >
            HOW WE TEACH?
          </h1>
          <p
            className="text-[#EEEBF5]/70 font-['Neutraface_2_Text:Book',sans-serif] text-base md:text-[1.15rem] max-w-xl mx-auto leading-relaxed"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
          >
            100 yılı aşkın kanıtlanmış dil öğretim tekniklerinin modern sentezi.
            <br />
            <span className="text-[#EEEBF5]/45">
              Ana dil kullanımı minimuma indirilir, dilsel refleksler geliştirilir.
            </span>
          </p>
          <span className="text-[#E70000] font-['Neutraface_2_Text:Bold',sans-serif] tracking-[0.3em] text-xs block">
            NASIL ÖĞRETİYORUZ?
          </span>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h-[2px] bg-[#E70000] mx-auto"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="max-w-lg mx-auto pt-1"
          >
            <span className="text-[#EEEBF5]/50 font-['Neutraface_2_Text:Book',sans-serif] text-sm md:text-base leading-relaxed">
              Derslerin %85'i öğretmen yönlendirmeli sistemli diyaloglar ile
            </span>
            <br />
            <span className="text-white/90 font-['Neutraface_2_Text:Bold',sans-serif] text-sm md:text-base">
              konuşarak ilerler.
            </span>
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mx-auto mt-2 group cursor-pointer relative block"
            onClick={() => {}}
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
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 2 — EDITORIAL MANIFESTO (6 Sub-sections)
   Premium typographic storytelling with animations
   ═══════════════════════════════════════════════════════════════════════ */

/* --- 2A: The Formula — "Dil bilgisi + Kelime = Konusmak" with =/≠ animation --- */
function FormulaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });


  return (
    <section ref={ref} className="bg-white py-24 md:py-36 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#F4EBD1]/20 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-5%] w-[400px] h-[400px] bg-[#324D47]/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[860px] mx-auto px-6 md:px-10">
        {/* Section number */}
        <Reveal>
          <div className="flex items-center gap-4 mb-16 md:mb-20">
            <span className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F]/[0.04] text-[5rem] md:text-[7rem] leading-none select-none">
              01
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#09090F]/[0.06] to-transparent" />
          </div>
        </Reveal>

        {/* The Formula */}
        <Reveal delay={0.1}>
          <div className="text-center mb-16 md:mb-20">
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-5 flex-wrap">
              {/* Dil bilgisi */}
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#324D47] text-[1.6rem] md:text-[2.4rem] leading-none"
              >
                Dil bilgisi
              </motion.span>

              {/* + */}
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 0.25, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F] text-[1.4rem] md:text-[2rem]"
              >
                +
              </motion.span>

              {/* Kelime */}
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#324D47] text-[1.6rem] md:text-[2.4rem] leading-none"
              >
                Kelime
              </motion.span>

              {/* = with ✕ overlay animation */}
              <div className="relative mx-2 md:mx-4 inline-flex items-center justify-center w-[2rem] md:w-[3rem] h-[2rem] md:h-[3rem]">
                {/* "=" character — always visible once entered */}
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="absolute font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F]/40 text-[1.8rem] md:text-[2.8rem] leading-none"
                >
                  =
                </motion.span>

                {/* Red "✕" — loops in on top of "=", then fades out */}
                <motion.span
                  initial={{ opacity: 0, scale: 0, rotate: -90 }}
                  animate={inView ? {
                    opacity: [0, 0, 1, 1, 1, 0, 0],
                    scale:   [0, 0, 1.15, 1, 1, 0.8, 0],
                    rotate:  [-90, -90, 0, 0, 0, 0, -90],
                  } : {}}
                  transition={{
                    duration: 4,
                    delay: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                    times: [0, 0.1, 0.25, 0.35, 0.7, 0.85, 1],
                  }}
                  className="absolute font-['Neutraface_2_Text:Bold',sans-serif] text-[#E70000] text-[1.6rem] md:text-[2.4rem] leading-none z-10"
                >
                  ✕
                </motion.span>

                {/* Red glow pulse behind ✕ */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={inView ? {
                    opacity: [0, 0, 0.4, 0.2, 0, 0, 0],
                    scale:   [0, 0, 1.8, 2.2, 2.5, 0, 0],
                  } : {}}
                  transition={{
                    duration: 4,
                    delay: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                    times: [0, 0.1, 0.25, 0.5, 0.7, 0.75, 1],
                  }}
                  className="absolute w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#E70000]/20 blur-[8px] z-0"
                />

                {/* Spark particles — fire on each ✕ appearance */}
                {inView && (
                  <>
                    {[
                      { dx: -16, dy: -14 },
                      { dx: 18, dy: -10 },
                      { dx: -12, dy: 16 },
                      { dx: 14, dy: 14 },
                    ].map((p, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                        animate={{
                          opacity: [0, 0, 1, 0, 0, 0, 0],
                          scale:   [0, 0, 1.2, 0, 0, 0, 0],
                          x: [0, 0, p.dx, p.dx * 1.5, 0, 0, 0],
                          y: [0, 0, p.dy, p.dy * 1.5, 0, 0, 0],
                        }}
                        transition={{
                          duration: 4,
                          delay: 1.5 + i * 0.03,
                          repeat: Infinity,
                          repeatDelay: 1,
                          times: [0, 0.15, 0.25, 0.4, 0.5, 0.6, 1],
                        }}
                        className="absolute w-1 h-1 rounded-full bg-[#E70000] z-10"
                      />
                    ))}
                  </>
                )}
              </div>

              {/* Konusmak */}
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F]/80 text-[1.6rem] md:text-[2.4rem] leading-none"
              >
                Konuşmak
              </motion.span>
            </div>
          </div>
        </Reveal>

        {/* Explanation */}
        <Reveal delay={0.3}>
          <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/60 text-[15px] md:text-[17px] leading-[2] max-w-[620px] mx-auto text-center">
            Geleneksel eğitim tecrübeleri gösteriyor ki;{' '}
            <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F]/80">
              ne kadar kural öğrenir, ne kadar kelime ezberlersek ezberleyelim;
            </span>{' '}
            bu bilgi tek başına konuşmayı sağlayamıyor.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* --- 2B: The Realization — "Ana Dilinizi Nasil Konustugunu Düsünün!" --- */
function RealizationSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-[#FAFAF8] py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#324D47]/[0.06] to-transparent" />

      <div className="max-w-[860px] mx-auto px-6 md:px-10">
        {/* Section number */}
        <Reveal>
          <div className="flex items-center gap-4 mb-14 md:mb-18 flex-row-reverse">
            <span className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F]/[0.04] text-[5rem] md:text-[7rem] leading-none select-none">
              02
            </span>
            <div className="flex-1 h-px bg-gradient-to-l from-[#09090F]/[0.06] to-transparent" />
          </div>
        </Reveal>

        {/* Headline */}
        <Reveal delay={0.1}>
          <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[1.6rem] md:text-[2.2rem] leading-[1.2] mb-10 md:mb-14 text-right">
            Ana Dilinizi Nasıl{' '}
            <span className="relative inline-block">
              <span className="text-[#324D47]">Konuştuğunuzu</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#324D47]/30 origin-left block"
              />
            </span>{' '}
            Düşünün!
          </h2>
        </Reveal>

        {/* Two contrasting blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* Left — the wrong way */}
          <Reveal delay={0.15}>
            <div className="relative">
              <div className="absolute top-0 left-0 w-8 h-px bg-[#E70000]/30" />
              <div className="pt-6">
                <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/50 text-[14px] md:text-[15px] leading-[1.9] italic mb-4">
                  "Şimdi hangi zaman, hangi ek, hangi fiil çekimi?"
                </p>
                <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/40 text-[14px] leading-[1.9]">
                  diye tek tek düşünerek mi konuşuyoruz?
                </p>
              </div>
            </div>
          </Reveal>

          {/* Right — the natural way */}
          <Reveal delay={0.25}>
            <div className="relative">
              <div className="absolute top-0 left-0 w-8 h-px bg-[#324D47]/40" />
              <div className="pt-6">
                <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/70 text-[14px] md:text-[15px] leading-[1.9] mb-4">
                  Yoksa ne söylemek istediğinize karar verdikten sonra kelimeler,{' '}
                  <span className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#324D47]">
                    doğru dizilimle refleks gibi ağzınızdan mı dökülüyor?
                  </span>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* --- 2C: The Paradigm Shift — "Aslinda Sorun Sende Degil." --- */
function ParadigmSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-white py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-[20%] right-[-8%] w-[500px] h-[500px] bg-[#E70000]/[0.015] rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[860px] mx-auto px-6 md:px-10">
        {/* Section number */}
        <Reveal>
          <div className="flex items-center gap-4 mb-14 md:mb-18">
            <span className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F]/[0.04] text-[5rem] md:text-[7rem] leading-none select-none">
              03
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#09090F]/[0.06] to-transparent" />
          </div>
        </Reveal>

        {/* Headline — split for drama */}
        <Reveal delay={0.1}>
          <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[1.5rem] md:text-[2.1rem] leading-[1.25] mb-3">
            Aslında Sorun{' '}
            <span className="text-[#09090F]/30">Sende Değil.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#E70000] text-[1.5rem] md:text-[2.1rem] leading-[1.25] mb-12 md:mb-16">
            Öğrenme Şeklinde.
          </h2>
        </Reveal>

        {/* The old way vs new way */}
        <div className="space-y-8 md:space-y-10">
          {/* Old paradigm — struck through */}
          <Reveal delay={0.2}>
            <div className="relative pl-6 md:pl-8 border-l-2 border-[#09090F]/[0.06]">
              <span className="text-[#09090F]/20 font-['Neutraface_2_Text:Demi',sans-serif] text-[10px] tracking-[0.2em] uppercase block mb-3">
                Bugüne Kadar
              </span>
              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/40 text-[15px] md:text-[17px] leading-[1.9]">
                Bize öğretilen şuydu:{' '}
                <span className="relative inline">
                  <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F]/30">
                    "Önce bil, sonra konuşursun."
                  </span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={inView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-[#E70000]/50 origin-left block"
                  />
                </span>
              </p>
            </div>
          </Reveal>

          {/* New paradigm — highlighted */}
          <Reveal delay={0.3}>
            <div className="relative pl-6 md:pl-8 border-l-2 border-[#324D47]/30">
              <span className="text-[#324D47] font-['Neutraface_2_Text:Demi',sans-serif] text-[10px] tracking-[0.2em] uppercase block mb-3">
                Gerçek Tecrübe
              </span>
              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/70 text-[15px] md:text-[17px] leading-[1.9]">
                Ama gerçek hayat tecrübemiz tam tersini söylüyor:{' '}
                <span className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#324D47]">
                  Önce konuşursun; sonra öğrenirsin
                </span>{' '}
                veya{' '}
                <span className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#324D47]">
                  konuşarak öğrenirsin.
                </span>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* --- 2D: The Bridge — "Teachera Teaching Method: Bilgiyi Reflekse Ceviren Sistem" --- */
function BridgeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-[#09090F] py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-[#324D47]/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[300px] h-[300px] bg-[#E70000]/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[800px] mx-auto px-6 md:px-10 text-center">
        {/* Luxury Gold accent */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="font-['Luxury:Gold',sans-serif] text-white/[0.15] text-[11px] tracking-[0.5em] block mb-8"
        >
          METHODOLOGY
        </motion.span>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-[1.5rem] sm:text-[1.8rem] md:text-[2.4rem] leading-[1.3] mb-3">
            Teachera Teaching Method
          </h2>
          <p className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#E70000]/80 text-[14px] md:text-[16px] tracking-[0.05em] mb-10 md:mb-14">
            Bilgiyi Reflekse Çeviren Sistem
          </p>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="space-y-6"
        >
          <p className="font-['Neutraface_2_Text:Book',sans-serif] text-white/50 text-[14px] md:text-[16px] leading-[2]">
            Bu düşünceleri temel alarak, dil öğrenme metodumuzu oluşturduk.
            Kökleri{' '}
            <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-white/80">
              100 yılı aşkın hızlı ve etkili dil öğretim yaklaşımlarının sentezi
            </span>{' '}
            ve uyarlaması olan Teachera Teaching Method,{' '}
            <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]">
              hız ve verim
            </span>{' '}
            üzerine kuruludur.
          </p>
          <p className="font-['Neutraface_2_Text:Book',sans-serif] text-white/40 text-[14px] md:text-[15px] leading-[1.9]">
            Belirli bir süre içinde herkesin{' '}
            <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-white/70">
              fark edilir ilerleme
            </span>{' '}
            yaşamasını hedefler.
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-16 h-px bg-[#E70000]/30 mx-auto mt-12 md:mt-16"
        />
      </div>
    </section>
  );
}

/* --- 2E: The Target — "Hedef: Ögrendigin Dilde Düsünmek" --- */
function TargetSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-white py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#324D47]/[0.02] rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[860px] mx-auto px-6 md:px-10">
        {/* Header */}
        <Reveal>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-px bg-[#E70000]/30" />
            <span className="text-[#E70000] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.25em] uppercase">
              Hedef
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[1.5rem] md:text-[2.2rem] leading-[1.2] mb-8 md:mb-12">
            Öğrendiğin Dilde{' '}
            <span className="relative inline-block">
              <span className="text-[#324D47]">Düşünmek</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute -bottom-2 left-0 right-0 h-[3px] bg-[#324D47]/20 origin-left rounded-full block"
              />
            </span>
          </h2>
        </Reveal>

        {/* Content blocks */}
        <div className="space-y-6 md:space-y-8">
          <Reveal delay={0.15}>
            <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/60 text-[15px] md:text-[16px] leading-[2]">
              Metodumuzda, ilk günden itibaren{' '}
              <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F]/80">
                native speaker eğitmenler
              </span>{' '}
              ile ders boyunca ana dil kullanımını en aza indiririz.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/60 text-[15px] md:text-[16px] leading-[2]">
              Çünkü hedefimiz, öğrendiğiniz dilde{' '}
              <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F]/80">"bilmek"</span>{' '}
              değil; o dilde{' '}
              <span className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#324D47]">
                düşünme alışkanlığı
              </span>{' '}
              kazanmaktır.
            </p>
          </Reveal>

          {/* Big statement — pull quote */}
          <Reveal delay={0.25}>
            <div className="mt-8 md:mt-12 py-8 md:py-10 border-t border-b border-[#09090F]/[0.04]">
              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/40 text-[13px] md:text-[14px] leading-[1.8] mb-4 text-center">
                Hepimiz şunu biliyoruz ki:
              </p>
              <motion.p
                initial={{ opacity: 0, scale: 0.97 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[1.1rem] md:text-[1.5rem] leading-[1.5] text-center tracking-[0.02em]"
              >
                ÖĞRENDİĞİMİZ DİLDE DÜŞÜNÜRSEK,
                <br />
                <span className="text-[#324D47]">KONUŞMAK ZATEN KAÇINILMAZDIR...</span>
              </motion.p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* --- 2F: The %85 — "Bir dersin teknik olarak %85'i" --- */
function DialogueSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    if (inView) {
      const duration = 2000;
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * 85);
        setDisplayPercent(current);
        if (progress < 1) requestAnimationFrame(animate);
      };
      const timer = setTimeout(() => requestAnimationFrame(animate), 600);
      return () => clearTimeout(timer);
    }
  }, [inView]);

  return (
    <section ref={ref} className="bg-[#FAFAF8] py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#324D47]/[0.06] to-transparent" />

      <div className="max-w-[860px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16 items-start">
          {/* Left — Big number */}
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <div className="relative">
                {/* The percentage */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5 }}
                  className="mb-4"
                >
                  <span className="font-['Neutraface_2_Text:Bold',sans-serif] text-[5rem] md:text-[7rem] leading-none text-[#324D47]/10 select-none block">
                    %{displayPercent}
                  </span>
                </motion.div>

                {/* Progress bar */}
                <div className="w-full h-[3px] bg-[#324D47]/[0.06] rounded-full overflow-hidden mb-6">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: '85%' } : {}}
                    transition={{ duration: 2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-[#324D47]/40 rounded-full"
                  />
                </div>

                <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F] text-[15px] md:text-[17px] block mb-2">
                  Bir dersin teknik olarak %85'i
                </span>
                <div className="flex items-center gap-2 mt-3">
                  <MessageCircle size={13} className="text-[#E70000]/60" />
                  <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#E70000]/70 text-[11px] tracking-[0.1em] uppercase">
                    Serbest Sohbet Değil
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <BookOpen size={13} className="text-[#324D47]/60" />
                  <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]/70 text-[11px] tracking-[0.1em] uppercase">
                    Sistemli Konuşma
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right — Description */}
          <div>
            <Reveal delay={0.15}>
              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/60 text-[15px] md:text-[16px] leading-[2] mb-6">
                Metodumuz pratiğe dayalı eğitim ile{' '}
                <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F]/80">
                  anlama ve konuşma yetenekleri
                </span>{' '}
                üzerinde durur.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/60 text-[15px] md:text-[16px] leading-[2] mb-6">
                Bu konuşmalar serbest sohbetler şeklinde değildir. Ders süresinin yaklaşık{' '}
                <span className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#324D47]">%85'i</span>,
                öğretmenin önceden bilgisini verdiği kelime ve dilbilgisine dayalı sorular sorduğu{' '}
                <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F]/80">
                  kontrollü bir diyalogdan
                </span>{' '}
                oluşur.
              </p>
            </Reveal>

            <Reveal delay={0.25}>
              <div className="bg-white rounded-xl p-5 md:p-6 border border-[#324D47]/[0.06] shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
                <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/50 text-[14px] leading-[1.9]">
                  Böylece, her yeni konu hem pratikte hem de{' '}
                  <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]">
                    doğru bağlamda gelişen diyaloglar
                  </span>{' '}
                  içinde öğrenilir.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION — DERS AKIŞI (Immersive 4-Step Lesson Flow)
   ═══════════════════════════════════════════════════════════════════════ */

const FLOW_STEPS = [
  {
    num: '01',
    tag: 'DİNLE',
    tagEn: 'LISTEN',
    headline: 'Her An Dinle!',
    customIcon: ListenIcon,
    accent: '#324D47',
    glowColor: 'rgba(50,77,71,0.15)',
    body: 'Native Speaker eğitmen yeni bir yapı ya da kavramı sistemli şekilde tanıtır. Ardından o yapıyı kullanmanı gerektiren soru gelir — beklemez, başlatır.',
    detail: 'Duyduğun an, öğrenme başlar.',
  },
  {
    num: '02',
    tag: 'KONUŞ',
    tagEn: 'SPEAK',
    headline: 'Her An Konuş!',
    customIcon: SpeakIcon,
    accent: '#E70000',
    glowColor: 'rgba(231,0,0,0.12)',
    body: 'Yeni öğrendiğin yapı, daha soğumadan… Native Speaker eğitmenin yönlendirmesiyle tam ve doğru cümle kurarsın. Bilgi "içeride" kalmaz; dışarı çıkar.',
    detail: 'Bilmek yetmez, söylemek gerekir.',
  },
  {
    num: '03',
    tag: 'DÜZELT',
    tagEn: 'CORRECT',
    headline: 'Düzelt!',
    customIcon: CorrectIcon,
    accent: '#324D47',
    glowColor: 'rgba(50,77,71,0.15)',
    body: 'Hata yaptıysan korkma. En ufak hata bile yanlış olarak yerleşmeden anında düzeltilir. Yanlışı tekrar ettirmeyiz; doğrusunu kurdururuz.',
    detail: 'Hata yapılır, yerleşmesine izin verilmez.',
  },
  {
    num: '04',
    tag: 'TEKRAR ET',
    tagEn: 'REPEAT',
    headline: 'Tekrar Et!',
    customIcon: RepeatCustomIcon,
    accent: '#E70000',
    glowColor: 'rgba(231,0,0,0.12)',
    body: 'Bu döngü, seri bir "soru bombardımanı" gibi devam eder. Tekrar sayısı artar; düşünme süresi azalır. Bir süre sonra cümleler… refleks olur.',
    detail: 'Tekrar ettikçe, düşünmeden konuşursun.',
  },
];

function LessonFlowSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    if (inView) {
      FLOW_STEPS.forEach((_, i) => {
        setTimeout(() => setActiveStep(i), 800 + i * 600);
      });
    }
  }, [inView]);

  return (
    <section ref={sectionRef} className="bg-[#09090F] relative overflow-hidden">
      {/* Top / bottom edge lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Ambient glows */}
      <div className="absolute top-[10%] left-[-8%] w-[500px] h-[500px] bg-[#324D47]/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-6%] w-[400px] h-[400px] bg-[#E70000]/[0.02] rounded-full blur-[140px] pointer-events-none" />

      {/* Header area */}
      <div className="pt-24 md:pt-32 pb-16 md:pb-20 text-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
        >
          <span className="font-['Luxury:Gold',sans-serif] text-white/[0.06] text-[10px] tracking-[0.5em] block mb-6">
            LESSON FLOW
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-[1.8rem] md:text-[2.8rem] leading-[1.15] mb-4">
            Ders <span className="text-[#324D47]">Akışı</span>
          </h2>
          <p className="font-['Neutraface_2_Text:Book',sans-serif] text-white/30 text-[14px] md:text-[15px] max-w-[420px] mx-auto leading-[1.8]">
            Her ders boyunca kesintisiz dönen bu döngü,{' '}
            <span className="text-white/50">bilgiyi reflekse çevirir.</span>
          </p>
        </motion.div>
      </div>

      {/* === 4 Steps === */}
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 pb-24 md:pb-32">
        <div className="relative">
          {/* Central vertical timeline line — desktop only */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
            <motion.div
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ duration: 2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full bg-gradient-to-b from-white/[0.03] via-white/[0.08] to-white/[0.03] origin-top"
            />
          </div>

          {/* Steps */}
          <div className="space-y-8 md:space-y-0">
            {FLOW_STEPS.map((step, i) => {
              const CustomIcon = step.customIcon;
              const isLeft = i % 2 === 0;
              const isActive = activeStep >= i;

              return (
                <div key={step.num} className="relative">
                  {/* Timeline node — desktop */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={isActive ? { scale: 1, opacity: 1 } : {}}
                      transition={{ duration: 0.5, type: 'spring', stiffness: 300 }}
                      className="relative"
                    >
                      {/* Glow ring */}
                      <motion.div
                        animate={isActive ? { scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] } : {}}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: step.accent, filter: 'blur(8px)' }}
                      />
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center relative z-10 border"
                        style={{
                          backgroundColor: step.accent + '15',
                          borderColor: step.accent + '30',
                          boxShadow: `0 0 30px ${step.glowColor}`,
                        }}
                      >
                        <CustomIcon color={isActive ? step.accent : 'rgba(255,255,255,0.15)'} className="w-6 h-6 transition-colors duration-700" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Card — alternating left/right on desktop */}
                  <div className={`md:grid md:grid-cols-2 md:gap-24 items-center ${isLeft ? '' : ''}`}>
                    {/* Content side */}
                    <motion.div
                      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                      animate={isActive ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className={`${isLeft ? 'md:col-start-1' : 'md:col-start-2'} md:py-12`}
                    >
                      <div
                        className="group relative rounded-2xl p-6 md:p-8 border transition-all duration-700"
                        style={{
                          backgroundColor: isActive ? step.accent + '08' : 'rgba(255,255,255,0.01)',
                          borderColor: isActive ? step.accent + '15' : 'rgba(255,255,255,0.03)',
                          boxShadow: isActive ? `0 8px 60px ${step.glowColor}, inset 0 1px 0 ${step.accent}10` : 'none',
                        }}
                      >
                        {/* Mobile icon + number header */}
                        <div className="flex items-center gap-4 mb-5">
                          {/* Mobile-only icon */}
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={isActive ? { scale: 1 } : {}}
                            transition={{ duration: 0.4, type: 'spring', delay: 0.2 }}
                            className="md:hidden w-11 h-11 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: step.accent + '15' }}
                          >
                            <CustomIcon color={step.accent} className="w-6 h-6" />
                          </motion.div>

                          <div className="flex items-center gap-3 flex-1">
                            <span
                              className="font-['Neutraface_2_Text:Bold',sans-serif] text-[3rem] md:text-[4.5rem] leading-none select-none transition-colors duration-700"
                              style={{ color: isActive ? step.accent + '12' : 'rgba(255,255,255,0.02)' }}
                            >
                              {step.num}
                            </span>
                            <div>
                              <span
                                className="font-['Luxury:Gold',sans-serif] text-[9px] tracking-[0.3em] block mb-1 transition-colors duration-700"
                                style={{ color: isActive ? step.accent + '40' : 'rgba(255,255,255,0.06)' }}
                              >
                                {step.tagEn}
                              </span>
                              <span
                                className="font-['Neutraface_2_Text:Demi',sans-serif] text-[11px] tracking-[0.2em] uppercase transition-colors duration-700"
                                style={{ color: isActive ? step.accent : 'rgba(255,255,255,0.15)' }}
                              >
                                {step.tag}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Headline */}
                        <h3
                          className="font-['Neutraface_2_Text:Bold',sans-serif] text-[1.3rem] md:text-[1.6rem] leading-[1.2] mb-3 transition-colors duration-700"
                          style={{ color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.1)' }}
                        >
                          {step.headline}
                        </h3>

                        {/* Body */}
                        <p
                          className="font-['Neutraface_2_Text:Book',sans-serif] text-[14px] md:text-[15px] leading-[1.9] mb-4 transition-colors duration-700"
                          style={{ color: isActive ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.06)' }}
                        >
                          {step.body}
                        </p>

                        {/* Detail accent line */}
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={isActive ? { scaleX: 1 } : {}}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          className="h-px w-12 origin-left mb-3"
                          style={{ backgroundColor: step.accent + '30' }}
                        />

                        {/* Detail quote */}
                        <p
                          className="font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] md:text-[13px] italic transition-colors duration-700"
                          style={{ color: isActive ? step.accent + '90' : 'rgba(255,255,255,0.04)' }}
                        >
                          {step.detail}
                        </p>
                      </div>
                    </motion.div>

                    {/* Empty column for timeline spacing on desktop */}
                    <div className={`hidden md:block ${isLeft ? 'md:col-start-2' : 'md:col-start-1 md:row-start-1'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom conclusion pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 3.5 }}
          className="mt-16 md:mt-24 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-white/[0.03] backdrop-blur-sm rounded-full px-6 md:px-8 py-3.5 border border-white/[0.06]">
            <RotateCcw size={14} className="text-[#E70000]/70" />
            <span className="font-['Neutraface_2_Text:Book',sans-serif] text-white/50 text-[12px] md:text-[13px]">
              Bu{' '}
              <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-white/80">
                "Dinle – Konuş – Düzelt – Tekrar Et"
              </span>{' '}
              döngüsü her derste tekrarlanır,{' '}
              <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]">kas hafızası</span>{' '}
              gelişir.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* [LEGACY — not rendered, kept for reference] */
function _LegacySystemSection() {
  return (
    <section className="bg-white py-20 md:py-28 relative overflow-hidden">
      <div className="absolute bottom-[-15%] left-[-8%] w-[400px] h-[400px] bg-[#324D47]/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[960px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text */}
          <div>
            <Reveal>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-[#324D47]/30" />
                <span className="text-[#324D47] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] uppercase">
                  Sistemli Diyalog Yöntemi
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[1.6rem] md:text-[2rem] leading-[1.2] mb-6">
                Binlerce sistematik soru ile{' '}
                <span className="text-[#324D47]">dili refleks haline</span> getirir.
              </h2>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/60 text-[15px] leading-[1.9] mb-6">
                Teachera Teaching Method, anlama ve konuşma becerilerini sistemli bir diyalog yöntemiyle geliştirir.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/60 text-[15px] leading-[1.9]">
                Öğretmen, yeni kelimeleri tanıtarak bu kelimelerle sorular yöneltir. Öğrenci bu süreçte{' '}
                <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F]/80">
                  soruyu dinler, doğru telaffuz ve yapıyı öğrenir,
                </span>{' '}
                öğretmen rehberliğinde konuşur ve düzeltmelerle tekrar eder.
              </p>
            </Reveal>
          </div>

          {/* Right — Visual: The Cycle Ring */}
          <Reveal delay={0.2}>
            <div className="relative flex items-center justify-center">
              <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px]">
                <motion.div
                  className="absolute inset-0 rounded-full border border-[#324D47]/10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-3 rounded-full border border-dashed border-[#324D47]/[0.06]"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="block font-['Luxury:Gold',sans-serif] text-[#324D47]/20 text-[11px] tracking-[0.3em] mb-1">CYCLE</span>
                    <span className="block font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[13px]">Refleks</span>
                    <span className="block font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/40 text-[11px]">Döngüsü</span>
                  </div>
                </div>

                {CYCLE_STEPS.map((step, i) => {
                  const angle = (i * 90 - 90) * (Math.PI / 180);
                  const radius = 130;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const CustomIcon = step.customIcon;
                  return (
                    <motion.div
                      key={step.num}
                      className="absolute"
                      style={{
                        left: `calc(50% + ${x}px - 28px)`,
                        top: `calc(50% + ${y}px - 28px)`,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.15, duration: 0.5, type: 'spring' }}
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: step.color + '12', border: `1px solid ${step.color}20` }}
                      >
                        <CustomIcon color={step.color} className="w-8 h-8" />
                      </div>
                      <span
                        className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-['Neutraface_2_Text:Demi',sans-serif] text-[9px] tracking-[0.15em] whitespace-nowrap"
                        style={{ color: step.color }}
                      >
                        {step.tag}
                      </span>
                    </motion.div>
                  );
                })}

                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 320">
                  <circle cx="160" cy="160" r="130" fill="none" stroke="#324D47" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="8 12" />
                </svg>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.25}>
          <div className="mt-16 md:mt-20 text-center">
            <div className="inline-flex items-center gap-3 bg-[#FAFAF8] rounded-full px-6 py-3 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-black/[0.03]">
              <RotateCcw size={14} className="text-[#E70000]" />
              <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/70 text-[13px]">
                Bu <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F]">"Dinle - Konuş - Düzelt - Tekrar Et"</span> döngüsü
                sayesinde <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]">kas hafızası</span> gelişir.
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 4 — THE 4 STEPS (detailed cards)
   ═══════════════════════════════════════════════════════════════════════ */
function _LegacyStepsSection() {
  return (
    <section className="bg-[#FAFAF8] py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-[960px] mx-auto px-6 md:px-10">
        <Reveal>
          <div className="text-center mb-14 md:mb-18">
            <span className="text-[#E70000] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.25em] uppercase block mb-4">
              4 Adım
            </span>
            <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[1.5rem] md:text-[2rem] leading-[1.2]">
              Her derste tekrarlanan{' '}
              <span className="text-[#324D47]">döngü</span>
            </h2>
          </div>
        </Reveal>

        <div className="space-y-6 md:space-y-8">
          {CYCLE_STEPS.map((step, i) => {
            const CustomIcon = step.customIcon;
            const isEven = i % 2 === 0;
            return (
              <Reveal key={step.num} delay={i * 0.1}>
                <div
                  className={`group relative rounded-2xl border transition-all duration-500 hover:shadow-[0_8px_40px_rgba(0,0,0,0.06)] ${
                    isEven
                      ? 'bg-white border-[#324D47]/[0.06] hover:border-[#324D47]/15'
                      : 'bg-white border-[#E70000]/[0.04] hover:border-[#E70000]/10'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 p-6 md:p-8">
                    <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
                      <span
                        className="font-['Neutraface_2_Text:Bold',sans-serif] text-[2.5rem] md:text-[3.5rem] leading-none"
                        style={{ color: step.color + '10' }}
                      >
                        {step.num}
                      </span>
                      <div
                        className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundColor: step.color + '0D' }}
                      >
                        <CustomIcon color={step.color} className="w-8 h-8" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3
                          className="font-['Neutraface_2_Text:Bold',sans-serif] text-[1.1rem] md:text-[1.25rem]"
                          style={{ color: step.color }}
                        >
                          {step.headline}
                        </h3>
                        <span className="font-['Luxury:Gold',sans-serif] text-[10px] tracking-[0.2em] opacity-25" style={{ color: step.color }}>
                          {step.tagEn}
                        </span>
                      </div>
                      <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/55 text-[14px] md:text-[15px] leading-[1.8] max-w-[520px]">
                        {step.body}
                      </p>
                    </div>

                    {i < CYCLE_STEPS.length - 1 && (
                      <div className="hidden md:block absolute -bottom-4 left-16 z-10">
                        <div className="w-px h-4" style={{ backgroundColor: CYCLE_STEPS[i + 1].color + '15' }} />
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.4}>
          <div className="mt-14 md:mt-18 text-center">
            <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/45 text-[14px] leading-[1.8] max-w-[480px] mx-auto">
              Öğrenci öğrendiği dilde{' '}
              <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F]/70">düşünerek</span>{' '}
              otomatik konuşmaya başlar.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 5 — PULL QUOTE (dark, editorial)
   ═══════════════════════════════════════════════════════════════════════ */
function PullQuoteSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-[#09090F] py-20 md:py-28 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute top-[30%] left-[-5%] w-[400px] h-[400px] bg-[#324D47]/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[720px] mx-auto px-6 md:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <span className="font-['Luxury:Gold',sans-serif] text-white/20 text-[10px] tracking-[0.4em] block mb-8">
            TEACHERA TEACHING METHOD
          </span>

          <blockquote className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-[1.4rem] sm:text-[1.8rem] md:text-[2.2rem] leading-[1.4] mb-8">
            Düşünce dili{' '}
            <span className="text-[#324D47]">değişince</span>,{' '}
            konuşma{' '}
            <span className="text-white/30">başlar</span>.
          </blockquote>

          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-px bg-[#E70000]/30" />
            <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#E70000]/60 text-mobile-kicker md:text-[10px] tracking-[0.1em] md:tracking-[0.2em] uppercase">
              Refleks Tabanlı Öğretim
            </span>
            <div className="w-8 h-px bg-[#E70000]/30" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 6 — CTA
   ═══════════════════════════════════════════════════════════════════════ */
function CTASection() {
  const { open: openLevelAssessment } = useLevelAssessment();
  const { open: openFreeTrial } = useFreeTrial();

  return (
    <section className="bg-[#FAFAF8] py-20 md:py-28 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] bg-[#324D47]/[0.03] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[250px] h-[250px] bg-[#E70000]/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[640px] mx-auto px-6 md:px-10 text-center">
        <Reveal>
          <div
            className="w-full max-w-[240px] sm:max-w-[340px] md:max-w-[420px] h-auto mx-auto mb-6 md:mb-8"
            style={{ '--fill-0': '#1a1a1f' } as React.CSSProperties}
          >
            <div className="w-full aspect-[507/172]">
              <Group1000004255 />
            </div>
          </div>
          <p className="text-[#09090F]/60 text-mobile-meta sm:text-[15px] md:text-[17px] font-['Neutraface_2_Text:Book',sans-serif] mb-4 md:mb-5">
            Yabancı eğitmenler ve özelleştirilmiş metodolojimizle
          </p>
        </Reveal>

        {/* Language badges */}
        <Reveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4 md:mb-5">
            {['İngilizce', 'İspanyolca', 'Almanca', 'İtalyanca', 'Fransızca', 'Rusça', 'Arapça'].map((lang, i) => (
              <motion.span
                key={lang}
                initial={{ opacity: 0, scale: 0.7, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07, type: 'spring', bounce: 0.35 }}
                className="inline-flex items-center px-2.5 py-1 md:px-3 md:py-1 rounded-full border border-[#324D47]/15 bg-[#324D47]/[0.04] text-[#324D47]/80 text-mobile-kicker sm:text-xs md:text-sm font-['Neutraface_2_Text:Book',sans-serif] hover:bg-[#324D47]/[0.08] hover:border-[#324D47]/25 transition-all cursor-default"
              >
                {lang}
              </motion.span>
            ))}
          </div>
        </Reveal>

        {/* "konuşarak öğren" highlight */}
        <Reveal delay={0.2}>
          <p className="text-[#09090F]/60 text-mobile-meta sm:text-[15px] md:text-[17px] font-['Neutraface_2_Text:Book',sans-serif] mb-8 md:mb-10">
            dillerini{' '}
            <span className="relative inline-block text-[#09090F] font-['Neutraface_2_Text:Demi',sans-serif]">
              konuşarak öğren
              <motion.span
                className="absolute left-0 -bottom-px h-px w-full"
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  transformOrigin: 'left center',
                  background: 'linear-gradient(to right, transparent, rgba(231,0,0,0.35) 20%, #E70000 50%, rgba(231,0,0,0.35) 80%, transparent)',
                }}
              />
            </span>
            <span className="text-[#E70000]">.</span>
          </p>
        </Reveal>

        {/* CTA Buttons */}
        <Reveal delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openFreeTrial}
              className="group flex min-h-[44px] items-center gap-2 bg-[#324D47] hover:bg-[#3d5e57] text-white font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-kicker sm:text-[13px] tracking-[0.05em] px-6 sm:px-7 py-2.5 sm:py-3 rounded-full transition-all duration-300 cursor-pointer"
            >
              Ücretsiz Deneme Seansı
              <Play size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openLevelAssessment}
              className="flex min-h-[44px] items-center gap-2 border border-[#324D47]/20 hover:border-[#324D47]/40 text-[#09090F]/60 hover:text-[#324D47] font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-kicker sm:text-[13px] tracking-[0.05em] px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all cursor-pointer"
            >
              Seviyeni Öğren
            </motion.button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function MethodologyPage() {
  return (
    <>
      <HeroSection />
      <FormulaSection />
      <RealizationSection />
      <ParadigmSection />
      <BridgeSection />
      <TargetSection />
      <DialogueSection />
      <TeachingMethod />
      <PullQuoteSection />
      <CTASection />
    </>
  );
}
