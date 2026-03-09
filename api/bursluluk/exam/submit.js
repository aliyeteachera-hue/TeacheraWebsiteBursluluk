import { applyCors, parseBody, readToken, requireMethod, sendJson } from '../../_lib/http.js';
import { submitExam } from '../../_lib/burslulukStore.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return;
  if (!requireMethod(req, res, 'POST')) return;

  const body = await parseBody(req);
  const token = readToken(req, body);
  if (!token) {
    sendJson(res, 400, { ok: false, error: 'missing_token' });
    return;
  }

  const submitted = await submitExam(token, body?.answers);
  if (!submitted) {
    sendJson(res, 401, { ok: false, error: 'invalid_token_or_attempt' });
    return;
  }

  sendJson(res, 200, { ok: true, examStatus: submitted.examStatus });
}
