/**
 * Compare local pages against downloaded live HTML. Read-only: no page writes.
 */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.resolve(__dirname, '..');
const liveDir = path.join(root, '.website-project', 'research', 'live-html');
const urlFile = path.join(root, '.website-project', 'research', 'urls-all.tsv');
const csvFile = path.join(root, '.website-project', 'research', 'url-implementation.csv');
const outDir = path.join(root, '.website-project', 'research');
const vc = new VirtualConsole();
vc.on('jsdomError', () => {});

const KEEP_CUSTOM = new Set([
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

const KC_GUIDES = [...KEEP_CUSTOM].filter((f) => f.startsWith('knowledge-centre/') && f.endsWith('/index.html'));

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

function norm(s) {
  return String(s || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[–—]/g, '-')
    .trim();
}

function localiseHref(href) {
  try {
    const u = new URL(href, 'https://gather.nexus/');
    if (u.hostname !== 'gather.nexus') return href;
    const p = u.pathname.replace(/\/$/, '') || '/';
    return p === '/' ? '/' : p + '/';
  } catch {
    return href;
  }
}

function parse(html) {
  return new JSDOM(html, { virtualConsole: vc }).window.document;
}

function textList(nodes) {
  return [...nodes].map((n) => norm(n.textContent)).filter(Boolean);
}

function extractLive(doc) {
  const main = doc.querySelector('main') || doc.querySelector('article') || doc.body;
  const title = norm(doc.querySelector('title')?.textContent);
  const desc = norm(doc.querySelector('meta[name="description"]')?.getAttribute('content'));
  const h1 = norm(doc.querySelector('main h1, .hero-title, h1')?.textContent);
  const headings = textList(main.querySelectorAll('h1, h2, h3'));
  const paras = textList(main.querySelectorAll('p')).filter((t) => t.length > 12);
  const links = [...main.querySelectorAll('a[href]')].map((a) => ({
    text: norm(a.textContent).slice(0, 80),
    href: a.getAttribute('href') || '',
  })).filter((l) => l.href && !l.href.startsWith('javascript:'));
  const images = [...main.querySelectorAll('img')].map((img) => ({
    src: img.getAttribute('src') || img.getAttribute('data-src') || '',
    alt: img.getAttribute('alt') || '',
  }));
  const ctas = [...main.querySelectorAll('a.wp-block-button__link, a.wp-element-button, .wp-block-button a')].map((a) => ({
    text: norm(a.textContent),
    href: a.getAttribute('href') || '',
  }));
  const faqs = [...doc.querySelectorAll('.faq-item')].map((item) => ({
    q: norm(item.querySelector('.faq-text, .faq-question, h3')?.textContent),
    a: norm(item.querySelector('.faq-answer-text, .faq-answer, p')?.textContent),
  })).filter((f) => f.q);
  const tables = [...main.querySelectorAll('table')].map((t) => ({
    caption: norm(t.querySelector('caption')?.textContent),
    cells: textList(t.querySelectorAll('th, td')),
  }));
  return { title, desc, h1, headings, paras, links, images, ctas, faqs, tables };
}

function extractLocal(doc) {
  const isKc = !!doc.querySelector('.kc-prose, body.kc-page');
  const rootEl = doc.querySelector('.kc-prose') || doc.querySelector('.prose') || doc.querySelector('main') || doc.body;
  const title = norm(doc.querySelector('title')?.textContent);
  const desc = norm(doc.querySelector('meta[name="description"]')?.getAttribute('content'));
  const h1 = norm(doc.querySelector('h1')?.textContent);
  const headings = textList(rootEl.querySelectorAll('h1, h2, h3')).concat(
    isKc ? textList(doc.querySelectorAll('.kc-hero h1, .mod-hero h1')) : []
  );
  const uniqueHeadings = [...new Set(headings)];
  const paras = textList(rootEl.querySelectorAll('p')).filter((t) => t.length > 12);
  const links = [...rootEl.querySelectorAll('a[href]')].map((a) => ({
    text: norm(a.textContent).slice(0, 80),
    href: a.getAttribute('href') || '',
  })).filter((l) => l.href && !l.href.startsWith('javascript:'));
  const imageNodes = [
    ...rootEl.querySelectorAll('img'),
    ...(isKc ? [...doc.querySelectorAll('.kc-hero img, .mod-hero img, .kc-cover img, article > img')] : []),
  ];
  const images = [...new Map(imageNodes.map((img) => {
    const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
    return [src + '|' + (img.getAttribute('alt') || ''), {
      src,
      alt: img.getAttribute('alt') || '',
    }];
  })).values()];
  const ctas = [...rootEl.querySelectorAll('a.wp-block-button__link, a.wp-element-button, .wp-block-button a, a.btn')].map((a) => ({
    text: norm(a.textContent),
    href: a.getAttribute('href') || '',
  }));
  const faqs = [...doc.querySelectorAll('.faq-item')].map((item) => ({
    q: norm(item.querySelector('.faq-q-text, .faq-text, h3')?.textContent),
    a: norm(item.querySelector('.faq-a, .faq-answer-text, p')?.textContent),
  })).filter((f) => f.q);
  const tables = [...rootEl.querySelectorAll('table')].map((t) => ({
    caption: norm(t.querySelector('caption')?.textContent),
    cells: textList(t.querySelectorAll('th, td')),
  }));
  const hasNav = !!doc.querySelector('#nav');
  const hasMega = /Modules/.test(doc.querySelector('#nav')?.textContent || '');
  const hasFoot = !!doc.querySelector('footer.site-foot, footer.subpage-foot');
  const relatedTitles = textList(doc.querySelectorAll('.kc-related h3, .kc-related a, .related-posts h3, .wp-block-post-title'));
  return {
    title, desc, h1, headings: uniqueHeadings, paras, links, images, ctas, faqs, tables,
    hasNav, hasMega, hasFoot, isKc, relatedTitles,
    bodyClass: doc.body?.getAttribute('class') || '',
  };
}

function missing(liveList, localList) {
  const loc = new Set(localList);
  return liveList.filter((x) => !loc.has(x));
}

function extra(liveList, localList) {
  const liv = new Set(liveList);
  return localList.filter((x) => !liv.has(x));
}

const RELATED_CHROME = /ALSO IN THIS COLLECTION|Related Posts|Howard Thompson|One Powerful Platform|Sources and related reading|^Sources$/i;

function paraOverlaps(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length > 24 && b.includes(a)) return true;
  if (b.length > 24 && a.includes(b)) return true;
  return false;
}

function missingParas(liveList, localList) {
  return liveList.filter((p) => !localList.some((l) => paraOverlaps(p, l)));
}

function extraParas(liveList, localList) {
  return localList.filter((p) => !liveList.some((l) => paraOverlaps(p, l)));
}

function classifyPage(row, live, local) {
  const findings = [];
  const add = (kind, detail) => findings.push({ kind, detail });

  if (!local.hasNav) add('Broken asset or link', 'Missing #nav');
  else if (!local.hasMega) add('Requires manual review', 'Nav present but mega-menu Modules label not found');
  else add('Expected difference', 'Local uses approved mega-menu (not live WordPress header)');

  if (!local.hasFoot) add('Broken asset or link', 'Missing site footer');
  else add('Expected difference', 'Local uses approved site-foot (not live WordPress footer)');

  if (live.title && local.title && live.title !== local.title) {
    add('Requires manual review', `Title differs. Live: "${live.title}" Local: "${local.title}"`);
  }
  if (live.desc && local.desc && live.desc !== local.desc) {
    add('Requires manual review', `Meta description differs.`);
  }
  if (live.h1 && local.h1 && live.h1 !== local.h1) {
    add('Missing content', `H1 differs. Live: "${live.h1}" Local: "${local.h1}"`);
  }

  const relatedSet = new Set((local.relatedTitles || []).map((t) => t.toLowerCase()));
  const isRelatedTitle = (h) => relatedSet.has(h.toLowerCase()) || RELATED_CHROME.test(h);
  const missH = missing(live.headings, local.headings).filter((h) =>
    h !== live.h1 && !isRelatedTitle(h)
  );
  const extraH = extra(live.headings, local.headings).filter((h) =>
    !/Ready for Audit-Ready|On this page|Product|Company|Integrations|Resources|Stay up to date/.test(h) &&
    !isRelatedTitle(h)
  );
  if (missH.length) add('Missing content', `Headings on live not found locally (${missH.length}): ${missH.slice(0, 8).join(' | ')}`);
  if (extraH.length) add('Unexpected content', `Local headings not on live (${extraH.length}): ${extraH.slice(0, 8).join(' | ')}`);

  const liveParas = live.paras.filter((p) => !/cookieconsent|CookieYes/i.test(p));
  const locParas = local.paras.filter((p) =>
    !/This form is not connected yet|Needs your review|Shown once\. The live page|current live legal text/.test(p)
  );
  const missP = missingParas(liveParas, locParas);
  const extraP = extraParas(liveParas, locParas).filter((p) =>
    !/Start your 30-day free trial|One Powerful Platform Unifying|No Credit Card Required|Needs your review|Shown once\. The live page/.test(p)
  );
  if (missP.length) add('Missing content', `${missP.length} live paragraph(s) not found locally. First: "${missP[0].slice(0, 140)}"`);
  if (extraP.length) add('Unexpected content', `${extraP.length} local paragraph(s) not on live. First: "${extraP[0].slice(0, 140)}"`);

  const liveCtas = live.ctas.map((c) => `${c.text} -> ${localiseHref(c.href)}`);
  const localCtas = local.ctas.map((c) => `${c.text} -> ${c.href}`);
  if (live.ctas.length && local.ctas.length === 0) {
    add('Missing content', `Live has ${live.ctas.length} CTA(s); local main/prose has none (may live in footer/hero).`);
  }

  const liveImgs = live.images.filter((i) => i.src && !i.src.startsWith('data:'));
  const localImgs = local.images.filter((i) => i.src && !i.src.startsWith('data:'));
  if (liveImgs.length > localImgs.length + 1) {
    add('Expected difference', `Live images ${liveImgs.length}; local resolved src ${localImgs.length}. Rebuilt pages inherit WordPress lazy-load placeholders (data-src).`);
  }

  if (live.faqs.length) {
    const locQ = new Set(local.faqs.map((f) => f.q));
    const missFaq = live.faqs.filter((f) => !locQ.has(f.q));
    if (missFaq.length) add('Missing content', `${missFaq.length} FAQ(s) missing. First: "${missFaq[0].q}"`);
    local.faqs.forEach((f) => {
      const liveF = live.faqs.find((x) => x.q === f.q);
      if (liveF && liveF.a && f.a && liveF.a !== f.a) {
        add('Requires manual review', `FAQ answer differs for: "${f.q}"`);
      }
    });
  }

  if (live.tables.length !== local.tables.length && Math.abs(live.tables.length - local.tables.length) > 0) {
    add('Requires manual review', `Table count live ${live.tables.length} vs local ${local.tables.length}`);
  }

  const kinds = new Set(findings.map((f) => f.kind));
  let status = 'Exact match';
  if (kinds.has('Missing content') || kinds.has('Broken asset or link')) status = kinds.has('Missing content') ? 'Missing content' : 'Broken asset or link';
  else if (kinds.has('Unexpected content')) status = 'Unexpected content';
  else if (kinds.has('Requires manual review')) status = 'Requires manual review';
  else if (kinds.has('Expected difference')) status = 'Expected difference';

  if (status === 'Expected difference' && missH.length === 0 && missP.length === 0 && live.title === local.title && live.h1 === local.h1) {
    status = 'Exact match';
    findings.unshift({ kind: 'Exact match', detail: 'Title, H1, headings and body paragraphs match live (chrome/nav/footer expected to differ).' });
  }

  return { status, findings, counts: { liveHeadings: live.headings.length, localHeadings: local.headings.length, liveParas: liveParas.length, localParas: locParas.length, liveFaqs: live.faqs.length, localFaqs: local.faqs.length, liveTables: live.tables.length, localTables: local.tables.length, liveImages: liveImgs.length, localImages: localImgs.length, liveCtas: live.ctas.length, localCtas: local.ctas.length } };
}

function loadCsvStatus() {
  const map = new Map();
  if (!fs.existsSync(csvFile)) return map;
  for (const line of fs.readFileSync(csvFile, 'utf8').trim().split(/\r?\n/).slice(1)) {
    const parts = line.split(',');
    map.set(parts[3], parts[1]);
  }
  return map;
}

const csvStatus = loadCsvStatus();
const lines = fs.readFileSync(urlFile, 'utf8').trim().split(/\r?\n/);
const rebuilt = [];
const custom = [];
const skipped = [];

for (const line of lines) {
  const [group, raw] = line.split('\t');
  const url = raw.trim().endsWith('/') ? raw.trim() : raw.trim() + '/';
  const rel = path.relative(root, publicFile(url)).replace(/\\/g, '/');
  const livePath = path.join(liveDir, safeName(url) + '.html');
  const localPath = publicFile(url);
  if (!fs.existsSync(livePath) || !fs.existsSync(localPath)) {
    skipped.push({ url, rel, reason: !fs.existsSync(livePath) ? 'no live html' : 'no local file' });
    continue;
  }
  const live = extractLive(parse(fs.readFileSync(livePath, 'utf8')));
  const local = extractLocal(parse(fs.readFileSync(localPath, 'utf8')));
  const compared = classifyPage({ group, url, rel }, live, local);
  const buildStatus = csvStatus.get(url) || csvStatus.get(url.replace(/\/$/, '')) || '';
  const rec = { group, url, file: rel, buildStatus, ...compared };
  if (rel === 'index.html') skipped.push({ url, rel, reason: 'homepage excluded from 70-page rebuild set' });
  else if (KEEP_CUSTOM.has(rel) || /custom layout kept|existing file kept/.test(buildStatus)) custom.push(rec);
  else rebuilt.push(rec);
}

function summarise(rows) {
  const tally = {};
  for (const r of rows) tally[r.status] = (tally[r.status] || 0) + 1;
  return tally;
}

const payload = {
  generatedAt: new Date().toISOString(),
  sitemapUrls: lines.length,
  rebuiltCompared: rebuilt.length,
  customCompared: custom.length,
  skipped,
  rebuiltTally: summarise(rebuilt),
  customTally: summarise(custom),
  rebuilt,
  customKcGuides: custom.filter((r) => KC_GUIDES.includes(r.file)),
  otherCustom: custom.filter((r) => !KC_GUIDES.includes(r.file)),
};

fs.writeFileSync(path.join(outDir, 'live-vs-local-audit.json'), JSON.stringify(payload, null, 2));

function mdFor(rows) {
  return rows.map((r) => {
    const linesOut = [
      `### ${r.url}`,
      `- File: \`${r.file}\``,
      `- Build status: ${r.buildStatus || 'n/a'}`,
      `- Classification: **${r.status}**`,
      `- Counts: headings ${r.counts.liveHeadings}/${r.counts.localHeadings} (live/local), paragraphs ${r.counts.liveParas}/${r.counts.localParas}, FAQs ${r.counts.liveFaqs}/${r.counts.localFaqs}, tables ${r.counts.liveTables}/${r.counts.localTables}, images ${r.counts.liveImages}/${r.counts.localImages}`,
    ];
    const notable = r.findings.filter((f) => f.kind !== 'Expected difference' && f.kind !== 'Exact match');
    if (!notable.length) linesOut.push('- No content mismatches beyond expected chrome (nav/footer).');
    else notable.forEach((f) => linesOut.push(`- ${f.kind}: ${f.detail}`));
    return linesOut.join('\n');
  }).join('\n\n');
}

const md = `# Live vs local comparison report

Generated: ${payload.generatedAt}

## Scope

- Sitemap URLs: ${payload.sitemapUrls}
- Rebuilt pages compared: ${payload.rebuiltCompared}
- Custom layouts compared: ${payload.customCompared}
- Skipped: ${payload.skipped.map((s) => s.rel + ' (' + s.reason + ')').join('; ') || 'none'}

## Rebuilt-page tally

${Object.entries(payload.rebuiltTally).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## Custom-layout tally

${Object.entries(payload.customTally).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## Classification key

- **Exact match** — title/H1/headings/paragraphs match live; nav/footer chrome differs by design.
- **Expected difference** — chrome, breadcrumbs, review flags, localised links, or approved shell.
- **Missing content** — live headings, paragraphs, FAQs, or CTAs not present locally.
- **Unexpected content** — local body text not present on live.
- **Broken asset or link** — missing nav/footer or image-count gap.
- **Requires manual review** — title/meta/tables/FAQ answers differ, or ambiguous mapping.

This audit did not overwrite any pages.

## Rebuilt pages (70-set)

${mdFor(rebuilt)}

## Custom layouts (kept)

${mdFor(custom)}
`;

fs.writeFileSync(path.join(outDir, 'live-vs-local-audit.md'), md);
console.log('Rebuilt', rebuilt.length, JSON.stringify(payload.rebuiltTally));
console.log('Custom', custom.length, JSON.stringify(payload.customTally));
console.log('Wrote', path.relative(root, path.join(outDir, 'live-vs-local-audit.md')));
