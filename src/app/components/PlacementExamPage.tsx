import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';
import TeacheraLogo from '../../imports/TeacheraLogo';
import { ageRanges, getLanguagesForAge } from './ageLanguageMap';
import { getPlacementBank, type PlacementExamBank } from './exam/placementExamData';

interface RenderQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
}

const QUESTION_COUNT = 24;

function shuffleArray<T>(values: T[]) {
  const clone = [...values];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]];
  }
  return clone;
}

function buildQuestions(bank: PlacementExamBank, count: number): RenderQuestion[] {
  const randomizedSource = shuffleArray(bank.questions);
  const selectedSeeds = randomizedSource.slice(0, Math.min(count, randomizedSource.length));
  const answerPool = Array.from(new Set(bank.questions.map((item) => item.answer.trim()).filter(Boolean)));

  return selectedSeeds.map((seed) => {
    const isBoolean = /^(true|false)$/i.test(seed.answer);

    if (isBoolean) {
      return {
        id: seed.id,
        prompt: seed.prompt,
        answer: seed.answer,
        options: shuffleArray(['True', 'False']),
      };
    }

    const distractors = shuffleArray(answerPool.filter((answer) => answer !== seed.answer)).slice(0, 3);
    const options = Array.from(new Set([seed.answer, ...distractors]));

    return {
      id: seed.id,
      prompt: seed.prompt,
      answer: seed.answer,
      options: shuffleArray(options),
    };
  });
}

function getEstimatedLevel(percentage: number) {
  if (percentage >= 85) return 'B2+';
  if (percentage >= 70) return 'B1 - B2';
  if (percentage >= 50) return 'A2 - B1';
  return 'A1 - A2';
}

export default function PlacementExamPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedAge, setSelectedAge] = useState(searchParams.get('age') ?? '');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('lang') ?? '');
  const [questions, setQuestions] = useState<RenderQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const availableLanguages = useMemo(() => getLanguagesForAge(selectedAge), [selectedAge]);
  const selectedLanguageLabel = availableLanguages.find((language) => language.id === selectedLanguage)?.name;

  const activeBankInfo = useMemo(() => {
    if (!selectedAge || !selectedLanguage) return null;
    return getPlacementBank(selectedAge, selectedLanguage);
  }, [selectedAge, selectedLanguage]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const score = questions.reduce((total, question) => total + (answers[question.id] === question.answer ? 1 : 0), 0);
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  useEffect(() => {
    document.title = 'Seviye Tespit Sınavı | Teachera';
  }, []);

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

  const startExam = () => {
    if (!activeBankInfo || !activeBankInfo.available) return;
    setQuestions(buildQuestions(activeBankInfo.bank, QUESTION_COUNT));
    setAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setIsStarted(true);
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

  const submitExam = () => {
    setIsSubmitted(true);
  };

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
        {!isStarted && (
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
              <div className="mt-5 p-4 rounded-2xl border border-[#324D47]/15 bg-[#F4EBD1]/70">
                <p className="text-[#324D47]/80 text-[13px] leading-relaxed font-['Neutraface_2_Text:Book',sans-serif]">
                  <strong className="font-['Neutraface_2_Text:Demi',sans-serif] text-[#324D47]">
                    Açılacak sınav:
                  </strong>{' '}
                  {activeBankInfo.bank.title} ({activeBankInfo.bank.questions.length} soru havuzu)
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

        {isStarted && questions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {!isSubmitted && (
              <div className="rounded-2xl border border-[#324D47]/15 bg-white/80 p-4 md:p-5">
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

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                    className="h-[42px] px-5 rounded-full border border-[#324D47]/20 text-[#324D47] text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Önceki
                  </button>

                  {currentIndex < questions.length - 1 && (
                    <button
                      onClick={goToNext}
                      className="h-[42px] px-5 rounded-full bg-[#00000B] hover:bg-[#68232E] text-white text-[12px] tracking-[0.08em] font-['Neutraface_2_Text:Demi',sans-serif] inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      Sonraki
                      <ArrowRight size={14} />
                    </button>
                  )}

                  {currentIndex === questions.length - 1 && (
                    <button
                      onClick={submitExam}
                      className="h-[42px] px-5 rounded-full bg-[#E70000] hover:bg-[#c40000] text-white text-[12px] tracking-[0.08em] font-['Neutraface_2_Text:Demi',sans-serif] inline-flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      SINAVI BİTİR
                      <CheckCircle2 size={14} />
                    </button>
                  )}
                </div>

                <p className="mt-5 text-[12px] text-[#324D47]/55 font-['Neutraface_2_Text:Book',sans-serif]">
                  İşaretlenen soru: {answeredCount}/{questions.length}
                </p>
              </div>
            )}

            {isSubmitted && (
              <div className="rounded-3xl border border-[#324D47]/18 bg-white/85 p-6 md:p-8 shadow-[0_14px_30px_rgba(0,0,11,0.06)]">
                <h3 className="font-['Neutraface_2_Text:Bold',sans-serif] text-[#0a0a10] text-[1.6rem] leading-tight">
                  Sınav Sonucu
                </h3>
                <p className="mt-3 text-[14px] text-[#324D47]/75 font-['Neutraface_2_Text:Book',sans-serif]">
                  {score} / {questions.length} doğru · %{percentage} başarı
                </p>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-[#324D47]/15 bg-[#F4EBD1]/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#324D47]/60 font-['Neutraface_2_Text:Demi',sans-serif]">
                      Tahmini Seviye
                    </p>
                    <p className="mt-2 text-[28px] leading-none text-[#324D47] font-['Neutraface_2_Text:Bold',sans-serif]">
                      {getEstimatedLevel(percentage)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#324D47]/15 bg-[#F4EBD1]/70 p-4">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#324D47]/60 font-['Neutraface_2_Text:Demi',sans-serif]">
                      Not
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#324D47]/75 font-['Neutraface_2_Text:Book',sans-serif]">
                      Yazılı seviye tespit sonuçlarınız için, eğitim danışmanlarımız en kısa süre içerisinde sizleri
                      arayarak bilgilendirecektir. Kesin seviye, eğitmen sözlü değerlendirmesi ile netleşir.
                    </p>
                  </div>
                </div>

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
