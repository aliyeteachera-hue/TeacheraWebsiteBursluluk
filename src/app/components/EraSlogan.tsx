import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

/**
 * "A NEW ERA OF TEACHING" — Luxury Gold slogan
 * Horizontal, centered, responsive — premium shimmer via background-clip
 */

export default function EraSlogan({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });

  return (
    <div
      ref={ref}
      className={`pointer-events-none select-none flex justify-center ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 2, ease: 'easeOut' }}
      >
        <motion.span
          className="font-['Luxury:Gold',sans-serif] text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] whitespace-nowrap block bg-clip-text text-transparent"
          style={{
            letterSpacing: '0.35em',
            backgroundImage:
              'linear-gradient(90deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.10) 40%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.10) 60%, rgba(255,255,255,0.10) 100%)',
            backgroundSize: '250% 100%',
            backgroundPosition: '100% 0',
          }}
          animate={{
            backgroundPosition: ['100% 0', '-50% 0'],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            repeatDelay: 4,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          A NEW ERA OF TEACHING
        </motion.span>
      </motion.div>
    </div>
  );
}
