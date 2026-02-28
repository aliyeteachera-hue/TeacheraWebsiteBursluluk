import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowRight, CheckCircle2, MapPin, MonitorSmartphone, Users } from 'lucide-react';
import { trackSeoLandingCta } from '../lib/analytics';

type LandingContent = {
  title: string;
  subtitle: string;
  bullets: string[];
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  faq: Array<{ question: string; answer: string }>;
};

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://teachera.com.tr').replace(/\/+$/, '');
const DEFAULT_PATH = '/konya-ingilizce-kursu';
const SEO_LINKS = [
  { href: '/konya-ingilizce-kursu', label: 'Konya İngilizce Kursu' },
  { href: '/konya-speaking-club', label: 'Konya Speaking Club' },
  { href: '/konya-online-dil-kursu', label: 'Konya Online Dil Kursu' },
  { href: '/turkiye-online-dil-kursu', label: 'Türkiye Online Dil Kursu' },
];

const LANDING_CONTENT: Record<string, LandingContent> = {
  '/konya-ingilizce-kursu': {
    title: 'Konya İngilizce Kursu',
    subtitle:
      'Konya Selçuklu merkezli Teachera ile konuşma odaklı İngilizce eğitimi. Türkiye geneline online, Konya içine yüz yüze seçenekler.',
    bullets: [
      'Yüz yüze grup ve birebir İngilizce programları',
      'Online İngilizce dersleri ile Türkiye geneline erişim',
      'Seviyeye göre program eşleştirmesi ve ücretsiz seviye tespit',
    ],
    primaryLabel: 'İngilizce Programlarını İncele',
    primaryHref: '/egitimlerimiz/ingilizce/grup-programi',
    secondaryLabel: 'Ücretsiz Seviye Tespit',
    secondaryHref: '/seviye-tespit-sinavi',
    faq: [
      {
        question: 'Konya İngilizce kursu için hangi seviyeler var?',
        answer:
          'A1’den C2’ye kadar seviyeye uygun İngilizce programlarımız bulunur. Kayıt öncesi seviye tespit ile doğru sınıfa yerleştirme yapılır.',
      },
      {
        question: 'Konya dışında da katılabilir miyim?',
        answer:
          'Evet. Türkiye geneline online İngilizce sınıflarımız ve birebir ders seçeneklerimiz vardır.',
      },
      {
        question: 'Ders formatı sadece grup mu?',
        answer:
          'Hayır. Grup, online grup ve birebir özel ders seçenekleriyle hedefinize göre program oluşturulur.',
      },
    ],
  },
  '/konya-speaking-club': {
    title: 'Konya Speaking Club',
    subtitle:
      'Konya’da düzenli konuşma pratiği arayanlar için SpeakUp Campus. Gerçek hayata dönük konuşma akışı, sosyal ortam ve seviye uyumlu kulüp düzeni.',
    bullets: [
      'Konya kampüs odaklı speaking club deneyimi',
      'Sınıf formatı yerine interaktif konuşma pratikleri',
      'Üniversite öğrencilerine uygun sosyal ve esnek yapı',
    ],
    primaryLabel: 'SpeakUp Sayfasına Git',
    primaryHref: '/speakup',
    secondaryLabel: 'Başvuru Öncesi İletişim',
    secondaryHref: '/iletisim',
    faq: [
      {
        question: 'Konya speaking club programına kimler katılabilir?',
        answer:
          'Özellikle üniversite öğrencileri başta olmak üzere konuşma pratiğini artırmak isteyen katılımcılar uygun değerlendirme sonrası programa alınır.',
      },
      {
        question: 'SpeakUp bir kurs mu yoksa kulüp mü?',
        answer:
          'SpeakUp ders anlatımından çok konuşma odaklı kulüp modelinde ilerler. Amaç gerçek iletişim pratiği kazandırmaktır.',
      },
      {
        question: 'Başvuru ve seviye süreci nasıl ilerliyor?',
        answer:
          'Başvuru sonrası danışmanlarımız sizinle iletişime geçer, sözlü seviye tespitiyle uygun gruba yönlendirme yapılır.',
      },
    ],
  },
  '/konya-online-dil-kursu': {
    title: 'Konya Online Dil Kursu',
    subtitle:
      'Konya merkezli kurumsal yapı ile Türkiye geneline online yabancı dil eğitimi. İngilizce, Almanca, İspanyolca ve diğer diller için canlı ders seçenekleri.',
    bullets: [
      'Türkiye geneline erişilebilen online canlı sınıflar',
      'İngilizce, Almanca, Fransızca, İspanyolca ve daha fazlası',
      'Online grup + birebir ders seçenekleri',
    ],
    primaryLabel: 'Online Programları Gör',
    primaryHref: '/egitimlerimiz',
    secondaryLabel: 'Danışmanla Görüş',
    secondaryHref: '/iletisim',
    faq: [
      {
        question: 'Online dil kursunda dersler canlı mı?',
        answer:
          'Evet. Dersler canlı ve etkileşimlidir. Programa göre grup ya da birebir seçenekleri sunulur.',
      },
      {
        question: 'Konya dışında yaşayanlar kayıt olabilir mi?',
        answer:
          'Evet. Online dersler Türkiye genelinden katılıma açıktır.',
      },
      {
        question: 'Online eğitimde seviye tespit yapılıyor mu?',
        answer:
          'Evet. Seviye tespit sonrasında uygun online sınıfa veya birebir programa yerleştirme yapılır.',
      },
    ],
  },
  '/turkiye-online-dil-kursu': {
    title: 'Türkiye Online Dil Kursu',
    subtitle:
      'Konya merkezli Teachera uzmanlığıyla Türkiye geneline canlı online yabancı dil eğitimi. İngilizce, Almanca, İspanyolca ve diğer dillerde konuşma odaklı dersler.',
    bullets: [
      'Türkiye geneline özel online canlı dil programları',
      'Seviyeye göre online grup ve birebir ders seçenekleri',
      'Konya merkezli akademik koordinasyon ve düzenli öğrenme takibi',
    ],
    primaryLabel: 'Online Programları İncele',
    primaryHref: '/egitimlerimiz',
    secondaryLabel: 'Ücretsiz Seviye Tespiti',
    secondaryHref: '/seviye-tespit-sinavi',
    faq: [
      {
        question: 'Türkiye online dil kursu için hangi şehirlerden katılım var?',
        answer:
          'İstanbul, Ankara, İzmir dahil Türkiye’nin tüm şehirlerinden online sınıflara katılım sağlanabilir.',
      },
      {
        question: 'Online dil kurslarında dersler canlı mı, kayıt mı?',
        answer:
          'Dersler canlı yürütülür. Program yapısına göre grup veya birebir derslerde aktif konuşma pratiği yapılır.',
      },
      {
        question: 'Türkiye geneline uygun saat seçenekleri sunuluyor mu?',
        answer:
          'Evet. Çalışanlar ve öğrenciler için hafta içi/hafta sonu farklı saat bantlarında esnek planlama yapılır.',
      },
    ],
  },
};

