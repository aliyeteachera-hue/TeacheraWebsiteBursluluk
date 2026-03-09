import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, ChevronDown, GraduationCap, Mail, Phone, School, ShieldCheck, User, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { OverlayModal } from '../overlay/OverlayPrimitives';
import { useFormSubmission } from '../../lib/useFormSubmission';
import { FORM_UI_MESSAGES } from '../../lib/formUiMessages';
import { notifySuccess } from '../../lib/notifications';
import { trackEvent } from '../../lib/analytics';
import { useCoarsePointer } from '../../lib/useCoarsePointer';
import {
  BURSLULUK_ROUTES,
} from '../../bursluluk/config';
import {
  formatBirthYear,
  formatIdentityNumber,
  getAvailableGrades,
  getSessionsForGrade,
  normalizeSchoolSearch,
} from '../../bursluluk/helpers';
import { saveLastBurslulukApplication } from '../../bursluluk/storage';
import { searchBurslulukSchools, submitBurslulukApplication } from '../../bursluluk/client';
import type { BurslulukSchool } from '../../bursluluk/types';
import { isValidTrMobilePhone, normalizeTrMobileInput, TR_MOBILE_PATTERN, TR_MOBILE_TITLE } from '../phoneUtils';
import { BurslulukPanel, BurslulukPrimaryButton } from './BurslulukUi';

const INPUT_CLASS_NAME =
  "h-[48px] w-full rounded-[18px] border border-white/10 bg-[#ffffff]/[0.06] px-4 text-[14px] text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#E70000]/55";

