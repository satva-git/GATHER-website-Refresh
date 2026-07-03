'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HOME = path.join(ROOT, 'HomePage.html');
const INDEX = path.join(ROOT, 'index.html');

const OLD_JOURNEY_CSS = `.journey-section{padding:88px 0 72px}
.journey-intro{text-align:center;max-width:680px;margin:0 auto 48px}
.journey-intro .eyebrow{justify-content:center;margin-bottom:14px}
.journey-intro .lead{margin:12px auto 0;max-width:54ch}
.journey-shell{
  display:grid;grid-template-columns:minmax(240px,.82fr) minmax(0,1.18fr);
  gap:0;background:#fff;border:1px solid var(--line);border-radius:var(--r-lg);
  box-shadow:0 16px 48px rgba(10,27,48,.06);overflow:hidden;min-height:520px;
}
.journey-rail{
  position:relative;display:flex;flex-direction:column;gap:0;
  padding:28px 20px 28px 24px;background:linear-gradient(180deg,var(--paper-2) 0%,#fff 100%);
  border-right:1px solid var(--line);
}
.journey-rail-progress{position:absolute;left:39px;top:48px;bottom:48px;width:2px;background:var(--line);border-radius:2px;pointer-events:none}
.journey-rail-progress-fill{position:absolute;left:0;top:0;width:100%;height:20%;background:linear-gradient(180deg,var(--teal),var(--teal-deep));border-radius:2px;transition:height .35s var(--ease)}
.journey-step{
  position:relative;display:flex;align-items:flex-start;gap:14px;width:100%;text-align:left;
  padding:16px 12px 16px 4px;border-radius:var(--r-md);border:1px solid transparent;
  transition:background .2s var(--ease),border-color .2s var(--ease),transform .2s var(--ease);
}
.journey-step:hover{background:rgba(var(--teal-rgb),.04);border-color:var(--teal-line)}
.journey-step.is-active{background:#fff;border-color:var(--teal-line);box-shadow:0 4px 16px rgba(var(--teal-rgb),.08)}
.journey-step-num{
  width:32px;height:32px;flex-shrink:0;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:700;letter-spacing:.04em;color:var(--text-muted);
  background:#fff;border:1.5px solid var(--line);transition:all .25s var(--ease);z-index:1;
}
.journey-step.is-active .journey-step-num,.journey-step.is-complete .journey-step-num{
  background:var(--teal);border-color:var(--teal);color:#fff;
}
.journey-step-text{display:flex;flex-direction:column;gap:3px;min-width:0;flex:1}
.journey-step-kicker{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted)}
.journey-step.is-active .journey-step-kicker{color:var(--teal-deep)}
.journey-step-label{font-size:13.5px;font-weight:600;line-height:1.35;color:var(--ink)}
.journey-step-arrow{width:14px;height:14px;color:var(--text-muted);opacity:0;flex-shrink:0;margin-top:8px;transition:opacity .2s,transform .2s}
.journey-step.is-active .journey-step-arrow{opacity:1;color:var(--teal)}
.journey-stage{padding:32px 32px 24px;background:#fff;display:flex;flex-direction:column}
.journey-panel{display:none;animation:journeyIn .35s var(--ease) both}
.journey-panel.is-active{display:block}
@keyframes journeyIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.journey-panel-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:clamp(24px,4vw,40px);align-items:start}
.journey-copy .h3{font-size:clamp(22px,2.4vw,30px);margin-bottom:14px;line-height:1.15}
.journey-checks{margin-top:8px}
.journey-visual{display:flex;flex-direction:column;gap:14px}
.journey-visual-frame{
  background:var(--paper-2);border:1px solid var(--line);border-radius:var(--r-md);
  padding:14px 14px 12px;overflow:hidden;
}
.journey-visual-caption{display:flex;justify-content:space-between;gap:12px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px}
.journey-visual-caption span:last-child{color:var(--teal-deep);text-align:right}
.journey-visual-frame img{width:100%;height:auto;border-radius:calc(var(--r-md) - 2px);display:block}
.journey-flow-mini,.journey-module-steps{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap}
.journey-flow-mini{font-size:12px;font-weight:600;color:var(--text-mid);padding:10px 14px;background:var(--paper-2);border-radius:var(--r-pill);border:1px solid var(--line)}
.journey-flow-dot{width:5px;height:5px;border-radius:50%;background:var(--teal);opacity:.6}
.journey-module-step{
  display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:var(--r-pill);
  background:#fff;border:1px solid var(--line);font-size:12px;font-weight:600;color:var(--ink);
}
.journey-module-step svg{width:16px;height:16px;color:var(--teal);flex-shrink:0}
.journey-controls{
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  margin-top:auto;padding-top:20px;border-top:1px solid var(--line);
}
.journey-nav-btn{
  display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;
  color:var(--teal-deep);padding:10px 14px;border-radius:var(--r-pill);border:1px solid var(--line);background:#fff;
  transition:all .2s var(--ease);
}
.journey-nav-btn:hover:not(:disabled){border-color:var(--teal);background:var(--teal-tint)}
.journey-nav-btn:disabled{opacity:.4;cursor:not-allowed}
.journey-nav-btn svg{width:14px;height:14px}
.journey-dots{display:flex;align-items:center;gap:8px}
.journey-dot{width:8px;height:8px;border-radius:50%;background:var(--line);border:none;padding:0;transition:all .2s}
.journey-dot.is-active{width:22px;border-radius:var(--r-pill);background:var(--teal)}`;

