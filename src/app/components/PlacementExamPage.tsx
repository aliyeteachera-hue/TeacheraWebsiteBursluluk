import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, RotateCcw, ShieldCheck } from 'lucide-react';
import TeacheraLogo from '../../imports/TeacheraLogo';
import { ageRanges, getLanguagesForAge } from './ageLanguageMap';
import {
  getPlacementBandForScore,
  getPlacementBank,
  type PlacementExamBank,
} from './exam/placementExamData';
import { openMailDraft, openMailDraftOnUnload } from './formMailto';
import { readPlacementExamLead, type PlacementExamLead } from './exam/placementExamSession';
import { useLevelAssessment } from './LevelAssessmentContext';
import { trackEvent } from '../lib/analytics';

interface RenderQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  wrongPenalty: number;
}

type SubmissionStatus = 'completed' | 'time_limit_reached' | 'left_exam';

interface ScoreMetrics {
  score: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  percentage: number;
}

interface ExamSnapshot {
  questions: RenderQuestion[];
  answers: Record<string, string>;
  selectedAge: string;
  selectedLanguage: string;
  selectedLanguageLabel: string;
  activeBank: PlacementExamBank | null;
  remainingSeconds: number;
  startedAt: number | null;
  metrics: ScoreMetrics;
}

function shuffleArray<T>(values: T[]) {
  const clone = [...values];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]];
  }
  return clone;
}

function getQuestionOrderValue(id: string): number {
  const numericPart = Number(id.replace(/[^\d]/g, ''));
  return Number.isFinite(numericPart) ? numericPart : Number.MAX_SAFE_INTEGER;
}

function buildQuestions(bank: PlacementExamBank): RenderQuestion[] {
  const selectedSeeds = [...bank.questions].sort((left, right) => {
    const leftOrder = getQuestionOrderValue(left.id);
    const rightOrder = getQuestionOrderValue(right.id);
    return leftOrder - rightOrder;
  });
  const answerPool = Array.from(new Set(bank.questions.map((item) => item.answer.trim()).filter(Boolean)));

  return selectedSeeds.map((seed) => {
    const seedOptions = seed.options?.filter(Boolean) ?? [];
    if (seedOptions.length >= 2) {
      return {
        id: seed.id,
        prompt: seed.prompt,
        answer: seed.answer,
        wrongPenalty: typeof seed.wrongPenalty === 'number' ? seed.wrongPenalty : 0,
        options: shuffleArray(seedOptions),
      };
    }

    const isBoolean = /^(true|false)$/i.test(seed.answer);
    if (isBoolean) {
      return {
        id: seed.id,
        prompt: seed.prompt,
        answer: seed.answer,
        wrongPenalty: typeof seed.wrongPenalty === 'number' ? seed.wrongPenalty : 0,
        options: shuffleArray(['True', 'False']),
      };
    }

    const distractors = shuffleArray(answerPool.filter((answer) => answer !== seed.answer)).slice(0, 3);
    const options = Array.from(new Set([seed.answer, ...distractors]));

    return {
      id: seed.id,
      prompt: seed.prompt,
      answer: seed.answer,
      wrongPenalty: typeof seed.wrongPenalty === 'number' ? seed.wrongPenalty : 0,
      options: shuffleArray(options),
    };
  });
}

function calculateMetrics(questions: RenderQuestion[], answers: Record<string, string>): ScoreMetrics {
  let score = 0;
  let answeredCount = 0;
  let correctCount = 0;
  let wrongCount = 0;

  questions.forEach((question) => {
    const selected = answers[question.id];
    if (!selected) return;

    answeredCount += 1;
    if (selected === question.answer) {
      correctCount += 1;
      score += 1;
      return;
    }

    wrongCount += 1;
    score += question.wrongPenalty;
  });

  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const boundedScore = Math.max(0, score);
  const percentage = questions.length > 0 ? Math.round((boundedScore / questions.length) * 100) : 0;

  return {
    score,
    answeredCount,
    correctCount,
    wrongCount,
    unansweredCount,
    percentage,
  };
}

