import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import {
  ArrowRight, ArrowUpRight, Clock, Sparkles,
  User, Calendar, Search, TrendingUp, BookOpen,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ARTICLE_SLUG_MAP } from './ArticleDetailPage';
import { openMailDraft } from './formMailto';
import mentalTranslationCollapseImage from '../../assets/blog/mental-translation-collapse.webp';
import targetLanguageThinkingImage from '../../assets/blog/target-language-thinking-techniques.webp';
import grammarTranslationFossilizationImage from '../../assets/blog/gramer-ceviri-fosillesme-dongusu.webp';

/* ═══════════════════════════════════════════════════════════════════════
   ARTICLE DATA — Academy İçerikleri
   ═══════════════════════════════════════════════════════════════════════ */
interface Article {
  id: number;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  author: string;
  date: string;
  featured?: boolean;
  trending?: boolean;
}

const articles: Article[] = [
  {
    id: 3,
    category: 'genel',
    title: 'Hedef Dilde Düşünmeyi Sağlayacak Teknikler',
    excerpt: 'Lexical chunks, massive input, direct association, circumlocution ve shadowing gibi tekniklerle çeviri refleksini zayıflatıp hedef dilde düşünme becerisi oluşturun.',
    image: targetLanguageThinkingImage,
    readTime: '10 dk',
    author: 'Teachera Akademik İçerik Ekibi',
    date: '28 Şub 2026',
    featured: true,
    trending: true,
  },
  {
    id: 5,
    category: 'genel',
    title: 'Yabancı Dil Ediniminde İletişimsel Felç',
    excerpt: 'Gramer-çeviri yöntemi, çeviri hastalığı ve fosilleşme döngüsünü nörobilişsel temelde inceleyen kapsamlı analiz.',
    image: grammarTranslationFossilizationImage,
    readTime: '11 dk',
    author: 'Teachera Akademik İçerik Ekibi',
    date: '28 Şub 2026',
    trending: true,
  },
  {
    id: 2,
    category: 'genel',
    title: 'Konuşma Akıcılığının Fiziksel ve İşitsel Çöküşü',
    excerpt: 'Bilişsel yükün konuşma ritmini nasıl bozduğunu, disfluency fenomenlerini ve zihinsel çevirinin dilsel doğallığı nasıl tahrip ettiğini bilimsel çerçevede inceleyin.',
    image: mentalTranslationCollapseImage,
    readTime: '12 dk',
    author: 'Teachera Akademik İçerik Ekibi',
    date: '28 Şub 2026',
    trending: true,
  },
  {
    id: 1,
    category: 'genel',
    title: 'Zihinsel Çeviri Tuzağı: Biliyoruz Ama Konuşamıyoruz',
    excerpt: 'Zihinsel çeviri alışkanlığının konuşma akıcılığını nasıl sabote ettiğini, neden kronik kaygı ürettiğini ve hedef dilde düşünme stratejileriyle nasıl kırılacağını öğrenin.',
    image: mentalTranslationCollapseImage,
    readTime: '8 dk',
    author: 'Teachera Uzman Ekibi',
    date: '27 Şub 2026',
    trending: true,
  },
];

const categories = [
  { id: 'hepsi', label: 'TÜMÜ' },
  { id: 'genel', label: 'DİL ÖĞRENİMİ' },
];

/* ═══════════════════════════════════════════════════════════════════════
   ACADEMY PAGE — Premium Editorial
   ═══════════════════════════════════════════════════════════════════════ */
