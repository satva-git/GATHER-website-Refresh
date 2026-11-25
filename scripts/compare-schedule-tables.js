const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const vc = new VirtualConsole();
vc.on('jsdomError', () => {});

function norm(s) {
  return String(s || '').replace(/\u00a0/g, ' ').replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' ').trim();
}

function tables(html) {
  const doc = new JSDOM(html, { virtualConsole: vc }).window.document;
  const main = doc.querySelector('main') || doc.body;
  return [...main.querySelectorAll('table')].map((t, i) => {
    const rows = [...t.querySelectorAll('tr')].map((tr) =>
      [...tr.querySelectorAll('th, td')].map((c) => norm(c.textContent).slice(0, 180))
    );
    return { i, caption: norm(t.querySelector('caption')?.textContent || ''), rows };
  });
}

const live = fs.readFileSync(path.join(root, '.website-project/research/live-html/knowledge-centre__schedule-intercompany-recharges.html'), 'utf8');
const local = fs.readFileSync(path.join(root, 'knowledge-centre/schedule-intercompany-recharges/index.html'), 'utf8');
const lt = tables(live);
const lo = tables(local);
console.log('LIVE tables', lt.length, 'LOCAL', lo.length);
lt.forEach((t, i) => {
  const o = lo[i];
  console.log('\n=== TABLE', i, 'live rows', t.rows.length, 'local rows', o ? o.rows.length : 'MISSING');
  console.log('LIVE caption:', t.caption);
  console.log('LOCAL caption:', o && o.caption);
  const max = Math.max(t.rows.length, o ? o.rows.length : 0);
  for (let r = 0; r < max; r++) {
    const a = t.rows[r] || [];
    const b = (o && o.rows[r]) || [];
    console.log(' row', r, 'live cells', a.length, 'local cells', b.length);
    const n = Math.max(a.length, b.length);
    for (let c = 0; c < n; c++) {
      const same = norm(a[c]) === norm(b[c]);
      if (!same) {
        console.log('   DIFF c' + c);
        console.log('    L:', (a[c] || '').slice(0, 220));
        console.log('    O:', (b[c] || '').slice(0, 220));
      }
    }
  }
});

const liveGuide = fs.readFileSync(path.join(root, '.website-project/research/live-html/knowledge-centre__intercompany-recharges-guide.html'), 'utf8');
const doc = new JSDOM(liveGuide, { virtualConsole: vc }).window.document;
const keys = [
  'allocation determines',
  'net expense effect',
  'has not recorded its bill',
  'original £20,000',
  'original £20,000'.replace('£', ''),
];
const paras = [...doc.querySelectorAll('p')].map((p) => norm(p.textContent));
for (const k of ['allocation determines each', 'net expense effect', 'has not recorded its bill', '20,000 of external']) {
  const hits = paras.filter((p) => p.toLowerCase().includes(k.toLowerCase()));
  console.log('\nLIVE hits for', k, hits.length);
  hits.forEach((h) => console.log(' -', h.slice(0, 200)));
}
