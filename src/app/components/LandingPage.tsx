import { lazy, Suspense, useState } from 'react';
import Hero from './Hero';

const AgeSelection = lazy(() => import('./AgeSelection'));
const TeachingMethod = lazy(() => import('./TeachingMethod'));
const DeliveryOptions = lazy(() => import('./DeliveryOptions'));
const Programs = lazy(() => import('./Programs'));
const Academy = lazy(() => import('./Academy'));
const Testimonials = lazy(() => import('./Testimonials'));
const FAQ = lazy(() => import('./FAQ'));

export default function LandingPage() {
  const [showDeferredSections] = useState(true);

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
