import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown, ChevronLeft, ChevronRight, Check, Send,
  User, Phone, Mail, Globe, CalendarDays, Clock, Calendar, X, Sparkles, Info,
} from 'lucide-react';
import { useFreeTrial } from './FreeTrialContext';
import { ageRanges, getLanguagesForAge } from './ageLanguageMap';
import imgBg from "figma:asset/fc31d891571779da1d514055d08ebb51d4ccb03e.webp";
import { openMailDraft } from './formMailto';
import { isValidTrMobilePhone, normalizeTrMobileInput, TR_MOBILE_PATTERN, TR_MOBILE_TITLE } from './phoneUtils';

const LEGAL_KVKK_URL = '/hukuki/musteri-aydinlatma-metni';

/* ─── DATA ──────────────────────────────────────────────────────────────── */
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

const inputDisabled =
  "w-full h-[44px] bg-white/40 rounded-[30px] px-5 text-[14px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#686767] outline-none border border-black/5 cursor-not-allowed transition-all";

/* ─── HELPERS ───────────────────────────────────────────────────────────── */
function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startIdx = firstDay === 0 ? 6 : firstDay - 1;
  return { daysInMonth, startIdx };
}

function formatDate(d: Date) {
  return `${d.getDate()} ${turkishMonths[d.getMonth()]} ${d.getFullYear()}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isSunday(year: number, month: number, day: number) {
  return new Date(year, month, day).getDay() === 0;
}

/* ─── MODAL ─────────────────────────────────────────────────────────────── */
export default function FreeTrialModal() {
  const { isOpen, close } = useFreeTrial();

  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', age: '', language: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [ageOpen, setAgeOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [kvkkConsent, setKvkkConsent] = useState(false);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const langRef = useRef<HTMLDivElement>(null);
  const ageRef = useRef<HTMLDivElement>(null);

  const availableLanguages = getLanguagesForAge(formData.age);
  const selectedLang = availableLanguages.find((l) => l.id === formData.language);
  const isPhoneValid = isValidTrMobilePhone(formData.phone);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (ageRef.current && !ageRef.current.contains(e.target as Node)) setAgeOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setFormData({ fullName: '', phone: '', email: '', age: '', language: '' });
        setSelectedDate(null);
        setSelectedTime('');
        setKvkkConsent(false);
        setSubmitted(false);
        setLangOpen(false);
        setAgeOpen(false);
        setCalendarOpen(false);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kvkkConsent || !formData.fullName || !formData.email || !formData.age || !formData.language || !isPhoneValid) return;

    const sent = await openMailDraft({
      subject: 'Ucretsiz Deneme Seansi Talebi',
      lines: [
        `Ad Soyad: ${formData.fullName}`,
        `Telefon: +90 ${formData.phone}`,
        `E-posta: ${formData.email}`,
        `Yas Araligi: ${ageRanges.find((age) => age.id === formData.age)?.label || formData.age}`,
        `Dil: ${getLanguagesForAge(formData.age).find((language) => language.id === formData.language)?.name || formData.language}`,
        `Seans Tarihi: ${selectedDate ? formatDate(selectedDate) : '-'}`,
        `Saat Araligi: ${timeSlots.find((slot) => slot.id === selectedTime)?.label || selectedTime || '-'}`,
        `Iletisim Izni: ${contactConsent ? 'Evet' : 'Hayir'}`,
      ],
    });

    if (!sent) {
      window.alert('Talebiniz gönderilemedi. Lütfen tekrar deneyin.');
      return;
    }

    setSubmitted(true);
  };

  /* Phone mask: auto-format as 5XX XXX XX XX */
  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: normalizeTrMobileInput(value) });
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
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          {/* Background */}
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
            onClick={close}
            className="fixed top-4 right-4 md:top-8 md:right-8 z-[95] w-12 h-12 flex items-center justify-center rounded-full bg-[#324D47] hover:bg-[#3d5e56] text-white shadow-[0_0_20px_rgba(50,77,71,0.4)] transition-all duration-300"
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
                <SuccessState
                  key="success"
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onReset={() => setSubmitted(false)}
                  onClose={close}
                />
              ) : (
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
                        <span className="text-[10px] text-white/70 font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.25em] uppercase">
                          Hemen Deneyin
                        </span>
                        <div className="w-6 h-[1px] bg-white/40" />
                      </div>
                      <h2 className="font-['Neutraface_2_Text:Demi',sans-serif] text-[26px] md:text-[32px] text-white leading-tight mb-2">
                        Ücretsiz Deneme Seansı
                      </h2>
                      <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] md:text-[14px] text-white/70 max-w-[460px] leading-relaxed">
                        Formu doldurun, eğitim danışmanlarımız sizinle iletişime geçerek deneme seansınızı planlasın.
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
                      </div>

                      {/* E-posta */}
                      <FieldWrap icon={<Mail size={14} />} label="E-posta Adresiniz">
                        <input
                          type="email"
                          required
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

                        {/* Dil – yaş seçilmeden kilitli */}
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
                                    {selectedLang ? selectedLang.name : 'Dil Seçiniz'}
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

                      {/* Tarih seçimi */}
                      <FieldWrap icon={<CalendarDays size={14} />} label="Tercih Ettiğiniz Tarih">
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

                      {/* Saat Dilimi */}
                      <FieldWrap icon={<Clock size={14} />} label="Tercih Ettiğiniz Saat Aralığı">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedTime(slot.id)}
                              className={`h-[44px] rounded-[30px] flex items-center justify-center gap-1.5 text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] border transition-all duration-200 cursor-pointer ${
                                selectedTime === slot.id
                                  ? 'bg-white text-[#324D47] border-white shadow-lg shadow-black/10'
                                  : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/20 hover:border-white/30'
                              }`}
                            >
                              <span className="text-[11px]">{slot.icon}</span>
                              <span>{slot.label.split(' – ')[0]}–{slot.label.split(' – ')[1]}</span>
                            </button>
                          ))}
                        </div>
                      </FieldWrap>

                      {/* Disclaimer Note */}
                      <div className="flex items-start gap-2.5 bg-white/8 rounded-[16px] px-4 py-3 border border-white/10">
                        <Info size={14} className="text-[#F4EBD1] mt-0.5 shrink-0" />
                        <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[12px] text-white/60 leading-relaxed">
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
                        <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] text-white tracking-wide">
                          Deneme Seansı Talep Et
                        </span>
                      </motion.button>

                      {/* Footer note */}
                      <p className="text-center font-['Neutraface_2_Text:Book',sans-serif] text-[11px] text-white/40 leading-relaxed">
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
    <button type="button" onClick={() => onChange(!checked)} className="flex items-start gap-2.5 text-left group">
      <div
        className={`w-4 h-4 mt-[2px] rounded-[3px] border flex items-center justify-center transition-all duration-200 shrink-0 ${
          checked ? 'bg-[#E70000] border-[#E70000]' : 'bg-white border-[#64748b] group-hover:border-white'
        }`}
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
      <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] text-white/80 leading-relaxed">
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
          className={`w-full px-5 py-2.5 text-left text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] transition-colors flex items-center justify-between ${
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
        <button type="button" onClick={onPrev} className="w-7 h-7 rounded-full hover:bg-[#F4EBD1] flex items-center justify-center transition-colors">
          <ChevronLeft size={16} className="text-[#00000B]" />
        </button>
        <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] text-[#00000B]">
          {turkishMonths[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={onNext} className="w-7 h-7 rounded-full hover:bg-[#F4EBD1] flex items-center justify-center transition-colors">
          <ChevronRight size={16} className="text-[#00000B]" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {turkishDays.map((d) => (
          <div key={d} className="text-center text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#686767] py-1">
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
              className={`w-full aspect-square rounded-full flex items-center justify-center text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] transition-all duration-150 ${
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
      <p className="text-center text-[10px] font-['Neutraface_2_Text:Book',sans-serif] text-[#686767]/60 mt-2">
        Pazar günleri ders yapılmamaktadır.
      </p>
    </motion.div>
  );
}

/* ─── SUCCESS STATE ─────────────────────────────────────────────────────── */
function SuccessState({
  selectedDate, selectedTime, onReset, onClose,
}: {
  selectedDate: Date | null; selectedTime: string;
  onReset: () => void; onClose: () => void;
}) {
  const timeLabel = timeSlots.find(t => t.id === selectedTime)?.label;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="relative bg-[rgba(50,77,71,0.55)] backdrop-blur-xl rounded-[30px] border border-white/20 shadow-2xl shadow-black/20 overflow-hidden"
    >
      <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 p-10 md:p-14 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
          className="w-16 h-16 rounded-full bg-white/15 border border-white/25 flex items-center justify-center mb-6"
        >
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Sparkles size={28} className="text-[#F4EBD1]" />
          </motion.div>
        </motion.div>

        <h3 className="font-['Neutraface_2_Text:Demi',sans-serif] text-[22px] md:text-[26px] text-white mb-2">
          Talebiniz Alındı!
        </h3>
        <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[14px] text-white/70 max-w-[400px] leading-relaxed mb-2">
          Ücretsiz deneme seansınız için başvurunuz başarıyla kaydedildi.
          {selectedDate && timeLabel && (
            <>
              {' '}Tercih ettiğiniz tarih <span className="text-white">{formatDate(selectedDate)}</span>, saat aralığı <span className="text-white">{timeLabel}</span>.
            </>
          )}
        </p>
        <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] text-white/50 mb-8">
          Eğitim danışmanlarımız en kısa sürede sizinle iletişime geçerek dersinizi kesinleştirecektir.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] rounded-[30px] transition-all"
          >
            Yeni Başvuru
          </button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-5 py-2.5 bg-[#00000B] hover:bg-[#68232E] text-white text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] rounded-[30px] flex items-center gap-2 transition-colors duration-300"
          >
            Kapat
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
