import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function safeTrim(value) {
  return String(value ?? '').trim();
}

function normalizeBase(value, fallback) {
  const raw = safeTrim(value || fallback);
  if (!raw) throw new Error('missing_base_url');
  return raw.replace(/\/+$/, '');
}

function nowIso() {
  return new Date().toISOString();
}

function toJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function makeCheck(id, status, detail, evidence = {}) {
  return { id, status, detail, evidence };
}

async function httpRequest({ method = 'GET', url, headers = {}, timeoutMs = 20000 }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method,
      headers: {
        accept: 'application/json, text/plain;q=0.9, text/html;q=0.8, */*;q=0.7',
        ...headers,
      },
      signal: controller.signal,
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      text,
      json: toJson(text),
      headers: response.headers,
    };
  } finally {
    clearTimeout(timer);
  }
}

function renderMarkdown(report) {
  const lines = [];
  lines.push('# Panel Step-14 Closeout Smoke');
  lines.push('');
  lines.push(`- Timestamp: ${report.timestamp}`);
  lines.push(`- overall_ready_for_step_14: **${report.overall_ready_for_step_14}**`);
  lines.push(`- pass: ${report.totals.pass}, fail: ${report.totals.fail}, warn: ${report.totals.warn}, skip: ${report.totals.skip}`);
  lines.push('');
  lines.push('## Checks');
  lines.push('');
  lines.push('| id | status | detail |');
  lines.push('| --- | --- | --- |');
  for (const check of report.checks) {
    lines.push(`| ${check.id} | ${check.status} | ${String(check.detail || '').replace(/\|/g, '\\|')} |`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function run() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const guidelinesDir = path.join(rootDir, 'guidelines');

  const cfg = {
    wwwBase: normalizeBase(process.env.WWW_BASE_URL, 'https://teachera.com.tr'),
    panelApiBase: normalizeBase(process.env.PANEL_API_BASE_URL, 'https://panel-api.teachera.com.tr'),
  };

  const checks = [];

  const publicRoutes = ['/panel/login', '/panel/dashboard', '/panel/audit'];
  for (const routePath of publicRoutes) {
    const response = await httpRequest({
      method: 'GET',
      url: `${cfg.wwwBase}${routePath}`,
    });
    checks.push(
      makeCheck(
        `public_route_${routePath}`,
        response.status === 200 ? 'PASS' : 'FAIL',
        `HTTP ${response.status}`,
        { url: `${cfg.wwwBase}${routePath}`, status: response.status, expected: [200] },
      ),
    );
  }

  const unauthEndpoints = [
    '/api/panel/auth/me',
    '/api/panel/dashboard',
    '/api/panel/candidates',
    '/api/panel/notifications',
    '/api/panel/dlq',
    '/api/panel/unviewed-results',
    '/api/panel/settings',
    '/api/panel/audit',
    '/api/panel/audit/export?format=csv',
  ];

  for (const endpoint of unauthEndpoints) {
    const response = await httpRequest({
      method: 'GET',
      url: `${cfg.panelApiBase}${endpoint}`,
    });
    checks.push(
      makeCheck(
        `unauth_${endpoint}`,
        response.status === 401 ? 'PASS' : 'FAIL',
        `HTTP ${response.status}`,
        { url: `${cfg.panelApiBase}${endpoint}`, status: response.status, expected: [401] },
      ),
    );
  }

  const loginHtml = await httpRequest({
    method: 'GET',
    url: `${cfg.wwwBase}/panel/login`,
  });
  const indexMatch = /\/assets\/index-[^"']+\.js/.exec(loginHtml.text);
  const indexPath = indexMatch?.[0] || '';
  if (!indexPath) {
    checks.push(makeCheck('bundle_index_path', 'FAIL', 'Index bundle path not found on /panel/login page.'));
  } else {
    checks.push(makeCheck('bundle_index_path', 'PASS', `Found ${indexPath}`));
    const indexBundle = await httpRequest({
      method: 'GET',
      url: `${cfg.wwwBase}${indexPath}`,
    });
    const dashboardChunkMatch = /assets\/PanelDashboardPage-[^"']+\.js/.exec(indexBundle.text);
    const dashboardChunkPath = dashboardChunkMatch?.[0] || '';
    if (!dashboardChunkPath) {
      checks.push(makeCheck('bundle_dashboard_chunk', 'FAIL', 'PanelDashboardPage chunk not found from index bundle.'));
    } else {
      checks.push(makeCheck('bundle_dashboard_chunk', 'PASS', `Found ${dashboardChunkPath}`));
      const dashboardChunk = await httpRequest({
        method: 'GET',
        url: `${cfg.wwwBase}/${dashboardChunkPath}`,
      });
      const dashboardSource = dashboardChunk.text;

      const markers = [
        ['marker_audit_view', 'Audit & Uyum'],
        ['marker_audit_route', '/panel/audit'],
        ['marker_audit_api', '/api/panel/audit'],
        ['marker_audit_export_api', 'audit/export'],
        ['marker_csv_export_button', 'CSV Export'],
        ['marker_xls_export_button', 'XLS Export'],
        ['marker_read_only_lock', 'READ_ONLY modu'],
      ];

      for (const [id, marker] of markers) {
        checks.push(
          makeCheck(
            id,
            dashboardSource.includes(marker) ? 'PASS' : 'FAIL',
            dashboardSource.includes(marker) ? `Marker found: ${marker}` : `Marker missing: ${marker}`,
          ),
        );
      }
    }
  }

  const totals = checks.reduce(
    (acc, item) => {
      const key = item.status.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(acc, key)) acc[key] += 1;
      return acc;
    },
    { pass: 0, fail: 0, warn: 0, skip: 0 },
  );

  const report = {
    timestamp: nowIso(),
    mode: { http: true },
    totals,
    overall_ready_for_step_14: totals.fail === 0,
    checks,
  };

  await fs.mkdir(guidelinesDir, { recursive: true });
  const outJson = path.join(guidelinesDir, 'panel-step-14-closeout-smoke-latest.json');
  const outMd = path.join(guidelinesDir, 'panel-step-14-closeout-smoke-latest.md');
  await fs.writeFile(outJson, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await fs.writeFile(outMd, renderMarkdown(report), 'utf8');

  console.log(JSON.stringify(report, null, 2));
  if (!report.overall_ready_for_step_14) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error('[panel-step-14-closeout-smoke] failed:', error?.message || error);
  process.exitCode = 1;
});
