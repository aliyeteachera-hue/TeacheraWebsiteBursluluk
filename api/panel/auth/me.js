import { getPanelIdentity } from '../../_lib/auth.js';
import { HttpError } from '../../_lib/errors.js';
import { handleRequest, methodGuard, ok } from '../../_lib/http.js';

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    methodGuard(req, ['GET']);

    const identity = await getPanelIdentity(req);
    if (!identity.authenticated) {
      throw new HttpError(401, 'Panel authentication is required.', 'panel_unauthorized');
    }

    if (!identity.mfaVerified) {
      throw new HttpError(403, 'MFA verification is required.', 'panel_mfa_required');
    }

    ok(res, {
      identity: {
        user_id: identity.userId,
        email: identity.email,
        full_name: identity.fullName,
        role: identity.role,
        mfa_verified: identity.mfaVerified,
        session_id: identity.sessionId,
      },
    });
  });
}
