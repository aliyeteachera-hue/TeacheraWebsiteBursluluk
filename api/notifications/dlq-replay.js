// AUTO-GENERATED FROM apps/*/api (legacy root runtime mirror). DO NOT EDIT DIRECTLY.
import { withTransaction } from '../_lib/db.js';
import { HttpError } from '../_lib/errors.js';
import { handleRequest, methodGuard, ok, parseBody, safeTrim } from '../_lib/http.js';

function extractBearer(req) {
  const header = safeTrim(req.headers?.authorization);
  if (!header || !header.toLowerCase().startsWith('bearer ')) return '';
  return header.slice(7).trim();
}

function assertReplaySecret(req) {
  const expected = safeTrim(process.env.NOTIFICATION_WORKER_SECRET || process.env.CRON_SECRET);
  if (!expected) return;
  const provided = safeTrim(req.headers?.['x-worker-secret'] || req.query?.worker_secret || extractBearer(req));
  if (!provided || provided !== expected) {
    throw new HttpError(401, 'Replay secret is invalid.', 'invalid_replay_secret');
  }
}

function readBoundedInt(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function normalizeChannel(value) {
  const channel = safeTrim(value).toUpperCase();
  if (!channel) return null;
  if (channel !== 'SMS' && channel !== 'WHATSAPP') {
    throw new HttpError(400, 'Invalid channel filter.', 'invalid_channel');
  }
  return channel;
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    methodGuard(req, ['POST', 'GET']);
    assertReplaySecret(req);

    const body = req.method === 'GET' ? null : await parseBody(req);
    const limit = readBoundedInt(body?.limit ?? req.query?.limit ?? 100, 100, 1, 500);
    const campaignCode = safeTrim(body?.campaign_code ?? body?.campaignCode ?? req.query?.campaign_code ?? '');
    const channel = normalizeChannel(body?.channel ?? req.query?.channel);

    const result = await withTransaction(async (client) => {
      const params = [limit];
      const whereClauses = [
        "dj.status IN ('OPEN', 'REQUEUED')",
        "nj.status = 'DLQ'",
      ];

      if (campaignCode) {
        params.push(campaignCode);
        whereClauses.push(`dj.campaign_code = $${params.length}`);
      }
      if (channel) {
        params.push(channel);
        whereClauses.push(`dj.channel = $${params.length}::notification_channel`);
      }

      const picked = await client.query(
        `
          SELECT
            dj.id AS dlq_id,
            dj.source_job_id AS job_id
          FROM dlq_jobs dj
          JOIN notification_jobs nj ON nj.id = dj.source_job_id
          WHERE ${whereClauses.join(' AND ')}
          ORDER BY dj.created_at ASC
          LIMIT $1
          FOR UPDATE OF dj SKIP LOCKED
        `,
        params,
      );

      if (picked.rowCount === 0) {
        return {
          replayed: 0,
          replayed_job_ids: [],
        };
      }

      const jobIds = picked.rows.map((row) => row.job_id).filter(Boolean);
      const dlqIds = picked.rows.map((row) => row.dlq_id).filter(Boolean);

      const requeued = await client.query(
        `
          UPDATE notification_jobs
          SET
            status = 'QUEUED',
            next_retry_at = NOW(),
            updated_at = NOW()
          WHERE id = ANY($1::uuid[])
          RETURNING id
        `,
        [jobIds],
      );

      await client.query(
        `
          UPDATE dlq_jobs
          SET
            status = 'REQUEUED',
            updated_at = NOW()
          WHERE id = ANY($1::uuid[])
        `,
        [dlqIds],
      );

      await client.query(
        `
          INSERT INTO notification_events (
            id,
            job_id,
            event_type,
            payload
          )
          SELECT
            gen_random_uuid(),
            requeued.id,
            'REQUEUED',
            $2::jsonb
          FROM unnest($1::uuid[]) AS requeued(id)
        `,
        [
          requeued.rows.map((row) => row.id),
          JSON.stringify({
            source: 'dlq_replay',
          }),
        ],
      );

      return {
        replayed: requeued.rowCount,
        replayed_job_ids: requeued.rows.map((row) => row.id),
      };
    });

    ok(res, {
      limit,
      campaign_code: campaignCode || null,
      channel,
      ...result,
    });
  });
}