const NEW_JOURNEY_CSS = `.journey-section{padding:96px 0 80px}
.journey-intro{text-align:center;max-width:720px;margin:0 auto 56px}
.journey-intro .eyebrow{justify-content:center;margin-bottom:14px}
.journey-intro .lead{margin:14px auto 0;max-width:58ch;font-size:16px}
.journey-shell{
  display:flex;flex-direction:column;background:#fff;border:1px solid var(--line);
  border-radius:calc(var(--r-lg) + 2px);box-shadow:0 24px 64px rgba(10,27,48,.08);
  overflow:hidden;
}
.journey-tabs-wrap{
  position:relative;padding:0 clamp(12px,2.5vw,24px);
  background:linear-gradient(180deg,var(--paper-2) 0%,#fff 100%);
  border-bottom:1px solid var(--line);
}
.journey-tabs-track{
  position:absolute;left:clamp(12px,2.5vw,24px);right:clamp(12px,2.5vw,24px);bottom:0;
  height:3px;background:var(--line);border-radius:3px 3px 0 0;overflow:hidden;pointer-events:none;
}
.journey-tabs-track-fill{
  display:block;height:100%;width:20%;background:linear-gradient(90deg,var(--teal),var(--teal-2));
  border-radius:3px;transition:transform .4s var(--ease),width .4s var(--ease);
  will-change:transform;
}
.journey-tabs{
  display:flex;gap:6px;overflow-x:auto;padding:18px 0 15px;
  scrollbar-width:none;-webkit-overflow-scrolling:touch;
}
.journey-tabs::-webkit-scrollbar{display:none}
.journey-tab{
  position:relative;display:flex;align-items:center;gap:10px;flex:1 1 0;min-width:min(100%,168px);
  padding:11px 14px;border-radius:var(--r-md);border:1px solid transparent;background:transparent;
  text-align:left;transition:background .22s var(--ease),border-color .22s var(--ease),box-shadow .22s var(--ease);
}
.journey-tab:hover{background:rgba(var(--teal-rgb),.05);border-color:var(--teal-line)}
.journey-tab.is-active{
  background:#fff;border-color:var(--teal-line);
  box-shadow:0 6px 24px rgba(var(--teal-rgb),.1);
}
.journey-tab.is-complete .journey-tab-num{background:var(--teal-tint);border-color:var(--teal-line);color:var(--teal-deep)}
.journey-tab-num{
  width:30px;height:30px;flex-shrink:0;border-radius:8px;display:flex;align-items:center;justify-content:center;
  font-size:11px;font-weight:700;letter-spacing:.04em;color:var(--text-muted);
  background:var(--paper);border:1px solid var(--line);transition:all .22s var(--ease);
}
.journey-tab.is-active .journey-tab-num{background:var(--teal);border-color:var(--teal);color:#fff}
.journey-tab-text{display:flex;flex-direction:column;gap:2px;min-width:0}
.journey-tab-kicker{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--text-muted);line-height:1.2}
.journey-tab.is-active .journey-tab-kicker{color:var(--teal-deep)}
.journey-tab-label{font-size:13px;font-weight:600;line-height:1.3;color:var(--text-mid);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.journey-tab.is-active .journey-tab-label{color:var(--ink)}
.journey-stage{padding:clamp(24px,3.5vw,36px) clamp(20px,3.5vw,32px) clamp(16px,2.5vw,24px);background:#fff}
.journey-panel{display:none;animation:journeyIn .4s var(--ease) both}
.journey-panel.is-active{display:block}
@keyframes journeyIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.journey-panel-layout{display:flex;flex-direction:column;gap:clamp(22px,3vw,30px)}
.journey-visual-hero{display:flex;flex-direction:column;gap:14px}
.journey-visual-frame{
  background:linear-gradient(165deg,var(--paper-2) 0%,#fff 52%,rgba(var(--teal-rgb),.06) 100%);
  border:1px solid var(--line);border-radius:var(--r-lg);padding:clamp(14px,2vw,20px);
  overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.85);
}
.journey-visual-caption{
  display:flex;justify-content:space-between;align-items:center;gap:16px;
  font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;
  color:var(--text-muted);margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--line);
}
.journey-visual-caption span:last-child{color:var(--teal-deep);text-align:right}
.journey-visual-frame img{
  width:100%;height:auto;max-height:min(54vh,540px);object-fit:contain;
  border-radius:calc(var(--r-md) - 2px);display:block;
}
.journey-flow-mini,.journey-module-steps{
  display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;
  padding:4px 0 2px;
}
.journey-flow-mini{
  font-size:12px;font-weight:600;color:var(--text-mid);padding:10px 18px;
  background:var(--paper-2);border-radius:var(--r-pill);border:1px solid var(--line);
  align-self:center;
}
.journey-flow-dot{width:5px;height:5px;border-radius:50%;background:var(--teal);opacity:.55;flex-shrink:0}
.journey-module-step{
  display:flex;align-items:center;gap:8px;padding:10px 16px;border-radius:var(--r-pill);
  background:#fff;border:1px solid var(--line);font-size:12px;font-weight:600;color:var(--ink);
  box-shadow:0 2px 8px rgba(10,27,48,.04);
}
.journey-module-step svg{width:16px;height:16px;color:var(--teal);flex-shrink:0}
.journey-panel-body{
  display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:clamp(24px,4vw,44px);
  align-items:start;padding-top:clamp(20px,2.5vw,28px);border-top:1px solid var(--line);
}
.journey-copy .wf-pill{margin-bottom:12px}
.journey-copy .h3{font-size:clamp(24px,2.6vw,34px);margin-bottom:14px;line-height:1.1;letter-spacing:-.02em}
.journey-copy .wf-body{font-size:15px;line-height:1.65;color:var(--text-mid)}
.journey-copy .wf-body+.wf-body{margin-top:12px}
.journey-checks{margin-top:16px}
.journey-panel-body .journey-checks{margin-top:0}
.journey-highlights{
  padding:20px 22px;background:var(--paper-2);border:1px solid var(--line);
  border-radius:var(--r-md);align-self:start;
}
.journey-highlights .checks{gap:10px}
.journey-highlights .checks li{font-size:13.5px}
.journey-highlights .wf-cta-row{margin-top:18px;padding-top:0;border:none}
.journey-controls{
  display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:16px clamp(20px,3.5vw,32px) clamp(18px,2.5vw,24px);
  border-top:1px solid var(--line);background:var(--paper-2);
}
.journey-nav-btn{
  display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;
  color:var(--teal-deep);padding:10px 16px;border-radius:var(--r-pill);border:1px solid var(--line);background:#fff;
  transition:all .2s var(--ease);
}
.journey-nav-btn:hover:not(:disabled){border-color:var(--teal);background:var(--teal-tint)}
.journey-nav-btn:disabled{opacity:.4;cursor:not-allowed}
.journey-nav-btn svg{width:14px;height:14px}
.journey-dots{display:flex;align-items:center;gap:8px}
.journey-dot{width:8px;height:8px;border-radius:50%;background:var(--line-2);border:none;padding:0;transition:all .22s}
.journey-dot.is-active{width:24px;border-radius:var(--r-pill);background:var(--teal)}`;

