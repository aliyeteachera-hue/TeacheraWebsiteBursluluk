import { createHash } from 'node:crypto';
import { withTransaction } from './db.js';
import { safeTrim } from './http.js';

function toStableObject(value) {
  if (Array.isArray(value)) {
    return value.map((item) => toStableObject(item));
  }
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = toStableObject(value[key]);
        return acc;
      }, {});
  }
  return value;
}

function toStableJson(value) {
  return JSON.stringify(toStableObject(value || {}));
}

function normalizeText(value, maxLength = 512) {
  return safeTrim(value).slice(0, maxLength);
}

function buildEntryHash({
  prevHash,
  actorType,
  actorId,
  actorRole,
  action,
  targetType,
  targetId,
  requestId,
  ipAddress,
  userAgent,
  metadata,
  createdAtIso,
}) {
  const payload = [
    prevHash || '',
    actorType || '',
    actorId || '',
    actorRole || '',
    action || '',
    targetType || '',
    targetId || '',
    requestId || '',
    ipAddress || '',
    userAgent || '',
    createdAtIso || '',
    toStableJson(metadata),
  ].join('\n');
  return createHash('sha256').update(payload).digest('hex');
}

export function readRequestContext(req) {
  const forwardedFor = normalizeText(req?.headers?.['x-forwarded-for'], 200);
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : normalizeText(req?.socket?.remoteAddress, 100);
  const requestId = normalizeText(
    req?.headers?.['x-request-id'] || req?.headers?.['x-vercel-id'] || req?.headers?.['x-correlation-id'],
    200,
  );
  const userAgent = normalizeText(req?.headers?.['user-agent'], 512);

  return {
    ipAddress: ipAddress || null,
    requestId: requestId || null,
    userAgent: userAgent || null,
  };
}

export function buildPanelActor(identity) {
  return {
    actorType: 'PANEL_USER',
    actorId: normalizeText(identity?.userId, 200) || 'unknown',
    actorRole: normalizeText(identity?.role, 80) || null,
  };
}

export async function appendAuditLog({
  actorType,
  actorId,
  actorRole = null,
  action,
  targetType = null,
  targetId = null,
  requestId = null,
  ipAddress = null,
  userAgent = null,
  metadata = {},
}) {
  const normalizedActorType = normalizeText(actorType, 40) || 'SYSTEM';
  const normalizedActorId = normalizeText(actorId, 200) || 'system';
  const normalizedAction = normalizeText(action, 120) || 'UNKNOWN_ACTION';
  const normalizedTargetType = normalizeText(targetType, 120) || null;
  const normalizedTargetId = normalizeText(targetId, 200) || null;
  const normalizedRequestId = normalizeText(requestId, 200) || null;
  const normalizedIp = normalizeText(ipAddress, 100) || null;
  const normalizedUserAgent = normalizeText(userAgent, 512) || null;
  const normalizedRole = normalizeText(actorRole, 80) || null;
  const normalizedMetadata = toStableObject(metadata || {});

  return withTransaction(async (client) => {
    await client.query(
      `
        INSERT INTO audit_log_chain_head (id, last_hash)
        VALUES (1, NULL)
        ON CONFLICT (id) DO NOTHING
      `,
    );

    const headResult = await client.query(
      `
        SELECT last_hash
        FROM audit_log_chain_head
        WHERE id = 1
        FOR UPDATE
      `,
    );

    const prevHash = safeTrim(headResult.rows[0]?.last_hash) || null;
    const createdAtIso = new Date().toISOString();
    const entryHash = buildEntryHash({
      prevHash,
      actorType: normalizedActorType,
      actorId: normalizedActorId,
      actorRole: normalizedRole,
      action: normalizedAction,
      targetType: normalizedTargetType,
      targetId: normalizedTargetId,
      requestId: normalizedRequestId,
      ipAddress: normalizedIp,
      userAgent: normalizedUserAgent,
      metadata: normalizedMetadata,
      createdAtIso,
    });

    const insertResult = await client.query(
      `
        INSERT INTO audit_log_entries (
          actor_type,
          actor_id,
          actor_role,
          action,
          target_type,
          target_id,
          request_id,
          ip_address,
          user_agent,
          metadata,
          prev_hash,
          entry_hash,
          created_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13::timestamptz
        )
        RETURNING id, seq, entry_hash, prev_hash, created_at
      `,
      [
        normalizedActorType,
        normalizedActorId,
        normalizedRole,
        normalizedAction,
        normalizedTargetType,
        normalizedTargetId,
        normalizedRequestId,
        normalizedIp,
        normalizedUserAgent,
        JSON.stringify(normalizedMetadata),
        prevHash,
        entryHash,
        createdAtIso,
      ],
    );

    await client.query(
      `
        UPDATE audit_log_chain_head
        SET last_hash = $1, updated_at = NOW()
        WHERE id = 1
      `,
      [entryHash],
    );

    return insertResult.rows[0];
  });
}
