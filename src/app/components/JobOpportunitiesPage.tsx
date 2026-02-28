import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Briefcase, Mail } from 'lucide-react';
import { openMailDraft } from './formMailto';
import { isValidTrMobilePhone, normalizeTrMobileInput, TR_MOBILE_PATTERN, TR_MOBILE_TITLE } from './phoneUtils';

interface JobApplicationForm {
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  position: string;
  country: string;
  city: string;
  nationality: string;
  educationLevel: string;
  educationSummary: string;
  experienceSummary: string;
  cvLink: string;
  profileLink: string;
  note: string;
}

const INITIAL_FORM: JobApplicationForm = {
  fullName: '',
  phone: '',
  email: '',
  birthDate: '',
  position: '',
  country: '',
  city: '',
  nationality: '',
  educationLevel: '',
  educationSummary: '',
  experienceSummary: '',
  cvLink: '',
  profileLink: '',
  note: '',
};

const inputBase =
  "w-full h-[44px] bg-white rounded-[16px] px-4 text-[14px] font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F] placeholder:text-[#686767] outline-none border border-[#09090F]/10 focus:border-[#324D47]/50 focus:ring-2 focus:ring-[#324D47]/15 transition-all";

const textareaBase =
  "w-full min-h-[112px] bg-white rounded-[16px] px-4 py-3 text-[14px] font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F] placeholder:text-[#686767] outline-none border border-[#09090F]/10 focus:border-[#324D47]/50 focus:ring-2 focus:ring-[#324D47]/15 transition-all resize-y";

