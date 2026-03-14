#!/usr/bin/env node

function safeTrim(value) {
  return String(value ?? '').trim();
}

function parseArg(name, fallback = '') {
  const prefix = `${name}=`;
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith(prefix)) {
      return safeTrim(arg.slice(prefix.length));
    }
  }
  return fallback;
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'manual',
      headers: {
        Accept: 'application/json,text/plain,*/*',
      },
    });

    const body = await response.text();
    return {
      ok: true,
      status: response.status,
      body: safeTrim(body),
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      error: error instanceof Error ? error.message : String(error),
      body: '',
    };
  } finally {
    clearTimeout(timer);
  }
}

function pushCheck(checks, id, ok, detail, evidence = {}) {
  checks.push({
    id,
    status: ok ? 'PASS' : 'FAIL',
    detail,
    evidence,
  });
}

function expectStatus(status, expected) {
  return expected.includes(status);
}

async function main() {
  const timeoutMs = Number.parseInt(parseArg('--timeout-ms', '7000'), 10) || 7000;

  const base = {
    www: safeTrim(process.env.WWW_BASE_URL || 'https://teachera.com.tr'),
    exam: safeTrim(process.env.EXAM_API_BASE_URL || 'https://exam-api.teachera.com.tr'),
    panel: safeTrim(process.env.PANEL_API_BASE_URL || 'https://panel-api.teachera.com.tr'),
    ops: safeTrim(process.env.OPS_API_BASE_URL || 'https://ops-api.teachera.com.tr'),
  };

  const targets = [
    {
      id: 'www_root',
      url: `${base.www}/`,
      expected: [200],
    },
    {
      id: 'exam_health',
      url: `${base.exam}/api/health`,
      expected: [200],
    },
    {
      id: 'panel_auth_me_unauth',
      url: `${base.panel}/api/panel/auth/me`,
      expected: [401, 403],
    },
    {
      id: 'ops_health',
      url: `${base.ops}/api/health`,
      expected: [200],
    },
    {
      id: 'ops_worker_unauth',
      url: `${base.ops}/api/notifications/worker`,
      expected: [401, 403],
    },
  ];

  const checks = [];
  for (const target of targets) {
    const result = await fetchWithTimeout(target.url, timeoutMs);
    if (!result.ok) {
      pushCheck(checks, target.id, false, `Request failed: ${result.error}`, {
        url: target.url,
      });
      continue;
    }

    pushCheck(
      checks,
      target.id,
      expectStatus(result.status, target.expected),
      `HTTP ${result.status} (expected ${target.expected.join('|')})`,
      {
        url: target.url,
        status: result.status,
        expected: target.expected,
        body_preview: result.body.slice(0, 220),
      },
    );
  }

  const totals = {
    pass: checks.filter((item) => item.status === 'PASS').length,
    fail: checks.filter((item) => item.status === 'FAIL').length,
  };

  const payload = {
    timestamp: new Date().toISOString(),
    mode: 'prod-smoke',
    bases: base,
    totals,
    overall_ok: totals.fail === 0,
    checks,
  };

  console.log(JSON.stringify(payload, null, 2));
  if (!payload.overall_ok) {
    process.exitCode = 1;
  }
}

main();
