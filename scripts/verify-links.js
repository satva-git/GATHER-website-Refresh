'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function extractHrefs(file) {
  const html = fs.readFileSync(file, 'utf8');
  const hrefs = [...html.matchAll(/href="([^"#][^"]*)"/g)].map((m) => m[1]);
  // Also verify local src attributes (images, scripts, stylesheets)
  const srcs = [...html.matchAll(/src="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((s) => !/^https?:/.test(s) && !/^data:/.test(s));
  return [...hrefs, ...srcs];
}

function resolve(from, href) {
  if (/^https?:/.test(href)) return null;
  return path.normalize(path.join(path.dirname(from), href.split('#')[0].split('?')[0]));
}

const pages = [
  path.join(ROOT, 'index.html'),
  path.join(ROOT, 'v2.html'),
  ...fs.readdirSync(path.join(ROOT, 'modules')).map((f) => path.join(ROOT, 'modules', f))
];

const missing = [];
for (const page of pages) {
  for (const href of extractHrefs(page)) {
    const target = resolve(page, href);
    if (!target) continue;
    if (!fs.existsSync(target)) {
      missing.push({
        page: path.relative(ROOT, page),
        href,
        target: path.relative(ROOT, target)
      });
    }
  }
}

if (missing.length) {
  console.error('Broken links:');
  missing.forEach((m) => console.error(`  ${m.page} -> ${m.href} (${m.target})`));
  process.exit(1);
}

console.log(`All internal links OK across ${pages.length} pages.`);
