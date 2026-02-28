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
    let idleId = 0;
    const interactionEvents: Array<keyof WindowEventMap> = [
      'pointerdown',
      'click',
      'scroll',
      'touchstart',
      'wheel',
      'keydown',
    ];

    const enableDeferredSections = () => setShowDeferredSections(true);
    const idleApi = window as typeof window & {
      requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const requestIdle = idleApi.requestIdleCallback;
    const onFirstInteraction = () => enableDeferredSections();

    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, onFirstInteraction, { passive: true });
    });

    if (typeof requestIdle === 'function') {
      idleId = requestIdle(() => enableDeferredSections(), { timeout: 1400 });
      return () => {
        idleApi.cancelIdleCallback?.(idleId);
        interactionEvents.forEach((eventName) => {
          window.removeEventListener(eventName, onFirstInteraction);
        });
      };
    }

    timeoutId = window.setTimeout(enableDeferredSections, 900);
    return () => {
      window.clearTimeout(timeoutId);
      interactionEvents.forEach((eventName) => {
        window.removeEventListener(eventName, onFirstInteraction);
      });
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
