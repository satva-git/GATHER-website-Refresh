'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.join('E:', 'Howard', 'New-Website-Updated', 'Images-&-Logo', '05-icons');
const BOXED = path.join(OUT, 'stats-bar-with-box');
fs.mkdirSync(BOXED, { recursive: true });

const icons = [
  {
    name: 'stat-box-multi-entity-teams',
    inner: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
  },
  {
    name: 'stat-box-30-day-free-trial',
    inner: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`,
  },
  {
    name: 'stat-box-1-click-integration',
    inner: `<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>`,
  },
];

async function writeBoth(buf, dir, name) {
  const png = await sharp(buf).png({ compressionLevel: 9 }).toBuffer();
  const webp = await sharp(buf).webp({ quality: 95, alphaQuality: 100, effort: 6 }).toBuffer();
  fs.writeFileSync(path.join(dir, `${name}.png`), png);
  fs.writeFileSync(path.join(dir, `${name}.webp`), webp);
  const m = await sharp(buf).metadata();
  console.log('OK', path.basename(dir) + '/' + name, m.width + 'x' + m.height);
}

(async () => {
  for (const icon of icons) {
    // Match .stat-ic exactly: 44px box, radius 10, border #c5ddd6, 22px icon centered
    // Export at 8x (352px) for crisp web use
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="352" height="352" viewBox="0 0 44 44" fill="none">
  <defs>
    <filter id="s" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="rgb(45,114,97)" flood-opacity="0.08"/>
    </filter>
  </defs>
  <rect x="0.5" y="0.5" width="43" height="43" rx="10" fill="#ffffff" stroke="#c5ddd6" stroke-width="1" filter="url(#s)"/>
  <g transform="translate(11 11)" stroke="#245a4e" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
    ${icon.inner}
  </g>
</svg>`;

    fs.writeFileSync(path.join(BOXED, `${icon.name}.svg`), svg);
    const buf = await sharp(Buffer.from(svg), { density: 384 }).png().toBuffer();

    await writeBoth(buf, BOXED, icon.name);
    await writeBoth(buf, OUT, `icon-${icon.name}`);
    await writeBoth(buf, OUT, `icon-${icon.name.replace('stat-box', 'stat-badge')}`);
  }

  console.log('\nBoxed stats icons ready in:');
  console.log(BOXED);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
