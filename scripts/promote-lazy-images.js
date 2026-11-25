/**
 * On rebuilt public-page files, copy data-src onto src so Smush placeholders render.
 * Does not touch homepage, modules, or custom kc-page layouts.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const csv = fs.readFileSync(path.join(root, '.website-project', 'research', 'url-implementation.csv'), 'utf8');
let changedFiles = 0;
let replacements = 0;

for (const line of csv.trim().split(/\r?\n/).slice(1)) {
  const parts = line.split(',');
  const status = parts[1];
  const file = parts[4];
  if (!/built from live text/.test(status) || !file) continue;
  const full = path.join(root, file.replace(/\\/g, path.sep));
  if (!fs.existsSync(full)) continue;
  let html = fs.readFileSync(full, 'utf8');
  if (!html.includes('class="public-page"')) continue;
  const next = html.replace(
    /src="data:image\/gif;base64,[^"]*"([^>]*?)data-src="(https?:\/\/[^"]+)"/g,
    (m, mid, real) => {
      replacements++;
      return `src="${real}"${mid}data-src="${real}"`;
    }
  );
  if (next !== html) {
    fs.writeFileSync(full, next);
    changedFiles++;
  }
}

console.log('Updated', changedFiles, 'files;', replacements, 'lazy images promoted to src');
