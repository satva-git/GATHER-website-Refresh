'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  OUT,
  prepareHtml,
  buildDocument,
  readTemplate,
  extractFragment,
  setPillarState,
  setNavDropdownOpen
} = require('./figma-shared');

const PAGES = [
  { src: 'HomePage.html', out: '01-homepage-desktop.html', mobile: '01-homepage-mobile.html', label: 'Homepage' },
  { src: path.join('modules', 'intercompany-control.html'), out: '02-intercompany-control-desktop.html', mobile: '02-intercompany-control-mobile.html', label: 'Intercompany Control' },
  { src: path.join('modules', 'group-reporting.html'), out: '03-group-reporting-desktop.html', mobile: '03-group-reporting-mobile.html', label: 'Group Reporting' },
  { src: path.join('modules', 'group-planning.html'), out: '04-group-planning-desktop.html', mobile: '04-group-planning-mobile.html', label: 'Group Planning' }
];

const PILLAR_LABELS = [
  'Reporting — Pillar 01',
  'Intercompany — Pillar 02',
  'Planning — Pillar 03'
];

function writeFile(name, content) {
  fs.writeFileSync(path.join(OUT, name), content, 'utf8');
  return name;
}

function extractNav(html) {
  return extractFragment(html, '<nav id="nav">', '</nav>');
}

function extractPillarsSection(html) {
  const start = html.indexOf('<!-- THREE PILLARS -->');
  const end = html.indexOf('<!-- 4 LEVELS — DATA INTEGRITY -->');
  if (start === -1 || end === -1) return '';
  return html.slice(start, end);
}

function extractSubpageNav() {
  const mod = fs.readFileSync(path.join(__dirname, '..', 'modules', 'intercompany-control.html'), 'utf8');
  return extractFragment(mod, '<header class="subpage-nav">', '</header>');
}

function buildNavExport(preparedHome, { dropdown = null } = {}) {
  let html = preparedHome;
  if (dropdown === 'modules') {
    html = setNavDropdownOpen(html);
  }
  const nav = extractNav(html);
  return buildDocument({
    title: dropdown ? `Nav — ${dropdown} dropdown open` : 'Nav — default',
    bodyClass: 'figma-export',
    body: `<div class="figma-canvas figma-canvas--narrow">${nav}<div style="height:120px"></div></div>`
  });
}

function buildPillarExport(preparedHome, index) {
  const section = extractPillarsSection(setPillarState(preparedHome, index));
  return buildDocument({
    title: `Three Pillars — ${PILLAR_LABELS[index]}`,
    bodyClass: 'figma-export',
    body: `<div class="figma-canvas">${section}</div>`
  });
}

function ensureOutDir() {
  if (!fs.existsSync(OUT)) {
    fs.mkdirSync(OUT, { recursive: true });
    return;
  }
  for (const file of fs.readdirSync(OUT)) {
    fs.unlinkSync(path.join(OUT, file));
  }
}

function writeExports() {
  ensureOutDir();
  const manifest = {
    generated: new Date().toISOString(),
    figmaFileName: 'GATHER.nexus — Website',
    pages: [],
    components: [],
    states: [],
    extras: []
  };

  for (const page of PAGES) {
    const desktop = prepareHtml(page.src, 'desktop');
    const mobile = prepareHtml(page.src, 'mobile');
    writeFile(page.out, desktop);
    writeFile(page.mobile, mobile);
    manifest.pages.push({
      label: page.label,
      desktop: page.out,
      mobile: page.mobile,
      figmaPage: `${page.label} — Desktop / Mobile`
    });
  }

  const preparedHome = prepareHtml('HomePage.html', 'desktop');

  writeFile('00-cover.html', buildDocument({
    title: 'GATHER.nexus — Cover',
    bodyClass: 'figma-export--cover',
    body: readTemplate('cover.html')
  }));
  manifest.extras.push({ label: 'Cover', file: '00-cover.html', figmaPage: '📄 Cover' });

  writeFile('05-components.html', buildDocument({
    title: 'GATHER.nexus — Components',
    bodyClass: 'figma-export--components',
    body: readTemplate('components.html')
  }));
  manifest.components.push({ label: 'Component library', file: '05-components.html', figmaPage: '📄 Components' });

  writeFile('06-nav-default.html', buildNavExport(preparedHome));
  manifest.states.push({ label: 'Nav — default', file: '06-nav-default.html', figmaPage: '📄 Components' });

  writeFile('07-nav-modules-open.html', buildNavExport(preparedHome, { dropdown: 'modules' }));
  manifest.states.push({ label: 'Nav — Modules dropdown open', file: '07-nav-modules-open.html', figmaPage: '📄 Components' });

  const subNav = extractSubpageNav();
  writeFile('08-subpage-nav.html', buildDocument({
    title: 'Subpage nav — module pages',
    bodyClass: 'figma-export',
    body: `<div class="figma-canvas figma-canvas--narrow">${subNav}<div style="height:80px"></div></div>`
  }));
  manifest.components.push({ label: 'Subpage navigation', file: '08-subpage-nav.html', figmaPage: '📄 Components' });

  PILLAR_LABELS.forEach((label, index) => {
    const file = `09-pillars-state-0${index + 1}.html`;
    writeFile(file, buildPillarExport(preparedHome, index));
    manifest.states.push({
      label: `Three Pillars — ${label}`,
      file,
      figmaPage: '📄 Homepage — States'
    });
  });

  writeFile('manifest.json', JSON.stringify(manifest, null, 2));
  return manifest;
}

function createZip() {
  const zipPath = path.join(OUT, 'gather-nexus-figma-import.zip');
  try {
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '${OUT}\\*' -DestinationPath '${zipPath}' -Force"`,
      { stdio: 'inherit' }
    );
    return zipPath;
  } catch {
    return null;
  }
}

const manifest = writeExports();
const zip = createZip();

console.log('');
console.log('  GATHER.nexus Figma export ready');
console.log('  --------------------------------');
console.log(`  Output folder: ${OUT}`);
console.log(`  Full pages:    ${manifest.pages.length} (desktop + mobile)`);
console.log(`  Components:    ${manifest.components.length}`);
console.log(`  States:        ${manifest.states.length}`);
console.log(`  Extras:        ${manifest.extras.length}`);
if (zip) console.log(`  Zip:           ${zip}`);
console.log('');
console.log('  Import guide:  figma/FIGMA-IMPORT.md');
console.log('  File layout:   figma/FILE-STRUCTURE.md');
console.log('  Components:    figma/COMPONENTS.md');
console.log('');
