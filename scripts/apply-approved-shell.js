/**
 * Propagate the approved homepage header, drawer and footer.
 * Asset URLs in the shell are root-absolute so deep pages (../../) stay valid.
 * Does not rewrite page body copy.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const skipDirs = new Set(['node_modules', '.website-project', 'scripts', 'exports', 'review', 'server', '.git', 'page-comment']);
const skipFiles = new Set([
  'index.html',
  'HomePage.html',
  'deductions_fees_illustration.html',
  'multichannel_revenue_fragmentation.html'
]);

const home = fs.readFileSync(path.join(root, 'HomePage.html'), 'utf8');

function sliceBetween(html, start, end) {
  const s = html.indexOf(start);
  if (s < 0) throw new Error('Missing ' + start);
  const e = html.indexOf(end, s);
  if (e < 0) throw new Error('Missing ' + end);
  return html.slice(s, e);
}

function absolutize(html) {
  return html
    .replace(/(href|src)="assets\//g, '$1="/assets/')
    .replace(/srcset="assets\//g, 'srcset="/assets/')
    .replace(/href="mcp-beta\.html"/g, 'href="/mcp-beta.html"');
}

const shell = absolutize(sliceBetween(home, '<header class="gn-header"', '<main'));
const footer = absolutize(sliceBetween(home, '<footer class="gn-footer">', '<script>'));

const ONEST = 'https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&display=swap';
const CSS = [
  '<link rel="stylesheet" href="/assets/gn-system.css?v=20261125e"/>',
  '<link rel="stylesheet" href="/assets/gn-templates.css?v=20261125e"/>'
].join('\n');

function kind(rel) {
  const p = rel.split('/');
  if (p[0] === 'blog' && p.length === 3 && p[1] !== 'author' && p[1] !== 'category') return 'gn-article';
  if (p[0] === 'product-updates' && p.length === 3) return 'gn-article';
  if (p[0] === 'compare') return 'gn-article';
  if (p[0] === 'knowledge-centre') {
    if (rel === 'knowledge-centre.html') return 'gn-hub';
    if (p.length === 3 && p[2] === 'index.html') return 'gn-kc-topic';
    if (p.length >= 2) return 'gn-kc-guide';
  }
  if (['privacy-policy', 'cookie-policy', 'website-terms-of-use'].includes(p[0])) return 'gn-article';
  if (['group-financial-reporting', 'intercompany-control', 'group-financial-planning', 'complex-consolidations', 'ai'].includes(p[0]) || rel.startsWith('modules/')) return 'gn-product';
  if (p[0] === 'pricing') return 'gn-pricing';
  if (['for-finance-teams', 'for-fractional-cfos'].includes(p[0])) return 'gn-audience';
  if (p[0] === 'integrations') return 'gn-integration';
  if (['about', 'contact', 'video', 'news-latest', 'lp'].includes(p[0])) return 'gn-utility';
  return 'gn-hub';
}

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, acc);
    else if (ent.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

let updated = 0;
let noNav = 0;
let noFoot = 0;

for (const file of walk(root)) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  if (skipFiles.has(rel)) continue;

  let html = fs.readFileSync(file, 'utf8');
  const before = html;

  if (html.includes('class="gn-header"')) {
    html = html.replace(/<header class="gn-header"[\s\S]*?(?=<main\b)/, shell);
  } else if (html.includes('<nav id="nav">')) {
    html = html.replace(/<nav id="nav">[\s\S]*?<\/nav>/, shell.trim());
  } else {
    noNav++;
    continue;
  }

  if (/<footer class="(?:site-foot|subpage-foot|gn-footer)"/.test(html)) {
    html = html.replace(/<footer class="(?:site-foot|subpage-foot|gn-footer)"[\s\S]*?<\/footer>/, footer.trim());
  } else {
    noFoot++;
  }

  if (!html.includes('family=Onest')) {
    if (/fonts\.googleapis\.com\/css2\?family=Instrument\+Sans[^"]*"/.test(html)) {
      html = html.replace(/https:\/\/fonts\.googleapis\.com\/css2\?family=Instrument\+Sans[^"]*/, ONEST);
    } else if (html.includes('</head>')) {
      html = html.replace('</head>', '<link rel="stylesheet" href="' + ONEST + '"/>\n</head>');
    }
  }

  if (!html.includes('gn-system.css')) {
    html = html.replace('</head>', CSS + '\n</head>');
  }

  const tpl = kind(rel);
  html = html.replace(/<body([^>]*)>/, (m, attrs) => {
    if (/class="/.test(attrs)) {
      return m.replace(/class="([^"]*)"/, (mm, cls) => {
        const parts = cls.split(/\s+/).filter(c => c && !c.startsWith('gn-') || c === 'gn');
        // keep gn if present; drop previous template classes then add
        const kept = cls.split(/\s+/).filter(c => c && !/^gn-(shell|article|product|pricing|audience|integration|utility|hub|kc-topic|kc-guide|reading)$/.test(c));
        if (!kept.includes('gn-shell')) kept.push('gn-shell');
        if (!kept.includes(tpl)) kept.push(tpl);
        const liveKinds = new Set(['gn-kc-topic', 'gn-kc-guide', 'gn-product', 'gn-audience', 'gn-integration', 'gn-pricing', 'gn-utility']);
        if (liveKinds.has(tpl) && !kept.includes('live-layout')) kept.push('live-layout');
        return 'class="' + kept.join(' ') + '"';
      });
    }
    return '<body' + attrs + ' class="gn-shell ' + tpl + '">';
  });

  if (html !== before) {
    fs.writeFileSync(file, html);
    updated++;
  }
}

console.log('Updated', updated, 'pages');
console.log('Skipped (no nav)', noNav);
console.log('Footer missing', noFoot);
