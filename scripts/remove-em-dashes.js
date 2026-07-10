'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const FILES = [
  'index.html',
  'HomePage.html',
  'assets/page-extensions.css',
  'review/review.js',
  'review/review.css',
  'modules/intercompany-control.html',
  'modules/group-reporting.html',
  'modules/group-planning.html',
  'deductions_fees_illustration.html',
  'multichannel_revenue_fragmentation.html'
];

function replaceEmDashes(text) {
  return text
    .replace(/Module 0(\d) —/g, 'Module 0$1:')
    .replace(/Step (\d+) —/g, 'Step $1:')
    .replace(/LEVEL (\d+) —/g, 'LEVEL $1:')
    .replace(/(\d LEVELS) —/g, '$1:')
    .replace(/GATHER\.NEXUS —/g, 'GATHER.NEXUS:')
    .replace(/GATHER\.nexus —/g, 'GATHER.nexus:')
    .replace(/Map GRT —/g, 'Map GRT:')
    .replace(/Matrix view —/g, 'Matrix view:')
    .replace(/Timeline view —/g, 'Timeline view:')
    .replace(/Three-level drill-down —/g, 'Three-level drill-down:')
    .replace(/Three-level variance drill-down —/g, 'Three-level variance drill-down:')
    .replace(/Create GRT —/g, 'Create GRT:')
    .replace(/Create Autojournals —/g, 'Create Autojournals:')
    .replace(/Review Working Papers —/g, 'Review Working Papers:')
    .replace(/Generate Reports —/g, 'Generate Reports:')
    .replace(/Compare budgets to actuals —/g, 'Compare budgets to actuals:')
    .replace(/LEFT CARD —/g, 'LEFT CARD:')
    .replace(/CENTER CARD —/g, 'CENTER CARD:')
    .replace(/RIGHT CARD —/g, 'RIGHT CARD:')
    .replace(/Product journey —/g, 'Product journey:')
    .replace(/Level cards —/g, 'Level cards:')
    .replace(/The GATHER Difference —/g, 'The GATHER Difference:')
    .replace(/Review overlay —/g, 'Review overlay:')
    .replace(/ — /g, ', ')
    .replace(/—/g, ', ')
    .replace(/, GATHER\.nexus<\/title>/g, ' | GATHER.nexus</title>');
}

let total = 0;
for (const rel of FILES) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes('—')) continue;
  const after = replaceEmDashes(before);
  const count = (before.match(/—/g) || []).length;
  fs.writeFileSync(file, after, 'utf8');
  total += count;
  console.log(`${rel}: replaced ${count} em dash(es)`);
}

console.log(`Done. ${total} em dash character(s) removed from website files.`);
