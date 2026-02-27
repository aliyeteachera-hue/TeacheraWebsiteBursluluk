import { useState, useRef } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import TeacheraLogo from '../../imports/TeacheraLogo';
import { useLevelAssessment } from './LevelAssessmentContext';
import { useFreeTrial } from './FreeTrialContext';
import neuLogoImg from 'figma:asset/21caa0f68b9225ac66749719ebaf62a436372e41.webp';

interface NavigationProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  currentSection: string;
}

export default function Navigation({ isMenuOpen, setIsMenuOpen, currentSection }: NavigationProps) {
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const location = useLocation();
  const { open: openLevelAssessment } = useLevelAssessment();
  const { open: openFreeTrial } = useFreeTrial();

  const [scrolled, setScrolled] = useState(false);
  const isAcademyPage = location.pathname === '/academy';
  const isSpeakUpPage = location.pathname === '/speakup';

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 40);
  });

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  const goHome = () => {
    if (location.pathname !== '/') navigate('/');
    else scrollToSection('home');
  };

  const scrollToSpeakUpForm = () => {
    const el = document.getElementById('speakup-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? 'bg-[#09090F]/80 backdrop-blur-2xl shadow-[0_1px_0_rgba(255,255,255,0.04)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div
          className={`flex items-center justify-between transition-all duration-700 ease-out ${
            scrolled ? 'h-16 md:h-18' : 'h-20 md:h-28'
          }`}
        >
          {/* ═══ Logo ═══ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex-shrink-0 cursor-pointer relative z-50 flex items-center gap-3 md:gap-4"
            onClick={goHome}
          >
            <div
              className={`transition-all duration-700 ease-out ${
                scrolled ? 'w-[85px] sm:w-[100px] md:w-[115px]' : 'w-[95px] sm:w-[115px] md:w-[146px]'
              } aspect-[146/29]`}
            >
              <TeacheraLogo />
            </div>

            {/* Academy badge — only on /academy */}
            {isAcademyPage && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-3 md:gap-4"
              >
                <div className={`w-[1px] bg-white/25 transition-all duration-700 ${scrolled ? 'h-4' : 'h-5 md:h-6'}`} />
                <span className={`font-['Neutraface_2_Text:Bold',sans-serif] text-transparent bg-clip-text bg-gradient-to-r from-[#E70000] to-[#FF6B6B] tracking-[0.15em] uppercase leading-none transition-all duration-700 ${scrolled ? 'text-[11px] md:text-[13px]' : 'text-[13px] md:text-[16px]'}`}>
                  ACADEMY
                </span>
              </motion.div>
            )}

            {/* SpeakUP badge — Teachera & NEÜ co-branding */}
            {isSpeakUpPage && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center gap-2.5 md:gap-3.5"
              >
                <span className={`text-white/25 font-['Neutraface_2_Text:Book',sans-serif] transition-all duration-700 ${scrolled ? 'text-[14px] md:text-[16px]' : 'text-[16px] md:text-[20px]'}`}>
                  &amp;
                </span>
                <img
                  src={neuLogoImg}
                  alt="Necmettin Erbakan Üniversitesi"
                  className={`object-contain transition-all duration-700 opacity-70 ${scrolled ? 'h-[18px] sm:h-[22px] md:h-[26px]' : 'h-[22px] sm:h-[26px] md:h-[32px]'}`}
                />
              </motion.div>
            )}
          </motion.div>

          {/* ═══ Right: CTAs + Menu ═══ */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* ── SpeakUP page: "Hemen Başvur" red CTA ── */}
            {isSpeakUpPage ? (
              <>
                {/* Desktop */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.15 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToSpeakUpForm}
                  className="hidden md:flex items-center gap-2 px-6 py-2 rounded-full bg-[#E70000] border border-[#E70000] text-white text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.14em] cursor-pointer hover:bg-[#c40000] hover:border-[#c40000] transition-all duration-500 shadow-lg shadow-[#E70000]/20 hover:shadow-[#E70000]/35"
                >
                  HEMEN BASVUR
                  <ArrowUpRight size={13} />
                </motion.button>

                {/* Mobile */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.15 }}
                  onClick={scrollToSpeakUpForm}
                  className="md:hidden flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#E70000] border border-[#E70000] text-white text-[8px] sm:text-[9px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.1em] sm:tracking-[0.12em] cursor-pointer active:scale-95 transition-all duration-300 whitespace-nowrap shadow-lg shadow-[#E70000]/20"
                >
                  BASVUR
                  <ArrowUpRight size={10} />
                </motion.button>
              </>
            ) : (
              <>
                {/* Desktop: Seviye Tespit — ghost */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.15 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openLevelAssessment()}
                  className="hidden md:block px-5 py-2 rounded-full border border-white/[0.08] text-white/40 text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.14em] uppercase cursor-pointer hover:border-white/20 hover:text-white/70 transition-all duration-500"
                >
                  Seviye Tespit
                </motion.button>

                {/* Desktop: Ücretsiz Deneme Seansı — green filled */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openFreeTrial()}
                  className="hidden md:block px-5 py-2 rounded-full bg-[#324D47] border border-[#324D47] text-white/90 text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.14em] uppercase cursor-pointer hover:bg-[#3d5e56] hover:border-[#3d5e56] hover:text-white transition-all duration-500"
                >
                  Ücretsiz Deneme Seansı
                </motion.button>

                {/* Mobile: Ücretsiz Deneme Seansı — green filled compact */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.15 }}
                  onClick={() => openFreeTrial()}
                  className="md:hidden px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#324D47] border border-[#324D47] text-white/90 text-[8px] sm:text-[9px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.1em] sm:tracking-[0.12em] uppercase cursor-pointer active:scale-95 transition-all duration-300 whitespace-nowrap"
                >
                  Ücretsiz Seans
                </motion.button>
              </>
            )}

            {/* Divider */}
            <div className="w-px h-5 bg-white/[0.08]" />

            {/* ═══ Menu Pill ═══ */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`relative z-50 cursor-pointer transition-opacity duration-300 ${
                isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
              aria-label="Toggle menu"
            >
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.18] transition-all duration-500 group/menu">
                <span className="hidden sm:inline font-['Neutraface_2_Text:Demi',sans-serif] text-[10px] tracking-[0.2em] uppercase text-white/50 group-hover/menu:text-white/80 transition-colors duration-300">
                  Menü
                </span>
                <div className="flex flex-col items-end gap-[4px]">
                  <span className="block w-[16px] sm:w-[18px] h-[1.5px] bg-white/60 rounded-full group-hover/menu:w-5 group-hover/menu:bg-white transition-all duration-300" />
                  <span className="block w-[11px] sm:w-[13px] h-[1.5px] bg-white/40 rounded-full group-hover/menu:w-5 group-hover/menu:bg-white transition-all duration-300" />
                </div>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}
