import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Minus, ArrowRight, User, Phone, Mail, Calendar, Globe, ChevronDown, Check, Send, Sparkles, Play } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ageRanges, getLanguagesForAge } from './ageLanguageMap';
import { openMailDraft } from './formMailto';
import { isValidTrMobilePhone, normalizeTrMobileInput, TR_MOBILE_PATTERN, TR_MOBILE_TITLE } from './phoneUtils';

/* ═══════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */
type CategoryId = 'genel' | 'metod' | 'surec';

type FAQActionType = 'free-trial' | 'level-test';

interface FAQAction {
  label: string;
  type: FAQActionType;
  inline?: boolean; // true → form açık gelir, false → butona basınca açılır
}

interface FAQItem {
  id: number;
  category: CategoryId;
  question: string;
  answer: string;
  action?: FAQAction;
}

const categories: { id: CategoryId; label: string }[] = [
  { id: 'genel', label: 'Genel' },
  { id: 'metod', label: 'Metod' },
  { id: 'surec', label: 'Süreç' },
];

const faqs: FAQItem[] = [
  // GENEL
  {
    id: 1,
    category: 'genel',
    question: 'Öğrenmek istediğim dili hiç bilmiyorum. Eğitimlerinize katılabilir miyim?',
    answer:
      'Evet, herhangi bir dil altyapısına sahip olmanız gerekmez. Dersler oldukça basit yapılarla başlar; kendinizi öğretmeninize teslim ettiğinizde nasıl öğrendiğinizi siz de fark edeceksiniz.',
  },
  {
    id: 3,
    category: 'genel',
    question: 'Ücretsiz deneme seansına katılabilir miyim?',
    answer:
      'Evet. Aşağıdaki formu doldurarak ücretsiz seansımıza katılabilirsiniz. Size özel bir kullanıcı adı oluşturulacak ve e-posta adresinize gönderilecektir.',
    action: { label: 'Ücretsiz Deneme Seansı Al', type: 'free-trial', inline: true },
  },
  {
    id: 4,
    category: 'genel',
    question: 'Seviyemizi nasıl öğrenebiliriz?',
    answer:
      'Aşağıdaki formu doldurarak yazılı sınavı hemen başlatabilir ve seviyenizi öğrenebilirsiniz. Kesin sonuç sözlü mülakat sonrası belirlenir.',
    action: { label: 'Seviye Tespit Sınavına Başla', type: 'level-test', inline: true },
  },
  {
    id: 15,
    category: 'genel',
    question: 'Materyalleri nasıl temin edebilirim?',
    answer:
      'Eğitim paketi satın alındıktan sonra, seviyenize uygun kitap ve materyaller sisteminize tanımlanır. Tüm kitaplara, egzersizlere ve MP3 dosyalarına çevrim içi olarak erişebilirsiniz.',
  },
  {
    id: 16,
    category: 'genel',
    question: 'Eğitim sonunda sertifika alabiliyor muyuz?',
    answer:
      'Evet, eğitiminizi tamamladıktan sonra ulaştığınız seviyeye göre dijital sertifika verilir.',
  },
  {
    id: 17,
    category: 'genel',
    question: 'Eğitim türleri arasında geçiş yapabilir miyim?',
    answer:
      'Evet, birebir eğitimden grup eğitimine veya farklı bir dile geçiş yapabilirsiniz. Bu tür değişiklikler için eğitim danışmanlarımızla iletişime geçmeniz yeterlidir.',
  },
  // METOD
  {
    id: 2,
    category: 'metod',
    question: 'Derslerde Türkçe kullanılmıyor, nasıl anlayacağız?',
    answer:
      'Eğitmenlerimiz metodoloji eğitimlerine tabidir. Derslerde beden dili, illüstrasyonlar ve görsel materyaller yoğun olarak kullanılır. Bu sayede anadil kullanımından uzak durularak "öğrenme engelleri" önlenir.',
    action: { label: 'Ücretsiz Deneme Seansı Al', type: 'free-trial' },
  },
  {
    id: 5,
    category: 'metod',
    question: 'Eğitimler sadece native speaker\'lar tarafından mı veriliyor?',
    answer:
      'Hayır. Tüm eğitmenler native speaker olmayabilir; ancak hepsi öğrettiği dili ana dili seviyesinde konuşabilen, profesyonel, deneyimli ve metodoloji eğitimi almış öğretmenlerdir.',
  },
  {
    id: 6,
    category: 'metod',
    question: 'Eğitmenlerinizin yeterliliğinden nasıl emin olabilirim?',
    answer:
      'Eğitmenlerimiz dil öğretmenliği, metodoloji ve dil bilimi gibi alanlarda eğitim almış, deneyim sahibidir. Ayrıca sürekli olarak bilgi ve becerilerini geliştirmek için iç eğitimlere tabidirler.',
    action: { label: 'Ücretsiz Deneme Seansı Al', type: 'free-trial' },
  },
  {
    id: 7,
    category: 'metod',
    question: 'Tüm dersler konuşma üzerine mi kurulu?',
    answer:
      "Derslerin %85'i konuşma pratiğiyle geçer. Ancak bu sadece serbest sohbet değil; bilimsel ve sistematik bir yöntemle yapılandırılmış derslerdir. Okuma, yazma, anlama ve konuşma becerileri bir bütün olarak geliştirilir.",
    action: { label: 'Ücretsiz Deneme Seansı Al', type: 'free-trial' },
  },
  // SÜREÇ
  {
    id: 8,
    category: 'surec',
    question: 'Grup eğitiminde katılımcılar nasıl seçiliyor?',
    answer:
      'Katılımcılar dil seviyeleri, yaş grupları ve aldıkları eğitim paketlerine göre gruplanır. Böylece her grup benzer ihtiyaçlara sahip bireylerden oluşur.',
  },
  {
    id: 9,
    category: 'surec',
    question: 'Birebir eğitim paketi aldıktan sonra süreç nasıl ilerler?',
    answer:
      'Eğitim danışmanlarımız size uygun gün ve saatlere göre bir ders planı oluşturur ve eğitim hemen başlatılır.',
  },
  {
    id: 10,
    category: 'surec',
    question: 'Grup eğitim paketi aldıktan sonra süreç nasıl ilerler?',
    answer:
      'Kullanıcı adınız e-posta ile size gönderilir. Şifrenizi oluşturarak sisteme giriş yaptıktan sonra yazılı seviye tespit sınavını tamamlamanız gerekir. Grup sayısı tamamlandığında dersler planlanır ve eğitim başlar.',
  },
  {
    id: 11,
    category: 'surec',
    question: 'Grup ders saatleri nasıl ayarlanır?',
    answer:
      'Tüm katılımcıların uygun olduğu saatler dikkate alınarak haftada 3 gün, her gün 2 ders saati olacak şekilde planlama yapılır.',
  },
  {
    id: 12,
    category: 'surec',
    question: 'Birebir eğitimlerde ders saatleri nasıl belirlenir?',
    answer: 'Müsait olduğunuz gün ve saatlere göre esnek bir şekilde ders planlaması yapılır.',
  },
  {
    id: 13,
    category: 'surec',
    question: 'Grup dersleri ertelenebilir mi?',
    answer: 'Hayır, grup dersleri belirlenen plana göre yapılır ve ertelenemez.',
  },
  {
    id: 14,
    category: 'surec',
    question: 'Birebir derslerde erteleme mümkün mü?',
    answer:
      'Evet, en az 24 saat önceden haber verilmesi koşuluyla ertelenebilir. Ancak aynı dersi 10 gün içinde telafi edecek şekilde yeniden planlamanız gerekir.',
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   INLINE FORM — Compact form embedded inside FAQ accordion
   ═══════════════════════════════════════════════════════════════════════ */
const inputBase =
  "w-full h-[40px] bg-[#09090F]/[0.02] rounded-full px-4 text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#09090F]/25 outline-none border border-[#09090F]/[0.05] cursor-not-allowed";

function InlineForm({ type, faqId }: { type: FAQActionType; faqId: number }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', age: '', language: '' });
  const [ageOpen, setAgeOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const ageRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  /* close dropdowns on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ageRef.current && !ageRef.current.contains(e.target as Node)) setAgeOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const availableLanguages = formData.age ? getLanguagesForAge(formData.age) : [];
  const selectedLanguageLabel = availableLanguages.find((language) => language.id === formData.language)?.name || '';
  const isPhoneValid = isValidTrMobilePhone(formData.phone);
  const allFilled = formData.fullName && isPhoneValid && formData.email && formData.age && formData.language;

  const handleSubmit = async () => {
    if (!allFilled) return;

    if (type === 'level-test') {
      const sent = await openMailDraft({
        subject: 'Seviye Tespit Talebi',
        lines: [
          `Ad Soyad: ${formData.fullName}`,
          `Telefon: +90 ${formData.phone}`,
          `E-posta: ${formData.email}`,
          `Yas Araligi: ${formData.age}`,
          `Dil: ${selectedLanguageLabel || formData.language}`,
          `Kaynak: FAQ Inline Form #${faqId}`,
        ],
      });

      if (!sent) {
        window.alert('Talebiniz gönderilemedi. Lütfen tekrar deneyin.');
        return;
      }

      navigate(`/seviye-tespit-sinavi?age=${encodeURIComponent(formData.age)}&lang=${encodeURIComponent(formData.language)}`);
      return;
    }

    const sent = await openMailDraft({
      subject: 'Ücretsiz Deneme Seansı Talebi',
      lines: [
        `Ad Soyad: ${formData.fullName}`,
        `Telefon: +90 ${formData.phone}`,
        `E-posta: ${formData.email}`,
        `Yas Araligi: ${formData.age}`,
        `Dil: ${selectedLanguageLabel || formData.language}`,
        `Kaynak: FAQ Inline Form #${faqId}`,
      ],
    });

    if (sent) {
      window.alert('Talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.');
      setFormData({ fullName: '', phone: '', email: '', age: '', language: '' });
    } else {
      window.alert('Talebiniz gönderilemedi. Lütfen tekrar deneyin.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="mt-5 p-5 bg-white rounded-2xl border border-[#09090F]/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
    >
      {/* title row */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 rounded-full bg-[#324D47]/10 flex items-center justify-center">
          {type === 'free-trial' ? <Play size={9} className="text-[#324D47] ml-0.5" /> : <Sparkles size={9} className="text-[#324D47]" />}
        </div>
        <span className="text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47] tracking-[0.08em]">
          {type === 'free-trial' ? 'DENEME SEANSI FORMU' : 'SEVIYE TESPIT SINAVI'}
        </span>
      </div>

      {/* fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Full Name */}
        <div className="relative">
          <User size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#09090F]/15" />
          <input
            type="text"
            placeholder="Ad Soyad"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className={`${inputBase} !pl-10 !cursor-text !text-[#09090F]/70 focus:border-[#324D47]/30`}
          />
        </div>

        {/* Phone */}
        <div className="relative">
          <Phone size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#09090F]/15" />
          <input
            type="tel"
            placeholder="Telefon"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: normalizeTrMobileInput(e.target.value) })}
            inputMode="numeric"
            maxLength={13}
            pattern={TR_MOBILE_PATTERN}
            title={TR_MOBILE_TITLE}
            className={`${inputBase} !pl-10 !cursor-text !text-[#09090F]/70 focus:border-[#324D47]/30`}
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#09090F]/15" />
          <input
            type="email"
            placeholder="E-posta"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`${inputBase} !pl-10 !cursor-text !text-[#09090F]/70 focus:border-[#324D47]/30`}
          />
        </div>

        {/* Age Range — custom dropdown */}
        <div className="relative" ref={ageRef}>
          <Calendar size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#09090F]/15 z-10" />
          <button
            type="button"
            onClick={() => { setAgeOpen(!ageOpen); setLangOpen(false); }}
            className={`${inputBase} !pl-10 !cursor-pointer text-left flex items-center justify-between ${formData.age ? '!text-[#09090F]/70' : ''}`}
          >
            <span className="truncate">{formData.age || 'Yaş Aralığı'}</span>
            <ChevronDown size={13} className={`text-[#09090F]/20 transition-transform duration-200 ${ageOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {ageOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute z-30 top-[calc(100%+4px)] left-0 right-0 bg-white rounded-xl border border-[#09090F]/[0.06] shadow-lg py-1 max-h-[180px] overflow-y-auto"
              >
                {ageRanges.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, age: range, language: '' });
                      setAgeOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-[12px] font-['Neutraface_2_Text:Book',sans-serif] transition-colors cursor-pointer ${
                      formData.age === range
                        ? 'text-[#324D47] bg-[#324D47]/[0.04]'
                        : 'text-[#09090F]/50 hover:bg-[#09090F]/[0.02]'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      {range}
                      {formData.age === range && <Check size={12} className="text-[#324D47]" />}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Language — custom dropdown */}
        <div className="relative sm:col-span-2" ref={langRef}>
          <Globe size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#09090F]/15 z-10" />
          <button
            type="button"
            onClick={() => {
              if (!formData.age) return;
              setLangOpen(!langOpen);
              setAgeOpen(false);
            }}
            className={`${inputBase} !pl-10 text-left flex items-center justify-between ${!formData.age ? 'opacity-50' : '!cursor-pointer'} ${formData.language ? '!text-[#09090F]/70' : ''}`}
          >
            <span className="truncate">{formData.language || (formData.age ? 'Dil Seçin' : 'Önce yaş aralığı seçin')}</span>
            <ChevronDown size={13} className={`text-[#09090F]/20 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {langOpen && availableLanguages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute z-30 top-[calc(100%+4px)] left-0 right-0 bg-white rounded-xl border border-[#09090F]/[0.06] shadow-lg py-1 max-h-[180px] overflow-y-auto"
              >
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, language: lang.id });
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-[12px] font-['Neutraface_2_Text:Book',sans-serif] transition-colors cursor-pointer ${
                      formData.language === lang.id
                        ? 'text-[#324D47] bg-[#324D47]/[0.04]'
                        : 'text-[#09090F]/50 hover:bg-[#09090F]/[0.02]'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      {lang.name}
                      {formData.language === lang.id && <Check size={12} className="text-[#324D47]" />}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allFilled}
        className={`w-full h-[42px] rounded-full text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.05em] flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
          allFilled
            ? 'bg-[#324D47] text-white hover:bg-[#3d5e56]'
            : 'bg-[#09090F]/[0.04] text-[#09090F]/20 cursor-not-allowed'
        }`}
      >
        <Send size={12} />
        {type === 'free-trial' ? 'Deneme Seansı Talep Et' : 'Sınava Başla'}
      </button>
    </motion.div>
  );
}

