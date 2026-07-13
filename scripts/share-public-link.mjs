import { spawn } from 'child_process';
import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 3000);
const DEFAULT_TOKEN = 'ade20793493210f2321bfbf8cc64278a';

function copyHomepage() {
  const homepage = path.join(ROOT, 'HomePage.html');
  const index = path.join(ROOT, 'index.html');
  if (fs.existsSync(homepage)) fs.copyFileSync(homepage, index);
}

function waitForHealth(timeoutMs = 30000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get(`http://127.0.0.1:${PORT}/api/health`, res => {
        let raw = '';
        res.on('data', chunk => { raw += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200) return resolve(JSON.parse(raw));
          if (Date.now() - started > timeoutMs) {
            return reject(new Error(`Health check failed (${res.statusCode})`));
          }
          setTimeout(tryOnce, 500);
        });
      });
      req.on('error', () => {
        if (Date.now() - started > timeoutMs) {
          return reject(new Error('Server did not start in time'));
        }
        setTimeout(tryOnce, 500);
      });
    };
    tryOnce();
  });
}

function isServerRunning() {
  return waitForHealth(2000).then(() => true).catch(() => false);
}

function startServer() {
  copyHomepage();
  const child = spawn(process.execPath, ['server/index.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT), HOST: '0.0.0.0' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stdout.on('data', chunk => process.stdout.write(chunk));
  child.stderr.on('data', chunk => process.stderr.write(chunk));
  return child;
}

function spawnTunnel(command, args, label, urlPattern, timeoutMs = 90000) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.platform === 'win32' ? 'npx.cmd' : 'npx',
      ['--yes', ...command, ...args],
      { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], shell: true }
    );

    let output = '';
    let settled = false;

    const finish = (err, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (err) reject(err);
      else resolve(result);
    };

    const onData = chunk => {
      output += chunk.toString();
      process.stderr.write(chunk);
      const match = output.match(urlPattern);
      if (match) finish(null, { child, url: match[0].replace(/[^\w:/.?=&%-]+$/, ''), label });
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('error', err => finish(err));
    child.on('exit', code => {
      if (!settled) {
        finish(new Error(`${label} exited (${code}). Output: ${output}`));
      }
    });

    const timer = setTimeout(() => {
      finish(new Error(`${label} timed out`));
    }, timeoutMs);
  });
}

async function startTunnel() {
  const tunnelUrl = `http://127.0.0.1:${PORT}`;

  try {
    return await spawnTunnel(
      ['cloudflared', 'tunnel'],
      ['--url', tunnelUrl],
      'Cloudflare Tunnel',
      /https:\/\/[a-z0-9-]+\.trycloudflare\.com/
    );
  } catch (cloudflareErr) {
    console.log('');
    console.log(`  Cloudflare tunnel unavailable (${cloudflareErr.message}).`);
    console.log('  Trying localtunnel fallback...');
    console.log('');
    return spawnTunnel(
      ['localtunnel'],
      ['--port', String(PORT)],
      'localtunnel',
      /https?:\/\/[^\s]+/
    );
  }
}

function urlIsReachable(url, timeoutMs = 8000) {
  return new Promise(resolve => {
    let settled = false;
    const done = ok => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };
    try {
      const req = https.get(url, res => {
        res.resume();
        done(res.statusCode < 500);
      });
      req.setTimeout(timeoutMs, () => {
        req.destroy();
        done(false);
      });
      req.on('error', () => done(false));
    } catch (err) {
      done(false);
    }
  });
}

