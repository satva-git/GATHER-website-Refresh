'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'figma-export');
const EXT_CSS = fs.readFileSync(path.join(ROOT, 'assets', 'page-extensions.css'), 'utf8');

const FIGMA_OVERRIDES = `
<style id="figma-export-overrides">
.sr, .sr.in { opacity: 1 !important; transform: none !important; transition: none !important; }
html { scroll-behavior: auto; }
body.figma-export { min-width: 1440px; width: 1440px; margin: 0; background: var(--paper); }
body.figma-export--mobile { min-width: 390px; width: 390px; margin: 0; background: var(--paper); }
body.figma-export--components { min-width: 1440px; width: 1440px; margin: 0; background: var(--paper-2); padding: 48px 0 80px; }
body.figma-export--cover { min-width: 1440px; width: 1440px; height: 900px; margin: 0; }
#nav { position: relative !important; }
.subpage-nav { position: relative !important; }
.pillars-panel-content { display: none !important; }
.pillars-panel-content.is-active { display: block !important; animation: none !important; }
.figma-canvas { padding: 48px 56px; }
.figma-canvas--narrow { max-width: 920px; margin: 0 auto; padding: 48px 28px; }
.figma-section-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--text-muted); margin: 0 0 20px; padding-bottom: 12px; border-bottom: 1px solid var(--line);
}
.figma-component-row { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin-bottom: 40px; }
.figma-component-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; margin-bottom: 48px; }
.figma-component-stack { display: flex; flex-direction: column; gap: 16px; margin-bottom: 48px; }
.cover-page {
  min-height: 900px; display: flex; flex-direction: column; justify-content: space-between;
  background: linear-gradient(145deg, #0a1b30 0%, #1a2f4f 55%, #245a4e 100%); color: #fff; padding: 64px 72px;
}
.cover-brand { font-size: 42px; font-weight: 700; letter-spacing: -0.03em; }
.cover-brand span { color: #7ecfb8; }
.cover-meta { max-width: 640px; }
.cover-meta h1 { font-size: 56px; font-weight: 700; line-height: 1.08; letter-spacing: -0.03em; margin: 24px 0 16px; }
.cover-meta p { font-size: 20px; line-height: 1.55; color: rgba(255,255,255,0.72); margin: 0; }
.cover-tags { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 32px; }
.cover-tag {
  font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
  padding: 8px 14px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.22); color: rgba(255,255,255,0.88);
}
.cover-footer { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; font-size: 14px; color: rgba(255,255,255,0.55); }
.cover-swatches { display: flex; gap: 10px; }
.cover-swatch { width: 36px; height: 36px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.18); }
</style>
`;

let cachedHomeStyles = null;

function getHomeStyles() {
  if (cachedHomeStyles) return cachedHomeStyles;
  const html = fs.readFileSync(path.join(ROOT, 'HomePage.html'), 'utf8');
  const match = html.match(/<style>([\s\S]*?)<\/style>/);
  cachedHomeStyles = match ? match[1] : '';
  return cachedHomeStyles;
}

function extractFragment(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  if (start === -1) return '';
  const end = html.indexOf(endMarker, start + startMarker.length);
  if (end === -1) return html.slice(start);
  return html.slice(start, end + endMarker.length);
}

function setPillarState(html, index) {
  let out = html;
  out = out.replace(/class="pillars-nav-item is-active"/g, 'class="pillars-nav-item"');
  out = out.replace(/class="pillars-panel-content is-active"/g, 'class="pillars-panel-content"');
  out = out.replace(/class="pillars-dot is-active"/g, 'class="pillars-dot"');

  out = out.replace(
    new RegExp(`class="pillars-nav-item" data-pillar="${index}"`, 'g'),
    `class="pillars-nav-item is-active" data-pillar="${index}"`
  );
  out = out.replace(
    new RegExp(`class="pillars-panel-content" data-pillar-panel="${index}"`, 'g'),
    `class="pillars-panel-content is-active" data-pillar-panel="${index}"`
  );
  out = out.replace(
    new RegExp(`class="pillars-dot" aria-label="Pillar ${index + 1}"`, 'g'),
    `class="pillars-dot is-active" aria-label="Pillar ${index + 1}"`
  );

  out = out.replace(/class="pillars-arrow pillars-arrow--prev"([^>]*)disabled/g, 'class="pillars-arrow pillars-arrow--prev"$1');
  out = out.replace(/class="pillars-arrow pillars-arrow--next is-primary"/g, 'class="pillars-arrow pillars-arrow--next"');
  out = out.replace(/class="pillars-arrow pillars-arrow--next"([^>]*)disabled/g, 'class="pillars-arrow pillars-arrow--next"$1');
  out = out.replace(/class="pillars-arrow pillars-arrow--prev is-primary"/g, 'class="pillars-arrow pillars-arrow--prev"');

  if (index === 0) {
    out = out.replace(/class="pillars-arrow pillars-arrow--prev"/, 'class="pillars-arrow pillars-arrow--prev" disabled');
    out = out.replace(/class="pillars-arrow pillars-arrow--next"/, 'class="pillars-arrow pillars-arrow--next is-primary"');
  } else if (index === 2) {
    out = out.replace(/class="pillars-arrow pillars-arrow--next"/, 'class="pillars-arrow pillars-arrow--next" disabled');
    out = out.replace(/class="pillars-arrow pillars-arrow--prev"/, 'class="pillars-arrow pillars-arrow--prev is-primary"');
  } else {
    out = out.replace(/class="pillars-arrow pillars-arrow--prev"/, 'class="pillars-arrow pillars-arrow--prev is-primary"');
    out = out.replace(/class="pillars-arrow pillars-arrow--next"/, 'class="pillars-arrow pillars-arrow--next is-primary"');
  }

  return out;
}

