import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Check, Mail, Lock, User, Phone, ChevronDown, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import imgHeroImage from "figma:asset/fc31d891571779da1d514055d08ebb51d4ccb03e.webp";
import { isValidTrMobilePhone, normalizeTrMobileInput, TR_MOBILE_PATTERN, TR_MOBILE_TITLE } from './phoneUtils';

type AuthMode = 'login' | 'register';
const LOGIN_PORTAL_URL = 'https://teachera.dlpro.eu/';
const LEGAL_PRIVACY_URL = '/hukuki/gizlilik-politikasi';
const LEGAL_MEMBERSHIP_URL = '/hukuki/uyelik-sozlesmesi';
const LEGAL_KVKK_URL = '/hukuki/musteri-aydinlatma-metni';
const GOOGLE_PRIVACY_URL = 'https://policies.google.com/privacy';
const GOOGLE_TERMS_URL = 'https://policies.google.com/terms';

const inputBase =
  "w-full h-[44px] bg-white rounded-[30px] px-5 text-[14px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#00000B] placeholder:text-[#686767] outline-none border border-black/5 focus:border-[#324D47]/50 focus:ring-2 focus:ring-[#324D47]/15 transition-all";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');

  return (
    <div className="relative min-h-screen w-full bg-[#00000B] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={imgHeroImage} alt="Teachera Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,11,0.5)] via-[rgba(50,77,71,0.35)] to-[rgba(0,0,11,0.65)]" />
        <div className="absolute inset-0 bg-[#00000B]/15 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-24 md:py-32">
        <h1 className="sr-only">Teachera Öğrenci Portalı Giriş ve Kayıt Sayfası</h1>
        <AnimatePresence mode="wait">
          {mode === 'login' ? (
            <LoginForm key="login" onSwitch={() => setMode('register')} />
          ) : (
            <RegisterForm key="register" onSwitch={() => setMode('login')} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── FIELD WRAPPER ─────────────────────────────────────────────────────── */
function FieldWrap({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-1.5 font-['Neutraface_2_Text:Book',sans-serif] text-[14px] text-white">
        <span className="text-white/60">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── CONSENT ROW ───────────────────────────────────────────────────────── */
function ConsentRow({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-start gap-2.5 text-left group">
      <div
        className={`w-4 h-4 mt-[2px] rounded-[3px] border flex items-center justify-center transition-all duration-200 shrink-0 ${
          checked ? 'bg-[#E70000] border-[#E70000]' : 'bg-white border-[#64748b] group-hover:border-white'
        }`}
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
      <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] text-white/80 leading-relaxed">
        {children}
      </span>
    </button>
  );
}

/* ─── LOGIN FORM ────────────────────────────────────────────────────────── */
function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    window.open(LOGIN_PORTAL_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
      className="w-full max-w-[580px]"
    >
      <div className="relative bg-[rgba(50,77,71,0.55)] backdrop-blur-xl rounded-[30px] border border-white/20 shadow-2xl shadow-black/20 overflow-hidden">
        {/* Glass shine */}
        <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 p-7 md:p-10">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-[1px] bg-white/40" />
              <span className="text-[10px] text-white/70 font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.25em] uppercase">
                Öğrenci Portalı
              </span>
              <div className="w-6 h-[1px] bg-white/40" />
            </div>
            <h2 className="font-['Neutraface_2_Text:Demi',sans-serif] text-[26px] md:text-[32px] text-white leading-tight mb-2">
              Hoş Geldiniz
            </h2>
            <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] md:text-[14px] text-white/70 max-w-[420px] leading-relaxed">
              Giriş yapın ve portalımızın sunduğu fırsatlardan yararlanın.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <FieldWrap icon={<Mail size={14} />} label="E-posta Adresiniz">
              <input
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBase}
                required
              />
            </FieldWrap>

            {/* Password */}
            <FieldWrap icon={<Lock size={14} />} label="Şifreniz">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifre Giriniz"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} pr-12`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#686767] hover:text-[#324D47] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </FieldWrap>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2.5 group"
              >
                <div className={`w-4 h-4 rounded-[3px] border flex items-center justify-center transition-all duration-200 ${
                  rememberMe
                    ? 'bg-[#324D47] border-[#324D47]'
                    : 'bg-white border-[#64748b] group-hover:border-white'
                }`}>
                  {rememberMe && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] text-white/80">
                  Beni Hatırla
                </span>
              </button>
              <button
                type="button"
                onClick={() => window.open(LOGIN_PORTAL_URL, '_blank', 'noopener,noreferrer')}
                className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] text-white/80 hover:text-[#F4EBD1] transition-colors underline decoration-white/30 underline-offset-2"
              >
                Parolanızı mı Unuttunuz?
              </button>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-[48px] bg-[#00000B] hover:bg-[#68232E] rounded-[30px] flex items-center justify-center gap-2.5 transition-colors duration-300 mt-1"
            >
              <LogIn size={15} className="text-white" />
              <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] text-white tracking-wide">
                Giriş Yap
              </span>
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-1">
              <div className="flex-1 h-[1px] bg-white/15" />
              <span className="text-[11px] text-white/40 font-['Neutraface_2_Text:Book',sans-serif]">veya</span>
              <div className="flex-1 h-[1px] bg-white/15" />
            </div>

            {/* Switch to Register */}
            <button
              type="button"
              onClick={onSwitch}
              className="w-full h-[48px] rounded-[30px] flex items-center justify-center gap-2.5 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300 group"
            >
              <UserPlus size={15} className="text-white/70 group-hover:text-white transition-colors" />
              <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[14px] text-white/70 group-hover:text-white transition-colors">
                Hesap Oluştur
              </span>
              <ArrowRight size={14} className="text-white/40 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* ReCAPTCHA */}
            <p className="text-center font-['Neutraface_2_Text:Book',sans-serif] text-[11px] text-white/40 leading-relaxed">
              ReCAPTCHA tarafından korunmaktadır ve Google{' '}
              <a
                href={GOOGLE_PRIVACY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline cursor-pointer hover:text-white/60"
              >
                Gizlilik Politikası
              </a>{' '}
              ve{' '}
              <a
                href={GOOGLE_TERMS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline cursor-pointer hover:text-white/60"
              >
                Hizmet Şartları
              </a>'na tabidir.
            </p>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── REGISTER FORM ─────────────────────────────────────────────────────── */
function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const isPhoneValid = isValidTrMobilePhone(phone);

  const handlePhoneChange = (value: string) => {
    setPhone(normalizeTrMobileInput(value));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !password || !passwordConfirm || !isPhoneValid) return;
    if (password !== passwordConfirm) return;
    if (!termsConsent || !privacyConsent) return;
    window.open(LOGIN_PORTAL_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
      className="w-full max-w-[580px]"
    >
      <div className="relative bg-[rgba(50,77,71,0.55)] backdrop-blur-xl rounded-[30px] border border-white/20 shadow-2xl shadow-black/20 overflow-hidden">
        {/* Glass shine */}
        <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 p-7 md:p-10">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-[1px] bg-white/40" />
              <span className="text-[10px] text-white/70 font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.25em] uppercase">
                Yeni Hesap
              </span>
              <div className="w-6 h-[1px] bg-white/40" />
            </div>
            <h2 className="font-['Neutraface_2_Text:Demi',sans-serif] text-[26px] md:text-[32px] text-white leading-tight mb-2">
              Hesap Oluştur
            </h2>
            <p className="font-['Neutraface_2_Text:Book',sans-serif] text-[13px] md:text-[14px] text-white/70 max-w-[420px] leading-relaxed">
              Hesap oluşturun ve portalımızın sunduğu fırsatları kullanın.
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            {/* Ad Soyad */}
            <FieldWrap icon={<User size={14} />} label="Adınız Soyadınız">
              <input
                type="text"
                placeholder="Adınız Soyadınız"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputBase}
                required
              />
            </FieldWrap>

            {/* Telefon */}
            <FieldWrap icon={<Phone size={14} />} label="Telefon Numaranız">
              <div className="flex gap-2">
                <div className="bg-white h-[44px] rounded-[30px] px-3.5 flex items-center gap-1.5 border border-black/5 shrink-0">
                  <div className="w-[14px] h-[10px] rounded-[2px] overflow-hidden relative bg-[#E92434] flex items-center justify-center">
                    <div className="w-[3px] h-[3px] rounded-full border border-white" />
                  </div>
                  <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] text-[#302d2d]">+90</span>
                  <ChevronDown size={12} className="text-[#292D32]" />
                </div>
                <input
                  type="tel"
                  placeholder="5XX XXX XX XX"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  inputMode="numeric"
                  maxLength={13}
                  pattern={TR_MOBILE_PATTERN}
                  title={TR_MOBILE_TITLE}
                  className={`${inputBase} flex-1`}
                  required
                />
              </div>
            </FieldWrap>

            {/* E-posta */}
            <FieldWrap icon={<Mail size={14} />} label="E-posta Adresiniz">
              <input
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBase}
                required
              />
            </FieldWrap>

            {/* Şifre - iki sütunlu */}
            <FieldWrap icon={<Lock size={14} />} label="Şifre Belirleyiniz">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputBase} pr-12`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#686767] hover:text-[#324D47] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    placeholder="Şifre Tekrar"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className={`${inputBase} pr-12`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#686767] hover:text-[#324D47] transition-colors"
                  >
                    {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </FieldWrap>

            {/* Consent */}
            <div className="flex flex-col gap-3 mt-1">
              <ConsentRow checked={marketingConsent} onChange={setMarketingConsent}>
                Tarafımla pazarlama ve tanıtım amaçlı iletişime geçilmesine izin veriyorum.
              </ConsentRow>
              <ConsentRow checked={termsConsent} onChange={setTermsConsent}>
                <a
                  href={LEGAL_MEMBERSHIP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-['Neutraface_2_Text:Demi',sans-serif] underline decoration-[10%] cursor-pointer hover:text-[#F4EBD1] transition-colors"
                >
                  Üyelik Sözleşmesi
                </a>{' '}
                şartlarını okudum ve kabul ediyorum.
              </ConsentRow>
              <ConsentRow checked={privacyConsent} onChange={setPrivacyConsent}>
                <a
                  href={LEGAL_KVKK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-['Neutraface_2_Text:Demi',sans-serif] underline decoration-[10%] cursor-pointer hover:text-[#F4EBD1] transition-colors"
                >
                  Kişisel Verilerin Korunması Politikası
                </a>{' '}
                şartlarını okudum ve kabul ediyorum.
              </ConsentRow>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={!isPhoneValid}
              className="w-full h-[48px] bg-[#00000B] hover:bg-[#68232E] rounded-[30px] flex items-center justify-center gap-2.5 transition-colors duration-300 mt-1 disabled:bg-[#00000B]/40 disabled:cursor-not-allowed"
            >
              <UserPlus size={15} className="text-white" />
              <span className="font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] text-white tracking-wide">
                Kayıt Ol
              </span>
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-1">
              <div className="flex-1 h-[1px] bg-white/15" />
              <span className="text-[11px] text-white/40 font-['Neutraface_2_Text:Book',sans-serif]">veya</span>
              <div className="flex-1 h-[1px] bg-white/15" />
            </div>

            {/* Switch to Login */}
            <button
              type="button"
              onClick={onSwitch}
              className="w-full h-[48px] rounded-[30px] flex items-center justify-center gap-2.5 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300 group"
            >
              <LogIn size={15} className="text-white/70 group-hover:text-white transition-colors" />
              <span className="font-['Neutraface_2_Text:Book',sans-serif] text-[14px] text-white/70 group-hover:text-white transition-colors">
                Giriş Yap
              </span>
              <ArrowRight size={14} className="text-white/40 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* ReCAPTCHA */}
            <p className="text-center font-['Neutraface_2_Text:Book',sans-serif] text-[11px] text-white/40 leading-relaxed">
              ReCAPTCHA tarafından korunmaktadır ve Google{' '}
              <a
                href={GOOGLE_PRIVACY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline cursor-pointer hover:text-white/60"
              >
                Gizlilik Politikası
              </a>{' '}
              ve{' '}
              <a
                href={GOOGLE_TERMS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline cursor-pointer hover:text-white/60"
              >
                Hizmet Şartları
              </a>'na tabidir.
            </p>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
