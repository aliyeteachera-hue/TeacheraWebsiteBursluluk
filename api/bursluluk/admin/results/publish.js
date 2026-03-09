import { applyCors, parseBody, requireAdmin, requireMethod, sendJson } from '../../../_lib/http.js';
import { publishResults } from '../../../_lib/burslulukStore.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return;
  if (!requireAdmin(req, res)) return;
  if (!requireMethod(req, res, 'POST')) return;

  const body = await parseBody(req);
  const payload = await publishResults({ releaseAt: body?.releaseAt });
  sendJson(res, 200, { ok: true, ...payload });
}
