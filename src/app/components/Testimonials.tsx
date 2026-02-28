import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import EraSlogan from './EraSlogan';
import architechtLogo from '../../assets/partners/architecht.png';
import msbLogo from '../../assets/partners/msb-logo.png';
import neuLogoWhite from '../../assets/partners/neu-logo-white.png';
import wessonLogo from '../../assets/partners/wesson.png';
import mondiLogo from '../../assets/partners/mondi-white.png';
import mebLogo from '../../assets/partners/meb-white.png';
import unileverLogo from '../../assets/partners/unilever-white.png';

const AUTOPLAY_MS = 6000;
const AUTOPLAY_TICK_MS = 120;

const testimonials = [
  {
    id: 1,
    name: 'Ayşe Yılmaz',
    role: 'Yüksek Mimar · Studio Arch',
    content:
      'Teachera ile başladığım İngilizce yolculuğumda, sadece dil bilgisi değil, aynı zamanda sektörel terminolojiye hakimiyet kazandım. Uluslararası projelerde artık çok daha özgüvenli sunumlar yapabiliyorum.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Mehmet Demir',
    role: 'Yazılım Mühendisi · TechSolutions',
    content:
      'Teknik dökümanları okumak ile global bir toplantıda fikirlerini savunmak arasında dağlar kadar fark var. Speaking odaklı yaklaşım tam da bu boşluğu doldurdu.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Zeynep Kaya',
    role: 'Pazarlama Direktörü · Global Brands',
    content:
      'Kültürel nüanslara hakim olmak hayati önem taşıyor. Teachera sadece dil öğretmiyor; o dilin kültürünü ve inceliklerini de aktarıyor. Premium hizmet anlayışını hissediyorsunuz.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Caner Öztürk',
    role: 'Finans Direktörü · Capital Finance',
    content:
      'Yurtdışı operasyonlarımızı yönetirken yaşadığım en büyük zorluk günlük iş konuşmalarıydı. Business English programı tam benim gibi yöneticiler için tasarlanmış.',
    rating: 5,
  },
  {
    id: 5,
    name: 'Elif Demir',
    role: 'İnsan Kaynakları · HR Global',
    content:
      'Çalışanlarımızın dil gelişimini takip etmek hiç bu kadar kolay olmamıştı. Raporlama sistemleri ve kurumsal çözümleri gerçekten etkileyici.',
    rating: 5,
  },
];