export default function AcademyPage() {
  const [activeCategory, setActiveCategory] = useState('hepsi');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);
  const [newsletterFeedback, setNewsletterFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filtered = articles
    .filter((a) => activeCategory === 'hepsi' || a.category === activeCategory)
    .filter((a) =>
      searchQuery === '' ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const sorted = [...filtered].sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));
  const featuredArticle = sorted[0];
  const sidebarArticles = sorted.slice(1, 3);
  const gridArticles = sorted.slice(3);
  const trendingArticles = articles.filter((a) => a.trending);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();

  const handleNewsletterSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isNewsletterSubmitting) return;

    const email = newsletterEmail.trim();
    const isEmailValid = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isEmailValid) {
      setNewsletterFeedback({ type: 'error', text: 'Lütfen geçerli bir e-posta adresi giriniz veya alanı boş bırakınız.' });
      return;
    }

    setIsNewsletterSubmitting(true);
    setNewsletterFeedback(null);

    const sent = await openMailDraft({
      subject: 'Teachera Academy Bulten Abonelik Talebi',
      lines: [
        `E-posta: ${email || '-'}`,
        'Kaynak: Academy Bulten Formu',
      ],
    });

    if (sent) {
      setNewsletterFeedback({ type: 'success', text: 'Abonelik talebiniz alındı. Teşekkür ederiz.' });
      setNewsletterEmail('');
    } else {
      setNewsletterFeedback({ type: 'error', text: 'Abonelik talebi gönderilemedi. Lütfen tekrar deneyin.' });
    }

    setIsNewsletterSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F4EBD1] font-sans">

      {/* ═══════════════════════════════════════════════════════
          HERO MASTHEAD
          ═══════════════════════════════════════════════════════ */}
      <section className="relative bg-[#324D47] overflow-hidden">
        {/* Atmospheric layers */}
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bg-[#E70000] rounded-full mix-blend-multiply filter blur-[250px] opacity-[0.1] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[#F4EBD1] rounded-full mix-blend-multiply filter blur-[200px] opacity-[0.05] pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10 pt-36 md:pt-44 pb-28 lg:pb-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
            className="flex flex-col gap-10"
          >
            {/* Masthead copy */}
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="w-8 h-[1px] bg-[#E70000]" />
                <span className="text-[10px] text-[#ffffff]/50 font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.3em] uppercase">
                  Premium Dil Eğitim Platformu
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.7 }}
                className="text-[clamp(2rem,5vw,3.5rem)] font-['Neutraface_2_Text:Bold',sans-serif] text-white leading-[1.1] mb-6"
              >
                Dil öğrenimi, yeni bir{' '}
                <span className="relative inline-block">
                  düşünce yapısı
                  <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#E70000]/60 rounded-full" />
                </span>{' '}
                kazanmaktır.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-[#ffffff]/55 text-base md:text-lg font-['Neutraface_2_Text:Book',sans-serif] leading-relaxed max-w-xl"
              >
                Uzman içerikler, kültürel derinlik ve pratik stratejilerle dil yolculuğunuzu bir üst seviyeye taşıyın.
              </motion.p>
            </div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="max-w-md"
            >
              <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
                <Search size={17} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#ffffff]/25 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Makale ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full h-[48px] pl-12 pr-5 bg-[#ffffff]/[0.06] border border-[#ffffff]/10 rounded-full text-white text-[14px] font-['Neutraface_2_Text:Book',sans-serif] placeholder:text-[#ffffff]/25 focus:outline-none focus:border-[#ffffff]/25 focus:bg-[#ffffff]/[0.1] transition-all duration-300"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Curved bottom transition */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-[#F4EBD1] rounded-t-[48px] lg:rounded-t-[64px]" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          CONTENT
          ═══════════════════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-20 pb-28">

        {/* ── Trending Strip ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-4 mb-10 py-5 border-b border-[#324D47]/8 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="flex items-center gap-2 shrink-0">
            <TrendingUp size={14} className="text-[#E70000]" />
            <span className="text-[10px] text-[#E70000] font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.2em]">
              Trend
            </span>
          </div>
          <div className="w-[1px] h-4 bg-[#324D47]/10 shrink-0" />
          <div className="flex items-center gap-2">
            {trendingArticles.map((article, i) => (
              <span key={article.id} className="flex items-center gap-2 whitespace-nowrap">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-[#324D47]/20 shrink-0" />}
                <span
                  onClick={() => { const s = ARTICLE_SLUG_MAP[article.id]; if (s) navigate(`/academy/${s}`); }}
                  className="text-[12px] text-[#324D47]/70 font-['Neutraface_2_Text:Demi',sans-serif] hover:text-[#E70000] transition-colors cursor-pointer"
                >
                  {article.title}
                </span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Category Tabs ──────────────────────────── */}
        <div className="flex justify-start mb-14">
          <div className="flex items-center gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  relative px-5 py-2.5 rounded-full text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.1em] transition-all duration-300 whitespace-nowrap z-10 cursor-pointer
                  ${activeCategory === cat.id
                    ? 'text-[#ffffff]'
                    : 'text-[#324D47]/45 hover:text-[#324D47]/80 hover:bg-[#324D47]/[0.04]'
                  }
                `}
              >
                {activeCategory === cat.id && (
                  <motion.div
                    layoutId="activeAcademyPageTab"
                    className="absolute inset-0 bg-[#324D47] rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    style={{ zIndex: -1 }}
                  />
                )}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Articles ───────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + searchQuery}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            {filtered.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-[#324D47]/[0.06] flex items-center justify-center mb-5">
                  <Search size={24} className="text-[#324D47]/20" />
                </div>
                <p className="text-[#324D47]/35 font-['Neutraface_2_Text:Demi',sans-serif] text-lg mb-1">
                  Sonuç bulunamadı
                </p>
                <p className="text-[#324D47]/25 font-['Neutraface_2_Text:Book',sans-serif] text-sm">
                  Farklı bir arama terimi veya kategori deneyin.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-16">

                {/* ═══ EDITORIAL HERO — Featured + Sidebar ═══ */}
                {featuredArticle && (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
                    {/* Main Featured */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="lg:col-span-3 group cursor-pointer"
                      onClick={() => { const s = ARTICLE_SLUG_MAP[featuredArticle.id]; if (s) navigate(`/academy/${s}`); }}
                    >
                      <div className="relative h-[400px] md:h-[480px] lg:h-full lg:min-h-[520px] rounded-[28px] overflow-hidden bg-[#0a0a10]">
                        <ImageWithFallback
                          src={featuredArticle.image}
                          alt={featuredArticle.title}
                          className="w-full h-full object-cover opacity-85 transition-transform duration-[2s] ease-out group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#00000B] via-[#00000B]/30 to-transparent" />

                        {/* Content overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                          <div className="flex items-center gap-3 mb-5">
                            <span className="px-3 py-1 bg-[#E70000] text-white text-[9px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em] uppercase rounded-md">
                              Editörün Seçimi
                            </span>
                            <span className="px-3 py-1 bg-[#ffffff]/[0.08] backdrop-blur-md text-white/80 text-[9px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.15em] uppercase rounded-md border border-white/10">
                              {categories.find((c) => c.id === featuredArticle.category)?.label}
                            </span>
                          </div>

                          <h2 className="text-2xl md:text-4xl font-['Neutraface_2_Text:Bold',sans-serif] text-white leading-[1.1] mb-4 group-hover:translate-x-1 transition-transform duration-500">
                            {featuredArticle.title}
                          </h2>

                          <p className="text-white/65 text-sm md:text-base line-clamp-2 max-w-lg font-['Neutraface_2_Text:Book',sans-serif] leading-relaxed mb-6">
                            {featuredArticle.excerpt}
                          </p>

                          <div className="flex items-center gap-5 text-white/50 text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.15em]">
                            <span className="flex items-center gap-1.5"><User size={12} /> {featuredArticle.author}</span>
                            <span className="flex items-center gap-1.5"><Calendar size={12} /> {featuredArticle.date}</span>
                            <span className="flex items-center gap-1.5"><Clock size={12} /> {featuredArticle.readTime}</span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="absolute top-6 right-6 hidden md:flex">
                          <div className="w-12 h-12 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 group-hover:bg-[#E70000] group-hover:border-[#E70000] group-hover:text-white group-hover:rotate-45 transition-all duration-400">
                            <ArrowUpRight size={20} />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Sidebar — 2 stacked cards */}
                    {sidebarArticles.length > 0 && (
                      <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
                        {sidebarArticles.map((article, i) => (
                          <motion.div
                            key={article.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
                            className="group cursor-pointer flex-1"
                            onClick={() => { const s = ARTICLE_SLUG_MAP[article.id]; if (s) navigate(`/academy/${s}`); }}
                          >
                            <div className="relative h-full min-h-[240px] rounded-[24px] overflow-hidden bg-[#0a0a10]">
                              <ImageWithFallback
                                src={article.image}
                                alt={article.title}
                                className="w-full h-full object-cover opacity-80 transition-transform duration-[1.5s] ease-out group-hover:scale-[1.06]"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#00000B]/90 via-[#00000B]/30 to-transparent" />

                              <div className="absolute bottom-0 left-0 right-0 p-6">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="px-2.5 py-0.5 bg-[#ffffff]/[0.08] backdrop-blur-md text-white/70 text-[9px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.15em] uppercase rounded-md border border-white/10">
                                    {categories.find((c) => c.id === article.category)?.label}
                                  </span>
                                  {article.trending && (
                                    <span className="px-2 py-0.5 bg-[#E70000]/80 text-white text-[8px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-wider uppercase rounded-md flex items-center gap-1">
                                      <TrendingUp size={8} /> Trend
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-lg md:text-xl font-['Neutraface_2_Text:Bold',sans-serif] text-white leading-tight mb-2 group-hover:translate-x-0.5 transition-transform duration-500">
                                  {article.title}
                                </h3>

                                <div className="flex items-center gap-4 text-white/40 text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-wider">
                                  <span className="flex items-center gap-1"><Clock size={10} /> {article.readTime}</span>
                                  <span className="flex items-center gap-1"><User size={10} /> {article.author}</span>
                                </div>
                              </div>

                              {/* Subtle arrow */}
                              <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <ArrowUpRight size={16} className="text-white/60" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ═══ MAIN GRID ═══ */}
                {gridArticles.length > 0 && (
                  <>
                    {/* Section divider */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <BookOpen size={14} className="text-[#324D47]/30" />
                        <span className="text-[10px] text-[#324D47]/40 font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.25em] uppercase">
                          Tüm Yazılar
                        </span>
                      </div>
                      <div className="flex-1 h-[1px] bg-[#324D47]/8" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-10">
                      {gridArticles.map((article, index) => (
                        <motion.article
                          key={article.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-60px' }}
                          transition={{ delay: index * 0.06, duration: 0.5 }}
                          className="group cursor-pointer flex flex-col h-full"
                          onClick={() => { const s = ARTICLE_SLUG_MAP[article.id]; if (s) navigate(`/academy/${s}`); }}
                        >
                          {/* Image container */}
                          <div className="relative h-56 rounded-[20px] overflow-hidden mb-5 bg-[#324D47]/[0.04]">
                            <ImageWithFallback
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                            />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#00000B]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                            {/* Category badge */}
                            <div className="absolute top-4 left-4 flex items-center gap-2">
                              <span className="bg-white/95 backdrop-blur-md text-[#324D47] text-[9px] font-['Neutraface_2_Text:Demi',sans-serif] px-3 py-1.5 rounded-lg tracking-[0.1em] uppercase">
                                {categories.find((c) => c.id === article.category)?.label}
                              </span>
                              {article.trending && (
                                <span className="bg-[#E70000] text-white text-[8px] font-['Neutraface_2_Text:Demi',sans-serif] px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                                  <TrendingUp size={8} /> Trend
                                </span>
                              )}
                            </div>

                            {/* Hover arrow */}
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                              <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-[#324D47]">
                                <ArrowRight size={14} />
                              </div>
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-3 text-[10px] text-[#324D47]/35 font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.15em] mb-3">
                            <span>{article.date}</span>
                            <span className="w-[3px] h-[3px] rounded-full bg-[#324D47]/15" />
                            <span>{article.readTime}</span>
                          </div>

                          {/* Title */}
                          <h3 className="text-[19px] font-['Neutraface_2_Text:Bold',sans-serif] text-[#324D47] leading-[1.25] mb-3 group-hover:text-[#E70000] transition-colors duration-300">
                            {article.title}
                          </h3>

                          {/* Excerpt */}
                          <p className="text-[#324D47]/50 text-[13px] line-clamp-3 leading-relaxed font-['Neutraface_2_Text:Book',sans-serif] mb-5 flex-1">
                            {article.excerpt}
                          </p>

                          {/* Author */}
                          <div className="flex items-center gap-2.5 pt-4 border-t border-[#324D47]/[0.06]">
                            <div className="w-6 h-6 rounded-full bg-[#324D47]/[0.07] flex items-center justify-center">
                              <User size={10} className="text-[#324D47]/40" />
                            </div>
                            <span className="text-[11px] text-[#324D47]/40 font-['Neutraface_2_Text:Demi',sans-serif]">
                              {article.author}
                            </span>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ═══ Newsletter CTA ══════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mt-24 relative overflow-hidden rounded-[28px] bg-[#324D47]"
        >
          {/* Atmosphere */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-[#E70000] rounded-full mix-blend-multiply filter blur-[140px] opacity-[0.12] pointer-events-none" />

          <div className="relative z-10 p-10 md:p-14 flex flex-col lg:flex-row items-start lg:items-center gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-6 h-[1px] bg-[#E70000]/60" />
                <span className="text-[10px] text-white/40 font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.25em]">
                  Bülten
                </span>
              </div>
              <h3 className="text-2xl md:text-3xl font-['Neutraface_2_Text:Bold',sans-serif] text-white leading-tight mb-3">
                Yeni içeriklerden ilk siz haberdar olun
              </h3>
              <p className="text-white/45 font-['Neutraface_2_Text:Book',sans-serif] text-sm max-w-lg leading-relaxed">
                Her hafta uzman yazarlarımızdan dil öğrenimi, kültür ve kariyer üzerine seçilmiş içerikler doğrudan e-posta kutunuzda.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="w-full lg:w-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  placeholder="E-posta adresiniz"
                  className="h-[48px] px-6 bg-[#ffffff]/[0.06] border border-[#ffffff]/10 rounded-full text-white text-[13px] font-['Neutraface_2_Text:Book',sans-serif] placeholder:text-[#ffffff]/25 focus:outline-none focus:border-[#ffffff]/25 focus:bg-[#ffffff]/[0.1] transition-all w-full sm:w-[260px]"
                />
                <button
                  type="submit"
                  disabled={isNewsletterSubmitting}
                  className="h-[48px] px-7 bg-[#E70000] hover:bg-[#c40000] text-white rounded-full font-['Neutraface_2_Text:Demi',sans-serif] text-[13px] tracking-wide transition-all duration-300 shadow-lg shadow-[#E70000]/20 cursor-pointer whitespace-nowrap hover:shadow-[#E70000]/30 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isNewsletterSubmitting ? 'Gönderiliyor...' : 'Abone Ol'}
                </button>
              </div>
              {newsletterFeedback && (
                <p
                  className={`mt-3 text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] ${
                    newsletterFeedback.type === 'success' ? 'text-[#C4F7D9]' : 'text-[#FFD4D1]'
                  }`}
                >
                  {newsletterFeedback.text}
                </p>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