function upsertJsonLd(id: string, payload: unknown) {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }
  script.text = JSON.stringify(payload);
}

export default function KonyaSeoLandingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isTurkeyPage = location.pathname === '/turkiye-online-dil-kursu';

  const content = useMemo(
    () => LANDING_CONTENT[location.pathname] || LANDING_CONTENT[DEFAULT_PATH],
    [location.pathname],
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const canonical = `${SITE_URL}${location.pathname}`;
    const areaServed = isTurkeyPage ? ['Türkiye'] : ['Konya', 'Türkiye'];
    const faqEntities = content.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    }));

    upsertJsonLd('teachera-konya-service-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: content.title,
      areaServed,
      provider: {
        '@type': 'LanguageSchool',
        name: 'Teachera Dil Okulu',
        url: SITE_URL,
      },
      url: canonical,
      serviceType: content.title,
    });

    upsertJsonLd('teachera-konya-faq-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqEntities,
    });

    upsertJsonLd('teachera-konya-breadcrumb-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Ana Sayfa',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: content.title,
          item: canonical,
        },
      ],
    });

    return () => {
      ['teachera-konya-service-jsonld', 'teachera-konya-faq-jsonld', 'teachera-konya-breadcrumb-jsonld'].forEach((id) => {
        const element = document.getElementById(id);
        if (element) element.remove();
      });
    };
  }, [content, isTurkeyPage, location.pathname]);

  const navigateFromLanding = (href: string, ctaId: string, position: 'hero' | 'related_links') => {
    trackSeoLandingCta({
      ctaId,
      destination: href,
      position,
    });
    navigate(href);
  };

  return (
    <div className="min-h-screen bg-[#F4EBD1]">
      <section className="relative bg-[#324D47] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 pt-34 md:pt-40 pb-18 md:pb-24 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 text-white/70 text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.12em] mb-8">
            <MapPin size={12} />
            KONYA & TÜRKİYE ODAKLI SAYFA
          </div>
          <h1 className="text-white text-[clamp(2rem,6vw,4rem)] leading-[1.04] font-['Neutraface_2_Text:Bold',sans-serif] mb-5">
            {content.title}
          </h1>
          <p className="max-w-[760px] text-white/80 text-[15px] md:text-[18px] leading-relaxed font-['Neutraface_2_Text:Book',sans-serif]">
            {content.subtitle}
          </p>
          <div className="flex flex-wrap gap-3 mt-9">
            <button
              onClick={() => navigateFromLanding(content.primaryHref, 'primary', 'hero')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#324D47] font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-[0.1em] hover:bg-[#e7e1cc] transition-colors cursor-pointer"
            >
              {content.primaryLabel}
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigateFromLanding(content.secondaryHref, 'secondary', 'hero')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/25 text-white font-['Neutraface_2_Text:Demi',sans-serif] text-[12px] tracking-[0.1em] hover:bg-white/10 transition-colors cursor-pointer"
            >
              {content.secondaryLabel}
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-6 lg:px-10 py-14 md:py-18">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {content.bullets.map((bullet) => (
            <div key={bullet} className="rounded-2xl border border-[#09090F]/10 bg-white p-5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#324D47] mt-0.5 shrink-0" />
                <p className="text-[#09090F]/80 text-[14px] leading-relaxed font-['Neutraface_2_Text:Book',sans-serif]">{bullet}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          <div className="rounded-2xl bg-[#09090F] p-6">
            <div className="inline-flex items-center gap-2 text-white/65 text-[11px] tracking-[0.12em] font-['Neutraface_2_Text:Demi',sans-serif] mb-3">
              <Users size={12} />
              KONYA MERKEZ
            </div>
            <p className="text-white/85 leading-relaxed text-[14px] font-['Neutraface_2_Text:Book',sans-serif]">
              Konya içindeki katılımcılar için yüz yüze sınıf ve kulüp seçenekleri aktif olarak sunulur; operasyon ve akademik koordinasyon merkezimiz Konya’dadır.
            </p>
          </div>
          <div className="rounded-2xl bg-[#324D47] p-6">
            <div className="inline-flex items-center gap-2 text-white/75 text-[11px] tracking-[0.12em] font-['Neutraface_2_Text:Demi',sans-serif] mb-3">
              <MonitorSmartphone size={12} />
              ONLINE MODEL
            </div>
            <p className="text-white/90 leading-relaxed text-[14px] font-['Neutraface_2_Text:Book',sans-serif]">
              Türkiye genelinden katılım için online canlı dersler ve program bazlı danışmanlık desteği verilir.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#09090F]/10 bg-white p-7 md:p-10">
          <h2 className="text-[#09090F] text-[24px] md:text-[30px] font-['Neutraface_2_Text:Bold',sans-serif] mb-6">
            Sık Sorulan Sorular
          </h2>
          <div className="space-y-5">
            {content.faq.map((item) => (
              <div key={item.question} className="pb-5 border-b border-[#09090F]/10 last:border-b-0 last:pb-0">
                <h3 className="text-[#09090F] text-[16px] font-['Neutraface_2_Text:Demi',sans-serif] mb-2.5">{item.question}</h3>
                <p className="text-[#09090F]/70 text-[14px] leading-relaxed font-['Neutraface_2_Text:Book',sans-serif]">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-[#09090F]/10 bg-white p-6">
          <h2 className="text-[#09090F] text-[18px] font-['Neutraface_2_Text:Demi',sans-serif] mb-4">
            Konya ve Türkiye Rehberi
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {SEO_LINKS.map((item) => (
              <button
                key={item.href}
                onClick={() => navigateFromLanding(item.href, item.href.replace(/\//g, '_').slice(1), 'related_links')}
                className={`px-4 py-2 rounded-full text-[12px] border transition-colors cursor-pointer ${
                  location.pathname === item.href
                    ? 'bg-[#324D47] border-[#324D47] text-white'
                    : 'bg-white border-[#09090F]/15 text-[#09090F]/75 hover:border-[#324D47]/40 hover:text-[#324D47]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
