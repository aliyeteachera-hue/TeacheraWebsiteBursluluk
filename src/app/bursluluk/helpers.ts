import { BURSLULUK_GRADE_OPTIONS, BURSLULUK_SESSIONS } from './config';

export function getGradeLabel(grade: number) {
  return `${grade}. sınıf`;
}

export function getBranchLabel(branch: string) {
  return branch.trim() ? branch.trim().toUpperCase() : '-';
}

export function getSessionsForGrade(grade: number) {
  return BURSLULUK_SESSIONS.filter((session) => (session.grades as readonly number[]).includes(grade));
}

export function getSessionById(sessionId: string) {
  return BURSLULUK_SESSIONS.find((session) => session.id === sessionId) || null;
}

export function formatIdentityNumber(value: string) {
  return value.replace(/[^\d]/g, '').slice(0, 11);
}

export function formatBirthYear(value: string) {
  return value.replace(/[^\d]/g, '').slice(0, 4);
}

export function normalizeSchoolSearch(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function getAvailableGrades() {
  return [...BURSLULUK_GRADE_OPTIONS];
}

export function getSessionWindowStatus(startsAt: string, endsAt: string, now = new Date()) {
  const startMs = new Date(startsAt).getTime();
  const endMs = new Date(endsAt).getTime();
  const nowMs = now.getTime();

  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    return 'unknown';
  }
  if (nowMs < startMs) return 'waiting';
  if (nowMs <= endMs) return 'open';
  return 'closed';
}

export function formatCountdown(targetIso: string, now = new Date()) {
  const distanceMs = Math.max(0, new Date(targetIso).getTime() - now.getTime());
  const totalSeconds = Math.floor(distanceMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
