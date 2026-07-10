'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'HomePage.html'), 'utf8');
const outDir = path.join(ROOT, 'assets', 'images');
fs.mkdirSync(outDir, { recursive: true });

function writeDataUri(uri, filename) {
  const m = uri.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!m) throw new Error('Bad data URI for ' + filename);
  const out = path.join(outDir, filename);
  fs.writeFileSync(out, Buffer.from(m[2], 'base64'));
  console.log(filename, fs.statSync(out).size);
}

function extractWfImg(sectionId, filename) {
  const re = new RegExp(
    'id="' + sectionId + '"[\\s\\S]*?<img class="wf-problem-img" src="(data:image/[^"]+)"',
    'i'
  );
  const match = html.match(re);
  if (!match) {
    console.error('MISSING section', sectionId);
    return;
  }
  writeDataUri(match[1], filename);
}

const heroMatch = html.match(
  /hero-img-wrap sr[\s\S]*?<img src="(data:image\/[^"]+)"/
);
if (heroMatch) writeDataUri(heroMatch[1], 'hero-dashboard.png');

extractWfImg('the-problem', 'the-problem.jpg');
extractWfImg('the-solution', 'the-solution.png');
extractWfImg('intercompany-control', 'intercompany-control-workflow.jpg');
extractWfImg('group-reporting', 'group-reporting-workflow.png');
extractWfImg('group-planning', 'group-planning-workflow.png');

const featuredBlock = html.match(/<div class="featured-logos">[\s\S]*?<\/div>/)?.[0] || '';
const featured = [...featuredBlock.matchAll(/src="(data:image\/webp;base64,[^"]+)"/g)];
const featuredNames = [
  'featured-biweekly.webp',
  'featured-accountingweb.webp',
  'featured-digital-disruptors.webp',
  'featured-accounting-tech-happenings.webp',
];
featured.forEach((m, i) => {
  if (featuredNames[i]) writeDataUri(m[1], featuredNames[i]);
});
