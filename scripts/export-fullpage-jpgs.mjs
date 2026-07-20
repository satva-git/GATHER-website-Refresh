'use strict';

/**
 * Full-page high-resolution JPG exports for client / Figma review.
 *
 * Usage:
 *   node scripts/export-fullpage-jpgs.mjs
 *   node scripts/export-fullpage-jpgs.mjs --base https://gather-nexus-review.onrender.com
 *   node scripts/export-fullpage-jpgs.mjs --scale 3 --width 1440
 */

import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'exports', 'fullpage-jpgs');

const PAGES = [
  { slug: '01-homepage', path: '/index.html', label: 'Homepage' },
  { slug: '02-intercompany-control', path: '/modules/intercompany-control.html', label: 'Intercompany Control' },
  { slug: '03-group-reporting', path: '/modules/group-reporting.html', label: 'Group Financial Reporting' },
  { slug: '04-group-planning', path: '/modules/group-planning.html', label: 'Group Financial Planning' }
];

function parseArgs(argv) {
  const args = {
    base: process.env.SCREENSHOT_BASE || 'https://gather-nexus-review.onrender.com',
    width: 1440,
    scale: 2,
    quality: 92,
    mobile: false
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--base') args.base = argv[++i];
    else if (a === '--width') args.width = Number(argv[++i]);
    else if (a === '--scale') args.scale = Number(argv[++i]);
    else if (a === '--quality') args.quality = Number(argv[++i]);
    else if (a === '--mobile') args.mobile = true;
    else if (a === '--local') args.base = 'http://127.0.0.1:3000';
  }
  return args;
}

function ensureOutDir() {
  fs.mkdirSync(OUT, { recursive: true });
}

async function loadPlaywright() {
  try {
    return require('playwright');
  } catch {
    console.log('Installing playwright (chromium)…');
    await run('npm', ['install', '--no-save', 'playwright@1.49.1']);
    await run('npx', ['playwright', 'install', 'chromium']);
    return require('playwright');
  }
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function preparePage(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }
      html { scroll-behavior: auto !important; }
      /* Avoid sticky/fixed chrome repeating in full-page stitch */
      [style*="position: sticky"],
      [style*="position:sticky"],
      .sticky, header, nav, .subpage-nav, #nav {
        position: relative !important;
        top: auto !important;
      }
      /* Hide review overlay chrome if present */
      #rv-root, .rv-panel, .rv-toast, .rv-pin, [data-rv-ui] {
        display: none !important;
      }
    `
  });

  // Force lazy images / backgrounds to load by scrolling through the page.
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const height = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
    const step = Math.max(400, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y < height; y += step) {
      window.scrollTo(0, y);
      await sleep(80);
    }
    window.scrollTo(0, 0);
    await sleep(200);

    document.querySelectorAll('img').forEach((img) => {
      if (img.loading === 'lazy') img.loading = 'eager';
      if (img.decoding) img.decoding = 'sync';
    });
  });

  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 500));
}

async function captureOne(browser, base, pageDef, opts) {
  const url = new URL(pageDef.path, base).toString();
  const context = await browser.newContext({
    viewport: { width: opts.width, height: 900 },
    deviceScaleFactor: opts.scale,
    colorScheme: 'light'
  });
  const page = await context.newPage();
  console.log(`  Capturing ${pageDef.label}…`);
  console.log(`    ${url}`);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await preparePage(page);

  const metrics = await page.evaluate(() => ({
    scrollHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
    width: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth)
  }));

  const file = path.join(OUT, `${pageDef.slug}@${opts.width}w-${opts.scale}x.jpg`);
  await page.screenshot({
    path: file,
    type: 'jpeg',
    quality: opts.quality,
    fullPage: true,
    animations: 'disabled'
  });

  const stat = fs.statSync(file);
  console.log(
    `    ✓ ${path.basename(file)}  (${(stat.size / 1024 / 1024).toFixed(2)} MB, ~${metrics.scrollHeight}px tall @ ${opts.scale}x)`
  );

  await context.close();
  return { file, ...metrics, label: pageDef.label };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  ensureOutDir();

  console.log('');
  console.log('  Full-page JPG export');
  console.log('  --------------------');
  console.log(`  Base:    ${args.base}`);
  console.log(`  Width:   ${args.width}px`);
  console.log(`  Scale:   ${args.scale}x  → effective ${args.width * args.scale}px wide`);
  console.log(`  Quality: ${args.quality}`);
  console.log(`  Output:  ${OUT}`);
  console.log('');

  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ headless: true });

  const results = [];
  try {
    for (const pageDef of PAGES) {
      results.push(await captureOne(browser, args.base, pageDef, args));
    }

    if (args.mobile) {
      const mobileOpts = { ...args, width: 390, scale: Math.max(2, args.scale) };
      for (const pageDef of PAGES) {
        const mobileDef = {
          ...pageDef,
          slug: pageDef.slug.replace(/^\d+-/, (m) => m) + '-mobile',
          label: `${pageDef.label} (mobile)`
        };
        // cleaner slug
        mobileDef.slug = pageDef.slug + '-mobile';
        results.push(await captureOne(browser, args.base, mobileDef, mobileOpts));
      }
    }
  } finally {
    await browser.close();
  }

  const manifest = {
    generated: new Date().toISOString(),
    base: args.base,
    width: args.width,
    scale: args.scale,
    quality: args.quality,
    files: results.map((r) => ({
      label: r.label,
      file: path.basename(r.file),
      scrollHeight: r.scrollHeight
    }))
  };
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log('');
  console.log(`  Done — ${results.length} JPG(s) in:`);
  console.log(`  ${OUT}`);
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