/* ─── FAQ ACTION AREA — wrapper that handles inline vs toggle mode ────── */
function FAQActionArea({ action, faqId }: { action: FAQAction; faqId: number }) {
  const [showForm, setShowForm] = useState(false);

  // inline: true → form doğrudan gösterilir
  if (action.inline) {
    return <InlineForm type={action.type} faqId={faqId} />;
  }

  // inline: false → toggle buton
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.04em] transition-all duration-300 cursor-pointer border ${
          showForm
            ? 'bg-[#324D47] text-white border-[#324D47]'
            : 'bg-white text-[#324D47] border-[#324D47]/20 hover:border-[#324D47]/40'
        }`}
      >
        {showForm ? <Minus size={10} /> : <Plus size={10} />}
        {action.label}
      </button>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
          >
            <InlineForm type={action.type} faqId={faqId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('genel');
  const [openId, setOpenId] = useState<number | null>(null);
  const navigate = useNavigate();

  const filtered = useMemo(
    () => faqs.filter((f) => f.category === activeCategory),
    [activeCategory],
  );

  const toggle = (id: number) => setOpenId(openId === id ? null : id);

  return (
    <section id="faq" className="py-16 md:py-20 bg-[#FAFAF8] relative">
      {/* top rule */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#09090F]/[0.06] to-transparent" />

      <div className="max-w-[760px] mx-auto px-6">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-[2px] w-6 bg-[#E70000]" />
            <span className="text-[#E70000] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] uppercase">
              Merak Ettikleriniz
            </span>
          </div>
          <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#09090F] text-[1.4rem] md:text-[1.8rem] leading-[1.15]">
            Sıkça Sorulan <span className="text-[#09090F]/20">Sorular.</span>
          </h2>
        </motion.div>

        {/* ── Category pills ── */}
        <div className="flex items-center gap-1.5 mb-8">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setOpenId(null);
                }}
                className={`px-4 py-2 rounded-full text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] transition-all duration-300 cursor-pointer border ${
                  isActive
                    ? 'bg-[#324D47] text-white border-[#324D47]'
                    : 'bg-white text-[#09090F]/40 border-[#09090F]/[0.07] hover:border-[#324D47]/25 hover:text-[#324D47]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ── Accordion ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="divide-y divide-[#09090F]/[0.05]"
          >
            {filtered.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div key={faq.id} className="group">
                  <button
                    onClick={() => toggle(faq.id)}
                    className="w-full flex items-start justify-between gap-4 py-5 text-left cursor-pointer"
                  >
                    <span
                      className={`font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] md:text-[15px] leading-[1.5] transition-colors duration-300 ${
                        isOpen
                          ? 'text-[#324D47]'
                          : 'text-[#09090F]/70 group-hover:text-[#09090F]'
                      }`}
                    >
                      {faq.question}
                    </span>
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 mt-0.5 ${
                        isOpen
                          ? 'bg-[#324D47]/10 text-[#324D47]'
                          : 'bg-[#09090F]/[0.03] text-[#09090F]/25 group-hover:text-[#09090F]/40'
                      }`}
                    >
                      {isOpen ? <Minus size={12} /> : <Plus size={12} />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-5 pr-10">
                          <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/50 text-[13px] md:text-[14px] leading-[1.75]">
                            {faq.answer}
                          </p>

                          {/* Inline Form */}
                          {faq.action && (
                            <FAQActionArea action={faq.action} faqId={faq.id} />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* ── Bottom CTA ── */}
        <div className="mt-10 pt-8 border-t border-[#09090F]/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F]/30 text-[13px]">
            Aradığınız cevabı bulamadınız mı?
          </p>
          <button
            onClick={() => navigate('/iletisim')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#324D47] text-white rounded-full text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] hover:bg-[#3d5e56] transition-colors cursor-pointer"
          >
            Danışmana Sor
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </section>
  );
}
