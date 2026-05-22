import { spawn } from 'child_process';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 3000);
const DEFAULT_TOKEN = 'ade20793493210f2321bfbf8cc64278a';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

function startTunnel() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.platform === 'win32' ? 'npx.cmd' : 'npx',
      ['--yes', 'localtunnel', '--port', String(PORT)],
      { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], shell: true }
    );

    let output = '';
    const onData = chunk => {
      output += chunk.toString();
      const match = output.match(/https?:\/\/[^\s]+/);
      if (match) resolve({ child, url: match[0].replace(/[^\w:/.?=&%-]+$/, '') });
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('error', reject);
    child.on('exit', code => {
      if (!output.includes('http')) {
        reject(new Error(`Tunnel exited (${code}). Output: ${output}`));
      }
    });

    setTimeout(() => reject(new Error('Tunnel timed out')), 90000);
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

async function main() {
  console.log('');
  console.log('  GATHER.nexus — instant client link');
  console.log('  =================================');
  console.log('');

  const server = startServer();
  let tunnel = null;

  const shutdown = () => {
    if (tunnel?.child) tunnel.child.kill();
    server.kill();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  try {
    await waitForHealth();
    const localReview = `http://localhost:${PORT}/?review=${DEFAULT_TOKEN}`;
    const localAdmin = `http://localhost:${PORT}/admin/`;

    console.log('  Local links (this PC):');
    console.log(`  ${localReview}`);
    console.log(`  ${localAdmin}`);
    console.log('');

    console.log('  Creating public internet link (localtunnel)...');
    tunnel = await startTunnel();
    const publicBase = tunnel.url.replace(/\/$/, '');
    process.env.PUBLIC_BASE_URL = publicBase;

    const sessionRes = await request('GET', `/api/sessions/${DEFAULT_TOKEN}`);
    let reviewUrl = `${publicBase}/?review=${DEFAULT_TOKEN}`;

    if (sessionRes.status !== 200) {
      const createRes = await request('POST', '/api/sessions', {
        title: 'Client review — live link',
        pagePath: '/'
      });
      if (createRes.status === 201 && createRes.json?.session?.token) {
        reviewUrl = `${publicBase}${createRes.json.session.pagePath}?review=${createRes.json.session.token}`;
        console.log('');
        console.log('  New review session created (Azure token was missing locally).');
      }
    }

    console.log('');
    console.log('  >>> SEND THIS LINK TO YOUR CLIENT <<<');
    console.log(`  ${reviewUrl}`);
    console.log('');
    console.log(`  Admin: ${publicBase}/admin/`);
    console.log('');
    console.log('  Keep this window open while the client reviews.');
    console.log('  Press Ctrl+C to stop.');
    console.log('');

    await new Promise(() => {});
  } catch (err) {
    console.error('');
    console.error('  Could not create public link:', err.message);
    console.error('');
    console.error('  Fallback — use on same Wi-Fi:');
    console.error(`  http://localhost:${PORT}/?review=${DEFAULT_TOKEN}`);
    console.error('  Run "ipconfig" and replace localhost with your IPv4 address.');
    console.error('');
    shutdown();
    process.exit(1);
  }
}

main();
