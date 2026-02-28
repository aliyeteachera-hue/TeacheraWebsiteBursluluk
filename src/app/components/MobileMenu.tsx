import { motion } from 'motion/react';
import { Instagram, Linkedin, Facebook, Youtube, ArrowRight, User, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import imgRectangle279 from "figma:asset/884befb1e78a75b64de1fe6d23317da411da15ba.webp";
import { useLevelAssessment } from './LevelAssessmentContext';

/* ── X (Twitter) Icon ── */
function XIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46L20 4" />
    </svg>
  );
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentSection: string;
}

interface MenuItem {
  id: string;
  label: string;
  href: string;
  highlight?: boolean;
  isRoute?: boolean;
}

const menuItems: MenuItem[] = [
  { id: 'home', label: 'Ana Sayfa', href: '/', isRoute: true },
  { id: 'about', label: 'Biz Kimiz', href: '/biz-kimiz', isRoute: true },
  { id: 'methodology', label: 'Metodoloji', href: '/metodoloji', isRoute: true },
  { id: 'prices', label: 'Fiyatlar', href: '/fiyatlar', isRoute: true },
  { id: 'programs', label: 'Eğitim Programları', href: '/egitimlerimiz', isRoute: true },
  { id: 'academy', label: 'Teachera Academy', href: '/academy', isRoute: true, highlight: true },
  { id: 'contact', label: 'İletişim', href: '/iletisim', isRoute: true },
];

const SOCIAL_LINKS = [
  { Icon: Instagram, href: 'https://www.instagram.com/teacheradilokulu/', label: 'Instagram' },
  { Icon: Linkedin, href: 'https://tr.linkedin.com/company/teachera-dil-okulu', label: 'LinkedIn' },
  { Icon: null, href: 'https://x.com/teacheradilokul', label: 'X', isX: true },
  { Icon: Facebook, href: 'https://www.facebook.com/teacheradilokulu/', label: 'Facebook' },
  { Icon: Youtube, href: 'https://www.youtube.com/@teacheradilokullari', label: 'YouTube' },
];

const LOGIN_URL = 'https://teachera.dlpro.eu/';

