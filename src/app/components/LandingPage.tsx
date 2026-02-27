import Hero from './Hero';
import AgeSelection from './AgeSelection';
import TeachingMethod from './TeachingMethod';
import DeliveryOptions from './DeliveryOptions';
import Programs from './Programs';
import Academy from './Academy';
import Testimonials from './Testimonials';
import FAQ from './FAQ';

export default function LandingPage() {
  return (
    <>
      <Hero />
      <AgeSelection />
      <TeachingMethod />
      <DeliveryOptions />
      <Programs />
      <Academy />
      <Testimonials />
      <FAQ />
    </>
  );
}