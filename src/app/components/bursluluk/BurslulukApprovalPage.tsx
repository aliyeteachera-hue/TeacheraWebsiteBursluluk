import { Link } from 'react-router';
import { readBurslulukApplicationRecord } from './burslulukFlowSession';
import homeHeroVideo from '../../../assets/video/home-hero.mp4';
import homeHeroVideoWebm from '../../../assets/video/home-hero.webm';

function maskToken(token: string) {
  if (!token) return '';
  if (token.length <= 8) return '*'.repeat(token.length);
  return `${token.slice(0, 4)}${'*'.repeat(Math.max(0, token.length - 8))}${token.slice(-4)}`;
}

export default function BurslulukApprovalPage() {
  const record = readBurslulukApplicationRecord();

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-16 pt-[118px] sm:px-6 lg:px-12 lg:pt-[142px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(146,11,35,0.32),transparent_44%),radial-gradient(circle_at_86%_14%,rgba(75,66,96,0.22),transparent_36%),linear-gradient(138deg,#06050D_0%,#0A0C16_52%,#05070F_100%)]" />

      <div className="relative mx-auto w-full max-w-[980px] rounded-[30px] border border-white/14 bg-white/[0.06] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.44)] backdrop-blur-md sm:p-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[#E35347]">Başvuru Onayı</p>
        <h1 className="mt-3 text-[36px] font-semibold leading-tight text-white sm:text-[44px]">
          Başvurunuz Alındı
        </h1>
        <p className="mt-4 text-[15px] leading-7 text-white/74">
          Sınava katılım yöntemi ve teknik gereksinimler için bilgilendirme videosunu izleyin. Kullanıcı adı/şifre
          bilgileri SMS ile iletilir. Sınav açıldığında ikinci SMS otomatik gönderilir.
        </p>

        <div className="mt-7 overflow-hidden rounded-[22px] border border-white/12 bg-[#121826]">
          <video className="h-[280px] w-full object-cover sm:h-[360px]" autoPlay muted loop playsInline preload="metadata">
            <source src={homeHeroVideoWebm} type="video/webm" />
            <source src={homeHeroVideo} type="video/mp4" />
          </video>
          <div className="border-t border-white/10 px-4 py-3 text-[13px] text-white/65">
            Video özeti: giriş bilgilerini saklayın, sınav öncesi cihaz ve internet kontrolünü tamamlayın.
          </div>
        </div>

        <div className="mt-7 grid gap-3 rounded-2xl border border-white/10 bg-[#0a1425]/75 p-4 text-[14px] text-white/75 sm:grid-cols-2">
          <div>
            <p className="text-white/48">Başvuru No</p>
            <p className="font-semibold text-white">{record?.applicationNo || 'SMS ile iletilecek'}</p>
          </div>
          <div>
            <p className="text-white/48">Geçici Şifre</p>
            <p className="font-semibold text-white">{record?.sessionToken ? maskToken(record.sessionToken) : 'SMS ile iletilecek'}</p>
          </div>
          <div>
            <p className="text-white/48">Öğrenci</p>
            <p className="font-semibold text-white">{record?.studentFullName || '-'}</p>
          </div>
          <div>
            <p className="text-white/48">Sınıf</p>
            <p className="font-semibold text-white">{record?.grade ? `${record.grade}. sınıf` : '-'}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/bursluluk/giris"
            className="inline-flex items-center gap-2 rounded-xl bg-[#D92E27] px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#bf251f]"
          >
            Aday Giriş Ekranına Geç
          </Link>
          <Link
            to="/bursluluk-2026"
            className="inline-flex items-center gap-2 rounded-xl border border-white/16 px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/82 transition hover:bg-white/10"
          >
            Başvuru Sayfasına Dön
          </Link>
        </div>
      </div>
    </section>
  );
}
