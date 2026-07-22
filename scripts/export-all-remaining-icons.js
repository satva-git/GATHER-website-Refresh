'use strict';

/**
 * Full-site asset audit + export of ALL remaining icons/SVGs.
 * Scans every prepared HTML/CSS page and exports unique visual icons
 * that are not yet in Images-&-Logo.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const OUT_ROOT = path.join('E:', 'Howard', 'New-Website-Updated', 'Images-&-Logo');
const OUT_ICONS = path.join(OUT_ROOT, '05-icons');
const OUT_PARTNERS = path.join(OUT_ROOT, '07-partner-logos');
const MANIFEST_PATH = path.join(OUT_ROOT, 'manifest.json');
const README_PATH = path.join(OUT_ROOT, 'README.md');

fs.mkdirSync(OUT_ICONS, { recursive: true });
fs.mkdirSync(OUT_PARTNERS, { recursive: true });

const PAGES = [
  'HomePage.html',
  'index.html',
  'modules/intercompany-control.html',
  'modules/group-reporting.html',
  'modules/group-planning.html',
  'multichannel_revenue_fragmentation.html',
  'deductions_fees_illustration.html',
  'assets/page-extensions.css',
];

function normalizeSvg(svg) {
  let s = svg.trim();
  // Ensure xmlns for sharp
  if (!/xmlns=/.test(s)) {
    s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  // Prefer brand teal when currentColor
  s = s.replace(/stroke="currentColor"/g, 'stroke="#2d7261"');
  s = s.replace(/fill="currentColor"/g, 'fill="#2d7261"');
  return s;
}

function fingerprint(svg) {
  const paths = (svg.match(/\bd="[^"]+"/g) || []).join('|');
  const shapes = (svg.match(/<(circle|rect|line|polyline|polygon|path|ellipse)\b[^>]*>/gi) || [])
    .map((t) => t.replace(/\s+/g, ' '))
    .join('|');
  return (paths || shapes || svg.replace(/\s+/g, ' ').slice(0, 200)).slice(0, 500);
}

function decodeDataUriSvg(uri) {
  // data:image/svg+xml,%3Csvg... or data:image/svg+xml;utf8,<svg...
  let raw = uri;
  if (raw.startsWith('data:image/svg+xml,')) {
    raw = decodeURIComponent(raw.slice('data:image/svg+xml,'.length));
  } else if (raw.startsWith('data:image/svg+xml;utf8,')) {
    raw = decodeURIComponent(raw.slice('data:image/svg+xml;utf8,'.length));
  } else if (raw.startsWith('data:image/svg+xml;charset=utf-8,')) {
    raw = decodeURIComponent(raw.slice('data:image/svg+xml;charset=utf-8,'.length));
  } else {
    return null;
  }
  // Strip wrapping quotes if any
  raw = raw.replace(/^["']|["']$/g, '');
  if (!raw.includes('<svg')) return null;
  return raw;
}

function contextLabel(html, index) {
  const before = html.slice(Math.max(0, index - 180), index);
  const after = html.slice(index, Math.min(html.length, index + 120));
  const classMatch = before.match(/class="([^"]+)"[^>]*>\s*$/) || before.match(/class="([^"]*(?:ic|icon|stat|btn|faq|mod|check)[^"]*)"/);
  const aria = after.match(/aria-label="([^"]+)"/) || before.match(/aria-label="([^"]+)"/);
  const title = after.match(/<div class="n">([\s\S]*?)<\/div>/) || before.match(/stat-text[\s\S]*?<div class="n">([\s\S]*?)<\/div>/);
  return {
    className: classMatch ? classMatch[1] : '',
    aria: aria ? aria[1] : '',
    nearbyText: title ? title[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60) : '',
  };
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

async function writeBoth(buffer, dir, baseName) {
  const png = await sharp(buffer).png({ compressionLevel: 9 }).toBuffer();
  const webp = await sharp(buffer).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toBuffer();
  fs.writeFileSync(path.join(dir, `${baseName}.png`), png);
  fs.writeFileSync(path.join(dir, `${baseName}.webp`), webp);
  const meta = await sharp(buffer).metadata();
  console.log(
    `✓ ${path.basename(dir)}/${baseName}  ${meta.width}x${meta.height}  png=${(png.length / 1024).toFixed(1)}KB  webp=${(webp.length / 1024).toFixed(1)}KB`
  );
  return meta;
}

async function exportSvg(svg, dir, baseName, size = 256) {
  const normalized = normalizeSvg(svg);
  fs.writeFileSync(path.join(dir, `${baseName}.svg`), normalized);
  try {
    const raster = await sharp(Buffer.from(normalized), { density: 384 })
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    await writeBoth(raster, dir, baseName);
    return true;
  } catch (err) {
    console.warn(`! Failed raster ${baseName}:`, err.message);
    return false;
  }
}

// Already-exported icon names (avoid overwriting named curated set unnecessarily,
// but we still add missing ones with new names)
const EXISTING = new Set(
  fs
    .readdirSync(OUT_ICONS)
    .filter((f) => f.endsWith('.png'))
    .map((f) => f.replace(/\.png$/, ''))
);

// Curated naming for known homepage icons by fingerprint of path data
const CURATED = [
  {
    name: 'icon-stat-multi-entity-teams',
    usage: 'Stats bar: Built for multi-entity Finance teams',
    match: (fp) => fp.includes('M16 21v-2a4 4 0 0 0-4-4H6') && fp.includes('M22 21v-2a4 4 0 0 0-3-3.87'),
  },
  {
    name: 'icon-stat-30-day-free-trial',
    usage: 'Stats bar: 30-Day Free Trial calendar',
    match: (fp) => fp.includes('M16 2') && fp.includes('M8 2') && fp.includes('M3 10'),
  },
  {
    name: 'icon-stat-1-click-integration',
    usage: 'Stats bar: 1-Click Integration checklist',
    match: (fp) => fp.includes('9 11 12 14 22 4') || fp.includes('points="9 11 12 14 22 4"'),
  },
  {
    name: 'icon-arrow-cta',
    usage: 'Primary CTA arrow (Find out more)',
    match: (fp) => fp.includes('M3 7h8M8 3l4 4-4 4') || (fp.includes('M3 7h8') && fp.includes('M8 3l4 4-4 4')),
  },
  {
    name: 'icon-chevron-down',
    usage: 'Dropdown / select chevron',
    match: (fp) => fp.includes("M1 1l4 4 4-4") || fp.includes('M1 1l4 4 4-4'),
  },
  {
    name: 'icon-tick-mark',
    usage: 'Checkmark path (hero + journey)',
    match: (fp) =>
      (fp.includes('M1 4L3.5 6.5L9 1') || fp.includes('M1 4l2.5 2.5L9 1')) && !fp.includes('circle'),
  },
  {
    name: 'icon-pricing-tick',
    usage: 'Pricing feature tick',
    match: (fp) => fp.includes('M2.5 7.3l3 3L11.5 4'),
  },
  {
    name: 'icon-faq-plus',
    usage: 'FAQ expand plus',
    match: (fp) => fp.includes('M7 2v10M2 7h10') && fp.includes('viewBox="0 0 14 14"') === false
      ? fp.includes('M7 2v10M2 7h10')
      : fp.includes('M7 2v10M2 7h10'),
  },
  {
    name: 'icon-consolidated-group-financials',
    usage: 'Hierarchy card 01',
    match: (fp) => fp.includes('x="2" y="13"') && fp.includes('x="9.5" y="8"') && fp.includes('x="17" y="4"'),
  },
  {
    name: 'icon-eliminations-adjustments',
    usage: 'Hierarchy card 02',
    match: (fp) => fp.includes('M4 21v-7') && fp.includes('M12 21v-9') && fp.includes('M20 21v-5'),
  },
  {
    name: 'icon-legal-entity',
    usage: 'Hierarchy card 03',
    match: (fp) => fp.includes('M5 22V8l7-5 7 5v14'),
  },
  {
    name: 'icon-general-ledger',
    usage: 'Hierarchy card 04',
    match: (fp) => fp.includes('M2 3h6a4 4 0 0 1 4 4v14') && fp.includes('M22 3h-6a4 4 0 0 0-4 4v14'),
  },
  {
    name: 'icon-transaction-level',
    usage: 'Hierarchy card 05',
    match: (fp) => fp.includes('M14 2H6a2 2 0 0 0-2 2v16') && fp.includes('14 2 14 8 20 8'),
  },
  {
    name: 'icon-social-linkedin',
    usage: 'Footer LinkedIn',
    match: (fp) => fp.includes('M20.447 20.452h-3.554'),
  },
  {
    name: 'icon-social-x',
    usage: 'Footer X / Twitter',
    match: (fp) => fp.includes('M18.244 2.25h3.308l-7.227') || (fp.includes('18.244') && fp.includes('2.25')),
  },
];

async function main() {
  const found = new Map(); // fingerprint -> { svg, sources: [], contexts: [] }

  for (const rel of PAGES) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      console.warn('Missing page:', rel);
      continue;
    }
    const html = fs.readFileSync(abs, 'utf8');

    // Inline SVGs
    const re = /<svg\b[\s\S]*?<\/svg>/gi;
    let m;
    while ((m = re.exec(html))) {
      const svg = m[0];
      // Skip huge decorative SVGs that are full illustrations (>8KB text) — handle separately if needed
      if (svg.length > 12000) {
        const fp = 'LARGE:' + fingerprint(svg).slice(0, 80);
        if (!found.has(fp)) {
          found.set(fp, {
            svg,
            sources: [rel],
            contexts: [{ large: true }],
            large: true,
          });
        } else {
          found.get(fp).sources.push(rel);
        }
        continue;
      }
      const fp = fingerprint(svg);
      const ctx = contextLabel(html, m.index);
      if (!found.has(fp)) {
        found.set(fp, { svg, sources: [rel], contexts: [ctx] });
      } else {
        const entry = found.get(fp);
        if (!entry.sources.includes(rel)) entry.sources.push(rel);
        entry.contexts.push(ctx);
      }
    }

    // CSS / background data URI SVGs
    const dataRe = /url\(["']?(data:image\/svg\+xml[^"')]+)["']?\)/gi;
    while ((m = dataRe.exec(html))) {
      const decoded = decodeDataUriSvg(m[1]);
      if (!decoded) continue;
      const fp = fingerprint(decoded);
      if (!found.has(fp)) {
        found.set(fp, {
          svg: decoded,
          sources: [rel],
          contexts: [{ className: 'css-background', aria: '', nearbyText: '' }],
        });
      } else {
        const entry = found.get(fp);
        if (!entry.sources.includes(rel)) entry.sources.push(rel);
      }
    }
  }

  console.log(`\nFound ${found.size} unique SVG assets across pages.\n`);

  const manifest = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
    : [];
  const exported = [];
  let autoIdx = 1;

  for (const [fp, entry] of found) {
    if (entry.large) {
      // Export large SVGs to extras as source + raster if reasonable
      const extrasDir = path.join(OUT_ROOT, '06-extras');
      fs.mkdirSync(extrasDir, { recursive: true });
      const name = `illustration-inline-${autoIdx++}`;
      fs.writeFileSync(path.join(extrasDir, `${name}.svg`), normalizeSvg(entry.svg));
      console.log(`~ kept large SVG source: 06-extras/${name}.svg (from ${entry.sources.join(', ')})`);
      exported.push({ name, folder: '06-extras', usage: 'Large inline SVG illustration', sources: entry.sources });
      continue;
    }

    let name = null;
    let usage = '';
    for (const c of CURATED) {
      if (c.match(fp) || c.match(entry.svg)) {
        name = c.name;
        usage = c.usage;
        break;
      }
    }

    if (!name) {
      const ctx = entry.contexts[0] || {};
      const hint =
        slugify(ctx.nearbyText) ||
        slugify(ctx.aria) ||
        slugify((ctx.className || '').split(/\s+/).find((c) => /ic|icon|stat|faq|check|btn|mod/.test(c))) ||
        `ui-${autoIdx++}`;
      name = hint.startsWith('icon-') ? hint : `icon-${hint}`;
      // Avoid collisions
      let final = name;
      let n = 2;
      while (EXISTING.has(final) || exported.some((e) => e.name === final) || fs.existsSync(path.join(OUT_ICONS, `${final}.png`))) {
        // If curated already exported this name, skip duplicate content under same name
        if (EXISTING.has(final) && CURATED.some((c) => c.name === final)) {
          final = null;
          break;
        }
        final = `${name}-${n++}`;
      }
      if (!final) {
        console.log(`= already present: ${name}`);
        continue;
      }
      name = final;
      usage =
        ctx.nearbyText ||
        ctx.aria ||
        `UI icon from ${entry.sources[0]}${ctx.className ? ' (' + ctx.className + ')' : ''}`;
    } else if (EXISTING.has(name) && fs.existsSync(path.join(OUT_ICONS, `${name}.png`))) {
      // Re-export curated ones that were previously missing or to refresh
      // Stats icons were missing — always write curated names
    }

    const ok = await exportSvg(entry.svg, OUT_ICONS, name);
    if (!ok) continue;
    EXISTING.add(name);
    exported.push({
      name,
      folder: '05-icons',
      width: 256,
      height: 256,
      usage,
      type: 'icon',
      svgKept: true,
      sources: entry.sources,
    });
  }

  // Partner logos in hero (Xero / QuickBooks) if present as img or svg
  const home = fs.readFileSync(path.join(ROOT, 'HomePage.html'), 'utf8');
  const partnerBlock = home.match(/hero-partners[\s\S]*?<\/ul>/);
  if (partnerBlock) {
    const imgs = [...partnerBlock[0].matchAll(/<img[^>]+>/gi)];
    let pi = 0;
    for (const im of imgs) {
      const tag = im[0];
      const src = (tag.match(/src="([^"]+)"/) || [])[1];
      const alt = (tag.match(/alt="([^"]*)"/) || [])[1] || `partner-${++pi}`;
      if (!src) continue;
      const base = `partner-${slugify(alt) || pi}`;
      if (src.startsWith('data:image')) {
        const m = src.match(/^data:image\/([\w+.-]+);base64,(.+)$/);
        if (!m) continue;
        const buf = Buffer.from(m[2], 'base64');
        await writeBoth(buf, OUT_PARTNERS, base);
        exported.push({
          name: base,
          folder: '07-partner-logos',
          usage: `Hero partner logo: ${alt}`,
          type: 'logo',
        });
      } else if (src.startsWith('http')) {
        // skip remote unless critical
      }
    }
    // Also inline SVG partners
    const pSvgs = [...partnerBlock[0].matchAll(/<svg\b[\s\S]*?<\/svg>/gi)];
    for (const sm of pSvgs) {
      const altHint = 'partner-logo';
      const name = `partner-svg-${slugify(altHint)}-${autoIdx++}`;
      await exportSvg(sm[0], OUT_PARTNERS, name);
      exported.push({ name, folder: '07-partner-logos', usage: 'Hero partner SVG', type: 'logo' });
    }
  }

  // Merge manifest
  for (const e of exported) {
    const i = manifest.findIndex((m) => m.name === e.name);
    if (i >= 0) manifest[i] = { ...manifest[i], ...e };
    else manifest.push(e);
  }
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  // Audit report
  const report = `# Full icon/SVG audit

Generated: ${new Date().toISOString()}

## Pages scanned
${PAGES.map((p) => `- ${p}`).join('\n')}

## Unique SVGs found
${found.size}

## Newly exported / refreshed this run
${exported.map((e) => `- **${e.name}** (${e.folder}) — ${e.usage}`).join('\n') || '(none)'}

## Stats bar icons (requested)
- icon-stat-multi-entity-teams
- icon-stat-30-day-free-trial
- icon-stat-1-click-integration
`;

  fs.writeFileSync(path.join(OUT_ROOT, 'AUDIT-REPORT.md'), report);

  let readme = fs.readFileSync(README_PATH, 'utf8');
  if (!readme.includes('07-partner-logos')) {
    readme += `

## Additional folders

| Folder | Contents |
|--------|----------|
| \`07-partner-logos\` | Xero / QuickBooks / hero partner marks |
| \`05-icons\` | All UI icons including stats-bar, ticks, hierarchy, social, CTA arrows |

See \`AUDIT-REPORT.md\` for the full cross-page scan.
`;
    fs.writeFileSync(README_PATH, readme);
  }

  console.log(`\nDone. Exported/refreshed ${exported.length} assets.`);
  console.log('Wrote AUDIT-REPORT.md');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
