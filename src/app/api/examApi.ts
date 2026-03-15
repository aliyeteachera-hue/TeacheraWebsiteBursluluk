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
  consent?: {
    kvkkApproved: boolean;
    contactConsent?: boolean;
    consentVersion: string;
    legalTextVersion?: string;
    source?: string;
  };
  kvkkConsent?: boolean;
  kvkkConsentVersion?: string;
  kvkkLegalTextVersion?: string;
  contactConsent?: boolean;
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
    consentVersion?: string;
  };
}

export interface CandidateLoginResponse {
  session: {
    applicationNo: string;
    attemptId: string;
    candidateId: string;
    sessionToken: string;
    expiresAt: string;
    examStatus: string;
    examLanguage: string;
    examAgeRange: string;
    questionCount: number;
  };
  candidate: {
    studentFullName: string | null;
    parentFullName: string | null;
    grade: number | null;
  };
  gate: {
    exam_open: boolean;
    exam_open_at: string | null;
    server_time_utc: string;
    remaining_seconds: number;
    source?: string;
  };
}

export interface SessionStatusResponse {
  session: {
    attemptId: string;
    applicationNo: string;
    candidateId: string;
    campaignCode: string;
    examStatus: string;
    expiresAt: string;
  };
  gate: {
    exam_open: boolean;
    exam_open_at: string | null;
    server_time_utc: string;
    remaining_seconds: number;
    source?: string;
  };
}

export interface SaveAnswerPayload {
  attemptId: string;
  answers: Array<{
    questionId: string;
    selectedOption: string | null;
    isCorrect: boolean | null;
    scoreDelta: number;
    questionWeight: number;
  }>;
}

export interface SaveAnswerResponse {
  attempt_id: string;
  answered_count: number;
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

export interface ExamResultResponse {
  result: {
    result_id: string;
    attempt_id: string;
    candidate_id: string;
    student_full_name: string | null;
    parent_full_name: string | null;
    parent_phone_e164: string | null;
    school_name: string | null;
    grade: number | null;
    exam_status: string;
    exam_language: string;
    exam_age_range: string;
    question_count: number;
    score: number;
    percentage: number;
    correct_count: number;
    wrong_count: number;
    unanswered_count: number;
    placement_label: string | null;
    cefr_band: string | null;
    status: string;
    started_at: string | null;
    submitted_at: string | null;
    published_at: string | null;
    viewed_at: string | null;
    pii_included: boolean;
  };
}

function isTruthyEnv(value: unknown) {
  return typeof value === 'string' && ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

export function resolveExamApiBase() {
  const base = (import.meta.env.VITE_EXAM_API_BASE || '').trim();
  const directApiInDev = isTruthyEnv(import.meta.env.VITE_DEV_DIRECT_API);

  if (import.meta.env.DEV && !directApiInDev && typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  if (base) return base;
  if (import.meta.env.DEV && typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  throw new Error('missing_vite_exam_api_base');
}

export function resolveExamEndpoint(path: string) {
  const base = resolveExamApiBase();
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

function withJsonHeaders(extra: Record<string, string> = {}) {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...extra,
  };
}

export async function startExamSession(payload: StartExamSessionPayload): Promise<StartExamSessionResponse> {
  const response = await fetch(resolveExamEndpoint('/api/exam/session/start'), {
    method: 'POST',
    headers: withJsonHeaders(),
    body: JSON.stringify(payload),
  });

  return parseApiResponse<StartExamSessionResponse>(response);
}

export async function loginCandidate(username: string, password: string, campaignCode = '2026_BURSLULUK') {
  const response = await fetch(resolveExamEndpoint('/api/exam/candidate/login'), {
    method: 'POST',
    headers: withJsonHeaders(),
    body: JSON.stringify({ username, password, campaignCode }),
  });

  return parseApiResponse<CandidateLoginResponse>(response);
}

export async function getExamSessionStatus(sessionToken: string, attemptId: string) {
  const response = await fetch(
    resolveExamEndpoint(`/api/exam/session/status?attemptId=${encodeURIComponent(attemptId)}`),
    {
      method: 'GET',
      headers: withJsonHeaders({ 'x-exam-session-token': sessionToken }),
    },
  );

  return parseApiResponse<SessionStatusResponse>(response);
}

export async function saveExamAnswers(sessionToken: string, payload: SaveAnswerPayload) {
  const response = await fetch(resolveExamEndpoint('/api/exam/session/answer'), {
    method: 'POST',
    headers: withJsonHeaders({ 'x-exam-session-token': sessionToken }),
    body: JSON.stringify(payload),
    keepalive: true,
  });

  return parseApiResponse<SaveAnswerResponse>(response);
}

export async function submitExam(sessionToken: string, payload: SubmitExamPayload): Promise<SubmitExamResponse> {
  const response = await fetch(resolveExamEndpoint('/api/exam/session/submit'), {
    method: 'POST',
    headers: withJsonHeaders({ 'x-exam-session-token': sessionToken }),
    body: JSON.stringify(payload),
    keepalive: true,
  });

  return parseApiResponse<SubmitExamResponse>(response);
}

export async function getExamResult(sessionToken: string, attemptId: string) {
  const response = await fetch(resolveExamEndpoint(`/api/exam/results/${encodeURIComponent(attemptId)}`), {
    method: 'GET',
    headers: withJsonHeaders({ 'x-exam-session-token': sessionToken }),
  });

  return parseApiResponse<ExamResultResponse>(response);
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
