'use strict';

/**
 * Collect all website assets and export high-quality PNG + WebP
 * into E:\Howard\New-Website-Updated\Images-&-Logo
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const OUT = path.join('E:', 'Howard', 'New-Website-Updated', 'Images-&-Logo');
const HTML = fs.readFileSync(path.join(ROOT, 'HomePage.html'), 'utf8');

const DIRS = {
  logos: path.join(OUT, '01-logos'),
  featured: path.join(OUT, '02-featured-press'),
  illustrations: path.join(OUT, '03-illustrations-workflows'),
  integrations: path.join(OUT, '04-integrations'),
  icons: path.join(OUT, '05-icons'),
  extras: path.join(OUT, '06-extras'),
};

for (const d of Object.values(DIRS)) fs.mkdirSync(d, { recursive: true });

const manifest = [];

async function writeBoth(buffer, dir, baseName, meta = {}) {
  const pngPath = path.join(dir, `${baseName}.png`);
  const webpPath = path.join(dir, `${baseName}.webp`);

  const pngBuf = await sharp(buffer)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
  const webpBuf = await sharp(buffer)
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toBuffer();

  fs.writeFileSync(pngPath, pngBuf);
  fs.writeFileSync(webpPath, webpBuf);

  const info = await sharp(buffer).metadata();
  const entry = {
    name: baseName,
    folder: path.basename(dir),
    width: info.width,
    height: info.height,
    pngBytes: pngBuf.length,
    webpBytes: webpBuf.length,
    ...meta,
  };
  manifest.push(entry);
  console.log(
    `✓ ${path.basename(dir)}/${baseName}  ${info.width}x${info.height}  png=${(pngBuf.length / 1024).toFixed(1)}KB  webp=${(webpBuf.length / 1024).toFixed(1)}KB`
  );
  return entry;
}

function parseDataUri(uri) {
  const m = uri.match(/^data:image\/([\w+.-]+);base64,(.+)$/);
  if (!m) throw new Error('Bad data URI');
  return Buffer.from(m[2], 'base64');
}

function extractFirst(re, label) {
  const m = HTML.match(re);
  if (!m) throw new Error(`Missing embedded asset: ${label}`);
  return parseDataUri(m[1]);
}

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return download(res.headers.location).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });
}

function pickBestSource(candidates) {
  // Prefer larger file size among existing candidates (usually higher quality)
  let best = null;
  let bestSize = -1;
  for (const rel of candidates) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const size = fs.statSync(abs).size;
    if (size > bestSize) {
      best = abs;
      bestSize = size;
    }
  }
  return best;
}

async function exportFromFile(absPath, dir, baseName, meta = {}) {
  const buf = fs.readFileSync(absPath);
  return writeBoth(buf, dir, baseName, {
    source: path.relative(ROOT, absPath).replace(/\\/g, '/'),
    ...meta,
  });
}

async function exportSvgIcon(svgMarkup, baseName, size = 256) {
  const svg = Buffer.from(svgMarkup, 'utf8');
  // Keep source SVG for vector use
  fs.writeFileSync(path.join(DIRS.icons, `${baseName}.svg`), svg);
  const raster = await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await writeBoth(raster, DIRS.icons, baseName, { type: 'icon', svgKept: true });
}

async function main() {
  console.log('Exporting website assets →', OUT);
  console.log('');

  // --- Logos (embedded) ---
  const navLogo = extractFirst(
    /class="nav-logo"[\s\S]*?<img src="(data:image\/[^"]+)"/,
    'nav-logo'
  );
  await writeBoth(navLogo, DIRS.logos, 'logo-gather-nexus-nav', {
    type: 'logo',
    usage: 'Header / navigation',
  });

  const footLogo = extractFirst(
    /class="foot-logo"[\s\S]*?<img src="(data:image\/[^"]+)"/,
    'foot-logo'
  );
  await writeBoth(footLogo, DIRS.logos, 'logo-gather-nexus-footer', {
    type: 'logo',
    usage: 'Footer',
  });

  // --- Hero (prefer largest of embedded vs disk) ---
  const heroEmbedded = extractFirst(
    /class="hero-img-wrap[^"]*"[\s\S]*?<img src="(data:image\/[^"]+)"/,
    'hero'
  );
  const diskHero = pickBestSource(['assets/images/hero-dashboard.png']);
  let heroBuf = heroEmbedded;
  let heroSource = 'HomePage.html data URI';
  if (diskHero) {
    const diskBuf = fs.readFileSync(diskHero);
    const embMeta = await sharp(heroEmbedded).metadata();
    const diskMeta = await sharp(diskBuf).metadata();
    if (
      (diskMeta.width || 0) * (diskMeta.height || 0) >=
      (embMeta.width || 0) * (embMeta.height || 0)
    ) {
      heroBuf = diskBuf;
      heroSource = 'assets/images/hero-dashboard.png';
    }
  }
  await writeBoth(heroBuf, DIRS.illustrations, 'hero-dashboard', {
    type: 'illustration',
    usage: 'Homepage hero product mockup',
    source: heroSource,
  });

  // --- Featured press logos ---
  const featuredBlock = HTML.match(/<div class="featured-logos">[\s\S]*?<\/div>/)?.[0] || '';
  const featuredUris = [...featuredBlock.matchAll(/src="(data:image\/[^"]+)"/g)].map((m) => m[1]);
  const featuredNames = [
    'featured-biweekly',
    'featured-accountingweb',
    'featured-digital-disruptors',
    'featured-accounting-tech-happenings',
    'featured-ifa',
  ];
  for (let i = 0; i < featuredNames.length; i++) {
    const name = featuredNames[i];
    let buf = null;
    let source = 'HomePage.html data URI';
    const disk = pickBestSource([
      `assets/images/${name}.webp`,
      `assets/images/${name}.png`,
      `assets/images/${name}.jpg`,
    ]);
    if (disk) {
      buf = fs.readFileSync(disk);
      source = path.relative(ROOT, disk).replace(/\\/g, '/');
    } else if (featuredUris[i]) {
      buf = parseDataUri(featuredUris[i]);
    }
    if (!buf) {
      console.warn(`! Missing featured logo: ${name}`);
      continue;
    }
    await writeBoth(buf, DIRS.featured, name, {
      type: 'featured-logo',
      usage: 'As featured in press strip',
      source,
    });
  }

  // --- Workflow / illustration images from disk (prefer PNG) ---
  const illustrations = [
    {
      name: 'illustration-the-problem',
      files: ['assets/images/the-problem.png', 'assets/images/the-problem.jpg'],
      usage: 'The Problem section diagram',
    },
    {
      name: 'illustration-the-solution',
      files: ['assets/images/the-solution.png'],
      usage: 'The Solution section (alt / archive)',
    },
    {
      name: 'illustration-the-solution-workflow',
      files: [
        'assets/images/the-solution-workflow.png',
        'assets/images/the-solution-workflow.jpg',
      ],
      usage: 'The Solution workflow diagram',
    },
    {
      name: 'illustration-intercompany-control-workflow',
      files: [
        'assets/images/intercompany-control-workflow.png',
        'assets/images/intercompany-control-workflow.jpg',
        'assets/images/intercompany-control-workflow-v2.png',
      ],
      usage: 'Intercompany Control workflow diagram',
    },
    {
      name: 'illustration-intercompany-control-workflow-v2',
      files: ['assets/images/intercompany-control-workflow-v2.png'],
      usage: 'Intercompany Control workflow (v2 variant)',
    },
    {
      name: 'illustration-group-reporting-workflow',
      files: [
        'assets/images/group-reporting-workflow.png',
        'assets/images/group-reporting-workflow.jpg',
      ],
      usage: 'Group Reporting workflow diagram',
    },
    {
      name: 'illustration-group-planning-workflow',
      files: ['assets/images/group-planning-workflow.png'],
      usage: 'Group Planning workflow diagram',
    },
  ];

  for (const item of illustrations) {
    const best = pickBestSource(item.files);
    if (!best) {
      console.warn(`! Missing illustration: ${item.name}`);
      continue;
    }
    await exportFromFile(best, DIRS.illustrations, item.name, {
      type: 'illustration',
      usage: item.usage,
    });
  }

  // --- Remote integrations strip ---
  const integrationsUrl =
    'https://gather.nexus/wp-content/uploads/2026/03/gather-nexus-integrations-xero-quickbooks-client-logos.webp';
  try {
    const buf = await download(integrationsUrl);
    await writeBoth(buf, DIRS.integrations, 'integrations-xero-quickbooks-client-logos', {
      type: 'integrations',
      usage: 'Trusted integrations / client logos strip',
      source: integrationsUrl,
    });
  } catch (err) {
    console.warn('! Could not download integrations strip:', err.message);
  }

  // --- Extra SVG illustration ---
  const settlementSvg = path.join(ROOT, 'settlement_cycles_saas.svg');
  if (fs.existsSync(settlementSvg)) {
    const svgBuf = fs.readFileSync(settlementSvg);
    fs.writeFileSync(path.join(DIRS.extras, 'illustration-settlement-cycles-saas.svg'), svgBuf);
    const raster = await sharp(svgBuf, { density: 300 }).png().toBuffer();
    await writeBoth(raster, DIRS.extras, 'illustration-settlement-cycles-saas', {
      type: 'illustration',
      usage: 'Settlement cycles SaaS diagram',
      source: 'settlement_cycles_saas.svg',
      svgKept: true,
    });
  }

  // --- UI icons (inline SVGs from hierarchy cards + social) ---
  const iconDefs = [
    {
      name: 'icon-tick-mark',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#2d7261" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    },
    {
      name: 'icon-hero-mod-tick-badge',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="17" fill="#e8f5f1" stroke="#2d7261" stroke-width="2.5"/><path d="M11 18.5l4 4L25 12.5" stroke="#2d7261" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    },
    {
      name: 'icon-check-badge',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="19" fill="#e8f5f1" stroke="#9dcec0" stroke-width="2"/><path d="M12 20.5l5 5L28 13.5" stroke="#2d7261" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    },
    {
      name: 'icon-pricing-tick',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.3l3 3L11.5 4" stroke="#2d7261" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    },
    {
      name: 'icon-consolidated-group-financials',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2d7261" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="13" width="4" height="8" rx="1"/><rect x="9.5" y="8" width="4" height="13" rx="1"/><rect x="17" y="4" width="4" height="17" rx="1"/><line x1="1" y1="22" x2="23" y2="22"/></svg>`,
    },
    {
      name: 'icon-eliminations-adjustments',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2d7261" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 10h4"/><path d="M10 8h4"/><path d="M18 12h4"/></svg>`,
    },
    {
      name: 'icon-legal-entity',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2d7261" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><path d="M5 22V8l7-5 7 5v14"/><rect x="9" y="13" width="6" height="9" rx="1"/></svg>`,
    },
    {
      name: 'icon-general-ledger',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2d7261" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    },
    {
      name: 'icon-transaction-level',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2d7261" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="7" y1="15.5" x2="17" y2="15.5"/><line x1="7" y1="19" x2="13" y2="19"/></svg>`,
    },
    {
      name: 'icon-faq-plus',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="#2d7261" stroke-width="2" stroke-linecap="round"/></svg>`,
    },
    {
      name: 'icon-social-linkedin',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.127 0 2.063 2.063 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    },
  ];

  // Also grab X / YouTube if present
  const socialSvgs = [
    ...HTML.matchAll(/aria-label="Visit our ([^"]+)"[\s\S]*?<svg[^>]*>([\s\S]*?)<\/svg>/g),
  ];
  for (const m of socialSvgs) {
    const label = m[1]
      .toLowerCase()
      .replace(/\s+page$/, '')
      .replace(/\(.*?\)/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (label === 'linkedin') continue; // already handled
    const inner = m[2];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#111">${inner}</svg>`;
    await exportSvgIcon(svg, `icon-social-${label}`);
  }

  for (const icon of iconDefs) {
    await exportSvgIcon(icon.svg, icon.name);
  }

  // --- Manifest + README ---
  const readme = `# GATHER.nexus — Website Asset Handover

Generated: ${new Date().toISOString()}
Source project: Refresh-Website (HomePage.html + assets/images)

## Folder structure

| Folder | Contents |
|--------|----------|
| \`01-logos\` | Brand logos (nav + footer) |
| \`02-featured-press\` | "As featured in" press logos |
| \`03-illustrations-workflows\` | Hero mockup + section workflow diagrams |
| \`04-integrations\` | Xero / QuickBooks / client logos strip |
| \`05-icons\` | UI icons (PNG + WebP + source SVG) |
| \`06-extras\` | Additional diagrams |

## Format policy

Every raster asset is exported as:
- **PNG** — lossless / high fidelity (preferred for logos & UI with transparency)
- **WebP** — quality 92, web-optimized

Icons also include the original **SVG** for crisp scaling.

## Asset index

${manifest
  .map(
    (a) =>
      `- **${a.name}** (${a.folder}) — ${a.width}×${a.height}px — ${a.usage || a.type || ''}`
  )
  .join('\n')}

## Notes for developers

1. Prefer **WebP** for page performance; keep **PNG** as fallback / design source.
2. Logos and featured marks should not be recolored except for approved brand treatments.
3. Workflow diagrams are full-bleed section art — do not crop logos out of them.
4. Hierarchy icons in \`05-icons\` match the 5-level drill-down cards on the homepage.
`;

  fs.writeFileSync(path.join(OUT, 'README.md'), readme);
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log('');
  console.log(`Done. ${manifest.length} assets → ${OUT}`);
  console.log('Wrote README.md and manifest.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
