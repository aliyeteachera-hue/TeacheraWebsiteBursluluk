import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, FileText, ShieldCheck } from 'lucide-react';
import TeacheraLogo from '../../../imports/TeacheraLogo';
import EraSlogan from '../EraSlogan';
import { LEGAL_DOCUMENTS } from './legalDocumentData';

export default function LegalDocumentsPage() {
  useEffect(() => {
    document.title = 'Hukuki Metinler | Teachera';
  }, []);

  return (
    <div className="min-h-screen bg-[#F4EBD1] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.22] pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[340px] h-[340px] rounded-full bg-[radial-gradient(circle,rgba(107,35,46,0.12),transparent_72%)]" />
        <div className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(50,77,71,0.16),transparent_70%)]" />
      </div>

      <section className="relative bg-[#0a0a10] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] [background-size:34px_34px]" />
        </div>

        <div className="max-w-[1100px] mx-auto px-6 lg:px-12 pt-28 pb-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-[120px] h-[24px] mb-7"
            style={{ '--fill-0': '#EEEBF5' } as React.CSSProperties}
          >
            <TeacheraLogo />
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 text-[#E70000] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.3em] mb-6"
          >
            <ShieldCheck size={13} />
            TEACHERA HUKUKİ METİNLER
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="text-[clamp(2rem,5vw,3.8rem)] leading-[1.04] font-['Neutraface_2_Text:Bold',sans-serif] max-w-[900px]"
          >
            Hukuki metinleri webde okuyun,
            <br />
            <span className="text-white/85">resmî PDF’i tek tıkla açın.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="mt-6 text-white/55 max-w-[760px] text-[15px] leading-relaxed font-['Neutraface_2_Text:Book',sans-serif]"
          >
            Sayfadaki metinler hızlı okuma ve erişilebilirlik için hazırlanmıştır. Hukuki süreçlerde resmi belge
            olarak PDF sürümü esas alınır.
          </motion.p>

          <EraSlogan className="mt-9 justify-start" />
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-6 lg:px-12 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {LEGAL_DOCUMENTS.map((doc, index) => (
            <motion.article
              key={doc.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.03 }}
              className="group rounded-2xl border border-[#324D47]/15 bg-white/70 backdrop-blur-sm p-5 md:p-6 shadow-[0_12px_28px_rgba(0,0,11,0.04)] hover:shadow-[0_18px_34px_rgba(0,0,11,0.07)] hover:border-[#324D47]/28 transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} className="text-[#324D47]/70" />
                <span className="text-[10px] tracking-[0.16em] text-[#324D47]/60 font-['Neutraface_2_Text:Demi',sans-serif] uppercase">
                  {doc.kind}
                </span>
              </div>

              <h2 className="text-[#0a0a10] font-['Neutraface_2_Text:Bold',sans-serif] text-[21px] leading-tight mb-3">
                {doc.title}
              </h2>

              <p className="text-[#324D47]/70 text-[14px] leading-relaxed font-['Neutraface_2_Text:Book',sans-serif] min-h-[72px]">
                {doc.shortDescription}
              </p>

              <div className="mt-5 flex items-center gap-3">
                <a
                  href={`/hukuki/${doc.slug}`}
                  className="h-[40px] px-4 rounded-full bg-[#00000B] hover:bg-[#68232E] text-white text-[12px] tracking-[0.08em] font-['Neutraface_2_Text:Demi',sans-serif] transition-colors inline-flex items-center gap-2"
                >
                  WEBDE OKU
                  <ArrowUpRight size={13} className="group-hover:translate-x-[1px] group-hover:-translate-y-[1px] transition-transform" />
                </a>
                <a
                  href={doc.pdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-[40px] px-4 rounded-full border border-[#324D47]/25 text-[#324D47] hover:bg-[#324D47]/10 text-[12px] tracking-[0.08em] font-['Neutraface_2_Text:Demi',sans-serif] transition-colors inline-flex items-center"
                >
                  PDF
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
