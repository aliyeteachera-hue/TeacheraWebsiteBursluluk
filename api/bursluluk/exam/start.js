import { applyCors, parseBody, readToken, requireMethod, sendJson } from '../../_lib/http.js';
import { startExam } from '../../_lib/burslulukStore.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return;
  if (!requireMethod(req, res, 'POST')) return;

  const body = await parseBody(req);
  const token = readToken(req, body);
  if (!token) {
    sendJson(res, 400, { ok: false, error: 'missing_token' });
    return;
  }

  try {
    const payload = await startExam(token);
    if (!payload) {
      sendJson(res, 401, { ok: false, error: 'invalid_token' });
      return;
    }

    sendJson(res, 200, { ok: true, ...payload });
  } catch (error) {
    if (error instanceof Error && error.message === 'exam_not_open') {
      sendJson(res, 409, { ok: false, error: 'exam_not_open' });
      return;
    }

    sendJson(res, 500, { ok: false, error: 'exam_start_failed' });
  }
}
