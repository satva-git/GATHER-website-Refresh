'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const skip = new Set(['node_modules', '.website-project', 'exports', '.git']);

function walk(dir, acc) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, acc);
    else if (ent.name.endsWith('.html')) acc.push(full);
  }
}

const files = [];
walk(root, files);
let changed = 0;

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  const orig = html;
  const pairs = [
    ['href="#">Fractional CFOs', 'href="/for-fractional-cfos/">Fractional CFOs'],
    ['href="#">Finance Teams', 'href="/for-finance-teams/">Finance Teams'],
    ['href="#faq" class="nav-link--caps"', 'href="/ai/" class="nav-link--caps"'],
    ['href="../index.html#faq" class="nav-link--caps"', 'href="/ai/" class="nav-link--caps"'],
    ['href="../../index.html#faq" class="nav-link--caps"', 'href="/ai/" class="nav-link--caps"'],
    ['href="#pricing">Pricing', 'href="/pricing/">Pricing'],
    ['href="../index.html#pricing">Pricing', 'href="/pricing/">Pricing'],
    ['href="../../index.html#pricing">Pricing', 'href="/pricing/">Pricing'],
    ['href="https://gather.nexus/product-updates"', 'href="/product-updates/"'],
    ['href="https://gather.nexus/product-updates/"', 'href="/product-updates/"'],
    ['href="https://gather.nexus/video"', 'href="/video/"'],
    ['href="https://gather.nexus/video/"', 'href="/video/"']
  ];
  for (const [from, to] of pairs) html = html.split(from).join(to);

  html = html.replace(
    /href="(?:(?:\.\.\/)+)?(?:index\.html)?#integrations">(\s*)<span class="nav-brand-mark nav-brand-mark--qb"/g,
    'href="/integrations/quickbooks/">$1<span class="nav-brand-mark nav-brand-mark--qb"'
  );
  html = html.replace(
    /href="(?:(?:\.\.\/)+)?(?:index\.html)?#integrations">(\s*)<span class="nav-brand-mark nav-brand-mark--xero"/g,
    'href="/integrations/xero/">$1<span class="nav-brand-mark nav-brand-mark--xero"'
  );

  if (html !== orig) {
    fs.writeFileSync(file, html);
    changed += 1;
  }
}

console.log('changed ' + changed + ' of ' + files.length);
