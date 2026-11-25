/**
 * Build local pages at the live gather.nexus paths.
 * Does not touch git, the live site, or existing index.html files.
 * Content is taken from the saved live HTML in .website-project/research/live-html.
 */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const virtualConsole = new VirtualConsole();

const root = path.resolve(__dirname, '..');
const liveDir = path.join(root, '.website-project', 'research', 'live-html');
const urlFile = path.join(root, '.website-project', 'research', 'urls-all.tsv');
const reportDir = path.join(root, '.website-project', 'research');

const lines = fs.readFileSync(urlFile, 'utf8').trim().split(/\r?\n/);

function safeName(url) {
  const p = new URL(url).pathname.replace(/^\/|\/$/g, '');
  if (!p) return 'home';
  return p.replace(/[\\/:*?"<>|]/g, '__');
}

function publicFile(url) {
  const p = new URL(url).pathname.replace(/^\/|\/$/g, '');
  if (!p) return path.join(root, 'index.html');
  return path.join(root, p, 'index.html');
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function localPath(absUrl) {
  try {
    const u = new URL(absUrl, 'https://gather.nexus/');
    if (u.hostname !== 'gather.nexus') return absUrl;
    if (/\.[a-z0-9]{2,5}$/i.test(u.pathname) && !u.pathname.endsWith('.html')) return absUrl;
    const p = u.pathname.replace(/\/$/, '') || '/';
    return p + '/' + (u.search || '') + (u.hash || '');
  } catch {
    return absUrl;
  }
}

function rewriteLinks(rootEl) {
  rootEl.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    a.setAttribute('href', localPath(href));
  });
}

function descriptionFrom(doc, existing) {
  if (existing && existing.trim()) return existing.trim();
  const p = doc.querySelector('main p');
  const raw = (p ? p.textContent : doc.querySelector('main')?.textContent || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!raw) return '';
  let sentence = raw.split(/(?<=[.!?])\s/)[0] || raw;
  if (sentence.length > 155) sentence = sentence.slice(0, 152).replace(/\s+\S*$/, '') + '...';
  if (sentence.length < 80 && raw.length > sentence.length) {
    sentence = raw.slice(0, 152).replace(/\s+\S*$/, '');
    if (raw.length > sentence.length) sentence += '...';
  }
  return sentence;
}

function markAbout(main) {
  const note = main.ownerDocument.createElement('aside');
  note.className = 'review-flag';
  note.innerHTML = '<strong>Needs your review before this page is treated as final.</strong> The live About page has three team cards, with different job lines, all named Alexa. The same David Mitchell / Directly Energy quote is stored four times in the testimonial slider. Nothing here has been replaced or invented. Please confirm the real names, or tell me to remove these blocks.';
  const content = main.querySelector('.content') || main;
  content.insertBefore(note, content.firstChild);

  const boxes = [...main.querySelectorAll('.testimonial-box')];
  boxes.slice(1).forEach((box) => box.remove());
  if (boxes[0]) {
    const dup = main.ownerDocument.createElement('p');
    dup.className = 'review-flag-inline';
    dup.textContent = 'Shown once. The live page repeats this same quote in four slider slots.';
    boxes[0].after(dup);
  }
}

function approvedShellFromModule() {
  const moduleHtml = fs.readFileSync(path.join(root, 'modules', 'group-reporting.html'), 'utf8');
  const blogHtml = fs.readFileSync(path.join(root, 'blog', 'index.html'), 'utf8');
  const extract = (html, start, endTag) => {
    const s = html.indexOf(start);
    const e = html.indexOf(endTag, s) + endTag.length;
    return html.slice(s, e);
  };
  const normalizeNav = (nav) =>
    nav
      .replace(/\.\.\/index\.html/g, '/')
      .replace(/href="\.\.\/assets\//g, 'href="/assets/')
      .replace(/src="\.\.\/assets\//g, 'src="/assets/')
      .replace(/srcset="\.\.\/assets\//g, 'srcset="/assets/')
      .replace(/href="\.\.\/modules\//g, 'href="/modules/')
      .replace(/href="\.\.\/blog\//g, 'href="/blog/')
      .replace(/href="\.\.\/knowledge-centre\//g, 'href="/knowledge-centre/')
      .replace(/href="\.\.\/group-financial-reporting\//g, 'href="/group-financial-reporting/')
      .replace(/<a href="#" class="nav-login">/g, '<a href="https://app.gather.nexus/auth/authenticate" class="nav-login">')
      .replace(/<a href="#" class="nav-cta">/g, '<a href="https://app.gather.nexus/auth/user/signup" class="nav-cta">');
  const normalizeFoot = (foot) =>
    foot
      .replace(/\.\.\/assets\//g, '/assets/')
      .replace(/href="\.\.\/modules\//g, 'href="/modules/')
      .replace(/href="\.\.\/blog\/"/g, 'href="/blog/"')
      .replace(/href="\.\.\/index\.html#faq"/g, 'href="/ai/"')
      .replace(/href="\.\.\/index\.html#integrations"/g, 'href="/integrations/xero/"')
      .replace(/href="https:\/\/gather\.nexus\/for-finance-teams\/"/g, 'href="/for-finance-teams/"');
  return {
    nav: normalizeNav(extract(moduleHtml, '<nav id="nav">', '</nav>')),
    footer: normalizeFoot(extract(blogHtml, '<footer class="site-foot">', '</footer>')),
  };
}

const { nav, footer } = approvedShellFromModule();
const FORCE =
  process.env.FORCE_SYNC === '1' ||
  process.argv.includes('--force') ||
  process.argv.includes('--force-sync');
const KEEP_EXISTING = new Set([
  'index.html',
  'HomePage.html',
  'blog/index.html',
  'blog/group-ledger-multi-gaap-exit-readiness/index.html',
  'blog/mayday-vs-gather-multi-entity-layer/index.html',
  'compare/gather-nexus-vs-translucent/index.html',
  'compare/gather-nexus-vs-spotlight-reporting/index.html',
  'group-financial-reporting/complex-consolidations/index.html',
  'knowledge-centre/bulk-intercompany-recharge-setup/index.html',
  'knowledge-centre/consolidation-auditability-transaction-drill-down/index.html',
  'knowledge-centre/foreign-exchange-consolidation/index.html',
  'knowledge-centre/fractional-cfo-client-report-access/index.html',
  'knowledge-centre/intercompany-loan-accounting-xero-quickbooks/index.html',
  'knowledge-centre/intercompany-recharges-guide/index.html',
  'knowledge-centre/multi-gaap-reporting-xero-quickbooks/index.html',
  'knowledge-centre/multi-ledger-multi-entity-consolidation/index.html',
  'knowledge-centre/schedule-intercompany-recharges/index.html',
  'knowledge-centre/xero-tracking-categories-quickbooks-class-consolidation/index.html',
]);

const rows = [];
const media = new Map();

for (const line of lines) {
  const [group, url] = line.split('\t');
  const file = path.join(liveDir, safeName(url.trim()) + '.html');
  const html = fs.readFileSync(file, 'utf8');
  const dom = new JSDOM(html, { virtualConsole });
  const doc = dom.window.document;
  const title = (doc.querySelector('title')?.textContent || '').replace(/\s+/g, ' ').trim();
  let desc = '';
  const md = doc.querySelector('meta[name="description"]');
  if (md) desc = (md.getAttribute('content') || '').replace(/\s+/g, ' ').trim();
  const madeDesc = !desc;
  desc = descriptionFrom(doc, desc);
  const h1 = (doc.querySelector('main h1, h1')?.textContent || '').replace(/\s+/g, ' ').trim();
  const canonical = url.trim().endsWith('/') ? url.trim() : url.trim() + '/';
  const main = doc.querySelector('main') || doc.querySelector('article');

  doc.querySelectorAll('img[src], video source[src], video[src], a[href]').forEach((el) => {
    const src = el.getAttribute('src') || el.getAttribute('href') || '';
    if (!/gather\.nexus\/wp-content\//.test(src) && !/\.(png|jpe?g|webp|gif|svg|mp4|pdf)(\?|$)/i.test(src)) return;
    if (!/^https?:\/\//.test(src)) return;
    const kind = /\.pdf(\?|$)/i.test(src) ? 'download' : /\.(mp4|webm)(\?|$)/i.test(src) ? 'video' : 'image';
    if (!media.has(src)) media.set(src, { url: src, kind, pages: new Set() });
    media.get(src).pages.add(url.trim());
  });

  const out = publicFile(url.trim());
  const relOut = path.relative(root, out).replace(/\\/g, '/');
  const isHome = new URL(url.trim()).pathname === '/';
  const exists = fs.existsSync(out);
  const keepCustom = KEEP_EXISTING.has(relOut);
  if (isHome || (exists && !FORCE) || (exists && FORCE && keepCustom)) {
    const status = isHome
      ? 'existing homepage kept'
      : keepCustom
        ? 'custom layout kept'
        : exists && FORCE
          ? 'existing file kept'
          : 'existing file kept';
    rows.push({ group, url: url.trim(), status, file: relOut, title, description: desc, descAdded: madeDesc ? 'yes' : 'no' });
    continue;
  }
  if (!main) {
    rows.push({ group, url: url.trim(), status: 'not built, no main content found', file: '', title, description: desc, descAdded: madeDesc ? 'yes' : 'no' });
    console.log('no main', url.trim());
    continue;
  }

  if (url.trim().endsWith('/about/') || url.trim().endsWith('/about')) markAbout(main);
  rewriteLinks(main);
  main.querySelectorAll('script, style, noscript').forEach((n) => n.remove());
  main.querySelectorAll('form').forEach((form) => {
    form.setAttribute('action', '');
    form.setAttribute('data-unwired', 'true');
    const note = doc.createElement('p');
    note.className = 'review-flag-inline';
    note.textContent = 'This form is not connected yet. It will not send a message until a delivery method is approved.';
    form.before(note);
  });

  const crumbs = new URL(url.trim()).pathname.split('/').filter(Boolean);
  const crumbHtml = ['<a href="/">Home</a>'].concat(crumbs.map((c, i) => {
    const href = '/' + crumbs.slice(0, i + 1).join('/') + '/';
    const label = c.replace(/-/g, ' ');
    return i === crumbs.length - 1 ? `<span aria-current="page">${esc(label)}</span>` : `<a href="${href}">${esc(label)}</a>`;
  })).join(' <span aria-hidden="true">/</span> ');

  const legal = /privacy-policy|cookie-policy|website-terms-of-use/.test(url);
  const legalNote = legal ? '<aside class="review-flag">This is the current live legal text, carried across unchanged. It is a draft for review by a qualified person before launch. It is not new legal advice.</aside>' : '';

  const image = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || doc.querySelector('main img[src]')?.getAttribute('src') || '';
  const schema = {
    '@context': 'https://schema.org',
    '@type': group === 'posts' ? 'BlogPosting' : 'WebPage',
    headline: h1 || title,
    description: desc,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'GATHER.nexus', url: 'https://gather.nexus/' },
    publisher: { '@type': 'Organization', name: 'GATHER.nexus', url: 'https://gather.nexus/' }
  };

  const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(title)}</title>
${desc ? `<meta name="description" content="${esc(desc)}"/>` : ''}
<link rel="canonical" href="${esc(canonical)}"/>
<meta property="og:title" content="${esc(title)}"/>
${desc ? `<meta property="og:description" content="${esc(desc)}"/>` : ''}
<meta property="og:url" content="${esc(canonical)}"/>
<meta property="og:type" content="${group === 'posts' ? 'article' : 'website'}"/>
${image ? `<meta property="og:image" content="${esc(image)}"/>` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/assets/page-extensions.css?v=20261125b"/>
<link rel="stylesheet" href="/assets/public-pages.css?v=20261125b"/>
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body class="public-page">
<a class="skip-link" href="#content">Skip to content</a>
${nav}
<main id="content">
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb">${crumbHtml}</nav>
    ${legalNote}
    <div class="prose">${main.innerHTML}</div>
  </div>
</main>
${footer}
<script src="/assets/page-extensions.js?v=20261125b" defer></script>
<script>
document.querySelectorAll('form[data-unwired]').forEach(function (form) {
  form.addEventListener('submit', function (e) { e.preventDefault(); });
});
</script>
</body>
</html>
`;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, page);
  rows.push({ group, url: url.trim(), status: 'built from live text', file: path.relative(root, out), title, description: desc, descAdded: madeDesc ? 'yes' : 'no' });
  console.log('built', path.relative(root, out));
}

const csv = ['group,status,descAdded,url,file,title'];
for (const r of rows) {
  csv.push([r.group, r.status, r.descAdded, r.url, r.file, '"' + r.title.replace(/"/g, '""') + '"'].join(','));
}
fs.writeFileSync(path.join(reportDir, 'url-implementation.csv'), csv.join('\n'));

const mediaRows = ['kind,pages,url'];
for (const item of media.values()) {
  mediaRows.push([item.kind, item.pages.size, item.url].join(','));
}
fs.writeFileSync(path.join(reportDir, 'media-inventory.csv'), mediaRows.join('\n'));
console.log('PAGES', rows.length, 'BUILT', rows.filter(r => r.status.startsWith('built')).length, 'KEPT', rows.filter(r => r.status.startsWith('existing')).length);
console.log('MEDIA', media.size);
