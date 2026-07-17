'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

for (const file of ['HomePage.html', 'index.html']) {
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');

  const gatherMarker = '<!-- THE GATHER DIFFERENCE -->';
  const gatherStart = html.indexOf(gatherMarker);
  if (gatherStart === -1) throw new Error(`gather-difference block not found in ${file}`);

  const sectionClose = html.indexOf('\n</section>', gatherStart);
  if (sectionClose === -1) throw new Error(`platform section close not found in ${file}`);

  const gatherBlock = html.slice(gatherStart, sectionClose).replace(/\s+$/, '');

  const pillarsStart = html.indexOf('<div class="pillars-section" id="three-pillars">');
  const pillarsEnd = html.indexOf('<!-- 4 LEVELS: DATA INTEGRITY -->', pillarsStart);
  if (pillarsStart === -1 || pillarsEnd === -1) {
    throw new Error(`three-pillars block not found in ${file}`);
  }

  html = html.slice(0, pillarsStart) + gatherBlock + '\n\n\n  ' + html.slice(pillarsEnd);

  const dupStart = html.indexOf(gatherMarker, pillarsStart + gatherBlock.length);
  if (dupStart === -1) throw new Error(`duplicate gather block not found in ${file}`);

  const dupSectionClose = html.indexOf('\n</section>', dupStart);
  html = html.slice(0, dupStart) + html.slice(dupSectionClose);

  html = html.replace('<li><a href="#three-pillars">Three Pillars</a></li>\n          ', '');
  html = html.replace('#three-pillars,', '');

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Updated ${file}`);
}
