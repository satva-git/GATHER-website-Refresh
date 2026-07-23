'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.join('E:', 'Satva-Work', 'Howard', 'New-Website', 'Website-Refresh-Images');
fs.mkdirSync(OUT, { recursive: true });

// CSS (.btn .a): 14×14. 2× of project icon base (128) → 256×256.
const outW = 256;
const outH = 256;

// Primary CTA arrow (Find out more / Free Trial) — white on transparent.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${outW}" height="${outH}" viewBox="0 0 14 14" fill="none">
  <path d="M3 7h8M8 3l4 4-4 4" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const baseName = 'icon-arrow-cta@2x';

(async () => {
  const raster = await sharp(Buffer.from(svg), { density: 300 })
    .resize(outW, outH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const png = await sharp(raster).png({ compressionLevel: 9 }).toBuffer();
  const webp = await sharp(raster).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toBuffer();

  fs.writeFileSync(path.join(OUT, `${baseName}.png`), png);
  fs.writeFileSync(path.join(OUT, `${baseName}.webp`), webp);
  fs.writeFileSync(path.join(OUT, 'icon-arrow-cta.svg'), svg);

  const meta = await sharp(raster).metadata();
  console.log(`✓ ${baseName}`);
  console.log(`  size: ${meta.width}x${meta.height}`);
  console.log(`  png:  ${(png.length / 1024).toFixed(2)} KB`);
  console.log(`  webp: ${(webp.length / 1024).toFixed(2)} KB`);
  console.log(`  out:  ${OUT}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
