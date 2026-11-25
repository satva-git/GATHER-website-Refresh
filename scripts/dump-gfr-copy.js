const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const vc = new VirtualConsole();
vc.on('jsdomError', () => {});
const html = fs.readFileSync('group-financial-reporting/index.html', 'utf8');
const doc = new JSDOM(html, { virtualConsole: vc }).window.document;
const prose = doc.querySelector('.prose');
const form = prose.querySelector('form');
const data = {
  h1: doc.querySelector('h1').textContent.trim(),
  headings: [...prose.querySelectorAll('h2,h3')].map((h) => h.textContent.replace(/\s+/g, ' ').trim()),
  paras: [...prose.querySelectorAll('p')].map((p) => p.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean),
  lists: [...prose.querySelectorAll('ul.check-list-box')].map((ul) => [...ul.children].map((li) => li.textContent.replace(/\s+/g, ' ').trim())),
  images: [...prose.querySelectorAll('img')].map((img) => ({ src: img.getAttribute('src'), alt: img.getAttribute('alt') })),
  form: form ? form.outerHTML : '',
};
fs.writeFileSync('.website-project/research/gfr-copy.json', JSON.stringify(data, null, 2));
console.log('lists', data.lists.length, 'images', data.images.length, 'form', data.form.length);
