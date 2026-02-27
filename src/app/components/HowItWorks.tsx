import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';

// 4 Köşeli Teachera Amblem (Kurumsal Sembol)
function TeacheraEmblem({ className = "" }: { className?: string }) {
  return (
    <motion.svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      className={className}
      animate={{ rotate: 360 }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
    >
      {/* 4 Köşeli Diamond/Karo Şekli */}
      <g filter="url(#glow)">
        {/* Ana Karo */}
        <path
          d="M100 20 L180 100 L100 180 L20 100 Z"
          fill="url(#gradient)"
          stroke="#E51E25"
          strokeWidth="3"
        />
        
        {/* İç Desenler - 4 Bacak Temsili */}
        <path
          d="M100 20 L100 100 L180 100 Z"
          fill="#E51E25"
          opacity="0.9"
        />
        <path
          d="M180 100 L100 100 L100 180 Z"
          fill="#334E48"
          opacity="0.85"
        />
        <path
          d="M100 180 L100 100 L20 100 Z"
          fill="#E51E25"
          opacity="0.8"
        />
        <path
          d="M20 100 L100 100 L100 20 Z"
          fill="#334E48"
          opacity="0.75"
        />
        
        {/* Merkez Nokta */}
        <circle cx="100" cy="100" r="15" fill="#EEEBF5" />
        <circle cx="100" cy="100" r="8" fill="#E51E25" />
      </g>
      
      <defs>
        <linearGradient id="gradient" x1="20" y1="20" x2="180" y2="180">
          <stop offset="0%" stopColor="#E51E25" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#334E48" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#E51E25" stopOpacity="0.3" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </motion.svg>
  );
}

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const methodologySteps = [
    {
      title: "HER AN DİNLE",
      description: "Öğretmen yeni kelimeleri tanıtarak bu kelimelerle sorular yöneltir. Doğru telaffuz ve yapıyı dinleyerek öğrenirsin.",
      position: "left",
      color: "#E51E25"
    },
    {
      title: "HER AN KONUŞ",
      description: "Öğretmen rehberliğinde aktif konuşma pratiği yaparsın. Dili kullanarak öğrenirsin.",
      position: "right",
      color: "#334E48"
    },
    {
      title: "DÜZELT",
      description: "Anında geri bildirim ve düzeltmelerle doğru kullanımı pekiştirirsin.",
      position: "left",
      color: "#E51E25"
    },
    {
      title: "TEKRAR ET",
      description: "Kas hafızası geliştirerek dili refleks haline getirirsin. Otomatik konuşmaya başlarsın.",
      position: "right",
      color: "#334E48"
    }
  ];

  // Auto-rotate through steps
  useEffect(() => {
    if (!isInView) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % methodologySteps.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isInView, methodologySteps.length]);

  return (
    <section 
      id="how-it-works" 
      ref={ref}
      className="relative py-24 md:py-32 bg-[#ffffff] overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#ffffff] via-[#F3EBD1]/10 to-[#ffffff]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-6 py-2 bg-[#09090F] text-[#EEEBF5] rounded-full text-sm font-['Neutraface_2_Text:Demi',sans-serif] mb-6"
          >
            Teachera Teaching Method
          </motion.span>
          
          <h2 className="text-3xl md:text-5xl font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] mb-6">
            NASIL ÇALIŞIR?
          </h2>
          
          <p className="text-lg md:text-xl text-[#484848] max-w-3xl mx-auto font-['Neutraface_2_Text:Book',sans-serif] leading-relaxed">
            4 temel bacak üzerinde sistematik bir öğrenme deneyimi
          </p>
        </motion.div>

        {/* Main Content - Rotating Emblem + Dynamic Text */}
        <div className="relative">
          {/* Center Emblem */}
          <div className="flex items-center justify-center mb-12">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={isInView ? { scale: 1, rotate: 0 } : {}}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <TeacheraEmblem className="w-48 h-48 md:w-64 md:h-64" />
            </motion.div>
          </div>

          {/* Dynamic Content Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
            {methodologySteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: step.position === "left" ? -50 : 50 }}
                animate={
                  isInView
                    ? {
                        opacity: currentIndex === index ? 1 : 0.3,
                        x: 0,
                        scale: currentIndex === index ? 1.05 : 1
                      }
                    : {}
                }
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`relative p-8 rounded-2xl transition-all duration-500 ${
                  currentIndex === index ? 'bg-[#ffffff] shadow-2xl' : 'bg-gray-50'
                }`}
                style={{
                  borderLeft: step.position === "left" ? `4px solid ${step.color}` : 'none',
                  borderRight: step.position === "right" ? `4px solid ${step.color}` : 'none'
                }}
              >
                {/* Number Badge */}
                <motion.div
                  animate={{
                    scale: currentIndex === index ? [1, 1.2, 1] : 1,
                    rotate: currentIndex === index ? [0, 5, -5, 0] : 0
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-[#ffffff] font-['Neutraface_2_Text:Bold',sans-serif] text-lg shadow-lg"
                  style={{ backgroundColor: step.color }}
                >
                  {index + 1}
                </motion.div>

                <h3 
                  className="text-2xl md:text-3xl font-['Neutraface_2_Text:Demi',sans-serif] mb-4"
                  style={{ color: step.color }}
                >
                  {step.title}
                </h3>
                
                <p className="text-[#484848] font-['Neutraface_2_Text:Book',sans-serif] leading-relaxed text-base md:text-lg">
                  {step.description}
                </p>

                {/* Active Indicator */}
                {currentIndex === index && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-1 rounded-full"
                    style={{ backgroundColor: step.color }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-3 mt-12">
            {methodologySteps.map((step, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="group relative"
              >
                <motion.div
                  animate={{
                    scale: currentIndex === index ? 1.3 : 1,
                    backgroundColor: currentIndex === index ? step.color : '#D1D5DB'
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-3 h-3 rounded-full cursor-pointer hover:scale-110 transition-transform"
                />
                {currentIndex === index && (
                  <motion.div
                    layoutId="activeRing"
                    className="absolute inset-0 -m-1 rounded-full border-2"
                    style={{ borderColor: step.color }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-xl md:text-2xl font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F] mb-8">
            DİNLE - KONUŞ - DÜZELT - TEKRAR ET
          </p>
          <p className="text-lg text-[#484848] max-w-3xl mx-auto font-['Neutraface_2_Text:Book',sans-serif] leading-relaxed mb-8">
            Bu döngü sayesinde kas hafızası gelişir; öğrendiğin dilde düşünerek otomatik konuşmaya başlarsın.
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#E51E25] text-[#ffffff] rounded-full font-['Neutraface_2_Text:Demi',sans-serif] shadow-lg hover:shadow-2xl hover:shadow-[#E51E25]/30 transition-all"
          >
            <span>Metodoloji Hakkında Daha Fazla</span>
            <motion.svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              <path
                d="M7.5 15L12.5 10L7.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
