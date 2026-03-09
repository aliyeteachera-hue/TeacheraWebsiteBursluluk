import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, LoaderCircle, Save } from 'lucide-react';
import { useNavigate } from 'react-router';
import { getBurslulukMe, saveBurslulukExam, startBurslulukExam, submitBurslulukExam } from '../../bursluluk/client';
import { BURSLULUK_ROUTES } from '../../bursluluk/config';
import { clearBurslulukAuthToken, readBurslulukAuthToken } from '../../bursluluk/storage';
import type { BurslulukExamAttempt, BurslulukMeResponse, BurslulukQuestion } from '../../bursluluk/types';
import { notifyError, notifySuccess } from '../../lib/notifications';
import { trackEvent } from '../../lib/analytics';
import { BurslulukCandidateShell, BurslulukDataPanel } from './BurslulukCandidateShell';
import { BurslulukPrimaryButton, BurslulukSecondaryButton } from './BurslulukUi';

export default function BurslulukExamPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => readBurslulukAuthToken());
  const [me, setMe] = useState<BurslulukMeResponse | null>(null);
  const [attempt, setAttempt] = useState<BurslulukExamAttempt | null>(null);
  const [questions, setQuestions] = useState<BurslulukQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarting, setIsStarting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState('');
  const [loadError, setLoadError] = useState('');

  const currentQuestion = questions[currentIndex] || null;
  const answeredCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers],
  );

  useEffect(() => {
    if (!token) return;

    let ignore = false;
    const bootstrap = async () => {
      setIsStarting(true);
      try {
        const meResponse = await getBurslulukMe(token);
        if (ignore) return;
        setMe(meResponse);
        const examResponse = await startBurslulukExam(token);
        if (ignore) return;
        setAttempt(examResponse.attempt);
        setQuestions(examResponse.questions);
        setAnswers(examResponse.attempt.answers || {});
        setRemainingSeconds(Math.max(0, Math.floor((new Date(examResponse.attempt.expiresAt).getTime() - Date.now()) / 1000)));
        trackEvent('exam_start', {
          application_code: meResponse.candidate.applicationCode,
          session_id: meResponse.candidate.sessionId,
          question_count: examResponse.questions.length,
        });
        setLoadError('');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Sınav başlatılamadı.';
        if (ignore) return;
        if (message === 'exam_not_open') {
          navigate(BURSLULUK_ROUTES.waiting);
          return;
        }
        setLoadError(message);
        if (message.includes('invalid_token')) {
          clearBurslulukAuthToken();
          setToken(null);
        }
        notifyError(message);
      } finally {
        if (!ignore) setIsStarting(false);
      }
    };

    void bootstrap();
    return () => {
      ignore = true;
    };
  }, [navigate, token]);

  useEffect(() => {
    if (!attempt) return;

    const intervalId = window.setInterval(() => {
      const seconds = Math.max(0, Math.floor((new Date(attempt.expiresAt).getTime() - Date.now()) / 1000));
      setRemainingSeconds(seconds);
      if (seconds === 0) {
        window.clearInterval(intervalId);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [attempt]);

  useEffect(() => {
    if (!token || !attempt || questions.length === 0) return;
    if (remainingSeconds <= 0) {
      void handleSubmit();
      return;
    }

    const intervalId = window.setInterval(() => {
      void saveBurslulukExam(token, attempt.attemptId, answers)
        .then(() => {
          setLastSavedAt(new Date().toISOString());
          trackEvent('exam_autosave', {
            attempt_id: attempt.attemptId,
            answered_count: Object.values(answers).filter(Boolean).length,
          });
        })
        .catch(() => {
          // Keep silent; user will still be able to submit manually.
        });
    }, 25000);

    return () => window.clearInterval(intervalId);
  }, [answers, attempt, questions.length, remainingSeconds, token]);

  const handleSubmit = async () => {
    if (!token || !attempt || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitBurslulukExam(token, attempt.attemptId, answers);
      trackEvent('exam_submit', {
        attempt_id: attempt.attemptId,
        answered_count: Object.values(answers).filter(Boolean).length,
        question_count: questions.length,
      });
      notifySuccess('Sınav tamamlandı. Sonuç bilgilendirmesi SMS ile paylaşılacak.');
      navigate(BURSLULUK_ROUTES.result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sınav teslim edilemedi.';
      notifyError(message);
      setLoadError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <BurslulukCandidateShell
        eyebrow="Sınav"
        title="Sınava erişmek için tekrar giriş yap."
        description="Aktif sınav oturumuna erişmek için kullanıcı adı ve şifrenle giriş yapmalısın."
        backHref={BURSLULUK_ROUTES.login}
      >
        <BurslulukDataPanel title="Oturum Gerekli">
          <BurslulukPrimaryButton href={BURSLULUK_ROUTES.login}>
            Giriş Ekranına Dön
          </BurslulukPrimaryButton>
        </BurslulukDataPanel>
      </BurslulukCandidateShell>
    );
  }

  return (
    <BurslulukCandidateShell
      eyebrow="Sınav Alanı"
      title="Sınav başladı. Yanıtların otomatik kaydediliyor."
      description="Soruları sırayla yanıtlayabilir, ileri-geri gezinebilir ve süre dolmadan teslim edebilirsin."
      backHref={BURSLULUK_ROUTES.waiting}
    >
      {isStarting ? (
        <BurslulukDataPanel title="Hazırlanıyor">
          <div className="flex items-center gap-3 text-[15px] text-white/68">
            <LoaderCircle size={18} className="animate-spin text-[#E70000]" />
            Sınav yükleniyor...
          </div>
        </BurslulukDataPanel>
      ) : loadError ? (
        <BurslulukDataPanel title="Sınav Hatası">
          <p className="text-[15px] leading-[1.8] text-white/72">{loadError}</p>
          <div className="mt-5">
            <BurslulukPrimaryButton href={BURSLULUK_ROUTES.waiting}>
              Bekleme Ekranına Dön
            </BurslulukPrimaryButton>
          </div>
        </BurslulukDataPanel>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="space-y-5">
            <BurslulukDataPanel title="Sınav Durumu">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <MiniMetric label="Öğrenci" value={me?.candidate.studentFullName || '-'} />
                <MiniMetric label="Yanıtlanan" value={`${answeredCount}/${questions.length}`} />
                <MiniMetric label="Kalan Süre" value={formatDuration(remainingSeconds)} />
                <MiniMetric label="Son Kayıt" value={lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Bekleniyor'} />
              </div>
            </BurslulukDataPanel>

            <BurslulukDataPanel title="Soru Haritası">
              <div className="grid grid-cols-4 gap-2">
                {questions.map((question, index) => {
                  const isAnswered = Boolean(answers[question.id]);
                  const isActive = index === currentIndex;
                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`inline-flex h-12 items-center justify-center rounded-[16px] border text-[13px] transition-colors ${
                        isActive
                          ? 'border-[#E70000]/45 bg-[#E70000]/18 text-white'
                          : isAnswered
                            ? 'border-[#1FAF67]/28 bg-[#1FAF67]/10 text-white/82'
                            : 'border-white/10 bg-white/[0.03] text-white/58'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </BurslulukDataPanel>
          </div>

          <BurslulukDataPanel title={`Soru ${currentIndex + 1}`}>
            {currentQuestion ? (
              <div>
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
                  <p className="text-[20px] leading-[1.65] text-white">{currentQuestion.prompt}</p>
                  <div className="mt-6 grid gap-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = answers[currentQuestion.id] === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: option }))}
                          className={`rounded-[20px] border px-4 py-4 text-left text-[15px] leading-[1.7] transition-colors ${
                            isSelected
                              ? 'border-[#E70000]/38 bg-[#E70000]/14 text-white'
                              : 'border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.05]'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3">
                    <BurslulukSecondaryButton onClick={() => setCurrentIndex((current) => Math.max(0, current - 1))}>
                      <ArrowLeft size={14} />
                      Önceki
                    </BurslulukSecondaryButton>
                    <BurslulukSecondaryButton onClick={() => setCurrentIndex((current) => Math.min(questions.length - 1, current + 1))}>
                      Sonraki
                      <ArrowRight size={14} />
                    </BurslulukSecondaryButton>
                  </div>

                  <div className="flex gap-3">
                    <BurslulukSecondaryButton
                      onClick={() => {
                        if (!token || !attempt) return;
                        void saveBurslulukExam(token, attempt.attemptId, answers)
                          .then(() => {
                            setLastSavedAt(new Date().toISOString());
                            notifySuccess('Yanıtlarınız kaydedildi.');
                          })
                          .catch(() => {
                            notifyError('Yanıtlar şu anda kaydedilemedi.');
                          });
                      }}
                    >
                      <Save size={14} />
                      Kaydet
                    </BurslulukSecondaryButton>
                    <BurslulukPrimaryButton onClick={() => void handleSubmit()}>
                      {isSubmitting ? 'Teslim Ediliyor' : 'Sınavı Bitir'}
                    </BurslulukPrimaryButton>
                  </div>
                </div>
              </div>
            ) : null}
          </BurslulukDataPanel>
        </div>
      )}
    </BurslulukCandidateShell>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/42">{label}</p>
      <p className="mt-2 text-[18px] text-white/84">{value}</p>
    </div>
  );
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
