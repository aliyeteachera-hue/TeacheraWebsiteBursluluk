export interface PlacementExamLead {
  fullName: string;
  phone: string;
  email: string;
  age: string;
  language: string;
  source: string;
  createdAt: string;
}

const LEAD_STORAGE_KEY = 'teachera_placement_exam_lead';
const MAX_LEAD_AGE_MS = 1000 * 60 * 60 * 24;

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
    const createdAtMs = Number(new Date(parsed.createdAt));
    if (!Number.isFinite(createdAtMs)) {
      window.sessionStorage.removeItem(LEAD_STORAGE_KEY);
      return null;
    }
    if (Date.now() - createdAtMs > MAX_LEAD_AGE_MS) {
      window.sessionStorage.removeItem(LEAD_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    window.sessionStorage.removeItem(LEAD_STORAGE_KEY);
    return null;
  }
}

export function clearPlacementExamLead() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(LEAD_STORAGE_KEY);
}
