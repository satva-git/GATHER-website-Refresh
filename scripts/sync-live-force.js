/**
 * Fetch live HTML, rebuild public pages (force), re-apply approved nav/footer.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const node = process.execPath;

function run(script, env = {}) {
  const r = spawnSync(node, [path.join(__dirname, script)], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  if (r.status !== 0) process.exit(r.status || 1);
}

run('fetch-live-html.js');
run('build-public-pages.js', { FORCE_SYNC: '1' });
run('apply-approved-shell.js');
console.log('Live sync complete.');