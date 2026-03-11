import { useEffect } from 'react';
import { useNavigate } from 'react-router';

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

export default function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sayfa Bulunamadı | Teachera Konya';
    upsertMetaTag('name', 'description', 'Aradığınız sayfa bulunamadı. Teachera Konya ana sayfasına dönebilirsiniz.');
    upsertMetaTag('name', 'robots', 'noindex,follow,noarchive');
    upsertCanonicalLink('https://teachera.com.tr/');
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex items-center justify-center px-6">
      <div className="max-w-[720px] text-center">
        <h1 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[clamp(2rem,7vw,4rem)] leading-[1.05] mb-4">
          Sayfa bulunamadı
        </h1>
        <p className="font-['Neutraface_2_Text:Book',sans-serif] text-white/60 text-[15px] md:text-[18px] leading-relaxed mb-8">
          Aradığınız URL artık aktif olmayabilir. Konya ve Türkiye geneline sunduğumuz dil eğitim programlarına ana sayfadan devam edebilirsiniz.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-full bg-[#324D47] hover:bg-[#3d5e56] transition-colors font-['Neutraface_2_Text:Demi',sans-serif] text-[13px] tracking-[0.08em] cursor-pointer"
        >
          ANA SAYFAYA DÖN
        </button>
      </div>
    </div>
  );
}
