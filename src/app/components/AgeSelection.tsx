import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, Brain, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import imgKids from "figma:asset/54ddc57446b9fc320bc6d857591548a258173cc6.webp";
import imgTeens from "figma:asset/d094d8fcdacc4a6a15cd69392d258f9aa4f4b9f9.webp";
import imgAdults from "figma:asset/383d9acb74488e60f1eacb17519ee5d526ce5f8d.webp";

interface AgeGroup {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  closedDesc: string;
  image: string;
  icon: React.ElementType;
  accent: string;
}

const ageGroups: AgeGroup[] = [
  {
    id: 'kids',
    title: 'ÇOCUK & JUNIOR',
    subtitle: '7–12 YAŞ',
    closedDesc: '"Oyun gibi başlar, refleks gibi kalır."',
    desc: 'Çocuklarda dil, en hızlı kulaktan girer. Biz de dersi "anlatım"a boğmadan; bol tekrar, bol konuşma ve pozitif düzeltmeyle ilerletiriz. Sıkılmak yok, keşfetmek var.',
    image: imgKids,
    icon: Sparkles,
    accent: '#E70000',
  },
  {
    id: 'teens',
    title: 'GENÇ & TEEN',
    subtitle: '13–17 YAŞ',
    closedDesc: '"Biliyor ama konuşamıyor çağı."',
    desc: 'Bu yaşta sorun genelde "bilgi" değil; çekinme ve refleks eksikliği. Teachera\'da yüksek tempo ve interaktif soru ritmiyle, dili düşünmeden kullanmaya zorluyoruz (nazikçe 😄).',
    image: imgTeens,
    icon: Brain,
    accent: '#324D47',
  },
  {
    id: 'adults',
    title: 'YETİŞKİN & PRO',
    subtitle: '18+ YAŞ',
    closedDesc: '"Hedef varsa, sistem şart."',
    desc: 'İş, kariyer, taşınma, seyahat… Hedef ne olursa olsun biz "plan"ı netleştiririz: hangi seviyedesin, hangi ritimde ilerleyeceksin, hangi format sana uygun? Sonuç odaklı strateji.',
    image: imgAdults,
    icon: Briefcase,
    accent: '#E70000',
  },
];

const AGE_TO_FINDER_MAP: Record<string, string> = {
  kids: 'child',
  teens: 'teen',
  adults: 'adult',
};

