import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import {
  COOKIE_CONSENT_KEY,
  notifyConsentUpdated,
  trackEvent,
  trackPageView,
  type CookiePreferences,
} from '../lib/analytics';
import { safeLocalStorageGet, safeLocalStorageSet } from '../lib/storage';

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
  personalization: true,
};

const rejectPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  personalization: false,
};

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const consent = safeLocalStorageGet(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2800);
      return () => clearTimeout(timer);
    }

    try {
      const parsed = JSON.parse(consent) as CookiePreferences;
      setPreferences({
        necessary: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
        personalization: Boolean(parsed.personalization),
      });
    } catch {
      // Ignore invalid stored values.
    }
  }, []);

  const saveConsent = (next: CookiePreferences, action: 'accept_all' | 'accept_selected' | 'reject_optional') => {
    safeLocalStorageSet(COOKIE_CONSENT_KEY, JSON.stringify(next));
    notifyConsentUpdated(next);
    trackEvent(
      'cookie_consent_updated',
      {
        action,
        analytics: next.analytics,
        marketing: next.marketing,
        personalization: next.personalization,
      },
      { requires: 'none' },
    );
    if (next.analytics) {
      trackPageView();
    }
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    const all: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    setPreferences(all);
    saveConsent(all, 'accept_all');
  };

  const handleAcceptSelected = () => {
    saveConsent(preferences, 'accept_selected');
  };

  const handleRejectOptional = () => {
    setPreferences(rejectPreferences);
    saveConsent(rejectPreferences, 'reject_optional');
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const cookieTypes = [
    {
      key: 'necessary' as const,
      label: 'Zorunlu Çerezler',
      desc: 'Sitenin düzgün çalışması için gereklidir. Devre dışı bırakılamaz.',
      locked: true,
    },
    {
      key: 'analytics' as const,
      label: 'Analitik Çerezler',
      desc: 'Ziyaretçi davranışlarını anonim olarak analiz ederek hizmet kalitemizi artırmamıza yardımcı olur.',
      locked: false,
    },
    {
      key: 'marketing' as const,
      label: 'Pazarlama Çerezleri',
      desc: 'Size özel kampanya ve reklamların gösterilmesini sağlar.',
      locked: false,
    },
    {
      key: 'personalization' as const,
      label: 'Kişiselleştirme Çerezleri',
      desc: 'Dil tercihi ve arayüz ayarlarınızı hatırlayarak deneyiminizi kişiselleştirir.',
      locked: false,
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop - only when details open on mobile */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] lg:hidden"
              onClick={() => setShowDetails(false)}
            />
          )}

          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[999] px-3 pb-3 md:px-6 md:pb-6"
          >
            <div className="max-w-[1440px] mx-auto">
              <div className="relative bg-[#00000B]/95 backdrop-blur-xl border border-[#324D47]/20 rounded-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.4)] overflow-hidden">
                
                {/* Subtle top accent */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#324D47]/40 to-transparent" />

                {/* Main bar */}
                <div className="p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    
                    {/* Icon */}
                    <div className="hidden md:flex shrink-0 w-10 h-10 rounded-xl bg-[#324D47]/10 border border-[#324D47]/20 items-center justify-center mt-0.5">
                      <Cookie size={18} className="text-[#324D47]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-[13px] md:text-[14px] text-white/80 font-['Neutraface_2_Text:Book',sans-serif] leading-relaxed">
                            <span className="md:hidden inline-flex items-center gap-1.5 mr-1.5">
                              <Cookie size={14} className="text-[#324D47] shrink-0" />
                            </span>
                            Size en iyi deneyimi sunabilmek için çerezleri kullanıyoruz.{' '}
                            <button
                              onClick={() => setShowDetails(!showDetails)}
                              className="inline-flex items-center gap-1 text-[#324D47] hover:text-[#4A7067] transition-colors font-['Neutraface_2_Text:Demi',sans-serif]"
                            >
                              Detaylar
                              {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Reject optional - subtle */}
                          <button
                            onClick={handleRejectOptional}
                            className="hidden md:block px-4 py-2.5 text-[12px] text-white/40 hover:text-white/70 font-['Neutraface_2_Text:Demi',sans-serif] tracking-wide transition-colors"
                          >
                            Reddet
                          </button>

                          {/* Accept All - PRIMARY, BIG, EASY */}
                          <button
                            onClick={handleAcceptAll}
                            className="px-5 md:px-7 py-2.5 md:py-3 bg-[#324D47] hover:bg-[#3d5e56] active:scale-[0.97] text-white text-[12px] md:text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-wider rounded-xl transition-all duration-200 shadow-lg shadow-[#324D47]/20 whitespace-nowrap"
                          >
                            Tamam
                          </button>

                          {/* Close button */}
                          <button
                            onClick={handleRejectOptional}
                            className="p-2 text-white/20 hover:text-white/50 transition-colors rounded-lg hover:bg-white/5"
                            aria-label="Kapat"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Panel */}
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pt-5 mt-5 border-t border-white/5">
                          
                          {/* Info notice */}
                          <div className="flex items-center gap-2 mb-5 px-1">
                            <Shield size={13} className="text-[#324D47] shrink-0" />
                            <p className="text-[11px] text-white/30 font-['Neutraface_2_Text:Book',sans-serif]">
                              Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz.{' '}
                              <a href="/hukuki/cerez-politikasi" className="text-[#324D47] hover:underline">Çerez Politikası</a>
                            </p>
                          </div>

                          {/* Cookie type toggles */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {cookieTypes.map((cookie) => (
                              <button
                                key={cookie.key}
                                onClick={() => togglePreference(cookie.key)}
                                disabled={cookie.locked}
                                className={`group text-left p-3.5 rounded-xl border transition-all duration-200 ${
                                  preferences[cookie.key]
                                    ? 'bg-[#324D47]/10 border-[#324D47]/30'
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                } ${cookie.locked ? 'cursor-default' : 'cursor-pointer'}`}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[12px] text-white/80 font-['Neutraface_2_Text:Demi',sans-serif] tracking-wide">
                                    {cookie.label}
                                  </span>
                                  
                                  {/* Toggle */}
                                  <div
                                    className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${
                                      preferences[cookie.key] ? 'bg-[#324D47]' : 'bg-white/10'
                                    } ${cookie.locked ? 'opacity-50' : ''}`}
                                  >
                                    <div
                                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                        preferences[cookie.key] ? 'translate-x-[18px]' : 'translate-x-0.5'
                                      }`}
                                    />
                                  </div>
                                </div>
                                <p className="text-[11px] text-white/30 font-['Neutraface_2_Text:Book',sans-serif] leading-relaxed pr-8">
                                  {cookie.desc}
                                </p>
                              </button>
                            ))}
                          </div>

                          {/* Detail actions */}
                          <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                            <button
                              onClick={handleRejectOptional}
                              className="md:hidden text-[11px] text-white/30 hover:text-white/60 font-['Neutraface_2_Text:Demi',sans-serif] tracking-wide transition-colors"
                            >
                              Sadece Zorunlu
                            </button>
                            <div className="flex items-center gap-3 ml-auto">
                              <button
                                onClick={handleAcceptSelected}
                                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-wider rounded-xl transition-all"
                              >
                                Seçilenleri Kaydet
                              </button>
                              <button
                                onClick={handleAcceptAll}
                                className="px-5 py-2.5 bg-[#324D47] hover:bg-[#3d5e56] text-white text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-wider rounded-xl transition-all shadow-lg shadow-[#324D47]/20"
                              >
                                Tümünü Kabul Et
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
