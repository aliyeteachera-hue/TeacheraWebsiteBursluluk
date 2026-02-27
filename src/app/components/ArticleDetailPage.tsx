import { useEffect, useMemo, useRef } from 'react';
import { motion, useScroll, useSpring, useInView } from 'motion/react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { EDITORIAL_SEEDS } from './articleEditorialSeeds';

const DEFAULT_OG_IMAGE = 'https://teachera.com.tr/favicon-32x32.png';

/* ═══════════════════════════════════════════════════════════════════════
   ARTICLE DATABASE
   ═══════════════════════════════════════════════════════════════════════ */

interface ArticleSection {
  number: string;
  title: string;
  content: string[];
  pullQuote?: string;
  image?: string;
  imageCaption?: string;
}

interface FullArticle {
  slug: string;
  category: string;
  categoryLabel: string;
  title: string;
  subtitle: string;
  epigraph: string;
  heroImage: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  sections: ArticleSection[];
  conclusion: string[];
  closingLine: string;
  relatedSlugs: string[];
  tags: string[];
  ctaTitle: string;
  ctaSubtitle: string;
  metaDescription: string;
}

const ARTICLES: Record<string, FullArticle> = {
  'ceviri-hastaligi': {
    slug: 'ceviri-hastaligi',
    category: 'genel',
    categoryLabel: 'DİL ÖĞRENİMİ',
    title: 'Çeviri Hastalığı:\nBiliyorum Ama\nKonuşamıyorum',
    subtitle: 'Dil öğreniminde en yaygın tuzak, bilgiyi pratiğe dönüştürememektir. Bu yazıda "çeviri hastalığı" kavramını nörobilimsel ve metodolojik perspektiften çözümlüyoruz.',
    epigraph: 'Bir dili bilmek ile bir dili konuşmak arasındaki mesafe, bir kitabı okumak ile bir bisiklete binmek arasındaki mesafeye eşittir.',
    heroImage: 'https://images.unsplash.com/photo-1725190216145-ea1455fd9914?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    author: 'Teachera Uzman Ekibi',
    authorRole: 'Dil Eğitimi Araştırma Birimi',
    date: '12 Ekim 2025',
    readTime: '5 dk',
    sections: [
      {
        number: '01',
        title: 'Çeviri Hastalığı Nedir?',
        content: [
          'Bir cümle duydunuz. İngilizce. Kelime kelime anladınız. Hatta gramer yapısını bile çözümlediniz. Ama karşınızdaki kişi sizi yanıt beklercesine izlerken, beyniniz dondu. Dilediğiniz cümle dudaklarınıza ulaşamadı. "Biliyorum ama konuşamıyorum" — milyonlarca dil öğrencisinin ortak itirafı.',
          '"Çeviri hastalığı" kavramı, dil öğreniminde karşılaşılan en yaygın ve en yıkıcı engellerden birini tanımlar: Hedef dilde düşünmek yerine, anadilden kelime kelime çeviri yaparak konuşmaya çalışmak. Bu süreç bilinçli, yavaş ve yorucudur. Doğal konuşma hızına asla yetişemez.',
          'Sorun bilgi eksikliği değildir. Sorun, bilginin beyinde yanlış bölgede depolanmasıdır.',
        ],
        pullQuote: 'Bilgiyi bilmek ile bilgiyi kullanmak arasındaki uçurum, dil öğreniminin en karanlık vadisidir.',
      },
      {
        number: '02',
        title: 'Deklaratif ve Prosedürel Bellek',
        content: [
          'Nörobilim, insan belleğini iki temel kategoriye ayırır. Deklaratif bellek — "bildiğimiz şeyler" — bilinçli olarak erişebildiğimiz olgusal bilgileri depolar. Fransa\'nın başkentinin Paris olduğunu bilmek, İngilizce\'de "go" fiilinin geçmiş zamanda "went" olduğunu hatırlamak; bunlar deklaratif belleğin işidir.',
          'Prosedürel bellek ise bambaşka bir mekanizmadır. Bisiklete binmek, piyano çalmak, araba sürmek — bunlar bir kez öğrenildiğinde bilinçli düşünmeden, refleksif olarak icra edilir. Dil konuşmak da doğası gereği prosedürel bir beceridir.',
          'Geleneksel dil eğitiminin temel hatası burada yatar: Prosedürel bir beceriyi, deklaratif yöntemlerle — gramer kuralları ezberleyerek, kelime listeleri yaparak, çeviri alıştırmaları çözerek — öğretmeye çalışmak. Bu, bisiklete binmeyi kitaptan okuyarak öğrenmeye benzer.',
        ],
        image: 'https://images.unsplash.com/photo-1649937801620-d31db7fb3ab3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        imageCaption: 'Dil edinimi, beynin prosedürel bellek alanlarında gerçekleşen bir süreçtir.',
      },
      {
        number: '03',
        title: 'Geleneksel Eğitimin Yapısal Çıkmazı',
        content: [
          'Türkiye\'de ortalama bir öğrenci lise sonuna kadar yaklaşık 1.000 saat İngilizce eğitimi alır. Üniversite hazırlık sınıflarını eklediğimizde bu rakam 1.500 saati aşar. Ancak EF English Proficiency Index verilerine göre Türkiye, 113 ülke arasında 70\'lerin altında yer almaktadır.',
          'Bunun sebebi öğretmenler, öğrenciler veya müfredat değildir. Sebebi, paradigmanın kendisidir. Gramer-çeviri yöntemi (Grammar-Translation Method), 19. yüzyılda Latince ve Antik Yunanca gibi ölü dilleri okumak için tasarlanmış bir sistemdir. Bu yöntemle canlı bir dili konuşmak, ilk tasarım amacının tamamen dışındadır.',
          'Bir dili konuşabilmek için beyninizin o dili "motor beceri" olarak kodlaması gerekir. Bu da ancak ve ancak konuşarak, dinleyerek ve hedef dilde düşünerek gerçekleşir.',
        ],
        pullQuote: 'Gramer kuralını bilmek sizi dilci yapar, konuşma pratiği sizi konuşmacı yapar. İkisi arasındaki fark, teori ile refleks arasındaki farktır.',
      },
      {
        number: '04',
        title: 'Motor Beceri Olarak Dil Edinimi',
        content: [
          'Stephen Krashen\'ın "Input Hypothesis" teorisi ve daha güncel nörobilimsel araştırmalar, dil ediniminin bilinçli öğrenme ile değil, anlamlı girdi ve tekrarlayan pratik ile gerçekleştiğini göstermektedir. Beyin, yeterli miktarda anlaşılabilir girdi aldığında ve bu girdiyi üretimle — yani konuşma ve yazma ile — pekiştirdiğinde, dili prosedürel belleğe kaydeder.',
          'Bu süreçte "hata" bir düşman değil, öğrenmenin motorudur. Her hatalı cümle, beynin doğru yapıyı keşfetmesine bir adım daha yaklaştırır. Ancak geleneksel sistemde hata cezalandırılır, öğrenci susturulur ve "önce kuralı öğren, sonra konuş" dayatması yapılır.',
          'Teachera Teaching Method, bu paradigmayı tersine çevirir: Önce konuş, pratikte öğren, hataları doğal süreçte düzelt. Derslerin %85\'inin konuşma pratiğiyle geçmesinin ardında bu nörobilimsel gerçeklik yatar.',
        ],
        image: 'https://images.unsplash.com/photo-1626447269096-f8665509589c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        imageCaption: 'Konuşma pratiği, dilin prosedürel belleğe yerleşmesinin tek yoludur.',
      },
      {
        number: '05',
        title: 'Çeviri Hastalığından Kurtulmanın Yolu',
        content: [
          'Çeviri hastalığının çözümü, anadili devredışı bırakarak hedef dilde düşünmeye başlamaktır. Bu kulağa imkansız gelebilir, ancak doğru ortam ve doğru metodoloji ile şaşırtıcı derecede hızlı gerçekleşir.',
          'Birinci adım, "anadilsiz" bir öğrenme ortamı yaratmaktır. Derslerin tamamen hedef dilde, beden dili, görsel materyaller ve bağlam ipuçları ile yürütülmesi, beyni çeviri yerine doğrudan anlama moduna geçirir. İlk birkaç ders zorlayıcı olabilir, ancak beyin bu yeni modele şaşırtıcı bir hızla adapte olur.',
          'İkinci adım, günlük hayatta mikro pratikler oluşturmaktır. İç sesinizle hedef dilde konuşmak, gördüğünüz nesneleri hedef dilde adlandırmak, hatta rüyalarınızda bile hedef dili kullanmaya başladığınızda — çeviri hastalığı geride kalmaya başlar.',
          'Üçüncü adım ise tutarlılık ve sabırdır. Beyin yeni sinaptik bağlantılar kurmak için zamana ihtiyaç duyar. Haftada bir kez yoğun çalışma yerine, her gün kısa ama düzenli pratik çok daha etkilidir.',
        ],
        pullQuote: 'Beyniniz hedef dilde rüya görmeye başladığında, çeviri hastalığının son kalıntıları da silinir.',
      },
    ],
    conclusion: [
      '"Biliyorum ama konuşamıyorum" cümlesi bir kader değil, yanlış yöntemin doğal sonucudur. Dil, bir bilgi deposu değil, bir motor beceridir. Konuşarak, yaşayarak ve hedef dilde düşünerek edinilir.',
      'Geleneksel yöntemlerle yıllarca ilerleme kaydedemeyen binlerce öğrenci, doğru metodoloji ile aylar içinde konuşma düzeyine ulaşmaktadır. Mesele yeteneğiniz değil, sisteminizdir.',
    ],
    closingLine: 'Çeviri hastalığı tedavi edilebilir. İlk adım, eski alışkanlıkları bırakmak ve konuşmaya cesaret etmektir.',
    relatedSlugs: [],
    tags: ['Çeviri Hastalığı', 'Konuşma Pratiği', 'Nörobilim', 'Dil Edinimi', 'Motor Beceri', 'Teachera Method'],
    ctaTitle: 'Çeviri hastalığını birlikte tedavi edelim',
    ctaSubtitle: '%85 konuşma pratiğiyle dil öğrenmenin nasıl bir şey olduğunu ücretsiz deneme dersinde keşfedin.',
    metaDescription: 'Çeviri hastalığı nedir? Biliyorum ama konuşamıyorum sorununu nörobilim temelli yöntemler ve pratik konuşma stratejileriyle çözün.',
  },
};

