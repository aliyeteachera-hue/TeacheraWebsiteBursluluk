import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const APPROVAL_PATH = resolve(ROOT, 'guidelines/p0-12-go-live-approval.json');

function trim(value) {
  return String(value ?? '').trim();
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      out[key] = 'true';
      continue;
    }
    out[key] = next;
    i += 1;
  }
  return out;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const approval = readJson(APPROVAL_PATH);
  const approvers = {
    incident_commander: trim(args['incident-commander']),
    ops_lead: trim(args['ops-lead']),
    backend_lead: trim(args['backend-lead']),
    qa_lead: trim(args['qa-lead']),
    comms_owner: trim(args['comms-owner']),
  };

  const required = ['incident_commander', 'ops_lead', 'backend_lead', 'qa_lead'];
  const missing = required.filter((name) => !approvers[name]);
  if (missing.length > 0) {
    console.error(`[p0-12-go-live-approve] missing required approvers: ${missing.join(', ')}`);
    process.exit(1);
  }

  const updated = {
    ...approval,
    version: '2026-03-12',
    approved: true,
    approved_at_utc: new Date().toISOString(),
    change_ticket: trim(args['change-ticket']) || approval.change_ticket || '',
    approvers,
    notes: trim(args.notes) || approval.notes || '',
  };

  writeFileSync(APPROVAL_PATH, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ ok: true, approval_path: APPROVAL_PATH, approval: updated }, null, 2));
}

main();
