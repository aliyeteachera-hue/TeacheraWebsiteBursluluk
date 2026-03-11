import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const TURKISH_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

const TURKISH_DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startIdx = firstDay === 0 ? 6 : firstDay - 1;
  return { daysInMonth, startIdx };
}

function getMonthKey(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

export function formatDateTr(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function toISODateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string) {
  if (!value) return null;
  const [yearPart, monthPart, dayPart] = value.split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  return new Date(year, month - 1, day);
}

type DatePickerIndicator = 'calendar' | 'chevron';

interface DatePickerInputProps {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disablePast?: boolean;
  footerNoteText?: string;
  inputClassName?: string;
  panelClassName?: string;
  valueClassName?: string;
  placeholderClassName?: string;
  indicator?: DatePickerIndicator;
  indicatorClassName?: string;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = 'Tarih Seçiniz',
  minDate,
  maxDate,
  disablePast = false,
  footerNoteText,
  inputClassName,
  panelClassName,
  valueClassName = 'text-[#00000B]',
  placeholderClassName = 'text-[#686767]',
  indicator = 'calendar',
  indicatorClassName = 'text-[#686767]',
}: DatePickerInputProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);

  const today = useMemo(() => startOfDay(new Date()), []);
  const normalizedMinDate = useMemo(() => (minDate ? startOfDay(minDate) : null), [minDate]);
  const normalizedMaxDate = useMemo(() => (maxDate ? startOfDay(maxDate) : null), [maxDate]);
  const calendarMinDate = useMemo(() => {
    if (!disablePast) return normalizedMinDate;
    if (!normalizedMinDate) return today;
    return normalizedMinDate > today ? normalizedMinDate : today;
  }, [disablePast, normalizedMinDate, today]);

  const initialDate = value || calendarMinDate || today;
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    if (!value) return;
    if (open) return;
    setViewYear(value.getFullYear());
    setViewMonth(value.getMonth());
  }, [value, open]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) setShowMonthYearPicker(false);
  }, [open]);

  const isDateDisabled = (candidateDate: Date) => {
    const normalizedCandidate = startOfDay(candidateDate);

    if (calendarMinDate && normalizedCandidate < calendarMinDate) return true;
    if (normalizedMaxDate && normalizedCandidate > normalizedMaxDate) return true;

    return false;
  };

  const canGoPrev = useMemo(() => {
    if (!calendarMinDate) return true;
    const prevDate = new Date(viewYear, viewMonth - 1, 1);
    return getMonthKey(prevDate) >= getMonthKey(calendarMinDate);
  }, [viewYear, viewMonth, calendarMinDate]);

  const canGoNext = useMemo(() => {
    if (!normalizedMaxDate) return true;
    const nextDate = new Date(viewYear, viewMonth + 1, 1);
    return getMonthKey(nextDate) <= getMonthKey(normalizedMaxDate);
  }, [viewYear, viewMonth, normalizedMaxDate]);

  const onPrev = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
      return;
    }
    setViewMonth((prev) => prev - 1);
  };

  const onNext = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
      return;
    }
    setViewMonth((prev) => prev + 1);
  };

  const yearBounds = useMemo(() => {
    const fallbackMinYear = disablePast ? today.getFullYear() : today.getFullYear() - 120;
    const minYear = calendarMinDate ? calendarMinDate.getFullYear() : fallbackMinYear;
    const maxYear = normalizedMaxDate ? normalizedMaxDate.getFullYear() : today.getFullYear() + 20;
    if (minYear <= maxYear) return { minYear, maxYear };
    return { minYear: maxYear, maxYear };
  }, [calendarMinDate, normalizedMaxDate, disablePast, today]);

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let year = yearBounds.maxYear; year >= yearBounds.minYear; year -= 1) {
      years.push(year);
    }
    return years;
  }, [yearBounds]);

  const isMonthSelectable = (year: number, month: number) => {
    const monthKey = year * 12 + month;
    if (calendarMinDate && monthKey < getMonthKey(calendarMinDate)) return false;
    if (normalizedMaxDate && monthKey > getMonthKey(normalizedMaxDate)) return false;
    return true;
  };

  const applyYearChange = (nextYear: number) => {
    const boundedYear = Math.min(yearBounds.maxYear, Math.max(yearBounds.minYear, nextYear));
    let nextMonth = viewMonth;
    if (!isMonthSelectable(boundedYear, nextMonth)) {
      const firstSelectableMonth = TURKISH_MONTHS.findIndex((_, monthIndex) => isMonthSelectable(boundedYear, monthIndex));
      if (firstSelectableMonth !== -1) nextMonth = firstSelectableMonth;
    }
    setViewYear(boundedYear);
    setViewMonth(nextMonth);
  };

  const { daysInMonth, startIdx } = getMonthDays(viewYear, viewMonth);
  const cells: (number | null)[] = Array(startIdx).fill(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={inputClassName || 'w-full h-[44px] rounded-[30px] px-5 bg-white border border-black/5 text-left flex items-center justify-between'}
      >
        <span className={value ? valueClassName : placeholderClassName}>
          {value ? formatDateTr(value) : placeholder}
        </span>

        {indicator === 'chevron' ? (
          <ChevronDown
            size={15}
            className={`${indicatorClassName} transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        ) : (
          <CalendarDays size={15} className={indicatorClassName} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className={
              panelClassName ||
              'absolute top-full left-0 right-0 mt-2 bg-white rounded-[20px] shadow-xl shadow-black/20 border border-black/5 overflow-hidden z-30 p-4'
            }
          >
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={onPrev}
                disabled={!canGoPrev}
                className="w-7 h-7 rounded-full hover:bg-[#F4EBD1] flex items-center justify-center transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} className="text-[#00000B]" />
              </button>

              <button
                type="button"
                onClick={() => setShowMonthYearPicker((prev) => !prev)}
                className="font-['Neutraface_2_Text:Demi',sans-serif] text-[14px] text-[#00000B] inline-flex items-center gap-1 cursor-pointer hover:text-[#324D47] transition-colors"
              >
                {TURKISH_MONTHS[viewMonth]} {viewYear}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${showMonthYearPicker ? 'rotate-180' : ''}`}
                />
              </button>

              <button
                type="button"
                onClick={onNext}
                disabled={!canGoNext}
                className="w-7 h-7 rounded-full hover:bg-[#F4EBD1] flex items-center justify-center transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} className="text-[#00000B]" />
              </button>
            </div>

            {showMonthYearPicker && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <select
                  value={viewMonth}
                  onChange={(event) => setViewMonth(Number(event.target.value))}
                  className="h-9 rounded-[10px] border border-black/10 px-2 bg-white text-mobile-meta md:text-[12px] font-['Neutraface_2_Text:Book',sans-serif] text-[#00000B] outline-none focus:border-[#324D47]/40"
                >
                  {TURKISH_MONTHS.map((monthName, monthIndex) => (
                    <option key={monthName} value={monthIndex} disabled={!isMonthSelectable(viewYear, monthIndex)}>
                      {monthName}
                    </option>
                  ))}
                </select>
                <select
                  value={viewYear}
                  onChange={(event) => applyYearChange(Number(event.target.value))}
                  className="h-9 rounded-[10px] border border-black/10 px-2 bg-white text-mobile-meta md:text-[12px] font-['Neutraface_2_Text:Book',sans-serif] text-[#00000B] outline-none focus:border-[#324D47]/40"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {TURKISH_DAYS.map((dayLabel) => (
                <div
                  key={dayLabel}
                  className="text-center text-mobile-kicker md:text-[10px] font-['Neutraface_2_Text:Demi',sans-serif] text-[#686767] py-1"
                >
                  {dayLabel}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((day, index) => {
                if (day === null) return <div key={`empty-${index}`} />;
                const date = new Date(viewYear, viewMonth, day);
                const isSelected = value ? isSameDay(date, value) : false;
                const isToday = isSameDay(date, today);
                const disabled = isDateDisabled(date);

                return (
                  <button
                    key={`${viewYear}-${viewMonth}-${day}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      onChange(date);
                      setOpen(false);
                    }}
                    className={`w-full aspect-square rounded-full flex items-center justify-center text-mobile-meta md:text-[12px] font-['Neutraface_2_Text:Demi',sans-serif] transition-all duration-150 ${
                      disabled
                        ? 'text-[#d0d0d0] cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#324D47] text-white shadow-md'
                        : isToday
                        ? 'bg-[#324D47]/10 text-[#324D47] hover:bg-[#324D47]/20 cursor-pointer'
                        : 'text-[#00000B] hover:bg-[#F4EBD1]/60 cursor-pointer'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {footerNoteText && (
              <p className="text-center text-mobile-kicker md:text-[10px] font-['Neutraface_2_Text:Book',sans-serif] text-[#686767]/60 mt-2">
                {footerNoteText}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
