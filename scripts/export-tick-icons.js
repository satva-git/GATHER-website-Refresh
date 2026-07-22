'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.join('E:', 'Howard', 'New-Website-Updated', 'Images-&-Logo', '05-icons');
const MANIFEST = path.join('E:', 'Howard', 'New-Website-Updated', 'Images-&-Logo', 'manifest.json');
const README = path.join('E:', 'Howard', 'New-Website-Updated', 'Images-&-Logo', 'README.md');

fs.mkdirSync(OUT, { recursive: true });

async function writeBoth(buffer, baseName) {
  const png = await sharp(buffer).png({ compressionLevel: 9 }).toBuffer();
  const webp = await sharp(buffer).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toBuffer();
  fs.writeFileSync(path.join(OUT, `${baseName}.png`), png);
  fs.writeFileSync(path.join(OUT, `${baseName}.webp`), webp);
  const meta = await sharp(buffer).metadata();
  console.log(
    `✓ ${baseName}  ${meta.width}x${meta.height}  png=${(png.length / 1024).toFixed(1)}KB  webp=${(webp.length / 1024).toFixed(1)}KB`
  );
  return meta;
}

async function exportSvg(svg, baseName, size = 256) {
  fs.writeFileSync(path.join(OUT, `${baseName}.svg`), svg);
  const raster = await sharp(Buffer.from(svg), { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return writeBoth(raster, baseName);
}

const icons = [
  {
    name: 'icon-tick-mark',
    usage: 'Hero module list tick (checkmark path only)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#2d7261" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    name: 'icon-hero-mod-tick-badge',
    usage: 'Hero module circular tick badge (::before on .hero-mod links like Intercompany Control)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="17" fill="#e8f5f1" stroke="#2d7261" stroke-width="2.5"/><path d="M11 18.5l4 4L25 12.5" stroke="#2d7261" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    name: 'icon-check-badge',
    usage: 'Journey/feature check badge (.check-ic)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="19" fill="#e8f5f1" stroke="#9dcec0" stroke-width="2"/><path d="M12 20.5l5 5L28 13.5" stroke="#2d7261" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    name: 'icon-pricing-tick',
    usage: 'Pricing feature list tick',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.3l3 3L11.5 4" stroke="#2d7261" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
];

(async () => {
  for (const icon of icons) {
    await exportSvg(icon.svg, icon.name);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  for (const icon of icons) {
    const entry = {
      name: icon.name,
      folder: '05-icons',
      width: 256,
      height: 256,
      usage: icon.usage,
      type: 'icon',
      svgKept: true,
    };
    const i = manifest.findIndex((m) => m.name === icon.name);
    if (i >= 0) manifest[i] = { ...manifest[i], ...entry };
    else manifest.push(entry);
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

  let readme = fs.readFileSync(README, 'utf8');
  const tickNote = `
## Tick / checkmark icons (added)

- \`icon-hero-mod-tick-badge\` — circular teal tick used beside hero module links (Intercompany Control, etc.)
- \`icon-tick-mark\` — checkmark path only
- \`icon-check-badge\` — journey/feature list check badge
- \`icon-pricing-tick\` — pricing plan feature ticks
`;
  if (!readme.includes('icon-hero-mod-tick-badge')) {
    readme += tickNote;
    fs.writeFileSync(README, readme);
  }

  console.log('Tick icons added to 05-icons/');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
