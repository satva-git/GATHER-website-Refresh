/**
 * Find consecutive or repeated paragraphs that match after apostrophe normalisation.
 * Read-only.
 */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.resolve(__dirname, '..');
const vc = new VirtualConsole();
vc.on('jsdomError', () => {});

const files = [
  'knowledge-centre/intercompany-recharges-guide/index.html',
  'knowledge-centre/bulk-intercompany-recharge-setup/index.html',
  'knowledge-centre/consolidation-auditability-transaction-drill-down/index.html',
  'knowledge-centre/foreign-exchange-consolidation/index.html',
  'knowledge-centre/fractional-cfo-client-report-access/index.html',
  'knowledge-centre/intercompany-loan-accounting-xero-quickbooks/index.html',
  'knowledge-centre/multi-gaap-reporting-xero-quickbooks/index.html',
  'knowledge-centre/multi-ledger-multi-entity-consolidation/index.html',
  'knowledge-centre/schedule-intercompany-recharges/index.html',
  'knowledge-centre/xero-tracking-categories-quickbooks-class-consolidation/index.html',
];

function norm(s) {
  return String(s || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

for (const rel of files) {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  const doc = new JSDOM(html, { virtualConsole: vc }).window.document;
  const paras = [...doc.querySelectorAll('.kc-prose p')].map((p) => ({
    text: p.textContent.replace(/\s+/g, ' ').trim(),
    key: norm(p.textContent),
  })).filter((p) => p.key.length > 40);
  const seen = new Map();
  const dups = [];
  paras.forEach((p, i) => {
    if (seen.has(p.key)) dups.push({ i, first: seen.get(p.key), text: p.text.slice(0, 160) });
    else seen.set(p.key, i);
  });
  if (dups.length) {
    console.log('\n' + rel + ' duplicates: ' + dups.length);
    dups.forEach((d) => console.log('  #' + d.i + ' repeats #' + d.first + ': ' + d.text));
  }
}
