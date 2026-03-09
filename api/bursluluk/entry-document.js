import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { applyCors, sendJson, safeTrim } from '../_lib/http.js';
import { getApplicationConfirmation } from '../_lib/burslulukStore.js';

function toAscii(value) {
  return safeTrim(value)
    .replace(/İ/g, 'I')
    .replace(/I/g, 'I')
    .replace(/ı/g, 'i')
    .replace(/Ş/g, 'S')
    .replace(/ş/g, 's')
    .replace(/Ğ/g, 'G')
    .replace(/ğ/g, 'g')
    .replace(/Ü/g, 'U')
    .replace(/ü/g, 'u')
    .replace(/Ö/g, 'O')
    .replace(/ö/g, 'o')
    .replace(/Ç/g, 'C')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const PYTHON_RENDERER = fileURLToPath(new URL('../../scripts/render_bursluluk_entry_pdf.py', import.meta.url));

function buildLegacyPdfBuffer(application) {
  const text = [
    'Teachera Dil Okulu',
    'Online Bursluluk Sinavi Giris Belgesi',
    `Basvuru Kodu: ${safeTrim(application.applicationCode) || '-'}`,
    `Ogrenci: ${safeTrim(application.studentFullName) || '-'}`,
    `Okul: ${safeTrim(application.schoolName) || '-'}`,
    `Oturum: ${safeTrim(application.sessionLabel) || '-'}`,
    `Kullanici Adi: ${safeTrim(application.username) || '-'}`,
    `Sifre: ${safeTrim(application.password) || 'SMS ile iletildi'}`,
  ]
    .map((line, index) => `BT /F1 12 Tf 1 0 0 1 56 ${790 - index * 24} Tm (${toAscii(line).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) Tj ET`)
    .join('\n');
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj',
    `4 0 obj\n<< /Length ${Buffer.byteLength(text, 'utf8')} >>\nstream\n${text}\nendstream\nendobj`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${object}\n`;
  }
  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

function buildPdfBuffer(application) {
  const python = spawnSync('python3', [PYTHON_RENDERER], {
    input: Buffer.from(JSON.stringify(application), 'utf8'),
    maxBuffer: 10 * 1024 * 1024,
  });

  if (python.status === 0 && python.stdout?.length) {
    return python.stdout;
  }

  return buildLegacyPdfBuffer(application);
}

export default async function handler(req, res) {
  if (!applyCors(req, res)) return;

  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    return;
  }

  const code = safeTrim(req.query?.code);
  if (!code) {
    sendJson(res, 400, { ok: false, error: 'missing_code' });
    return;
  }

  const application = await getApplicationConfirmation(code);
  if (!application) {
    sendJson(res, 404, { ok: false, error: 'application_not_found' });
    return;
  }

  const fileName = `teachera-bursluluk-giris-belgesi-${toAscii(application.applicationCode || 'belge')}.pdf`;
  const pdf = buildPdfBuffer(application);

  res.status(200);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Length', String(pdf.byteLength));
  res.end(pdf);
}
