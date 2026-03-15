import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { candidateLogin, searchSchools, startExamSession, type SchoolSearchItem } from '../api/examApi';
import { isValidTrMobilePhone, normalizeTrMobileInput, TR_MOBILE_PATTERN, TR_MOBILE_TITLE } from './phoneUtils';
import { savePlacementExamLead } from './exam/placementExamSession';
import {
  deriveAgeRangeFromGrade,
  normalizeGrade,
  resolveDefaultExamOpenAt,
  saveCandidateSession,
} from './bursluluk/burslulukFlowSession';

const CAMPAIGN_CODE = String(import.meta.env.VITE_BURSLULUK_CAMPAIGN_CODE || '2026_BURSLULUK').trim();
const QUESTION_COUNT = Number(import.meta.env.VITE_BURSLULUK_QUESTION_COUNT || 40) || 40;

const FALLBACK_KONYA_SCHOOLS: SchoolSearchItem[] = [
  'Konya Meram Fen Lisesi',
  'Konya Anadolu Lisesi',
  'Selcuklu Bilim Sanat Merkezi',
  'Karatay Imam Hatip Lisesi',
  'Meram Koleji',
  'Selcuklu Ataturk Ortaokulu',
  'Karatay Ilkokulu',
  'Meram Sehitler Ortaokulu',
  'Konya TED Koleji',
  'Konya Ozel Final Okullari',
].map((name) => ({
  id: null,
  name,
  district: null,
  city: 'Konya',
  source: 'fallback',
}));

const grades = Array.from({ length: 10 }, (_, index) => index + 2);

function toE164FromTrMobile(value: string) {
  const digits = value.replace(/\D/g, '');
  return `+90${digits}`;
}

function normalizeError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  return fallback;
}

type Mode = 'apply' | 'login';

