import type {
  BurslulukApplicationPayload,
  BurslulukApplicationSummary,
  BurslulukAuthResponse,
  BurslulukExamAttempt,
  BurslulukMeResponse,
  BurslulukQuestion,
  BurslulukResult,
  BurslulukSchool,
} from './types';

type JsonResponse<T> = {
  ok: boolean;
  error?: string;
  message?: string;
} & T;

function mapApiError(errorCode: string, status: number) {
  const code = errorCode.trim().toLowerCase();
  if (!code) return '';

  if (code === 'missing_school') return 'Lütfen okul seçin ya da okul adını girin.';
  if (code === 'invalid_grade') return 'Lütfen geçerli bir sınıf düzeyi seçin.';
  if (code === 'missing_student_name') return 'Lütfen öğrenci ad soyad bilgisini girin.';
  if (code === 'invalid_national_id') return 'T.C. kimlik numarası 11 haneli olmalıdır.';
  if (code === 'invalid_birth_year') return 'Doğum yılı 4 haneli olmalıdır.';
  if (code === 'missing_guardian_name') return 'Lütfen veli ad soyad bilgisini girin.';
  if (code === 'invalid_guardian_phone') return 'Veli telefonu 5XX XXX XX XX formatında olmalıdır.';
  if (code === 'missing_session') return 'Lütfen bir oturum seçin.';
  if (code === 'kvkk_consent_required') return 'Devam etmek için KVKK onayını işaretleyin.';
  if (code === 'invalid_session') return 'Seçilen oturum artık kullanılamıyor. Lütfen yeniden seçin.';
  if (code === 'application_not_found') return 'Başvuru bilgisi bulunamadı.';
  if (code === 'missing_code') return 'Başvuru kodu eksik görünüyor.';
  if (code === 'missing_credentials') return 'Kullanıcı adı ve şifre zorunludur.';
  if (code === 'invalid_credentials') return 'Kullanıcı adı veya şifre doğrulanamadı.';
  if (code === 'missing_reset_fields') return 'Şifre yenilemek için tüm doğrulama alanlarını doldurun.';
  if (code === 'reset_target_not_found') {
    return 'Bu bilgilerle eşleşen bir kayıt bulunamadı. T.C. kimlik no, doğum yılı ve veli telefonunu kontrol edin.';
  }
  if (status >= 500) return 'Sunucu şu anda yanıt vermiyor. Lütfen kısa süre sonra tekrar deneyin.';
  return '';
}

function buildErrorMessage(status: number, fallback: string) {
  if (status === 400) return 'Gönderilen bilgi doğrulanamadı. Lütfen alanları tekrar kontrol edin.';
  if (status === 401) return 'Giriş bilgileri doğrulanamadı.';
  if (status === 404) return 'İlgili kayıt bulunamadı.';
  if (status >= 500) return 'Sunucu şu anda yanıt vermiyor. Lütfen kısa süre sonra tekrar deneyin.';
  return fallback;
}

async function parseJson<T>(response: Response, fallback: string): Promise<T> {
  try {
    const payload = (await response.json()) as JsonResponse<T>;

    if (!response.ok || !payload?.ok) {
      const message =
        payload?.message ||
        mapApiError(payload?.error || '', response.status) ||
        payload?.error ||
        buildErrorMessage(response.status, fallback);
      throw new Error(message);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw error;
    }
    if (!response.ok) {
      throw new Error(buildErrorMessage(response.status, fallback), { cause: error });
    }
    throw new Error(fallback, { cause: error });
  }
}

export async function searchBurslulukSchools(query: string) {
  const response = await fetch(`/api/bursluluk/schools?q=${encodeURIComponent(query)}`, {
    headers: { Accept: 'application/json' },
  });
  return parseJson<{ items: BurslulukSchool[] }>(response, 'Okul listesi şu anda yüklenemiyor.');
}

export async function submitBurslulukApplication(payload: BurslulukApplicationPayload) {
  const response = await fetch('/api/bursluluk/applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      schoolId: payload.schoolId,
      schoolName: payload.schoolName,
      grade: payload.grade,
      branch: payload.branch,
      studentFullName: payload.studentFullName,
      nationalId: payload.identityNumber,
      birthYear: payload.birthYear,
      guardianFullName: payload.guardianFullName,
      guardianPhone: payload.guardianPhone,
      guardianEmail: payload.guardianEmail,
      sessionId: payload.sessionId,
      kvkkConsent: payload.consents.kvkk,
      marketingConsent: payload.consents.marketing,
    }),
  });

  return parseJson<{ application: BurslulukApplicationSummary }>(
    response,
    'Başvurunuz şu anda alınamadı. Lütfen tekrar deneyin.',
  );
}

export async function getBurslulukApplication(code: string) {
  const response = await fetch(`/api/bursluluk/applications?code=${encodeURIComponent(code)}`, {
    headers: { Accept: 'application/json' },
  });
  return parseJson<{ application: BurslulukApplicationSummary }>(response, 'Başvuru bilgisi alınamadı.');
}

export async function loginBursluluk(username: string, password: string) {
  const response = await fetch('/api/bursluluk/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  return parseJson<BurslulukAuthResponse>(response, 'Giriş şu anda tamamlanamıyor.');
}

export async function requestBurslulukPasswordReset(nationalId: string, birthYear: string, guardianPhone: string) {
  const response = await fetch('/api/bursluluk/auth/request-reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ nationalId, birthYear, guardianPhone }),
  });

  return parseJson<{ credentialStatus: string; username?: string; password?: string; smsStatus?: string }>(
    response,
    'Şifre yenileme isteği şu anda oluşturulamıyor.',
  );
}

export async function getBurslulukMe(token: string) {
  const response = await fetch(`/api/bursluluk/me?token=${encodeURIComponent(token)}`, {
    headers: { Accept: 'application/json' },
  });

  return parseJson<BurslulukMeResponse>(response, 'Oturum bilgisi alınamadı.');
}

export async function startBurslulukExam(token: string) {
  const response = await fetch('/api/bursluluk/exam/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  return parseJson<{ attempt: BurslulukExamAttempt; questions: BurslulukQuestion[] }>(
    response,
    'Sınav başlatılamadı.',
  );
}

export async function saveBurslulukExam(token: string, attemptId: string, answers: Record<string, string>) {
  const response = await fetch('/api/bursluluk/exam/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ token, attemptId, answers }),
  });

  return parseJson<Record<string, never>>(response, 'Sınav yanıtları kaydedilemedi.');
}

export async function submitBurslulukExam(token: string, attemptId: string, answers: Record<string, string>) {
  const response = await fetch('/api/bursluluk/exam/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ token, attemptId, answers }),
  });

  return parseJson<{ examStatus: string }>(response, 'Sınav teslim edilemedi.');
}

export async function getBurslulukResults(token: string) {
  const response = await fetch(`/api/bursluluk/results?token=${encodeURIComponent(token)}`, {
    headers: { Accept: 'application/json' },
  });

  return parseJson<{ resultStatus: string; result: BurslulukResult | null }>(
    response,
    'Sonuç bilgisi şu anda alınamıyor.',
  );
}
