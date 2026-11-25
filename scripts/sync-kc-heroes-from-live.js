/**
 * Update title/meta and hero h1+lead on custom kc-page layouts from fresh live-html.
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const liveDir = path.join(root, '.website-project', 'research', 'live-html');
const urlFile = path.join(root, '.website-project', 'research', 'urls-all.tsv');

function safeName(url) {
  const p = new URL(url).pathname.replace(/^\/|\/$/g, '');
  if (!p) return 'home';
  return p.replace(/[\\/:*?"<>|]/g, '__');
}

function publicFile(url) {
  const p = new URL(url).pathname.replace(/^\/|\/$/g, '');
  if (!p) return path.join(root, 'index.html');
  return path.join(root, p, 'index.html');
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const lines = fs.readFileSync(urlFile, 'utf8').trim().split(/\r?\n/);
let updated = 0;

for (const line of lines) {
  const [, url] = line.split('\t');
  const canonical = url.trim().endsWith('/') ? url.trim() : url.trim() + '/';
  const localPath = publicFile(canonical);
  if (!fs.existsSync(localPath)) continue;
  let local = fs.readFileSync(localPath, 'utf8');
  if (!local.includes('class="kc-page"')) continue;

  const livePath = path.join(liveDir, safeName(canonical) + '.html');
  if (!fs.existsSync(livePath)) continue;
  const liveDoc = new JSDOM(fs.readFileSync(livePath, 'utf8')).window.document;
  const title = (liveDoc.querySelector('title')?.textContent || '').replace(/\s+/g, ' ').trim();
  let desc = liveDoc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  desc = desc.replace(/\s+/g, ' ').trim();
  const h1 = (liveDoc.querySelector('main h1, .hero-title, h1')?.textContent || '').replace(/\s+/g, ' ').trim();
  const leadEl = liveDoc.querySelector('main .hero-description, main .lead, main p');
  const lead = (leadEl?.textContent || desc).replace(/\s+/g, ' ').trim();

  let next = local;
  if (title) next = next.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  if (desc) {
    if (next.includes('name="description"')) {
      next = next.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${esc(desc)}"`);
    }
    if (next.includes('property="og:description"')) {
      next = next.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${esc(desc)}"`);
    }
  }
  if (title && next.includes('property="og:title"')) {
    next = next.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${esc(title)}"`);
  }
  if (h1 && next.includes('class="h1"')) {
    next = next.replace(/(<h1 class="h1">)[\s\S]*?(<\/h1>)/, `$1${esc(h1)}$2`);
  }
  if (lead && next.includes('class="lead"')) {
    next = next.replace(/(<p class="lead">)[\s\S]*?(<\/p>)/, `$1${esc(lead)}$2`);
  }

  if (next !== local) {
    fs.writeFileSync(localPath, next);
    updated++;
    console.log('hero/meta', path.relative(root, localPath).replace(/\\/g, '/'));
  }
}

console.log('Updated KC heroes:', updated);