export default function BurslulukGirisPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('apply');

  const [schoolSearch, setSchoolSearch] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [studentFullName, setStudentFullName] = useState('');
  const [grade, setGrade] = useState(8);
  const [parentFullName, setParentFullName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [language, setLanguage] = useState('en');
  const [kvkkConsent, setKvkkConsent] = useState(true);
  const [contactConsent, setContactConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSchoolSearchLoading, setIsSchoolSearchLoading] = useState(false);
  const [schoolSearchResults, setSchoolSearchResults] = useState<SchoolSearchItem[]>(FALLBACK_KONYA_SCHOOLS.slice(0, 8));
  const [errorMessage, setErrorMessage] = useState('');

  const [loginApplicationNo, setLoginApplicationNo] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  const filteredSchools = useMemo(() => {
    if (schoolSearchResults.length > 0) return schoolSearchResults;
    return FALLBACK_KONYA_SCHOOLS.slice(0, 8);
  }, [schoolSearchResults]);

  useEffect(() => {
    const query = schoolSearch.trim();
    if (query.length < 2) {
      setIsSchoolSearchLoading(false);
      setSchoolSearchResults(FALLBACK_KONYA_SCHOOLS.slice(0, 8));
      return;
    }

    let isCancelled = false;
    const timer = window.setTimeout(async () => {
      setIsSchoolSearchLoading(true);
      try {
        const response = await searchSchools(query, 8);
        if (isCancelled) return;
        setSchoolSearchResults(response.items || []);
      } catch {
        if (isCancelled) return;
        const fallback = FALLBACK_KONYA_SCHOOLS.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
        setSchoolSearchResults(fallback);
      } finally {
        if (!isCancelled) {
          setIsSchoolSearchLoading(false);
        }
      }
    }, 220);

    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
    };
  }, [schoolSearch]);

  const handleApplySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    const normalizedPhone = normalizeTrMobileInput(parentPhone);
    if (!isValidTrMobilePhone(normalizedPhone)) {
      setErrorMessage(TR_MOBILE_TITLE);
      return;
    }
    if (!kvkkConsent) {
      setErrorMessage('Basvuru icin KVKK acik riza onayi gereklidir.');
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedGrade = normalizeGrade(grade);
      const ageRange = deriveAgeRangeFromGrade(normalizedGrade);
      const response = await startExamSession({
        studentFullName: studentFullName.trim(),
        parentFullName: parentFullName.trim(),
        parentPhoneE164: toE164FromTrMobile(normalizedPhone),
        schoolName: schoolName.trim() || schoolSearch.trim() || undefined,
        grade: normalizedGrade,
        ageRange,
        language,
        source: 'bursluluk_2026_apply_form',
        campaignCode: CAMPAIGN_CODE,
        questionCount: QUESTION_COUNT,
        consent: {
          kvkkApproved: kvkkConsent,
          contactConsent,
          consentVersion: 'KVKK_v1_2026-03-13',
          legalTextVersion: 'KVKK_v1_2026-03-13',
          source: 'bursluluk_form_web',
        },
      });

      const session = response.session;
      saveCandidateSession({
        applicationNo: session.applicationNo,
        attemptId: session.attemptId,
        sessionToken: session.sessionToken,
        candidateId: session.candidateId,
        expiresAt: session.expiresAt,
        startedAt: session.startedAt,
        credentialsSmsStatus: session.credentialsSmsStatus,
        consentVersion: session.consentVersion,
        studentFullName: studentFullName.trim(),
        parentFullName: parentFullName.trim(),
        parentPhoneE164: toE164FromTrMobile(normalizedPhone),
        schoolName: schoolName.trim() || schoolSearch.trim(),
        grade: normalizedGrade,
        ageRange,
        language,
        questionCount: QUESTION_COUNT,
        campaignCode: CAMPAIGN_CODE,
        examOpenAt: resolveDefaultExamOpenAt(),
      });

      savePlacementExamLead({
        fullName: studentFullName.trim(),
        phone: normalizedPhone,
        email: '',
        age: ageRange,
        language,
        source: 'bursluluk_2026_apply_form',
        kvkkConsent: true,
        contactConsent,
        kvkkConsentVersion: 'KVKK_v1_2026-03-13',
        kvkkLegalTextVersion: 'KVKK_v1_2026-03-13',
        consentCapturedAt: new Date().toISOString(),
      });

      navigate('/bursluluk/onay');
    } catch (error) {
      setErrorMessage(normalizeError(error, 'Basvuru kaydi basarisiz. Lutfen tekrar deneyin.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoginSubmitting(true);
    try {
      if (!loginApplicationNo.trim() || !loginPassword.trim()) {
        throw new Error('Kullanici adi ve sifre alanlarini doldurun.');
      }
      const response = await candidateLogin({
        username: loginApplicationNo.trim(),
        password: loginPassword.trim(),
        campaignCode: CAMPAIGN_CODE,
      });
      const session = response.session;
      const candidate = response.candidate || {};
      saveCandidateSession({
        applicationNo: session.applicationNo,
        attemptId: session.attemptId,
        sessionToken: session.sessionToken,
        candidateId: session.candidateId,
        expiresAt: session.expiresAt,
        studentFullName: candidate.studentFullName || 'Aday Ogrenci',
        parentFullName: candidate.parentFullName || 'Veli',
        parentPhoneE164: '',
        schoolName: '',
        grade: normalizeGrade(candidate.grade ?? 8),
        ageRange: session.examAgeRange || deriveAgeRangeFromGrade(normalizeGrade(candidate.grade ?? 8)),
        language: session.examLanguage || 'en',
        questionCount: Number(session.questionCount || QUESTION_COUNT),
        campaignCode: CAMPAIGN_CODE,
        examOpenAt: response.gate?.exam_open_at || resolveDefaultExamOpenAt(),
      });
      navigate('/bursluluk/bekleme');
    } catch (error) {
      setErrorMessage(normalizeError(error, 'Aday girisi basarisiz.'));
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-16 pt-[118px] sm:px-6 lg:px-12 lg:pt-[142px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(146,11,35,0.34),transparent_42%),radial-gradient(circle_at_84%_12%,rgba(39,102,129,0.26),transparent_34%),linear-gradient(138deg,#06050D_0%,#0A0C16_52%,#05070F_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_0.75px,transparent_0.75px)] [background-size:14px_14px] opacity-[0.14]" />

      <div className="relative mx-auto w-full max-w-[1080px]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-[30px] font-semibold text-white sm:text-[38px]">Bursluluk Giris ve Basvuru</h1>
          <Link to="/bursluluk-2026" className="rounded-full border border-white/18 px-4 py-2 text-[12px] uppercase tracking-[0.16em] text-white/70">
            Landing
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode('apply')}
            className={`rounded-full px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] ${mode === 'apply' ? 'bg-[#D92E27] text-white' : 'border border-white/18 text-white/70'}`}
          >
            Yeni Basvuru
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-full px-5 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] ${mode === 'login' ? 'bg-[#D92E27] text-white' : 'border border-white/18 text-white/70'}`}
          >
            Aday Girisi
          </button>
        </div>

        {mode === 'apply' ? (
          <form onSubmit={handleApplySubmit} className="grid gap-4 rounded-[26px] border border-white/12 bg-[#0A1323]/82 p-6 sm:grid-cols-2 sm:p-8">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-[12px] uppercase tracking-[0.15em] text-white/56">Okul (Konya, arama)</span>
              <input
                className="h-12 w-full rounded-xl border border-white/18 bg-[#061021] px-4 text-white outline-none focus:border-[#cf3b35]"
                value={schoolSearch}
                onChange={(event) => {
                  setSchoolSearch(event.target.value);
                  setSchoolName('');
                }}
                placeholder="Okul adini yazin"
              />
              {filteredSchools.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {filteredSchools.map((item) => (
                    <button
                      key={item.id || item.name}
                      type="button"
                      onClick={() => {
                        setSchoolName(item.name);
                        setSchoolSearch(item.name);
                      }}
                      className="rounded-full border border-white/16 px-3 py-1 text-[11px] text-white/76 hover:border-[#cf3b35]"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              ) : null}
              {isSchoolSearchLoading ? <p className="mt-2 text-[12px] text-white/54">Okullar yukleniyor...</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-[12px] uppercase tracking-[0.15em] text-white/56">Ogrenci Ad Soyad</span>
              <input
                className="h-12 w-full rounded-xl border border-white/18 bg-[#061021] px-4 text-white outline-none focus:border-[#cf3b35]"
                value={studentFullName}
                onChange={(event) => setStudentFullName(event.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[12px] uppercase tracking-[0.15em] text-white/56">Sinif (2-11)</span>
              <select
                className="h-12 w-full rounded-xl border border-white/18 bg-[#061021] px-4 text-white outline-none focus:border-[#cf3b35]"
                value={grade}
                onChange={(event) => setGrade(Number(event.target.value))}
              >
                {grades.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[12px] uppercase tracking-[0.15em] text-white/56">Veli Ad Soyad</span>
              <input
                className="h-12 w-full rounded-xl border border-white/18 bg-[#061021] px-4 text-white outline-none focus:border-[#cf3b35]"
                value={parentFullName}
                onChange={(event) => setParentFullName(event.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[12px] uppercase tracking-[0.15em] text-white/56">Veli Telefonu</span>
              <input
                className="h-12 w-full rounded-xl border border-white/18 bg-[#061021] px-4 text-white outline-none focus:border-[#cf3b35]"
                value={parentPhone}
                onChange={(event) => setParentPhone(normalizeTrMobileInput(event.target.value))}
                placeholder="5XX XXX XX XX"
                pattern={TR_MOBILE_PATTERN}
                title={TR_MOBILE_TITLE}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[12px] uppercase tracking-[0.15em] text-white/56">Sinav Dili</span>
              <select
                className="h-12 w-full rounded-xl border border-white/18 bg-[#061021] px-4 text-white outline-none focus:border-[#cf3b35]"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="fr">Francais</option>
                <option value="es">Espanol</option>
              </select>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#071021]/90 p-3 text-[13px] text-white/74 sm:col-span-2">
              <input type="checkbox" checked={kvkkConsent} onChange={(event) => setKvkkConsent(event.target.checked)} className="mt-1" />
              KVKK acik riza metnini okudum ve onayliyorum.
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#071021]/90 p-3 text-[13px] text-white/74 sm:col-span-2">
              <input type="checkbox" checked={contactConsent} onChange={(event) => setContactConsent(event.target.checked)} className="mt-1" />
              SMS/WhatsApp bilgilendirmesi almayi kabul ediyorum.
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 rounded-xl bg-[#D92E27] text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#bf251f] disabled:opacity-70 sm:col-span-2"
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Basvuruyu Tamamla'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="grid gap-4 rounded-[26px] border border-white/12 bg-[#0A1323]/82 p-6 sm:grid-cols-2 sm:p-8">
            <label className="block">
              <span className="mb-2 block text-[12px] uppercase tracking-[0.15em] text-white/56">Kullanici Adi (Basvuru No)</span>
              <input
                className="h-12 w-full rounded-xl border border-white/18 bg-[#061021] px-4 text-white outline-none focus:border-[#cf3b35]"
                value={loginApplicationNo}
                onChange={(event) => setLoginApplicationNo(event.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[12px] uppercase tracking-[0.15em] text-white/56">Sifre (SMS)</span>
              <input
                className="h-12 w-full rounded-xl border border-white/18 bg-[#061021] px-4 text-white outline-none focus:border-[#cf3b35]"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                required
              />
            </label>
            <button
              type="submit"
              disabled={isLoginSubmitting}
              className="h-12 rounded-xl bg-[#D92E27] text-[12px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#bf251f] disabled:opacity-70 sm:col-span-2"
            >
              {isLoginSubmitting ? 'Giris yapiliyor...' : 'Aday Girisi Yap'}
            </button>
          </form>
        )}

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-[#6F2824] bg-[#2B1214]/80 px-4 py-3 text-[14px] text-[#FFB8B1]">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </section>
  );
}
