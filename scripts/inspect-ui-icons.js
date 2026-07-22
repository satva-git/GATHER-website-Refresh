'use strict';

/** Rename generic icon-ui-* files to meaningful names based on SVG content / context. */
const fs = require('fs');
const path = require('path');

const ICONS = path.join('E:', 'Howard', 'New-Website-Updated', 'Images-&-Logo', '05-icons');
const MANIFEST = path.join('E:', 'Howard', 'New-Website-Updated', 'Images-&-Logo', 'manifest.json');

const rules = [
  { from: 'icon-ui-1', to: 'icon-nav-logo-mark', test: (s) => s.includes('viewBox') && s.length < 500 && /path/i.test(s) },
  { from: 'icon-ui-2', to: 'icon-gather-diff-spine', test: () => true },
  { from: 'icon-ui-3', to: 'icon-integrations-box-1', test: () => true },
  { from: 'icon-ui-4', to: 'icon-integrations-box-2', test: () => true },
  { from: 'icon-ui-5', to: 'icon-pricing-badge', test: () => true },
  { from: 'icon-ui-6', to: 'icon-footer-social-extra', test: () => true },
  { from: 'icon-ui-7', to: 'icon-footer-link-1', test: () => true },
  { from: 'icon-ui-8', to: 'icon-footer-link-2', test: () => true },
  { from: 'icon-ui-9', to: 'icon-multichannel-illustration', test: () => true },
  { from: 'icon-ui-10', to: 'icon-deductions-fees-illustration', test: () => true },
  { from: 'icon-journey-pagination', to: 'icon-previous-chevron-alt', test: () => true },
];

// Better: inspect each icon-ui SVG and print fingerprints so we can rename accurately
const files = fs.readdirSync(ICONS).filter((f) => f.startsWith('icon-ui-') && f.endsWith('.svg'));
for (const f of files) {
  const svg = fs.readFileSync(path.join(ICONS, f), 'utf8').replace(/\s+/g, ' ');
  console.log(f, 'len=' + svg.length, svg.slice(0, 180));
}

const renameMap = {
  'icon-ui-1': null, // inspect first
};

// Read and classify
for (const f of files) {
  const base = f.replace(/\.svg$/, '');
  const svg = fs.readFileSync(path.join(ICONS, f), 'utf8');
  let to = null;
  if (svg.includes('btn-demo') || svg.includes('2.5 2.5 7.5 7')) to = 'icon-demo-chevron-pair';
  else if (svg.includes('M18.244') || svg.includes('twitter') || /M\d+.*18\.244/.test(svg)) to = null;
  else if (svg.includes('gather-diff') || svg.length < 200 && svg.includes('circle')) to = 'icon-section-divider-dot';
  else if (svg.includes('pt-badge') || svg.includes('Most Popular') || /star|badge/i.test(svg)) to = 'icon-pricing-popular-badge';
  else if (svg.includes('int-box')) to = null;
  // Heuristics by unique path fragments from homepage
  if (svg.includes('M12 2') && svg.includes('shield')) to = 'icon-security-shield';
  if (svg.includes('youtube') || svg.includes('Youtube') || svg.includes('M10 15l5-3-5-3')) to = 'icon-social-youtube';
  if (svg.includes('M22.54') || svg.includes('youtube.com')) to = 'icon-social-youtube';
  console.log('classify', base, '=>', to || '(keep for manual)');
}
