import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Megaphone, Mail } from 'lucide-react';
import { openMailDraft } from './formMailto';
import { isValidTrMobilePhone, normalizeTrMobileInput, TR_MOBILE_PATTERN, TR_MOBILE_TITLE } from './phoneUtils';
import { FORM_UI_MESSAGES } from '../lib/formUiMessages';
import { useFormSubmission } from '../lib/useFormSubmission';

interface AmbassadorApplicationForm {
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  profileType: string;
  country: string;
  city: string;
  nationality: string;
  educationLevel: string;
  educationSummary: string;
  experienceSummary: string;
  referralPlan: string;
  audienceSize: string;
  socialLinks: string;
  note: string;
}

const INITIAL_FORM: AmbassadorApplicationForm = {
  fullName: '',
  phone: '',
  email: '',
  birthDate: '',
  profileType: '',
  country: '',
  city: '',
  nationality: '',
  educationLevel: '',
  educationSummary: '',
  experienceSummary: '',
  referralPlan: '',
  audienceSize: '',
  socialLinks: '',
  note: '',
};

const inputBase =
  "w-full h-[44px] bg-white rounded-[16px] px-4 text-[14px] font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F] placeholder:text-[#686767] outline-none border border-[#09090F]/10 focus:border-[#324D47]/50 focus:ring-2 focus:ring-[#324D47]/15 transition-all";

const textareaBase =
  "w-full min-h-[112px] bg-white rounded-[16px] px-4 py-3 text-[14px] font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F] placeholder:text-[#686767] outline-none border border-[#09090F]/10 focus:border-[#324D47]/50 focus:ring-2 focus:ring-[#324D47]/15 transition-all resize-y";

