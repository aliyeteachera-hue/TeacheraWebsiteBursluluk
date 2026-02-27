import { useNavigate } from 'react-router';
import { ArrowLeft, Headset, Mail, Phone } from 'lucide-react';

export default function CustomerRepresentativePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-6 py-16 md:py-20">
      <div className="max-w-[920px] mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[#324D47] hover:text-[#3d5e56] transition-colors mb-10 font-['Neutraface_2_Text:Demi',sans-serif]"
        >
          <ArrowLeft size={16} />
          Geri Dön
        </button>

        <div className="bg-white border border-[#324D47]/15 rounded-3xl p-7 md:p-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#324D47]/10 text-[#324D47] text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.08em] uppercase mb-5">
            <Headset size={14} />
            Kariyer
          </div>

          <h1 className="text-[#09090F] text-[30px] md:text-[42px] leading-[1.05] font-['Neutraface_2_Text:Bold',sans-serif] mb-4">
            Müşteri Temsilcisi Ol
          </h1>

          <p className="text-[#09090F]/70 text-[15px] md:text-[17px] leading-relaxed font-['Neutraface_2_Text:Book',sans-serif] mb-8">
            Danışan adaylarının ihtiyaç analizinden kayıt sonrası memnuniyet takibine kadar uzanan süreçlerde bizimle
            çalışmak istersen bu alandan başvurabilirsin. Güncel ilanlar kısa süre içinde yayınlanacaktır.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <InfoCard label="Başvuru E-posta" value="data@teachera.com.tr" href="mailto:data@teachera.com.tr?subject=Musteri%20Temsilcisi%20Basvuru%20-%20Teachera" icon={<Mail size={14} />} />
            <InfoCard label="İletişim Telefon" value="0332 236 80 66" href="tel:03322368066" icon={<Phone size={14} />} />
          </div>

          <button
            onClick={() => navigate('/iletisim')}
            className="h-[46px] px-7 rounded-full bg-[#324D47] text-white hover:bg-[#3d5e56] transition-colors font-['Neutraface_2_Text:Demi',sans-serif]"
          >
            İletişim Formuna Git
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group rounded-2xl border border-[#324D47]/15 hover:border-[#324D47]/40 bg-[#FAFAF8] px-4 py-4 transition-colors"
    >
      <div className="flex items-center gap-2 text-[#324D47] text-[12px] uppercase tracking-[0.08em] font-['Neutraface_2_Text:Demi',sans-serif] mb-1.5">
        {icon}
        {label}
      </div>
      <p className="text-[#09090F] text-[16px] font-['Neutraface_2_Text:Demi',sans-serif] group-hover:text-[#324D47] transition-colors">
        {value}
      </p>
    </a>
  );
}