export default function JobOpportunitiesPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<JobApplicationForm>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const isPhoneValid = isValidTrMobilePhone(formData.phone);

  const handleField = <K extends keyof JobApplicationForm>(key: K, value: JobApplicationForm[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: normalizeTrMobileInput(value) }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!isPhoneValid) return;

    setIsSubmitting(true);
    setFeedback(null);

    const sent = await openMailDraft({
      to: 'cv@teachera.com.tr',
      subject: 'İş Başvurusu Formu',
      lines: [
        `Ad Soyad: ${formData.fullName}`,
        `Telefon: +90 ${formData.phone}`,
        `E-posta: ${formData.email || '-'}`,
        `Dogum Tarihi: ${formData.birthDate}`,
        `Basvurulan Pozisyon: ${formData.position}`,
        `Yasanan Ulke: ${formData.country}`,
        `Sehir: ${formData.city}`,
        `Milliyet: ${formData.nationality}`,
        `Egitim Durumu: ${formData.educationLevel}`,
        `Egitim Ozeti: ${formData.educationSummary}`,
        `Tecrube Ozeti: ${formData.experienceSummary}`,
        `CV Linki: ${formData.cvLink || '-'}`,
        `LinkedIn/Portfoy URL: ${formData.profileLink || '-'}`,
        `Ek Not: ${formData.note || '-'}`,
        'Telefonla Arama Izni: Hayir',
        'Iletisim Tercihi: E-posta',
        'Kaynak: Is Firsatlari Basvuru Formu',
      ],
    });

    if (sent) {
      setFeedback({ type: 'success', text: 'Başvurunuz alındı. Uygunluk değerlendirmesi sonrası sizinle iletişime geçeceğiz.' });
      setFormData(INITIAL_FORM);
    } else {
      setFeedback({ type: 'error', text: 'Başvuru gönderilemedi. Lütfen tekrar deneyin.' });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-6 py-16 md:py-20">
      <div className="max-w-[980px] mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[#324D47] hover:text-[#3d5e56] transition-colors mb-10 font-['Neutraface_2_Text:Demi',sans-serif]"
        >
          <ArrowLeft size={16} />
          Geri Dön
        </button>

        <div className="bg-white border border-[#324D47]/15 rounded-3xl p-7 md:p-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#324D47]/10 text-[#324D47] text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.08em] uppercase mb-5">
            <Briefcase size={14} />
            Kariyer
          </div>

          <h1 className="text-[#09090F] text-[30px] md:text-[42px] leading-[1.05] font-['Neutraface_2_Text:Bold',sans-serif] mb-4">
            İş Fırsatları
          </h1>

          <p className="text-[#09090F]/70 text-[15px] md:text-[17px] leading-relaxed font-['Neutraface_2_Text:Book',sans-serif] mb-8">
            Başvurular yalnızca e-posta üzerinden veya form yoluyla değerlendirilir.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <InfoCard
              label="Başvuru E-posta"
              value="cv@teachera.com.tr"
              href="mailto:cv@teachera.com.tr?subject=Is%20Basvurusu%20-%20Teachera"
              icon={<Mail size={14} />}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="İsim Soyisim"
                value={formData.fullName}
                onChange={(e) => handleField('fullName', e.target.value)}
                className={inputBase}
              />
              <input
                type="tel"
                required
                placeholder="Telefon (5XX XXX XX XX)"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                pattern={TR_MOBILE_PATTERN}
                title={TR_MOBILE_TITLE}
                inputMode="numeric"
                className={`${inputBase} ${!isPhoneValid && formData.phone ? 'border-[#E70000]/60 focus:border-[#E70000]/60 focus:ring-[#E70000]/15' : ''}`}
              />
              <input
                type="email"
                placeholder="E-posta"
                value={formData.email}
                onChange={(e) => handleField('email', e.target.value)}
                className={inputBase}
              />
              <input
                type="date"
                lang="tr-TR"
                required
                value={formData.birthDate}
                onChange={(e) => handleField('birthDate', e.target.value)}
                className={inputBase}
              />
              <input
                type="text"
                required
                placeholder="Başvurmak İstediği Pozisyon"
                value={formData.position}
                onChange={(e) => handleField('position', e.target.value)}
                className={inputBase}
              />
              <input
                type="text"
                required
                placeholder="Yaşadığı Ülke"
                value={formData.country}
                onChange={(e) => handleField('country', e.target.value)}
                className={inputBase}
              />
              <input
                type="text"
                required
                placeholder="Şehir"
                value={formData.city}
                onChange={(e) => handleField('city', e.target.value)}
                className={inputBase}
              />
              <input
                type="text"
                required
                placeholder="Milliyet"
                value={formData.nationality}
                onChange={(e) => handleField('nationality', e.target.value)}
                className={inputBase}
              />
              <select
                required
                value={formData.educationLevel}
                onChange={(e) => handleField('educationLevel', e.target.value)}
                className={inputBase}
              >
                <option value="">Eğitim Durumu Seçiniz</option>
                <option value="Lise">Lise</option>
                <option value="Ön Lisans">Ön Lisans</option>
                <option value="Lisans">Lisans</option>
                <option value="Yüksek Lisans">Yüksek Lisans</option>
                <option value="Doktora">Doktora</option>
                <option value="Diğer">Diğer</option>
              </select>
              <input
                type="url"
                placeholder="CV Linki (Opsiyonel)"
                value={formData.cvLink}
                onChange={(e) => handleField('cvLink', e.target.value)}
                className={inputBase}
              />
              <input
                type="url"
                placeholder="LinkedIn / Portföy URL (Opsiyonel)"
                value={formData.profileLink}
                onChange={(e) => handleField('profileLink', e.target.value)}
                className={inputBase}
              />
            </div>

            {!isPhoneValid && formData.phone && (
              <p className="text-[12px] text-[#9C2735] font-['Neutraface_2_Text:Book',sans-serif]">
                Telefon numarası 5XX XXX XX XX formatında olmalıdır.
              </p>
            )}

            <textarea
              required
              placeholder="Kısaca eğitim durumunun özeti"
              value={formData.educationSummary}
              onChange={(e) => handleField('educationSummary', e.target.value)}
              className={textareaBase}
            />

            <textarea
              required
              placeholder="Tecrübe özeti"
              value={formData.experienceSummary}
              onChange={(e) => handleField('experienceSummary', e.target.value)}
              className={textareaBase}
            />

            <textarea
              placeholder="Eklemek istediğiniz not"
              value={formData.note}
              onChange={(e) => handleField('note', e.target.value)}
              className={textareaBase}
            />

            {feedback && (
              <p
                className={`rounded-xl px-4 py-3 text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] ${
                  feedback.type === 'success'
                    ? 'bg-[#324D47]/10 text-[#324D47] border border-[#324D47]/25'
                    : 'bg-[#FFF3F1] text-[#68232E] border border-[#E70000]/25'
                }`}
              >
                {feedback.text}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !isPhoneValid}
              className="h-[46px] px-7 rounded-full bg-[#324D47] text-white hover:bg-[#3d5e56] transition-colors font-['Neutraface_2_Text:Demi',sans-serif] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
            </button>
          </form>
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