export function BurslulukApplicationModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const isCoarsePointer = useCoarsePointer();
  const [schoolQuery, setSchoolQuery] = useState('');
  const [schoolResults, setSchoolResults] = useState<BurslulukSchool[]>([]);
  const [isSchoolLoading, setIsSchoolLoading] = useState(false);
  const [showSchoolResults, setShowSchoolResults] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<BurslulukSchool | null>(null);
  const [manualSchoolMode, setManualSchoolMode] = useState(false);
  const [formData, setFormData] = useState({
    grade: 0,
    branch: '',
    studentFullName: '',
    identityNumber: '',
    birthYear: '',
    guardianFullName: '',
    guardianPhone: '',
    guardianEmail: '',
    sessionId: '',
    kvkk: false,
    marketing: false,
  });
  const {
    isSubmitting,
    fieldError,
    submitError,
    setFieldError,
    setSubmitError,
    clearErrors,
    resetSubmissionState,
    runSubmission,
  } = useFormSubmission({ defaultSubmitErrorMessage: FORM_UI_MESSAGES.submitFailed });
  const schoolMenuRef = useRef<HTMLDivElement | null>(null);

  const availableSessions = formData.grade ? getSessionsForGrade(formData.grade) : [];
  const isPhoneValid = isValidTrMobilePhone(formData.guardianPhone);

  useEffect(() => {
    if (!open) {
      const timeoutId = window.setTimeout(() => {
        setSchoolQuery('');
        setSchoolResults([]);
        setSelectedSchool(null);
        setManualSchoolMode(false);
        setShowSchoolResults(false);
        setFormData({
          grade: 0,
          branch: '',
          studentFullName: '',
          identityNumber: '',
          birthYear: '',
          guardianFullName: '',
          guardianPhone: '',
          guardianEmail: '',
          sessionId: '',
          kvkk: false,
          marketing: false,
        });
        resetSubmissionState();
      }, 240);

      return () => window.clearTimeout(timeoutId);
    }
  }, [open, resetSubmissionState]);

  useEffect(() => {
    const normalized = normalizeSchoolSearch(schoolQuery);
    const normalizedSelectedSchool = normalizeSchoolSearch(selectedSchool?.name || '');
    if (!open || manualSchoolMode || normalized.length < 2) {
      setSchoolResults([]);
      setIsSchoolLoading(false);
      return;
    }

    if (selectedSchool && normalized === normalizedSelectedSchool) {
      setIsSchoolLoading(false);
      setShowSchoolResults(false);
      return;
    }

    let ignore = false;
    setIsSchoolLoading(true);
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await searchBurslulukSchools(normalized);
        if (!ignore) {
          setSchoolResults(response.items);
          setShowSchoolResults(true);
        }
      } catch {
        if (!ignore) {
          setSchoolResults([]);
        }
      } finally {
        if (!ignore) {
          setIsSchoolLoading(false);
        }
      }
    }, 220);

    return () => {
      ignore = true;
      window.clearTimeout(timeoutId);
    };
  }, [manualSchoolMode, open, schoolQuery, selectedSchool]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!schoolMenuRef.current) return;
      if (schoolMenuRef.current.contains(event.target as Node)) return;
      setShowSchoolResults(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (availableSessions.some((item) => item.id === formData.sessionId)) return;
    setFormData((current) => ({ ...current, sessionId: availableSessions[0]?.id || '' }));
  }, [availableSessions, formData.sessionId]);

  const handleChooseSchool = (school: BurslulukSchool) => {
    setSelectedSchool(school);
    setManualSchoolMode(false);
    setSchoolQuery(school.name);
    setSchoolResults([]);
    setShowSchoolResults(false);
    setFieldError(null);
  };

  const handleEnableManualSchool = () => {
    setSelectedSchool(null);
    setManualSchoolMode(true);
    setShowSchoolResults(false);
    setSchoolQuery('');
    setFieldError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    clearErrors();

    const schoolName = manualSchoolMode ? normalizeSchoolSearch(schoolQuery) : selectedSchool?.name || '';

    if (!schoolName || !formData.grade || !formData.studentFullName || !formData.identityNumber || !formData.birthYear || !formData.guardianFullName || !formData.sessionId) {
      setFieldError(FORM_UI_MESSAGES.required);
      return;
    }

    if (!isPhoneValid) {
      setFieldError(FORM_UI_MESSAGES.phone);
      return;
    }

    if (formData.guardianEmail && !/\S+@\S+\.\S+/.test(formData.guardianEmail)) {
      setFieldError(FORM_UI_MESSAGES.email);
      return;
    }

    if (!formData.kvkk) {
      setFieldError(FORM_UI_MESSAGES.kvkk);
      return;
    }

    trackEvent('lead_form_submit_attempt', {
      form_subject: 'bursluluk_basvuru',
      form_id: 'bursluluk_basvuru',
      field_count: 11,
      delivery_method: 'bursluluk_api',
      endpoint_domain: window.location.hostname,
    });

    const sent = await runSubmission(async () => {
      let response;
      try {
        response = await submitBurslulukApplication({
          schoolId: selectedSchool?.id,
          schoolName,
          grade: formData.grade,
          branch: formData.branch.trim().toUpperCase(),
          studentFullName: formData.studentFullName.trim(),
          identityNumber: formData.identityNumber,
          birthYear: formData.birthYear,
          guardianFullName: formData.guardianFullName.trim(),
          guardianPhone: `+90 ${formData.guardianPhone}`,
          guardianEmail: formData.guardianEmail.trim(),
          sessionId: formData.sessionId,
          consents: {
            kvkk: formData.kvkk,
            marketing: formData.marketing,
          },
        });
      } catch (error) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : FORM_UI_MESSAGES.submitFailed;
        setSubmitError(message);
        trackEvent('lead_form_submit_failure', {
          form_subject: 'bursluluk_basvuru',
          form_id: 'bursluluk_basvuru',
          field_count: 11,
          delivery_method: 'bursluluk_api',
          endpoint_domain: window.location.hostname,
          error_message: message,
        });
        return false;
      }

      try {
        saveLastBurslulukApplication(response.application);
      } catch {
        // Local storage failures should not block the application flow.
      }

      try {
        trackEvent('lead_form_submit_success', {
          form_subject: 'bursluluk_basvuru',
          form_id: 'bursluluk_basvuru',
          field_count: 11,
          delivery_method: 'bursluluk_api',
          endpoint_domain: window.location.hostname,
        });
      } catch {
        // Analytics failures should not block the application flow.
      }

      notifySuccess('Başvurunuz alındı. Giriş bilgileriniz hazırlandı.');
      onClose();
      navigate(`${BURSLULUK_ROUTES.confirmation}?code=${encodeURIComponent(response.application.applicationCode)}`);
      return true;
    });

    if (!sent) return;
  };

  return (
    <AnimatePresence>
      {open ? (
        <OverlayModal
          open={open}
          onClose={onClose}
          owner="bursluluk-application"
          ariaLabel="Teachera bursluluk sınavı başvuru formu"
          containerClassName="fixed inset-0 z-[120] flex items-start justify-center overflow-hidden bg-[#020204]/95 px-4 pb-3 pt-16 backdrop-blur-md md:items-center md:px-6 md:py-10"
        >
          {({ panelProps }) => (
            <>
              <div className="fixed inset-0 bg-[#020204]/92" />

              <motion.button
                initial={isCoarsePointer ? false : { opacity: 0, scale: 0.8 }}
                animate={isCoarsePointer ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                type="button"
                onClick={onClose}
                className="fixed right-4 top-4 z-[125] inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#111722] text-white transition-colors hover:bg-[#182133] md:right-8 md:top-8"
              >
                <X size={18} />
              </motion.button>

              <motion.div
                {...panelProps}
                initial={isCoarsePointer ? false : { opacity: 0, y: 28, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={isCoarsePointer ? { opacity: 0, y: 16 } : { opacity: 0, y: 24, scale: 0.98 }}
                transition={{ duration: isCoarsePointer ? 0.24 : 0.36, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-[121] w-full max-w-[760px]"
              >
                <BurslulukPanel className="max-h-full overflow-y-auto p-5 overscroll-contain md:max-h-[min(860px,calc(100dvh-4rem))] md:p-7 lg:p-8">
                <div className="mb-6 border-b border-white/10 pb-6 pr-12">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#E70000]/25 bg-[#E70000]/12 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#FFD3D4]">
                    <ShieldCheck size={13} />
                    Ücretsiz Katılım
                  </span>
                  <h2 className="mt-4 font-['Neutraface_2_Text:Bold',sans-serif] text-[1.9rem] leading-[1.05] text-white">
                    Sınav Başvuru Formu
                  </h2>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
                  data-form-id="bursluluk_basvuru"
                  aria-label="Bursluluk sınavı başvuru formu"
                >
                      <FieldLabel icon={<School size={14} />} title="Okul">
                        <div ref={schoolMenuRef} className="relative">
                          <input
                            type="text"
                            value={schoolQuery}
                            onFocus={() => {
                              if (schoolResults.length > 0) setShowSchoolResults(true);
                            }}
                            onChange={(inputEvent) => {
                              const next = normalizeSchoolSearch(inputEvent.target.value);
                              setSchoolQuery(next);
                              setSelectedSchool(null);
                              setManualSchoolMode(false);
                            }}
                            placeholder="Okul adını yazın"
                            className={INPUT_CLASS_NAME}
                          />

                          {showSchoolResults && !manualSchoolMode ? (
                            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-[18px] border border-white/10 bg-[#111722] p-2 shadow-2xl">
                              {isSchoolLoading ? (
                                <p className="px-3 py-3 text-[13px] text-white/55">Okullar yükleniyor...</p>
                              ) : schoolResults.length > 0 ? (
                                <div className="max-h-[240px] overflow-y-auto">
                                  {schoolResults.map((school) => (
                                    <button
                                      key={school.id}
                                      type="button"
                                      onClick={() => handleChooseSchool(school)}
                                      className="flex w-full flex-col rounded-[14px] px-3 py-3 text-left transition-colors hover:bg-white/6"
                                    >
                                      <span className="text-[14px] text-white">{school.name}</span>
                                      <span className="mt-1 text-[12px] uppercase tracking-[0.12em] text-white/45">
                                        {school.district} · {school.type}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              ) : normalizeSchoolSearch(schoolQuery).length >= 2 ? (
                                <p className="px-3 py-3 text-[13px] text-white/55">Eşleşen okul bulunamadı.</p>
                              ) : null}

                              <button
                                type="button"
                                onClick={handleEnableManualSchool}
                                className="mt-1 flex w-full items-center justify-between rounded-[14px] border border-dashed border-white/12 px-3 py-3 text-left text-[13px] text-white/72 transition-colors hover:bg-white/6"
                              >
                                <span>Okulum listede yok, manuel gireceğim</span>
                                <ChevronDown size={14} className="-rotate-90 text-white/45" />
                              </button>
                            </div>
                          ) : null}

                          {!manualSchoolMode ? (
                            <button
                              type="button"
                              onClick={handleEnableManualSchool}
                              className="mt-2 text-[12px] uppercase tracking-[0.14em] text-white/42 transition-colors hover:text-white/72"
                            >
                              Okulum listede yok
                            </button>
                          ) : null}
                        </div>
                      </FieldLabel>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FieldLabel icon={<GraduationCap size={14} />} title="Sınıf">
                          <select
                            value={formData.grade || ''}
                            onChange={(inputEvent) => setFormData((current) => ({ ...current, grade: Number(inputEvent.target.value), sessionId: '' }))}
                            className={INPUT_CLASS_NAME}
                          >
                            <option value="">Seçiniz</option>
                            {getAvailableGrades().map((grade) => (
                              <option key={grade} value={grade} className="text-[#09090F]">
                                {grade}. sınıf
                              </option>
                            ))}
                          </select>
                        </FieldLabel>

                        <FieldLabel icon={<GraduationCap size={14} />} title="Şube">
                          <input
                            type="text"
                            value={formData.branch}
                            onChange={(inputEvent) => setFormData((current) => ({ ...current, branch: inputEvent.target.value.slice(0, 4).toUpperCase() }))}
                            placeholder="A / B / C"
                            className={INPUT_CLASS_NAME}
                          />
                        </FieldLabel>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FieldLabel icon={<User size={14} />} title="Öğrenci Ad Soyad">
                          <input
                            type="text"
                            value={formData.studentFullName}
                            onChange={(inputEvent) => setFormData((current) => ({ ...current, studentFullName: inputEvent.target.value }))}
                            placeholder="Öğrenci adı soyadı"
                            className={INPUT_CLASS_NAME}
                          />
                        </FieldLabel>

                        <FieldLabel icon={<ShieldCheck size={14} />} title="T.C. Kimlik No">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={11}
                            value={formData.identityNumber}
                            onChange={(inputEvent) => setFormData((current) => ({ ...current, identityNumber: formatIdentityNumber(inputEvent.target.value) }))}
                            placeholder="11 haneli T.C. kimlik no"
                            className={INPUT_CLASS_NAME}
                          />
                        </FieldLabel>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FieldLabel icon={<GraduationCap size={14} />} title="Doğum Yılı">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            value={formData.birthYear}
                            onChange={(inputEvent) => setFormData((current) => ({ ...current, birthYear: formatBirthYear(inputEvent.target.value) }))}
                            placeholder="Örn. 2014"
                            className={INPUT_CLASS_NAME}
                          />
                        </FieldLabel>

                        <FieldLabel icon={<GraduationCap size={14} />} title="Oturum">
                          <select
                            value={formData.sessionId}
                            onChange={(inputEvent) => setFormData((current) => ({ ...current, sessionId: inputEvent.target.value }))}
                            disabled={!formData.grade || availableSessions.length === 0}
                            className={`${INPUT_CLASS_NAME} disabled:cursor-not-allowed disabled:opacity-55`}
                          >
                            <option value="">{formData.grade ? 'Oturum seçiniz' : 'Önce sınıf seçiniz'}</option>
                            {availableSessions.map((session) => (
                              <option key={session.id} value={session.id} className="text-[#09090F]">
                                {session.label}
                              </option>
                            ))}
                          </select>
                        </FieldLabel>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FieldLabel icon={<User size={14} />} title="Veli Ad Soyad">
                          <input
                            type="text"
                            value={formData.guardianFullName}
                            onChange={(inputEvent) => setFormData((current) => ({ ...current, guardianFullName: inputEvent.target.value }))}
                            placeholder="Veli adı soyadı"
                            className={INPUT_CLASS_NAME}
                          />
                        </FieldLabel>

                        <FieldLabel icon={<Phone size={14} />} title="Veli Telefon">
                          <div className="flex items-center gap-2">
                            <div className="inline-flex h-[48px] min-w-[70px] items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.06] text-[13px] text-white/78">
                              +90
                            </div>
                            <input
                              type="tel"
                              inputMode="numeric"
                              maxLength={13}
                              pattern={TR_MOBILE_PATTERN}
                              title={TR_MOBILE_TITLE}
                              value={formData.guardianPhone}
                              onChange={(inputEvent) => setFormData((current) => ({ ...current, guardianPhone: normalizeTrMobileInput(inputEvent.target.value) }))}
                              placeholder="5XX XXX XX XX"
                              className={INPUT_CLASS_NAME}
                            />
                          </div>
                        </FieldLabel>
                      </div>

                      <FieldLabel icon={<Mail size={14} />} title="Veli E-posta">
                        <input
                          type="email"
                          value={formData.guardianEmail}
                          onChange={(inputEvent) => setFormData((current) => ({ ...current, guardianEmail: inputEvent.target.value }))}
                          placeholder="opsiyonel@eposta.com"
                          className={INPUT_CLASS_NAME}
                        />
                      </FieldLabel>

                      <div className="space-y-3 rounded-[18px] border border-white/10 bg-white/[0.03] p-4">
                        <label className="flex items-start gap-3 text-[13px] leading-[1.7] text-white/74">
                          <input
                            type="checkbox"
                            checked={formData.kvkk}
                            onChange={(inputEvent) => setFormData((current) => ({ ...current, kvkk: inputEvent.target.checked }))}
                            className="mt-1 h-4 w-4 accent-[#E70000]"
                          />
                          <span>
                            <a href="/hukuki/musteri-aydinlatma-metni" className="text-white underline decoration-white/30 underline-offset-4">
                              KVKK aydınlatma metnini
                            </a>{' '}
                            ve sınav süreç bilgilendirmesini okudum, kabul ediyorum.
                          </span>
                        </label>

                        <label className="flex items-start gap-3 text-[13px] leading-[1.7] text-white/74">
                          <input
                            type="checkbox"
                            checked={formData.marketing}
                            onChange={(inputEvent) => setFormData((current) => ({ ...current, marketing: inputEvent.target.checked }))}
                            className="mt-1 h-4 w-4 accent-[#E70000]"
                          />
                          <span>
                            Sonuç, kampanya ve görüşme bilgilendirmeleri için iletişim izni veriyorum.
                          </span>
                        </label>
                      </div>

                      {(fieldError || submitError) ? (
                        <div className="flex items-start gap-3 rounded-[18px] border border-[#E70000]/20 bg-[#E70000]/10 px-4 py-3 text-[13px] leading-[1.6] text-[#FFD2D4]">
                          <AlertCircle size={15} className="mt-0.5 shrink-0" />
                          <span>{fieldError || submitError}</span>
                        </div>
                      ) : null}

                      <div className="sticky bottom-0 -mx-1 bg-[linear-gradient(180deg,rgba(15,19,26,0)_0%,rgba(15,19,26,0.9)_24%,rgba(15,19,26,1)_100%)] px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-5">
                        <BurslulukPrimaryButton type="submit" className="w-full">
                          {isSubmitting ? 'Gönderiliyor' : 'Başvuruyu Tamamla'}
                        </BurslulukPrimaryButton>
                      </div>
                </form>
                </BurslulukPanel>
              </motion.div>
            </>
          )}
        </OverlayModal>
      ) : null}
    </AnimatePresence>
  );
}

function FieldLabel({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/48">
        <span className="text-[#E70000]">{icon}</span>
        {title}
      </span>
      {children}
    </label>
  );
}