const OLD_MEDIA = `@media(max-width:960px){
  .journey-shell{grid-template-columns:1fr}
  .journey-rail{flex-direction:row;overflow-x:auto;border-right:none;border-bottom:1px solid var(--line);padding:16px;gap:8px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
  .journey-rail::-webkit-scrollbar{display:none}
  .journey-rail-progress{display:none}
  .journey-step{min-width:200px;flex-shrink:0;padding:12px}
  .journey-step-arrow{display:none}
  .journey-panel-grid{grid-template-columns:1fr}
  .journey-stage{padding:24px 20px 20px}`;

const NEW_MEDIA = `@media(max-width:960px){
  .journey-tab{min-width:148px;flex:0 0 auto;padding:10px 12px}
  .journey-tab-label{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .journey-panel-body{grid-template-columns:1fr;gap:20px}
  .journey-highlights{padding:16px 18px}
  .journey-visual-frame img{max-height:min(42vh,400px)}
  .journey-stage{padding:20px 16px 16px}`;

const OLD_MEDIA640 = `@media(max-width:640px){
  .journey-section{padding:56px 0 48px}
  .journey-controls{flex-wrap:wrap;justify-content:center}`;

const NEW_MEDIA640 = `@media(max-width:640px){
  .journey-section{padding:56px 0 48px}
  .journey-intro{margin-bottom:40px}
  .journey-tabs{padding:14px 0 13px}
  .journey-tab{min-width:132px}
  .journey-controls{flex-wrap:wrap;justify-content:center;gap:12px}
  .journey-nav-btn{flex:1;justify-content:center;min-width:120px}`;

