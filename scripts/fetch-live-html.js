/**
 * Download current gather.nexus HTML for every URL in urls-all.tsv
 * into .website-project/research/live-html (read-only on live site).
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const liveDir = path.join(root, '.website-project', 'research', 'live-html');
const urlFile = path.join(root, '.website-project', 'research', 'urls-all.tsv');
const reportFile = path.join(root, '.website-project', 'research', 'live-fetch-report.json');

function safeName(url) {
  const p = new URL(url).pathname.replace(/^\/|\/$/g, '');
  if (!p) return 'home';
  return p.replace(/[\\/:*?"<>|]/g, '__');
}

async function fetchOne(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'GATHER-Refresh-Local/1.0 (content sync; gather.nexus)',
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  const body = await res.text();
  return { status: res.status, ok: res.ok, bytes: Buffer.byteLength(body, 'utf8'), body };
}

async function main() {
  const lines = fs.readFileSync(urlFile, 'utf8').trim().split(/\r?\n/);
  fs.mkdirSync(liveDir, { recursive: true });

  const results = [];
  const concurrency = 6;
  let i = 0;

  async function worker() {
    while (i < lines.length) {
      const line = lines[i++];
      const [group, rawUrl] = line.split('\t');
      const url = rawUrl.trim();
      const canonical = url.endsWith('/') ? url : url + '/';
      const out = path.join(liveDir, safeName(canonical) + '.html');
      try {
        const r = await fetchOne(canonical);
        if (!r.ok) {
          results.push({ group, url: canonical, ok: false, status: r.status, file: path.relative(root, out) });
          console.log('FAIL', r.status, canonical);
          continue;
        }
        fs.writeFileSync(out, r.body, 'utf8');
        results.push({
          group,
          url: canonical,
          ok: true,
          status: r.status,
          bytes: r.bytes,
          file: path.relative(root, out),
        });
        console.log('OK', canonical, r.bytes);
      } catch (e) {
        results.push({ group, url: canonical, ok: false, error: String(e.message || e), file: path.relative(root, out) });
        console.log('ERR', canonical, e.message);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  const summary = {
    fetchedAt: new Date().toISOString(),
    total: results.length,
    ok: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok),
  };
  fs.writeFileSync(reportFile, JSON.stringify({ summary, results }, null, 2));
  console.log('Done.', summary.ok + '/' + summary.total, 'saved to', path.relative(root, liveDir));
  if (summary.failed.length) process.exitCode = 1;
}

main();