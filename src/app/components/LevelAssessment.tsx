import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, Send, User, Phone, Mail, Calendar, Globe, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLevelAssessment } from './LevelAssessmentContext';
import { ageRanges, getLanguagesForAge } from './ageLanguageMap';
import imgBg from "figma:asset/fc31d891571779da1d514055d08ebb51d4ccb03e.webp";
import { openMailDraft } from './formMailto';
import { isValidTrMobilePhone, normalizeTrMobileInput, TR_MOBILE_PATTERN, TR_MOBILE_TITLE } from './phoneUtils';
import { savePlacementExamLead } from './exam/placementExamSession';
import { notifyError, notifySuccess } from '../lib/notifications';
import { useOverlayLifecycle } from '../lib/overlayLifecycle';
import { useCoarsePointer } from '../lib/useCoarsePointer';

const LEGAL_KVKK_URL = '/hukuki/musteri-aydinlatma-metni';

/* ─── DATA ──────────────────────────────────────────────────────────────── */
const inputBase =
  "w-full h-[44px] bg-white rounded-[30px] px-5 text-[14px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#00000B] placeholder:text-[#686767] outline-none border border-black/5 focus:border-[#324D47]/50 focus:ring-2 focus:ring-[#324D47]/15 transition-all";

const inputDisabled =
  "w-full h-[44px] bg-white/40 rounded-[30px] px-5 text-[14px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#686767] outline-none border border-black/5 cursor-not-allowed transition-all";

