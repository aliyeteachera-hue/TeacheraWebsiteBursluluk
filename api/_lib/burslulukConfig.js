import { fileURLToPath } from 'node:url';

export const STORE_PATH = process.env.BURSLULUK_STORE_PATH || '/tmp/teachera-bursluluk-store.json';
export const SCHOOLS_DATA_PATH = fileURLToPath(new URL('../_data/bursluluk-schools.json', import.meta.url));
export const DEFAULT_RESULT_RELEASE_AT = '2026-03-30T12:00:00+03:00';

export const EXAM_SESSIONS = [
  {
    id: 'oturum-2026-03-28-10-primary',
    label: '28 Mart 2026 · 10:00-11:00 · 1-4. sınıflar',
    startsAt: '2026-03-28T10:00:00+03:00',
    endsAt: '2026-03-28T11:00:00+03:00',
    grades: [1, 2, 3, 4],
  },
  {
    id: 'oturum-2026-03-28-13-middle',
    label: '28 Mart 2026 · 13:00-14:00 · 5-8. sınıflar',
    startsAt: '2026-03-28T13:00:00+03:00',
    endsAt: '2026-03-28T14:00:00+03:00',
    grades: [5, 6, 7, 8],
  },
  {
    id: 'oturum-2026-03-28-15-high',
    label: '28 Mart 2026 · 15:00-16:00 · 9-12. sınıflar',
    startsAt: '2026-03-28T15:00:00+03:00',
    endsAt: '2026-03-28T16:00:00+03:00',
    grades: [9, 10, 11, 12],
  },
  {
    id: 'oturum-2026-03-29-10-high',
    label: '29 Mart 2026 · 10:00-11:00 · 9-12. sınıflar',
    startsAt: '2026-03-29T10:00:00+03:00',
    endsAt: '2026-03-29T11:00:00+03:00',
    grades: [9, 10, 11, 12],
  },
  {
    id: 'oturum-2026-03-29-15-primary',
    label: '29 Mart 2026 · 15:00-16:00 · 2-4. sınıflar',
    startsAt: '2026-03-29T15:00:00+03:00',
    endsAt: '2026-03-29T16:00:00+03:00',
    grades: [2, 3, 4],
  },
  {
    id: 'oturum-2026-03-29-17-middle',
    label: '29 Mart 2026 · 17:00-18:00 · 5-8. sınıflar',
    startsAt: '2026-03-29T17:00:00+03:00',
    endsAt: '2026-03-29T18:00:00+03:00',
    grades: [5, 6, 7, 8],
  },
];

export function getGradeLabel(grade) {
  const numeric = Number(grade);
  if (!Number.isInteger(numeric) || numeric < 1 || numeric > 12) return '';
  return `${numeric}. sınıf`;
}

export function getEligibleSessions(grade) {
  const numeric = Number(grade);
  return EXAM_SESSIONS.filter((session) => session.grades.includes(numeric));
}

export function getSessionById(sessionId) {
  return EXAM_SESSIONS.find((session) => session.id === sessionId) || null;
}

export function resolveResultReleaseAt(state) {
  return state?.publication?.resultReleaseAt || process.env.BURSLULUK_RESULT_RELEASE_AT || DEFAULT_RESULT_RELEASE_AT;
}

export function toMs(value) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : Number.NaN;
}
