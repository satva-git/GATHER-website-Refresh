const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const lines = fs.readFileSync(path.join(root, '.website-project', 'research', 'urls-all.tsv'), 'utf8').trim().split(/\r?\n/);
let missing = [];
for (const line of lines) {
  const url = line.split('\t')[1].trim();
  const p = new URL(url).pathname.replace(/^\/|\/$/g, '');
  const file = p ? path.join(root, p, 'index.html') : path.join(root, 'index.html');
  if (!fs.existsSync(file)) missing.push({ url, file: path.relative(root, file) });
}
console.log('Sitemap URLs:', lines.length);
console.log('Local files missing:', missing.length);
missing.forEach((m) => console.log('  ', m.url, '->', m.file));
if (missing.length) process.exit(1);
