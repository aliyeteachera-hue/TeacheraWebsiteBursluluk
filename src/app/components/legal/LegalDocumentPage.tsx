import { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, ArrowUpRight, Download, FileText, ShieldCheck } from 'lucide-react';
import TeacheraLogo from '../../../imports/TeacheraLogo';
import EraSlogan from '../EraSlogan';
import { LEGAL_DOCUMENT_MAP } from './legalDocumentData';

const FALLBACK_SITE_URL = 'https://teachera.com.tr';
const SITE_URL = (import.meta.env.VITE_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, '');

function isBulletParagraph(text: string) {
  return text.trim().startsWith('•');
}

function normalizeParagraph(text: string) {
  return text.replace(/^•\s*/, '').trim();
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

export default function LegalDocumentPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const doc = useMemo(() => (slug ? LEGAL_DOCUMENT_MAP[slug] : undefined), [slug]);
  const paragraphCount = doc?.paragraphs.length ?? 0;

  useEffect(() => {
    if (!doc) {
      document.title = 'Hukuki Doküman Bulunamadı | Teachera';
      upsertMetaTag('name', 'description', 'Aradığınız hukuki doküman bulunamadı. Teachera hukuki metinler sayfasından güncel belgelere ulaşabilirsiniz.');
      upsertMetaTag('name', 'robots', 'noindex,follow,noarchive');
      upsertMetaTag('property', 'og:title', 'Hukuki Doküman Bulunamadı | Teachera');
      upsertMetaTag('property', 'og:description', 'Aradığınız hukuki doküman bulunamadı. Teachera hukuki metinler sayfasından güncel belgelere ulaşabilirsiniz.');
      upsertMetaTag('property', 'og:url', `${SITE_URL}/hukuki`);
      upsertCanonicalLink(`${SITE_URL}/hukuki`);
      return;
    }

    const canonicalUrl = `${SITE_URL}/hukuki/${doc.slug}`;
    document.title = `${doc.title} | Teachera Hukuki`;
    upsertMetaTag('name', 'description', doc.shortDescription);
    upsertMetaTag('name', 'robots', 'noindex,follow,noarchive');
    upsertMetaTag('property', 'og:title', `${doc.title} | Teachera Hukuki`);
    upsertMetaTag('property', 'og:description', doc.shortDescription);
    upsertMetaTag('property', 'og:url', canonicalUrl);
    upsertCanonicalLink(canonicalUrl);
  }, [doc]);

  if (!doc) {
    return (
      <div className="min-h-screen bg-[#0a0a10] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-white/40 text-[16px] mb-5 font-['Neutraface_2_Text:Book',sans-serif]">
            Hukuki doküman bulunamadı.
          </p>
          <button
            onClick={() => navigate('/hukuki')}
            className="h-[44px] px-6 rounded-full bg-[#E70000] hover:bg-[#c40000] text-white text-[12px] tracking-[0.12em] font-['Neutraface_2_Text:Demi',sans-serif] cursor-pointer transition-colors"
          >
            HUKUKİ METİNLERE DÖN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EBD1] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.22] pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[340px] h-[340px] rounded-full bg-[radial-gradient(circle,rgba(107,35,46,0.13),transparent_72%)]" />
        <div className="absolute -bottom-28 -right-24 w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(50,77,71,0.17),transparent_70%)]" />
      </div>

      <section className="bg-[#0a0a10] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] [background-size:34px_34px]" />
        </div>

        <div className="max-w-[1040px] mx-auto px-6 lg:px-12 pt-26 md:pt-30 pb-14 relative z-10">
          <button
            onClick={() => navigate('/hukuki')}
            className="inline-flex items-center gap-2 text-white/45 hover:text-white/75 transition-colors text-[11px] tracking-[0.18em] font-['Neutraface_2_Text:Demi',sans-serif] mb-8"
          >
            <ArrowLeft size={13} />
            TÜM HUKUKİ METİNLER
          </button>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-[120px] h-[24px] mb-6"
            style={{ '--fill-0': '#EEEBF5' } as React.CSSProperties}
          >
            <TeacheraLogo />
          </motion.div>

          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={14} className="text-[#E70000]" />
            <span className="text-[#E70000] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.26em] uppercase">
              {doc.kind}
            </span>
          </div>

          <h1 className="text-[clamp(1.8rem,4.8vw,3.2rem)] leading-[1.08] font-['Neutraface_2_Text:Bold',sans-serif] max-w-[860px]">
            {doc.title}
          </h1>

          <p className="mt-4 text-white/55 text-[15px] leading-relaxed font-['Neutraface_2_Text:Book',sans-serif] max-w-[760px]">
            {doc.shortDescription}
          </p>

          <EraSlogan className="mt-8 justify-start" />

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={doc.pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="h-[42px] px-5 rounded-full bg-[#E70000] hover:bg-[#c40000] text-white text-[12px] tracking-[0.1em] font-['Neutraface_2_Text:Demi',sans-serif] inline-flex items-center gap-2 transition-colors"
            >
              RESMİ PDF
              <Download size={14} />
            </a>
            <a
              href={doc.pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="h-[42px] px-5 rounded-full border border-white/20 hover:border-white/35 text-white/80 hover:text-white text-[12px] tracking-[0.1em] font-['Neutraface_2_Text:Demi',sans-serif] inline-flex items-center gap-2 transition-colors"
            >
              YENİ SEKMEDE AÇ
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-[1040px] mx-auto px-6 lg:px-12 py-10 md:py-14 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_290px] gap-6 lg:gap-7">
          <article className="rounded-2xl border border-[#324D47]/15 bg-white/75 p-5 md:p-8 shadow-[0_12px_30px_rgba(0,0,11,0.05)]">
            <div className="mb-7 p-4 md:p-5 rounded-2xl border border-[#324D47]/15 bg-[#F4EBD1]/70">
              <p className="text-[#324D47]/78 text-[13px] leading-relaxed font-['Neutraface_2_Text:Book',sans-serif]">
                Bu sayfa, ilgili belgenin webde okunabilir sürümüdür. Hukuki değerlendirme ve resmi süreçlerde{' '}
                <strong className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]">PDF sürümü</strong> esas alınır.
              </p>
            </div>

            <div className="space-y-4">
              {doc.paragraphs.map((paragraph, index) =>
                isBulletParagraph(paragraph) ? (
                  <p
                    key={`${index}-bullet`}
                    className="pl-4 relative text-[#324D47]/80 text-[15px] leading-[1.9] font-['Neutraface_2_Text:Book',sans-serif]"
                  >
                    <span className="absolute left-0 top-[0.45em] w-[6px] h-[6px] rounded-full bg-[#E70000]/75" />
                    {normalizeParagraph(paragraph)}
                  </p>
                ) : (
                  <p
                    key={`${index}-para`}
                    className={`text-[#324D47]/78 leading-[1.9] font-['Neutraface_2_Text:Book',sans-serif] ${
                      index === 0 ? 'text-[16px] md:text-[17px]' : 'text-[15px]'
                    }`}
                  >
                    {normalizeParagraph(paragraph)}
                  </p>
                ),
              )}
            </div>
          </article>

          <aside className="rounded-2xl border border-[#324D47]/15 bg-white/75 p-5 h-fit lg:sticky lg:top-28 shadow-[0_12px_30px_rgba(0,0,11,0.05)]">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={14} className="text-[#324D47]/70" />
              <span className="text-[10px] tracking-[0.16em] text-[#324D47]/60 font-['Neutraface_2_Text:Demi',sans-serif] uppercase">
                Belge Özeti
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-[12px] text-[#324D47]/55 font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.12em]">
                Tür
              </p>
              <p className="text-[14px] text-[#0a0a10] font-['Neutraface_2_Text:Demi',sans-serif]">{doc.kind}</p>

              <p className="pt-2 text-[12px] text-[#324D47]/55 font-['Neutraface_2_Text:Demi',sans-serif] uppercase tracking-[0.12em]">
                Paragraf
              </p>
              <p className="text-[14px] text-[#0a0a10] font-['Neutraface_2_Text:Demi',sans-serif]">{paragraphCount}</p>
            </div>

            <a
              href={doc.pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 h-[42px] px-5 rounded-full bg-[#324D47] hover:bg-[#3d5e56] text-white text-[12px] tracking-[0.1em] font-['Neutraface_2_Text:Demi',sans-serif] inline-flex items-center justify-center gap-2 transition-colors w-full"
            >
              PDF'İ AÇ
              <ArrowUpRight size={14} />
            </a>
          </aside>
        </div>
      </section>
    </div>
  );
}
