import { motion } from 'motion/react';
import TeacheraLogo from '../../imports/TeacheraLogo';

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: '#00000B' }}
    >
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(50,77,71,0.12) 0%, rgba(50,77,71,0.05) 40%, transparent 70%)',
          }}
        />
        {/* Subtle grid pattern */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Center Content */}
      <div className="relative flex flex-col items-center">
        
        {/* Top accent line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 40, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="h-[1px] bg-gradient-to-r from-transparent via-[#324D47] to-transparent mb-10"
        />

        {/* Logo Container */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Logo glow effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0.3] }}
            transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
            className="absolute -inset-8 rounded-3xl"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(50,77,71,0.2) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
          
          {/* Actual Logo */}
          <div
            className="relative w-[200px] h-[40px] md:w-[260px] md:h-[52px]"
            style={{ '--fill-0': '#ffffff' } as React.CSSProperties}
          >
            <TeacheraLogo />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.4, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
          className="mt-6 text-[10px] md:text-xs text-[#ffffff]/40 font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.35em] uppercase"
        >
          Premium Language Education
        </motion.p>

        {/* Loading Bar */}
        <div className="mt-12 relative">
          <div className="w-[120px] md:w-[160px] h-[1px] bg-[#ffffff]/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: [0.43, 0.13, 0.23, 0.96],
              }}
              className="w-1/2 h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #324D47, transparent)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Corner Accents */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute bottom-8 left-8 md:bottom-12 md:left-12 flex items-center gap-3"
      >
        <div className="w-6 h-[1px] bg-[#324D47]" />
        <span className="text-[8px] md:text-[9px] text-[#ffffff]/30 font-['Neutraface_2_Text:Book',sans-serif] tracking-[0.2em] uppercase">
          Est. 2024
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1.5, delay: 0.6 }}
        className="absolute bottom-8 right-8 md:bottom-12 md:right-12"
      >
        <span className="text-[8px] md:text-[9px] text-[#ffffff]/30 font-['Neutraface_2_Text:Book',sans-serif] tracking-[0.2em] uppercase">
          Konya, Türkiye
        </span>
      </motion.div>
    </motion.div>
  );
}