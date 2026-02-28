import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';
import whatsappImage from 'figma:asset/9694b181704f98419b88c2856e9838e3f6edf1aa.webp';
import whatsappLoopVideo from '../../assets/video/whatsapp-loop.mp4';
import whatsappLoopVideoWebm from '../../assets/video/whatsapp-loop.webm';
import { trackEvent } from '../lib/analytics';

export function WhatsAppButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showSoftPrompt, setShowSoftPrompt] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) {
      setShowSoftPrompt(false);
      return;
    }

    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    const revealPrompt = () => {
      if (isExpanded || isHovered) return;
      setShowSoftPrompt(true);
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setShowSoftPrompt(false), 2600);
    };

    const introTimer = setTimeout(revealPrompt, 900);
    const cycleTimer = setInterval(revealPrompt, 11000);

    return () => {
      clearTimeout(introTimer);
      clearInterval(cycleTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isExpanded, isHovered, shouldReduceMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || shouldReduceMotion) return;

    if (isExpanded) {
      video.pause();
      return;
    }

    const maybePromise = video.play();
    if (maybePromise && typeof maybePromise.catch === 'function') {
      maybePromise.catch(() => {
        // Autoplay can be blocked by browser policy on some devices; ignore silently.
      });
    }
  }, [isExpanded, shouldReduceMotion]);

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
      className="fixed right-5 bottom-5 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.35, type: 'spring', bounce: 0.25 }}
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
                    src={whatsappImage}
                    alt="Muazzez - Müşteri Temsilcisi"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div>
                  <p className="font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] text-[#00000B]">Muazzez</p>
                  <p className="text-[11px] text-[#324D47] font-['Neutraface_2_Text:Book',sans-serif]">Müşteri Temsilcisi</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#324D47]" />
                  <span className="text-[10px] text-[#324D47]/60 font-['Neutraface_2_Text:Demi',sans-serif]">Çevrimiçi</span>
                </div>
              </div>
              
              {/* Chat bubble */}
              <button
                type="button"
                onClick={handleClick}
                className="w-full text-left bg-[#ffffff] rounded-2xl rounded-tl-sm p-3.5 mb-3 shadow-sm border border-[#324D47]/5 relative cursor-pointer hover:border-[#25D366]/40 transition-colors"
              >
                <div className="absolute top-0 left-0 w-2 h-2 bg-[#ffffff] -translate-x-1/2 rotate-45 border-l border-b border-[#324D47]/5" />
                <p className="text-[13px] text-[#00000B] font-['Neutraface_2_Text:Book',sans-serif] leading-relaxed">
                  Merhaba! Ben Muazzez. Size nasıl yardımcı olabilirim?
                </p>
              </button>

              <button
                type="button"
                onClick={handleClick}
                className="w-full h-[42px] mb-4 px-3.5 rounded-xl bg-[#ffffff] border border-[#324D47]/10 text-[#324D47]/55 text-[12px] font-['Neutraface_2_Text:Book',sans-serif] text-left hover:border-[#25D366]/40 hover:text-[#324D47] transition-colors cursor-pointer"
              >
                WhatsApp'ta mesaj yazın...
              </button>
              
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

      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-16 h-16 rounded-full shadow-xl overflow-hidden cursor-pointer border border-[#324D47]/20"
        animate={!shouldReduceMotion && !isExpanded ? { y: [0, -2, 0], scale: [1, 1.015, 1] } : undefined}
        transition={!shouldReduceMotion && !isExpanded ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : undefined}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover will-change-transform"
          autoPlay
          muted
          defaultMuted
          loop
          playsInline
          preload="metadata"
          aria-label="WhatsApp Destek"
        >
          <source src={whatsappLoopVideoWebm} type="video/webm" />
          <source src={whatsappLoopVideo} type="video/mp4" />
        </video>

        {isExpanded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#324D47]/90">
            <X size={28} className="text-[#ffffff]" />
          </div>
        )}

        <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#ffffff] rounded-full flex items-center justify-center shadow">
          <motion.div
            className="w-2.5 h-2.5 bg-[#324D47] rounded-full"
            animate={!shouldReduceMotion ? { scale: [1, 1.25, 1], opacity: [1, 0.65, 1] } : undefined}
            transition={!shouldReduceMotion ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : undefined}
          />
        </div>
      </motion.button>

      <AnimatePresence>
        {(isHovered || showSoftPrompt) && !isExpanded && (
          <motion.div
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-[#00000B]/88 backdrop-blur-[2px] text-[#ffffff] px-3.5 py-1.5 rounded-lg whitespace-nowrap border border-white/10"
            initial={{ opacity: 0, x: 8, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
          >
            <p className="text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] text-white/90">Muazzez'e yaz</p>
            <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-[#00000B]" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
