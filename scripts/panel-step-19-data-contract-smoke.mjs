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

function makeCheck(id, status, detail, evidence = {}) {
  return { id, status, detail, evidence };
}

function collectMarkers(source, markers) {
  return markers.filter((marker) => source.includes(marker));
}

async function httpRequest({ method = 'GET', url, headers = {}, body, timeoutMs = 20000 }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method,
      headers: {
        accept: 'application/json, text/plain;q=0.9, text/html;q=0.8, */*;q=0.7',
        ...headers,
      },
      body,
      signal: controller.signal,
    });
    const text = await response.text();
    return {
      status: response.status,
      text,
    };
  } finally {
    clearTimeout(timer);
  }
}

function renderMarkdown(report) {
  const lines = [];
  lines.push('# Panel Step-19 Data Contract Smoke');
  lines.push('');
  lines.push(`- Timestamp: ${report.timestamp}`);
  lines.push(`- overall_ready_for_step_19: **${report.overall_ready_for_step_19}**`);
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
    panelApiBase: normalizeBase(process.env.PANEL_API_BASE_URL, 'https://panel-api.teachera.com.tr'),
  };

  const checks = [];

  const frontendCandidates = await fs.readFile(path.join(rootDir, 'apps/www/src/app/components/panel/CandidateOperationsPanel.tsx'), 'utf8');
  const backendCandidatesIndex = await fs.readFile(path.join(rootDir, 'apps/panel-api/api/panel/candidates/index.js'), 'utf8');
  const backendCandidatesActions = await fs.readFile(path.join(rootDir, 'apps/panel-api/api/panel/candidates/actions.js'), 'utf8');
  const backendCandidatesExport = await fs.readFile(path.join(rootDir, 'apps/panel-api/api/panel/candidates/export.js'), 'utf8');

  const sharedFilterMarkers = [
    'school_query',
    'credentials_sms_status',
    'login_status',
    'exam_status',
    'result_viewed_status',
    'wa_result_status',
  ];

  const frontendFiltersFound = collectMarkers(frontendCandidates, sharedFilterMarkers);
  checks.push(
    makeCheck(
      'contract_frontend_filter_payload_markers',
      frontendFiltersFound.length === sharedFilterMarkers.length ? 'PASS' : 'FAIL',
      `Found ${frontendFiltersFound.length}/${sharedFilterMarkers.length} frontend filter payload marker(s).`,
      { expected: sharedFilterMarkers, found: frontendFiltersFound },
    ),
  );

  const backendIndexFiltersFound = collectMarkers(backendCandidatesIndex, sharedFilterMarkers);
  checks.push(
    makeCheck(
      'contract_backend_index_filter_markers',
      backendIndexFiltersFound.length === sharedFilterMarkers.length ? 'PASS' : 'FAIL',
      `Found ${backendIndexFiltersFound.length}/${sharedFilterMarkers.length} backend index filter marker(s).`,
      { expected: sharedFilterMarkers, found: backendIndexFiltersFound },
    ),
  );

  const backendExportFiltersFound = collectMarkers(backendCandidatesExport, sharedFilterMarkers);
  checks.push(
    makeCheck(
      'contract_backend_export_filter_markers',
      backendExportFiltersFound.length === sharedFilterMarkers.length ? 'PASS' : 'FAIL',
      `Found ${backendExportFiltersFound.length}/${sharedFilterMarkers.length} backend export filter marker(s).`,
      { expected: sharedFilterMarkers, found: backendExportFiltersFound },
    ),
  );

  const actionMarkers = ['sms_retry', 'wa_send', 'add_note'];
  const frontendActionsFound = collectMarkers(frontendCandidates, actionMarkers);
  checks.push(
    makeCheck(
      'contract_frontend_action_markers',
      frontendActionsFound.length === actionMarkers.length ? 'PASS' : 'FAIL',
      `Found ${frontendActionsFound.length}/${actionMarkers.length} frontend action marker(s).`,
      { expected: actionMarkers, found: frontendActionsFound },
    ),
  );

  const backendActionsFound = collectMarkers(backendCandidatesActions, actionMarkers);
  checks.push(
    makeCheck(
      'contract_backend_action_markers',
      backendActionsFound.length === actionMarkers.length ? 'PASS' : 'FAIL',
      `Found ${backendActionsFound.length}/${actionMarkers.length} backend action marker(s).`,
      { expected: actionMarkers, found: backendActionsFound },
    ),
  );

  const requiredGridFields = [
    'candidate_id',
    'application_no',
    'student_full_name',
    'grade',
    'school_name',
    'application_status',
    'credentials_sms_status',
    'first_login_at',
    'exam_status',
    'exam_started_at',
    'exam_submitted_at',
    'result_status',
    'result_viewed_at',
    'wa_result_status',
    'last_error_code',
    'operator_note',
    'updated_at',
  ];

  const frontendGridFieldsFound = collectMarkers(frontendCandidates, requiredGridFields);
  checks.push(
    makeCheck(
      'contract_frontend_grid_field_markers',
      frontendGridFieldsFound.length === requiredGridFields.length ? 'PASS' : 'FAIL',
      `Found ${frontendGridFieldsFound.length}/${requiredGridFields.length} frontend grid field marker(s).`,
      { expected: requiredGridFields, found: frontendGridFieldsFound },
    ),
  );

  const backendIndexFieldsFound = collectMarkers(backendCandidatesIndex, requiredGridFields);
  checks.push(
    makeCheck(
      'contract_backend_index_field_markers',
      backendIndexFieldsFound.length === requiredGridFields.length ? 'PASS' : 'FAIL',
      `Found ${backendIndexFieldsFound.length}/${requiredGridFields.length} backend index field marker(s).`,
      { expected: requiredGridFields, found: backendIndexFieldsFound },
    ),
  );

  const backendExportFieldsFound = collectMarkers(backendCandidatesExport, requiredGridFields);
  checks.push(
    makeCheck(
      'contract_backend_export_field_markers',
      backendExportFieldsFound.length === requiredGridFields.length ? 'PASS' : 'FAIL',
      `Found ${backendExportFieldsFound.length}/${requiredGridFields.length} backend export field marker(s).`,
      { expected: requiredGridFields, found: backendExportFieldsFound },
    ),
  );

  const unauthChecks = [
    ['GET', '/api/panel/candidates'],
    ['GET', '/api/panel/candidates/export?format=csv'],
    ['POST', '/api/panel/candidates/actions'],
  ];
  for (const [method, endpoint] of unauthChecks) {
    const response = await httpRequest({
      method,
      url: `${cfg.panelApiBase}${endpoint}`,
      headers: method === 'POST' ? { 'content-type': 'application/json' } : {},
      body: method === 'POST' ? JSON.stringify({ action: 'sms_retry', candidate_ids: ['00000000-0000-0000-0000-000000000000'] }) : undefined,
    });
    checks.push(
      makeCheck(
        `unauth_${method}_${endpoint}`,
        response.status === 401 ? 'PASS' : 'FAIL',
        `HTTP ${response.status}`,
        { url: `${cfg.panelApiBase}${endpoint}`, method, status: response.status, expected: [401] },
      ),
    );
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
    mode: { http: true, static: true },
    totals,
    overall_ready_for_step_19: totals.fail === 0,
    checks,
  };

  await fs.mkdir(guidelinesDir, { recursive: true });
  const outJson = path.join(guidelinesDir, 'panel-step-19-data-contract-smoke-latest.json');
  const outMd = path.join(guidelinesDir, 'panel-step-19-data-contract-smoke-latest.md');
  await fs.writeFile(outJson, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await fs.writeFile(outMd, renderMarkdown(report), 'utf8');

  console.log(JSON.stringify(report, null, 2));
  if (!report.overall_ready_for_step_19) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error('[panel-step-19-data-contract-smoke] failed:', error?.message || error);
  process.exitCode = 1;
});
