import type { BurslulukApplicationSummary } from './types';

const AUTH_TOKEN_KEY = 'teachera_bursluluk_auth_token';
const LAST_APPLICATION_KEY = 'teachera_bursluluk_last_application';

function readFromSessionStorage(key: string) {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeToSessionStorage(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    // Ignore private mode and quota errors.
  }
}

function removeFromSessionStorage(key: string) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore private mode and quota errors.
  }
}

export function saveBurslulukAuthToken(token: string) {
  writeToSessionStorage(AUTH_TOKEN_KEY, token);
}

export function readBurslulukAuthToken() {
  return readFromSessionStorage(AUTH_TOKEN_KEY);
}

export function clearBurslulukAuthToken() {
  removeFromSessionStorage(AUTH_TOKEN_KEY);
}

export function saveLastBurslulukApplication(application: BurslulukApplicationSummary) {
  writeToSessionStorage(LAST_APPLICATION_KEY, JSON.stringify(application));
}

export function readLastBurslulukApplication(): BurslulukApplicationSummary | null {
  const raw = readFromSessionStorage(LAST_APPLICATION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as BurslulukApplicationSummary;
  } catch {
    removeFromSessionStorage(LAST_APPLICATION_KEY);
    return null;
  }
}
