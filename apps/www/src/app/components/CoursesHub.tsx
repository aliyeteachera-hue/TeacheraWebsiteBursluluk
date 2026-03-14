import { motion, useInView, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, ChevronRight, ChevronDown } from 'lucide-react';
import { useFreeTrial } from './FreeTrialContext';
import { useLevelAssessment } from './LevelAssessmentContext';
import ProgramFinder from './ProgramFinder';
import AllPrograms, { ALL_PROGRAMS } from './AllPrograms';

/* ═══════════════════════════════════════════════════════════════════════
   FLOATING WORDS DATA
   ═══════════════════════════════════════════════════════════════════════ */
const FLOATING_WORDS = [
  { text: 'Hello', x: 8, y: 18, size: 2.8, opacity: 0.07, color: '#E70000', duration: 18, delay: 0 },
  { text: 'Hola', x: 78, y: 55, size: 2.4, opacity: 0.10, color: '#FFC400', duration: 20, delay: 1.5 },
  { text: 'Bonjour', x: 15, y: 72, size: 2.2, opacity: 0.06, color: '#0055A4', duration: 22, delay: 0.8 },
  { text: 'Hallo', x: 85, y: 30, size: 1.6, opacity: 0.15, color: '#DD0000', duration: 16, delay: 2 },
  { text: 'Ciao', x: 42, y: 85, size: 1.8, opacity: 0.06, color: '#008C45', duration: 17, delay: 0.5 },
  { text: 'Привет', x: 72, y: 80, size: 1.5, opacity: 0.12, color: '#D52B1E', duration: 19, delay: 3 },
  { text: 'مرحبا', x: 90, y: 65, size: 1.7, opacity: 0.11, color: '#006C35', duration: 21, delay: 1 },
  { text: 'Danke', x: 65, y: 15, size: 1.1, opacity: 0.18, color: '#DD0000', duration: 14, delay: 4 },
  { text: 'Merci', x: 82, y: 45, size: 1.0, opacity: 0.16, color: '#0055A4', duration: 13, delay: 2.5 },
  { text: 'Gracias', x: 25, y: 90, size: 1.2, opacity: 0.06, color: '#FFC400', duration: 15, delay: 1.8 },
  { text: 'Thanks', x: 75, y: 12, size: 1.0, opacity: 0.13, color: '#E70000', duration: 12, delay: 3.5 },
  { text: 'Grazie', x: 92, y: 78, size: 1.1, opacity: 0.14, color: '#008C45', duration: 16, delay: 0.3 },
  { text: 'Спасибо', x: 60, y: 88, size: 0.9, opacity: 0.12, color: '#D52B1E', duration: 18, delay: 2.2 },
  { text: 'شكراً', x: 88, y: 20, size: 1.0, opacity: 0.10, color: '#006C35', duration: 20, delay: 4.5 },
  { text: 'Lingua', x: 70, y: 35, size: 0.85, opacity: 0.08, color: '#ffffff', duration: 24, delay: 5 },
  { text: 'Sprache', x: 5, y: 50, size: 0.8, opacity: 0.04, color: '#ffffff', duration: 22, delay: 3.8 },
  { text: 'Idioma', x: 84, y: 70, size: 0.9, opacity: 0.09, color: '#ffffff', duration: 20, delay: 1.2 },
  { text: 'Язык', x: 50, y: 10, size: 0.85, opacity: 0.05, color: '#ffffff', duration: 23, delay: 6 },
];

const TOTAL_PROGRAMS = ALL_PROGRAMS.length;
const UNIQUE_LANGUAGES = new Set(ALL_PROGRAMS.map(p => p.language)).size;

