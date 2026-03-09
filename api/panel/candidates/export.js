import { applyCors, requireAdmin, requireMethod, sendText } from '../../_lib/http.js';
import { exportCandidateOperationsCsv } from '../../_lib/panelData.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return;
  if (!requireAdmin(req, res)) return;
  if (!requireMethod(req, res, 'GET')) return;

  try {
    const csv = await exportCandidateOperationsCsv(req.query || {});
    res.setHeader('Content-Disposition', 'attachment; filename="panel-candidates.csv"');
    sendText(res, 200, csv);
  } catch {
    sendText(res, 500, 'panel_candidates_export_failed');
  }
}