function setNavDropdownOpen(html) {
  return html.replace(
    'class="nav-item--drop"',
    'class="nav-item--drop open"'
  ).replace(
    'aria-expanded="false"',
    'aria-expanded="true"'
  );
}

function prepareHtml(source, variant, options = {}) {
  const sourcePath = path.isAbsolute(source) ? source : path.join(ROOT, source);
  let html = fs.readFileSync(sourcePath, 'utf8');
  const isMobile = variant === 'mobile';
  const bodyClass = options.bodyClass || (isMobile ? 'figma-export--mobile' : 'figma-export');

  html = html.replace(/<link rel="stylesheet" href="\/assets\/page-extensions\.css"\/?>/g, '');
  html = html.replace(/<link rel="stylesheet" href="\/review\/review\.css"\/?>/g, '');
  html = html.replace(/<script src="\/assets\/page-extensions\.js"[^>]*><\/script>/g, '');
  html = html.replace(/<script src="\/review\/review\.js"[^>]*><\/script>/g, '');
  html = html.replace(/<script[\s\S]*?<\/script>/g, '');

  if (!html.includes('page-extensions-inlined')) {
    html = html.replace('</head>', `<style id="page-extensions-inlined">\n${EXT_CSS}\n</style>\n</head>`);
  }

  if (!html.includes('figma-export-overrides')) {
    html = html.replace('</head>', `${FIGMA_OVERRIDES}\n</head>`);
  }

  if (html.includes('<body id="top">')) {
    html = html.replace('<body id="top">', `<body id="top" class="${bodyClass}">`);
  } else if (html.match(/<body class="[^"]*">/)) {
    html = html.replace(/<body class="[^"]*">/, `<body class="${bodyClass}">`);
  } else if (html.includes('<body>')) {
    html = html.replace('<body>', `<body class="${bodyClass}">`);
  }

  const viewport = isMobile ? 'width=390,initial-scale=1.0' : 'width=1440,initial-scale=1.0';
  html = html.replace(
    /<meta name="viewport" content="[^"]*"\/>/,
    `<meta name="viewport" content="${viewport}"/>`
  );

  html = html.replace(/href="\/modules\//g, 'href="#');
  html = html.replace(/href="\//g, 'href="#');

  if (typeof options.pillarIndex === 'number') {
    html = setPillarState(html, options.pillarIndex);
  }

  if (options.navDropdownOpen) {
    html = setNavDropdownOpen(html);
  }

  return html;
}

function buildDocument({ title, bodyClass, body, variant = 'desktop' }) {
  const viewport = variant === 'mobile' ? 'width=390,initial-scale=1.0' : 'width=1440,initial-scale=1.0';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="${viewport}"/>
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
${getHomeStyles()}
</style>
<style id="page-extensions-inlined">
${EXT_CSS}
</style>
${FIGMA_OVERRIDES}
</head>
<body class="${bodyClass}">
${body}
</body>
</html>`;
}

function readTemplate(name) {
  return fs.readFileSync(path.join(ROOT, 'figma', 'templates', name), 'utf8');
}

module.exports = {
  ROOT,
  OUT,
  EXT_CSS,
  FIGMA_OVERRIDES,
  getHomeStyles,
  extractFragment,
  setPillarState,
  setNavDropdownOpen,
  prepareHtml,
  buildDocument,
  readTemplate
};
