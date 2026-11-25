const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name === 'index.html' || (e.name.endsWith('.html') && d === root))
      acc.push(p);
  }
}

const files = [];
walk(root, files);
for (const f of ['index.html', 'HomePage.html', 'knowledge-centre.html', 'mcp-beta.html']) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) files.push(p);
}
const modDir = path.join(root, 'modules');
if (fs.existsSync(modDir)) {
  for (const f of fs.readdirSync(modDir).filter((x) => x.endsWith('.html'))) {
    files.push(path.join(modDir, f));
  }
}

const exclude = /[\\/]\.website-project[\\/]|[\\/]research[\\/]live-html/;
const unique = [...new Set(files)].filter((f) => !exclude.test(f));

const stats = {
  total: 0,
  noPublic: [],
  noNav: [],
  noExt: [],
  wpBlock: [],
  noSkip: [],
  noJs: [],
  oldNav: [],
};

for (const f of unique) {
  const rel = path.relative(root, f).replace(/\\/g, '/');
  const html = fs.readFileSync(f, 'utf8');
  stats.total++;
  if (!/public-pages\.css/.test(html) && !/^(index|HomePage)\.html$/.test(rel) && !/^modules\//.test(rel))
    stats.noPublic.push(rel);
  if (!/id="nav"/.test(html)) stats.noNav.push(rel);
  if (!/page-extensions\.css/.test(html)) stats.noExt.push(rel);
  if (/wp-block/.test(html)) stats.wpBlock.push(rel);
  if (!/skip-link/.test(html) && rel !== 'index.html' && rel !== 'HomePage.html') stats.noSkip.push(rel);
  if (!/page-extensions\.js/.test(html) && rel !== 'index.html' && rel !== 'HomePage.html')
    stats.noJs.push(rel);
  if (/nav-drop--resources/.test(html) && /Mega menu|mega-menu/.test(html) === false && /^modules\//.test(rel) === false)
    stats.oldNav.push(rel);
}

function printList(title, arr) {
  console.log(`\n${title} (${arr.length})`);
  arr.forEach((x) => console.log('  ', x));
}

console.log('HTML pages:', stats.total);
console.log('Missing public-pages.css:', stats.noPublic.length);
console.log('Missing page-extensions.css:', stats.noExt.length);
console.log('Missing nav:', stats.noNav.length);
console.log('Still wp-block:', stats.wpBlock.length);
console.log('Missing skip-link:', stats.noSkip.length);
console.log('Missing page-extensions.js:', stats.noJs.length);
console.log('Simplified nav (not homepage/modules mega):', stats.oldNav.length);
printList('noPublic', stats.noPublic);
printList('noExt', stats.noExt);
printList('noNav', stats.noNav);