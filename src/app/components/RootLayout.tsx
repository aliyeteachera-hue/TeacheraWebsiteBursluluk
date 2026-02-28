import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { Outlet, useLocation } from 'react-router';
import Navigation from './Navigation';
import MobileMenu from './MobileMenu';
import Footer from './Footer';
import { LevelAssessmentProvider } from './LevelAssessmentContext';
import { FreeTrialProvider } from './FreeTrialContext';
import SeoManager from './SeoManager';
import LevelAssessmentModal from './LevelAssessment';
import FreeTrialModal from './FreeTrialModal';
import { initTracking, trackPageView } from '../lib/analytics';

const WhatsAppButton = lazy(() =>
  import('./WhatsAppButton').then((module) => ({ default: module.WhatsAppButton })),
);
const CookieConsent = lazy(() => import('./CookieConsent'));

export default function RootLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const [showDeferredUi, setShowDeferredUi] = useState(false);
  const [forceReducedMotion, setForceReducedMotion] = useState(false);
  const currentSectionRef = useRef('home');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.lang = 'tr';
  }, []);

  useEffect(() => {
    return initTracking();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowDeferredUi(true);
    }, 700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const setByDevice = () => {
      const lowCoreDevice = typeof navigator.hardwareConcurrency === 'number'
        ? navigator.hardwareConcurrency <= 4
        : false;
      setForceReducedMotion(mediaQuery.matches || lowCoreDevice);
    };

    setByDevice();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', setByDevice);
      return () => mediaQuery.removeEventListener('change', setByDevice);
    }

    mediaQuery.addListener(setByDevice);
    return () => mediaQuery.removeListener(setByDevice);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('teachera-reduce-motion', forceReducedMotion);
    return () => document.documentElement.classList.remove('teachera-reduce-motion');
  }, [forceReducedMotion]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    trackPageView();
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (location.pathname !== '/') {
      setCurrentSection('home');
      currentSectionRef.current = 'home';
      return;
    }

    const shouldTrackScrollSections = window.matchMedia('(min-width: 1024px)').matches;
    if (!shouldTrackScrollSections) {
      setCurrentSection('home');
      currentSectionRef.current = 'home';
      return;
    }

    let rafId = 0;
    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;

        const sections = ['home', 'how-it-works', 'delivery-options', 'programs', 'faq'];
        const scrollPosition = window.scrollY + 100;
        let nextSection = currentSectionRef.current;

        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const offsetTop = element.offsetTop;
            const offsetBottom = offsetTop + element.offsetHeight;

            if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
              nextSection = section;
              break;
            }
          }
        }

        if (nextSection !== currentSectionRef.current) {
          currentSectionRef.current = nextSection;
          setCurrentSection(nextSection);
        }
      });
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    currentSectionRef.current = currentSection;
  }, [currentSection]);

  const isAuthPage = location.pathname === '/giris';

  return (
    <FreeTrialProvider>
      <LevelAssessmentProvider>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white"
        >
          <SeoManager />
          <Navigation
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            currentSection={currentSection}
          />

          <MobileMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            currentSection={currentSection}
          />

          <main className="relative">
            <Outlet />
          </main>

          {!isAuthPage && <Footer />}

          <LevelAssessmentModal />
          <FreeTrialModal />

          {showDeferredUi && (
            <Suspense fallback={null}>
              <WhatsAppButton />
              <CookieConsent />
            </Suspense>
          )}
        </motion.div>
      </LevelAssessmentProvider>
    </FreeTrialProvider>
  );
}
