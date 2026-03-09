import { applyCors, parseBody, requireAdmin, sendJson, safeTrim } from '../_lib/http.js';
import { getPanelSettings, resolveAdminRole, updatePanelSettings } from '../_lib/panelData.js';

function statusFromError(error) {
  const code = safeTrim(error?.message);
  if (code.startsWith('missing_') || code === 'unsupported_action') return 400;
  if (code === 'forbidden_role') return 403;
  return 500;
}

export default async function handler(req, res) {
  if (!applyCors(req, res)) return;
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    try {
      const payload = await getPanelSettings({ role: resolveAdminRole(req) });
      sendJson(res, 200, { ok: true, ...payload });
    } catch {
      sendJson(res, 500, { ok: false, error: 'panel_settings_failed' });
    }
    return;
  }

  if (req.method === 'PUT') {
    const body = await parseBody(req);
    if (!body || typeof body !== 'object') {
      sendJson(res, 400, { ok: false, error: 'invalid_json' });
      return;
    }

    try {
      const payload = await updatePanelSettings({
        role: resolveAdminRole(req),
        payload: body,
      });
      sendJson(res, 200, { ok: true, ...payload });
    } catch (error) {
      sendJson(res, statusFromError(error), { ok: false, error: safeTrim(error?.message) || 'panel_settings_update_failed' });
    }
    return;
  }

  sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
}
