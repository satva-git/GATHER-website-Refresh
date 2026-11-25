/**
 * Rebuild only the Group Financial Reporting <main> from preserved copy.
 * Does not touch nav, footer, or other pages.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const file = path.join(root, 'group-financial-reporting/index.html');
const copy = JSON.parse(fs.readFileSync(path.join(root, '.website-project/research/gfr-copy.json'), 'utf8'));

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const steps = [
  { id: 'group-reporting', label: 'Step 1: Create GRT', title: copy.headings[6], body: copy.paras[10], items: copy.lists[0], image: copy.images[5], flip: false },
  { id: 'ai-mapping', label: 'Map your GRT with the help of GATHER AI', title: copy.headings[7], body: copy.paras[12], items: copy.lists[1], image: copy.images[6], flip: true },
  { id: 'automated-elimination-journals', label: 'Automated Elimination Journals', title: copy.headings[8], body: copy.paras[14], items: copy.lists[2], image: copy.images[7], flip: false },
  { id: 'working-papers-hub', label: 'Step 4: Review Working Papers', title: copy.headings[9], body: copy.paras[16], items: copy.lists[3], image: copy.images[8], flip: true },
  { id: 'manual-topside-adjustments', label: 'Step 5: Manual Topside Adjustments', title: copy.headings[10], body: copy.paras[18], items: copy.lists[4], image: copy.images[9], flip: false },
  { id: 'reports', label: 'Step 6: Generate Reports', title: copy.headings[11], body: copy.paras[20], items: copy.lists[5], image: copy.images[10], flip: true },
];

const features = [
  { title: copy.headings[2], body: copy.paras[5], image: copy.images[1] },
  { title: copy.headings[3], body: copy.paras[6], image: copy.images[2] },
  { title: copy.headings[4], body: copy.paras[7], image: copy.images[3] },
  { title: copy.headings[5], body: copy.paras[8], image: copy.images[4] },
];

function shot(image) {
  return `<figure class="pl-shot"><img src="${esc(image.src)}" alt="${esc(image.alt)}"></figure>`;
}

const featureHtml = features.map((f) => `
        <article class="pl-feature">
          <img src="${esc(f.image.src)}" alt="${esc(f.image.alt)}" width="28" height="28">
          <h3>${esc(f.title)}</h3>
          <p>${esc(f.body)}</p>
        </article>`).join('');

const stepHtml = steps.map((s) => `
      <article class="pl-step${s.flip ? ' pl-step--flip' : ''}" id="${s.id}">
        <div class="pl-step-copy">
          <p class="pl-step-label">${esc(s.label)}</p>
          <h2>${esc(s.title)}</h2>
          <p class="pl-body">${esc(s.body)}</p>
          <ul class="pl-benefits">
            ${s.items.map((item) => `<li>${esc(item)}</li>`).join('\n            ')}
          </ul>
        </div>
        ${shot(s.image)}
      </article>`).join('');

const main = `<main id="content">
  <section class="pl-hero">
    <div class="pl-wrap pl-hero-grid">
      <div>
        <nav class="pl-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> <span aria-hidden="true">/</span> <span aria-current="page">Group Financial Reporting</span></nav>
        <p class="pl-kicker">${esc(copy.paras[1])}</p>
        <h1>${esc(copy.h1)}</h1>
        <p class="pl-lead">${esc(copy.paras[2])}</p>
        <div class="pl-actions">
          <a class="pl-btn pl-btn--primary" href="https://app.gather.nexus/auth/user/signup" target="_blank" rel="noreferrer noopener">Start 30-Day Free Trial</a>
          <a class="pl-btn pl-btn--ghost" href="https://calendly.com/gather-support-" target="_blank" rel="noreferrer noopener">Back to overview</a>
        </div>
        <p class="pl-fine">${esc(copy.paras[0])}</p>
      </div>
      ${shot(copy.images[0])}
    </div>
  </section>

  <section class="pl-trust" aria-label="Connected ledgers">
    <div class="pl-wrap pl-trust-row">
      <p>Map entity GL accounts from Xero and QuickBooks</p>
      <div class="pl-trust-logos">
        <a href="/integrations/xero/"><img src="/assets/images/xero-mark.svg" alt="" width="22" height="22"> Xero</a>
        <a href="/integrations/quickbooks/"><img src="/assets/images/quickbooks-online-logo.svg" alt="" width="22" height="22"> QuickBooks</a>
      </div>
    </div>
  </section>

  <section class="pl-section" aria-labelledby="workflow-overview">
    <div class="pl-wrap">
      <p class="pl-kicker">${esc(copy.paras[3])}</p>
      <h2 id="workflow-overview">${esc(copy.headings[1])}</h2>
      <p class="pl-body">${esc(copy.paras[4])}</p>
      <div class="pl-features">
        ${featureHtml}
      </div>
    </div>
  </section>

  <section class="pl-section pl-section--tint" aria-label="Product workflow">
    <div class="pl-wrap">
      ${stepHtml}
    </div>
  </section>

  <section class="pl-section" aria-labelledby="integrations-heading">
    <div class="pl-wrap">
      <h2 id="integrations-heading">Xero and QuickBooks</h2>
      <p class="pl-body">${esc(copy.paras[5])}</p>
      <div class="pl-integrations">
        <a href="/integrations/xero/"><strong>Xero</strong><span>Click through to Xero/QuickBooks Online to review or amend individual transactions.</span></a>
        <a href="/integrations/quickbooks/"><strong>QuickBooks</strong><span>Click through to Xero/QuickBooks Online to review or amend individual transactions.</span></a>
      </div>
    </div>
  </section>

  <section class="pl-cta">
    <div class="pl-wrap">
      <h2>${esc(copy.h1)}</h2>
      <p>${esc(copy.paras[2])}</p>
      <div class="pl-actions">
        <a class="pl-btn pl-btn--primary" href="https://app.gather.nexus/auth/user/signup" target="_blank" rel="noreferrer noopener">Start 30 days Free trial</a>
        <a class="pl-btn pl-btn--ghost" href="https://calendly.com/gather-support-" target="_blank" rel="noreferrer noopener">Back to overview</a>
      </div>
      <p class="pl-fine">${esc(copy.paras[0])}</p>
    </div>
  </section>

  <section class="pl-news">
    <div class="pl-wrap">
      <h2>${esc(copy.headings[12])}</h2>
      <p class="pl-body">${esc(copy.paras[21])}</p>
      <p class="review-flag-inline">${esc(copy.paras[22])}</p>
      ${copy.form}
    </div>
  </section>
</main>`;

let html = fs.readFileSync(file, 'utf8');
if (!html.includes('product-landing.css')) {
  html = html.replace(
    '<link rel="stylesheet" href="/assets/public-pages.css?v=20261125b"/>',
    '<link rel="stylesheet" href="/assets/public-pages.css?v=20261125b"/>\n<link rel="stylesheet" href="/assets/product-landing.css?v=20261125c"/>'
  );
}
html = html.replace('<body class="public-page">', '<body class="public-page product-page">');
html = html.replace(/<main id="content">[\s\S]*?<\/main>/, main);
fs.writeFileSync(file, html);
console.log('rewrote main, bytes', html.length);
