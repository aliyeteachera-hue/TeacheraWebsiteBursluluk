import { query } from './db.js';
import { ROLES } from './constants.js';
import { HttpError } from './errors.js';
import { safeTrim } from './http.js';
import {
  extractPanelSessionToken,
  hashPanelSessionToken,
  verifyPanelSessionToken,
} from './panelSession.js';

function hasAllowedRole(role, allowed) {
  if (!role) return false;
  return allowed.includes(role);
}

function isKnownRole(role) {
  return Object.values(ROLES).includes(role);
}

function unauthenticatedIdentity() {
  return {
    authenticated: false,
    role: null,
    roles: [],
    keyId: null,
    userId: null,
    email: null,
    fullName: null,
    sessionId: null,
    mfaVerified: false,
  };
}

async function readActiveSessionFromDb(claims, tokenHash) {
  const result = await query(
    `
      SELECT
        s.id AS session_id,
        s.admin_user_id,
        s.role_code,
        s.expires_at,
        s.revoked_at,
        s.mfa_verified_at,
        u.email,
        u.full_name,
        u.status AS user_status
      FROM admin_sessions s
      JOIN admin_users u ON u.id = s.admin_user_id
      WHERE s.id = $1::uuid
        AND s.admin_user_id = $2::uuid
        AND s.token_hash = $3
        AND EXISTS (
          SELECT 1
          FROM admin_user_roles ur
          JOIN roles r ON r.id = ur.role_id
          WHERE ur.admin_user_id = s.admin_user_id
            AND r.code = s.role_code
        )
      LIMIT 1
    `,
    [claims.sessionId, claims.userId, tokenHash],
  );

  return result.rows[0] || null;
}

function isSessionValid(row, claims) {
  if (!row) return false;
  if (safeTrim(row.user_status).toUpperCase() !== 'ACTIVE') return false;
  if (row.revoked_at) return false;
  if (!row.mfa_verified_at) return false;
  if (!isKnownRole(safeTrim(row.role_code).toUpperCase())) return false;

  const rowRole = safeTrim(row.role_code).toUpperCase();
  if (rowRole !== claims.role) return false;
  if (safeTrim(row.admin_user_id) !== claims.userId) return false;
  if (safeTrim(row.session_id) !== claims.sessionId) return false;

  const expiresAtMs = new Date(row.expires_at).getTime();
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) return false;

  return true;
}

async function touchSession(sessionId) {
  try {
    await query(
      `
        UPDATE admin_sessions
        SET last_seen_at = NOW(), updated_at = NOW()
        WHERE id = $1::uuid
      `,
      [sessionId],
    );
  } catch {
    // Non-blocking touch.
  }
}

export async function getPanelIdentity(req) {
  const token = extractPanelSessionToken(req);
  if (!token) {
    return unauthenticatedIdentity();
  }

  let claims;
  try {
    claims = verifyPanelSessionToken(token);
  } catch {
    return unauthenticatedIdentity();
  }

  if (!claims.userId || !claims.sessionId || !isKnownRole(claims.role) || !claims.mfaVerified) {
    return unauthenticatedIdentity();
  }

  const tokenHash = hashPanelSessionToken(token);
  let row;
  try {
    row = await readActiveSessionFromDb(claims, tokenHash);
  } catch {
    return unauthenticatedIdentity();
  }
  if (!isSessionValid(row, claims)) {
    return unauthenticatedIdentity();
  }

  await touchSession(claims.sessionId);

  return {
    authenticated: true,
    role: claims.role,
    roles: [claims.role],
    keyId: `usr_${claims.userId.slice(0, 8)}`,
    userId: claims.userId,
    email: safeTrim(row.email).toLowerCase(),
    fullName: safeTrim(row.full_name),
    sessionId: claims.sessionId,
    mfaVerified: true,
  };
}

export async function requireRole(req, allowedRoles) {
  const identity = await getPanelIdentity(req);
  if (!identity.authenticated) {
    throw new HttpError(401, 'Panel authentication is required.', 'panel_unauthorized');
  }
  if (!identity.mfaVerified) {
    throw new HttpError(403, 'MFA verification is required.', 'panel_mfa_required');
  }
  if (!hasAllowedRole(identity.role, allowedRoles)) {
    throw new HttpError(403, 'You are not authorized for this action.', 'forbidden');
  }
  return identity;
}
