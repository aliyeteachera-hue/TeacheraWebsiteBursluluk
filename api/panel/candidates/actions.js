import { applyCors, parseBody, requireAdmin, requireMethod, sendJson, safeTrim } from '../../_lib/http.js';
import { applyCandidatesAction, resolveAdminRole } from '../../_lib/panelData.js';

function statusFromError(error) {
  const code = safeTrim(error?.message);
  if (code.startsWith('missing_') || code === 'unsupported_action') return 400;
  if (code === 'forbidden_read_only') return 403;
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
    const payload = await applyCandidatesAction({
      action: body.action,
      candidateIds: body.candidate_ids || body.candidateIds,
      note: body.note,
      role: resolveAdminRole(req),
    });

    sendJson(res, 200, { ok: true, ...payload });
  } catch (error) {
    sendJson(res, statusFromError(error), { ok: false, error: safeTrim(error?.message) || 'panel_candidates_action_failed' });
  }
}
