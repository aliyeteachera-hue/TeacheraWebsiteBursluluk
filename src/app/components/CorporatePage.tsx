import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2, User, Phone, Mail, Briefcase, Globe, ChevronDown, Check, Send,
  Sparkles, MapPin, Users, GraduationCap, Monitor, Clock, FileCheck,
} from 'lucide-react';
import { openMailDraft } from './formMailto';
import { isValidTrMobilePhone, normalizeTrMobileInput, TR_MOBILE_PATTERN, TR_MOBILE_TITLE } from './phoneUtils';

const LEGAL_KVKK_URL = '/hukuki/musteri-aydinlatma-metni';

/* ═══════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */
const sectors = [
  'Teknoloji / Yazılım',
  'Finans / Bankacılık',
  'Sağlık / İlaç',
  'Üretim / Sanayi',
  'Lojistik / Taşımacılık',
  'Enerji',
  'Hukuk',
  'Eğitim',
  'Turizm / Otelcilik',
  'Perakende',
  'İnşaat / Gayrimenkul',
  'Medya / İletişim',
  'Kamu',
  'Savunma / Havacılık',
  'Diğer',
];

const languages = [
  { id: 'en', name: 'İngilizce' },
  { id: 'es', name: 'İspanyolca' },
  { id: 'de', name: 'Almanca' },
  { id: 'fr', name: 'Fransızca' },
  { id: 'it', name: 'İtalyanca' },
  { id: 'ru', name: 'Rusça' },
  { id: 'ar', name: 'Arapça' },
];

const trainingGoals = [
  'Konuşma Akıcılığı / Genel',
  'Business English',
  'Sunum & Toplantı',
  'E-posta Yazımı',
  'Müzakere',
  'Sektörel İngilizce',
  'Sınav Hazırlık',
  'Diğer',
];

const participantRanges = [
  '1 – 5 kişi',
  '6 – 15 kişi',
  '16 – 30 kişi',
  '31 – 50 kişi',
  '50+ kişi',
];

const levelOptions = [
  'Bilmiyoruz (Placement test istiyoruz)',
  'A1 – Başlangıç',
  'A2 – Temel',
  'B1 – Orta',
  'B2 – Ortanın Üstü',
  'C1 – İleri',
  'C2 – Uzman',
  'Karışık Seviye',
];

const modelOptions = [
  { id: 'online', label: 'Online', icon: <Monitor size={14} /> },
  { id: 'yuz-yuze', label: 'Yüz Yüze', icon: <Users size={14} /> },
  { id: 'hibrit', label: 'Hibrit', icon: <GraduationCap size={14} /> },
];

const timeSlots = [
  { id: '09-12', label: '09:00 – 12:00', icon: '🌅' },
  { id: '12-15', label: '12:00 – 15:00', icon: '☀️' },
  { id: '15-18', label: '15:00 – 18:00', icon: '🌤️' },
  { id: '18-21', label: '18:00 – 21:00', icon: '🌙' },
];

const inputBase =
  "w-full h-[44px] bg-white rounded-[30px] px-5 text-[14px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#00000B] placeholder:text-[#686767] outline-none border border-black/5 focus:border-[#324D47]/50 focus:ring-2 focus:ring-[#324D47]/15 transition-all";

