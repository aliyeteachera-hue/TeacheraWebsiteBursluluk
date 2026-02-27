import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════
   FLOATING WORDS — language greetings drifting in the background
   ═══════════════════════════════════════════════════════════════════════ */
const FLOATING_WORDS = [
  { text: 'Hello', x: 6, y: 15, size: 3.2, opacity: 0.06, color: '#E70000', duration: 20, delay: 0 },
  { text: 'Hola', x: 80, y: 50, size: 2.6, opacity: 0.08, color: '#FFC400', duration: 22, delay: 1.5 },
  { text: 'Bonjour', x: 12, y: 70, size: 2.4, opacity: 0.05, color: '#0055A4', duration: 24, delay: 0.8 },
  { text: 'Hallo', x: 88, y: 25, size: 1.8, opacity: 0.12, color: '#DD0000', duration: 18, delay: 2 },
  { text: 'Ciao', x: 40, y: 82, size: 2.0, opacity: 0.05, color: '#008C45', duration: 19, delay: 0.5 },
  { text: 'Привет', x: 70, y: 78, size: 1.6, opacity: 0.10, color: '#D52B1E', duration: 21, delay: 3 },
  { text: 'Danke', x: 62, y: 12, size: 1.2, opacity: 0.14, color: '#DD0000', duration: 16, delay: 4 },
  { text: 'Merci', x: 85, y: 42, size: 1.1, opacity: 0.13, color: '#0055A4', duration: 15, delay: 2.5 },
  { text: 'Gracias', x: 22, y: 88, size: 1.3, opacity: 0.05, color: '#FFC400', duration: 17, delay: 1.8 },
  { text: 'Thanks', x: 76, y: 10, size: 1.1, opacity: 0.10, color: '#E70000', duration: 14, delay: 3.5 },
  { text: 'Grazie', x: 93, y: 72, size: 1.2, opacity: 0.11, color: '#008C45', duration: 18, delay: 0.3 },
  { text: 'Спасибо', x: 55, y: 90, size: 1.0, opacity: 0.09, color: '#D52B1E', duration: 20, delay: 2.2 },
  { text: 'Lingua', x: 68, y: 32, size: 0.9, opacity: 0.06, color: '#ffffff', duration: 26, delay: 5 },
  { text: 'Sprache', x: 4, y: 48, size: 0.85, opacity: 0.04, color: '#ffffff', duration: 24, delay: 3.8 },
  { text: 'Idioma', x: 86, y: 65, size: 0.95, opacity: 0.07, color: '#ffffff', duration: 22, delay: 1.2 },
  { text: 'Язык', x: 48, y: 8, size: 0.9, opacity: 0.04, color: '#ffffff', duration: 25, delay: 6 },
];

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen bg-[#00000B] overflow-hidden flex items-center justify-center">
      {/* ═══ AMBIENT BACKGROUND ═══ */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[60vw] h-[40vw] bg-[#324D47] rounded-full mix-blend-screen filter blur-[200px] opacity-[0.06]" />
        <div className="absolute bottom-[15%] right-[15%] w-[30vw] h-[30vw] bg-[#E70000] rounded-full mix-blend-screen filter blur-[180px] opacity-[0.03]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ═══ FLOATING WORDS ═══ */}
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

      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 pt-32 md:pt-40 pb-24">
        {/* ═══ CENTERED CONTENT ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Pill Badge — Geliştiriliyor */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E70000]/20 bg-[#E70000]/5 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E70000] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E70000]" />
            </span>
            <span className="text-[#E70000] text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.15em] uppercase">
              Geliştiriliyor
            </span>
          </motion.div>

          {/* Page Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="text-4xl md:text-5xl lg:text-6xl font-['Neutraface_2_Text:Bold',sans-serif] text-white leading-[1.08] mb-8"
          >
            Çok yakında yayında.
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-[#ffffff]/50 font-['Neutraface_2_Text:Book',sans-serif] text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-12"
          >
            İngilizce, İspanyolca, Almanca, İtalyanca, Fransızca, Rusça dillerinde{' '}
            <span className="text-[#ffffff]/70">özel ve grup online eğitim fiyatlarımız</span> yakında yayına girecek.
            O zamana kadar eğitim danışmanlarımızdan size uygun programlar hakkında bilgi alıp,
            online eğitimlerinize başlayabilirsiniz.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/iletisim')}
            className="group inline-flex items-center gap-3 pl-8 pr-3 py-3 bg-[#324D47] hover:bg-[#3d5e56] text-white rounded-full font-['Neutraface_2_Text:Demi',sans-serif] text-sm tracking-wide transition-all duration-300 cursor-pointer"
          >
            <span>Fiyat Bilgisi Al</span>
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
              <ArrowRight size={17} />
            </div>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
