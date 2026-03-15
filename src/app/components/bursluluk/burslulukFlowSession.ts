export interface BurslulukApplicationRecord {
  applicationNo: string;
  sessionToken: string;
  attemptId: string;
  candidateId: string;
  schoolName: string;
  studentFullName: string;
  parentFullName: string;
  parentPhoneE164: string;
  grade: number;
  createdAt: string;
}

export interface BurslulukCandidateSession {
  applicationNo: string;
  sessionToken: string;
  attemptId: string;
  candidateId: string;
  examLanguage: string;
  examAgeRange: string;
  questionCount: number;
  expiresAt: string;
  createdAt: string;
}

const APPLICATION_KEY = 'teachera_bursluluk_application_record';
const SESSION_KEY = 'teachera_bursluluk_candidate_session';
const MAX_SESSION_AGE_MS = 1000 * 60 * 60 * 24;

function readStorageItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

function writeStorageItem<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

function isFresh(createdAt: string) {
  const ts = Number(new Date(createdAt));
  return Number.isFinite(ts) && Date.now() - ts <= MAX_SESSION_AGE_MS;
}

export function saveBurslulukApplicationRecord(record: Omit<BurslulukApplicationRecord, 'createdAt'>) {
  writeStorageItem<BurslulukApplicationRecord>(APPLICATION_KEY, {
    ...record,
    createdAt: new Date().toISOString(),
  });
}

export function readBurslulukApplicationRecord() {
  const value = readStorageItem<BurslulukApplicationRecord>(APPLICATION_KEY);
  if (!value) return null;
  if (!isFresh(value.createdAt)) {
    clearBurslulukApplicationRecord();
    return null;
  }
  return value;
}

export function clearBurslulukApplicationRecord() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(APPLICATION_KEY);
}

export function saveBurslulukCandidateSession(session: Omit<BurslulukCandidateSession, 'createdAt'>) {
  writeStorageItem<BurslulukCandidateSession>(SESSION_KEY, {
    ...session,
    createdAt: new Date().toISOString(),
  });
}

export function readBurslulukCandidateSession() {
  const value = readStorageItem<BurslulukCandidateSession>(SESSION_KEY);
  if (!value) return null;
  if (!isFresh(value.createdAt)) {
    clearBurslulukCandidateSession();
    return null;
  }
  return value;
}

export function clearBurslulukCandidateSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(SESSION_KEY);
}