export default function AgeSelection() {
  const [activeId, setActiveId] = useState<string>('adults');
  const navigate = useNavigate();

  const handleNavigateToFinder = (groupId: string) => {
    const finderAge = AGE_TO_FINDER_MAP[groupId] || 'adult';
    navigate(`/egitimlerimiz?age=${finderAge}`);
  };

  return (
    <section className="relative py-24 md:py-32 bg-[#00000B] overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#E70000] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.03]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#324D47] rounded-full mix-blend-screen filter blur-[150px] opacity-[0.03]" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif] tracking-[0.2em] text-xs uppercase mb-4 block"
          >
            Sizin İçin En Doğru Ritim
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-['Neutraface_2_Text:Bold',sans-serif] text-[#ffffff] mb-6 leading-tight"
          >
            Yaşını seç. Sana uygun dili,<br/>
            <span className="text-[#ffffff]/40">formatı ve ritmi gösterelim.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#ffffff]/60 font-['Neutraface_2_Text:Book',sans-serif] text-lg max-w-2xl mx-auto"
          >
            Yaş grubu sadece bir sayı değil; öğrenme refleksinin karakteridir.
            Size uygun frekansı seçin.
          </motion.p>
        </div>

        {/* Selection Cards */}
        <div className="relative flex flex-col lg:flex-row gap-4 h-auto lg:h-[600px] w-full">
          {ageGroups.map((group) => {
            const isActive = activeId === group.id;
            const Icon = group.icon;

            return (
              <motion.div
                key={group.id}
                layout
                onClick={() => setActiveId(group.id)}
                className={`
                  relative group cursor-pointer overflow-hidden rounded-[2rem] border border-[#ffffff]/10
                  transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                  ${isActive ? 'lg:flex-[3] h-[500px] lg:h-auto' : 'lg:flex-[1] h-[120px] lg:h-auto'}
                `}
              >
                {/* Background Image */}
                <div className="absolute inset-0 w-full h-full">
                  <ImageWithFallback
                    src={group.image}
                    alt={group.title}
                    className={`
                      w-full h-full object-cover transition-transform duration-1000 ease-out
                      ${isActive ? 'scale-100 grayscale-0' : 'scale-110 grayscale-[100%] opacity-40 group-hover:scale-105 group-hover:opacity-60'}
                    `}
                  />
                  {/* Gradient Overlay */}
                  <div 
                    className={`
                      absolute inset-0 transition-opacity duration-500
                      ${isActive ? 'bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent opacity-90' : 'bg-[#00000B]/80 group-hover:bg-[#00000B]/60'}
                    `}
                  />
                </div>

                {/* Content Container */}
                <div className="relative z-10 h-full p-6 md:p-8 lg:p-10 flex flex-col justify-end">
                  
                  {/* Icon & Title (Always Visible but transforms) */}
                  <div className={`transition-all duration-500 ${isActive ? 'mb-auto' : 'flex items-center gap-4 lg:block lg:mb-0'}`}>
                    <div 
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center mb-0 lg:mb-4 transition-all duration-500
                        ${isActive ? 'bg-[#ffffff]/10 text-[#ffffff]' : 'bg-[#ffffff]/5 text-[#ffffff]/60'}
                      `}
                      style={isActive ? { backgroundColor: group.accent } : {}}
                    >
                      <Icon size={24} />
                    </div>
                    
                    <div>
                      <h3 className={`font-['Neutraface_2_Text:Bold',sans-serif] text-[#ffffff] leading-none transition-all duration-500 ${isActive ? 'text-3xl md:text-5xl mb-2' : 'text-xl lg:text-2xl lg:mb-2'}`}>
                        {group.title}
                      </h3>
                      <p className={`font-['Neutraface_2_Text:Demi',sans-serif] tracking-widest text-[#ffffff]/60 text-xs md:text-sm uppercase transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                        {group.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence mode="wait">
                    {isActive ? (
                      <motion.div
                        key="expanded"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                      >
                         {/* Decorative Line */}
                        <div className="w-16 h-1 rounded-full mb-6" style={{ backgroundColor: group.accent }} />

                        <p className="text-lg md:text-xl text-[#ffffff]/90 font-['Neutraface_2_Text:Book',sans-serif] leading-relaxed max-w-2xl mb-8">
                          {group.desc}
                        </p>

                        <button className="group/btn inline-flex items-center gap-3 px-8 py-4 bg-[#ffffff] text-[#00000B] rounded-full font-['Neutraface_2_Text:Bold',sans-serif] hover:bg-[#f0f0f0] transition-all" onClick={(e) => { e.stopPropagation(); handleNavigateToFinder(group.id); }}>
                          <span>Uygun Programları Gör</span>
                          <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="collapsed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="hidden lg:block mt-4"
                      >
                         <p className="text-[#ffffff]/50 font-['Neutraface_2_Text:Book',sans-serif] italic text-sm border-l-2 pl-4 border-[#ffffff]/20">
                            {group.closedDesc}
                         </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Mobile Collapsed Hint */}
                   {!isActive && (
                      <div className="lg:hidden ml-auto text-[#ffffff]/40">
                         <ArrowRight size={20} />
                      </div>
                   )}

                </div>

                {/* Vertical Text for Collapsed Desktop State */}
                {!isActive && (
                   <div className="hidden lg:flex absolute right-0 top-0 bottom-0 w-16 items-center justify-center">
                      <div className="rotate-90 text-[#ffffff]/20 text-xs font-['Neutraface_2_Text:Bold',sans-serif] tracking-[0.2em] uppercase whitespace-nowrap">
                         Detayları Görmek İçin Tıklayın
                      </div>
                   </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}