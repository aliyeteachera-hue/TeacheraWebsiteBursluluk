// AUTO-GENERATED FROM apps/*/api (legacy root runtime mirror). DO NOT EDIT DIRECTLY.
import { requireRole } from '../../_lib/auth.js';
import { appendAuditLog, buildPanelActor, readRequestContext } from '../../_lib/auditLog.js';
import { ROLES } from '../../_lib/constants.js';
import { query, withTransaction } from '../../_lib/db.js';
import { HttpError } from '../../_lib/errors.js';
import { handleRequest, methodGuard, ok, parseBody, safeTrim } from '../../_lib/http.js';

function normalizeSettingsInput(body) {
  if (Array.isArray(body.items)) {
    return body.items
      .map((item) => ({
        key: safeTrim(item?.key).slice(0, 120),
        value: item?.value ?? null,
      }))
      .filter((item) => item.key && item.value !== null);
  }

  const key = safeTrim(body.key).slice(0, 120);
  if (!key) return [];
  if (!Object.prototype.hasOwnProperty.call(body, 'value')) return [];
  return [{ key, value: body.value }];
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    const ctx = readRequestContext(req);
    if (req.method === 'GET') {
      const identity = await requireRole(req, [ROLES.SUPER_ADMIN, ROLES.OPERATIONS, ROLES.READ_ONLY]);
      const keysRaw = safeTrim(req.query?.keys);
      const keys = keysRaw
        ? keysRaw
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 100)
        : [];

      const result = keys.length > 0
        ? await query(
            `
              SELECT key, value, updated_by, updated_at
              FROM app_settings
              WHERE key = ANY($1::text[])
              ORDER BY key
            `,
            [keys],
          )
        : await query(
            `
              SELECT key, value, updated_by, updated_at
              FROM app_settings
              ORDER BY key
            `,
          );

      ok(res, {
        items: result.rows,
      });

      await appendAuditLog({
        ...buildPanelActor(identity),
        action: 'PANEL_SETTINGS_READ',
        targetType: 'APP_SETTINGS',
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
        metadata: {
          keyCount: keys.length,
          keys,
          returned: result.rows.length,
        },
      });
      return;
    }

    if (req.method !== 'PUT') {
      methodGuard(req, ['GET', 'PUT']);
      return;
    }

    const identity = await requireRole(req, [ROLES.SUPER_ADMIN]);
    const body = await parseBody(req);
    if (!body || typeof body !== 'object') {
      throw new HttpError(400, 'Request body must be valid JSON.', 'invalid_json');
    }

    const items = normalizeSettingsInput(body);
    if (items.length === 0) {
      throw new HttpError(400, 'At least one valid key/value pair is required.', 'invalid_settings_payload');
    }

    await withTransaction(async (client) => {
      for (const item of items) {
        await client.query(
          `
            INSERT INTO app_settings (key, value, updated_by, updated_at)
            VALUES ($1, $2::jsonb, $3, NOW())
            ON CONFLICT (key)
            DO UPDATE
            SET
              value = EXCLUDED.value,
              updated_by = EXCLUDED.updated_by,
              updated_at = NOW()
          `,
          [item.key, JSON.stringify(item.value), identity.keyId || 'super_admin'],
        );
      }
    });

    ok(res, {
      updated: items.length,
      keys: items.map((item) => item.key),
    });

    await appendAuditLog({
      ...buildPanelActor(identity),
      action: 'PANEL_SETTINGS_UPDATE',
      targetType: 'APP_SETTINGS',
      targetId: String(items.length),
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      metadata: {
        keys: items.map((item) => item.key),
      },
    });
  });
}
