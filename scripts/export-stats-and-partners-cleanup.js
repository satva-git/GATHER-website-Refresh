'use strict';

/**
 * Cleanup pass:
 * - Rename mislabeled stats calendar icon
 * - Crop Xero / QuickBooks / Intuit partner marks from integrations sprite
 * - Export full 44x44 stats-bar badge composites (as shown on page)
 * - Remove junk partner exports
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.join('E:', 'Howard', 'New-Website-Updated', 'Images-&-Logo');
const ICONS = path.join(OUT, '05-icons');
const PARTNERS = path.join(OUT, '07-partner-logos');
const SPRITE = path.join(OUT, '04-integrations', 'integrations-xero-quickbooks-client-logos.png');
const MANIFEST = path.join(OUT, 'manifest.json');

fs.mkdirSync(PARTNERS, { recursive: true });

async function writeBoth(buffer, dir, baseName) {
  const png = await sharp(buffer).png({ compressionLevel: 9 }).toBuffer();
  const webp = await sharp(buffer).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toBuffer();
  fs.writeFileSync(path.join(dir, `${baseName}.png`), png);
  fs.writeFileSync(path.join(dir, `${baseName}.webp`), webp);
  const meta = await sharp(buffer).metadata();
  console.log(`✓ ${path.basename(dir)}/${baseName}  ${meta.width}x${meta.height}`);
  return meta;
}

async function exportSvg(svg, dir, baseName, size = 256) {
  if (!/xmlns=/.test(svg)) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  fs.writeFileSync(path.join(dir, `${baseName}.svg`), svg);
  const raster = await sharp(Buffer.from(svg), { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return writeBoth(raster, dir, baseName);
}

function renameIcon(from, to) {
  for (const ext of ['.png', '.webp', '.svg']) {
    const a = path.join(ICONS, from + ext);
    const b = path.join(ICONS, to + ext);
    if (fs.existsSync(a)) {
      fs.renameSync(a, b);
      console.log(`renamed ${from}${ext} → ${to}${ext}`);
    }
  }
}

(async () => {
  // 1) Fix calendar icon name
  renameIcon('icon-stat-ic', 'icon-stat-30-day-free-trial');

  // Ensure calendar SVG is correct (re-export from known path)
  await exportSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#2d7261" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    ICONS,
    'icon-stat-30-day-free-trial'
  );

  // 2) Full stats badges as rendered (44px card + icon)
  const stats = [
    {
      name: 'icon-stat-badge-multi-entity-teams',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88"><rect x="1" y="1" width="86" height="86" rx="20" fill="#ffffff" stroke="#9dcec0" stroke-width="2"/><g transform="translate(22 22)" stroke="#1f5c4d" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></g></svg>`,
    },
    {
      name: 'icon-stat-badge-30-day-free-trial',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88"><rect x="1" y="1" width="86" height="86" rx="20" fill="#ffffff" stroke="#9dcec0" stroke-width="2"/><g transform="translate(22 22)" stroke="#1f5c4d" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></g></svg>`,
    },
    {
      name: 'icon-stat-badge-1-click-integration',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88"><rect x="1" y="1" width="86" height="86" rx="20" fill="#ffffff" stroke="#9dcec0" stroke-width="2"/><g transform="translate(22 22)" stroke="#1f5c4d" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></g></svg>`,
    },
  ];
  for (const s of stats) await exportSvg(s.svg, ICONS, s.name);

  // 3) Crop partner logos from sprite (CSS background positions on 1345x700 image)
  // CSS: xero 115x50 at -251,-102; qb 218x50 at -365,-100; intuit 63x50 at -650,-100
  if (fs.existsSync(SPRITE)) {
    const crops = [
      { name: 'partner-xero-connected-app', left: 251, top: 102, width: 115, height: 50 },
      { name: 'partner-quickbooks', left: 365, top: 100, width: 218, height: 50 },
      { name: 'partner-intuit-app-partner-silver', left: 650, top: 100, width: 63, height: 50 },
    ];
    for (const c of crops) {
      // Export 2x for high-res web use
      const buf = await sharp(SPRITE)
        .extract({ left: c.left, top: c.top, width: c.width, height: c.height })
        .resize(c.width * 2, c.height * 2, { kernel: 'lanczos3' })
        .png()
        .toBuffer();
      await writeBoth(buf, PARTNERS, c.name);
    }
  } else {
    console.warn('Sprite PNG missing:', SPRITE);
  }

  // 4) Remove junk partner files
  for (const junk of [
    'partner-gather',
    'partner-svg-partner-logo-11',
    'partner-svg-partner-logo-12',
  ]) {
    for (const ext of ['.png', '.webp', '.svg']) {
      const p = path.join(PARTNERS, junk + ext);
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        console.log('removed', junk + ext);
      }
    }
  }

  // 5) Also export demo chevron clearly named
  await exportSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 14" fill="none"><path d="M2.5 2.5 7.5 7l-5 4.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    ICONS,
    'icon-demo-chevron'
  );
  await exportSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="#2d7261" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    ICONS,
    'icon-next-slide'
  );

  // Update manifest entries
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const updates = [
    { name: 'icon-stat-30-day-free-trial', folder: '05-icons', usage: 'Stats bar: 30-Day Free Trial calendar' },
    { name: 'icon-stat-badge-multi-entity-teams', folder: '05-icons', usage: 'Stats bar badge (full 44px card)' },
    { name: 'icon-stat-badge-30-day-free-trial', folder: '05-icons', usage: 'Stats bar badge (full 44px card)' },
    { name: 'icon-stat-badge-1-click-integration', folder: '05-icons', usage: 'Stats bar badge (full 44px card)' },
    { name: 'partner-xero-connected-app', folder: '07-partner-logos', usage: 'Hero partner: Xero Connected App' },
    { name: 'partner-quickbooks', folder: '07-partner-logos', usage: 'Hero partner: Intuit QuickBooks' },
    { name: 'partner-intuit-app-partner-silver', folder: '07-partner-logos', usage: 'Hero partner: Intuit App Partner Silver' },
    { name: 'icon-demo-chevron', folder: '05-icons', usage: 'Book a Demo button chevron' },
    { name: 'icon-next-slide', folder: '05-icons', usage: 'Journey next slide' },
  ];
  // Remove junk + old name from manifest
  const cleaned = manifest.filter(
    (m) =>
      ![
        'icon-stat-ic',
        'partner-gather',
        'partner-svg-partner-logo-11',
        'partner-svg-partner-logo-12',
      ].includes(m.name)
  );
  for (const u of updates) {
    const i = cleaned.findIndex((m) => m.name === u.name);
    if (i >= 0) cleaned[i] = { ...cleaned[i], ...u };
    else cleaned.push(u);
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(cleaned, null, 2));

  // Patch audit report
  const auditPath = path.join(OUT, 'AUDIT-REPORT.md');
  let audit = fs.readFileSync(auditPath, 'utf8');
  audit = audit.replace('icon-stat-ic', 'icon-stat-30-day-free-trial');
  audit += `\n\n## Cleanup pass\n- Renamed calendar icon to icon-stat-30-day-free-trial\n- Added full stats badges\n- Cropped Xero / QuickBooks / Intuit partner logos\n- Added icon-demo-chevron + icon-next-slide\n`;
  fs.writeFileSync(auditPath, audit);

  console.log('\nCleanup complete.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
