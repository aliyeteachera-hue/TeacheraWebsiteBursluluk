import { applyCors, parseBody, requireMethod, sendJson, safeTrim } from '../../_lib/http.js';
import { requestPasswordReset } from '../../_lib/burslulukStore.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return;
  if (!requireMethod(req, res, 'POST')) return;

  const body = await parseBody(req);
  const nationalId = safeTrim(body?.nationalId);
  const birthYear = safeTrim(body?.birthYear);
  const guardianPhone = safeTrim(body?.guardianPhone);

  if (!nationalId || !birthYear || !guardianPhone) {
    sendJson(res, 400, { ok: false, error: 'missing_reset_fields' });
    return;
  }

  const reset = await requestPasswordReset({ nationalId, birthYear, guardianPhone });
  if (!reset) {
    sendJson(res, 404, { ok: false, error: 'reset_target_not_found' });
    return;
  }

  sendJson(res, 200, {
    ok: true,
    credentialStatus: reset.credentialStatus,
    username: reset.username,
    password: reset.password,
    smsStatus: reset.smsStatus,
  });
}
