import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { RotateCcw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ListenIcon, SpeakIcon, CorrectIcon, RepeatIcon as RepeatCustomIcon } from './MethodologyIcons';
import { useLiteMode } from '../lib/useLiteMode';

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

const REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const STEP_START_DELAY_MS = 120;
const STEP_STAGGER_MS = 180;

export default function TeachingMethod() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });
  const [activeStep, setActiveStep] = useState(-1);
  const isLiteMode = useLiteMode();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLiteMode) {
      setActiveStep(FLOW_STEPS.length - 1);
      return;
    }
    if (!inView) return;

    const timers = FLOW_STEPS.map((_, i) => (
      window.setTimeout(() => setActiveStep(i), STEP_START_DELAY_MS + i * STEP_STAGGER_MS)
    ));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [inView, isLiteMode]);

  if (isLiteMode) {
    return (
      <section id="how-it-works" ref={sectionRef} className="bg-[#09090F] relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="pt-16 pb-8 text-center px-6">
          <h2 className="font-['Luxury:Gold',sans-serif] text-[0.82rem] tracking-[0.28em] mb-4 text-[#F4EBD1]/90">
            TEACHERA TEACHING METHOD
          </h2>
          <p className="font-['Neutraface_2_Text:Book',sans-serif] text-white/45 text-[13px] max-w-[420px] mx-auto leading-[1.7]">
            Daha akıcı bir mobil deneyim için sadeleştirilmiş görünüm.
          </p>
        </div>

        <div className="max-w-[760px] mx-auto px-5 pb-12">
          <div className="space-y-4">
            {FLOW_STEPS.map((step) => {
              const CustomIcon = step.customIcon;
              return (
                <article
                  key={step.num}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5"
                  style={{ boxShadow: `inset 0 1px 0 ${step.accent}20` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${step.accent}20` }}
                    >
                      <CustomIcon color={step.accent} className="w-5 h-5" />
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="font-['Neutraface_2_Text:Bold',sans-serif] text-white/45 text-lg">
                        {step.num}
                      </span>
                      <span
                        className="font-['Neutraface_2_Text:Demi',sans-serif] text-[11px] tracking-[0.18em] uppercase"
                        style={{ color: step.accent }}
                      >
                        {step.tag}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-[1.12rem] mb-2">
                    {step.headline}
                  </h3>
                  <p className="font-['Neutraface_2_Text:Book',sans-serif] text-white/62 text-[14px] leading-[1.7] mb-2.5">
                    {step.body}
                  </p>
                  <p
                    className="font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] italic"
                    style={{ color: `${step.accent}CC` }}
                  >
                    {step.detail}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/metodoloji')}
              className="group inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.1] rounded-full px-6 py-2.5 cursor-pointer"
            >
              <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-white/80 text-[13px]">
                Metodolojimizi Keşfet
              </span>
              <ArrowRight size={14} className="text-white/70" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="how-it-works" ref={sectionRef} className="bg-[#09090F] relative overflow-hidden">
      {/* Top / bottom edge lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Ambient glows */}
      <div className="absolute top-[10%] left-[-8%] w-[500px] h-[500px] bg-[#324D47]/[0.04] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[-6%] w-[400px] h-[400px] bg-[#E70000]/[0.02] rounded-full blur-[140px] pointer-events-none" />

      {/* ── Header ── */}
      <div className="pt-20 md:pt-24 pb-12 md:pb-16 text-center px-6">
        {/* Shimmer keyframes */}
        <style>{`
          @keyframes shimmer-slide {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}</style>

        {/* Luxury Gold title with shimmer */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: REVEAL_EASE }}
          className="relative"
        >
          <h2
            className="font-['Luxury:Gold',sans-serif] text-[0.85rem] md:text-[1.1rem] lg:text-[1.3rem] tracking-[0.35em] md:tracking-[0.4em] mb-6"
            style={{
              background: 'linear-gradient(105deg, rgba(244,235,209,0.45) 0%, #F4EBD1 35%, rgba(255,255,255,0.95) 50%, #F4EBD1 65%, rgba(244,235,209,0.45) 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer-slide 6s ease-in-out infinite',
              filter: 'drop-shadow(0 0 12px rgba(244,235,209,0.1))',
            }}
          >
            TEACHERA TEACHING METHOD
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.08, ease: REVEAL_EASE }}
        >
          <p className="font-['Neutraface_2_Text:Book',sans-serif] text-white/30 text-[13px] md:text-[14px] max-w-[400px] mx-auto leading-[1.8]">
            Her ders boyunca kesintisiz dönen bu döngü,{' '}
            <span className="text-white/50">bilgiyi reflekse çevirir.</span>
          </p>
        </motion.div>
      </div>

      {/* ── 4 Steps Timeline ── */}
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 pb-20 md:pb-28">
        <div className="relative">
          {/* Central vertical timeline — desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
            <motion.div
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.95, delay: 0.1, ease: REVEAL_EASE }}
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

                  {/* Card — alternating left/right */}
                  <div className={`md:grid md:grid-cols-2 md:gap-24 items-center`}>
                    <motion.div
                      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                      animate={isActive ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.55, ease: REVEAL_EASE }}
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
                        {/* Mobile icon + number */}
                        <div className="flex items-center gap-4 mb-5">
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

                    {/* Empty column for timeline spacing */}
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
          transition={{ duration: 0.6, delay: 0.62, ease: REVEAL_EASE }}
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

        {/* CTA to full methodology page */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.78, ease: REVEAL_EASE }}
          className="mt-10 text-center"
        >
          <button
            onClick={() => navigate('/metodoloji')}
            className="group inline-flex items-center gap-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] rounded-full px-7 py-3 transition-all duration-300 cursor-pointer"
          >
            <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-white/60 group-hover:text-white/90 text-[13px] tracking-[0.03em] transition-colors duration-300">
              Metodolojimizi Keşfet
            </span>
            <ArrowRight size={14} className="text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all duration-300" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
