import { useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Clock, Sparkles, User, Calendar, ArrowUpRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import TeacheraLogo from '../../imports/TeacheraLogo';
import { useNavigate } from 'react-router';
import mentalTranslationCollapseImage from '../../assets/blog/mental-translation-collapse.webp';
import targetLanguageThinkingImage from '../../assets/blog/target-language-thinking-techniques.webp';
import grammarTranslationFossilizationImage from '../../assets/blog/gramer-ceviri-fosillesme-dongusu.webp';

interface Article {
  slug: string;
  category: string;
  categoryLabel: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  author: string;
  date: string;
}

const CEVIRI_HASTALIGI_IMAGE =
  'https://images.unsplash.com/photo-1725190216145-ea1455fd9914?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

/* ── Ana sayfada gösterilen Academy seçkisi (1 editör + 3 yazı) ── */
const pickedArticles: Article[] = [
  {
    slug: 'hedef-dilde-dusunmeyi-saglayacak-teknikler', category: 'genel', categoryLabel: 'DİL ÖĞRENİMİ',
    title: 'Hedef Dilde Düşünmeyi Sağlayacak Teknikler',
    excerpt: 'Çeviri refleksini kırmak için lexical chunks, direct association, shadowing ve constrained output stratejileriyle günlük bir uygulama planı kurun.',
    image: targetLanguageThinkingImage,
    readTime: '10 dk', author: 'Teachera Akademik İçerik Ekibi', date: '28 Şub 2026',
  },
  {
    slug: 'iletisimsel-felc-gramer-ceviri-fosillesme-dongusu', category: 'genel', categoryLabel: 'DİL ÖĞRENİMİ',
    title: 'Yabancı Dil Ediniminde İletişimsel Felç',
    excerpt: 'Gramer-çeviri yöntemi, çeviri hastalığı ve fosilleşme döngüsünün akıcılığı nasıl kilitlediğini bilimsel çerçevede inceleyin.',
    image: grammarTranslationFossilizationImage,
    readTime: '11 dk', author: 'Teachera Akademik İçerik Ekibi', date: '28 Şub 2026',
  },
  {
    slug: 'konusma-akiciliginin-fiziksel-ve-isitsel-cokusu', category: 'genel', categoryLabel: 'DİL ÖĞRENİMİ',
    title: 'Konuşma Akıcılığının Fiziksel ve İşitsel Çöküşü',
    excerpt: 'Bilişsel yükün ses, ritim ve beden dilini nasıl kilitlediğini; disfluency ve işlemleme darboğazları üzerinden inceleyin.',
    image: mentalTranslationCollapseImage,
    readTime: '12 dk', author: 'Teachera Akademik İçerik Ekibi', date: '28 Şub 2026',
  },
  {
    slug: 'ceviri-hastaligi', category: 'genel', categoryLabel: 'DİL ÖĞRENİMİ',
    title: 'Zihinsel Çeviri Tuzağı: Biliyoruz Ama Konuşamıyoruz',
    excerpt: 'Zihinsel çeviri alışkanlığının akıcılığı nasıl sabote ettiğini ve hedef dilde düşünme geçişini adım adım keşfedin.',
    image: CEVIRI_HASTALIGI_IMAGE,
    readTime: '8 dk', author: 'Teachera Uzman Ekibi', date: '27 Şub 2026',
  },
];

export default function Academy() {
  const ref = useRef(null);
  const navigate = useNavigate();

  const featured = pickedArticles[0];
  const grid = pickedArticles.slice(1, 4);
  const goToFeatured = () => navigate(`/academy/${featured.slug}`);

  return (
    <section id="academy" ref={ref} className="relative bg-[#F4EBD1] font-sans">

      {/* ═══ GREEN HEADER — Compact & Premium ═══ */}
      <div className="bg-[#324D47] relative pt-14 pb-20 lg:pb-24 overflow-hidden rounded-b-[32px] lg:rounded-b-[48px] shadow-xl z-10">
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="absolute -top-20 right-0 w-[500px] h-[500px] bg-[#E70000] rounded-full mix-blend-multiply filter blur-[180px] opacity-[0.1] pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            {/* Brand lockup row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#ffffff]/8 pb-5">
              <div className="flex items-center gap-3 md:gap-5 h-9">
                <div
                  className="w-[120px] h-[24px] md:w-[140px] md:h-[28px] relative"
                  style={{ '--fill-0': '#F4EBD1' } as React.CSSProperties}
                >
                  <TeacheraLogo />
                </div>
                <div className="hidden md:block h-5 w-[1px] bg-[#ffffff]/20" />
                <span className="text-lg md:text-xl font-['Neutraface_2_Text:Bold',sans-serif] text-[#E70000] tracking-[0.2em] uppercase leading-none">
                  ACADEMY
                </span>
              </div>

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#ffffff]/[0.04] border border-[#ffffff]/8 rounded-full">
                <Sparkles size={11} className="text-[#E70000]" />
                <span className="text-[9px] text-[#ffffff]/60 font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.2em]">
                  Premium Dil Eğitim Platformu
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-[#ffffff]/55 text-sm md:text-base font-['Neutraface_2_Text:Book',sans-serif] max-w-xl leading-relaxed">
              Dil öğrenimi, sadece kelime ezberlemek değil; yeni bir düşünce yapısı kazanmaktır.
              <span className="text-[#E70000] ml-1 font-['Neutraface_2_Text:Demi',sans-serif]">Teachera Academy</span> ile kültürel kodları çözün.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ═══ CONTENT — 1 Featured + 3 Grid ═══ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-20 -mt-12 pb-10 md:pb-16">

        <div className="flex flex-col gap-6">

          {/* ── FEATURED ARTICLE ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full group cursor-pointer"
            onClick={goToFeatured}
          >
            <div className="relative rounded-[24px] overflow-hidden bg-[#0a0a10] shadow-lg shadow-[#324D47]/10 hover:shadow-xl hover:shadow-[#324D47]/15 transition-shadow duration-500">
              <div className="relative h-[210px] sm:h-[260px] md:h-[380px] bg-[#06070C]">
                <ImageWithFallback
                  src={featured.image}
                  alt={featured.title}
                  className="w-full h-full object-contain md:object-cover object-center opacity-90 transition-transform duration-[2s] ease-out md:group-hover:scale-[1.04]"
                  loading="lazy"
                  decoding="async"
                />
                <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#00000B] via-[#00000B]/30 to-transparent" />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#E70000] text-white text-[9px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.15em] uppercase rounded-md">
                    Editörün Seçimi
                  </span>
                  <span className="px-2.5 py-0.5 bg-white/[0.08] backdrop-blur-md text-white/70 text-[9px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.12em] uppercase rounded-md border border-white/10">
                    {featured.categoryLabel}
                  </span>
                </div>

                <div className="hidden md:flex absolute bottom-0 left-0 p-6 md:p-9 w-full md:w-3/4 flex-col items-start gap-2.5">
                  <h2 className="text-2xl md:text-4xl font-['Neutraface_2_Text:Bold',sans-serif] text-white leading-[1.1]">
                    {featured.title}
                  </h2>
                  <p className="text-white/60 text-sm md:text-base line-clamp-2 max-w-lg font-['Neutraface_2_Text:Book',sans-serif] leading-relaxed">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center gap-5 text-white/40 text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.12em] mt-1">
                    <span className="flex items-center gap-1.5"><User size={11} /> {featured.author}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={11} /> {featured.date}</span>
                    <span className="flex items-center gap-1.5"><Clock size={11} /> {featured.readTime}</span>
                  </div>
                </div>

                <div className="absolute top-5 right-5 hidden md:flex">
                  <div className="w-11 h-11 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 group-hover:bg-[#E70000] group-hover:border-[#E70000] group-hover:text-white group-hover:rotate-45 transition-all duration-300">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>

              <div className="md:hidden p-5">
                <h2 className="text-[1.05rem] sm:text-[1.15rem] font-['Neutraface_2_Text:Bold',sans-serif] text-white leading-[1.2] mb-2">
                  {featured.title}
                </h2>
                <p
                  className="text-white/62 text-[12px] sm:text-[13px] font-['Neutraface_2_Text:Book',sans-serif] leading-relaxed mb-3"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-3 text-white/45 text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.1em]">
                  <span className="flex items-center gap-1"><Calendar size={10} /> {featured.date}</span>
                  <span className="w-[3px] h-[3px] rounded-full bg-white/30" />
                  <span className="flex items-center gap-1"><Clock size={10} /> {featured.readTime}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── 3 SMALL CARDS ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {grid.map((article, index) => (
              <motion.article
                key={article.slug}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="group flex flex-col bg-white rounded-[20px] overflow-hidden shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[#324D47]/[0.04] hover:-translate-y-1 cursor-pointer md:h-full"
                onClick={() => navigate(`/academy/${article.slug}`)}
              >
                <div className="h-[150px] sm:h-[170px] md:h-40 overflow-hidden relative bg-[#0a0a10]">
                  <ImageWithFallback
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-contain md:object-cover object-center transition-transform duration-700 ease-out md:group-hover:scale-[1.06]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/95 backdrop-blur-md text-[#324D47] text-[9px] font-['Neutraface_2_Text:Demi',sans-serif] px-2.5 py-1 rounded-md tracking-[0.1em] uppercase">
                      {article.categoryLabel}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col p-4 md:p-5">
                  <div className="flex items-center gap-2.5 text-[9px] text-[#324D47]/35 font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.12em] mb-2">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {article.date}</span>
                    <span className="w-[3px] h-[3px] rounded-full bg-[#324D47]/15" />
                    <span className="flex items-center gap-1"><Clock size={10} /> {article.readTime}</span>
                  </div>

                  <h3 className="text-[15px] md:text-[16px] font-['Neutraface_2_Text:Bold',sans-serif] text-[#324D47] leading-[1.25] mb-2 group-hover:text-[#E70000] transition-colors duration-300">
                    {article.title}
                  </h3>

                  <p
                    className="text-[#324D47]/50 text-[11px] md:text-[12px] leading-relaxed font-['Neutraface_2_Text:Book',sans-serif] mb-3 md:mb-4"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {article.excerpt}
                  </p>

                  <div className="hidden md:flex items-center justify-between border-t border-[#324D47]/[0.06] pt-3 mt-auto">
                    <span className="text-[10px] text-[#324D47]/40 font-['Neutraface_2_Text:Demi',sans-serif] flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#324D47]/[0.06] flex items-center justify-center">
                        <User size={9} className="text-[#324D47]/40" />
                      </div>
                      {article.author}
                    </span>
                    <span className="text-[#E70000] opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* CTA */}
          <div className="flex justify-center mt-0 md:mt-2">
            <button
              onClick={() => navigate('/academy')}
              className="group px-7 py-2.5 bg-white border border-[#324D47]/8 rounded-full text-[#324D47] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.15em] uppercase overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#324D47]/15 cursor-pointer"
            >
              <span className="group-hover:text-[#E70000] transition-colors">Academy Sayfasına Git</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
