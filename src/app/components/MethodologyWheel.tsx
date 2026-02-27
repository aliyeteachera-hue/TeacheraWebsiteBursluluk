import { motion, useScroll, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Infinity } from 'lucide-react';
import TeacheraLogo from "../../imports/TeacheraLogo";
import { ListenIcon, SpeakIcon, CorrectIcon, RepeatIcon } from './MethodologyIcons';

const steps = [
  {
    key: 'dinle',
    number: '01',
    title: 'DİNLE',
    subtitle: 'Her an dinle.',
    desc: 'Native Speaker eğitmen yeni bir yapı ya da kavram sistemli şekilde tanıtır. Ardından o yapıyı kullanmanı gerektiren soru gelir: beklemez, başlatır.',
    icon: ListenIcon,
    accent: '#324D47',
    bg: 'rgba(50, 77, 71, 0.03)',
  },
  {
    key: 'konus',
    number: '02',
    title: 'KONUŞ',
    subtitle: 'Her an konuş.',
    desc: 'Yeni öğrendiğin yapı, daha soğumadan… Native Speaker eğitmenin yönlendirmesiyle tam ve doğru cümle kurarsın. Bilgi "içeride" kalmaz; dışarı çıkar.',
    icon: SpeakIcon,
    accent: '#E70000',
    bg: 'rgba(231, 0, 0, 0.02)',
  },
  {
    key: 'duzelt',
    number: '03',
    title: 'DÜZELT',
    subtitle: 'Anında düzelt.',
    desc: 'Hata yaptıysan korkma. En ufak hata bile yanlış olarak yerleşmeden anında düzeltilir. Yanlışı tekrar ettirmeyiz; doğrusunu kurdururuz.',
    icon: CorrectIcon,
    accent: '#324D47',
    bg: 'rgba(50, 77, 71, 0.03)',
  },
  {
    key: 'tekrar',
    number: '04',
    title: 'TEKRAR ET',
    subtitle: 'Refleksleştir.',
    desc: 'Bu döngü, seri bir "soru bombardımanı" gibi devam eder. Tekrar sayısı artar; düşünme azalır. Bir süre sonra cümleler… refleks olur.',
    icon: RepeatIcon,
    accent: '#E70000',
    bg: 'rgba(231, 0, 0, 0.02)',
  },
];

