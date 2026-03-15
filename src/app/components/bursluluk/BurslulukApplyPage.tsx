import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import homeHeroVideo from '../../../assets/video/home-hero.mp4';
import homeHeroVideoWebm from '../../../assets/video/home-hero.webm';
import { resolveExamEndpoint, startExamSession, type StartExamSessionPayload } from '../../api/examApi';
import { saveBurslulukApplicationRecord } from './burslulukFlowSession';

type SchoolItem = {
  id: string | null;
  name: string;
  district?: string | null;
  city?: string | null;
};

type FormState = {
  schoolName: string;
  studentFullName: string;
  grade: number;
  parentFullName: string;
  parentPhoneE164: string;
  parentEmail: string;
  kvkkApproved: boolean;
  contactConsent: boolean;
};

const DEFAULT_CONSENT_VERSION = 'KVKK_v1_2026-03-13';

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D+/g, '');
  if (!digits) return '';
  if (digits.startsWith('90') && digits.length >= 12) return `+${digits.slice(0, 12)}`;
  if (digits.startsWith('0') && digits.length >= 11) return `+90${digits.slice(1, 11)}`;
  if (!digits.startsWith('90') && digits.length >= 10) return `+90${digits.slice(-10)}`;
  return `+${digits}`;
}

function mapGradeToAgeRange(grade: number) {
  if (grade <= 4) return '7-10';
  if (grade <= 8) return '11-14';
  return '15-18';
}

function trim(value: string) {
  return value.trim();
}

