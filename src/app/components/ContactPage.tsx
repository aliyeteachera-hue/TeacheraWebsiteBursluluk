import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Phone, Globe, CalendarDays, Clock, ChevronDown, Check, Send,
  PhoneCall, MessageCircle, MapPin, Mail, ArrowRight, Sparkles, ChevronLeft, ChevronRight,
} from 'lucide-react';
import imgBg from "figma:asset/fc31d891571779da1d514055d08ebb51d4ccb03e.webp";
import { openMailDraft } from './formMailto';
import { isValidTrMobilePhone, normalizeTrMobileInput, TR_MOBILE_PATTERN, TR_MOBILE_TITLE } from './phoneUtils';

/* ─── DATA ──────────────────────────────────────────────────────────────── */
const languages = [
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

const PHONE_NUMBER = '0332 236 80 66';
const PHONE_HREF = 'tel:03322368066';
const WHATSAPP_HREF = 'https://wa.me/905528674226';

const inputBase =
  "w-full h-[44px] bg-white rounded-[30px] px-5 text-[14px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#00000B] placeholder:text-[#686767] outline-none border border-black/5 focus:border-[#324D47]/50 focus:ring-2 focus:ring-[#324D47]/15 transition-all";

/* ─── HELPERS ───────────────────────────────────────────────────────────── */
const turkishMonths = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];
const turkishDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startIdx = firstDay === 0 ? 6 : firstDay - 1; // Monday-based
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

