import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, X, Coffee, Send, Check, Info,
  User, Phone, Mail, Globe, CalendarDays, Clock,
  ChevronDown, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import imgSocratesBook from "figma:asset/a19966e147653c1fee9a9f7ba65cb5ae8ce7ae7f.webp";
import imgSocrates2 from "figma:asset/d0efa1d17e60c4d8b427e8eb1d1c0847176f4733.webp";
import imgBg from "figma:asset/fc31d891571779da1d514055d08ebb51d4ccb03e.webp";
import { openMailDraft } from './formMailto';
import { isValidTrMobilePhone, normalizeTrMobileInput, TR_MOBILE_PATTERN, TR_MOBILE_TITLE } from './phoneUtils';
import { useLiteMode } from '../lib/useLiteMode';
import { notifyError, notifySuccess } from '../lib/notifications';

const LEGAL_KVKK_URL = '/hukuki/musteri-aydinlatma-metni';

/* ═══════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */
const LANGUAGES = [
  { id: 'en', name: 'İngilizce' },
  { id: 'es', name: 'İspanyolca' },
  { id: 'de', name: 'Almanca' },
  { id: 'fr', name: 'Fransızca' },
  { id: 'it', name: 'İtalyanca' },
  { id: 'ru', name: 'Rusça' },
];

const timeSlots = [
  { id: '09-12', label: '09:00 – 12:00', icon: '🌅' },
  { id: '12-15', label: '12:00 – 15:00', icon: '☀️' },
  { id: '15-18', label: '15:00 – 18:00', icon: '🌤️' },
  { id: '18-21', label: '18:00 – 21:00', icon: '🌙' },
];

const turkishMonths = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];
const turkishDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const inputBase =
  "w-full h-[44px] bg-white rounded-[30px] px-5 text-[14px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#00000B] placeholder:text-[#686767] outline-none border border-black/5 focus:border-[#324D47]/50 focus:ring-2 focus:ring-[#324D47]/15 transition-all";

/* ═══════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */
function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startIdx = firstDay === 0 ? 6 : firstDay - 1;
  return { daysInMonth, startIdx };
}

function formatDate(d: Date) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isSunday(year: number, month: number, day: number) {
  return new Date(year, month, day).getDay() === 0;
}

/* ═══════════════════════════════════════════════════════════════════════
   APPOINTMENT MODAL  (FreeTrialModal ile aynı tasarım dili)
   ═══════════════════════════════════════════════════════════════════════ */
function AppointmentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', language: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [kvkkConsent, setKvkkConsent] = useState(false);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const langRef = useRef<HTMLDivElement>(null);

  const selectedLang = LANGUAGES.find((l) => l.id === formData.language);
  const isPhoneValid = isValidTrMobilePhone(formData.phone);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setFormData({ fullName: '', phone: '', email: '', language: '' });
        setSelectedDate(null);
        setSelectedTime('');
        setKvkkConsent(false);
        setSubmitted(false);
        setLangOpen(false);
        setCalendarOpen(false);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  /* Phone mask: auto-format as 5XX XXX XX XX */
  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: normalizeTrMobileInput(value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kvkkConsent || !formData.fullName || !formData.language || !isPhoneValid) return;

    const sent = await openMailDraft({
      subject: 'Egitim Formati Danismanlik Talebi',
      lines: [
        `Ad Soyad: ${formData.fullName}`,
        `Telefon: +90 ${formData.phone}`,
        `E-posta: ${formData.email || '-'}`,
        `Dil: ${LANGUAGES.find((lang) => lang.id === formData.language)?.name || formData.language}`,
        `Tarih: ${selectedDate ? formatDate(selectedDate) : '-'}`,
        `Saat Araligi: ${timeSlots.find((slot) => slot.id === selectedTime)?.label || selectedTime || '-'}`,
      ],
    });

    if (!sent) {
      notifyError('Talebiniz gönderilemedi. Lütfen tekrar deneyin.');
      return;
    }

    notifySuccess('Danışmanlık talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.');
    setSubmitted(true);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Background — aynı FreeTrialModal bg */}
          <div className="fixed inset-0 pointer-events-none">
            <img src={imgBg} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,11,0.5)] via-[rgba(50,77,71,0.35)] to-[rgba(0,0,11,0.65)]" />
            <div className="absolute inset-0 bg-[#00000B]/15 backdrop-blur-sm" />
          </div>

          {/* Close */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            onClick={onClose}
            className="fixed top-4 right-4 md:top-8 md:right-8 z-[95] w-12 h-12 flex items-center justify-center rounded-full bg-[#324D47] hover:bg-[#3d5e56] text-white shadow-[0_0_20px_rgba(50,77,71,0.4)] transition-all duration-300 cursor-pointer"
            aria-label="Kapat"
          >
            <X size={22} />
          </motion.button>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            className="relative z-[91] w-full max-w-[620px] mx-4 my-12 md:my-20"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                /* ═══ SUCCESS STATE ═══ */
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                  className="relative bg-[rgba(50,77,71,0.55)] backdrop-blur-xl rounded-[30px] border border-white/20 shadow-2xl shadow-black/20 overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                  <div className="relative z-10 p-10 py-16 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-6">
                      <Coffee size={28} className="text-white" />
                    </div>
                    <h3 className="text-[26px] md:text-[32px] font-['Neutraface_2_Text:Demi',sans-serif] text-white mb-3">
                      Randevunuz Alındı!
                    </h3>
                    <p className="text-white/70 font-['Neutraface_2_Text:Book',sans-serif] text-[14px] leading-relaxed max-w-[440px] mb-2">
                      <span className="text-white">{formData.fullName}</span>, sizi{' '}
                      {selectedDate && (
                        <span className="text-[#F4EBD1]">{formatDate(selectedDate)}</span>
                      )}{' '}
                      tarihinde{' '}
                      {selectedTime && (
                        <span className="text-[#F4EBD1]">
                          {timeSlots.find(s => s.id === selectedTime)?.label}
                        </span>
                      )}{' '}
                      saatleri arasında kampüsümüzde ağırlamaktan mutluluk duyacağız.
                    </p>
                    <p className="text-white/40 font-['Neutraface_2_Text:Book',sans-serif] text-mobile-meta md:text-[12px] mb-8">
                      Detaylar, paylaştığınız iletişim bilgileriniz üzerinden iletilecektir.
                    </p>
                    <button
                      onClick={onClose}
                      className="h-[44px] px-8 rounded-[30px] bg-[#00000B] hover:bg-[#68232E] text-white font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-kicker md:text-[14px] tracking-[0.05em] transition-colors duration-300 cursor-pointer"
                    >
                      Tamam
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* ═══ FORM STATE ═══ */
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.35 }}
                  className="relative bg-[rgba(50,77,71,0.55)] backdrop-blur-xl rounded-[30px] border border-white/20 shadow-2xl shadow-black/20 overflow-hidden"
                >
                  {/* Glass shine */}
                  <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

                  <div className="relative z-10 p-7 md:p-10">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-8">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-6 h-[1px] bg-white/40" />
                        <span className="text-mobile-kicker md:text-[10px] text-white/70 font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.12em] md:tracking-[0.25em] uppercase">
                          Kampüs Ziyareti
                        </span>
                        <div className="w-6 h-[1px] bg-white/40" />
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <Coffee size={24} className="text-white/80" />
                        <h2 className="font-['Neutraface_2_Text:Demi',sans-serif] text-[26px] md:text-[32px] text-white leading-tight">
                          Randevu Oluştur
                        </h2>
                      </div>
                      <p className="font-['Neutraface_2_Text:Book',sans-serif] text-mobile-meta md:text-[14px] text-white/70 max-w-[460px] leading-relaxed">
                        Kampüsümüze gelin, bir kahve içelim ve dil hedeflerinizi birlikte konuşalım.
                      </p>
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* Row: İsim + Telefon */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                        <FieldWrap icon={<Phone size={14} />} label="Telefon Numaranız">
                          <div className="flex gap-2">
                            <div className="bg-white h-[44px] rounded-[30px] px-3.5 flex items-center gap-1.5 border border-black/5 shrink-0">
                              <div className="w-[14px] h-[10px] rounded-[2px] overflow-hidden relative bg-[#E92434] flex items-center justify-center">
                                <div className="w-[3px] h-[3px] rounded-full border border-white" />
                              </div>
                              <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-meta md:text-[14px] text-[#302d2d]">+90</span>
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
                      </div>

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

                      {/* Dil Seçimi */}
                      <FieldWrap icon={<Globe size={14} />} label="Öğrenmek İstediğiniz Dil">
                        <div className="relative" ref={langRef}>
                          <button
                            type="button"
                            onClick={() => setLangOpen(!langOpen)}
                            className={`${inputBase} text-left flex items-center justify-between cursor-pointer`}
                          >
                            <span className={formData.language ? 'text-[#00000B]' : 'text-[#686767]'}>
                              {selectedLang ? selectedLang.name : 'Dil Seçiniz'}
                            </span>
                            <ChevronDown size={15} className={`text-[#686767] transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {langOpen && (
                              <DropdownList
                                items={LANGUAGES.map((l) => ({ id: l.id, label: l.name }))}
                                selected={formData.language}
                                onSelect={(v) => { setFormData({ ...formData, language: v }); setLangOpen(false); }}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </FieldWrap>

                      {/* Tarih seçimi */}
                      <FieldWrap icon={<CalendarDays size={14} />} label="Görüşmeye Gelmek İstediğiniz Tarih">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setCalendarOpen(!calendarOpen)}
                            className={`${inputBase} text-left flex items-center justify-between cursor-pointer`}
                          >
                            <span className={selectedDate ? 'text-[#00000B]' : 'text-[#686767]'}>
                              {selectedDate ? formatDate(selectedDate) : 'Tarih Seçiniz'}
                            </span>
                            <CalendarDays size={15} className="text-[#686767]" />
                          </button>
                          <AnimatePresence>
                            {calendarOpen && (
                              <MiniCalendar
                                viewYear={viewYear}
                                viewMonth={viewMonth}
                                selectedDate={selectedDate}
                                today={today}
                                onSelect={(d) => { setSelectedDate(d); setCalendarOpen(false); }}
                                onPrev={prevMonth}
                                onNext={nextMonth}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </FieldWrap>

                      {/* Saat Aralığı */}
                      <FieldWrap icon={<Clock size={14} />} label="Tercih Ettiğiniz Saat Aralığı">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedTime(slot.id)}
                              className={`h-[44px] rounded-[30px] flex items-center justify-center gap-1.5 text-mobile-kicker md:text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] border transition-all duration-200 cursor-pointer ${
                                selectedTime === slot.id
                                  ? 'bg-white text-[#324D47] border-white shadow-lg shadow-black/10'
                                  : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/20 hover:border-white/30'
                              }`}
                            >
                              <span className="text-mobile-kicker md:text-[11px]">{slot.icon}</span>
                              <span>{slot.label.split(' – ')[0]}–{slot.label.split(' – ')[1]}</span>
                            </button>
                          ))}
                        </div>
                      </FieldWrap>

                      {/* Disclaimer Note */}
                      <div className="flex items-start gap-2.5 bg-white/8 rounded-[16px] px-4 py-3 border border-white/10">
                        <Info size={14} className="text-[#F4EBD1] mt-0.5 shrink-0" />
                        <p className="font-['Neutraface_2_Text:Book',sans-serif] text-mobile-meta md:text-[12px] text-white/60 leading-relaxed">
                          Seçtiğiniz tarih ve saat aralığı <span className="text-white/80">kesinleşmiş bir randevu değildir</span>; tercih bildiriminiz olarak değerlendirilecektir. Eğitim danışmanlarımız sizinle iletişime geçerek uygun tarih ve saati birlikte belirleyecektir.
                        </p>
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
                        <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-kicker md:text-[14px] text-white tracking-[0.05em] md:tracking-wide">
                          Randevu Oluştur
                        </span>
                      </motion.button>

                      {/* Footer note */}
                      <p className="text-center font-['Neutraface_2_Text:Book',sans-serif] text-mobile-kicker md:text-[11px] text-white/40 leading-relaxed">
                        Bilgileriniz KVKK kapsamında korunmaktadır.
                      </p>
                    </div>
                  </div>
                </motion.form>
              )}
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

/* ─── CONSENT ROW ───────────────────────────────────────────────────────── */
function ConsentRow({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-start gap-2.5 text-left group cursor-pointer">
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
          className={`w-full min-h-[44px] px-5 py-2.5 text-left text-mobile-meta md:text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] transition-colors flex items-center justify-between ${
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

/* ─── MINI CALENDAR ─────────────────────────────────────────────────────── */
function MiniCalendar({
  viewYear, viewMonth, selectedDate, today,
  onSelect, onPrev, onNext,
}: {
  viewYear: number; viewMonth: number;
  selectedDate: Date | null; today: Date;
  onSelect: (d: Date) => void;
  onPrev: () => void; onNext: () => void;
}) {
  const { daysInMonth, startIdx } = getMonthDays(viewYear, viewMonth);
  const cells: (number | null)[] = Array(startIdx).fill(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < t;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[20px] shadow-xl shadow-black/20 border border-black/5 overflow-hidden z-30 p-4"
    >
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={onPrev} className="w-7 h-7 rounded-full hover:bg-[#F4EBD1] flex items-center justify-center transition-colors cursor-pointer">
          <ChevronLeft size={16} className="text-[#00000B]" />
        </button>
        <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] text-[#00000B]">
          {turkishMonths[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={onNext} className="w-7 h-7 rounded-full hover:bg-[#F4EBD1] flex items-center justify-center transition-colors cursor-pointer">
          <ChevronRight size={16} className="text-[#00000B]" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {turkishDays.map((d) => (
          <div key={d} className="text-center text-mobile-kicker md:text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#686767] py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const date = new Date(viewYear, viewMonth, day);
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const past = isPast(day);
          const sunday = isSunday(viewYear, viewMonth, day);
          const disabled = past || sunday;

          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={`w-full aspect-square rounded-full flex items-center justify-center text-mobile-meta md:text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] transition-all duration-150 ${
                disabled
                  ? 'text-[#d0d0d0] cursor-not-allowed'
                  : isSelected
                  ? 'bg-[#324D47] text-white shadow-md'
                  : isToday
                  ? 'bg-[#324D47]/10 text-[#324D47] hover:bg-[#324D47]/20'
                  : 'text-[#00000B] hover:bg-[#F4EBD1]/60 cursor-pointer'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Sunday note */}
      <p className="text-center text-mobile-kicker md:text-[10px] font-['Neutraface_2_Text:Book',sans-serif] text-[#686767]/60 mt-2">
        Pazar günleri ders yapılmamaktadır.
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DELIVERY OPTIONS — MAIN
   ═══════════════════════════════════════════════════════════════════════ */
export default function DeliveryOptions() {
  const navigate = useNavigate();
  const [showAppointment, setShowAppointment] = useState(false);
  const isLiteMode = useLiteMode();

  return (
    <>
      <section 
        id="delivery-options" 
        className={`relative ${isLiteMode ? 'py-14' : 'py-20 md:py-28'} bg-[#00000B] overflow-hidden`}
      >
        {/* Background Ambience */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen ${
              isLiteMode ? 'w-[40vw] h-[40vw] opacity-[0.02]' : 'w-[60vw] h-[60vw] filter blur-[150px] opacity-[0.04]'
            }`}
            style={{ backgroundColor: '#324D47' }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          
          {/* Header */}
          {isLiteMode ? (
            <div className="text-center mb-10">
              <h2 className="text-2xl font-['Neutraface_2_Text:Bold',sans-serif] text-[#ffffff] leading-tight mb-3">
                Online mı, Yüz Yüze mi?
              </h2>
              <p className="text-[#ffffff]/70 font-['Neutraface_2_Text:Book',sans-serif] text-[15px] max-w-xl mx-auto">
                Standart değişmez, sistem aynı kalır. Sana uygun öğrenme biçimini seç.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-['Neutraface_2_Text:Bold',sans-serif] text-[#ffffff] leading-tight mb-4">
                Online mı, Yüz Yüze mi?
              </h2>
              <p className="text-[#ffffff]/60 font-['Neutraface_2_Text:Book',sans-serif] text-lg max-w-2xl mx-auto">
                İster dünyanın herhangi bir yerinden bağlanın, ister kampüsümüzün büyülü atmosferinde yerinizi alın. 
                <span className="text-[#ffffff] block mt-1">Standart değişmez! Sahne farklı olabilir. Sistem aynı kalır.</span>
              </p>
            </motion.div>
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Card 1: Online */}
            <Card 
              title="ONLINE EĞİTİM"
              subtitle={"Her yerden, aynı Teachera standardı"}
              description="Evden, ofisten, yurtdışından… Nerede olursan ol, ders akışı aynı: Native Speaker eğitmenler ile Dinle → Konuş → Düzelt → Tekrar Et!"
              image={imgSocrates2}
              imageAlt="Online Education Socrates"
              accentColor="#68232E" 
              glowColor="#E70000"
              buttonText="Online Planları Gör"
              delay={0.1}
              liteMode={isLiteMode}
              onButtonClick={() => navigate('/fiyatlar')}
            />

            {/* Card 2: Face-to-Face */}
            <Card 
              title="YÜZ YÜZE EĞİTİM"
              subtitle={"Dil okulundan çok daha fazlası, sosyal bir yaşam alanı"}
              description="Teachera topluluğunun gücüyle network ağınızı genişletin. Kampüsümüzde kahve molaları, özel etkinlikler ve yaşayan bir sosyal ortamda dili hayatın içinde öğrenin."
              image={imgSocratesBook}
              imageAlt="Face to Face Education Socrates"
              accentColor="#324D47" 
              glowColor="#4A7067"
              buttonText="Randevu Oluştur"
              delay={0.2}
              liteMode={isLiteMode}
              onButtonClick={() => setShowAppointment(true)}
            />

          </div>
        </div>
      </section>

      {/* Appointment Modal */}
      <AppointmentModal isOpen={showAppointment} onClose={() => setShowAppointment(false)} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CARD COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
function Card({ 
  title, 
  subtitle,
  description, 
  image, 
  imageAlt, 
  accentColor, 
  glowColor, 
  buttonText, 
  delay,
  liteMode = false,
  onButtonClick,
}: {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  accentColor: string;
  glowColor: string;
  buttonText: string;
  delay: number;
  liteMode?: boolean;
  onButtonClick?: () => void;
}) {
  if (liteMode) {
    return (
      <div className="relative flex flex-col w-full rounded-[1.35rem] overflow-hidden border border-[#ffffff]/10 bg-[#0f0f16]">
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{ background: `radial-gradient(circle at 50% 100%, ${accentColor}, transparent 75%)` }}
        />
        <div className="relative z-10 p-5 pb-4">
          <h3 className="text-xl font-['Neutraface_2_Text:Bold',sans-serif] text-[#ffffff] mb-1.5 leading-tight">
            {title}
          </h3>
          <p
            className="font-['Neutraface_2_Text:Demi',sans-serif] text-mobile-meta md:text-[13px] mb-3 leading-relaxed"
            style={{ color: glowColor }}
          >
            {subtitle}
          </p>
          <p className="text-[#ffffff]/66 font-['Neutraface_2_Text:Book',sans-serif] text-mobile-meta md:text-[13px] leading-relaxed">
            {description}
          </p>
        </div>

        <div className="relative z-10 h-[200px] flex items-end justify-center overflow-hidden bg-[#0a0a10]">
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            className="w-auto h-[88%] object-contain object-bottom"
          />
        </div>

        <div className="relative z-10 p-5 pt-4">
          <button
            onClick={onButtonClick}
            className="w-full inline-flex items-center justify-center gap-2.5 py-2.5 bg-[#ffffff]/6 border border-[#ffffff]/12 rounded-full cursor-pointer"
          >
            <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#ffffff] text-mobile-kicker md:text-[12px] tracking-[0.05em] md:tracking-wide">
              {buttonText}
            </span>
            <ArrowRight size={14} className="text-white/80" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className="group relative flex flex-col justify-between w-full h-auto min-h-[600px] md:min-h-[550px] rounded-[2rem] overflow-hidden border border-[#ffffff]/5 bg-[#0f0f16]"
    >
      {/* 1. Dynamic Background Gradient */}
      <div 
        className="absolute inset-0 opacity-40 transition-opacity duration-700 group-hover:opacity-60 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 100%, ${accentColor}, transparent 70%)`
        }}
      />
      
      {/* 2. Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* 3. Glass Shine */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ffffff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-20 flex-shrink-0 p-8 pb-0">
        
        {/* Text Group */}
        <div className="mb-6">
          <h3 className="text-2xl md:text-3xl font-['Neutraface_2_Text:Bold',sans-serif] text-[#ffffff] mb-2 leading-none tracking-tight">
            {title}
          </h3>
          
          <p 
            className="font-['Neutraface_2_Text:Demi',sans-serif] text-sm md:text-base mb-4 italic leading-relaxed"
            style={{ color: glowColor }}
          >
            {subtitle}
          </p>

          <p className="text-[#ffffff]/60 font-['Neutraface_2_Text:Book',sans-serif] text-sm leading-relaxed max-w-md">
            {description}
          </p>
        </div>

        {/* Action Button */}
        <div className="inline-block relative">
          <button 
            onClick={onButtonClick}
            className="group/btn inline-flex items-center gap-3 pl-5 pr-1.5 py-1.5 bg-[#ffffff]/5 hover:bg-[#ffffff]/10 border border-[#ffffff]/10 backdrop-blur-sm rounded-full transition-all duration-300 cursor-pointer"
          >
            <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#ffffff] text-xs tracking-wide">
              {buttonText}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#ffffff] text-[#000000] flex items-center justify-center group-hover/btn:scale-110 transition-transform duration-300">
              <ArrowRight size={14} />
            </div>
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div className="relative w-full flex-grow min-h-[300px] mt-4 flex items-end justify-center overflow-hidden">
        
        {/* Glow Behind Socrates */}
        <div 
          className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none"
          style={{ backgroundColor: glowColor }}
        />

        {/* Floating Socrates Image */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 w-full h-full flex items-end justify-center pb-0"
        >
           <img 
             src={image} 
             alt={imageAlt} 
             className="w-auto h-[90%] md:h-[95%] max-h-[320px] object-contain object-bottom drop-shadow-2xl"
           />
        </motion.div>
      </div>
    </motion.div>
  );
}