// Mini cycle diagram component
function CycleDiagram({ currentStep }: { currentStep: number }) {
  const nodePositions = [
    { x: 40, y: 8 },   // top
    { x: 72, y: 40 },  // right
    { x: 40, y: 72 },  // bottom
    { x: 8, y: 40 },   // left
  ];

  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      {/* Circle path */}
      <circle cx="40" cy="40" r="32" stroke="#e5e7eb" strokeWidth="1" fill="none" />
      
      {/* Progress arc */}
      <motion.circle
        cx="40"
        cy="40"
        r="32"
        stroke={steps[currentStep].accent}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${2 * Math.PI * 32}`}
        initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
        animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - (currentStep + 1) / 4) }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px' }}
      />

      {/* Direction arrows */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * 90 + 45 - 90) * (Math.PI / 180);
        const x = 40 + 32 * Math.cos(angle);
        const y = 40 + 32 * Math.sin(angle);
        return (
          <motion.circle
            key={`dot-${i}`}
            cx={x}
            cy={y}
            r="1.5"
            initial={{ fill: '#d1d5db' }}
            animate={{ fill: currentStep >= i ? steps[currentStep].accent : '#d1d5db' }}
            transition={{ duration: 0.3 }}
          />
        );
      })}

      {/* Step nodes */}
      {nodePositions.map((pos, i) => {
        const isActive = currentStep === i;
        const isPast = currentStep > i;
        return (
          <motion.circle
            key={i}
            cx={pos.x}
            cy={pos.y}
            r={isActive ? 6 : 4}
            initial={{ fill: '#e5e7eb', opacity: 0.3 }}
            animate={{
              fill: isActive ? steps[i].accent : isPast ? steps[i].accent : '#e5e7eb',
              opacity: isActive ? 1 : isPast ? 0.5 : 0.3,
            }}
            transition={{ duration: 0.4 }}
          />
        );
      })}
    </svg>
  );
}

export default function MethodologyWheel() {
  const containerRef = useRef<HTMLElement>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (value) => {
      // 0-0.8 arasını 4 adıma böl, 0.8-1.0 arası son adımda kalır (tampon)
      const mapped = Math.min(value / 0.8, 1);
      const step = Math.min(Math.floor(mapped * 4), 3);
      setCurrentStep(step);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative"
      style={{ minHeight: '400vh' }}
    >
      {/* Sticky Container */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden" style={{ position: 'sticky' }}>
        {/* Background color transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${currentStep}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{ backgroundColor: step.bg }}
          />
        </AnimatePresence>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(${step.accent} 1px, transparent 1px), linear-gradient(90deg, ${step.accent} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        {/* Large watermark number */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`num-${currentStep}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
          >
            <span
              className="font-['Neutraface_2_Text:Bold',sans-serif] text-[200px] md:text-[320px] lg:text-[420px]"
              style={{
                color: step.accent,
                opacity: 0.04,
                lineHeight: 1,
              }}
            >
              {step.number}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          
          {/* Top bar: Header + Cycle diagram */}
          <div className="flex items-start justify-center md:justify-between px-6 md:px-12 lg:px-20 pt-24 md:pt-28">
            {/* Header */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-[90px] md:w-[110px] h-[18px] md:h-[22px] mb-1"
                style={{ '--fill-0': '#E70000' } as React.CSSProperties}
              >
                <TeacheraLogo />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="font-['Retro_Signature:Regular',sans-serif] text-2xl md:text-3xl lg:text-4xl"
                style={{
                  background: 'linear-gradient(135deg, #324D47 0%, #5A7B72 50%, #324D47 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Teaching Method
              </motion.p>
            </div>

            {/* Cycle diagram */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="hidden md:block"
            >
              <CycleDiagram currentStep={currentStep} />
            </motion.div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex items-center px-6 md:px-12 lg:px-20 pt-6 md:pt-0">
            <div className="w-full max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-5 md:grid md:grid-cols-12 md:gap-12 md:items-center"
                >
                  {/* Left: Icon + Number */}
                  <div className="md:col-span-5 flex flex-col items-center md:items-end">
                    <div className="relative">
                      {/* Icon container */}
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
                        className="relative w-24 h-24 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-2xl md:rounded-3xl flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${step.accent}10, ${step.accent}05)`,
                          border: `1px solid ${step.accent}15`,
                        }}
                      >
                        {/* Rotating border accent */}
                        <motion.div
                          className="absolute inset-0 rounded-3xl"
                          style={{
                            background: `conic-gradient(from 0deg, transparent 0%, ${step.accent}30 25%, transparent 50%)`,
                          }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        />
                        <div
                          className="absolute inset-[1px] rounded-3xl"
                          style={{ backgroundColor: step.bg === 'rgba(231, 0, 0, 0.02)' ? '#fefefe' : '#fafbfa' }}
                        />

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.4 }}
                          className="relative z-10"
                        >
                          <Icon
                            color={step.accent}
                            className="w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24"
                          />
                        </motion.div>
                      </motion.div>

                      {/* Step number badge */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: step.accent,
                          boxShadow: `0 4px 16px ${step.accent}40`,
                        }}
                      >
                        <span className="text-[#ffffff] font-['Neutraface_2_Text:Bold',sans-serif] text-[12px] md:text-[14px]">
                          {step.number}
                        </span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Right: Text content */}
                  <div className="md:col-span-7 text-center md:text-left">
                    {/* Title */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15, duration: 0.4 }}
                    >
                      <h2
                        className="font-['Neutraface_2_Text:Bold',sans-serif] text-2xl md:text-5xl lg:text-6xl tracking-tight mb-2"
                        style={{ color: step.accent }}
                      >
                        {step.title}
                      </h2>

                      {/* Accent line */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="h-[2px] rounded-full mb-5 origin-left mx-auto md:mx-0"
                        style={{
                          background: `linear-gradient(90deg, ${step.accent}, transparent)`,
                          width: 80,
                        }}
                      />
                    </motion.div>

                    {/* Subtitle */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.4 }}
                      className="font-['Neutraface_2_Text:Demi',sans-serif] text-[15px] md:text-2xl text-[#00000B] mb-2 md:mb-4"
                    >
                      {step.subtitle}
                    </motion.p>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.4 }}
                      className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] md:text-[17px] leading-relaxed text-[#484848] max-w-lg mx-auto md:mx-0"
                    >
                      {step.desc}
                    </motion.p>

                    {/* Next step hint */}
                    {currentStep < 3 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-2 mt-6 justify-center md:justify-start"
                      >
                        <span className="text-[12px] md:text-[13px] font-['Neutraface_2_Text:Book',sans-serif] text-[#9ca3af]">
                          Sonraki: {steps[currentStep + 1].title}
                        </span>
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight size={14} className="text-[#9ca3af]" />
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Final message on last step */}
                    {currentStep === 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 px-5 py-3 rounded-xl inline-flex items-center gap-3 mx-auto md:mx-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(50,77,71,0.06), rgba(231,0,0,0.04))',
                          border: '1px solid rgba(50,77,71,0.08)',
                        }}
                      >
                        <Infinity size={16} className="text-[#324D47]" />
                        <span className="text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]">
                          Bu döngü devam eder — cümleler refleks olur. Zamanla dil kalıcı bir şekilde akıcılaşır!
                        </span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom progress */}
          <div className="px-6 md:px-12 lg:px-20 pb-6 md:pb-12">
            <div className="max-w-6xl mx-auto">
              {/* Step labels with progress */}
              <div className="flex items-center gap-1 md:gap-0 w-full">
                {steps.map((s, i) => {
                  const isActive = currentStep === i;
                  const isPast = currentStep > i;
                  return (
                    <div key={s.key} className="flex-1 flex flex-col items-center relative">
                      {/* Progress bar segment */}
                      <div className="w-full h-[3px] rounded-full overflow-hidden mb-3 mx-1">
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: '0%' }}
                          animate={{
                            width: isActive || isPast ? '100%' : '0%',
                            backgroundColor: isActive ? s.accent : isPast ? s.accent : '#e5e7eb',
                          }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>

                      {/* Step label */}
                      <motion.span
                        className="text-[10px] md:text-[11px] font-['Neutraface_2_Text:Bold',sans-serif] tracking-widest whitespace-nowrap"
                        initial={{ color: '#c4c4c4', opacity: 0.3 }}
                        animate={{
                          color: isActive ? s.accent : isPast ? s.accent : '#c4c4c4',
                          opacity: isActive ? 1 : isPast ? 0.5 : 0.3,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {s.title}
                      </motion.span>

                      {/* Connector arrow (between segments) */}
                      {i < 3 && (
                        <motion.div
                          className="absolute -right-1 top-0 text-[8px] hidden md:block"
                          initial={{ color: '#d1d5db', opacity: 0.2 }}
                          animate={{
                            color: isPast ? s.accent : '#d1d5db',
                            opacity: isPast ? 0.6 : 0.2,
                          }}
                          transition={{ duration: 0.3 }}
                          style={{ transform: 'translateY(-2px)' }}
                        >
                          ›
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}