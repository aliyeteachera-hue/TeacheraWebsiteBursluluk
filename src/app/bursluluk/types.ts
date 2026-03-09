export interface BurslulukSchool {
  id: string;
  name: string;
  district: string;
  type: string;
}

export interface BurslulukApplicationPayload {
  schoolId?: string;
  schoolName: string;
  grade: number;
  branch: string;
  studentFullName: string;
  identityNumber: string;
  birthYear: string;
  guardianFullName: string;
  guardianPhone: string;
  guardianEmail: string;
  sessionId: string;
  consents: {
    kvkk: boolean;
    marketing: boolean;
  };
}

export interface BurslulukApplicationSummary {
  applicationCode: string;
  username?: string;
  password?: string;
  schoolName: string;
  grade?: number;
  gradeLabel?: string;
  branch?: string;
  studentFullName?: string;
  guardianFullName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  sessionId: string;
  sessionLabel: string;
  credentialStatus: string;
  examStatus?: string;
  resultStatus?: string;
  createdAt: string;
}

export interface BurslulukCandidate {
  applicationCode: string;
  studentFullName: string;
  schoolName: string;
  grade: number;
  branch?: string;
  sessionId: string;
  examStatus: string;
  resultStatus: string;
}

export interface BurslulukSessionState {
  id: string;
  label: string;
  startsAt: string;
  endsAt: string;
}

export interface BurslulukAuthResponse {
  token: string;
  candidate: BurslulukCandidate;
}

export interface BurslulukQuestion {
  id: string;
  prompt: string;
  options: string[];
}

export interface BurslulukExamAttempt {
  attemptId: string;
  startedAt: string;
  expiresAt: string;
  questionCount: number;
  answers?: Record<string, string>;
}

export interface BurslulukResult {
  score: number;
  percentage: number;
  scholarshipRate: number;
  summary: string;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  publishedAt?: string;
  viewedAt?: string;
}

export interface BurslulukMeResponse {
  candidate: BurslulukCandidate;
  session: BurslulukSessionState | null;
  attempt?: BurslulukExamAttempt | null;
  result?: BurslulukResult | null;
}
