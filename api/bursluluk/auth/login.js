import { applyCors, parseBody, requireMethod, sendJson, safeTrim } from '../../_lib/http.js';
import { loginCandidate } from '../../_lib/burslulukStore.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return;
  if (!requireMethod(req, res, 'POST')) return;

  const body = await parseBody(req);
  const username = safeTrim(body?.username);
  const password = safeTrim(body?.password);

  if (!username || !password) {
    sendJson(res, 400, { ok: false, error: 'missing_credentials' });
    return;
  }

  const loggedIn = await loginCandidate(username, password);
  if (!loggedIn) {
    sendJson(res, 401, { ok: false, error: 'invalid_credentials' });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    token: loggedIn.token,
    candidate: {
      applicationCode: loggedIn.candidate.applicationCode,
      studentFullName: loggedIn.candidate.studentFullName,
      schoolName: loggedIn.candidate.schoolName,
      grade: loggedIn.candidate.grade,
      sessionId: loggedIn.candidate.sessionId,
      examStatus: loggedIn.candidate.examStatus,
      resultStatus: loggedIn.candidate.resultStatus,
    },
  });
}
