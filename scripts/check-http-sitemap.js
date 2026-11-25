/**
 * HTTP-check all sitemap URLs against the local preview server.
 * Treats root-absolute paths as site-root (not nested-folder) URLs.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.resolve(__dirname, '..');
const base = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:3000';
const urlFile = path.join(root, '.website-project', 'research', 'urls-all.tsv');
const vc = new VirtualConsole();
vc.on('jsdomError', () => {});

function get(url, hops = 0) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 15000 }, (res) => {
      const loc = res.headers.location;
      if (res.statusCode >= 300 && res.statusCode < 400 && loc && hops < 5) {
        res.resume();
        const next = loc.startsWith('http') ? loc : new URL(loc, url).href;
        resolve(get(next, hops + 1));
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('utf8'),
        });
      });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, error: 'timeout' });
    });
    req.on('error', (err) => resolve({ status: 0, error: err.message }));
  });
}

function localAssetExists(src, pageUrl) {
  if (!src || src.startsWith('data:')) return true;
  if (/^(https?:|mailto:|tel:)/i.test(src) && !src.includes('127.0.0.1') && !src.includes('localhost')) return true;
  let pathname;
  try {
    pathname = new URL(src, pageUrl).pathname;
  } catch {
    return true;
  }
  const file = path.join(root, pathname.replace(/^\//, '').split('?')[0]);
  return fs.existsSync(file);
}

async function main() {
  const lines = fs.readFileSync(urlFile, 'utf8').trim().split(/\r?\n/);
  const results = [];
  const missingFiles = [];
  const missingImgs = [];
  const badStatus = [];

  for (const line of lines) {
    const liveUrl = line.split('\t')[1].trim();
    const pathname = new URL(liveUrl).pathname;
    const localUrl = base.replace(/\/$/, '') + (pathname.endsWith('/') || pathname === '/' ? pathname : pathname + '/');
    const res = await get(localUrl);
    const rec = { liveUrl, localUrl, status: res.status, error: res.error || null };
    if (res.status !== 200) {
      badStatus.push(rec);
      results.push(rec);
      continue;
    }
    const doc = new JSDOM(res.body, { virtualConsole: vc }).window.document;
    const imgs = [...doc.querySelectorAll('img')].map((img) => img.getAttribute('src') || img.getAttribute('data-src') || '');
    const broken = imgs.filter((src) => src && !localAssetExists(src, localUrl));
    rec.images = imgs.length;
    rec.brokenImages = broken;
    if (broken.length) missingImgs.push({ url: pathname, broken });
    results.push(rec);
  }

  const out = {
    generatedAt: new Date().toString(),
    origin: base,
    sitemapUrls: lines.length,
    http200: results.filter((r) => r.status === 200).length,
    badStatus,
    pagesWithBrokenImages: missingImgs,
  };
  const outPath = path.join(root, '.website-project', 'research', 'http-sitemap-check.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log('Sitemap URLs:', lines.length);
  console.log('HTTP 200:', out.http200);
  console.log('Non-200:', badStatus.length);
  badStatus.forEach((b) => console.log('  ', b.status, b.localUrl, b.error || ''));
  console.log('Pages with missing local image files:', missingImgs.length);
  missingImgs.slice(0, 20).forEach((m) => console.log('  ', m.url, m.broken.slice(0, 5).join(' | ')));
  if (badStatus.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
