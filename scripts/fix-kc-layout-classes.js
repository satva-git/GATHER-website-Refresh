/**
 * Fix shell template classes that break KC listing / guide layouts (narrow .prose).
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const GN_TEMPLATE =
  /^gn-(shell|article|product|pricing|audience|integration|utility|hub|kc-topic|kc-guide|reading)$/;

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '.website-project'].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, acc);
    else if (ent.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

function kcTemplate(rel, html) {
  if (!rel.startsWith('knowledge-centre')) return null;
  if (rel === 'knowledge-centre.html') return 'gn-hub';
  if (html.includes('published-resources-box') || html.includes('class="resource-card"')) {
    return 'gn-kc-topic';
  }
  if (
    html.includes('hero-title') ||
    html.includes('post-title-box') ||
    html.includes('content-grid-bg') ||
    html.includes('collection-card')
  ) {
    return 'gn-kc-guide';
  }
  const parts = rel.split('/');
  if (parts.length === 3 && parts[2] === 'index.html' && parts[0] === 'knowledge-centre') {
    return 'gn-kc-topic';
  }
  if (parts[0] === 'knowledge-centre') return 'gn-kc-guide';
  return null;
}

let bodyFixed = 0;
let cssBumped = 0;

for (const file of walk(root)) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  let html = fs.readFileSync(file, 'utf8');
  let changed = false;

  const kcTpl = kcTemplate(rel, html);
  const needsLive =
    kcTpl === 'gn-kc-topic' ||
    kcTpl === 'gn-kc-guide' ||
    /published-resources-box|resource-card|hero-title|full-width-background|full-width-box|collection-card/.test(
      html
    );

  if (kcTpl || needsLive) {
    const next = html.replace(/<body([^>]*)>/, (m, attrs) => {
      if (!/class="/.test(attrs)) return m;
      return m.replace(/class="([^"]*)"/, (mm, cls) => {
        const kept = cls.split(/\s+/).filter((c) => c && !GN_TEMPLATE.test(c));
        if (!kept.includes('gn-shell')) kept.push('gn-shell');
        if (kcTpl && !kept.includes(kcTpl)) kept.push(kcTpl);
        if (needsLive && !kept.includes('live-layout')) kept.push('live-layout');
        return 'class="' + kept.join(' ') + '"';
      });
    });
    if (next !== html) {
      html = next;
      bodyFixed++;
      changed = true;
    }
  }

  if (html.includes('public-pages.css?v=20261125b')) {
    html = html.replace(/public-pages\.css\?v=20261125b/g, 'public-pages.css?v=20261125c');
    cssBumped++;
    changed = true;
  }
  if (html.includes('gn-templates.css?v=20261125d')) {
    html = html.replace(/gn-templates\.css\?v=20261125d/g, 'gn-templates.css?v=20261125e');
    cssBumped++;
    changed = true;
  }
  if (html.includes('gn-system.css?v=20261125d')) {
    html = html.replace(/gn-system\.css\?v=20261125d/g, 'gn-system.css?v=20261125e');
    changed = true;
  }

  if (changed) fs.writeFileSync(file, html);
}

console.log('KC body classes fixed:', bodyFixed);
console.log('CSS cache-bust bumped:', cssBumped);