export default function AmbassadorPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AmbassadorApplicationForm>(INITIAL_FORM);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    isSubmitting,
    fieldError,
    submitError,
    setFieldError,
    clearErrors,
    runSubmission,
  } = useFormSubmission({ defaultSubmitErrorMessage: FORM_UI_MESSAGES.submitFailed });
  const isPhoneValid = isValidTrMobilePhone(formData.phone);

  const handleField = <K extends keyof AmbassadorApplicationForm>(key: K, value: AmbassadorApplicationForm[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: normalizeTrMobileInput(value) }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    clearErrors();
    setSuccessMessage(null);

    if (!isPhoneValid) {
      setFieldError(FORM_UI_MESSAGES.phone);
      return;
    }

    const sent = await runSubmission(() =>
      openMailDraft({
        to: 'ambassador@teachera.com.tr',
        subject: 'Teachera Elci Programi Basvurusu',
        lines: [
          `Ad Soyad: ${formData.fullName}`,
          `Telefon: +90 ${formData.phone}`,
          `E-posta: ${formData.email || '-'}`,
          `Dogum Tarihi: ${formData.birthDate}`,
          `Profil Tipi: ${formData.profileType}`,
          `Yasanan Ulke: ${formData.country}`,
          `Sehir: ${formData.city}`,
          `Milliyet: ${formData.nationality}`,
          `Egitim Durumu: ${formData.educationLevel}`,
          `Egitim Ozeti: ${formData.educationSummary}`,
          `Tecrube Ozeti: ${formData.experienceSummary}`,
          `Teachera Refere Plani: ${formData.referralPlan}`,
          `Ulasilan Kitle Buyuklugu: ${formData.audienceSize}`,
          `Sosyal Medya/Topluluk Linkleri: ${formData.socialLinks || '-'}`,
          `Ek Not: ${formData.note || '-'}`,
          'Kaynak: Elci Ol Basvuru Formu',
        ],
      }),
    );

    if (!sent) return;

    setSuccessMessage('Başvurunuz alındı. Uygunluk değerlendirmesi sonrası sizinle iletişime geçeceğiz.');
    setFormData(INITIAL_FORM);
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
            <Megaphone size={14} />
            Topluluk
          </div>

          <h1 className="text-[#09090F] text-[30px] md:text-[42px] leading-[1.05] font-['Neutraface_2_Text:Bold',sans-serif] mb-4">
            Elçi Ol
          </h1>

          <p className="text-[#09090F]/70 text-[15px] md:text-[17px] leading-relaxed font-['Neutraface_2_Text:Book',sans-serif] mb-8">
            Teachera’yı yabancı dil eğitimi almak isteyen kişilere referans eden elçiler, doğrulanan yönlendirmeleri için ödeme alabilir.
            Başvuruları durumunuza göre değerlendirip uygun adaylarla iletişime geçiyoruz.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <InfoCard
              label="Elçilik Başvuru E-posta"
              value="ambassador@teachera.com.tr"
              href="mailto:ambassador@teachera.com.tr?subject=Teachera%20Elci%20Programi%20Basvurusu"
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
              <select
                required
                value={formData.profileType}
                onChange={(e) => handleField('profileType', e.target.value)}
                className={inputBase}
              >
                <option value="">Başvuru Profili Seçiniz</option>
                <option value="Okul Aile Birligi Uyesi">Okul Aile Birliği Üyesi</option>
                <option value="Influencer / Icerik Ureticisi">Influencer / İçerik Üreticisi</option>
                <option value="Topluluk Lideri">Topluluk Lideri</option>
                <option value="Kampus / Ogrenci Kulubu">Kampüs / Öğrenci Kulübü</option>
                <option value="Ogretmen / Egitimci">Öğretmen / Eğitimci</option>
                <option value="Diger">Diğer</option>
              </select>
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
                type="text"
                required
                placeholder="Ulaşabildiğiniz Tahmini Kitle (örn. 500+ kişi)"
                value={formData.audienceSize}
                onChange={(e) => handleField('audienceSize', e.target.value)}
                className={inputBase}
              />
              <input
                type="url"
                placeholder="Sosyal Medya / Topluluk Linkleri (Opsiyonel)"
                value={formData.socialLinks}
                onChange={(e) => handleField('socialLinks', e.target.value)}
                className={inputBase}
              />
            </div>

            <textarea
              required
              placeholder="Kısaca eğitim durumunun özeti"
              value={formData.educationSummary}
              onChange={(e) => handleField('educationSummary', e.target.value)}
              className={textareaBase}
            />

            <textarea
              required
              placeholder="Tecrübe özeti (referans, topluluk veya satış/yönlendirme deneyimi)"
              value={formData.experienceSummary}
              onChange={(e) => handleField('experienceSummary', e.target.value)}
              className={textareaBase}
            />

            <textarea
              required
              placeholder="Teachera’yı nerede ve nasıl referans edeceğinizi kısaca açıklayınız"
              value={formData.referralPlan}
              onChange={(e) => handleField('referralPlan', e.target.value)}
              className={textareaBase}
            />

            <textarea
              placeholder="Eklemek istediğiniz not"
              value={formData.note}
              onChange={(e) => handleField('note', e.target.value)}
              className={textareaBase}
            />

            {fieldError && (
              <p
                className="rounded-xl px-4 py-3 text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] bg-[#FFF3F1] text-[#68232E] border border-[#E70000]/25"
              >
                {fieldError}
              </p>
            )}

            {submitError && (
              <p className="rounded-xl px-4 py-3 text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] bg-[#FFF3F1] text-[#68232E] border border-[#E70000]/25">
                {submitError}
              </p>
            )}

            {successMessage && (
              <p className="rounded-xl px-4 py-3 text-[13px] font-['Neutraface_2_Text:Demi',sans-serif] bg-[#324D47]/10 text-[#324D47] border border-[#324D47]/25">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !isPhoneValid}
              className="h-[46px] px-7 rounded-full bg-[#324D47] text-white hover:bg-[#3d5e56] transition-colors font-['Neutraface_2_Text:Demi',sans-serif] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? FORM_UI_MESSAGES.submitting : 'Başvuruyu Gönder'}
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
