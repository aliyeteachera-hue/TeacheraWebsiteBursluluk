import { applyCors, requireAdmin, requireMethod, sendJson, sendText, safeTrim } from '../../_lib/http.js';
import { exportApplicationsCsv, listApplications } from '../../_lib/burslulukStore.js';

export default async function handler(req, res) {
  if (!applyCors(req, res)) return;
  if (!requireAdmin(req, res)) return;
  if (!requireMethod(req, res, 'GET')) return;

  const filters = {
    schoolId: safeTrim(req.query?.schoolId),
    resultStatus: safeTrim(req.query?.resultStatus),
    examStatus: safeTrim(req.query?.examStatus),
  };

  if (safeTrim(req.query?.format).toLowerCase() === 'csv') {
    const csv = await exportApplicationsCsv(filters);
    res.setHeader('Content-Disposition', 'attachment; filename="bursluluk-applications.csv"');
    sendText(res, 200, csv);
    return;
  }

  const items = await listApplications(filters);
  sendJson(res, 200, { ok: true, items });
}
