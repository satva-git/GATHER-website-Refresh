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

function collectPages(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectPages(full, acc);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      acc.push(full);
    }
  }
}

const pages = [
  path.join(ROOT, 'index.html'),
  path.join(ROOT, 'HomePage.html'),
  path.join(ROOT, 'knowledge-centre.html'),
  ...(() => {
    const modulePages = [];
    collectPages(path.join(ROOT, 'modules'), modulePages);
    collectPages(path.join(ROOT, 'group-financial-reporting'), modulePages);
    collectPages(path.join(ROOT, 'knowledge-centre'), modulePages);
    return modulePages;
  })()
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
