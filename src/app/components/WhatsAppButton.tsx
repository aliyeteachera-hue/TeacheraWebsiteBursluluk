import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';
import whatsappImage from 'figma:asset/9694b181704f98419b88c2856e9838e3f6edf1aa.webp';
import { trackEvent } from '../lib/analytics';

// Geçici Vimeo GIF — ücretli sürümde kalıcı video URL ile değiştirilecek
const muazzezGif = 'https://videoapi-muybridge.vimeocdn.com/animated-thumbnails/image/512a942c-badf-4ef0-9d90-a1043b024e3a.gif?ClientID=sulu&Date=1771953209&Signature=50c3c8990ce27fc169526d8cf3c8410a1f8db2e4';

/* ─── Circular Orbiting Arc ─────────────────────────────────────────────── */
function CircularArc({ size = 80, color = 'rgba(255,255,255,0.9)', duration = 8 }) {
  const padding = 5;
  const svgSize = size + padding * 2;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const r = size / 2;
  const perimeter = 2 * Math.PI * r;

  const layers = [
    { lengthRatio: 0.32, opacity: 0.10, strokeWidth: 3 },
    { lengthRatio: 0.20, opacity: 0.30, strokeWidth: 1.5 },
    { lengthRatio: 0.10, opacity: 0.90, strokeWidth: 1 },
  ];

  return (
    <svg
      className="absolute pointer-events-none"
      style={{ left: -padding, top: -padding, width: svgSize, height: svgSize }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="wa-arc-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#wa-arc-glow)">
        {layers.map((layer, i) => {
          const arcLen = perimeter * layer.lengthRatio;
          const gap = perimeter - arcLen;
          return (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              stroke={color}
              strokeWidth={layer.strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${arcLen} ${gap}`}
              style={{ opacity: layer.opacity }}
              animate={{ strokeDashoffset: [0, -perimeter] }}
              transition={{ duration, repeat: Infinity, ease: 'linear' }}
            />
          );
        })}
      </g>
    </svg>
  );
}

export function WhatsAppButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    const phoneNumber = '905528674226';
    const message = encodeURIComponent('Merhaba, Teachera eğitimleriniz hakkında bilgi almak istiyorum.');
    trackEvent('whatsapp_click', {
      source: 'floating_widget',
      phone_number: phoneNumber,
    });
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <motion.div
      className="fixed right-6 bottom-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.5, type: 'spring', bounce: 0.4 }}
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-full right-0 mb-4 rounded-2xl shadow-2xl overflow-hidden w-80 border border-[#324D47]/10"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="p-5 bg-[#324D47] text-[#ffffff] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#3d5e56] to-[#324D47]" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#ffffff]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="font-['Neutraface_2_Text:Demi',sans-serif] text-[15px]">Bizimle İletişime Geç!</h3>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1.5 hover:bg-[#ffffff]/10 rounded-full transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-[12px] text-[#F4EBD1]/80 font-['Neutraface_2_Text:Book',sans-serif]">Sorularınız için buradayız</p>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-5 bg-[#F4EBD1]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-[#324D47]/15 shrink-0">
                  <img
                    src={muazzezGif}
                    onError={(e) => { (e.target as HTMLImageElement).src = whatsappImage; }}
                    alt="Muazzez - Müşteri Temsilcisi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] text-[#00000B]">Muazzez</p>
                  <p className="text-[11px] text-[#324D47] font-['Neutraface_2_Text:Book',sans-serif]">Müşteri Temsilcisi</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#324D47] animate-pulse" />
                  <span className="text-[10px] text-[#324D47]/60 font-['Neutraface_2_Text:Demi',sans-serif]">Çevrimiçi</span>
                </div>
              </div>
              
              {/* Chat bubble */}
              <div className="bg-[#ffffff] rounded-2xl rounded-tl-sm p-3.5 mb-4 shadow-sm border border-[#324D47]/5 relative">
                <div className="absolute top-0 left-0 w-2 h-2 bg-[#ffffff] -translate-x-1/2 rotate-45 border-l border-b border-[#324D47]/5" />
                <p className="text-[13px] text-[#00000B] font-['Neutraface_2_Text:Book',sans-serif] leading-relaxed">
                  Merhaba! Ben Muazzez. Size nasıl yardımcı olabilirim?
                </p>
              </div>
              
              <button
                onClick={handleClick}
                className="w-full bg-[#324D47] hover:bg-[#3d5e56] text-[#ffffff] py-3 px-4 rounded-xl font-['Neutraface_2_Text:Demi',sans-serif] text-[13px] tracking-wide transition-colors flex items-center justify-center gap-2.5 shadow-lg shadow-[#324D47]/20"
              >
                <MessageCircle size={16} />
                WhatsApp'ta Yaz
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button + Arc wrapper */}
      <div className="relative">
        <CircularArc size={80} color="rgba(50,77,71,0.7)" duration={8} />

        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative w-20 h-20 rounded-full shadow-2xl overflow-hidden group cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: isHovered
              ? '0 20px 60px rgba(50, 77, 71, 0.5)'
              : '0 10px 40px rgba(50, 77, 71, 0.3)',
          }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ scale: isExpanded ? 0.9 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={muazzezGif}
              onError={(e) => { (e.target as HTMLImageElement).src = whatsappImage; }}
              alt="WhatsApp Destek"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-[#324D47]/90"
            animate={{ opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <X size={32} className="text-[#ffffff]" />
          </motion.div>

          <motion.div
            className="absolute inset-0 rounded-full bg-[#324D47]"
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />

          <motion.div
            className="absolute bottom-1 right-1 w-5 h-5 bg-[#ffffff] rounded-full flex items-center justify-center shadow-lg"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-3 h-3 bg-[#324D47] rounded-full" />
          </motion.div>
        </motion.button>
      </div>

      <AnimatePresence>
        {isHovered && !isExpanded && (
          <motion.div
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#00000B] text-[#ffffff] px-4 py-2 rounded-lg whitespace-nowrap"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm font-['Neutraface_2_Text:Demi',sans-serif]">Muazzez'e yaz!</p>
            <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-[#00000B]" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
