#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const HELP_TEXT = `
Usage:
  node scripts/compare-lighthouse.mjs <before.json> <after.json> [--label <name>]
  pnpm lighthouse:compare -- <before.json> <after.json> [--label <name>]

Examples:
  pnpm lighthouse:compare -- /tmp/teachera-before/lh-mobile.json /tmp/teachera-after/lh-mobile.json --label mobile
  pnpm lighthouse:compare -- /tmp/teachera-before/lh-desktop.json /tmp/teachera-after/lh-desktop.json --label desktop
`.trim();

function parseArgs(argv) {
  const options = {
    label: 'comparison',
    positional: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--') {
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--label') {
      const value = argv[i + 1];
      if (!value || value.startsWith('-')) {
        throw new Error('--label requires a value');
      }
      options.label = value;
      i += 1;
      continue;
    }

    options.positional.push(arg);
  }

  return options;
}

function readJson(filePath) {
  const resolved = path.resolve(filePath);
  const content = fs.readFileSync(resolved, 'utf8');
  return JSON.parse(content);
}

function getAuditValue(report, id) {
  const numericValue = report?.audits?.[id]?.numericValue;
  return typeof numericValue === 'number' ? numericValue : null;
}

function getPerformanceScore(report) {
  const score = report?.categories?.performance?.score;
  if (typeof score !== 'number') return null;
  return score * 100;
}

function getResourceTransferKb(report, resourceType) {
  const items = report?.audits?.['resource-summary']?.details?.items;
  if (!Array.isArray(items)) return null;
  const item = items.find((entry) => entry.resourceType === resourceType);
  if (!item || typeof item.transferSize !== 'number') return null;
  return item.transferSize / 1024;
}

function collectMetrics(report) {
  const inp =
    getAuditValue(report, 'interaction-to-next-paint') ??
    getAuditValue(report, 'experimental-interaction-to-next-paint');

  return {
    score: getPerformanceScore(report),
    lcp: getAuditValue(report, 'largest-contentful-paint'),
    fcp: getAuditValue(report, 'first-contentful-paint'),
    tbt: getAuditValue(report, 'total-blocking-time'),
    inp,
    speedIndex: getAuditValue(report, 'speed-index'),
    jsTransferKb: getResourceTransferKb(report, 'script'),
    totalTransferKb: getResourceTransferKb(report, 'total'),
  };
}

function formatNumber(value, decimals = 1) {
  if (value === null || Number.isNaN(value)) return 'n/a';
  return value.toFixed(decimals);
}

function formatMetric(value, unit) {
  if (value === null || Number.isNaN(value)) return 'n/a';
  if (unit === 'ms') return `${formatNumber(value, 0)} ms`;
  if (unit === 'kb') return `${formatNumber(value, 1)} KB`;
  if (unit === 'score') return `${formatNumber(value, 1)}`;
  return formatNumber(value, 2);
}

function classifyTrend(delta, higherIsBetter, epsilon = 0) {
  if (delta === null) return 'n/a';
  if (Math.abs(delta) <= epsilon) return 'same';
  if (higherIsBetter) return delta > 0 ? 'improved' : 'regressed';
  return delta < 0 ? 'improved' : 'regressed';
}

function formatDelta(delta, unit) {
  if (delta === null || Number.isNaN(delta)) return 'n/a';
  const sign = delta > 0 ? '+' : '';
  if (unit === 'ms') return `${sign}${formatNumber(delta, 0)} ms`;
  if (unit === 'kb') return `${sign}${formatNumber(delta, 1)} KB`;
  if (unit === 'score') return `${sign}${formatNumber(delta, 1)}`;
  return `${sign}${formatNumber(delta, 2)}`;
}

function renderTable(rows) {
  const headers = ['Metric', 'Before', 'After', 'Delta', 'Trend'];
  const allRows = [headers, ...rows];
  const widths = headers.map((_, index) =>
    Math.max(...allRows.map((row) => String(row[index]).length)),
  );

  const formatRow = (row) =>
    row
      .map((cell, index) => String(cell).padEnd(widths[index], ' '))
      .join(' | ');

  const separator = widths.map((width) => '-'.repeat(width)).join('-|-');

  return [formatRow(headers), separator, ...rows.map(formatRow)].join('\n');
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  if (options.positional.length < 2) {
    throw new Error('Missing required files. Expected: <before.json> <after.json>');
  }

  const [beforePath, afterPath] = options.positional;
  const beforeReport = readJson(beforePath);
  const afterReport = readJson(afterPath);
  const before = collectMetrics(beforeReport);
  const after = collectMetrics(afterReport);

  const metricConfigs = [
    { key: 'score', label: 'Performance Score', unit: 'score', higherIsBetter: true, epsilon: 0.05 },
    { key: 'lcp', label: 'LCP', unit: 'ms', higherIsBetter: false, epsilon: 10 },
    { key: 'fcp', label: 'FCP', unit: 'ms', higherIsBetter: false, epsilon: 10 },
    { key: 'tbt', label: 'TBT', unit: 'ms', higherIsBetter: false, epsilon: 5 },
    { key: 'inp', label: 'INP', unit: 'ms', higherIsBetter: false, epsilon: 5 },
    { key: 'speedIndex', label: 'Speed Index', unit: 'ms', higherIsBetter: false, epsilon: 10 },
    { key: 'jsTransferKb', label: 'JS Transfer', unit: 'kb', higherIsBetter: false, epsilon: 1 },
    { key: 'totalTransferKb', label: 'Total Transfer', unit: 'kb', higherIsBetter: false, epsilon: 1 },
  ];

  let improved = 0;
  let regressed = 0;

  const rows = metricConfigs.map((metric) => {
    const beforeValue = before[metric.key];
    const afterValue = after[metric.key];
    const delta =
      beforeValue === null || afterValue === null ? null : afterValue - beforeValue;
    const trend = classifyTrend(delta, metric.higherIsBetter, metric.epsilon);

    if (trend === 'improved') improved += 1;
    if (trend === 'regressed') regressed += 1;

    return [
      metric.label,
      formatMetric(beforeValue, metric.unit),
      formatMetric(afterValue, metric.unit),
      formatDelta(delta, metric.unit),
      trend,
    ];
  });

  console.log(`Lighthouse comparison: ${options.label}`);
  console.log(`Before: ${path.resolve(beforePath)}`);
  console.log(`After:  ${path.resolve(afterPath)}`);
  console.log('');
  console.log(renderTable(rows));
  console.log('');
  console.log(`Summary: improved=${improved}, regressed=${regressed}, total=${rows.length}`);
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  console.error('');
  console.error(HELP_TEXT);
  process.exit(1);
}
