import {
  applyCors,
  normalizeDigits,
  normalizePhone,
  parseBody,
  requireMethod,
  sendJson,
  safeTrim,
} from '../_lib/http.js';
import { createOrReissueApplication, getApplicationConfirmation } from '../_lib/burslulukStore.js';
import { getSessionById, getGradeLabel } from '../_lib/burslulukConfig.js';

function buildApplicationResponse(created) {
  const session = getSessionById(created.application.sessionId);
  return {
    applicationCode: created.application.applicationCode,
    username: created.credential.username,
    password: created.credential.password,
    schoolName: created.application.schoolName,
    gradeLabel: getGradeLabel(created.application.grade),
    sessionId: created.application.sessionId,
    sessionLabel: session?.label || '',
    credentialStatus: created.credential.credentialStatus,
  };
}

function validateApplicationPayload(body) {
  const grade = Number(body?.grade);
  const nationalId = normalizeDigits(body?.nationalId);
  const birthYear = normalizeDigits(body?.birthYear);
  const guardianPhone = normalizePhone(body?.guardianPhone);

  if (!safeTrim(body?.schoolId) && !safeTrim(body?.schoolName)) return 'missing_school';
  if (!Number.isInteger(grade) || grade < 1 || grade > 12) return 'invalid_grade';
  if (!safeTrim(body?.studentFullName)) return 'missing_student_name';
  if (nationalId.length !== 11) return 'invalid_national_id';
  if (birthYear.length !== 4) return 'invalid_birth_year';
  if (!safeTrim(body?.guardianFullName)) return 'missing_guardian_name';
  if (guardianPhone.length !== 12) return 'invalid_guardian_phone';
  if (!safeTrim(body?.sessionId)) return 'missing_session';
  if (!body?.kvkkConsent) return 'kvkk_consent_required';
  return '';
}

export default async function handler(req, res) {
  if (!applyCors(req, res)) return;

  if (req.method === 'GET') {
    const code = safeTrim(req.query?.code);
    if (!code) {
      sendJson(res, 400, { ok: false, error: 'missing_code' });
      return;
    }

    const application = await getApplicationConfirmation(code);
    if (!application) {
      sendJson(res, 404, { ok: false, error: 'application_not_found' });
      return;
    }

    sendJson(res, 200, { ok: true, application });
    return;
  }

  if (!requireMethod(req, res, 'POST')) return;
  const body = await parseBody(req);
  if (!body || typeof body !== 'object') {
    sendJson(res, 400, { ok: false, error: 'invalid_json' });
    return;
  }

  const validationError = validateApplicationPayload(body);
  if (validationError) {
    sendJson(res, 400, { ok: false, error: validationError });
    return;
  }

  try {
    const created = await createOrReissueApplication(body);
    sendJson(res, 200, { ok: true, application: buildApplicationResponse(created) });
  } catch (error) {
    if (error instanceof Error && error.message === 'invalid_session') {
      sendJson(res, 400, { ok: false, error: 'invalid_session' });
      return;
    }

    sendJson(res, 500, { ok: false, error: 'application_create_failed' });
  }
}
