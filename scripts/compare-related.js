const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const vc = new VirtualConsole();
vc.on('jsdomError', () => {});

const guides = [
  'bulk-intercompany-recharge-setup',
  'consolidation-auditability-transaction-drill-down',
  'foreign-exchange-consolidation',
  'fractional-cfo-client-report-access',
  'intercompany-loan-accounting-xero-quickbooks',
  'intercompany-recharges-guide',
  'multi-gaap-reporting-xero-quickbooks',
  'multi-ledger-multi-entity-consolidation',
  'schedule-intercompany-recharges',
  'xero-tracking-categories-quickbooks-class-consolidation',
];

function slug(href) {
  try {
    const u = new URL(href, 'https://gather.nexus/');
    return u.pathname.replace(/\/$/, '');
  } catch {
    return href;
  }
}

function norm(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

const out = [];
for (const g of guides) {
  const livePath = path.join(root, '.website-project/research/live-html', 'knowledge-centre__' + g + '.html');
  const localPath = path.join(root, 'knowledge-centre', g, 'index.html');
  const liveDoc = new JSDOM(fs.readFileSync(livePath, 'utf8'), { virtualConsole: vc }).window.document;
  const localDoc = new JSDOM(fs.readFileSync(localPath, 'utf8'), { virtualConsole: vc }).window.document;
  const section = liveDoc.querySelector('.collection-section');
  const liveCards = section
    ? [...section.querySelectorAll('a.collection-card')].map((a) => ({
        href: slug(a.getAttribute('href') || ''),
        title: norm(a.querySelector('h3')?.textContent),
      }))
    : [];
  const localCards = [...localDoc.querySelectorAll('.kc-related a')].map((a) => ({
    href: slug(a.getAttribute('href') || ''),
    title: norm(a.querySelector('h3, .kc-related-title')?.textContent || a.textContent),
  }));
  const liveSet = new Set(liveCards.map((c) => c.href));
  const localSet = new Set(localCards.map((c) => c.href));
  out.push({
    guide: g,
    liveOnly: liveCards.filter((c) => !localSet.has(c.href)),
    localOnly: localCards.filter((c) => !liveSet.has(c.href)),
    shared: liveCards.filter((c) => localSet.has(c.href)).map((c) => c.href),
    liveCount: liveCards.length,
    localCount: localCards.length,
  });
}
console.log(JSON.stringify(out, null, 2));

const blogLive = new JSDOM(fs.readFileSync(path.join(root, '.website-project/research/live-html/blog.html'), 'utf8'), { virtualConsole: vc }).window.document;
const blogLocal = new JSDOM(fs.readFileSync(path.join(root, 'blog/index.html'), 'utf8'), { virtualConsole: vc }).window.document;
console.log('\nLIVE blog h1:', norm(blogLive.querySelector('h1')?.textContent));
console.log('LOCAL blog h1:', norm(blogLocal.querySelector('h1')?.textContent));
console.log('LIVE hero:', norm(blogLive.querySelector('.hero-title')?.textContent));
