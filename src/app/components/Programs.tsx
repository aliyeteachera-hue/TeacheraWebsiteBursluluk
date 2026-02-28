import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowUpRight, Globe, GraduationCap, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ALL_PROGRAMS } from './AllPrograms';

interface SubProgram {
  name: string;
  tags?: string[];
}

interface ProgramCategory {
  title: string;
  icon?: React.ReactNode;
  items?: string[];
  subPrograms?: SubProgram[];
}

export type LanguageId = 'en' | 'es' | 'it' | 'de' | 'fr' | 'ru' | 'ar';

interface Language {
  id: LanguageId;
  name: string;
  nativeName: string;
  image: string;
  accent: string;
  description: string;
  categories: ProgramCategory[];
}

export const languages: Language[] = [
  {
    id: 'en',
    name: 'İngilizce',
    nativeName: 'English',
    image: 'https://images.unsplash.com/photo-1701921188976-b5f80be1d019?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB2aW50YWdlJTIwQmlnJTIwQmVuJTIwTG9uZG9uJTIwbGFuZG1hcmslMjBkYXJrJTIwbW9vZHl8ZW58MXx8fHwxNzcyMDY2MTQ0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    accent: '#E70000',
    description: 'Küresel iletişimin anahtarı. Native speaker eğitmenlerle %85 konuşma pratiği.',
    categories: [
      { 
        title: 'Genel',
        icon: <Globe size={14} />,
        items: ['Grup', 'Online Grup', 'Özel Ders']
      },
      { 
        title: 'Akademik',
        icon: <GraduationCap size={14} />,
        items: ['IELTS', 'TOEFL', 'PTE', 'YDS/YÖKDİL']
      },
      { 
        title: 'İş Dünyası',
        icon: <Briefcase size={14} />,
        items: ['Business', 'Legal', 'Medical', 'Finance', 'Marketing']
      }
    ]
  },
  {
    id: 'es',
    name: 'İspanyolca',
    nativeName: 'Español',
    image: 'https://images.unsplash.com/photo-1579033631786-12b00de12740?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB2aW50YWdlJTIwU2FncmFkYSUyMEZhbWlsaWElMjBCYXJjZWxvbmElMjBsYW5kbWFyayUyMGRhcmslMjBtb29keXxlbnwxfHx8fDE3NzIwNjYxNDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    accent: '#FFC400',
    description: 'Tutkunun ve sanatın dili. Native speaker eğitmenlerle konuşarak öğrenin.',
    categories: [
      { 
        title: 'Genel',
        icon: <Globe size={14} />,
        items: ['Grup', 'Online Grup', 'Özel Ders']
      },
      { 
        title: 'Sınav',
        icon: <GraduationCap size={14} />,
        items: ['DELE', 'SIELE']
      }
    ]
  },
  {
    id: 'it',
    name: 'İtalyanca',
    nativeName: 'Italiano',
    image: 'https://images.unsplash.com/photo-1488904522966-31c76bc83279?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB2aW50YWdlJTIwQ29sb3NzZXVtJTIwUm9tZSUyMGxhbmRtYXJrJTIwZGFyayUyMG1vb2R5fGVufDF8fHx8MTc3MjA2NjE0NHww&ixlib=rb-4.1.0&q=80&w=1080',
    accent: '#008C45',
    description: 'Kültür, sanat ve tarih. Native speaker eğitmenlerle İtalyanca.',
    categories: [
      { 
        title: 'Genel',
        icon: <Globe size={14} />,
        items: ['Grup', 'Online Grup', 'Özel Ders']
      },
      { 
        title: 'Akademik',
        icon: <GraduationCap size={14} />,
        items: ['CILS', 'CELI']
      }
    ]
  },
  {
    id: 'de',
    name: 'Almanca',
    nativeName: 'Deutsch',
    image: 'https://images.unsplash.com/photo-1736170881350-149cfa422428?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB2aW50YWdlJTIwTmV1c2Nod2Fuc3RlaW4lMjBDYXN0bGUlMjBkYXJrJTIwbW9vZHklMjBmb2d8ZW58MXx8fHwxNzcyMDY2NzYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    accent: '#DD0000',
    description: 'Mühendislik ve felsefe. Teachera Teaching Method ile Almanca.',
    categories: [
      { 
        title: 'Genel',
        icon: <Globe size={14} />,
        items: ['Grup', 'Online Grup', 'Özel Ders']
      },
      { 
        title: 'Sınav',
        icon: <GraduationCap size={14} />,
        items: ['Goethe', 'TestDaF', 'Telc']
      }
    ]
  },
  {
    id: 'fr',
    name: 'Fransızca',
    nativeName: 'Français',
    image: 'https://images.unsplash.com/photo-1707290667355-49b2e6b8f956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB2aW50YWdlJTIwRWlmZmVsJTIwVG93ZXIlMjBQYXJpcyUyMGxhbmRtYXJrJTIwZGFyayUyMG1vb2R5fGVufDF8fHx8MTc3MjA2NjE0NHww&ixlib=rb-4.1.0&q=80&w=1080',
    accent: '#0055A4',
    description: 'Diplomasi ve estetik. Grup ve özel ders seçenekleri.',
    categories: [
      { 
        title: 'Genel',
        icon: <Globe size={14} />,
        items: ['Grup', 'Online Grup', 'Özel Ders']
      },
      { 
        title: 'Akademik',
        icon: <GraduationCap size={14} />,
        items: ['DELF', 'DALF', 'TCF']
      },
      {
        title: 'Kariyer',
        icon: <Briefcase size={14} />,
        items: ['Hukuki Fransızca']
      }
    ]
  },
  {
    id: 'ru',
    name: 'Rusça',
    nativeName: 'Русский',
    image: 'https://images.unsplash.com/photo-1552065769-8079333a8c8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB2aW50YWdlJTIwS3JlbWxpbiUyME1vc2NvdyUyMGRhcmslMjBtb29keXxlbnwxfHx8fDE3NzIwNjY3NjB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    accent: '#D52B1E',
    description: 'Edebiyatın ve gücün dili. Grup ve özel ders seçenekleri.',
    categories: [
      { 
        title: 'Genel',
        icon: <Globe size={14} />,
        items: ['Grup', 'Online Grup', 'Özel Ders']
      },
      { 
        title: 'Sınav',
        icon: <Briefcase size={14} />,
        items: ['TORFL']
      }
    ]
  },
  {
    id: 'ar',
    name: 'Arapça',
    nativeName: 'العربية',
    image: 'https://images.unsplash.com/photo-1653843740613-ab6843cbe393?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjB2aW50YWdlJTIwU2hlaWtoJTIwWmF5ZWQlMjBNb3NxdWUlMjBkYXJrJTIwbW9vZHl8ZW58MXx8fHwxNzcyMDY2NzYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    accent: '#006C35',
    description: 'Medeniyetin dili. Native speaker eğitmenle birebir özel ders.',
    categories: [
      { 
        title: 'Genel',
        icon: <Globe size={14} />,
        items: ['Grup', 'Online Grup', 'Özel Ders']
      }
    ]
  }
];