function getEstimatedLevel(percentage: number) {
  if (percentage >= 85) return 'B2+';
  if (percentage >= 70) return 'B1 - B2';
  if (percentage >= 50) return 'A2 - B1';
  return 'A1 - A2';
}

function formatDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getStatusLabel(status: SubmissionStatus) {
  if (status === 'completed') return 'Tamamlandi';
  if (status === 'time_limit_reached') return 'Sure Doldu';
  return 'Sinavdan Ayrildi';
}

function getPlacementLabel(bank: PlacementExamBank | null, score: number, percentage: number) {
  if (!bank) return getEstimatedLevel(percentage);
  const band = getPlacementBandForScore(bank, score);
  if (!band) return getEstimatedLevel(percentage);
  return band.cefr ? `${band.label} (${band.cefr})` : band.label;
}

function getAudienceLabel(age: string) {
  if (age === '7–12') return 'Çocuklar İçin';
  if (age === '13–17') return 'Gençler İçin';
  return 'Yetişkinler İçin';
}

function getExamDisplayTitle(age: string, languageLabel: string, fallbackTitle: string) {
  if (!languageLabel) return fallbackTitle;
  return `${getAudienceLabel(age)} ${languageLabel} Seviye Tespiti`;
}

function buildResultLines(snapshot: ExamSnapshot, lead: PlacementExamLead | null, status: SubmissionStatus, leaveReason?: string) {
  const now = new Date().toISOString();
  const startedAtIso = snapshot.startedAt ? new Date(snapshot.startedAt).toISOString() : '-';
  const elapsedSeconds = snapshot.startedAt ? Math.max(0, Math.floor((Date.now() - snapshot.startedAt) / 1000)) : 0;
  const placementLabel = getPlacementLabel(snapshot.activeBank, snapshot.metrics.score, snapshot.metrics.percentage);
  const examDisplayTitle = getExamDisplayTitle(
    snapshot.selectedAge,
    snapshot.selectedLanguageLabel,
    snapshot.activeBank?.title || '-',
  );

  const lines = [
    `Ad Soyad: ${lead?.fullName || '-'}`,
    `Telefon: ${lead?.phone || '-'}`,
    `E-posta: ${lead?.email || '-'}`,
    `Yas Araligi: ${snapshot.selectedAge || lead?.age || '-'}`,
    `Dil: ${snapshot.selectedLanguageLabel || snapshot.selectedLanguage || lead?.language || '-'}`,
    `Sinav: ${examDisplayTitle}`,
    `Durum: ${getStatusLabel(status)}`,
    `Toplam Soru: ${snapshot.questions.length}`,
    `Cevaplanan: ${snapshot.metrics.answeredCount}`,
    `Dogru: ${snapshot.metrics.correctCount}`,
    `Yanlis: ${snapshot.metrics.wrongCount}`,
    `Bos: ${snapshot.metrics.unansweredCount}`,
    `Net Puan: ${snapshot.metrics.score}`,
    `Maksimum Puan: ${snapshot.questions.length}`,
    `Yuzde: %${snapshot.metrics.percentage}`,
    `Yerlestirme: ${placementLabel}`,
    `Baslangic: ${startedAtIso}`,
    `Bitis: ${now}`,
    `Gecen Sure (sn): ${elapsedSeconds}`,
    `Kalan Sure (sn): ${snapshot.remainingSeconds}`,
    `Lead Kaynagi: ${lead?.source || '-'}`,
    'Kaynak: PlacementExamPage',
  ];

  if (leaveReason) {
    lines.push(`Ayrilma Nedeni: ${leaveReason}`);
  }

  return lines;
}

