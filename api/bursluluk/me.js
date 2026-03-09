import { applyCors, readToken, requireMethod, sendJson } from '../_lib/http.js';
import { getCandidateMe } from '../_lib/burslulukStore.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return;
  if (!requireMethod(req, res, 'GET')) return;

  const token = readToken(req);
  if (!token) {
    sendJson(res, 400, { ok: false, error: 'missing_token' });
    return;
  }

  const me = await getCandidateMe(token);
  if (!me) {
    sendJson(res, 401, { ok: false, error: 'invalid_token' });
    return;
  }

  sendJson(res, 200, { ok: true, ...me });
}
