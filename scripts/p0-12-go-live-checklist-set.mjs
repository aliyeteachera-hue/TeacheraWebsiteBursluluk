import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CHECKLIST_PATH = resolve(ROOT, 'guidelines/p0-12-cutover-checklist.json');

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

function main() {
  const args = parseArgs(process.argv.slice(2));
  const gateId = trim(args.gate);
  const status = trim(args.status || 'DONE').toUpperCase();
  const evidenceArg = trim(args.evidence);

  if (!gateId) {
    console.error('[p0-12-go-live-checklist-set] missing --gate');
    process.exit(1);
  }

  if (!['DONE', 'PENDING'].includes(status)) {
    console.error('[p0-12-go-live-checklist-set] --status must be DONE or PENDING');
    process.exit(1);
  }

  const checklist = JSON.parse(readFileSync(CHECKLIST_PATH, 'utf8'));
  const gates = Array.isArray(checklist.gates) ? checklist.gates : [];
  const gate = gates.find((item) => trim(item.id) === gateId);

  if (!gate) {
    console.error(`[p0-12-go-live-checklist-set] gate not found: ${gateId}`);
    process.exit(1);
  }

  gate.status = status;
  if (evidenceArg) {
    const entries = evidenceArg.split(',').map((x) => trim(x)).filter(Boolean);
    gate.evidence = Array.from(new Set([...(gate.evidence || []), ...entries]));
  }

  writeFileSync(CHECKLIST_PATH, `${JSON.stringify(checklist, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ ok: true, gate }, null, 2));
}

main();