/* ─── MODAL ─────────────────────────────────────────────────────────────── */
export default function LevelAssessmentModal() {
  const { isOpen, close } = useLevelAssessment();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', age: '', language: '',
  });
  const [langOpen, setLangOpen] = useState(false);
  const [ageOpen, setAgeOpen] = useState(false);
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [contactConsent, setContactConsent] = useState(false);

  // Click-outside for dropdowns
  const ageRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const isCoarsePointer = useCoarsePointer();
  useOverlayLifecycle(isOpen, 'level-assessment');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ageRef.current && !ageRef.current.contains(e.target as Node)) setAgeOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setFormData({ fullName: '', phone: '', email: '', age: '', language: '' });
        setKvkkConsent(false);
        setContactConsent(false);
        setLangOpen(false);
        setAgeOpen(false);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kvkkConsent || !formData.age || !formData.language || !isPhoneValid) return;

    const sent = await openMailDraft({
      subject: 'Seviye Tespit Talebi',
      lines: [
        `Ad Soyad: ${formData.fullName || '-'}`,
        `Telefon: +90 ${formData.phone || '-'}`,
        `E-posta: ${formData.email || '-'}`,
        `Yas Araligi: ${formData.age || '-'}`,
        `Dil: ${getLanguagesForAge(formData.age).find((language) => language.id === formData.language)?.name || formData.language}`,
        `Iletisim Izni: ${contactConsent ? 'Evet' : 'Hayir'}`,
      ],
    });

    if (!sent) {
      notifyError('Talebiniz gönderilemedi. Lütfen tekrar deneyin.');
      return;
    }

    notifySuccess('Bilgileriniz alındı. Sınava yönlendiriliyorsunuz.');
    savePlacementExamLead({
      fullName: formData.fullName,
      phone: `+90 ${formData.phone}`,
      email: formData.email,
      age: formData.age,
      language: formData.language,
      source: 'level_assessment_modal',
    });

    close();
    navigate(`/seviye-tespit-sinavi?age=${encodeURIComponent(formData.age)}&lang=${encodeURIComponent(formData.language)}`);
  };

  /* Yaş değişince dili sıfırla (yeni yaşta mevcut dil yoksa) */
  const handleAgeChange = (age: string) => {
    const langs = getLanguagesForAge(age);
    const currentLangStillValid = langs.some((l) => l.id === formData.language);
    setFormData({
      ...formData,
      age,
      language: currentLangStillValid ? formData.language : '',
    });
    setAgeOpen(false);
  };

  const availableLanguages = getLanguagesForAge(formData.age);
  const selectedLang = availableLanguages.find((l) => l.id === formData.language);
  const isPhoneValid = isValidTrMobilePhone(formData.phone);

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: normalizeTrMobileInput(value) });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0 }}
          className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-[#00000B]"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          {/* Background */}
          <div className="fixed inset-0 pointer-events-none">
            <img src={imgBg} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,11,0.5)] via-[rgba(50,77,71,0.35)] to-[rgba(0,0,11,0.65)]" />
            <div className="absolute inset-0 bg-[#00000B]/18" />
          </div>

          {/* Close */}
          <motion.button
            initial={isCoarsePointer ? false : { opacity: 0, scale: 0.8 }}
            animate={isCoarsePointer ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            onClick={close}
            className="fixed top-4 right-4 md:top-8 md:right-8 z-[95] w-12 h-12 flex items-center justify-center rounded-full bg-[#324D47] hover:bg-[#3d5e56] text-white shadow-[0_0_20px_rgba(50,77,71,0.4)] transition-all duration-300"
            aria-label="Kapat"
          >
            <X size={22} />
          </motion.button>

          {/* Card */}
          <motion.div
            initial={isCoarsePointer ? false : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={isCoarsePointer ? { opacity: 0, y: 16 } : { opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: isCoarsePointer ? 0.28 : 0.45, ease: [0.25, 1, 0.5, 1] }}
            className="relative z-[91] w-full max-w-[580px] mx-4 my-12 md:my-20"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={isCoarsePointer ? false : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={isCoarsePointer ? { opacity: 0, y: 8 } : { opacity: 0, scale: 0.97 }}
                transition={{ duration: isCoarsePointer ? 0.24 : 0.35 }}
                className="relative bg-[rgba(50,77,71,0.55)] backdrop-blur-none md:backdrop-blur-xl rounded-[30px] border border-white/20 shadow-2xl shadow-black/20 overflow-hidden"
              >
                  {/* Glass shine */}
                  <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

                  <div className="relative z-10 p-7 md:p-10">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-8">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-[1px] bg-white/40" />
                        <span className="text-mobile-kicker md:text-[10px] text-white/70 font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.12em] md:tracking-[0.25em] uppercase">
                          Ücretsiz Değerlendirme
                        </span>
                        <div className="w-6 h-[1px] bg-white/40" />
                      </div>
                      <h2 className="font-['Neutraface_2_Text:Demi',sans-serif] text-[26px] md:text-[32px] text-white leading-tight mb-2">
                        Sınava Başla
                      </h2>
                      <p className="font-['Neutraface_2_Text:Book',sans-serif] text-mobile-meta md:text-[14px] text-white/70 max-w-[420px] leading-relaxed">
                        Mevcut dil seviyenizi belirleyelim ve size özel bir eğitim planı oluşturalım.
                      </p>
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* Ad Soyad */}
                      <FieldWrap icon={<User size={14} />} label="Adınız Soyadınız">
                        <input
                          type="text"
                          required
                          placeholder="Adınız Soyadınız"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className={inputBase}
                        />
                      </FieldWrap>

                      {/* Telefon */}
                      <FieldWrap icon={<Phone size={14} />} label="Telefon Numaranız">
                        <div className="flex gap-2">
                          <div className="bg-white h-[44px] rounded-[30px] px-3.5 flex items-center gap-1.5 border border-black/5 shrink-0">
                            <div className="w-[14px] h-[10px] rounded-[2px] overflow-hidden relative bg-[#E92434] flex items-center justify-center">
                              <div className="w-[3px] h-[3px] rounded-full border border-white" />
                            </div>
                            <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] text-[#302d2d]">+90</span>
                            <ChevronDown size={12} className="text-[#292D32]" />
                          </div>
                          <input
                            type="tel"
                            required
                            placeholder="5XX XXX XX XX"
                            value={formData.phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            inputMode="numeric"
                            maxLength={13}
                            pattern={TR_MOBILE_PATTERN}
                            title={TR_MOBILE_TITLE}
                            className={`${inputBase} flex-1`}
                          />
                        </div>
                      </FieldWrap>

                      {/* E-posta */}
                      <FieldWrap icon={<Mail size={14} />} label="E-posta Adresiniz">
                        <input
                          type="email"
                          placeholder="ornek@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={inputBase}
                        />
                      </FieldWrap>

                      {/* Row: Yaş + Dil */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Yaş */}
                        <FieldWrap icon={<Calendar size={14} />} label="Yaş Aralığınız">
                          <div className="relative" ref={ageRef}>
                            <button
                              type="button"
                              onClick={() => { setAgeOpen(!ageOpen); setLangOpen(false); }}
                              className={`${inputBase} text-left flex items-center justify-between cursor-pointer`}
                            >
                              <span className={formData.age ? 'text-[#00000B]' : 'text-[#686767]'}>
                                {formData.age ? `${formData.age} yaş` : 'Seçiniz'}
                              </span>
                              <ChevronDown size={15} className={`text-[#686767] transition-transform duration-200 ${ageOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {ageOpen && (
                                <DropdownList
                                  items={ageRanges.map((a) => ({ id: a, label: `${a} yaş` }))}
                                  selected={formData.age}
                                  onSelect={handleAgeChange}
                                />
                              )}
                            </AnimatePresence>
                          </div>
                        </FieldWrap>

                        {/* Dil */}
                        <FieldWrap icon={<Globe size={14} />} label="Dil Seçimi">
                          <div className="relative" ref={langRef}>
                            {formData.age ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => { setLangOpen(!langOpen); setAgeOpen(false); }}
                                  className={`${inputBase} text-left flex items-center justify-between cursor-pointer`}
                                >
                                  <span className={formData.language ? 'text-[#00000B]' : 'text-[#686767]'}>
                                    {selectedLang ? selectedLang.name : 'Seçiniz'}
                                  </span>
                                  <ChevronDown size={15} className={`text-[#686767] transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                  {langOpen && (
                                    <DropdownList
                                      items={availableLanguages.map((l) => ({ id: l.id, label: l.name }))}
                                      selected={formData.language}
                                      onSelect={(v) => { setFormData({ ...formData, language: v }); setLangOpen(false); }}
                                    />
                                  )}
                                </AnimatePresence>
                              </>
                            ) : (
                              <div className={inputDisabled}>
                                <span className="flex items-center h-full text-[#686767]">Önce yaş seçiniz</span>
                              </div>
                            )}
                          </div>
                        </FieldWrap>
                      </div>

                      {/* Consent */}
                      <div className="flex flex-col gap-3 mt-1">
                        <ConsentRow checked={kvkkConsent} onChange={setKvkkConsent}>
                          <a
                            href={LEGAL_KVKK_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-['Neutraface_2_Text:Demi',sans-serif] underline decoration-[10%] cursor-pointer hover:text-[#F4EBD1] transition-colors"
                          >
                            KVKK Aydınlatma Metni
                          </a>'ni okudum ve kabul ediyorum.
                        </ConsentRow>
                        <ConsentRow checked={contactConsent} onChange={setContactConsent}>
                          Seviye tespit sonuçlarım hakkında tarafımla iletişime geçilmesine izin veriyorum.
                        </ConsentRow>
                      </div>

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!kvkkConsent || !isPhoneValid}
                        className={`w-full h-[48px] rounded-[30px] flex items-center justify-center gap-2.5 transition-colors duration-300 mt-1 ${
                          kvkkConsent && isPhoneValid
                            ? 'bg-[#00000B] hover:bg-[#68232E] cursor-pointer'
                            : 'bg-[#00000B]/40 cursor-not-allowed'
                        }`}
                      >
                        <Send size={15} className="text-white" />
                        <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] text-white tracking-wide">
                          Sınava Başla
                        </span>
                      </motion.button>

                      {/* Footer note */}
                      <p className="text-center font-['Neutraface_2_Text:Book',sans-serif] text-mobile-kicker md:text-[11px] text-white/40 leading-relaxed">
                        Bilgileriniz KVKK kapsamında korunmaktadır.
                      </p>
                    </div>
                  </div>
                </motion.form>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── FIELD WRAPPER ─────────────────────────────────────────────────────── */
function FieldWrap({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-1.5 font-['Neutraface_2_Text:Book',sans-serif] text-[14px] text-white">
        <span className="text-white/60">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ���── CONSENT ROW ───────────────────────────────────────────────────────── */
function ConsentRow({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-start gap-2.5 text-left group">
      <div
        className={`w-4 h-4 mt-[2px] rounded-[3px] border flex items-center justify-center transition-all duration-200 shrink-0 ${
          checked ? 'bg-[#E70000] border-[#E70000]' : 'bg-white border-[#64748b] group-hover:border-white'
        }`}
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
      <span className="font-['Neutraface_2_Text:Book',sans-serif] text-mobile-meta md:text-[13px] text-white/80 leading-relaxed">
        {children}
      </span>
    </button>
  );
}

/* ─── DROPDOWN LIST ─────────────────────────────────────────────────────── */
function DropdownList({ items, selected, onSelect }: { items: { id: string; label: string }[]; selected: string; onSelect: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-[18px] shadow-xl shadow-black/20 border border-black/5 overflow-hidden z-30 max-h-[210px] overflow-y-auto"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`w-full px-5 py-2.5 text-left text-mobile-meta md:text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] transition-colors flex items-center justify-between ${
            selected === item.id
              ? 'bg-[#324D47]/10 text-[#324D47]'
              : 'text-[#00000B] hover:bg-[#F4EBD1]/50'
          }`}
        >
          <span>{item.label}</span>
          {selected === item.id && <Check size={13} className="text-[#324D47]" />}
        </button>
      ))}
    </motion.div>
  );
}
