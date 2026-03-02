import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { Outlet, useLocation } from 'react-router';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Toaster } from 'sonner';
import Navigation from './Navigation';
import MobileMenu from './MobileMenu';
import Footer from './Footer';
import { LevelAssessmentProvider } from './LevelAssessmentContext';
import { FreeTrialProvider } from './FreeTrialContext';
import SeoManager from './SeoManager';
import LevelAssessmentModal from './LevelAssessment';
import FreeTrialModal from './FreeTrialModal';
import { initTracking, trackPageView } from '../lib/analytics';
import { useLiteMode } from '../lib/useLiteMode';

const WhatsAppButton = lazy(() =>
  import('./WhatsAppButton').then((module) => ({ default: module.WhatsAppButton })),
);
const CookieConsent = lazy(() => import('./CookieConsent'));

export default function RootLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const [showDeferredUi, setShowDeferredUi] = useState(false);
  const currentSectionRef = useRef('home');
  const menuScrollLockStateRef = useRef<{
    scrollY: number;
    bodyOverflow: string;
    bodyPosition: string;
    bodyTop: string;
    bodyWidth: string;
    bodyLeft: string;
    bodyRight: string;
    bodyTouchAction: string;
    htmlOverflow: string;
    htmlOverscrollY: string;
  } | null>(null);
  const location = useLocation();
  const liteMode = useLiteMode();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.lang = 'tr';
  }, []);

  useEffect(() => {
    return initTracking();
  }, []);

  useEffect(() => {
    let timeoutId = 0;
    let idleId: number | null = null;
    const onReady = () => setShowDeferredUi(true);
    const win = window as Window & {
      requestIdleCallback?: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === 'function') {
      idleId = win.requestIdleCallback(onReady, { timeout: 1600 });
    } else {
      timeoutId = window.setTimeout(onReady, 900);
    }

    return () => {
      window.clearTimeout(timeoutId);
      if (idleId !== null && typeof win.cancelIdleCallback === 'function') {
        win.cancelIdleCallback(idleId);
      }
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('teachera-reduce-motion', liteMode);
    return () => document.documentElement.classList.remove('teachera-reduce-motion');
  }, [liteMode]);

  useEffect(() => {
    const restoreMenuScrollLock = (restoreScrollPosition: boolean) => {
      const saved = menuScrollLockStateRef.current;
      if (!saved) return;

      const bodyStyle = document.body.style;
      const htmlStyle = document.documentElement.style;
      bodyStyle.overflow = saved.bodyOverflow;
      bodyStyle.position = saved.bodyPosition;
      bodyStyle.top = saved.bodyTop;
      bodyStyle.width = saved.bodyWidth;
      bodyStyle.left = saved.bodyLeft;
      bodyStyle.right = saved.bodyRight;
      bodyStyle.touchAction = saved.bodyTouchAction;
      htmlStyle.overflow = saved.htmlOverflow;
      htmlStyle.overscrollBehaviorY = saved.htmlOverscrollY;

      if (restoreScrollPosition) {
        window.scrollTo(0, saved.scrollY);
      }

      menuScrollLockStateRef.current = null;
    };

    if (isMenuOpen) {
      const bodyStyle = document.body.style;
      const htmlStyle = document.documentElement.style;
      const scrollY = window.scrollY;

      menuScrollLockStateRef.current = {
        scrollY,
        bodyOverflow: bodyStyle.overflow,
        bodyPosition: bodyStyle.position,
        bodyTop: bodyStyle.top,
        bodyWidth: bodyStyle.width,
        bodyLeft: bodyStyle.left,
        bodyRight: bodyStyle.right,
        bodyTouchAction: bodyStyle.touchAction,
        htmlOverflow: htmlStyle.overflow,
        htmlOverscrollY: htmlStyle.overscrollBehaviorY,
      };

      bodyStyle.overflow = 'hidden';
      bodyStyle.position = 'fixed';
      bodyStyle.top = `-${scrollY}px`;
      bodyStyle.width = '100%';
      bodyStyle.left = '0';
      bodyStyle.right = '0';
      htmlStyle.overflow = 'hidden';
      htmlStyle.overscrollBehaviorY = 'none';
      return () => restoreMenuScrollLock(true);
    } else {
      restoreMenuScrollLock(true);
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
          <Toaster
            richColors
            position="top-center"
            closeButton
            toastOptions={{
              className:
                "font-['Neutraface_2_Text:Book',sans-serif]",
            }}
          />

          <Suspense fallback={null}>
            <WhatsAppButton />
            {showDeferredUi && <CookieConsent />}
          </Suspense>

          <SpeedInsights sampleRate={0.5} />
        </motion.div>
      </LevelAssessmentProvider>
    </FreeTrialProvider>
  );
}
