import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Headset, Mail } from 'lucide-react';
import { openMailDraft } from './formMailto';
import { isValidTrMobilePhone, normalizeTrMobileInput, TR_MOBILE_PATTERN, TR_MOBILE_TITLE } from './phoneUtils';
import { FORM_UI_MESSAGES } from '../lib/formUiMessages';
import { useFormSubmission } from '../lib/useFormSubmission';
import { DatePickerInput, parseISODate, toISODateString } from './form/DatePickerInput';

interface CustomerRepresentativeForm {
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  profileType: string;
  country: string;
  city: string;
  nationality: string;
  educationLevel: string;
  educationDepartment: string;
  targetArea: string;
  workModel: string;
  availability: string;
  weeklyLeadCapacity: string;
  experienceSummary: string;
  representationPlan: string;
  socialLinks: string;
  note: string;
}

const INITIAL_FORM: CustomerRepresentativeForm = {
  fullName: '',
  phone: '',
  email: '',
  birthDate: '',
  profileType: '',
  country: '',
  city: '',
  nationality: '',
  educationLevel: '',
  educationDepartment: '',
  targetArea: '',
  workModel: '',
  availability: '',
  weeklyLeadCapacity: '',
  experienceSummary: '',
  representationPlan: '',
  socialLinks: '',
  note: '',
};

const inputBase =
  "w-full h-[44px] bg-white rounded-[16px] px-4 text-[14px] font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F] placeholder:text-[#686767] outline-none border border-[#09090F]/10 focus:border-[#324D47]/50 focus:ring-2 focus:ring-[#324D47]/15 transition-all";

const textareaBase =
  "w-full min-h-[112px] bg-white rounded-[16px] px-4 py-3 text-[14px] font-['Neutraface_2_Text:Book',sans-serif] text-[#09090F] placeholder:text-[#686767] outline-none border border-[#09090F]/10 focus:border-[#324D47]/50 focus:ring-2 focus:ring-[#324D47]/15 transition-all resize-y";

export default function CustomerRepresentativePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CustomerRepresentativeForm>(INITIAL_FORM);
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
  const birthDate = parseISODate(formData.birthDate);

  const handleField = <K extends keyof CustomerRepresentativeForm>(key: K, value: CustomerRepresentativeForm[K]) => {
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

    if (!formData.birthDate) {
      setFieldError(FORM_UI_MESSAGES.required);
      return;
    }

    if (!isPhoneValid) {
      setFieldError(FORM_UI_MESSAGES.phone);
      return;
    }

    const sent = await runSubmission(() =>
      openMailDraft({
        to: 'representative@teachera.com.tr',
        subject: 'Musteri Temsilcisi Basvurusu',
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
          `Bolum / Alan: ${formData.educationDepartment}`,
          `Hedef Calisma Bolgesi: ${formData.targetArea}`,
          `Calisma Modeli: ${formData.workModel}`,
          `Ders Disi Musaitlik ve Calisma Saatleri: ${formData.availability}`,
          `Haftalik Tahmini Gorusme Kapasitesi: ${formData.weeklyLeadCapacity}`,
          `Satis / Iletisim Tecrube Ozeti: ${formData.experienceSummary}`,
          `Teachera Temsil Plani: ${formData.representationPlan}`,
          `Sosyal Medya/Topluluk Linkleri: ${formData.socialLinks || '-'}`,
          `Ek Not: ${formData.note || '-'}`,
          'Calisma Modeli Bilgisi: Duzenli saat + satis uzerinden prim',
          'Kaynak: Musteri Temsilcisi Basvuru Formu',
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
            <Headset size={14} />
            Kariyer
          </div>

          <h1 className="text-[#09090F] text-[30px] md:text-[42px] leading-[1.05] font-['Neutraface_2_Text:Bold',sans-serif] mb-4">
            Müşteri Temsilcisi Ol
          </h1>

          <p className="text-[#09090F]/70 text-[15px] md:text-[17px] leading-relaxed font-['Neutraface_2_Text:Book',sans-serif] mb-8">
            Müşteri temsilcilerimiz; yabancı dil ihtiyacının yüksek olduğu kampüs ve yoğun bölgelerde Teachera’yı tanıtır,
            aday sorularını yönetir ve kayıt süreçlerine yönlendirir. Çalışma sistemi düzenli saat + satış üzerinden prim modelindedir.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <InfoCard
              label="Başvuru E-posta"
              value="representative@teachera.com.tr"
              href="mailto:representative@teachera.com.tr?subject=Musteri%20Temsilcisi%20Basvuru%20-%20Teachera"
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
              <DatePickerInput
                value={birthDate}
                onChange={(date) => handleField('birthDate', toISODateString(date))}
                placeholder="Doğum Tarihi"
                maxDate={new Date()}
                inputClassName={`${inputBase} text-left flex items-center justify-between cursor-pointer`}
                panelClassName="absolute top-full left-0 right-0 mt-2 bg-white rounded-[20px] shadow-xl shadow-black/20 border border-black/5 overflow-hidden z-30 p-4"
                indicator="calendar"
                indicatorClassName="text-[#686767]"
              />
              <select
                required
                value={formData.profileType}
                onChange={(e) => handleField('profileType', e.target.value)}
                className={inputBase}
              >
                <option value="">Başvuru Profili Seçiniz</option>
                <option value="Universite Ogrencisi">Üniversite Öğrencisi</option>
                <option value="Yeni Mezun">Yeni Mezun</option>
                <option value="Topluluk Lideri">Topluluk Lideri</option>
                <option value="Saha Satis Deneyimli">Saha Satış Deneyimli</option>
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
                placeholder="Bölüm / Alan"
                value={formData.educationDepartment}
                onChange={(e) => handleField('educationDepartment', e.target.value)}
                className={inputBase}
              />
              <input
                type="text"
                required
                placeholder="Hedef Çalışma Bölgesi (örn. kampüs, AVM, cadde)"
                value={formData.targetArea}
                onChange={(e) => handleField('targetArea', e.target.value)}
                className={inputBase}
              />
              <select
                required
                value={formData.workModel}
                onChange={(e) => handleField('workModel', e.target.value)}
                className={inputBase}
              >
                <option value="">Çalışma Modeli Seçiniz</option>
                <option value="Sahada Ziyaret">Sahada Ziyaret</option>
                <option value="Sabit Nokta / Stant">Sabit Nokta / Stant</option>
                <option value="Hibrit">Hibrit</option>
              </select>
              <input
                type="text"
                required
                placeholder="Haftalık Tahmini Görüşme Kapasitesi (örn. 40+ kişi)"
                value={formData.weeklyLeadCapacity}
                onChange={(e) => handleField('weeklyLeadCapacity', e.target.value)}
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
              placeholder="Ders dışı düzenli çalışabileceğiniz gün/saat aralığını yazınız"
              value={formData.availability}
              onChange={(e) => handleField('availability', e.target.value)}
              className={textareaBase}
            />

            <textarea
              required
              placeholder="Satış / iletişim tecrübe özeti"
              value={formData.experienceSummary}
              onChange={(e) => handleField('experienceSummary', e.target.value)}
              className={textareaBase}
            />

            <textarea
              required
              placeholder="Teachera’yı hangi bölgede ve nasıl temsil edeceğinizi kısaca açıklayınız"
              value={formData.representationPlan}
              onChange={(e) => handleField('representationPlan', e.target.value)}
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
