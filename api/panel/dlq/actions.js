import { applyCors, parseBody, requireAdmin, requireMethod, sendJson, safeTrim } from '../../_lib/http.js';
import { applyDlqAction, resolveAdminRole } from '../../_lib/panelData.js';

function statusFromError(error) {
  const code = safeTrim(error?.message);
  if (code.startsWith('missing_') || code === 'unsupported_action') return 400;
  if (code === 'forbidden_read_only' || code === 'forbidden_role') return 403;
  return 500;
}

export default async function handler(req, res) {
  if (!applyCors(req, res)) return;
  if (!requireAdmin(req, res)) return;
  if (!requireMethod(req, res, 'POST')) return;

  const body = await parseBody(req);
  if (!body || typeof body !== 'object') {
    sendJson(res, 400, { ok: false, error: 'invalid_json' });
    return;
  }

  try {
    const payload = await applyDlqAction({
      action: body.action,
      jobIds: body.job_ids || body.jobIds,
      role: resolveAdminRole(req),
      rootCauseNote: body.root_cause_note || body.rootCauseNote,
      assignedTo: body.assigned_to || body.assignedTo,
    });

    sendJson(res, 200, { ok: true, ...payload });
  } catch (error) {
    sendJson(res, statusFromError(error), { ok: false, error: safeTrim(error?.message) || 'panel_dlq_action_failed' });
  }
}
