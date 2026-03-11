import { lazy, Suspense, useEffect, useState } from 'react';
import Hero from './Hero';

const AgeSelection = lazy(() => import('./AgeSelection'));
const TeachingMethod = lazy(() => import('./TeachingMethod'));
const DeliveryOptions = lazy(() => import('./DeliveryOptions'));
const Programs = lazy(() => import('./Programs'));
const Academy = lazy(() => import('./Academy'));
const Testimonials = lazy(() => import('./Testimonials'));
const FAQ = lazy(() => import('./FAQ'));

export default function LandingPage() {
  const [showDeferredSections, setShowDeferredSections] = useState(false);

  useEffect(() => {
    let timeoutId = 0;
    let idleId: number | null = null;
    let activated = false;
    const win = window as Window & {
      requestIdleCallback?: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    const activate = () => {
      if (activated) return;
      activated = true;
      setShowDeferredSections(true);
      window.removeEventListener('scroll', activate);
      window.removeEventListener('touchstart', activate);
      window.removeEventListener('mousedown', activate);
      window.removeEventListener('keydown', activate);
    };

    window.addEventListener('scroll', activate, { passive: true, once: true });
    window.addEventListener('touchstart', activate, { passive: true, once: true });
    window.addEventListener('mousedown', activate, { passive: true, once: true });
    window.addEventListener('keydown', activate, { passive: true, once: true });

    if (typeof win.requestIdleCallback === 'function') {
      idleId = win.requestIdleCallback(activate, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(activate, 700);
    }

    return () => {
      window.clearTimeout(timeoutId);
      if (idleId !== null && typeof win.cancelIdleCallback === 'function') {
        win.cancelIdleCallback(idleId);
      }
      window.removeEventListener('scroll', activate);
      window.removeEventListener('touchstart', activate);
      window.removeEventListener('mousedown', activate);
      window.removeEventListener('keydown', activate);
    };
  }, []);

  return (
    <>
      <Hero />
      {showDeferredSections && (
        <Suspense fallback={null}>
          <AgeSelection />
          <TeachingMethod />
          <DeliveryOptions />
          <Programs />
          <Academy />
          <Testimonials />
          <FAQ />
        </Suspense>
      )}
    </>
  );
}