interface FallbackArticleMeta {
  id: number;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  author: string;
  date: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  genel: 'DİL ÖĞRENİMİ',
  ingilizce: 'İNGİLİZCE',
  almanca: 'ALMANCA',
  ispanyolca: 'İSPANYOLCA',
  fransizca: 'FRANSIZCA',
  italyanca: 'İTALYANCA',
  rusca: 'RUSÇA',
};

const FALLBACK_ARTICLES: FallbackArticleMeta[] = [
  {
    id: 1,
    slug: 'ceviri-hastaligi',
    category: 'genel',
    title: 'Çeviri Hastalığı: Biliyorum Ama Konuşamıyorum',
    excerpt: 'Dil öğrenme sürecinde, teknik ve gramer bilgisine hakim olsanız bile anlama ve konuşma becerilerinizi geliştiremeyişinizi anlamlandıramıyor olabilirsiniz. Bu yazıda "çeviri hastalığı" kavramını çözüyoruz.',
    image: 'https://images.unsplash.com/photo-1725190216145-ea1455fd9914?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    readTime: '5 dk',
    author: 'Teachera Uzman Ekibi',
    date: '12 Eki 2025',
  },
  {
    id: 2,
    slug: 'motor-beceri-mi-mantiksal-bilgi-mi',
    category: 'genel',
    title: 'Motor Beceri mi? Mantıksal Bilgi Edinimi mi?',
    excerpt: 'Dil öğrenmenin temel amacı iletişim kurabilmektir. Ancak çoğu sistem dili bir "matematik problemi" gibi öğretir. Beyin bilimi bu konuda ne söylüyor?',
    image: 'https://images.unsplash.com/photo-1725399633872-32ba508b0607?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    readTime: '7 dk',
    author: 'Dr. Elena Rossi',
    date: '10 Eki 2025',
  },
  {
    id: 3,
    slug: 'business-english-kuresel-pazar',
    category: 'ingilizce',
    title: 'Business English: Küresel Pazarda Yerinizi Alın',
    excerpt: 'Profesyonel hayatta İngilizce sadece bir dil değil, bir yetkinliktir. Toplantılarda, sunumlarda ve müzakerelerde kullanabileceğiniz kilit stratejiler.',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    readTime: '4 dk',
    author: 'James Wilson',
    date: '15 Eki 2025',
  },
  {
    id: 4,
    slug: 'ielts-toefl-sinav-stratejileri',
    category: 'ingilizce',
    title: 'IELTS & TOEFL Sınav Stratejileri',
    excerpt: 'Akademik sınavlara hazırlanırken yapılan en yaygın hatalar ve yüksek skor için "Time Management" taktikleri.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    readTime: '6 dk',
    author: 'Sarah Jenkins',
    date: '14 Eki 2025',
  },
  {
    id: 5,
    slug: 'alman-muhendisligi-ve-dilin-yapisi',
    category: 'almanca',
    title: 'Alman Mühendisliği ve Dilin Yapısı',
    excerpt: 'Almanca, kuralların ve netliğin dilidir. Mühendislik ve teknik alanlarda kariyer hedefleyenler için temel terminoloji rehberi.',
    image: 'https://images.unsplash.com/photo-1517457210348-703079e57d4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    readTime: '5 dk',
    author: 'Hans Müller',
    date: '13 Eki 2025',
  },
  {
    id: 6,
    slug: 'hizli-ispanyolca-konusma-rehberi',
    category: 'ispanyolca',
    title: 'Ritmi Yakalayın: Hızlı İspanyolca Konuşma Rehberi',
    excerpt: 'İspanyolca, dünyanın en hızlı konuşulan dillerinden biridir. Duyduğunu anlama ve bu hıza ayak uydurma egzersizleri.',
    image: 'https://images.unsplash.com/photo-1547990196-80517909c0aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    readTime: '4 dk',
    author: 'Maria Garcia',
    date: '09 Eki 2025',
  },
  {
    id: 7,
    slug: 'sanatin-dili-paris-sokaklari',
    category: 'fransizca',
    title: 'Sanatın Dili: Paris Sokaklarında Bir Gezinti',
    excerpt: 'Fransızca telaffuzunun incelikleri ve günlük hayatta kullanılan, ders kitaplarında bulamayacağınız deyimler.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    readTime: '5 dk',
    author: 'Sophie Martin',
    date: '07 Eki 2025',
  },
  {
    id: 8,
    slug: 'la-dolce-vita-jestler-ve-mimikler',
    category: 'italyanca',
    title: 'La Dolce Vita: Jestler, Mimikler ve Sözsüz İletişim',
    excerpt: 'İtalyanca konuşurken ellerinizi nasıl kullanmalısınız? Sözsüz iletişimin İtalyan kültüründeki hayati önemi.',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    readTime: '4 dk',
    author: 'Marco Rossi',
    date: '06 Eki 2025',
  },
  {
    id: 9,
    slug: 'kiril-alfabesi-2-saatte',
    category: 'rusca',
    title: 'Kiril Alfabesi: Korkulan Engeli 2 Saatte Aşmak',
    excerpt: 'Rusça öğrenmeye başlarken gözünüzü korkutan alfabe aslında en kolay kısımdır. Bilimsel temelli hızlı okuma tekniği.',
    image: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    readTime: '6 dk',
    author: 'Ivan Petrov',
    date: '05 Eki 2025',
  },
  {
    id: 10,
    slug: 'dil-ogreniminde-yapay-zeka-devrimi',
    category: 'genel',
    title: 'Dil Öğreniminde Yapay Zeka Devrimi',
    excerpt: 'Yapay zeka araçları dil öğrenimini nasıl kişiselleştiriyor ve hızlandırıyor? ChatGPT\'den Duolingo AI\'a, yeni nesil öğrenme araçlarını keşfedin.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    readTime: '4 dk',
    author: 'Teknoloji Ekibi',
    date: '08 Eki 2025',
  },
  {
    id: 11,
    slug: 'ingilizce-deyimler-ve-atasozleri',
    category: 'ingilizce',
    title: 'İngilizce Deyimler ve Atasözleri: Native Gibi Konuşun',
    excerpt: 'Native speaker gibi konuşmak için bilmeniz gereken en popüler 50 İngilizce deyim ve kullanım alanları.',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    readTime: '5 dk',
    author: 'John Smith',
    date: '11 Eki 2025',
  },
  {
    id: 12,
    slug: 'cocuklarda-erken-yasta-dil-ogrenimi',
    category: 'genel',
    title: 'Çocuklarda Erken Yaşta Dil Öğrenimi: Neden 7 Yaş Kritik?',
    excerpt: 'Nörobilim araştırmaları, çocukların dil öğrenme kapasitesinin 7 yaşında zirve yaptığını gösteriyor. Ebeveynler için pratik bir rehber.',
    image: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    readTime: '6 dk',
    author: 'Pedagoji Ekibi',
    date: '02 Eki 2025',
  },
  {
    id: 13,
    slug: 'yurtdisinda-yasam-ilk-90-gun',
    category: 'genel',
    title: 'Yurtdışında Yaşam: Dil Bariyerini Kırmak İçin İlk 90 Gün',
    excerpt: 'Yeni bir ülkeye taşındığınızda dil bariyeri en büyük stres kaynağı olabilir. İlk 90 günde uygulamanız gereken 7 altın kural.',
    image: 'https://images.unsplash.com/photo-1561558471-ea8ebc7c9ae5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    readTime: '5 dk',
    author: 'Teachera Uzman Ekibi',
    date: '28 Eyl 2025',
  },
  {
    id: 14,
    slug: 'polyglot-olmanin-sirlari',
    category: 'genel',
    title: 'Polyglot Olmanın Sırları: 3\'ten Fazla Dil Nasıl Öğrenilir?',
    excerpt: 'Dünyada 50\'den fazla dil konuşan insanlar var. Polyglot\'ların ortak kullandığı teknikleri ve beyin stratejilerini inceliyoruz.',
    image: 'https://images.unsplash.com/photo-1743565900437-f232da3a22c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    readTime: '8 dk',
    author: 'Dr. Elena Rossi',
    date: '22 Eyl 2025',
  },
  {
    id: 15,
    slug: 'netflix-ile-dil-ogrenmek',
    category: 'genel',
    title: 'Netflix ile Dil Öğrenmek: Eğlenceli Ama Gerçekten Etkili mi?',
    excerpt: 'Dizi ve film izleyerek dil öğrenme trendi giderek büyüyor. Altyazı stratejileri, en iyi içerik önerileri ve bilimsel veriler bu yazıda.',
    image: 'https://images.unsplash.com/photo-1608737739007-f0019bc67f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    readTime: '4 dk',
    author: 'Kültür Ekibi',
    date: '18 Eyl 2025',
  },
];

