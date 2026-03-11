import mentalTranslationCollapseImage from '../../assets/blog/mental-translation-collapse.webp';
import targetLanguageThinkingImage from '../../assets/blog/target-language-thinking-techniques.webp';
import grammarTranslationFossilizationImage from '../../assets/blog/gramer-ceviri-fosillesme-dongusu.webp';

export interface AcademyArticleSummary {
  id: number;
  slug: string;
  category: string;
  categoryLabel: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  author: string;
  date: string;
  featured?: boolean;
  trending?: boolean;
}

const CEVIRI_HASTALIGI_IMAGE =
  'https://images.unsplash.com/photo-1725190216145-ea1455fd9914?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

export const ACADEMY_ARTICLES: AcademyArticleSummary[] = [
  {
    id: 3,
    slug: 'hedef-dilde-dusunmeyi-saglayacak-teknikler',
    category: 'genel',
    categoryLabel: 'DİL ÖĞRENİMİ',
    title: 'Hedef Dilde Düşünmeyi Sağlayacak Teknikler',
    excerpt:
      'Lexical chunks, massive input, direct association, circumlocution ve shadowing gibi tekniklerle çeviri refleksini zayıflatıp hedef dilde düşünme becerisi oluşturun.',
    image: targetLanguageThinkingImage,
    readTime: '10 dk',
    author: 'Teachera Akademik İçerik Ekibi',
    date: '28 Şub 2026',
    featured: true,
    trending: true,
  },
  {
    id: 5,
    slug: 'iletisimsel-felc-gramer-ceviri-fosillesme-dongusu',
    category: 'genel',
    categoryLabel: 'DİL ÖĞRENİMİ',
    title: 'Yabancı Dil Ediniminde İletişimsel Felç',
    excerpt:
      'Gramer-çeviri yöntemi, çeviri hastalığı ve fosilleşme döngüsünü nörobilişsel temelde inceleyen kapsamlı analiz.',
    image: grammarTranslationFossilizationImage,
    readTime: '11 dk',
    author: 'Teachera Akademik İçerik Ekibi',
    date: '28 Şub 2026',
    trending: true,
  },
  {
    id: 2,
    slug: 'konusma-akiciliginin-fiziksel-ve-isitsel-cokusu',
    category: 'genel',
    categoryLabel: 'DİL ÖĞRENİMİ',
    title: 'Konuşma Akıcılığının Fiziksel ve İşitsel Çöküşü',
    excerpt:
      'Bilişsel yükün konuşma ritmini nasıl bozduğunu, disfluency fenomenlerini ve zihinsel çevirinin dilsel doğallığı nasıl tahrip ettiğini bilimsel çerçevede inceleyin.',
    image: mentalTranslationCollapseImage,
    readTime: '12 dk',
    author: 'Teachera Akademik İçerik Ekibi',
    date: '28 Şub 2026',
    trending: true,
  },
  {
    id: 1,
    slug: 'ceviri-hastaligi',
    category: 'genel',
    categoryLabel: 'DİL ÖĞRENİMİ',
    title: 'Zihinsel Çeviri Tuzağı: Biliyoruz Ama Konuşamıyoruz',
    excerpt:
      'Zihinsel çeviri alışkanlığının konuşma akıcılığını nasıl sabote ettiğini, neden kronik kaygı ürettiğini ve hedef dilde düşünme stratejileriyle nasıl kırılacağını öğrenin.',
    image: CEVIRI_HASTALIGI_IMAGE,
    readTime: '8 dk',
    author: 'Teachera Uzman Ekibi',
    date: '27 Şub 2026',
    trending: true,
  },
];

export const ACADEMY_ARTICLE_BY_SLUG = Object.fromEntries(
  ACADEMY_ARTICLES.map((article) => [article.slug, article]),
) as Record<string, AcademyArticleSummary>;

export const HOME_ACADEMY_SLUG_ORDER = [
  'hedef-dilde-dusunmeyi-saglayacak-teknikler',
  'iletisimsel-felc-gramer-ceviri-fosillesme-dongusu',
  'konusma-akiciliginin-fiziksel-ve-isitsel-cokusu',
  'ceviri-hastaligi',
];

export const HOME_ACADEMY_ARTICLES = HOME_ACADEMY_SLUG_ORDER.map(
  (slug) => ACADEMY_ARTICLE_BY_SLUG[slug],
).filter(Boolean);