const TAB_DEFS = [
  { id: 'overview', num: '01', kicker: 'Platform overview', label: 'Multi-entity finance teams' },
  { id: 'solution', num: '02', kicker: 'The solution', label: 'One integrated workflow' },
  { id: 'intercompany', num: '03', kicker: 'Module 01', label: 'Intercompany control' },
  { id: 'reporting', num: '04', kicker: 'Module 02', label: 'Group reporting' },
  { id: 'planning', num: '05', kicker: 'Module 05', label: 'Planning & variance' }
];

function buildTabsNav() {
  const buttons = TAB_DEFS.map((tab, i) => {
    const active = i === 0 ? ' is-active' : '';
    const selected = i === 0 ? 'true' : 'false';
    return (
      `        <button type="button" class="journey-tab${active}" role="tab" id="journey-tab-${tab.id}" data-journey="${tab.id}" aria-controls="journey-panel-${tab.id}" aria-selected="${selected}">\n` +
      `          <span class="journey-tab-num">${tab.num}</span>\n` +
      `          <span class="journey-tab-text">\n` +
      `            <span class="journey-tab-kicker">${tab.kicker}</span>\n` +
      `            <span class="journey-tab-label">${tab.label}</span>\n` +
      `          </span>\n` +
      `        </button>`
    );
  }).join('\n');

  return (
    `      <div class="journey-tabs-wrap">\n` +
    `        <div class="journey-tabs-track" aria-hidden="true"><span class="journey-tabs-track-fill"></span></div>\n` +
    `        <nav class="journey-tabs" role="tablist" aria-label="Product workflow steps">\n` +
    buttons + '\n' +
    `        </nav>\n` +
    `      </div>`
  );
}