export default function PlacementExamPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isOpen: isLevelAssessmentOpen, open: openLevelAssessment } = useLevelAssessment();

  const [selectedAge, setSelectedAge] = useState(searchParams.get('age') ?? '');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('lang') ?? '');
  const [questions, setQuestions] = useState<RenderQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [activeBank, setActiveBank] = useState<PlacementExamBank | null>(null);
  const [lead, setLead] = useState<PlacementExamLead | null>(() => readPlacementExamLead());
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus | null>(null);
  const [isSendingResult, setIsSendingResult] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const availableLanguages = useMemo(() => getLanguagesForAge(selectedAge), [selectedAge]);
  const selectedLanguageLabel =
    availableLanguages.find((language) => language.id === selectedLanguage)?.name ?? selectedLanguage;

  const activeBankInfo = useMemo(() => {
    if (!selectedAge || !selectedLanguage) return null;
    return getPlacementBank(selectedAge, selectedLanguage);
  }, [selectedAge, selectedLanguage]);
  const examDisplayTitle =
    activeBankInfo?.available
      ? getExamDisplayTitle(selectedAge, selectedLanguageLabel, activeBankInfo.bank.title)
      : '';

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isCurrentAnswered = currentQuestion ? Boolean(answers[currentQuestion.id]) : false;

  const metrics = useMemo(() => calculateMetrics(questions, answers), [questions, answers]);

  const reportSentRef = useRef(false);
  const timerSubmissionTriggeredRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const leadPromptedRef = useRef(false);
  const snapshotRef = useRef<ExamSnapshot>({
    questions: [],
    answers: {},
    selectedAge: '',
    selectedLanguage: '',
    selectedLanguageLabel: '',
    activeBank: null,
    remainingSeconds: 0,
    startedAt: null,
    metrics: calculateMetrics([], {}),
  });

  snapshotRef.current = {
    questions,
    answers,
    selectedAge,
    selectedLanguage,
    selectedLanguageLabel,
    activeBank,
    remainingSeconds,
    startedAt: startedAtRef.current,
    metrics,
  };

  useEffect(() => {
    document.title = 'Seviye Tespit Sınavı | Teachera';
  }, []);

  useEffect(() => {
    if (!lead && !isLevelAssessmentOpen && !leadPromptedRef.current) {
      leadPromptedRef.current = true;
      openLevelAssessment('placement_exam_direct_access');
    }
  }, [lead, isLevelAssessmentOpen, openLevelAssessment]);

  useEffect(() => {
    if (isLevelAssessmentOpen) return;

    const latestLead = readPlacementExamLead();
    if (!latestLead) return;

    setLead(latestLead);
    if (!selectedAge && latestLead.age) {
      setSelectedAge(latestLead.age);
    }
    if (!selectedLanguage && latestLead.language) {
      setSelectedLanguage(latestLead.language);
    }
  }, [isLevelAssessmentOpen, selectedAge, selectedLanguage]);

  useEffect(() => {
    if (!selectedAge && !selectedLanguage) return;
    const next = new URLSearchParams();
    if (selectedAge) next.set('age', selectedAge);
    if (selectedLanguage) next.set('lang', selectedLanguage);
    setSearchParams(next, { replace: true });
  }, [selectedAge, selectedLanguage, setSearchParams]);

  useEffect(() => {
    if (!selectedLanguage) return;
    const stillAvailable = availableLanguages.some((item) => item.id === selectedLanguage);
    if (!stillAvailable) {
      setSelectedLanguage('');
    }
  }, [availableLanguages, selectedLanguage]);

  const sendExamResult = async (status: SubmissionStatus) => {
    if (reportSentRef.current) {
      setIsSubmitted(true);
      return;
    }

    reportSentRef.current = true;
    setSubmissionStatus(status);
    setIsSendingResult(true);
    setSendError(null);

    const durationSeconds = startedAtRef.current
      ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))
      : undefined;
    trackEvent('placement_exam_complete', {
      completion_status: status,
      answered_count: metrics.answeredCount,
      correct_count: metrics.correctCount,
      wrong_count: metrics.wrongCount,
      unanswered_count: metrics.unansweredCount,
      score: metrics.score,
      percentage: metrics.percentage,
      question_count: questions.length,
      exam_language: selectedLanguageLabel || selectedLanguage,
      age_range: selectedAge,
      duration_seconds: durationSeconds,
    });

    const sent = await openMailDraft({
      subject: 'Seviye Tespit Sınav Sonucu',
      lines: buildResultLines(snapshotRef.current, lead, status),
    });

    if (!sent) {
      setSendError('Sınav sonucu gönderilirken bir hata oluştu. Lütfen danışmanla iletişime geçin.');
    }

    setIsSendingResult(false);
    setIsSubmitted(true);
  };

  const sendLeaveReportIfNeeded = (leaveReason: string) => {
    if (!isStarted || isSubmitted || reportSentRef.current) return;

    reportSentRef.current = true;
    const durationSeconds = startedAtRef.current
      ? Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000))
      : undefined;
    trackEvent('placement_exam_complete', {
      completion_status: 'left_exam',
      answered_count: metrics.answeredCount,
      correct_count: metrics.correctCount,
      wrong_count: metrics.wrongCount,
      unanswered_count: metrics.unansweredCount,
      score: metrics.score,
      percentage: metrics.percentage,
      question_count: questions.length,
      exam_language: selectedLanguageLabel || selectedLanguage,
      age_range: selectedAge,
      duration_seconds: durationSeconds,
    });
    openMailDraftOnUnload({
      subject: 'Seviye Tespit Sınav Ayrilma Bildirimi',
      lines: buildResultLines(snapshotRef.current, lead, 'left_exam', leaveReason),
    });
  };

  useEffect(() => {
    if (!isStarted || isSubmitted) return;

    const handlePageExit = () => {
      sendLeaveReportIfNeeded('browser_exit');
    };

    window.addEventListener('pagehide', handlePageExit);
    window.addEventListener('beforeunload', handlePageExit);

    return () => {
      window.removeEventListener('pagehide', handlePageExit);
      window.removeEventListener('beforeunload', handlePageExit);
      sendLeaveReportIfNeeded('route_change');
    };
  }, [isStarted, isSubmitted]);

  useEffect(() => {
    if (!isStarted || isSubmitted || questions.length === 0) return;

    if (remainingSeconds <= 0) {
      if (!timerSubmissionTriggeredRef.current) {
        timerSubmissionTriggeredRef.current = true;
        void sendExamResult('time_limit_reached');
      }
      return;
    }

    const timerId = window.setInterval(() => {
      setRemainingSeconds((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isStarted, isSubmitted, questions.length, remainingSeconds]);

  const startExam = () => {
    if (!lead) {
      openLevelAssessment('placement_exam_start_without_lead');
      return;
    }

    if (!activeBankInfo || !activeBankInfo.available) return;

    const nextQuestions = buildQuestions(activeBankInfo.bank);
    setQuestions(nextQuestions);
    setActiveBank(activeBankInfo.bank);
    setAnswers({});
    setCurrentIndex(0);
    setSubmissionStatus(null);
    setSendError(null);
    setIsSubmitted(false);
    setIsStarted(true);
    setRemainingSeconds(nextQuestions.length * 60);
    reportSentRef.current = false;
    timerSubmissionTriggeredRef.current = false;
    startedAtRef.current = Date.now();

    trackEvent('placement_exam_start', {
      exam_language: selectedLanguageLabel || selectedLanguage,
      age_range: selectedAge,
      question_count: nextQuestions.length,
      exam_bank: activeBankInfo.bank.key,
    });
  };

  const restartExam = () => {
    startExam();
  };

  const handleSelectOption = (option: string) => {
    if (!currentQuestion || isSubmitted) return;
    setAnswers((previous) => ({ ...previous, [currentQuestion.id]: option }));
  };

  const goToPrevious = () => setCurrentIndex((index) => Math.max(0, index - 1));
  const goToNext = () => setCurrentIndex((index) => Math.min(questions.length - 1, index + 1));
  const skipQuestion = () => goToNext();

  const placementLabel = getPlacementLabel(activeBank, metrics.score, metrics.percentage);

  return (
    <div className="min-h-screen bg-[#F4EBD1]">
      <section className="relative bg-[#0a0a10] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] [background-size:34px_34px]" />
        </div>

        <div className="max-w-[1100px] mx-auto px-6 lg:px-12 pt-26 pb-14 relative z-10">
          <h1 className="sr-only">Konya ve Türkiye Geneline Uygun Ücretsiz Yabancı Dil Seviye Tespit Sınavı</h1>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white/45 hover:text-white/75 transition-colors text-[11px] tracking-[0.18em] font-['Neutraface_2_Text:Demi',sans-serif] mb-8 cursor-pointer"
          >
            <ArrowLeft size={13} />
            GERİ DÖN
          </button>

          <div className="w-[120px] h-[24px] mb-6" style={{ '--fill-0': '#EEEBF5' } as React.CSSProperties}>
            <TeacheraLogo />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={14} className="text-[#E70000]" />
            <span className="text-[#E70000] text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] tracking-[0.28em] uppercase">
              Seviye Tespit Sınavı
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-6 lg:px-12 py-10 md:py-14">
        {!lead && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-[#324D47]/20 bg-white/85 p-6 md:p-8 shadow-[0_14px_30px_rgba(0,0,11,0.06)]"
          >
            <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#0a0a10] text-[1.5rem] mb-3">
              Sınava Başlamadan Önce
            </h2>
            <p className="text-[#324D47]/80 text-[14px] leading-relaxed font-['Neutraface_2_Text:Book',sans-serif]">
              Seviye tespit sınavını başlatmak için önce kısa bilgi formunu doldurmanız gerekiyor.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openLevelAssessment('placement_exam_gate_cta')}
                className="h-[44px] px-6 rounded-full bg-[#00000B] hover:bg-[#68232E] text-white text-[12px] tracking-[0.1em] font-['Neutraface_2_Text:Demi',sans-serif] inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                FORMU DOLDUR
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate('/iletisim')}
                className="h-[44px] px-6 rounded-full border border-[#324D47]/25 text-[#324D47] hover:bg-[#324D47]/10 text-[12px] tracking-[0.08em] font-['Neutraface_2_Text:Demi',sans-serif] transition-colors inline-flex items-center"
              >
                DANIŞMANA SOR
              </button>
            </div>
          </motion.div>
        )}

        {lead && !isStarted && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-[#324D47]/20 bg-white/80 p-6 md:p-8 shadow-[0_14px_30px_rgba(0,0,11,0.06)]"
          >
            <h2 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#0a0a10] text-[1.5rem] mb-5">
              Sınav Parametreleri
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-[12px] uppercase tracking-[0.16em] text-[#324D47]/70 font-['Neutraface_2_Text:Demi',sans-serif]">
                  Yaş Aralığı
                </span>
                <select
                  value={selectedAge}
                  onChange={(event) => setSelectedAge(event.target.value)}
                  className="h-[46px] rounded-full border border-[#324D47]/20 bg-white px-4 text-[14px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#0a0a10] outline-none"
                >
                  <option value="">Seçiniz</option>
                  {ageRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-[12px] uppercase tracking-[0.16em] text-[#324D47]/70 font-['Neutraface_2_Text:Demi',sans-serif]">
                  Dil
                </span>
                <select
                  value={selectedLanguage}
                  onChange={(event) => setSelectedLanguage(event.target.value)}
                  disabled={!selectedAge}
                  className="h-[46px] rounded-full border border-[#324D47]/20 bg-white px-4 text-[14px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#0a0a10] outline-none disabled:opacity-50"
                >
                  <option value="">Seçiniz</option>
                  {availableLanguages.map((language) => (
                    <option key={language.id} value={language.id}>
                      {language.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {activeBankInfo && activeBankInfo.available && (
              <div className="mt-5 p-4 rounded-2xl border border-[#324D47]/15 bg-[#F4EBD1]/70 space-y-2">
                <p className="text-[#324D47]/80 text-[13px] leading-relaxed font-['Neutraface_2_Text:Book',sans-serif]">
                  <strong className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]">
                    Açılacak sınav:
                  </strong>{' '}
                  {examDisplayTitle} ({activeBankInfo.bank.questions.length} soru)
                </p>
                <p className="text-[12px] text-[#324D47]/70 font-['Neutraface_2_Text:Book',sans-serif] inline-flex items-center gap-2">
                  <Clock3 size={12} />
                  Toplam süre: {activeBankInfo.bank.questions.length} dakika (soru başı 1 dakika)
                </p>
              </div>
            )}

            {activeBankInfo && !activeBankInfo.available && (
              <div className="mt-5 p-4 rounded-2xl border border-[#E70000]/20 bg-[#FFF3F1]">
                <p className="text-[#68232E] text-[13px] leading-relaxed font-['Neutraface_2_Text:Book',sans-serif]">
                  {activeBankInfo.note}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {activeBankInfo?.available && (
                <button
                  onClick={startExam}
                  className="h-[44px] px-6 rounded-full bg-[#00000B] hover:bg-[#68232E] text-white text-[12px] tracking-[0.1em] font-['Neutraface_2_Text:Demi',sans-serif] inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  SINAVI BAŞLAT
                  <ArrowRight size={14} />
                </button>
              )}
              <button
                onClick={() => navigate('/iletisim')}
                className="h-[44px] px-6 rounded-full border border-[#324D47]/25 text-[#324D47] hover:bg-[#324D47]/10 text-[12px] tracking-[0.08em] font-['Neutraface_2_Text:Demi',sans-serif] transition-colors inline-flex items-center"
              >
                DANIŞMANA SOR
              </button>
            </div>
          </motion.div>
        )}

        {lead && isStarted && questions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {!isSubmitted && (
              <div className="rounded-2xl border border-[#324D47]/15 bg-white/80 p-4 md:p-5 space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] text-[#324D47]/75 font-['Neutraface_2_Text:Demi',sans-serif]">
                    {selectedLanguageLabel} · {selectedAge}
                  </p>
                  <p className="text-[12px] text-[#324D47]/55 font-['Neutraface_2_Text:Demi',sans-serif]">
                    {currentIndex + 1}/{questions.length}
                  </p>
                </div>
                <div className="h-[6px] rounded-full bg-[#324D47]/10 overflow-hidden">
                  <div className="h-full bg-[#324D47] transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between gap-3 text-[12px] text-[#324D47]/75 font-['Neutraface_2_Text:Demi',sans-serif]">
                  <span className="inline-flex items-center gap-2">
                    <Clock3 size={12} />
                    Kalan Süre: {formatDuration(remainingSeconds)}
                  </span>
                  <span>
                    Cevaplanan: {metrics.answeredCount}/{questions.length}
                  </span>
                </div>
              </div>
            )}

            {!isSubmitted && currentQuestion && (
              <div className="rounded-3xl border border-[#324D47]/18 bg-white/85 p-6 md:p-8 shadow-[0_14px_30px_rgba(0,0,11,0.06)]">
                <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#0a0a10] text-[1.25rem] leading-[1.5]">
                  {currentQuestion.prompt}
                </h3>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option) => {
                    const selected = answers[currentQuestion.id] === option;
                    return (
                      <button
                        key={option}
                        onClick={() => handleSelectOption(option)}
                        className={`text-left min-h-[48px] px-4 py-3 rounded-2xl border transition-colors font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] cursor-pointer ${
                          selected
                            ? 'border-[#324D47] bg-[#324D47]/10 text-[#324D47]'
                            : 'border-[#324D47]/15 bg-white hover:border-[#324D47]/35 text-[#0a0a10]'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-7 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={goToPrevious}
                      disabled={currentIndex === 0}
                      className="h-[42px] px-5 rounded-full border border-[#324D47]/20 text-[#324D47] text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Önceki
                    </button>

                    {currentIndex < questions.length - 1 && (
                      <>
                        <button
                          onClick={skipQuestion}
                          aria-label="Soruyu atla"
                          className="md:hidden h-[36px] px-2 text-[#324D47]/65 hover:text-[#324D47] text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          Atla
                          <ArrowRight size={12} />
                        </button>
                        <button
                          onClick={goToNext}
                          disabled={!isCurrentAnswered}
                          className="h-[42px] px-5 rounded-full bg-[#324D47] hover:bg-[#3d5e56] text-white text-[12px] tracking-[0.08em] font-['Neutraface_2_Text:Demi',sans-serif] inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                        >
                          Sonraki
                          <ArrowRight size={14} />
                        </button>
                      </>
                    )}

                    {currentIndex === questions.length - 1 && (
                      <button
                        onClick={() => void sendExamResult('completed')}
                        disabled={isSendingResult}
                        className="h-[42px] px-5 rounded-full bg-[#E70000] hover:bg-[#c40000] text-white text-[12px] tracking-[0.08em] font-['Neutraface_2_Text:Demi',sans-serif] inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                      >
                        SINAVI BİTİR
                        <CheckCircle2 size={14} />
                      </button>
                    )}
                  </div>

                  {currentIndex < questions.length - 1 && (
                    <div className="hidden md:flex items-center">
                      <button
                        onClick={skipQuestion}
                        aria-label="Soruyu atla"
                        className="h-[34px] px-1 text-[#324D47]/60 hover:text-[#324D47] text-[11px] font-['Neutraface_2_Text:Demi',sans-serif] inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        Soruyu Atla
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <p className="mt-5 text-[12px] text-[#324D47]/55 font-['Neutraface_2_Text:Book',sans-serif]">
                  Süre dolduğunda sınav otomatik olarak gönderilir.
                </p>
              </div>
            )}

            {isSubmitted && (
              <div className="rounded-3xl border border-[#324D47]/18 bg-white/85 p-6 md:p-8 shadow-[0_14px_30px_rgba(0,0,11,0.06)]">
                <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#0a0a10] text-[1.6rem] leading-tight">
                  Sınav Sonucu
                </h3>
                <p className="mt-3 text-[14px] text-[#324D47]/75 font-['Neutraface_2_Text:Book',sans-serif]">
                  Durum: {submissionStatus ? getStatusLabel(submissionStatus) : '-'}
                </p>
                <p className="mt-1 text-[14px] text-[#324D47]/75 font-['Neutraface_2_Text:Book',sans-serif]">
                  {metrics.correctCount} doğru · {metrics.wrongCount} yanlış · {metrics.unansweredCount} boş
                </p>
                <p className="mt-1 text-[14px] text-[#324D47]/75 font-['Neutraface_2_Text:Book',sans-serif]">
                  Net: {metrics.score} / {questions.length} · %{metrics.percentage}
                </p>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-[#324D47]/15 bg-[#F4EBD1]/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#324D47]/60 font-['Neutraface_2_Text:Demi',sans-serif]">
                      Yerleştirme
                    </p>
                    <p className="mt-2 text-[24px] leading-none text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif]">
                      {placementLabel}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#324D47]/15 bg-[#F4EBD1]/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#324D47]/60 font-['Neutraface_2_Text:Demi',sans-serif]">
                      Bilgilendirme
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#324D47]/75 font-['Neutraface_2_Text:Book',sans-serif]">
                      Yazılı seviye tespit sonuçlarınız için, eğitim danışmanlarımız en kısa süre içerisinde sizleri
                      arayarak bilgilendirecektir. Kesin seviye, eğitmen sözlü değerlendirmesi ile netleşir.
                    </p>
                  </div>
                </div>

                {sendError && (
                  <p className="mt-5 text-[12px] rounded-xl border border-[#E70000]/25 bg-[#FFF3F1] text-[#68232E] px-3 py-2 font-['Neutraface_2_Text:Demi',sans-serif]">
                    {sendError}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    onClick={restartExam}
                    className="h-[42px] px-5 rounded-full bg-[#00000B] hover:bg-[#68232E] text-white text-[12px] tracking-[0.08em] font-['Neutraface_2_Text:Demi',sans-serif] inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    TEKRAR ÇÖZ
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setIsStarted(false);
                      setIsSubmitted(false);
                      setSubmissionStatus(null);
                      setSendError(null);
                    }}
                    className="h-[42px] px-5 rounded-full border border-[#324D47]/25 text-[#324D47] hover:bg-[#324D47]/10 text-[12px] tracking-[0.08em] font-['Neutraface_2_Text:Demi',sans-serif] transition-colors inline-flex items-center"
                  >
                    FARKLI SINAV SEÇ
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
}
