export interface StartExamSessionPayload {
  studentFullName: string;
  parentFullName: string;
  parentPhoneE164: string;
  parentEmail?: string;
  schoolName?: string;
  grade?: number;
  ageRange: string;
  language: string;
  source?: string;
  bankKey?: string;
  questionCount?: number;
  campaignCode?: string;
}

export interface StartExamSessionResponse {
  session: {
    candidateId: string;
    applicationNo: string;
    applicationStatus: string;
    attemptId: string;
    sessionToken: string;
    expiresAt: string;
    startedAt: string;
    credentialsSmsStatus?: string;
    credentialsSmsJobId?: string;
  };
}

export interface SubmitExamPayload {
  attemptId: string;
  completionStatus: 'completed' | 'time_limit_reached' | 'left_exam';
  durationSeconds: number;
  placementLabel?: string;
  cefrBand?: string;
  answers?: Array<{
    questionId: string;
    selectedOption: string | null;
    isCorrect: boolean | null;
    scoreDelta: number;
    questionWeight: number;
  }>;
  metrics: {
    score: number;
    percentage: number;
    answeredCount: number;
    correctCount: number;
    wrongCount: number;
    unansweredCount: number;
    placementLabel?: string;
  };
}

export interface SubmitExamResponse {
  result: {
    attempt_id: string;
    result_id: string;
    status: string;
    score: number;
    percentage: number;
    placement_label: string | null;
    cefr_band: string | null;
    published_at: string | null;
    viewed_at: string | null;
  };
  notifications_enqueued: boolean;
}

function resolveExamApiBase() {
  return (import.meta.env.VITE_EXAM_API_BASE || '').trim();
}

function resolveExamEndpoint(path: string) {
  const base = resolveExamApiBase();
  if (!base) return path;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const reason = typeof payload === 'object' && payload && 'message' in payload ? String(payload.message) : `HTTP ${response.status}`;
    throw new Error(reason);
  }
  return payload as T;
}

export async function startExamSession(payload: StartExamSessionPayload): Promise<StartExamSessionResponse> {
  const response = await fetch(resolveExamEndpoint('/api/exam/session/start'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<StartExamSessionResponse>(response);
}

export async function submitExam(sessionToken: string, payload: SubmitExamPayload): Promise<SubmitExamResponse> {
  const response = await fetch(resolveExamEndpoint('/api/exam/session/submit'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-exam-session-token': sessionToken,
    },
    body: JSON.stringify(payload),
    keepalive: true,
  });

  return parseApiResponse<SubmitExamResponse>(response);
}

export function submitExamOnUnload(sessionToken: string, payload: SubmitExamPayload): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') return false;

  const endpoint = resolveExamEndpoint('/api/exam/session/submit');
  const body = {
    ...payload,
    sessionToken,
  };

  try {
    const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
    return navigator.sendBeacon(endpoint, blob);
  } catch {
    return false;
  }
}
