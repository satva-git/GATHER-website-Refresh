const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const vc = new VirtualConsole();
vc.on('jsdomError', () => {});
const html = fs.readFileSync('group-financial-reporting/index.html', 'utf8');
const doc = new JSDOM(html, { virtualConsole: vc }).window.document;
const prose = doc.querySelector('.prose') || doc.body;
function t(n) { return (n.textContent || '').replace(/\s+/g, ' ').trim(); }
console.log('TITLE', doc.title);
console.log('DESC', doc.querySelector('meta[name="description"]')?.content);
console.log('\nHEADINGS');
[...prose.querySelectorAll('h1,h2,h3')].forEach((h) => console.log(h.tagName, t(h).slice(0, 160)));
console.log('\nPARAS', [...prose.querySelectorAll('p')].length);
[...prose.querySelectorAll('p')].forEach((p, i) => console.log(i, t(p).slice(0, 180)));
console.log('\nCTAS');
[...prose.querySelectorAll('a.wp-block-button__link, a.wp-element-button, .wp-block-button a, a.btn')].forEach((a) => console.log('-', t(a), '->', a.getAttribute('href')));
console.log('\nIMAGES');
[...prose.querySelectorAll('img')].forEach((img) => console.log('-', (img.getAttribute('src') || img.getAttribute('data-src') || '').slice(0, 140), '|', img.getAttribute('alt')));
console.log('\nLISTS');
[...prose.querySelectorAll('ul,ol')].forEach((list, i) => {
  const items = [...list.querySelectorAll(':scope > li')].map((li) => t(li).slice(0, 100));
  if (items.length) console.log(i, items.join(' || '));
});