/* ═══════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function CorporatePage() {
  return (
    <div className="relative min-h-screen w-full bg-[#00000B] overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1771147372627-7fffe86cf00b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBvZmZpY2UlMjBtZWV0aW5nJTIwb2RlJTIwbW9kZXJufGVufDF8fHx8MTc3MjA3NDA1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,11,0.6)] via-[rgba(50,77,71,0.4)] to-[rgba(0,0,11,0.75)]" />
        <div className="absolute inset-0 bg-[#00000B]/20 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-start justify-center px-4 py-24 md:py-32">
        <h1 className="sr-only">Konya ve Türkiye Geneli Kurumsal Dil Eğitimi Teklif Formu</h1>
        <div className="w-full max-w-[1100px] flex flex-col lg:flex-row gap-6">
          {/* Left — Form */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            className="flex-1"
          >
            <CorporateForm />
          </motion.div>

          {/* Right — Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
            className="w-full lg:w-[360px] flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start"
          >
            <WhyTeacheraCard />
            <DirectContactCard />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CORPORATE FORM
   ═══════════════════════════════════════════════════════════════════════ */
function CorporateForm() {
  const [step, setStep] = useState(0); // 0 = kurum, 1 = yetkili, 2 = talep
  const [submitted, setSubmitted] = useState(false);

  // A — Kurum Bilgisi
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('');
  const [sectorOpen, setSectorOpen] = useState(false);
  const [city, setCity] = useState('');
  const [multiLocation, setMultiLocation] = useState(false);

  // B — Yetkili Kişi
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [callTime, setCallTime] = useState('');

  // C — Talebin Özü
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [participants, setParticipants] = useState('');
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [level, setLevel] = useState('');
  const [levelOpen, setLevelOpen] = useState(false);
  const [model, setModel] = useState('');
  const [kvkk, setKvkk] = useState(false);

  const sectorRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const partRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sectorRef.current && !sectorRef.current.contains(e.target as Node)) setSectorOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (partRef.current && !partRef.current.contains(e.target as Node)) setParticipantsOpen(false);
      if (levelRef.current && !levelRef.current.contains(e.target as Node)) setLevelOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePhoneChange = (value: string) => {
    setPhone(normalizeTrMobileInput(value));
  };

  const toggleLanguage = (id: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const canStep0 = companyName && sector && city;
  const canStep1 = fullName && isValidTrMobilePhone(phone) && callTime;
  const canStep2 = selectedLanguages.length > 0 && selectedGoals.length > 0 && participants && level && model && kvkk;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canStep2) return;

    const sent = await openMailDraft({
      to: 'data@teachera.com.tr',
      subject: 'Kurumsal Egitim Teklif Talebi',
      lines: [
        `Kurum: ${companyName}`,
        `Sektor: ${sector}`,
        `Sehir: ${city}`,
        `Coklu Lokasyon: ${multiLocation ? 'Evet' : 'Hayir'}`,
        `Yetkili Ad Soyad: ${fullName}`,
        `Unvan: ${title || '-'}`,
        `E-posta: ${email || '-'}`,
        `Telefon: +90 ${phone}`,
        `Aranma Saati: ${timeSlots.find((slot) => slot.id === callTime)?.label || callTime}`,
        `Diller: ${selectedLanguages.map((id) => languages.find((lang) => lang.id === id)?.name || id).join(', ')}`,
        `Hedefler: ${selectedGoals.join(', ')}`,
        `Katilimci Sayisi: ${participants}`,
        `Baslangic Seviyesi: ${level}`,
        `Egitim Modeli: ${modelOptions.find((modelOption) => modelOption.id === model)?.label || model}`,
      ],
    });

    if (!sent) {
      window.alert('Talebiniz gönderilemedi. Lütfen tekrar deneyin.');
      return;
    }

    setSubmitted(true);
  };

  const handleReset = () => {
    setStep(0);
    setSubmitted(false);
    setCompanyName(''); setSector(''); setCity(''); setMultiLocation(false);
    setFullName(''); setTitle(''); setEmail(''); setPhone(''); setCallTime('');
    setSelectedLanguages([]); setSelectedGoals([]); setParticipants('');
    setLevel(''); setModel(''); setKvkk(false);
  };

  const steps = [
    { label: 'Kurum', icon: <Building2 size={12} /> },
    { label: 'Yetkili', icon: <User size={12} /> },
    { label: 'Talep', icon: <Briefcase size={12} /> },
  ];

  return (
    <div className="relative bg-[rgba(50,77,71,0.55)] backdrop-blur-xl rounded-[30px] border border-white/20 shadow-2xl shadow-black/20 overflow-hidden">
      <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-7 md:p-10">
        <AnimatePresence mode="wait">
          {submitted ? (
            /* ── Success ── */
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
                Kurumsal Teklif Talebiniz Alındı!
              </h3>
              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[14px] text-white/70 max-w-[420px] leading-relaxed mb-2">
                <span className="text-white">{companyName}</span> için hazırlanacak teklif,{' '}
                <span className="text-white">{fullName}</span> adına en kısa sürede iletilecektir.
              </p>
              <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] text-white/50 mb-8">
                Eğitim danışmanlarımız sizi {timeSlots.find((t) => t.id === callTime)?.label || ''} saatleri arasında arayacaktır.
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] rounded-[30px] transition-all cursor-pointer"
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
              {/* ── Header ── */}
              <div className="flex flex-col items-center text-center mb-6 md:mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-[1px] bg-white/40" />
                  <span className="text-[10px] text-white/70 font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.25em] uppercase">
                    Kurumsal Eğitim
                  </span>
                  <div className="w-6 h-[1px] bg-white/40" />
                </div>
                <h2 className="font-['Neutraface_2_Text:Demi',sans-serif] text-[24px] md:text-[32px] text-white leading-tight mb-2">
                  Kurumsal Teklif Alın
                </h2>
                <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[12px] md:text-[14px] text-white/70 max-w-[460px] leading-relaxed">
                  Konya'da şirket içi eğitimleri yerinde yönetiyoruz; aynı standardı dünya genelinde online sınıflara taşıyoruz.
                </p>
              </div>

              {/* ── Step Indicator ── */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6 md:mb-8">
                {steps.map((s, i) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      if (i === 0) setStep(0);
                      if (i === 1 && canStep0) setStep(1);
                      if (i === 2 && canStep0 && canStep1) setStep(2);
                    }}
                    className={`min-w-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-[11px] sm:text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] transition-all duration-300 cursor-pointer border ${
                      step === i
                        ? 'bg-white text-[#324D47] border-white shadow-lg shadow-black/10'
                        : step > i
                        ? 'bg-white/15 text-white/90 border-white/25'
                        : 'bg-white/5 text-white/40 border-white/10'
                    }`}
                  >
                    {step > i ? <Check size={11} /> : s.icon}
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </button>
                ))}
              </div>

              {/* ── Step Content ── */}
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <StepWrap key="step0">
                    <StepTitle icon={<Building2 size={15} />} title="Kurum Bilgisi" />
                    <div className="flex flex-col gap-4">
                      <FieldWrap icon={<Building2 size={14} />} label="Kurum Adı">
                        <input
                          type="text"
                          required
                          placeholder="Kurum / Şirket Adı"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className={inputBase}
                        />
                      </FieldWrap>

                      <FieldWrap icon={<Briefcase size={14} />} label="Sektör">
                        <div className="relative" ref={sectorRef}>
                          <button
                            type="button"
                            onClick={() => setSectorOpen(!sectorOpen)}
                            className={`${inputBase} text-left flex items-center justify-between cursor-pointer`}
                          >
                            <span className={sector ? 'text-[#00000B]' : 'text-[#686767]'}>
                              {sector || 'Sektör Seçiniz'}
                            </span>
                            <ChevronDown size={15} className={`text-[#686767] transition-transform duration-200 ${sectorOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {sectorOpen && (
                              <DropdownList
                                items={sectors.map((s) => ({ id: s, label: s }))}
                                selected={sector}
                                onSelect={(v) => { setSector(v); setSectorOpen(false); }}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </FieldWrap>

                      <FieldWrap icon={<MapPin size={14} />} label="Şehir / Ülke">
                        <input
                          type="text"
                          required
                          placeholder="ör. İstanbul, Türkiye"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={inputBase}
                        />
                      </FieldWrap>

                      {/* Multi location checkbox */}
                      <button
                        type="button"
                        onClick={() => setMultiLocation(!multiLocation)}
                        className="flex items-center gap-2.5 group cursor-pointer"
                      >
                        <div
                          className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-200 shrink-0 ${
                            multiLocation
                              ? 'bg-white border-white'
                              : 'bg-white/10 border-white/25 group-hover:border-white/50'
                          }`}
                        >
                          {multiLocation && <Check size={10} className="text-[#324D47]" strokeWidth={3} />}
                        </div>
                        <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] text-white/70 group-hover:text-white transition-colors">
                          Birden fazla lokasyonumuz var
                        </span>
                      </button>

                      {/* Next */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => canStep0 && setStep(1)}
                        disabled={!canStep0}
                        className={`w-full h-[48px] rounded-[30px] flex items-center justify-center gap-2.5 transition-all duration-300 mt-1 ${
                          canStep0
                            ? 'bg-white text-[#324D47] hover:bg-[#F4EBD1] cursor-pointer shadow-lg shadow-black/10'
                            : 'bg-white/10 text-white/30 cursor-not-allowed'
                        }`}
                      >
                        <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[14px]">Devam Et</span>
                      </motion.button>
                    </div>
                  </StepWrap>
                )}

                {step === 1 && (
                  <StepWrap key="step1">
                    <StepTitle icon={<User size={15} />} title="Yetkili Kişi Bilgileri" />
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FieldWrap icon={<User size={14} />} label="Ad Soyad">
                          <input
                            type="text"
                            required
                            placeholder="Adınız Soyadınız"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={inputBase}
                          />
                        </FieldWrap>
                        <FieldWrap icon={<Briefcase size={14} />} label="Unvan / Departman">
                          <input
                            type="text"
                            placeholder="ör. İK Müdürü"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={inputBase}
                          />
                        </FieldWrap>
                      </div>

                      <FieldWrap icon={<Mail size={14} />} label="Kurumsal E-posta">
                        <input
                          type="email"
                          placeholder="ad.soyad@sirket.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputBase}
                        />
                      </FieldWrap>

                      <FieldWrap icon={<Phone size={14} />} label="Telefon">
                        <div className="flex gap-2">
                          <div className="bg-white h-[44px] rounded-[30px] px-3 flex items-center gap-1 border border-black/5 shrink-0">
                            <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[13px] text-[#302d2d]">+90</span>
                          </div>
                          <input
                            type="tel"
                            required
                            placeholder="5XX XXX XX XX"
                            value={phone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            inputMode="numeric"
                            maxLength={13}
                            pattern={TR_MOBILE_PATTERN}
                            title={TR_MOBILE_TITLE}
                            className={`${inputBase} flex-1`}
                          />
                        </div>
                      </FieldWrap>

                      <FieldWrap icon={<Clock size={14} />} label="Uygun Arama Saatleri">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setCallTime(slot.id)}
                              className={`h-[44px] rounded-[30px] flex items-center justify-center gap-1 text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] border transition-all duration-200 cursor-pointer ${
                                callTime === slot.id
                                  ? 'bg-white text-[#324D47] border-white shadow-lg shadow-black/10'
                                  : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/20 hover:border-white/30'
                              }`}
                            >
                              <span className="text-[10px]">{slot.icon}</span>
                              <span>{slot.label.split(' – ')[0]}</span>
                            </button>
                          ))}
                        </div>
                      </FieldWrap>

                      {/* Nav */}
                      <div className="flex gap-3 mt-1">
                        <button
                          type="button"
                          onClick={() => setStep(0)}
                          className="flex-1 h-[48px] rounded-[30px] border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] transition-all cursor-pointer"
                        >
                          Geri
                        </button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => canStep1 && setStep(2)}
                          disabled={!canStep1}
                          className={`flex-[2] h-[48px] rounded-[30px] flex items-center justify-center gap-2.5 transition-all duration-300 ${
                            canStep1
                              ? 'bg-white text-[#324D47] hover:bg-[#F4EBD1] cursor-pointer shadow-lg shadow-black/10'
                              : 'bg-white/10 text-white/30 cursor-not-allowed'
                          }`}
                        >
                          <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[14px]">Devam Et</span>
                        </motion.button>
                      </div>
                    </div>
                  </StepWrap>
                )}

                {step === 2 && (
                  <StepWrap key="step2">
                    <StepTitle icon={<Briefcase size={15} />} title="Talebin Özü" />
                    <div className="flex flex-col gap-4">
                      {/* Dil Seçimi — multi select */}
                      <FieldWrap icon={<Globe size={14} />} label="Hedef Dil(ler)">
                        <div className="relative" ref={langRef}>
                          <button
                            type="button"
                            onClick={() => setLangOpen(!langOpen)}
                            className={`${inputBase} text-left flex items-center justify-between cursor-pointer`}
                          >
                            <span className={selectedLanguages.length > 0 ? 'text-[#00000B] truncate pr-4 min-w-0' : 'text-[#686767] min-w-0'}>
                              {selectedLanguages.length > 0
                                ? selectedLanguages.map((id) => languages.find((l) => l.id === id)?.name).join(', ')
                                : 'Dil Seçiniz (çoklu)'}
                            </span>
                            <ChevronDown size={15} className={`text-[#686767] transition-transform duration-200 shrink-0 ${langOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {langOpen && (
                              <MultiDropdown
                                items={languages.map((l) => ({ id: l.id, label: l.name }))}
                                selected={selectedLanguages}
                                onToggle={toggleLanguage}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </FieldWrap>

                      {/* Eğitim Hedefi — chip multi-select */}
                      <FieldWrap icon={<GraduationCap size={14} />} label="Eğitim Hedefi (çoklu seçim)">
                        <div className="flex flex-wrap gap-2">
                          {trainingGoals.map((goal) => {
                            const active = selectedGoals.includes(goal);
                            return (
                              <button
                                key={goal}
                                type="button"
                                onClick={() => toggleGoal(goal)}
                                className={`max-w-full whitespace-normal leading-tight px-3.5 py-2 rounded-full text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] border transition-all duration-200 cursor-pointer ${
                                  active
                                    ? 'bg-white text-[#324D47] border-white shadow-md shadow-black/10'
                                    : 'bg-white/10 text-white/70 border-white/15 hover:bg-white/20 hover:border-white/30'
                                }`}
                              >
                                {active && <Check size={10} className="inline mr-1" />}
                                {goal}
                              </button>
                            );
                          })}
                        </div>
                      </FieldWrap>

                      {/* Katılımcı Sayısı */}
                      <FieldWrap icon={<Users size={14} />} label="Katılımcı Sayısı (tahmini)">
                        <div className="relative" ref={partRef}>
                          <button
                            type="button"
                            onClick={() => setParticipantsOpen(!participantsOpen)}
                            className={`${inputBase} text-left flex items-center justify-between cursor-pointer`}
                          >
                            <span className={participants ? 'text-[#00000B]' : 'text-[#686767]'}>
                              {participants || 'Aralık Seçiniz'}
                            </span>
                            <ChevronDown size={15} className={`text-[#686767] transition-transform duration-200 ${participantsOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {participantsOpen && (
                              <DropdownList
                                items={participantRanges.map((p) => ({ id: p, label: p }))}
                                selected={participants}
                                onSelect={(v) => { setParticipants(v); setParticipantsOpen(false); }}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </FieldWrap>

                      {/* Seviye Durumu */}
                      <FieldWrap icon={<GraduationCap size={14} />} label="Seviye Durumu">
                        <div className="relative" ref={levelRef}>
                          <button
                            type="button"
                            onClick={() => setLevelOpen(!levelOpen)}
                            className={`${inputBase} text-left flex items-center justify-between cursor-pointer`}
                          >
                            <span className={level ? 'text-[#00000B] truncate pr-4' : 'text-[#686767]'}>
                              {level || 'Seviye Seçiniz'}
                            </span>
                            <ChevronDown size={15} className={`text-[#686767] transition-transform duration-200 shrink-0 ${levelOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {levelOpen && (
                              <DropdownList
                                items={levelOptions.map((l) => ({ id: l, label: l }))}
                                selected={level}
                                onSelect={(v) => { setLevel(v); setLevelOpen(false); }}
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      </FieldWrap>

                      {/* Eğitim Modeli */}
                      <FieldWrap icon={<Monitor size={14} />} label="Eğitim Modeli">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {modelOptions.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setModel(m.id)}
                              className={`h-[44px] rounded-[30px] flex items-center justify-center gap-2 text-[12px] sm:text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] border transition-all duration-200 cursor-pointer ${
                                model === m.id
                                  ? 'bg-white text-[#324D47] border-white shadow-lg shadow-black/10'
                                  : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/20 hover:border-white/30'
                              }`}
                            >
                              {m.icon}
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </FieldWrap>

                      {/* KVKK */}
                      <button
                        type="button"
                        onClick={() => setKvkk(!kvkk)}
                        className="flex items-start gap-2.5 text-left group cursor-pointer mt-1"
                      >
                        <div
                          className={`w-4 h-4 mt-[2px] rounded-[4px] border flex items-center justify-center transition-all duration-200 shrink-0 ${
                            kvkk
                              ? 'bg-white border-white'
                              : 'bg-white/10 border-white/25 group-hover:border-white/50'
                          }`}
                        >
                          {kvkk && <Check size={10} className="text-[#324D47]" strokeWidth={3} />}
                        </div>
                        <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[12px] text-white/60 leading-relaxed">
                          <a
                            href={LEGAL_KVKK_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="underline decoration-white/25 cursor-pointer hover:text-white transition-colors"
                          >
                            KVKK Aydınlatma Metni
                          </a>'ni okudum ve kabul ediyorum.
                        </span>
                      </button>

                      {/* Nav */}
                      <div className="flex gap-3 mt-1">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex-1 h-[48px] rounded-[30px] border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] transition-all cursor-pointer"
                        >
                          Geri
                        </button>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={!canStep2}
                          className={`flex-[2] h-[48px] rounded-[30px] flex items-center justify-center gap-2.5 transition-all duration-300 ${
                            canStep2
                              ? 'bg-[#00000B] hover:bg-[#68232E] cursor-pointer shadow-lg shadow-black/20'
                              : 'bg-white/10 cursor-not-allowed'
                          }`}
                        >
                          <Send size={14} className="text-white" />
                          <span className={`font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] ${canStep2 ? 'text-white' : 'text-white/30'}`}>
                            Teklif Talebi Gönder
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </StepWrap>
                )}
              </AnimatePresence>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   WHY TEACHERA CARD
   ═══════════════════════════════════════════════════════════════════════ */
function WhyTeacheraCard() {
  const features = [
    { icon: <Globe size={14} />, text: '7 Dilde Kurumsal Eğitim' },
    { icon: <Users size={14} />, text: 'Native Speaker Eğitmenler' },
    { icon: <GraduationCap size={14} />, text: 'Özelleştirilmiş Metodoloji' },
    { icon: <FileCheck size={14} />, text: 'Standart Eğitim Kalitesi' },
    { icon: <Monitor size={14} />, text: 'Konya Merkezli Yüz Yüze & Online' },
    { icon: <Building2 size={14} />, text: 'Sektöre Göre Özelleştirilmiş Müfredat' },
  ];

  return (
    <div className="relative bg-[rgba(50,77,71,0.55)] backdrop-blur-xl rounded-[30px] border border-white/20 shadow-2xl shadow-black/20 overflow-hidden">
      <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 p-7 md:p-8">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-4 h-[1px] bg-white/40" />
            <span className="text-[10px] text-white/70 font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.25em] uppercase">
              Neden Teachera?
            </span>
            <div className="w-4 h-[1px] bg-white/40" />
          </div>
          <h3 className="font-['Neutraface_2_Text:Demi',sans-serif] text-[20px] text-white leading-tight">
            Kurumsal Avantajlar
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-3 min-w-0"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <span className="text-white/70">{f.icon}</span>
              </div>
              <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] text-white/80 leading-snug break-words">
                {f.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   DIRECT CONTACT CARD
   ═══════════════════════════════════════════════════════════════════════ */
function DirectContactCard() {
  return (
    <div className="relative bg-[rgba(50,77,71,0.35)] backdrop-blur-xl rounded-[30px] border border-white/15 shadow-xl shadow-black/10 overflow-hidden">
      <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 p-7 md:p-8 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Phone size={14} className="text-white/60" />
          </div>
          <div>
            <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[11px] text-white/40 uppercase tracking-wider">
              Kurumsal Satış
            </p>
            <a href="tel:03322368066" className="font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] text-white hover:text-[#F4EBD1] transition-colors">
              0332 236 80 66
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Mail size={14} className="text-white/60" />
          </div>
          <div>
            <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[11px] text-white/40 uppercase tracking-wider">
              E-posta
            </p>
            <a href="mailto:corporate@teachera.com.tr" className="font-['Neutraface_2_Text:Demi',sans-serif] text-[13px] text-white hover:text-[#F4EBD1] transition-colors break-all">
              corporate@teachera.com.tr
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <MapPin size={14} className="text-white/60" />
          </div>
          <div>
            <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[11px] text-white/40 uppercase tracking-wider">
              Merkez
            </p>
            <p className="font-['Neutraface_2_Text:Demi',sans-serif] text-[13px] text-white">
              Kule Plaza Kat: 26, Selçuklu – Konya
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */
function StepWrap({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
    >
      {children}
    </motion.div>
  );
}

function StepTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
        <span className="text-white/70">{icon}</span>
      </div>
      <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[15px] text-white">
        {title}
      </span>
    </div>
  );
}

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

function MultiDropdown({ items, selected, onToggle }: { items: { id: string; label: string }[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-[18px] shadow-xl shadow-black/20 border border-black/5 overflow-hidden z-30 max-h-[210px] overflow-y-auto"
    >
      {items.map((item) => {
        const isSelected = selected.includes(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={`w-full px-5 py-2.5 text-left text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] transition-colors flex items-center justify-between ${
              isSelected
                ? 'bg-[#324D47]/10 text-[#324D47]'
                : 'text-[#00000B] hover:bg-[#F4EBD1]/50'
            }`}
          >
            <span>{item.label}</span>
            {isSelected && <Check size={13} className="text-[#324D47]" />}
          </button>
        );
      })}
    </motion.div>
  );
}