export default function MobileMenu({ isOpen, onClose, currentSection: _currentSection }: MobileMenuProps) {
  const navigate = useNavigate();
  const { open: openLevelAssessment } = useLevelAssessment();
  const disableMenuAnimations = true;
  
  const handleLinkClick = (item: MenuItem) => {
    if (item.isRoute) {
      const targetPath = item.href;
      const currentPath = window.location.pathname;

      navigate(targetPath);
      onClose();

      if (currentPath === targetPath) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Fallback for rare mobile navigation race conditions.
      window.setTimeout(() => {
        if (window.location.pathname !== targetPath) {
          window.location.assign(targetPath);
        }
      }, 350);
      return;
    }
    if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
            const element = document.getElementById(item.href.replace('#', ''));
            if (element) {
                const offset = 80;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    } else {
        const element = document.getElementById(item.href.replace('#', ''));
        if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
    onClose();
  };

  const handleLogin = () => {
    onClose();
    window.open(LOGIN_URL, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
        <div
          className="fixed inset-0 z-[55] h-[100svh] bg-[#00000B] overflow-x-hidden overflow-y-hidden overscroll-none"
        >
          {/* BACKGROUND IMAGE & OVERLAY */}
          <div className="absolute inset-0 z-0 pointer-events-none">
             <motion.img 
               initial={disableMenuAnimations ? false : { scale: 1.1, opacity: 0 }}
               animate={disableMenuAnimations ? { opacity: 0.2 } : { scale: 1, opacity: 0.2 }}
               transition={disableMenuAnimations ? { duration: 0.12 } : { duration: 1.5, ease: "easeOut" }}
               src={imgRectangle279} 
               alt="Background" 
               className="w-full h-full object-cover grayscale mix-blend-luminosity"
             />
             <div className="absolute inset-0 bg-gradient-to-r from-[#00000B] via-[#00000B]/95 to-[#00000B]/90" />
          </div>

          {/* CONTENT CONTAINER */}
          <div className="relative z-10 w-full h-full min-h-0 max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col pt-20 lg:pt-0">
            
            {/* Close Button - Always visible on top */}
            <motion.button
              initial={disableMenuAnimations ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="absolute top-4 right-6 lg:right-12 md:top-8 z-[60] w-12 h-12 flex items-center justify-center rounded-full bg-[#324D47] hover:bg-[#3d5e56] text-white shadow-[0_0_20px_rgba(50,77,71,0.4)] transition-all duration-300"
              aria-label="Close menu"
            >
              <X size={24} />
            </motion.button>

            <div className="flex flex-col lg:grid lg:grid-cols-12 h-full min-h-0 pb-6 lg:pt-32 lg:pb-24">
               
               {/* LEFT SIDE: INFO (Desktop Only) */}
               <div className="hidden lg:flex lg:col-span-4 flex-col justify-between h-full border-r border-[#ffffff]/10 pr-10 relative">
                  
                  {/* Decorative Line */}
                  <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-[#ffffff]/10 to-transparent" />

                  {/* Top: Branding */}
                  <div>
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 mb-8"
                     >
                        <span className="w-8 h-[1px] bg-[#E70000]" />
                        <span className="text-[#E70000] text-xs font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] uppercase">
                           Premium Language Education
                        </span>
                     </motion.div>
                     
                     <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-[2.6rem] xl:text-[3rem] font-['Neutraface_2_Text:Bold',sans-serif] text-white leading-[1.1]"
                     >
                        Dünyanın kapılarını<br/>
                        <span className="text-[#ffffff]/40">dil ile arala.</span>
                     </motion.h2>
                  </div>

                  {/* Bottom: Phone, Login, Social & Contact */}
                  <div className="space-y-6 mt-12">
                     {/* Desktop: Giris Yap */}
                     <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                        onClick={handleLogin}
                        className="flex items-center gap-3 px-6 py-3 bg-[#ffffff]/5 hover:bg-[#324D47] text-white border border-[#ffffff]/10 hover:border-[#324D47] rounded-full font-['Neutraface_2_Text:Demi',sans-serif] text-xs tracking-[0.15em] uppercase transition-all duration-300 group"
                     >
                        <User size={16} className="text-[#324D47] group-hover:text-white transition-colors" />
                        <span>Giriş Yap</span>
                     </motion.button>

                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-4"
                     >
                        {SOCIAL_LINKS.map((social, i) => (
                           <a
                             key={i}
                             href={social.href}
                             target="_blank"
                             rel="noopener noreferrer"
                             aria-label={social.label}
                             className="w-12 h-12 rounded-full border border-[#ffffff]/10 hover:border-[#324D47] hover:bg-[#324D47] flex items-center justify-center text-white/60 hover:text-white transition-all duration-300 group"
                           >
                              {social.isX ? (
                                <XIcon size={20} className="group-hover:scale-110 transition-transform" />
                              ) : social.Icon ? (
                                <social.Icon size={20} className="group-hover:scale-110 transition-transform" />
                              ) : null}
                           </a>
                        ))}
                     </motion.div>

                     <div className="text-[#ffffff]/50 text-sm font-['Neutraface_2_Text:Book',sans-serif] leading-relaxed tracking-wide">
                        <p className="mb-2">Kule Plaza Kat: 26, Selçuklu – KONYA</p>
                        <p>+90 332 236 80 66  &bull;  info@teachera.com.tr</p>
                     </div>
                  </div>
               </div>

               {/* RIGHT SIDE / MOBILE CONTENT */}
               <div className="lg:col-span-8 flex flex-col h-full min-h-0 lg:justify-start lg:pl-12 lg:pt-2 overflow-hidden">
                  
                  {/* Mobile Branding (Visible only on mobile) */}
                  <div className="lg:hidden mb-3">
                     <motion.p 
                       initial={disableMenuAnimations ? false : { opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={disableMenuAnimations ? { duration: 0 } : { delay: 0.2 }}
                       className="text-mobile-kicker text-[#E70000] opacity-58 font-['Neutraface_2_Text:Demi',sans-serif] uppercase mb-0.5"
                     >
                       Premium Education
                     </motion.p>
                     <motion.h3
                       initial={disableMenuAnimations ? false : { opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={disableMenuAnimations ? { duration: 0 } : { delay: 0.3 }}
                       className="text-[1.42rem] sm:text-[1.54rem] font-['Neutraface_2_Text:Bold',sans-serif] text-white/95 leading-[1.08] tracking-[-0.005em]"
                     >
                       Menü
                     </motion.h3>
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex flex-col justify-between gap-1.5 lg:gap-1.5 w-full min-w-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [scrollbar-gutter:stable] [touch-action:pan-y] [-webkit-overflow-scrolling:touch] pr-1">
                     {menuItems.map((item, index) => (
                        <motion.button
                           key={item.id}
                           initial={disableMenuAnimations ? false : { opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={disableMenuAnimations ? { duration: 0 } : { delay: 0.2 + (index * 0.05), ease: "easeOut" }}
                           onClick={() => handleLinkClick(item)}
                           className="group relative flex flex-1 lg:flex-none min-h-[56px] items-center justify-between py-2.5 lg:py-1.5 transition-all duration-500 min-w-0 text-left"
                        >
                           <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                              <span className={`
                                 text-mobile-meta lg:text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#ffffff]/35 w-5 lg:w-5 group-hover:text-[#324D47] transition-colors
                              `}>
                                 0{index + 1}
                              </span>
                              
                              <span className={`
                                 text-[1.3rem] sm:text-[1.4rem] lg:text-[1.42rem] xl:text-[1.58rem] font-['Neutraface_2_Text:Book',sans-serif] tracking-tight transition-all duration-300 text-left leading-[1.14] break-words min-w-0
                                 ${item.highlight ? 'text-[#E70000]' : 'text-[#ffffff]/80 group-hover:text-white group-hover:translate-x-2'}
                              `}>
                                 {item.label}
                              </span>
                           </div>

                           <div className={`
                              hidden lg:flex w-9 h-9 rounded-full border border-[#ffffff]/10 items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 group-hover:border-[#324D47]
                           `}>
                              <ArrowRight size={16} className="text-[#324D47]" />
                           </div>
                        </motion.button>
                     ))}
                  </nav>

                  {/* Mobile Footer & Actions */}
                  <div className="lg:hidden mt-2 border-t border-[#ffffff]/10 pt-3 shrink-0">
                     <motion.button
                        initial={disableMenuAnimations ? false : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={disableMenuAnimations ? { duration: 0 } : { delay: 0.5 }}
                        onClick={() => {
                          onClose();
                          openLevelAssessment('mobile_menu_level_assessment');
                        }}
                        className="text-mobile-kicker w-full min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 mb-2 bg-[#324D47] hover:bg-[#3d5e56] text-white border border-[#324D47] rounded-xl font-['Neutraface_2_Text:Demi',sans-serif] transition-all duration-300"
                     >
                        <span>SEVİYE TESPİT</span>
                     </motion.button>
                     <motion.button
                        initial={disableMenuAnimations ? false : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={disableMenuAnimations ? { duration: 0 } : { delay: 0.55 }}
                        onClick={handleLogin}
                        className="text-mobile-kicker w-full min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 mb-2 bg-[#ffffff]/5 hover:bg-[#324D47] text-white border border-[#ffffff]/10 rounded-xl font-['Neutraface_2_Text:Demi',sans-serif] transition-all duration-300 group"
                     >
                        <User size={16} className="text-[#324D47] group-hover:text-white transition-colors" />
                        <span>GİRİŞ YAP</span>
                     </motion.button>
                  </div>
               </div>
            </div>
          </div>
        </div>
  );
}