export default function BurslulukApplyPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    schoolName: '',
    studentFullName: '',
    grade: 8,
    parentFullName: '',
    parentPhoneE164: '',
    parentEmail: '',
    kvkkApproved: true,
    contactConsent: true,
  });
  const [schoolQuery, setSchoolQuery] = useState('');
  const [schoolResults, setSchoolResults] = useState<SchoolItem[]>([]);
  const [schoolLoading, setSchoolLoading] = useState(false);
  const [schoolError, setSchoolError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const query = schoolQuery.trim();
    if (query.length < 2) {
      setSchoolResults([]);
      setSchoolError(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSchoolLoading(true);
      setSchoolError(null);
      try {
        const response = await fetch(
          `${resolveExamEndpoint('/api/schools/search')}?q=${encodeURIComponent(query)}&limit=8`,
          { signal: controller.signal },
        );
        if (!response.ok) {
          setSchoolError('Okul arama servisine şu anda erişilemiyor. Lütfen okul adını manuel girin.');
          return;
        }
        const payload = (await response.json().catch(() => null)) as { items?: SchoolItem[]; schools?: SchoolItem[] } | null;
        const items = Array.isArray(payload?.items)
          ? payload.items
          : (Array.isArray(payload?.schools) ? payload?.schools : []);
        setSchoolResults(items.slice(0, 8));
      } catch {
        if (!controller.signal.aborted) {
          setSchoolError('Okul arama sırasında bir hata oluştu. Okul adını manuel girebilirsiniz.');
        }
      } finally {
        if (!controller.signal.aborted) setSchoolLoading(false);
      }
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [schoolQuery]);

  const canSubmit = useMemo(() => {
    return (
      trim(form.schoolName).length >= 2
      && trim(form.studentFullName).length >= 5
      && form.grade >= 2
      && form.grade <= 11
      && trim(form.parentFullName).length >= 5
      && normalizePhone(form.parentPhoneE164).length >= 13
      && form.kvkkApproved
    );
  }, [form]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      setSubmitError('Lütfen zorunlu alanları eksiksiz doldurun.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const payload: StartExamSessionPayload = {
      campaignCode: '2026_BURSLULUK',
      studentFullName: trim(form.studentFullName),
      parentFullName: trim(form.parentFullName),
      parentPhoneE164: normalizePhone(form.parentPhoneE164),
      parentEmail: trim(form.parentEmail) || undefined,
      schoolName: trim(form.schoolName),
      grade: form.grade,
      ageRange: mapGradeToAgeRange(form.grade),
      language: 'EN',
      source: 'bursluluk_landing_apply',
      questionCount: 20,
      consent: {
        kvkkApproved: form.kvkkApproved,
        contactConsent: form.contactConsent,
        consentVersion: DEFAULT_CONSENT_VERSION,
        legalTextVersion: DEFAULT_CONSENT_VERSION,
        source: 'bursluluk_landing_apply',
      },
      kvkkConsent: form.kvkkApproved,
      contactConsent: form.contactConsent,
      kvkkConsentVersion: DEFAULT_CONSENT_VERSION,
      kvkkLegalTextVersion: DEFAULT_CONSENT_VERSION,
    };

    try {
      const response = await startExamSession(payload);
      saveBurslulukApplicationRecord({
        applicationNo: response.session.applicationNo,
        sessionToken: response.session.sessionToken,
        attemptId: response.session.attemptId,
        candidateId: response.session.candidateId,
        schoolName: payload.schoolName || '',
        studentFullName: payload.studentFullName,
        parentFullName: payload.parentFullName,
        parentPhoneE164: payload.parentPhoneE164,
        grade: payload.grade || 8,
      });
      navigate('/bursluluk/onay');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Başvuru gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-16 pt-[108px] sm:px-6 lg:px-12 lg:pt-[138px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(146,11,35,0.34),transparent_44%),radial-gradient(circle_at_86%_14%,rgba(75,66,96,0.24),transparent_36%),linear-gradient(138deg,#06050D_0%,#0A0C16_52%,#05070F_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_0.75px,transparent_0.75px)] [background-size:14px_14px] opacity-[0.13]" />

      <div className="relative mx-auto grid w-full max-w-[1320px] gap-10 lg:grid-cols-[1fr_1.08fr]">
        <div className="max-w-[640px]">
          <p className="mb-6 flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.32em] text-[#E35347]">
            <span className="h-px w-10 bg-[#E35347]" />
            Teachera Bursluluk 2026
          </p>

          <h1 className="text-[42px] font-semibold leading-[1.04] text-white sm:text-[56px] lg:text-[64px]">
            Online Bursluluk
            <br />
            Seviye Tespit Sınavı
          </h1>

          <p className="mt-6 max-w-[580px] text-[18px] leading-[1.8] text-white/70">
            Bu akış Teachera&apos;nın normal seviye tespit sürecinden ayrıdır. Başvurunuz sonrası
            giriş bilgileri SMS ile iletilir, sınav saatine kadar bekleme ekranı görünür,
            sınav açıldığında adaya otomatik bildirim gönderilir.
          </p>

          <div className="mt-8 overflow-hidden rounded-[24px] border border-white/12 bg-[#121826]">
            <video className="h-[250px] w-full object-cover sm:h-[320px]" autoPlay muted loop playsInline preload="metadata">
              <source src={homeHeroVideoWebm} type="video/webm" />
              <source src={homeHeroVideo} type="video/mp4" />
            </video>
            <p className="border-t border-white/10 px-4 py-3 text-[13px] text-white/65">
              Başvuru öncesi: teknik gereksinimleri kontrol edin (stabil internet, güncel tarayıcı, sessiz ortam).
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/14 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.44)] backdrop-blur-md sm:p-8">
          <h2 className="text-[25px] font-semibold text-white">Bursluluk Başvuru Formu</h2>
          <p className="mt-2 text-[14px] text-white/65">Konya okulları için arama yapabilir veya okul adını manuel yazabilirsiniz.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-[13px] font-medium text-white/84">Okul</label>
              <input
                value={form.schoolName}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((prev) => ({ ...prev, schoolName: value }));
                  setSchoolQuery(value);
                }}
                placeholder="Örn: Konya Anadolu Lisesi"
                className="w-full rounded-xl border border-white/16 bg-[#0b1527]/84 px-4 py-3 text-white outline-none transition focus:border-[#E35347]"
                autoComplete="off"
                required
              />
              {schoolLoading ? <p className="mt-2 text-[12px] text-white/55">Okullar aranıyor...</p> : null}
              {schoolError ? <p className="mt-2 text-[12px] text-[#ff8b87]">{schoolError}</p> : null}
              {schoolResults.length > 0 ? (
                <div className="mt-2 max-h-40 overflow-auto rounded-xl border border-white/10 bg-[#0a1322]/95 p-1">
                  {schoolResults.map((item) => (
                    <button
                      type="button"
                      key={`${item.id || 'school'}-${item.name}`}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, schoolName: item.name }));
                        setSchoolResults([]);
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-[13px] text-white/82 hover:bg-white/10"
                    >
                      {item.name}
                      {item.city ? <span className="ml-2 text-white/45">({item.city})</span> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[13px] font-medium text-white/84">Öğrenci Adı Soyadı</label>
                <input
                  value={form.studentFullName}
                  onChange={(event) => setForm((prev) => ({ ...prev, studentFullName: event.target.value }))}
                  className="w-full rounded-xl border border-white/16 bg-[#0b1527]/84 px-4 py-3 text-white outline-none transition focus:border-[#E35347]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-white/84">Sınıf (2-11)</label>
                <select
                  value={form.grade}
                  onChange={(event) => setForm((prev) => ({ ...prev, grade: Number(event.target.value) }))}
                  className="w-full rounded-xl border border-white/16 bg-[#0b1527]/84 px-4 py-3 text-white outline-none transition focus:border-[#E35347]"
                  required
                >
                  {Array.from({ length: 10 }).map((_, index) => {
                    const value = index + 2;
                    return <option key={value} value={value}>{value}. sınıf</option>;
                  })}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[13px] font-medium text-white/84">Veli Adı Soyadı</label>
                <input
                  value={form.parentFullName}
                  onChange={(event) => setForm((prev) => ({ ...prev, parentFullName: event.target.value }))}
                  className="w-full rounded-xl border border-white/16 bg-[#0b1527]/84 px-4 py-3 text-white outline-none transition focus:border-[#E35347]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-white/84">Veli Telefonu</label>
                <input
                  value={form.parentPhoneE164}
                  onChange={(event) => setForm((prev) => ({ ...prev, parentPhoneE164: event.target.value }))}
                  placeholder="05xx xxx xx xx"
                  className="w-full rounded-xl border border-white/16 bg-[#0b1527]/84 px-4 py-3 text-white outline-none transition focus:border-[#E35347]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-medium text-white/84">Veli E-posta (opsiyonel)</label>
              <input
                value={form.parentEmail}
                onChange={(event) => setForm((prev) => ({ ...prev, parentEmail: event.target.value }))}
                placeholder="veli@example.com"
                type="email"
                className="w-full rounded-xl border border-white/16 bg-[#0b1527]/84 px-4 py-3 text-white outline-none transition focus:border-[#E35347]"
              />
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-white/12 bg-black/20 p-3 text-[13px] text-white/72">
              <input
                type="checkbox"
                checked={form.kvkkApproved}
                onChange={(event) => setForm((prev) => ({ ...prev, kvkkApproved: event.target.checked }))}
                className="mt-1"
              />
              KVKK metnini okudum ve kişisel verilerimin bursluluk sınavı operasyonu kapsamında işlenmesini onaylıyorum.
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-white/12 bg-black/20 p-3 text-[13px] text-white/72">
              <input
                type="checkbox"
                checked={form.contactConsent}
                onChange={(event) => setForm((prev) => ({ ...prev, contactConsent: event.target.checked }))}
                className="mt-1"
              />
              SMS / WhatsApp üzerinden sınav bilgilendirme mesajları almak istiyorum.
            </label>

            {submitError ? <p className="rounded-lg border border-[#f87171]/35 bg-[#7f1d1d]/30 px-3 py-2 text-[13px] text-[#fecaca]">{submitError}</p> : null}

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D92E27] px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#bf251f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Başvuru gönderiliyor...' : 'Başvuruyu Tamamla'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
