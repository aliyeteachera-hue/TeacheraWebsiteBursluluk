import { applyCors, requireAdmin, requireMethod, sendJson } from '../../_lib/http.js';
import { listUnviewedResults } from '../../_lib/panelData.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return;
  if (!requireAdmin(req, res)) return;
  if (!requireMethod(req, res, 'GET')) return;

  try {
    const payload = await listUnviewedResults(req.query || {});
    sendJson(res, 200, { ok: true, ...payload });
  } catch {
    sendJson(res, 500, { ok: false, error: 'panel_unviewed_results_failed' });
  }
}