function request(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: urlPath,
        method,
        headers: payload
          ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
          : {}
      },
      res => {
        let raw = '';
        res.on('data', chunk => { raw += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, json: raw ? JSON.parse(raw) : null });
          } catch (err) {
            resolve({ status: res.statusCode, json: raw });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function resolveReviewUrl(publicBase) {
  const sessionRes = await request('GET', `/api/sessions/${DEFAULT_TOKEN}`);
  if (sessionRes.status === 200) {
    return `${publicBase}/?review=${DEFAULT_TOKEN}`;
  }
  const createRes = await request('POST', '/api/sessions', {
    title: 'Client review — live link',
    pagePath: '/'
  });
  if (createRes.status === 201 && createRes.json?.session?.token) {
    console.log('');
    console.log('  New review session created (default token was missing locally).');
    return `${publicBase}${createRes.json.session.pagePath}?review=${createRes.json.session.token}`;
  }
  return `${publicBase}/?review=${DEFAULT_TOKEN}`;
}

async function main() {
  console.log('');
  console.log('  GATHER.nexus — instant client link');
  console.log('  =================================');
  console.log('');

  let server = null;
  let tunnel = null;
  let ownsServer = false;
  let watchdogTimer = null;
  let restarting = false;
  let stopped = false;

  const shutdown = () => {
    stopped = true;
    if (watchdogTimer) clearInterval(watchdogTimer);
    if (tunnel?.child) tunnel.child.kill();
    if (ownsServer && server) server.kill();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  async function bringUpTunnel() {
    console.log('  Creating public internet link (Cloudflare Tunnel)...');
    tunnel = await startTunnel();
    const publicBase = tunnel.url.replace(/\/$/, '');

    // If the tunnel process dies unexpectedly (network blip, PC sleep, cloudflared
    // crash, etc.) the old script would just hang here forever with a dead link and
    // no indication anything was wrong. Detect that and self-heal automatically.
    tunnel.child.on('exit', code => {
      if (stopped || restarting) return;
      console.log('');
      console.log(`  ⚠ Tunnel process exited unexpectedly (code ${code}). Restarting tunnel...`);
      restartTunnel();
    });

    const reviewUrl = await resolveReviewUrl(publicBase);

    console.log('');
    console.log('  >>> SEND THIS LINK TO YOUR CLIENT <<<');
    console.log(`  ${reviewUrl}`);
    console.log('');
    console.log(`  Admin: ${publicBase}/admin/`);
    console.log('');
    console.log('  Keep this window open while the client reviews.');
    console.log('  Do not close it for 5–6 days if they need ongoing access.');
    console.log('  This window auto-heals the tunnel if it drops; watch for new links below.');
    console.log('  Press Ctrl+C to stop.');
    console.log('');

    return publicBase;
  }

  async function restartTunnel() {
    if (restarting || stopped) return;
    restarting = true;
    try {
      if (tunnel?.child) {
        tunnel.child.removeAllListeners('exit');
        tunnel.child.kill();
      }
    } catch (err) {
      // ignore
    }
    try {
      await bringUpTunnel();
    } catch (err) {
      console.error(`  Could not restart tunnel (${err.message}). Retrying in 15s...`);
      setTimeout(restartTunnel, 15000);
      restarting = false;
      return;
    }
    restarting = false;
  }

  function startWatchdog() {
    // Belt-and-braces check on top of the exit listener: some tunnel failures
    // (e.g. the trycloudflare edge dropping the route) leave the local cloudflared
    // process alive while the public URL stops responding. Poll it periodically
    // and restart if it goes dark.
    watchdogTimer = setInterval(async () => {
      if (stopped || restarting || !tunnel?.url) return;
      const ok = await urlIsReachable(tunnel.url.replace(/\/$/, '') + '/api/health');
      if (!ok) {
        console.log('');
        console.log('  ⚠ Public link stopped responding. Restarting tunnel...');
        restartTunnel();
      }
    }, 60000);
  }

  try {
    const alreadyRunning = await isServerRunning();
    if (alreadyRunning) {
      console.log(`  Reusing preview server already running on port ${PORT}.`);
      console.log('');
    } else {
      server = startServer();
      ownsServer = true;
      await waitForHealth();
    }

    const localReview = `http://localhost:${PORT}/?review=${DEFAULT_TOKEN}`;
    const localAdmin = `http://localhost:${PORT}/admin/`;

    console.log('  Local links (this PC):');
    console.log(`  ${localReview}`);
    console.log(`  ${localAdmin}`);
    console.log('');

    await bringUpTunnel();
    startWatchdog();

    await new Promise(() => {});
  } catch (err) {
    console.error('');
    console.error('  Could not create public link:', err.message);
    console.error('');
    console.error('  Fallback — same Wi-Fi only:');
    console.error(`  http://localhost:${PORT}/?review=${DEFAULT_TOKEN}`);
    console.error('  Run "ipconfig" and replace localhost with your IPv4 address.');
    console.error('');
    shutdown();
    process.exit(1);
  }
}

main();