/* ─── PAGE ──────────────────────────────────────────────────────────────── */
export default function ContactPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#00000B] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={imgBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,11,0.5)] via-[rgba(50,77,71,0.35)] to-[rgba(0,0,11,0.65)]" />
        <div className="absolute inset-0 bg-[#00000B]/15 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-24 md:py-32">
        <h1 className="sr-only">İletişim - Teachera Konya Dil Okulu ve Türkiye Online Dil Eğitimi Danışmanlığı</h1>
        <div className="w-full max-w-[1100px] flex flex-col lg:flex-row gap-6">
          {/* Left: Call-back form */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            className="flex-1"
          >
            <CallbackForm />
          </motion.div>

          {/* Right: Call us & info */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
            className="w-full lg:w-[360px] flex flex-col gap-6"
          >
            <CallUsCard />
            <InfoCard />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ─── CALLBACK FORM ─────────────────────────────────────────────────────── */
function CallbackForm() {
  const [formData, setFormData] = useState({
    fullName: '', phone: '', language: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const selectedLang = languages.find((l) => l.id === formData.language);
  const isPhoneValid = isValidTrMobilePhone(formData.phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.language || !selectedDate || !selectedTime || !isPhoneValid) return;

    const selectedTimeLabel = timeSlots.find((slot) => slot.id === selectedTime)?.label || selectedTime;
    const sent = await openMailDraft({
      subject: 'Teachera Geri Arama Talebi',
      lines: [
        `Ad Soyad: ${formData.fullName}`,
        `Telefon: +90 ${formData.phone}`,
        `Dil: ${selectedLang?.name || formData.language}`,
        `Tarih: ${formatDate(selectedDate)}`,
        `Saat Aralığı: ${selectedTimeLabel}`,
      ],
    });

    if (!sent) {
      window.alert('Talebiniz gönderilemedi. Lütfen tekrar deneyin.');
      return;
    }

    setSubmitted(true);
  };

  const handleReset = () => {
    setFormData({ fullName: '', phone: '', language: '' });
    setSelectedDate(null);
    setSelectedTime('');
    setSubmitted(false);
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
    <div className="relative bg-[rgba(50,77,71,0.55)] backdrop-blur-xl rounded-[30px] border border-white/20 shadow-2xl shadow-black/20 overflow-hidden h-full">
      <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 p-7 md:p-10">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="flex flex-col items-center text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-white/15 border border-white/25 flex items-center justify-center mb-6"
              >
                <Sparkles size={28} className="text-[#F4EBD1]" />
              </motion.div>
              <h3 className="font-['Neutraface_2_Text:Demi',sans-serif] text-[22px] md:text-[26px] text-white mb-2">
                Talebiniz Alındı!
              </h3>
              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[14px] text-white/70 max-w-[380px] leading-relaxed mb-2">
                <span className="text-white">{selectedDate && formatDate(selectedDate)}</span> tarihinde,{' '}
                <span className="text-white">{timeSlots.find(t => t.id === selectedTime)?.label}</span> saatleri arasında sizi arayacağız.
              </p>
              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] text-white/50 mb-8">
                Lütfen telefonunuzu açık tutunuz.
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] rounded-[30px] transition-all"
              >
                Yeni Talep Oluştur
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-[1px] bg-white/40" />
                  <span className="text-[10px] text-white/70 font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.25em] uppercase">
                    Geri Arama Talebi
                  </span>
                  <div className="w-6 h-[1px] bg-white/40" />
                </div>
                <h2 className="font-['Neutraface_2_Text:Demi',sans-serif] text-[26px] md:text-[32px] text-white leading-tight mb-2">
                  Biz Sizi Arayalım
                </h2>
                <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] md:text-[14px] text-white/70 max-w-[420px] leading-relaxed">
                  Size uygun tarih ve saati seçin, uzman eğitmenlerimiz sizi arasın.
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
                      <div className="bg-white h-[44px] rounded-[30px] px-3 flex items-center gap-1 border border-black/5 shrink-0">
                        <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[13px] text-[#302d2d]">+90</span>
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="5XX XXX XX XX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: normalizeTrMobileInput(e.target.value) })}
                        inputMode="numeric"
                        maxLength={13}
                        pattern={TR_MOBILE_PATTERN}
                        title={TR_MOBILE_TITLE}
                        className={`${inputBase} flex-1`}
                      />
                    </div>
                  </FieldWrap>
                </div>

                {/* Dil */}
                <FieldWrap icon={<Globe size={14} />} label="Hangi Dili Öğrenmek İstiyorsunuz?">
                  <div className="relative">
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
                          items={languages.map((l) => ({ id: l.id, label: l.name }))}
                          selected={formData.language}
                          onSelect={(v) => { setFormData({ ...formData, language: v }); setLangOpen(false); }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </FieldWrap>

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
                        className={`h-[44px] rounded-[30px] flex items-center justify-center gap-1.5 text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] border transition-all duration-200 cursor-pointer ${
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

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!formData.fullName || !formData.language || !selectedDate || !selectedTime || !isPhoneValid}
                  className="w-full h-[48px] bg-[#00000B] hover:bg-[#68232E] rounded-[30px] flex items-center justify-center gap-2.5 transition-colors duration-300 mt-2 cursor-pointer disabled:bg-[#00000B]/40 disabled:cursor-not-allowed"
                >
                  <Send size={15} className="text-white" />
                  <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] text-white tracking-wide">
                    Arama Talebi Oluştur
                  </span>
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── CALL US CARD ──────────────────────────────────────────────────────── */
function CallUsCard() {
  return (
    <div className="relative bg-[rgba(50,77,71,0.55)] backdrop-blur-xl rounded-[30px] border border-white/20 shadow-2xl shadow-black/20 overflow-hidden">
      <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 p-7 md:p-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-4 h-[1px] bg-white/40" />
            <span className="text-[10px] text-white/70 font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.25em] uppercase">
              Hemen Arayın
            </span>
            <div className="w-4 h-[1px] bg-white/40" />
          </div>
          <h3 className="font-['Neutraface_2_Text:Demi',sans-serif] text-[22px] text-white leading-tight mb-1">
            Bizi Arayın
          </h3>
          <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] text-white/60">
            Hemen bilgi almak için doğrudan arayın
          </p>
        </div>

        {/* Phone CTA */}
        <a
          href={PHONE_HREF}
          className="group flex items-center justify-center gap-3 w-full h-[56px] bg-white rounded-[30px] hover:bg-[#F4EBD1] transition-colors duration-300 mb-4"
        >
          <div className="w-9 h-9 rounded-full bg-[#324D47] flex items-center justify-center group-hover:bg-[#00000B] transition-colors">
            <PhoneCall size={16} className="text-white" />
          </div>
          <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[18px] text-[#00000B] tracking-wide">
            {PHONE_NUMBER}
          </span>
        </a>

        {/* WhatsApp */}
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-center gap-2.5 w-full h-[48px] rounded-[30px] border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300"
        >
          <MessageCircle size={16} className="text-white/70 group-hover:text-white transition-colors" />
          <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[14px] text-white/70 group-hover:text-white transition-colors">
            WhatsApp ile yazın
          </span>
          <ArrowRight size={14} className="text-white/40 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
        </a>
        <p className="text-center font-['Neutraface_2_Text:Book',sans-serif] text-[11px] text-white/40 mt-1">
          Müşteri temsilcimiz <span className="text-white/60">Muazzez</span> · Sadece yazılı iletişim
        </p>

        {/* Çalışma saatleri */}
        <div className="mt-5 pt-5 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={12} className="text-white/50" />
            <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[11px] text-white/50 tracking-wide uppercase">
              Çalışma Saatleri
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] text-white/70">Pazartesi – Cumartesi</span>
              <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[13px] text-white">09:00 – 21:00</span>
            </div>
            <div className="flex justify-between">
              <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] text-white/70">Pazar</span>
              <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[13px] text-white/50">Kapalı</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── INFO CARD ─────────────────────────────────────────────────────────── */
function InfoCard() {
  const items = [
    { icon: <MapPin size={14} />, label: 'Adres', value: 'Kule Plaza Kat: 26, Selçuklu – Konya' },
    { icon: <Mail size={14} />, label: 'Satış Departmanı', value: 'sales@teachera.com.tr', href: 'mailto:sales@teachera.com.tr' },
    { icon: <Mail size={14} />, label: 'Medya Soruları', value: 'media@teachera.com.tr', href: 'mailto:media@teachera.com.tr' },
    { icon: <Mail size={14} />, label: 'Ortaklıklar', value: 'partners@teachera.com.tr', href: 'mailto:partners@teachera.com.tr' },
  ];

  return (
    <div className="relative bg-[rgba(50,77,71,0.35)] backdrop-blur-xl rounded-[30px] border border-white/15 shadow-xl shadow-black/10 overflow-hidden">
      <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 p-7 md:p-8 flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <span className="text-white/60">{item.icon}</span>
            </div>
            <div>
              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[11px] text-white/40 uppercase tracking-wider">{item.label}</p>
              {item.href ? (
                <a href={item.href} className="font-['Neutraface_2_Text:Demi',sans-serif] text-[13px] text-white hover:text-[#F4EBD1] transition-colors">
                  {item.value}
                </a>
              ) : (
                <p className="font-['Neutraface_2_Text:Demi',sans-serif] text-[13px] text-white">{item.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
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

/* ─── SHARED COMPONENTS ─────────────────────────────────────────────────── */
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