const FALLBACK_ARTICLE_MAP: Record<string, FallbackArticleMeta> = Object.fromEntries(
  FALLBACK_ARTICLES.map((article) => [article.slug, article]),
);

const DEFAULT_TAGS = ['Teachera Academy', 'Dil Öğrenimi', 'Konuşma Pratiği'];
const DEFAULT_CTA_TITLE = 'Öğrenme planını şimdi kişiselleştir';
const DEFAULT_CTA_SUBTITLE = 'Hedefine uygun programla düzenli pratik yap, daha hızlı sonuç al.';
const DEFAULT_META_DESCRIPTION = 'Teachera Academy içerikleriyle dil öğreniminde pratik odaklı, uygulanabilir yöntemleri keşfedin.';

function formatSectionNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function buildFallbackArticle(article: FallbackArticleMeta): FullArticle {
  const editorialSeed = EDITORIAL_SEEDS[article.slug];

  if (editorialSeed) {
    return {
      slug: article.slug,
      category: article.category,
      categoryLabel: CATEGORY_LABELS[article.category] || 'DİL ÖĞRENİMİ',
      title: article.title,
      subtitle: article.excerpt,
      epigraph: editorialSeed.epigraph,
      heroImage: article.image,
      author: article.author,
      authorRole: 'Teachera Academy',
      date: article.date,
      readTime: article.readTime,
      sections: editorialSeed.sections.map((section, index) => ({
        number: formatSectionNumber(index),
        title: section.title,
        content: section.paragraphs,
        pullQuote: section.pullQuote,
      })),
      conclusion: editorialSeed.conclusion,
      closingLine: editorialSeed.closingLine,
      relatedSlugs: [],
      tags: editorialSeed.tags,
      ctaTitle: editorialSeed.ctaTitle,
      ctaSubtitle: editorialSeed.ctaSubtitle,
      metaDescription: editorialSeed.metaDescription,
    };
  }

  return {
    slug: article.slug,
    category: article.category,
    categoryLabel: CATEGORY_LABELS[article.category] || 'DİL ÖĞRENİMİ',
    title: article.title,
    subtitle: article.excerpt,
    epigraph: 'Dil öğrenimi, doğru yöntem ve düzenli pratikle kalıcı bir alışkanlığa dönüşür.',
    heroImage: article.image,
    author: article.author,
    authorRole: 'Teachera Academy',
    date: article.date,
    readTime: article.readTime,
    sections: [
      {
        number: '01',
        title: 'Konuya Giriş',
        content: [
          article.excerpt,
          'Bu içerik, Academy içerisinde ilgili başlığın temel çerçevesini hızlıca anlamanızı sağlayacak şekilde hazırlanmıştır.',
        ],
      },
      {
        number: '02',
        title: 'Pratik Uygulama',
        content: [
          'Konuyu kalıcı hale getirmenin en etkili yolu, düzenli tekrar ve gerçek senaryo pratiğidir.',
          'Kısa, sürdürülebilir çalışma blokları ve konuşma odaklı egzersizlerle ilerleme ölçülebilir hale gelir.',
        ],
      },
      {
        number: '03',
        title: 'Sonuç ve Yol Haritası',
        content: [
          'Hedef odaklı bir plan, doğru kaynak seçimi ve istikrarlı geri bildirim mekanizması başarıyı hızlandırır.',
          'Bir sonraki adımda bu konuyu kendi seviyenize ve hedefinize göre kişiselleştirerek uygulamaya geçebilirsiniz.',
        ],
      },
    ],
    conclusion: [
      'Bu başlık, dil öğreniminde sürdürülebilir gelişim için temel bir yapı sunar.',
      'Düzenli uygulama ve kişiselleştirilmiş planla kısa sürede somut ilerleme görmek mümkündür.',
    ],
    closingLine: 'Hedefinizi netleştirin, küçük ama tutarlı adımlarla ilerleyin.',
    relatedSlugs: [],
    tags: DEFAULT_TAGS,
    ctaTitle: DEFAULT_CTA_TITLE,
    ctaSubtitle: DEFAULT_CTA_SUBTITLE,
    metaDescription: article.excerpt || DEFAULT_META_DESCRIPTION,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   SLUG MAPPING — article id → slug
   ═══════════════════════════════════════════════════════════════════════ */
export const ARTICLE_SLUG_MAP: Record<number, string> = {
  1: 'ceviri-hastaligi',
  2: 'motor-beceri-mi-mantiksal-bilgi-mi',
  3: 'business-english-kuresel-pazar',
  4: 'ielts-toefl-sinav-stratejileri',
  5: 'alman-muhendisligi-ve-dilin-yapisi',
  6: 'hizli-ispanyolca-konusma-rehberi',
  7: 'sanatin-dili-paris-sokaklari',
  8: 'la-dolce-vita-jestler-ve-mimikler',
  9: 'kiril-alfabesi-2-saatte',
  10: 'dil-ogreniminde-yapay-zeka-devrimi',
  11: 'ingilizce-deyimler-ve-atasozleri',
  12: 'cocuklarda-erken-yasta-dil-ogrenimi',
  13: 'yurtdisinda-yasam-ilk-90-gun',
  14: 'polyglot-olmanin-sirlari',
  15: 'netflix-ile-dil-ogrenmek',
};

/* ═══════════════════════════════════════════════════════════════════════
   REVEAL
   ═══════════════════════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   READING PROGRESS BAR
   ═══════════════════════════════════════════════════════════════════════ */
function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 50, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-[#E70000] origin-left z-[9999]"
      style={{ scaleX }}
    />
  );
}

function normalizeArticleTitle(title: string): string {
  return title.replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

const TURKISH_MONTH_MAP: Record<string, number> = {
  ocak: 0,
  oca: 0,
  subat: 1,
  sub: 1,
  mart: 2,
  mar: 2,
  nisan: 3,
  nis: 3,
  mayis: 4,
  may: 4,
  haziran: 5,
  haz: 5,
  temmuz: 6,
  tem: 6,
  agustos: 7,
  agu: 7,
  eylul: 8,
  eyl: 8,
  ekim: 9,
  eki: 9,
  kasim: 10,
  kas: 10,
  aralik: 11,
  ara: 11,
};

function normalizeTurkishToken(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');
}

function toIsoDateString(dateLabel: string): string | undefined {
  const [dayPart, monthPart, yearPart] = dateLabel.trim().replace(/\./g, '').split(/\s+/);
  const day = Number(dayPart);
  const year = Number(yearPart);
  const monthIndex = TURKISH_MONTH_MAP[normalizeTurkishToken(monthPart || '')];

  if (!Number.isInteger(day) || !Number.isInteger(year) || monthIndex === undefined) {
    return undefined;
  }

  const parsedDate = new Date(Date.UTC(year, monthIndex, day));
  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate.toISOString().slice(0, 10);
}

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonicalLink(href: string) {
  let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/* ═══════════════════════════════════════════════════════════════════════
   ARTICLE DETAIL PAGE
   ═══════════════════════════════════════════════════════════════════════ */
export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = useMemo(() => {
    if (!slug) return undefined;
    if (ARTICLES[slug]) return ARTICLES[slug];
    const fallback = FALLBACK_ARTICLE_MAP[slug];
    return fallback ? buildFallbackArticle(fallback) : undefined;
  }, [slug]);
  const plainTitle = useMemo(() => (article ? normalizeArticleTitle(article.title) : ''), [article]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!article) {
      document.title = 'Makale Bulunamadı | Teachera Academy';
      upsertMetaTag('name', 'description', 'Aradığınız Teachera Academy makalesi bulunamadı.');
      upsertMetaTag('name', 'robots', 'noindex,follow,noarchive');
      upsertMetaTag('property', 'og:type', 'website');
      upsertMetaTag('property', 'og:title', 'Makale Bulunamadı | Teachera Academy');
      upsertMetaTag('property', 'og:description', 'Aradığınız Teachera Academy makalesi bulunamadı.');
      upsertMetaTag('property', 'og:url', `${window.location.origin}/academy`);
      upsertMetaTag('property', 'og:image', DEFAULT_OG_IMAGE);
      upsertMetaTag('name', 'twitter:card', 'summary');
      upsertMetaTag('name', 'twitter:title', 'Makale Bulunamadı | Teachera Academy');
      upsertMetaTag('name', 'twitter:description', 'Aradığınız Teachera Academy makalesi bulunamadı.');
      upsertMetaTag('name', 'twitter:image', DEFAULT_OG_IMAGE);
      upsertCanonicalLink(`${window.location.origin}/academy`);

      const existingStructuredData = document.getElementById('teachera-academy-article-jsonld');
      if (existingStructuredData) {
        existingStructuredData.remove();
      }
      return;
    }

    const pageTitle = `${plainTitle} | Teachera Academy`;
    const description = article.metaDescription || article.subtitle || DEFAULT_META_DESCRIPTION;
    const pageUrl = `${window.location.origin}${window.location.pathname}`;
    const publishedAt = toIsoDateString(article.date);
    const isOrganizationAuthor = /ekip|ekibi|birimi|teachera/i.test(article.author);

    document.title = pageTitle;
    upsertMetaTag('name', 'description', description);
    upsertMetaTag('property', 'og:type', 'article');
    upsertMetaTag('property', 'og:title', pageTitle);
    upsertMetaTag('property', 'og:description', description);
    upsertMetaTag('property', 'og:url', pageUrl);
    upsertMetaTag('property', 'og:image', article.heroImage);
    upsertMetaTag('name', 'twitter:card', 'summary_large_image');
    upsertMetaTag('name', 'twitter:title', pageTitle);
    upsertMetaTag('name', 'twitter:description', description);
    upsertMetaTag('name', 'twitter:image', article.heroImage);
    upsertCanonicalLink(pageUrl);

    const jsonLdId = 'teachera-academy-article-jsonld';
    let structuredData = document.getElementById(jsonLdId) as HTMLScriptElement | null;
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.type = 'application/ld+json';
      structuredData.id = jsonLdId;
      document.head.appendChild(structuredData);
    }

    structuredData.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: plainTitle,
      description,
      image: [article.heroImage],
      author: {
        '@type': isOrganizationAuthor ? 'Organization' : 'Person',
        name: article.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Teachera',
      },
      ...(publishedAt ? { datePublished: publishedAt } : {}),
      mainEntityOfPage: pageUrl,
      keywords: article.tags.join(', '),
    });

    return () => {
      const existingStructuredData = document.getElementById(jsonLdId);
      if (existingStructuredData) {
        existingStructuredData.remove();
      }
    };
  }, [article, plainTitle]);

  if (!article) {
    return (
      <div className="min-h-screen bg-[#0a0a10] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/30 font-['Neutraface_2_Text:Demi',sans-serif] text-lg mb-6">Makale bulunamadı</p>
          <button
            onClick={() => navigate('/academy')}
            className="text-[#E70000] font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-[0.15em] hover:text-white transition-colors cursor-pointer"
          >
            ACADEMY'YE DON
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReadingProgress />

      <div className="min-h-screen bg-[#F4EBD1]">

        {/* ═══════════════════════════════════════════════════════
            HERO — Pure Typography, No Image
            ═══════════════════════════════════════════════════════ */}
        <section className="relative bg-[#0a0a10] overflow-hidden">
          {/* Subtle texture */}
          <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'4\' height=\'4\' viewBox=\'0 0 4 4\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 3h1v1H1V3zm2-2h1v1H3V1z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundSize: '4px 4px' }} />

          {/* Atmospheric red glow — very subtle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[#E70000] rounded-full filter blur-[300px] opacity-[0.04] pointer-events-none" />

          <div className="max-w-[1100px] mx-auto px-6 lg:px-12 relative z-10 pt-32 md:pt-40 pb-24 md:pb-32">

            {/* Navigation row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-16 md:mb-24"
            >
              <button
                onClick={() => navigate('/academy')}
                className="flex items-center gap-3 text-white/25 hover:text-white/60 transition-colors cursor-pointer group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.3em]">
                  TEACHERA ACADEMY
                </span>
              </button>
              <div className="flex items-center gap-4 text-white/20 text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.2em]">
                <span>{article.date}</span>
                <span className="w-[3px] h-[3px] rounded-full bg-white/15" />
                <span>{article.readTime}</span>
              </div>
            </motion.div>

            {/* Category */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="mb-10"
            >
              <span className="text-[#E70000] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.35em]">
                {article.categoryLabel}
              </span>
            </motion.div>

            {/* Title — the statement */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-white leading-[0.95] mb-14 md:mb-18 whitespace-pre-line"
              style={{ fontSize: 'clamp(2.4rem, 7vw, 5.5rem)', fontFamily: "'Neutraface_2_Text:Bold', sans-serif", letterSpacing: '-0.02em' }}
            >
              {article.title}
            </motion.h1>

            {/* Thin red rule */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-20 h-[2px] bg-[#E70000] origin-left mb-12"
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="text-white/35 text-[15px] md:text-[17px] font-['Neutraface_2_Text:Book',sans-serif] italic leading-[1.8] max-w-xl mb-14"
            >
              {article.subtitle}
            </motion.p>

            {/* Author line — minimal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="w-[1px] h-8 bg-white/10" />
              <div>
                <p className="text-white/50 text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.05em]">
                  {article.author}
                </p>
                <p className="text-white/20 text-[11px] font-['Neutraface_2_Text:Book',sans-serif]">
                  {article.authorRole}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            HERO IMAGE — Full bleed between hero and body
            ═══════════════════════════════════════════════════════ */}
        <div className="relative w-full h-[40vh] md:h-[55vh] lg:h-[65vh] overflow-hidden">
          <ImageWithFallback
            src={article.heroImage}
            alt={`${plainTitle} kapak görseli`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a10] via-transparent to-[#F4EBD1]" style={{ background: 'linear-gradient(to bottom, #0a0a10 0%, transparent 25%, transparent 75%, #F4EBD1 100%)' }} />
        </div>

        {/* ═══════════════════════════════════════════════════════
            EPIGRAPH
            ═══════════════════════════════════════════════════════ */}
        <div className="max-w-[800px] mx-auto px-6 lg:px-12 pt-16 md:pt-24 pb-12 md:pb-20">
          <Reveal>
            <div className="text-center">
              <div className="text-[#E70000]/25 text-[60px] md:text-[80px] leading-none font-['Neutraface_2_Text:Bold',sans-serif] select-none mb-2">"</div>
              <p className="text-[#324D47] text-[clamp(1.1rem,2.8vw,1.6rem)] font-['Neutraface_2_Text:Demi',sans-serif] italic leading-[1.7] max-w-[640px] mx-auto -mt-8 md:-mt-12">
                {article.epigraph}
              </p>
              <div className="w-8 h-[1px] bg-[#324D47]/15 mx-auto mt-10" />
            </div>
          </Reveal>
        </div>

        {/* ═══════════════════════════════════════════════════════
            ARTICLE BODY
            ═══════════════════════════════════════════════════════ */}
        <article className="max-w-[800px] mx-auto px-6 lg:px-12 pb-12">

          {article.sections.map((section, sIdx) => (
            <Reveal key={section.number} delay={sIdx === 0 ? 0 : 0.05}>
              <section className={sIdx === 0 ? 'pt-4' : 'pt-20 md:pt-28'}>

                {/* ── Section Header ── */}
                <div className="relative mb-10 md:mb-14">
                  {/* Ghost number — positioned in margin on lg */}
                  <span
                    className="block lg:absolute lg:-left-24 lg:top-0 text-[#E70000]/[0.07] font-['Neutraface_2_Text:Bold',sans-serif] leading-none select-none mb-4 lg:mb-0"
                    style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)' }}
                  >
                    {section.number}
                  </span>
                  <h2
                    className="text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif] leading-[1.1]"
                    style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)' }}
                  >
                    {section.title}
                  </h2>
                </div>

                {/* ── Paragraphs ── */}
                <div className="space-y-7">
                  {section.content.map((paragraph, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-[#324D47]/70 font-['Neutraface_2_Text:Book',sans-serif] leading-[1.9]"
                      style={{
                        fontSize: 'clamp(1.05rem, 1.8vw, 1.15rem)',
                        ...(sIdx === 0 && pIdx === 0 ? {} : {}),
                      }}
                    >
                      {sIdx === 0 && pIdx === 0 ? (
                        <>
                          <span
                            className="float-left text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif] leading-[0.75] mr-3 mt-2"
                            style={{ fontSize: '4.2em' }}
                          >
                            {paragraph.charAt(0)}
                          </span>
                          {paragraph.slice(1)}
                        </>
                      ) : paragraph}
                    </p>
                  ))}
                </div>

                {/* ── Pull Quote — Full-width, centered, dramatic ── */}
                {section.pullQuote && (
                  <Reveal delay={0.1}>
                    <div className="my-16 md:my-24 py-12 md:py-16 border-t border-b border-[#324D47]/[0.06] text-center relative">
                      {/* Large quotation mark */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[#E70000]/10 font-['Neutraface_2_Text:Bold',sans-serif] select-none pointer-events-none" style={{ fontSize: '8rem', lineHeight: '1' }}>
                        "
                      </div>
                      <p
                        className="text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif] leading-[1.35] max-w-[560px] mx-auto relative z-10"
                        style={{ fontSize: 'clamp(1.15rem, 2.8vw, 1.55rem)' }}
                      >
                        {section.pullQuote}
                      </p>
                    </div>
                  </Reveal>
                )}

                {/* ── Section Image — Edge-to-edge ── */}
                {section.image && (
                  <Reveal delay={0.1}>
                    <figure className="my-14 md:my-20 -mx-6 lg:-mx-24">
                      <div className="overflow-hidden">
                        <ImageWithFallback
                          src={section.image}
                          alt={section.imageCaption || section.title}
                          className="w-full h-[280px] md:h-[420px] lg:h-[480px] object-cover"
                        />
                      </div>
                      {section.imageCaption && (
                        <figcaption className="mt-5 px-6 lg:px-24 text-[#324D47]/30 text-[11px] font-['Neutraface_2_Text:Book',sans-serif] tracking-[0.05em]">
                          — {section.imageCaption}
                        </figcaption>
                      )}
                    </figure>
                  </Reveal>
                )}
              </section>
            </Reveal>
          ))}

          {/* ═══════════════════════════════════════════════════════
              CONCLUSION
              ═══════════════════════════════════════════════════════ */}
          <Reveal>
            <section className="pt-20 md:pt-28">
              {/* Heavy rule */}
              <div className="w-full h-[2px] bg-[#324D47]/10 mb-14 md:mb-18" />

              <div className="space-y-7">
                {article.conclusion.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-[#324D47]/70 font-['Neutraface_2_Text:Book',sans-serif] leading-[1.9]"
                    style={{ fontSize: 'clamp(1.05rem, 1.8vw, 1.15rem)' }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Closing line — standalone, bold */}
              <p
                className="text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif] leading-[1.4] mt-12"
                style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)' }}
              >
                {article.closingLine}
              </p>

              {/* End mark */}
              <div className="mt-14 flex items-center gap-4">
                <div className="w-3 h-3 bg-[#E70000]" />
                <div className="flex-1 h-[1px] bg-[#324D47]/[0.06]" />
              </div>
            </section>
          </Reveal>

          {/* ═══════════════════════════════════════════════════════
              AUTHOR CARD
              ═══════════════════════════════════════════════════════ */}
          <Reveal>
            <div className="mt-16 md:mt-20 py-10 flex items-start gap-6">
              <div className="w-[3px] h-14 bg-[#E70000]/20 rounded-full shrink-0 mt-1" />
              <div>
                <p className="text-[10px] text-[#324D47]/25 font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.3em] mb-3">
                  YAZAR
                </p>
                <p className="text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif] mb-1" style={{ fontSize: '1.1rem' }}>
                  {article.author}
                </p>
                <p className="text-[#324D47]/40 text-[14px] font-['Neutraface_2_Text:Book',sans-serif] italic leading-relaxed">
                  {article.authorRole}
                </p>
              </div>
            </div>
          </Reveal>

          {/* ═══════════════════════════════════════════════════════
              TAGS
              ═══════════════════════════════════════════════════════ */}
          <Reveal>
            <div className="mt-6 pt-8 border-t border-[#324D47]/[0.06] flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 border border-[#324D47]/[0.08] text-[10px] text-[#324D47]/35 font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.1em]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>
        </article>

        {/* ═══════════════════════════════════════════════════════
            BOTTOM CTA — Dark, authoritative
            ═══════════════════════════════════════════════════════ */}
        <Reveal>
          <section className="bg-[#0a0a10] mt-20 md:mt-28 relative overflow-hidden">
            {/* Subtle red glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E70000] rounded-full filter blur-[250px] opacity-[0.06] pointer-events-none" />

            <div className="max-w-[800px] mx-auto px-6 lg:px-12 py-20 md:py-28 relative z-10">
              <div className="text-center">
                <span className="text-[#E70000] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.35em] block mb-8">
                  SONRAKİ ADIM
                </span>
                <h3
                  className="text-white font-['Neutraface_2_Text:Bold',sans-serif] leading-[1.1] mb-6"
                  style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)' }}
                >
                  {article.ctaTitle}
                </h3>
                <p className="text-white/30 text-[15px] font-['Neutraface_2_Text:Book',sans-serif] italic leading-relaxed max-w-md mx-auto mb-12">
                  {article.ctaSubtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => navigate('/iletisim')}
                    className="h-[52px] px-10 bg-[#E70000] hover:bg-[#c40000] text-white font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-[0.15em] transition-all duration-300 shadow-lg shadow-[#E70000]/20 cursor-pointer hover:shadow-[#E70000]/30 flex items-center gap-3"
                  >
                    DENEME DERSİ AL
                    <ArrowUpRight size={15} />
                  </button>
                  <button
                    onClick={() => navigate('/academy')}
                    className="h-[52px] px-10 border border-white/[0.08] hover:border-white/20 text-white/40 hover:text-white/70 font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-[0.15em] transition-all duration-300 cursor-pointer"
                  >
                    DİĞER YAZILAR
                  </button>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </>
  );
}
