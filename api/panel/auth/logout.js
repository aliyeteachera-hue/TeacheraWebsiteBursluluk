import { getPanelIdentity } from '../../_lib/auth.js';
import { appendAuditLog, buildPanelActor, readRequestContext } from '../../_lib/auditLog.js';
import { query } from '../../_lib/db.js';
import { handleRequest, methodGuard, ok } from '../../_lib/http.js';
import {
  buildClearPanelSessionCookie,
  extractPanelSessionToken,
  hashPanelSessionToken,
  verifyPanelSessionToken,
} from '../../_lib/panelSession.js';

async function revokeSessionFromToken(token) {
  try {
    const claims = verifyPanelSessionToken(token);
    await query(
      `
        UPDATE admin_sessions
        SET revoked_at = NOW(), updated_at = NOW()
        WHERE id = $1::uuid
          AND admin_user_id = $2::uuid
          AND token_hash = $3
          AND revoked_at IS NULL
      `,
      [claims.sessionId, claims.userId, hashPanelSessionToken(token)],
    );
  } catch {
    // Token can be expired/invalid; cookie will still be cleared.
  }
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    methodGuard(req, ['POST']);
    const ctx = readRequestContext(req);
    const identity = await getPanelIdentity(req);

    const token = extractPanelSessionToken(req);
    if (token) {
      await revokeSessionFromToken(token);
    }

    res.setHeader('Set-Cookie', buildClearPanelSessionCookie(req));
    ok(res, {
      logged_out: true,
    });

    try {
      await appendAuditLog({
        ...(identity.authenticated
          ? buildPanelActor(identity)
          : { actorType: 'PANEL_USER', actorId: 'anonymous' }),
        action: 'PANEL_LOGOUT',
        targetType: 'ADMIN_SESSION',
        targetId: identity.sessionId || null,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });
    } catch (auditError) {
      console.error('[panel_logout_audit_error]', auditError);
    }
  });
}
