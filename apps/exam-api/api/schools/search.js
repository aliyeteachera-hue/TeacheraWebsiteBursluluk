import { enforceRateLimit, getRequestIp } from '../_lib/redisRateLimit.js';
import { query } from '../_lib/db.js';
import { handleRequest, methodGuard, ok, safeTrim } from '../_lib/http.js';

const FALLBACK_KONYA_SCHOOLS = [
  'Konya Anadolu Lisesi',
  'Meram Fen Lisesi',
  'Selcuklu Ataturk Ortaokulu',
  'Karatay Imam Hatip Lisesi',
  'Meram Koleji',
  'Konya TED Koleji',
  'Konya Final Okullari',
  'Selcuklu Bilim Sanat Merkezi',
];

function readBoundedLimit(rawValue) {
  const parsed = Number.parseInt(safeTrim(rawValue || ''), 10);
  if (!Number.isFinite(parsed)) return 12;
  return Math.max(1, Math.min(50, parsed));
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    methodGuard(req, ['GET']);

    const requestIp = getRequestIp(req);
    await enforceRateLimit(req, res, {
      scope: 'schools_search_ip',
      identity: requestIp,
      limitEnv: 'RL_SCHOOLS_SEARCH_IP_LIMIT',
      windowSecondsEnv: 'RL_SCHOOLS_SEARCH_IP_WINDOW_SECONDS',
      defaultLimit: 120,
      defaultWindowSeconds: 60,
      requireRedis: true,
      errorCode: 'schools_search_rate_limited',
      errorMessage: 'Too many school search requests. Please retry shortly.',
    });

    const q = safeTrim(req.query?.q || req.query?.query).slice(0, 80);
    const limit = readBoundedLimit(req.query?.limit);
    const likeValue = `%${q.replace(/[%_]/g, '')}%`;

    const { rows } = await query(
      `
        SELECT id, name, district, city
        FROM schools
        WHERE (
          $1::text = ''
          OR name ILIKE $2
          OR COALESCE(district, '') ILIKE $2
          OR COALESCE(city, '') ILIKE $2
        )
        ORDER BY
          CASE
            WHEN $1::text <> '' AND lower(name) = lower($1) THEN 0
            WHEN $1::text <> '' AND lower(name) LIKE lower($1) || '%' THEN 1
            WHEN $1::text <> '' AND lower(name) LIKE '%' || lower($1) || '%' THEN 2
            ELSE 3
          END,
          name ASC
        LIMIT $3
      `,
      [q, likeValue, limit],
    );

    const items = rows.map((row) => ({
      id: row.id,
      name: row.name,
      district: row.district || null,
      city: row.city || null,
      source: 'db',
    }));

    if (items.length > 0) {
      ok(res, {
        query: q,
        items,
      });
      return;
    }

    const fallbackItems = FALLBACK_KONYA_SCHOOLS
      .filter((name) => (q ? name.toLowerCase().includes(q.toLowerCase()) : true))
      .slice(0, limit)
      .map((name) => ({
        id: null,
        name,
        district: null,
        city: 'Konya',
        source: 'fallback',
      }));

    ok(res, {
      query: q,
      items: fallbackItems,
    });
  });
}
