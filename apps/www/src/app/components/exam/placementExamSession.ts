export interface PlacementExamLead {
  fullName: string;
  phone: string;
  email: string;
  age: string;
  language: string;
  source: string;
  kvkkConsent: boolean;
  contactConsent: boolean;
  kvkkConsentVersion: string;
  kvkkLegalTextVersion: string;
  consentCapturedAt: string;
  createdAt: string;
}

const LEAD_STORAGE_KEY = 'teachera_placement_exam_lead';
const MAX_LEAD_AGE_MS = 1000 * 60 * 60 * 24;
const DEFAULT_KVKK_CONSENT_VERSION = 'KVKK_v1_2026-03-13';

function normalizeLead(raw: PlacementExamLead) {
  return {
    ...raw,
    kvkkConsent: raw.kvkkConsent === false ? false : true,
    contactConsent: raw.contactConsent === true,
    kvkkConsentVersion: String(raw.kvkkConsentVersion || DEFAULT_KVKK_CONSENT_VERSION),
    kvkkLegalTextVersion: String(raw.kvkkLegalTextVersion || raw.kvkkConsentVersion || DEFAULT_KVKK_CONSENT_VERSION),
    consentCapturedAt: String(raw.consentCapturedAt || raw.createdAt || new Date().toISOString()),
  } satisfies PlacementExamLead;
}

export function savePlacementExamLead(lead: Omit<PlacementExamLead, 'createdAt'>) {
  if (typeof window === 'undefined') return;
  const payload: PlacementExamLead = {
    ...lead,
    createdAt: new Date().toISOString(),
  };
  window.sessionStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(payload));
}

export function readPlacementExamLead() {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(LEAD_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PlacementExamLead;
    const normalized = normalizeLead(parsed);
    const createdAtMs = Number(new Date(parsed.createdAt));
    if (!Number.isFinite(createdAtMs)) {
      window.sessionStorage.removeItem(LEAD_STORAGE_KEY);
      return null;
    }
    if (Date.now() - createdAtMs > MAX_LEAD_AGE_MS) {
      window.sessionStorage.removeItem(LEAD_STORAGE_KEY);
      return null;
    }
    return normalized;
  } catch {
    window.sessionStorage.removeItem(LEAD_STORAGE_KEY);
    return null;
  }
}

export function clearPlacementExamLead() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(LEAD_STORAGE_KEY);
}
