const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const vc = new VirtualConsole();
vc.on('jsdomError', () => {});
const root = path.resolve(__dirname, '..');

function norm(s) {
  return String(s || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u2018\u2019\u201B]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const html = fs.readFileSync(path.join(root, 'knowledge-centre/intercompany-recharges-guide/index.html'), 'utf8');
const doc = new JSDOM(html, { virtualConsole: vc }).window.document;
const paras = [...doc.querySelectorAll('.kc-prose p')].map((p) => norm(p.textContent)).filter((t) => t.length > 30);
const hits = [];
for (let i = 0; i < paras.length; i++) {
  for (let j = 0; j < i; j++) {
    const a = paras[i];
    const b = paras[j];
    if (a === b || (a.length > 60 && b.startsWith(a)) || (b.length > 60 && a.startsWith(b))) {
      hits.push({ earlier: j, later: i, text: a.slice(0, 140) });
    }
  }
}
console.log('prefix/exact', hits.length);
hits.forEach((h) => console.log(h.earlier, h.later, h.text));

const lines = fs.readFileSync(path.join(root, '.website-project/research/urls-all.tsv'), 'utf8').trim().split(/\r?\n/);
for (const line of lines) {
  const url = line.split('\t')[1].trim();
  const p = new URL(url).pathname.replace(/^\/|\/$/g, '');
  const file = p ? path.join(root, p, 'index.html') : path.join(root, 'index.html');
  const d = new JSDOM(fs.readFileSync(file, 'utf8'), { virtualConsole: vc }).window.document;
  if (!d.querySelector('footer.site-foot, footer.subpage-foot')) console.log('NO FOOT', p || '/');
}