const TRUST_STATS = [
  { value: 3000, suffix: '+', label: 'Aktif Öğrenci' },
  { value: UNIQUE_LANGUAGES, suffix: '', label: 'Dil Eğitimi' },
  { value: TOTAL_PROGRAMS, suffix: '', label: 'Program' },
  { value: 10, suffix: '+', label: 'Yıllık Deneyim' },
];

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════════════════════════════════ */
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-15% 0px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let current = 0;
    const step = value > 100 ? Math.ceil(value / 40) : 1;
    const interval = 1200 / (value / step);
    const timer = setInterval(() => {
      current += step;
      if (current >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(current);
    }, interval);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function CoursesHub() {
  const navigate = useNavigate();
  const { open: openFreeTrial } = useFreeTrial();
  const { open: openLevelAssessment } = useLevelAssessment();
  const [showAllPrograms, setShowAllPrograms] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      {/* ═══════════════════════════════════════════════════════════════════
          1. HERO — Dark with Floating Language Typography
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 overflow-hidden bg-[#09090F]">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] [background-size:40px_40px]" />
        </div>

        {/* Ambient glow — left (behind text content) */}
        <div className="absolute top-[15%] left-[5%] w-[45vw] h-[55vh] bg-[radial-gradient(ellipse_at_center,rgba(50,77,71,0.09),transparent_70%)] pointer-events-none" />
        {/* Ambient glow — right */}
        <div className="absolute top-[10%] right-[5%] w-[45vw] h-[55vh] bg-[radial-gradient(ellipse_at_center,rgba(50,77,71,0.08),transparent_70%)] pointer-events-none" />
        {/* Subtle warm accent — bottom center */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70vw] h-[30vh] bg-[radial-gradient(ellipse_at_center,rgba(107,29,42,0.05),transparent_70%)] pointer-events-none" />

        {/* ── Floating Language Words ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {FLOATING_WORDS.map((word, i) => (
            <motion.span
              key={`${word.text}-${i}`}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, word.opacity, word.opacity, 0],
                y: [0, -20, 20, 0],
                x: [0, 8, -8, 0],
                rotate: [0, -2, 2, 0],
              }}
              transition={{
                duration: word.duration,
                delay: word.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute font-['Neutraface_2_Text:Bold',sans-serif] select-none whitespace-nowrap"
              style={{
                left: `${word.x}%`,
                top: `${word.y}%`,
                fontSize: `${word.size}rem`,
                color: word.color,
                opacity: 0,
              }}
            >
              {word.text}
            </motion.span>
          ))}
        </div>

        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-8 font-['Neutraface_2_Text:Book',sans-serif] text-[12px] text-white/25"
          >
            <button onClick={() => navigate('/')} className="hover:text-white/50 transition-colors cursor-pointer">Ana Sayfa</button>
            <ChevronRight size={10} />
            <span className="text-[#E70000]/70">Eğitim Programları</span>
          </motion.nav>

          <div className="max-w-[640px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-5"
            >
              <div className="h-[2px] w-8 bg-[#E70000]" />
              <span className="text-[#E70000] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] text-[10px] uppercase">
                Eğitim Programlarımız
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-[2rem] md:text-[2.6rem] lg:text-[3rem] leading-[1.08] tracking-tight mb-5"
            >
              Hedefine Uygun{' '}
              <span className="text-[#324D47] drop-shadow-[0_0_20px_rgba(50,77,71,0.4)]">Programı</span> Bul.
              <br />
              <span className="text-white/20 font-['Neutraface_2_Text:Book',sans-serif] italic text-[1.6rem] md:text-[2rem] lg:text-[2.2rem]">
                {UNIQUE_LANGUAGES} dil, {TOTAL_PROGRAMS} program, sınırsız olasılık.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-['Neutraface_2_Text:Book',sans-serif] text-white/35 text-[14px] md:text-[15px] leading-relaxed max-w-[520px] mb-8"
            >
              Teachera Teaching Method ile her yaş, seviye ve hedef için
              özel olarak tasarlanmış eğitim programları. Herkese her
              şeyi değil; her bireye ihtiyacı olanı öğretiyoruz.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openLevelAssessment('courses_hub_hero')}
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#324D47] text-white rounded-full text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] hover:bg-[#3d5e56] transition-colors cursor-pointer shadow-[0_4px_20px_rgba(50,77,71,0.4)]"
              >
                Seviyeni Belirle
                <ArrowRight size={14} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openFreeTrial('courses_hub_hero')}
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-white/50 rounded-full text-[13px] font-['Neutraface_2_Text:Book',sans-serif] hover:border-[#6B1D2A]/40 hover:text-[#6B1D2A] hover:bg-[#6B1D2A]/[0.06] transition-all cursor-pointer backdrop-blur-sm"
              >
                Ücretsiz Deneme Seansı
              </motion.button>
            </motion.div>
          </div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-14 md:mt-18 flex justify-between py-6 px-6 md:px-10 bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06]"
          >
            {TRUST_STATS.map((stat) => (
              <div key={stat.label} className="text-center flex-1">
                <div className="font-['Neutraface_2_Text:Bold',sans-serif] text-[1.3rem] md:text-[2rem] text-[#324D47] leading-none mb-1">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="font-['Neutraface_2_Text:Book',sans-serif] text-white/20 text-[9px] md:text-[10px] uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dark → Light gradient transition */}
        {/* removed — clean hard cut */}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          2. PROGRAM BULUCU — Interactive Wizard
          ═══════════════════════════════════════════════════════════════════ */}
      <ProgramFinder />

      {/* ═══════════════════════════════════════════════════════════════════
          3. TÜM PROGRAMLAR — Soft Toggle (hidden by default)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative bg-[#FAFAF8]">
        {/* Soft toggle trigger */}
        <AnimatePresence>
          {!showAllPrograms && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-[1200px] mx-auto px-6 py-10 text-center"
            >
              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/30 text-[13px] mb-3">
                Aradığını bulamadın mı?
              </p>
              <button
                onClick={() => setShowAllPrograms(true)}
                className="inline-flex items-center gap-2 text-[#324D47]/60 text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] hover:text-[#324D47] transition-colors duration-300 cursor-pointer group"
              >
                <span className="border-b border-dashed border-[#324D47]/20 group-hover:border-[#324D47]/40 pb-0.5 transition-colors">
                  Tüm Eğitim Programlarına Göz At
                </span>
                <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform duration-300" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsible AllPrograms section */}
        <AnimatePresence>
          {showAllPrograms && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
              className="overflow-hidden"
            >
              {/* Close / collapse button */}
              <div className="max-w-[1200px] mx-auto px-6 pt-6 pb-2 flex justify-end">
                <button
                  onClick={() => setShowAllPrograms(false)}
                  className="inline-flex items-center gap-1.5 text-[#09090F]/25 text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] hover:text-[#324D47] transition-colors cursor-pointer"
                >
                  Programları Gizle
                  <ChevronDown size={12} className="rotate-180" />
                </button>
              </div>
              <AllPrograms />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
