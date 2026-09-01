const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const indexPath = path.join(root, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

function sliceBetween(src, startNeedle, endNeedle) {
  const start = src.indexOf(startNeedle);
  if (start < 0) throw new Error('Missing start marker: ' + startNeedle);
  const commentStart = src.lastIndexOf('/*', start);
  const end = src.indexOf(endNeedle, start + startNeedle.length);
  if (end < 0) throw new Error('Missing end marker: ' + endNeedle);
  const commentEnd = src.lastIndexOf('/*', end);
  return src.slice(commentStart, commentEnd);
}

const navCss = sliceBetween(indexHtml, '   NAV', '   HERO').trim();

const skipCss = `#nav button{
  font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;
}`;

const navMedia = `@media (max-width:1180px){
  :root{--nav-link-gap:clamp(8px,1vw,16px)}
  .nav-link--caps{font-size:12.5px}
}
@media (max-width:980px){
  .nav-inner{grid-template-columns:1fr auto}
  .nav-center{display:none}
}`;

const sharedNavCss = `/* ============================================================
   SHARED SITE NAV (same header as homepage)
============================================================ */
:root{
  --nav-gutter:    clamp(20px, 4.5vw, 80px);
  --nav-gap:       clamp(16px, 2.5vw, 40px);
  --nav-link-gap:  clamp(10px, 1.4vw, 24px);
}
${skipCss}

${navCss}

${navMedia}
`;

const cssPath = path.join(root, 'assets', 'page-extensions.css');
let css = fs.readFileSync(cssPath, 'utf8');
const cssMarker = 'SHARED SITE NAV (same header as homepage)';
if (!css.includes(cssMarker)) {
  css = css.replace(
    '.subpage-nav {',
    sharedNavCss + '\n/* Legacy subpage-nav kept for any remaining uses */\n.subpage-nav {'
  );
  fs.writeFileSync(cssPath, css);
  console.log('Updated page-extensions.css with homepage nav styles');
} else {
  console.log('page-extensions.css already has shared nav styles');
}

const navJs = `
  /* Homepage-matching site nav */
  var siteNav = document.getElementById('nav');
  var navProgress = document.getElementById('nav-progress');
  if (siteNav && !siteNav.dataset.navBound) {
    siteNav.dataset.navBound = '1';
    window.addEventListener('scroll', function () {
      siteNav.classList.toggle('stuck', window.scrollY > 40);
      if (navProgress) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        var pct = h > 0 ? (window.scrollY / h) * 100 : 0;
        navProgress.style.width = pct + '%';
      }
    }, { passive: true });

    function closeNavDrops(except) {
      siteNav.querySelectorAll('.nav-item--drop').forEach(function (item) {
        if (except && item === except) return;
        item.classList.remove('open', 'is-closing');
        var t = item.querySelector('.nav-drop-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }

    siteNav.querySelectorAll('.nav-item--drop').forEach(function (item) {
      var trigger = item.querySelector('.nav-drop-trigger');
      var menu = item.querySelector('.nav-drop');
      if (!trigger || !menu) return;
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var visuallyOpen = item.classList.contains('open') ||
          (!item.classList.contains('is-closing') && getComputedStyle(menu).visibility !== 'hidden');
        closeNavDrops();
        if (visuallyOpen) {
          item.classList.add('is-closing');
          trigger.setAttribute('aria-expanded', 'false');
          trigger.blur();
        } else {
          item.classList.remove('is-closing');
          item.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
      item.addEventListener('mouseleave', function () {
        item.classList.remove('is-closing');
      });
    });

    document.addEventListener('click', function () {
      closeNavDrops();
    });
    siteNav.querySelectorAll('.nav-drop').forEach(function (menu) {
      menu.addEventListener('click', function (e) { e.stopPropagation(); });
    });
  }
`;

const jsPath = path.join(root, 'assets', 'page-extensions.js');
let js = fs.readFileSync(jsPath, 'utf8');
if (!js.includes('Homepage-matching site nav')) {
  if (!js.trimEnd().endsWith('})();')) {
    throw new Error('Unexpected page-extensions.js ending');
  }
  js = js.replace(/\}\)\(\);\s*$/, navJs + '})();\n');
  fs.writeFileSync(jsPath, js);
  console.log('Updated page-extensions.js with homepage nav behaviour');
} else {
  console.log('page-extensions.js already has nav behaviour');
}

const navStart = indexHtml.indexOf('<nav id="nav">');
const navEnd = indexHtml.indexOf('</nav>', navStart) + '</nav>'.length;
let navHtml = indexHtml.slice(navStart, navEnd);

const logoMatch = navHtml.match(/src="(data:image\/png;base64,[^"]+)"/);
if (!logoMatch) throw new Error('Could not find nav logo data URI');
const logoPath = path.join(root, 'assets', 'images', 'gather-logo.png');
fs.writeFileSync(logoPath, Buffer.from(logoMatch[1].replace(/^data:image\/png;base64,/, ''), 'base64'));
console.log('Wrote', path.relative(root, logoPath));

function rewriteNav(html, prefix) {
  let out = html.replace(
    /src="data:image\/png;base64,[^"]+"/,
    'src="' + prefix + 'assets/images/gather-logo.png"'
  );
  out = out.replace(/href="([^"]*)"/g, function (_, href) {
    if (/^(https?:|mailto:|tel:)/i.test(href)) return 'href="' + href + '"';
    if (href === '#top') return 'href="' + prefix + 'index.html"';
    if (href === '#') return 'href="#"';
    if (href.charAt(0) === '#') return 'href="' + prefix + 'index.html' + href + '"';
    return 'href="' + prefix + href + '"';
  });
  return out;
}

function depthPrefix(rel) {
  const parts = rel.replace(/\\/g, '/').split('/');
  return parts.length <= 1 ? '' : '../'.repeat(parts.length - 1);
}

function walkHtml(dir, acc) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === 'scripts' || name === 'page-comment' || name === 'exports' || name === 'review' || name === 'server') continue;
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walkHtml(full, acc);
    else if (name.endsWith('.html')) acc.push(path.relative(root, full).replace(/\\/g, '/'));
  }
  return acc;
}

const skipPages = new Set([
  'index.html',
  'HomePage.html',
  'deductions_fees_illustration.html',
  'multichannel_revenue_fragmentation.html'
]);

const innerPages = walkHtml(root, [])
  .filter((file) => !skipPages.has(file))
  .map((file) => ({ file, prefix: depthPrefix(file) }));

const headerRe = /<header class="subpage-nav">[\s\S]*?<\/header>/;
let updated = 0;
for (const page of innerPages) {
  const filePath = path.join(root, page.file);
  if (!fs.existsSync(filePath)) {
    console.warn('Skip missing', page.file);
    continue;
  }
  let html = fs.readFileSync(filePath, 'utf8');
  if (!headerRe.test(html)) {
    if (html.includes('<nav id="nav">')) {
      console.log('Already has site nav:', page.file);
      continue;
    }
    console.warn('No subpage-nav in', page.file);
    continue;
  }
  const replacement = rewriteNav(navHtml, page.prefix);
  html = html.replace(headerRe, replacement);
  fs.writeFileSync(filePath, html);
  updated += 1;
  console.log('Updated', page.file);
}

console.log('Done. Pages updated:', updated);