function transformPanel(panelHtml) {
  const gridMatch = panelHtml.match(
    /<div class="journey-panel-grid">([\s\S]*?)<\/div>\s*<\/article>/
  );
  if (!gridMatch) return panelHtml;

  const gridInner = gridMatch[1];
  const copyMatch = gridInner.match(/<div class="journey-copy">([\s\S]*?)<\/div>\s*<div class="journey-visual">/);
  const visualMatch = gridInner.match(/<div class="journey-visual">([\s\S]*?)<\/div>\s*$/);
  if (!copyMatch || !visualMatch) return panelHtml;

  let copy = copyMatch[1];
  const visual = visualMatch[1];

  const checksMatch = copy.match(/(<ul class="checks journey-checks">[\s\S]*?<\/ul>)/);
  const ctaMatch = copy.match(/(<div class="wf-cta-row">[\s\S]*?<\/div>)/);
  let checksBlock = '';
  let ctaBlock = '';
  if (checksMatch) {
    checksBlock = checksMatch[1];
    copy = copy.replace(checksMatch[0], '');
  }
  if (ctaMatch) {
    ctaBlock = ctaMatch[1];
    copy = copy.replace(ctaMatch[0], '');
  }

  const highlights =
    checksBlock || ctaBlock
      ? `            <aside class="journey-highlights">\n` +
        (checksBlock ? `              ${checksBlock.trim()}\n` : '') +
        (ctaBlock ? `              ${ctaBlock.trim()}\n` : '') +
        `            </aside>`
      : '';

  const bodyGrid = highlights
    ? `          <div class="journey-panel-body">\n` +
      `            <div class="journey-copy">${copy.trim()}</div>\n` +
      `${highlights}\n` +
      `          </div>`
    : `          <div class="journey-panel-body journey-panel-body--solo">\n` +
      `            <div class="journey-copy">${copy.trim()}${checksBlock ? '\n              ' + checksBlock.trim() : ''}</div>\n` +
      `          </div>`;

  const layout =
    `          <div class="journey-panel-layout">\n` +
    `            <div class="journey-visual-hero">\n` +
    `              <div class="journey-visual">${visual.trim()}</div>\n` +
    `            </div>\n` +
    bodyGrid + '\n' +
    `          </div>`;

  return panelHtml.replace(
    /<div class="journey-panel-grid">[\s\S]*?<\/div>\s*(<\/article>)/,
    layout + '\n        $1'
  );
}

function transformHtml(html) {
  if (!html.includes('journey-rail')) {
    if (html.includes('journey-tabs-wrap')) {
      console.log('Journey already redesigned — skipping HTML transform.');
      return html;
    }
    throw new Error('Could not find journey-rail in HomePage.html');
  }

  const railStart = html.indexOf('      <nav class="journey-rail"');
  const railEnd = html.indexOf('      </nav>', railStart) + '      </nav>'.length;
  html = html.slice(0, railStart) + buildTabsNav() + html.slice(railEnd);

  const panelRe = /<article class="journey-panel[^"]*"[\s\S]*?<\/article>/g;
  html = html.replace(panelRe, (panel) => transformPanel(panel));

  html = html.replace(
    '<footer class="journey-controls">',
    '      <footer class="journey-controls">'
  );

  return html;
}

function run() {
  let html = fs.readFileSync(HOME, 'utf8');

  if (!html.includes(OLD_JOURNEY_CSS.split('\n')[0])) {
    if (html.includes('.journey-tabs-wrap')) {
      console.log('CSS already updated.');
    } else {
      throw new Error('Journey CSS block not found — manual merge required.');
    }
  } else {
    html = html.replace(OLD_JOURNEY_CSS, NEW_JOURNEY_CSS);
  }

  html = html.replace(OLD_MEDIA, NEW_MEDIA);
  html = html.replace(OLD_MEDIA640, NEW_MEDIA640);

  if (!html.includes('.journey-panel-body--solo')) {
    html = html.replace(
      '.journey-panel-body .journey-checks{margin-top:0}',
      '.journey-panel-body .journey-checks{margin-top:0}\n.journey-panel-body--solo{grid-template-columns:1fr}'
    );
  }

  html = transformHtml(html);

  fs.writeFileSync(HOME, html);
  fs.copyFileSync(HOME, INDEX);
  console.log('Product journey redesigned in HomePage.html and index.html');
}

run();
