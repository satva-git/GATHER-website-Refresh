'use strict';

/**
 * Export all Knowledge Centre page images/icons/graphics as WebP at 1x and 2x.
 * Output: E:\Howard\Knowledge-Centre\Images\{1x,2x}\
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const KC_DIR = path.join(ROOT, 'knowledge-centre');
const OUT = path.join('E:', 'Howard', 'Knowledge-Centre', 'Images');
const OUT_1X = path.join(OUT, '1x');
const OUT_2X = path.join(OUT, '2x');

const COLORS = {
  ink: '#0a1b30',
  teal: '#2d7261',
  tealDeep: '#245a4e',
  tealTint: '#e9f2ef',
  tealLine: '#c5ddd6',
  textMuted: '#7787a0',
  line: '#e2e8f0',
  white: '#ffffff',
  stepFinalBg: '#e3f0ec',
  stepFinalBorder: '#b8d5cb',
};

for (const dir of [OUT_1X, OUT_2X]) fs.mkdirSync(dir, { recursive: true });

const manifest = [];

function stepBadgeSvg(num, final = false) {
  const bg = final ? COLORS.stepFinalBg : COLORS.tealTint;
  const border = final ? COLORS.stepFinalBorder : COLORS.tealLine;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
  <circle cx="15" cy="15" r="14.5" fill="${bg}" stroke="${border}"/>
  <text x="15" y="15.5" text-anchor="middle" dominant-baseline="middle" fill="${COLORS.ink}" font-family="Instrument Sans, Arial, sans-serif" font-size="12" font-weight="700">${num}</text>
</svg>`;
}

function stepsRowSvg() {
  const badges = Array.from({ length: 7 }, (_, i) => {
    const x = i * 38;
    const final = i === 6;
    const bg = final ? COLORS.stepFinalBg : COLORS.tealTint;
    const border = final ? COLORS.stepFinalBorder : COLORS.tealLine;
    return `<g transform="translate(${x},0)">
      <circle cx="15" cy="15" r="14.5" fill="${bg}" stroke="${border}"/>
      <text x="15" y="15.5" text-anchor="middle" dominant-baseline="middle" fill="${COLORS.ink}" font-family="Instrument Sans, Arial, sans-serif" font-size="12" font-weight="700">${i + 1}</text>
    </g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="258" height="30" viewBox="0 0 258 30" fill="none">${badges}</svg>`;
}

/** Fully styled KC UI icons as rendered on-page. */
const STYLED_ICONS = [
  {
    name: 'icon-kc-meta-sections',
    width: 15,
    height: 15,
    pages: ['intercompany-control.html'],
    description: 'Library item metadata — sections count (e.g. 8 sections)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M3 3.5h10v9H5.5A2.5 2.5 0 0 1 3 10V3.5z" stroke="${COLORS.textMuted}" stroke-width="1.4"/>
      <path d="M6 6h5M6 8.5h4" stroke="${COLORS.textMuted}" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`,
  },
  {
    name: 'icon-kc-meta-process-tables',
    width: 15,
    height: 15,
    pages: ['intercompany-control.html'],
    description: 'Library item metadata — process tables count (e.g. 4 process tables)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="3" width="4.5" height="10" rx="1" stroke="${COLORS.textMuted}" stroke-width="1.4"/>
      <rect x="9" y="3" width="4.5" height="10" rx="1" stroke="${COLORS.textMuted}" stroke-width="1.4"/>
    </svg>`,
  },
  {
    name: 'icon-kc-meta-questions',
    width: 15,
    height: 15,
    pages: ['intercompany-control.html'],
    description: 'Library item metadata — questions count (e.g. 30 questions)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M3 3.5h10v9H5.5A2.5 2.5 0 0 1 3 10V3.5z" stroke="${COLORS.textMuted}" stroke-width="1.4"/>
      <path d="M6 6h5M6 8.5h4" stroke="${COLORS.textMuted}" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`,
  },
  {
    name: 'icon-kc-read-action',
    width: 58,
    height: 16,
    pages: ['intercompany-control.html'],
    description: 'Library item Read action with arrow',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="58" height="16" viewBox="0 0 58 16" fill="none">
      <text x="0" y="12.5" fill="${COLORS.textMuted}" font-family="Instrument Sans, Arial, sans-serif" font-size="14" font-weight="600">Read</text>
      <path d="M40 8h10M45 4l4 4-4 4" stroke="${COLORS.textMuted}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    name: 'icon-kc-read-arrow',
    width: 16,
    height: 16,
    pages: ['intercompany-control.html'],
    description: 'Read action arrow only',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="${COLORS.textMuted}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    name: 'icon-kc-checklist-question',
    width: 28,
    height: 28,
    pages: ['intercompany-control-transfer-pricing.html'],
    description: 'Finance control checklist question mark badge',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13.5" fill="${COLORS.tealTint}" stroke="${COLORS.tealLine}"/>
      <text x="14" y="14.5" text-anchor="middle" dominant-baseline="middle" fill="${COLORS.tealDeep}" font-family="Instrument Sans, Arial, sans-serif" font-size="14" font-weight="700">?</text>
    </svg>`,
  },
  ...Array.from({ length: 7 }, (_, i) => ({
    name: `icon-kc-step-${String(i + 1).padStart(2, '0')}`,
    width: 30,
    height: 30,
    pages: ['intercompany-control-transfer-pricing.html'],
    description: `Workflow step badge ${i + 1}`,
    svg: stepBadgeSvg(i + 1, i === 6),
  })),
  {
    name: 'icon-kc-steps-row',
    width: 258,
    height: 30,
    pages: ['intercompany-control-transfer-pricing.html'],
    description: 'Workflow steps 1–7 badge row',
    svg: stepsRowSvg(),
  },
  {
    name: 'icon-kc-faq-expand-collapsed',
    width: 32,
    height: 32,
    pages: ['intercompany-control-faqs.html'],
    description: 'FAQ accordion collapsed plus button',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="${COLORS.tealTint}"/>
      <path d="M16 9.5v13M9.5 16h13" stroke="${COLORS.tealDeep}" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
  {
    name: 'icon-kc-faq-expand-open',
    width: 32,
    height: 32,
    pages: ['intercompany-control-faqs.html'],
    description: 'FAQ accordion expanded close button',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="${COLORS.teal}"/>
      <g transform="translate(16 16) rotate(45) translate(-16 -16)">
        <path d="M16 9.5v13M9.5 16h13" stroke="${COLORS.white}" stroke-width="2" stroke-linecap="round"/>
      </g>
    </svg>`,
  },
  {
    name: 'icon-kc-flow-arrow',
    width: 14,
    height: 14,
    pages: ['intercompany-control-manual-vs-automated.html'],
    description: 'Manual workflow flow arrow',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <text x="1" y="11" fill="${COLORS.textMuted}" font-family="Instrument Sans, Arial, sans-serif" font-size="14" font-weight="400">→</text>
    </svg>`,
  },
  {
    name: 'icon-kc-flow-step-chip',
    width: 132,
    height: 33,
    pages: ['intercompany-control-manual-vs-automated.html'],
    description: 'Manual workflow flow step chip (sample)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="132" height="33" viewBox="0 0 132 33" fill="none">
      <rect x="0.5" y="0.5" width="131" height="32" rx="6" fill="${COLORS.white}" stroke="${COLORS.line}"/>
      <text x="11" y="21" fill="${COLORS.ink}" font-family="Instrument Sans, Arial, sans-serif" font-size="13" font-weight="600">Xero / QuickBooks</text>
    </svg>`,
  },
  {
    name: 'icon-kc-calc-op-plus',
    width: 28,
    height: 28,
    pages: ['intercompany-control-transfer-pricing.html'],
    description: 'Cost-plus calculation plus operator',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
      <text x="14" y="19" text-anchor="middle" fill="${COLORS.textMuted}" font-family="Instrument Sans, Arial, sans-serif" font-size="18" font-weight="600">+</text>
    </svg>`,
  },
  {
    name: 'icon-kc-calc-op-equals',
    width: 28,
    height: 28,
    pages: ['intercompany-control-transfer-pricing.html'],
    description: 'Cost-plus calculation equals operator',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
      <text x="14" y="19" text-anchor="middle" fill="${COLORS.tealDeep}" font-family="Instrument Sans, Arial, sans-serif" font-size="20" font-weight="600">=</text>
    </svg>`,
  },
  {
    name: 'icon-kc-calc-item',
    width: 120,
    height: 88,
    pages: ['intercompany-control-transfer-pricing.html'],
    description: 'Cost-plus calculation value box',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="88" viewBox="0 0 120 88" fill="none">
      <rect x="0.5" y="0.5" width="119" height="87" rx="10" fill="#f7f9fc" stroke="${COLORS.line}"/>
      <text x="16" y="28" fill="${COLORS.textMuted}" font-family="Instrument Sans, Arial, sans-serif" font-size="11" font-weight="600" letter-spacing="0.04em">COST BASE</text>
      <text x="16" y="58" fill="${COLORS.ink}" font-family="Instrument Sans, Arial, sans-serif" font-size="24" font-weight="700">£50,000</text>
    </svg>`,
  },
  {
    name: 'icon-kc-calc-row',
    width: 560,
    height: 88,
    pages: ['intercompany-control-transfer-pricing.html'],
    description: 'Cost-plus calculation row with operators',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="88" viewBox="0 0 560 88" fill="none">
      <rect x="0.5" y="0.5" width="119" height="87" rx="10" fill="#f7f9fc" stroke="${COLORS.line}"/>
      <text x="16" y="58" fill="${COLORS.ink}" font-family="Instrument Sans, Arial, sans-serif" font-size="22" font-weight="700">£50,000</text>
      <text x="148" y="54" fill="${COLORS.textMuted}" font-family="Instrument Sans, Arial, sans-serif" font-size="18" font-weight="600">+</text>
      <rect x="176.5" y="0.5" width="119" height="87" rx="10" fill="#f7f9fc" stroke="${COLORS.line}"/>
      <text x="192" y="58" fill="${COLORS.ink}" font-family="Instrument Sans, Arial, sans-serif" font-size="22" font-weight="700">£2,500</text>
      <text x="324" y="54" fill="${COLORS.tealDeep}" font-family="Instrument Sans, Arial, sans-serif" font-size="20" font-weight="600">=</text>
      <rect x="352.5" y="0.5" width="207" height="87" rx="10" fill="${COLORS.tealTint}" stroke="${COLORS.tealLine}"/>
      <text x="368" y="58" fill="${COLORS.tealDeep}" font-family="Instrument Sans, Arial, sans-serif" font-size="22" font-weight="700">£52,500</text>
    </svg>`,
  },
  {
    name: 'icon-kc-toc-document',
    width: 16,
    height: 16,
    pages: ['intercompany-control-transfer-pricing.html'],
    description: 'Table of contents / worked example document icon',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 2.5h8v11H4z" stroke="${COLORS.tealDeep}" stroke-width="1.4"/>
      <path d="M6 5.5h5M6 8h4M6 10.5h3" stroke="${COLORS.tealDeep}" stroke-width="1.4" stroke-linecap="round"/>
    </svg>`,
  },
  {
    name: 'icon-kc-resource-go',
    width: 16,
    height: 16,
    pages: [
      'intercompany-control-manual-vs-automated.html',
      'intercompany-control-transfer-pricing.html',
      'intercompany-control-faqs.html',
    ],
    description: 'Related resource link arrow',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 14 14" fill="none">
      <path d="M3 7h8M8 3l4 4-4 4" stroke="${COLORS.teal}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    name: 'icon-social-linkedin',
    width: 24,
    height: 24,
    pages: ['all'],
    description: 'Footer LinkedIn icon',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="${COLORS.ink}" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.127 0 2.063 2.063 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  },
  {
    name: 'icon-social-x',
    width: 24,
    height: 24,
    pages: ['all'],
    description: 'Footer X (Twitter) icon',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="${COLORS.ink}" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  },
];

function collectFileAssets() {
  const htmlFiles = fs.readdirSync(KC_DIR).filter((f) => f.endsWith('.html'));
  const assets = new Map();

  for (const file of htmlFiles) {
    const html = fs.readFileSync(path.join(KC_DIR, file), 'utf8');
    const imgRe = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = imgRe.exec(html)) !== null) {
      const tag = match[0];
      const src = match[1];
      if (src.startsWith('http') || src.startsWith('data:')) continue;

      const rel = src.replace(/^\.\.\//, '');
      const abs = path.join(ROOT, rel);
      if (!fs.existsSync(abs)) {
        console.warn(`Missing asset referenced in ${file}: ${src}`);
        continue;
      }

      const widthM = tag.match(/\bwidth=["']?(\d+)/i);
      const heightM = tag.match(/\bheight=["']?(\d+)/i);
      const key = rel.toLowerCase();

      if (!assets.has(key)) {
        assets.set(key, {
          name: path.basename(rel, path.extname(rel)),
          source: abs,
          rel,
          width: widthM ? Number(widthM[1]) : null,
          height: heightM ? Number(heightM[1]) : null,
          pages: new Set(),
          type: 'file',
        });
      }
      assets.get(key).pages.add(file);
    }
  }

  return assets;
}

async function exportWebp(buffer, name, width, height, meta = {}) {
  const scales = [
    { dir: OUT_1X, suffix: '1x', w: width, h: height },
    { dir: OUT_2X, suffix: '2x', w: width * 2, h: height * 2 },
  ];

  for (const scale of scales) {
    const outPath = path.join(scale.dir, `${name}.webp`);
    await sharp(buffer)
      .resize(scale.w, scale.h, { fit: 'fill' })
      .webp({ quality: 92, alphaQuality: 100, effort: 6 })
      .toFile(outPath);

    const stat = fs.statSync(outPath);
    manifest.push({
      file: `${scale.suffix}/${name}.webp`,
      width: scale.w,
      height: scale.h,
      bytes: stat.size,
      ...meta,
    });
    console.log(`✓ ${scale.suffix}/${name}.webp  ${scale.w}x${scale.h}  ${(stat.size / 1024).toFixed(1)}KB`);
  }
}

async function exportFileAsset(asset) {
  let width = asset.width;
  let height = asset.height;

  if (!width || !height) {
    const meta = await sharp(asset.source).metadata();
    width = meta.width;
    height = meta.height;
  }

  const input = fs.readFileSync(asset.source);
  await exportWebp(input, asset.name, width, height, {
    source: asset.rel,
    pages: [...asset.pages].sort(),
    type: 'file',
  });
}

async function exportStyledIcon(asset) {
  const buf = Buffer.from(asset.svg, 'utf8');
  await exportWebp(buf, asset.name, asset.width, asset.height, {
    source: 'styled-svg',
    description: asset.description,
    pages: asset.pages,
    type: 'icon',
  });
}

async function main() {
  const kcPages = fs.readdirSync(KC_DIR).filter((f) => f.endsWith('.html'));
  console.log(`Knowledge Centre pages: ${kcPages.length}`);
  console.log(`Output: ${OUT}\n`);

  const fileAssets = collectFileAssets();
  console.log(`File assets: ${fileAssets.size}`);
  for (const asset of fileAssets.values()) {
    await exportFileAsset(asset);
  }

  console.log(`\nStyled UI icons: ${STYLED_ICONS.length}`);
  for (const asset of STYLED_ICONS) {
    await exportStyledIcon(asset);
  }

  const manifestPath = path.join(OUT, 'manifest.json');
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        pages: kcPages.sort(),
        totalAssets: fileAssets.size + STYLED_ICONS.length,
        files: manifest,
      },
      null,
      2
    )
  );

  console.log(`\nManifest: ${manifestPath}`);
  console.log(
    `Done — ${manifest.length} WebP files written (${fileAssets.size + STYLED_ICONS.length} assets × 2 scales).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
