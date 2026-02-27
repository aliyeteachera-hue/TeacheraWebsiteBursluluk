import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Outlet, useLocation } from 'react-router';
import Navigation from './Navigation';
import MobileMenu from './MobileMenu';
import Footer from './Footer';
import { WhatsAppButton } from './WhatsAppButton';
import CookieConsent from './CookieConsent';
import LevelAssessmentModal from './LevelAssessment';
import { LevelAssessmentProvider } from './LevelAssessmentContext';
import FreeTrialModal from './FreeTrialModal';
import { FreeTrialProvider } from './FreeTrialContext';
import SeoManager from './SeoManager';
import { initTracking, trackPageView } from '../lib/analytics';

export default function RootLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.lang = 'tr';
  }, []);

  useEffect(() => {
    return initTracking();
  }, []);

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
    const handleScroll = () => {
      const sections = ['home', 'how-it-works', 'delivery-options', 'programs', 'faq'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setCurrentSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

          <WhatsAppButton />
          <CookieConsent />
          <LevelAssessmentModal />
          <FreeTrialModal />
        </motion.div>
      </LevelAssessmentProvider>
    </FreeTrialProvider>
  );
}
