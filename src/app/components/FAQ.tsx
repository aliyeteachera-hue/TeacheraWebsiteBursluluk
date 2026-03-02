import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';
import { Plus, Minus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLevelAssessment } from './LevelAssessmentContext';

/* ═══════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */
type CategoryId = 'genel' | 'metod' | 'surec';

interface FAQAction {
  label: string;
  href?: string;
  type?: 'route' | 'level-assessment';
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
      'Evet. Ücretsiz deneme seansı talebinizi aşağıdaki buton üzerinden hızlıca iletebilirsiniz.',
    action: { label: 'Ücretsiz Deneme Seansı Al', href: '/iletisim' },
  },
  {
    id: 4,
    category: 'genel',
    question: 'Seviyemizi nasıl öğrenebiliriz?',
    answer:
      'Aşağıdaki butondan yazılı seviye tespit sınavını hemen başlatabilir ve seviyenizi öğrenebilirsiniz. Kesin sonuç sözlü mülakat sonrası belirlenir.',
    action: { label: 'Seviye Tespit Sınavına Başla', type: 'level-assessment' },
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
    action: { label: 'Ücretsiz Deneme Seansı Al', href: '/iletisim' },
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
    action: { label: 'Ücretsiz Deneme Seansı Al', href: '/iletisim' },
  },
  {
    id: 7,
    category: 'metod',
    question: 'Tüm dersler konuşma üzerine mi kurulu?',
    answer:
      "Derslerin %85'i konuşma pratiğiyle geçer. Ancak bu sadece serbest sohbet değil; bilimsel ve sistematik bir yöntemle yapılandırılmış derslerdir. Okuma, yazma, anlama ve konuşma becerileri bir bütün olarak geliştirilir.",
    action: { label: 'Ücretsiz Deneme Seansı Al', href: '/iletisim' },
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
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('genel');
  const [openId, setOpenId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { open: openLevelAssessment } = useLevelAssessment();

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

                          {faq.action && (
                            <div className="mt-4">
                              <button
                                type="button"
                                onClick={() => {
                                  if (faq.action?.type === 'level-assessment') {
                                    openLevelAssessment('faq_level_assessment');
                                    return;
                                  }
                                  if (faq.action?.href) {
                                    navigate(faq.action.href);
                                  }
                                }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#324D47]/20 text-[#324D47] hover:border-[#324D47]/40 hover:bg-[#324D47]/[0.03] font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-wide transition-all"
                              >
                                <ArrowRight size={13} />
                                {faq.action.label}
                              </button>
                            </div>
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