export const LANGUAGE_GROUP_PROGRAM_SLUGS: Record<LanguageId, string> = {
  en: 'ingilizce/grup-programi',
  es: 'ispanyolca/grup-programi',
  it: 'italyanca/grup-programi',
  de: 'almanca/grup-programi',
  fr: 'fransizca/grup-programi',
  ru: 'rusca/grup-programi',
  ar: 'arapca/grup-programi',
};

export default function Programs() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string>('en'); // Default expanded on desktop
  const [mobileIndex, setMobileIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic counts
  const totalPrograms = ALL_PROGRAMS.length;
  const uniqueLanguages = new Set(ALL_PROGRAMS.map(p => p.language)).size;

  // Track mobile scroll to update indicators
  const handleScroll = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const scrollPosition = container.scrollLeft;
      const cardWidth = container.offsetWidth * 0.85;
      const newIndex = Math.round(scrollPosition / cardWidth);
      setMobileIndex(Math.min(newIndex, languages.length - 1));
    }
  };

  const active = languages.find(l => l.id === activeId) || languages[0];

  return (
    <section id="programs" className="relative py-24 bg-[#00000B] overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(50,77,71,0.08),transparent_70%)]" />
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[1px] bg-[#E70000]" />
            <span className="text-[#E70000] text-xs font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] uppercase">
              {uniqueLanguages} Dil · {totalPrograms} Program
            </span>
            <span className="w-8 h-[1px] bg-[#E70000]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-['Neutraface_2_Text:Bold',sans-serif] text-white mb-4">
            Eğitim Programları
          </h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="hidden md:flex items-center gap-2 text-[rgba(255,255,255,0.4)] text-sm font-['Neutraface_2_Text:Book',sans-serif]"
          >
            <span>Program detayları için kartların üzerine gelin</span>
            <ArrowUpRight size={16} />
          </motion.div>
        </motion.div>

        {/* === DESKTOP: Interactive grid === */}
        <div className="hidden md:flex gap-2 lg:gap-3 h-[480px] lg:h-[500px]">
          {languages.map((lang) => {
            const isActive = lang.id === activeId;
            return (
              <motion.div
                key={lang.id}
                className="relative rounded-2xl overflow-hidden cursor-pointer"
                animate={{ flex: isActive ? 4 : 1 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                onMouseEnter={() => setActiveId(lang.id)}
              >
                {/* Image */}
                <ImageWithFallback
                  src={lang.image}
                  alt={lang.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.9)] via-[rgba(0,0,0,0.5)] to-[rgba(0,0,0,0.08)]" />

                {/* Collapsed state */}
                {!isActive && (
                  <div className="absolute inset-0 flex items-end p-3 lg:p-6">
                    <div className="flex h-[70%] min-w-0 items-end gap-1.5 lg:gap-2">
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full lg:h-2 lg:w-2" style={{ backgroundColor: lang.accent }} />
                      <span className="max-h-full overflow-hidden text-white text-[10px] leading-none lg:text-xs font-['Neutraface_2_Text:Demi',sans-serif] [writing-mode:vertical-lr] rotate-180 whitespace-nowrap">
                        {lang.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Expanded state */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="absolute inset-0 flex flex-col justify-end p-8"
                    >
                      {/* Language badge */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.accent }} />
                        <span className="text-white/70 text-sm font-['Neutraface_2_Text:Book',sans-serif] drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]">{lang.nativeName}</span>
                      </div>

                      <h3 className="text-3xl font-['Neutraface_2_Text:Bold',sans-serif] text-white mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{lang.name}</h3>
                      <p className="text-white/75 text-sm font-['Neutraface_2_Text:Book',sans-serif] mb-6 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">{lang.description}</p>

                      {/* Categories */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        {lang.categories.map((cat, ci) => (
                          <div key={ci} className="bg-[rgba(255,255,255,0.1)] backdrop-blur-sm rounded-xl px-4 py-3 border border-[rgba(255,255,255,0.08)]">
                            <div className="flex items-center gap-2 mb-2 text-white/90 text-xs font-['Neutraface_2_Text:Demi',sans-serif]">
                              {cat.icon}
                              <span>{cat.title}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {cat.items?.map((item, i) => (
                                <span key={i} className="text-[11px] text-[rgba(255,255,255,0.75)] bg-[rgba(0,0,0,0.3)] px-2 py-0.5 rounded-md">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => navigate(`/egitimlerimiz/${LANGUAGE_GROUP_PROGRAM_SLUGS[lang.id]}`)}
                        className="group flex items-center gap-3 px-8 py-4 bg-[rgba(255,255,255,1)] text-[rgba(0,0,0,1)] rounded-full font-['Neutraface_2_Text:Bold',sans-serif] hover:bg-[#f0f0f0] transition-all"
                      >
                        <span>Programı Keşfet</span>
                        <div className="w-6 h-6 rounded-full bg-[rgba(0,0,0,1)] text-[rgba(255,255,255,1)] flex items-center justify-center group-hover:rotate-45 transition-transform">
                          <ArrowUpRight size={12} />
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* === MOBILE: Horizontal scroll cards === */}
        <div className="md:hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 no-scrollbar"
          >
            {languages.map((lang) => (
              <motion.div
                key={lang.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative min-w-[85vw] h-[470px] rounded-2xl overflow-hidden snap-center flex-shrink-0"
              >
                <ImageWithFallback src={lang.image} alt={lang.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.88)] via-[rgba(0,0,0,0.48)] to-[rgba(0,0,0,0.06)]" />

                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.accent }} />
                    <span className="text-white/70 text-xs font-['Neutraface_2_Text:Book',sans-serif] drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]">{lang.nativeName}</span>
                  </div>

                  <h3 className="text-2xl font-['Neutraface_2_Text:Bold',sans-serif] text-white mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]">{lang.name}</h3>
                  <p className="text-white/75 text-xs font-['Neutraface_2_Text:Book',sans-serif] mb-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]">{lang.description}</p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {lang.categories.map((cat, ci) => (
                      <div key={ci} className="bg-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 border border-[rgba(255,255,255,0.08)]">
                        <span className="text-white/85 text-[10px] font-['Neutraface_2_Text:Demi',sans-serif]">{cat.title}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cat.items?.map((item, i) => (
                            <span key={i} className="text-[9px] text-white/70 bg-[rgba(0,0,0,0.34)] px-1.5 py-0.5 rounded">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate(`/egitimlerimiz/${LANGUAGE_GROUP_PROGRAM_SLUGS[lang.id]}`)}
                    className="group flex items-center gap-2 self-start px-6 py-3 bg-white text-black rounded-full text-sm font-['Neutraface_2_Text:Bold',sans-serif]"
                  >
                    <span>Keşfet</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {languages.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === mobileIndex ? 'w-6 bg-[#E70000]' : 'w-1.5 bg-[rgba(255,255,255,0.2)]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
