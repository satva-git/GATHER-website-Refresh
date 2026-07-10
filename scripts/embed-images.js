const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'HomePage.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const images = [
  'assets/images/gather-logo.png',
  'assets/images/hero-briefcase.png',
  'assets/images/gather-nexus-logo.png',
  'assets/images/the-problem.jpg',
  'assets/images/intercompany-control-workflow.jpg',
  'assets/images/group-reporting-workflow.jpg',
  'assets/images/group-planning-workflow.png',
  'assets/images/the-solution-workflow.jpg',
  'assets/images/featured-biweekly.webp',
  'assets/images/featured-accountingweb.webp',
  'assets/images/featured-digital-disruptors.webp',
  'assets/images/featured-accounting-tech-happenings.webp',
];

function mimeFor(rel) {
  const ext = path.extname(rel).toLowerCase();
  if (ext === '.webp') return 'image/webp';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.svg') return 'image/svg+xml';
  return 'image/png';
}

for (const rel of images) {
  const filePath = path.join(root, rel);
  const buf = fs.readFileSync(filePath);
  const uri = `data:${mimeFor(rel)};base64,${buf.toString('base64')}`;
  const needle = `src="${rel}"`;
  const count = html.split(needle).length - 1;
  html = html.split(needle).join(`src="${uri}"`);
  console.log(`${rel}: embedded (${buf.length} bytes, ${count} ref(s))`);
}

fs.writeFileSync(htmlPath, html);
fs.copyFileSync(htmlPath, path.join(root, 'index.html'));
const kb = (fs.statSync(htmlPath).size / 1024).toFixed(1);
console.log(`Updated HomePage.html and index.html (${kb} KB)`);
