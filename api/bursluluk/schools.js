import { applyCors, requireMethod, sendJson, safeTrim } from '../_lib/http.js';
import { searchSchools } from '../_lib/burslulukStore.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return;
  if (!requireMethod(req, res, 'GET')) return;

  const q = safeTrim(req.query?.q || '');
  const items = await searchSchools(q);
  sendJson(res, 200, { ok: true, items });
}
