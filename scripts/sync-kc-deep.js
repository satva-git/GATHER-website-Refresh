/**
 * Deep-sync custom KC guide article bodies from live HTML into existing
 * kc-page layouts. Preserves callouts, tables wrappers, FAQ widgets, TOC.
 */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.resolve(__dirname, '..');
const liveDir = path.join(root, '.website-project', 'research', 'live-html');
const reportPath = path.join(root, '.website-project', 'research', 'kc-deep-sync-report.json');
const vc = new VirtualConsole();
vc.on('jsdomError', () => {});

const GUIDES = [
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
];

function safeNameFromRel(rel) {
  const slug = rel.replace(/^knowledge-centre\//, '').replace(/\/index\.html$/, '');
  return 'knowledge-centre__' + slug.replace(/\//g, '__');
}

function norm(s) {
  return String(s || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[–—]/g, '-')
    .trim();
}

function headingKey(s) {
  return norm(s)
    .toLowerCase()
    .replace(/^[0-9]+\s*[:.)-]\s*/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function localiseHref(href) {
  if (!href) return href;
  try {
    const u = new URL(href, 'https://gather.nexus/');
    if (u.hostname !== 'gather.nexus') return href;
    const p = u.pathname.replace(/\/$/, '') || '/';
    if (p === '/') return '../../index.html';
    if (p.startsWith('/knowledge-centre/')) {
      const rest = p.slice('/knowledge-centre/'.length);
      return '../' + rest + (rest.includes('.') ? '' : '/');
    }
    if (p.startsWith('/blog/')) return '../../' + p.replace(/^\//, '') + '/';
    if (p.startsWith('/modules/')) return '../../' + p.replace(/^\//, '');
    return p + '/';
  } catch {
    return href;
  }
}

function rewriteLinks(el) {
  el.querySelectorAll('a[href]').forEach((a) => {
    a.setAttribute('href', localiseHref(a.getAttribute('href')));
  });
}

function liveHtml(el) {
  const clone = el.cloneNode(true);
  rewriteLinks(clone);
  return clone.innerHTML.trim();
}

function parseLiveArticle(doc) {
  const main = doc.querySelector('main') || doc.body;
  const h1 = norm(main.querySelector('h1, .hero-title')?.textContent);
  const lead = norm(main.querySelector('.hero-description')?.textContent);
  const contentRoot = main.querySelector('.content-box') || main.querySelector('.entry-content') || main;
  const h2s = [...contentRoot.querySelectorAll('h2')].filter((h) => headingKey(h.textContent) !== 'also in this collection');

  const sections = h2s.map((h2, i) => {
    const nodes = [];
    let n = h2.nextElementSibling;
    while (n && n !== h2s[i + 1]) {
      if (n.matches('h2')) break;
      if (/also in this collection/i.test(n.textContent || '') && n.tagName === 'H3') break;
      nodes.push(n);
      n = n.nextElementSibling;
    }
    const paras = nodes.filter((el) => el.tagName === 'P');
    const tables = nodes.map((el) => (el.tagName === 'TABLE' ? el : el.querySelector && el.querySelector('table'))).filter(Boolean);
    const h3s = nodes.filter((el) => el.tagName === 'H3' && !/also in this collection/i.test(el.textContent));
    return { heading: norm(h2.textContent), key: headingKey(h2.textContent), paras, tables, h3s };
  });

  const faqs = [...doc.querySelectorAll('.faq-item')].map((item) => ({
    q: norm(item.querySelector('.faq-text, h3')?.textContent),
    aText: norm(item.querySelector('.faq-answer-text, .faq-answer p, p')?.textContent),
  })).filter((f) => f.q);

  return { h1, lead, sections, faqs };
}

function bestH2(localH2s, liveKey) {
  let best = null;
  let bestScore = 0;
  for (const h of localH2s) {
    const k = headingKey(h.textContent);
    if (!k) continue;
    if (k === liveKey) return h;
    if (k.includes(liveKey) || liveKey.includes(k)) {
      const score = Math.min(k.length, liveKey.length) / Math.max(k.length, liveKey.length);
      if (score > bestScore) {
        bestScore = score;
        best = h;
      }
    }
  }
  return bestScore >= 0.55 ? best : null;
}

function matchLiveIndexes(localText, liveParas, used) {
  const t = norm(localText);
  if (!t) return null;
  for (let i = 0; i < liveParas.length; i++) {
    if (used.has(i)) continue;
    if (norm(liveParas[i].textContent) === t) return [i];
  }
  for (let i = 0; i < liveParas.length; i++) {
    if (used.has(i)) continue;
    let acc = norm(liveParas[i].textContent);
    const idxs = [i];
    let j = i + 1;
    while (j < liveParas.length && !used.has(j) && t.startsWith(acc) && t.length > acc.length) {
      const next = acc + ' ' + norm(liveParas[j].textContent);
      if (!t.startsWith(next) && t !== next) break;
      acc = next;
      idxs.push(j);
      j += 1;
      if (t === acc) return idxs;
    }
    if (t === acc) return idxs;
  }
  for (let i = 0; i < liveParas.length; i++) {
    if (used.has(i)) continue;
    const lt = norm(liveParas[i].textContent);
    if (!lt) continue;
    if (lt.startsWith(t) && lt.length - t.length < 120) return [i];
    if (t.startsWith(lt) && t.length - lt.length < 40) return [i];
  }
  return null;
}

function joinedLiveHtml(liveParas, idxs) {
  return idxs
    .map((i) => liveHtml(liveParas[i]))
    .filter(Boolean)
    .join(' ');
}

function syncGuide(rel) {
  const localPath = path.join(root, rel);
  const livePath = path.join(liveDir, safeNameFromRel(rel) + '.html');
  const report = { file: rel, changes: [], unmapped: [], skipped: [] };
  if (!fs.existsSync(localPath) || !fs.existsSync(livePath)) {
    report.unmapped.push('Missing file pair');
    return report;
  }

  let html = fs.readFileSync(localPath, 'utf8');
  const liveDoc = new JSDOM(fs.readFileSync(livePath, 'utf8'), { virtualConsole: vc }).window.document;
  const live = parseLiveArticle(liveDoc);

  const articleStart = html.indexOf('<article class="kc-prose"');
  const articleEnd = html.indexOf('</article>', articleStart);
  if (articleStart < 0 || articleEnd < 0) {
    report.unmapped.push('No kc-prose article');
    return report;
  }

  if (live.h1) {
    html = html.replace(/(<h1 class="h1">)[\s\S]*?(<\/h1>)/, (m, a, b) => {
      if (norm(m.slice(a.length, -b.length)) === live.h1) return m;
      report.changes.push('Updated H1 from live');
      return a + live.h1.replace(/&/g, '&amp;') + b;
    });
  }
  if (live.lead) {
    html = html.replace(/(<section class="mod-hero[\s\S]*?<p class="lead">)([\s\S]*?)(<\/p>)/, (m, a, inner, b) => {
      if (norm(inner) === live.lead) return m;
      report.changes.push('Updated hero lead from live');
      return a + live.lead.replace(/&/g, '&amp;') + b;
    });
  }

  const articleStart2 = html.indexOf('<article class="kc-prose"');
  const articleEnd2 = html.indexOf('</article>', articleStart2);
  if (articleStart2 < 0 || articleEnd2 < 0) {
    report.unmapped.push('No kc-prose article after hero updates');
    return report;
  }
  const articleHtml = html.slice(articleStart2, articleEnd2 + '</article>'.length);
  const articleDom = new JSDOM('<!DOCTYPE html><html><body>' + articleHtml + '</body></html>', { virtualConsole: vc });
  const article = articleDom.window.document.querySelector('article');
  if (!article) {
    report.unmapped.push('Could not parse kc-prose article');
    return report;
  }
  const articleText = norm(article.textContent);
  const localH2s = [...article.querySelectorAll('h2')];

  for (const sec of live.sections) {
    if (headingKey(sec.heading) === 'frequently asked questions') continue;
    const h2 = bestH2(localH2s, sec.key);
    if (!h2) {
      report.unmapped.push('No local H2 for live section: ' + sec.heading);
      continue;
    }
    if (norm(h2.textContent) !== sec.heading) {
      h2.textContent = sec.heading;
      report.changes.push('Aligned H2 wording: ' + sec.heading);
    }

    const block = h2.closest('.kc-block') || h2.parentElement;
    const localBodies = [...block.querySelectorAll('p.body')];
    const used = new Set();

    localBodies.forEach((p) => {
      const idxs = matchLiveIndexes(p.textContent, sec.paras, used);
      if (!idxs) return;
      idxs.forEach((i) => used.add(i));
      const next = joinedLiveHtml(sec.paras, idxs);
      if (norm(p.textContent) === norm(idxs.map((i) => sec.paras[i].textContent).join(' '))) return;
      p.innerHTML = next;
      report.changes.push('Updated paragraph under "' + sec.heading + '"');
    });

    const leftover = sec.paras
      .map((p, i) => ({ p, i }))
      .filter(({ p, i }) => !used.has(i) && norm(p.textContent).length > 40)
      .filter(({ p }) => !articleText.includes(norm(p.textContent).slice(0, 80)));

    leftover.forEach(({ p }) => {
      const el = article.ownerDocument.createElement('p');
      el.className = 'body';
      el.innerHTML = liveHtml(p);
      const lastBody = [...block.querySelectorAll('p.body')].pop();
      const faqs = block.querySelector('#faqs, .faq-stack, .kc-related');
      if (lastBody) lastBody.after(el);
      else if (faqs) faqs.before(el);
      else block.appendChild(el);
      report.changes.push('Appended live paragraph under "' + sec.heading + '"');
    });

    const localTables = [...block.querySelectorAll('table')];
    sec.tables.forEach((lt, ti) => {
      const locT = localTables[ti];
      if (!locT) {
        report.unmapped.push('Live table not mapped under ' + sec.heading);
        return;
      }
      const liveCells = [...lt.querySelectorAll('th,td')];
      const locCells = [...locT.querySelectorAll('th,td')];
      if (liveCells.length !== locCells.length) {
        report.unmapped.push(`Table shape differs under "${sec.heading}" (live ${liveCells.length} cells, local ${locCells.length})`);
        return;
      }
      liveCells.forEach((cell, ci) => {
        if (norm(locCells[ci].textContent) === norm(cell.textContent)) return;
        const htmlCell = liveHtml(cell);
        locCells[ci].innerHTML = htmlCell;
        report.changes.push(`Updated table cell under "${sec.heading}"`);
      });
    });

    const localH3 = [...block.querySelectorAll('h3.h3')];
    sec.h3s.forEach((lh, idx) => {
      if (!localH3[idx]) {
        report.unmapped.push(`Live H3 not mapped under "${sec.heading}": ${norm(lh.textContent)}`);
        return;
      }
      if (headingKey(localH3[idx].textContent) === headingKey(lh.textContent) && norm(localH3[idx].textContent) !== norm(lh.textContent)) {
        localH3[idx].textContent = norm(lh.textContent);
        report.changes.push('Aligned H3: ' + norm(lh.textContent));
      }
    });
  }

  live.faqs.forEach((faq) => {
    const items = [...article.querySelectorAll('.faq-item')];
    const match = items.find((item) => headingKey(item.querySelector('.faq-q-text, h3')?.textContent) === headingKey(faq.q));
    if (!match) {
      report.unmapped.push('Live FAQ not mapped: ' + faq.q);
      return;
    }
    const qEl = match.querySelector('.faq-q-text, h3');
    if (qEl && norm(qEl.textContent) !== faq.q) {
      qEl.textContent = faq.q;
      report.changes.push('Aligned FAQ question: ' + faq.q);
    }
    const p = match.querySelector('.faq-a p');
    if (p && faq.aText && norm(p.textContent) !== faq.aText) {
      p.textContent = faq.aText;
      report.changes.push('Updated FAQ answer: ' + faq.q);
    }
  });

  const start = html.indexOf('<article class="kc-prose"');
  const end = html.indexOf('</article>', start) + '</article>'.length;
  html = html.slice(0, start) + article.outerHTML + html.slice(end);

  const faqScript = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  for (const block of faqScript) {
    try {
      const json = JSON.parse(block.replace(/<script[^>]*>/, '').replace(/<\/script>/, ''));
      const graph = json['@graph'] ? json['@graph'] : [json];
      const faqNode = graph.find((n) => n['@type'] === 'FAQPage');
      if (!faqNode || !live.faqs.length) continue;
      faqNode.mainEntity = live.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.aText },
      }));
      html = html.replace(block, '<script type="application/ld+json">' + JSON.stringify(json) + '</script>');
      report.changes.push('Updated FAQ JSON-LD to match live questions/answers');
    } catch {
      report.skipped.push('Could not parse existing JSON-LD; left unchanged');
    }
  }

  fs.writeFileSync(localPath, html);
  return report;
}

const reports = GUIDES.map(syncGuide);
fs.writeFileSync(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), guides: reports }, null, 2));
for (const r of reports) {
  console.log(r.file, 'changes', r.changes.length, 'unmapped', r.unmapped.length);
}
console.log('Wrote', path.relative(root, reportPath));