const partners = [
  { name: 'Architecht', logo: architechtLogo, frameClass: 'w-[176px] h-[58px]' },
  { name: 'NEU', logo: neuLogoWhite, frameClass: 'w-[156px] h-[52px]' },
  { name: 'Wesson', logo: wessonLogo, frameClass: 'w-[154px] h-[42px]' },
  { name: 'MSB', logo: msbLogo, frameClass: 'w-[88px] h-[88px]' },
  { name: 'MEB', logo: mebLogo, frameClass: 'w-[96px] h-[96px]' },
  { name: 'Mondi', logo: mondiLogo, frameClass: 'w-[162px] h-[54px]' },
  { name: 'Unilever', logo: unileverLogo, frameClass: 'w-[156px] h-[50px]' },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const [liteMotionMode, setLiteMotionMode] = useState(false);
  /* progress counts 0 → 100 for the active dot bar */
  const [progress, setProgress] = useState(0);

  const goTo = useCallback((i: number) => {
    setCurrent(i);
    setProgress(0);
  }, []);

  const prev = () => goTo(current === 0 ? testimonials.length - 1 : current - 1);
  const next = useCallback(
    () => goTo(current === testimonials.length - 1 ? 0 : current + 1),
    [current, goTo],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateLiteMode = () => {
      const lowCoreDevice = typeof navigator.hardwareConcurrency === 'number'
        ? navigator.hardwareConcurrency <= 4
        : false;
      setLiteMotionMode(mediaQuery.matches || lowCoreDevice);
    };

    updateLiteMode();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateLiteMode);
      return () => mediaQuery.removeEventListener('change', updateLiteMode);
    }

    mediaQuery.addListener(updateLiteMode);
    return () => mediaQuery.removeListener(updateLiteMode);
  }, []);

  /* Autoplay tick — low-frequency progress + slide advance */
  useEffect(() => {
    if (paused || shouldReduceMotion || liteMotionMode) return;
    const step = 100 / (AUTOPLAY_MS / AUTOPLAY_TICK_MS);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p + step >= 100) {
          next();
          return 0;
        }
        return p + step;
      });
    }, AUTOPLAY_TICK_MS);
    return () => clearInterval(id);
  }, [paused, next, shouldReduceMotion, liteMotionMode]);

  const t = testimonials[current];
  const shouldAnimatePartnerMarquee = !shouldReduceMotion;
  const partnerMarqueeDuration = liteMotionMode ? 58 : 42;
  const marqueePartners = shouldAnimatePartnerMarquee ? [...partners, ...partners] : partners;

  return (
    <section
      className="py-12 md:py-16 bg-[#09090F] relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Ambient glows */}
      <div className="absolute top-[20%] right-[-5%] w-[420px] h-[420px] bg-[#324D47]/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-8%] w-[500px] h-[500px] bg-[#09090F] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-[860px] mx-auto px-6 relative z-10">
        {/* ── Era Slogan — centered top ── */}
        <EraSlogan className="mb-8 md:mb-10" />

        {/* ── Header row ── */}
        <div className="flex items-end justify-between mb-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[#324D47] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] uppercase block mb-2">
              Öğrenci Deneyimi
            </span>
            <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-white text-[1.4rem] md:text-[1.8rem] leading-[1.15]">
              Gerçek <span className="text-white/20">Hikayeler.</span>
            </h2>
          </motion.div>

          {/* Nav arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center hover:border-[#324D47]/40 hover:text-[#324D47] text-white/25 transition-all cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => next()}
              className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center hover:border-[#324D47]/40 hover:text-[#324D47] text-white/25 transition-all cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* ── Testimonial ── */}
        <div className="relative min-h-[160px] md:min-h-[140px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            >
              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-white/65 text-[15px] md:text-[17px] leading-[1.75] mb-6">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#324D47]/15 flex items-center justify-center">
                    <span className="text-[#324D47] text-[11px] font-['Neutraface_2_Text:Demi',sans-serif]">
                      {t.name.split(' ').map((w) => w[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-white/80 text-[13px]">
                      {t.name}
                    </span>
                    <span className="text-white/15 text-[13px] mx-2">—</span>
                    <span className="font-['Neutraface_2_Text:Book',sans-serif] text-white/30 text-[12px]">
                      {t.role}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={10} fill="#324D47" className="text-[#324D47]/60" />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Progress dots ── */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative h-[3px] rounded-full overflow-hidden cursor-pointer transition-all duration-300"
              style={{ width: i === current ? 32 : 6 }}
            >
              {/* track */}
              <span className="absolute inset-0 bg-white/[0.08] rounded-full" />
              {/* fill */}
              {i === current && (
                <span
                  className="absolute inset-y-0 left-0 bg-[#324D47] rounded-full"
                  style={{ width: `${progress}%` }}
                />
              )}
              {i < current && (
                <span className="absolute inset-0 bg-[#324D47]/40 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Education Partners ── */}
      <div className="max-w-[860px] mx-auto px-6 mt-8 pt-6 border-t border-white/[0.04] relative z-10">
        <p className="text-center text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] text-white/15 tracking-[0.25em] uppercase mb-4">
          Eğitim Partnerlerimiz
        </p>

        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#09090F] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#09090F] to-transparent z-10 pointer-events-none" />

          <div className="flex whitespace-nowrap overflow-hidden">
            <motion.div
              className="flex items-center gap-14 min-w-max"
              animate={shouldAnimatePartnerMarquee ? { x: ['0%', '-50%'] } : undefined}
              transition={
                shouldAnimatePartnerMarquee
                  ? { repeat: Infinity, ease: 'linear', duration: partnerMarqueeDuration }
                  : undefined
              }
            >
              {marqueePartners.map((p, idx) => (
                <div
                  key={`${p.name}-${idx}`}
                  className={`flex-shrink-0 ${p.frameClass} opacity-[0.22] hover:opacity-50 transition-opacity duration-500 flex items-center justify-center`}
                >
                  <img
                    src={p.logo}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-contain brightness-0 invert"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
