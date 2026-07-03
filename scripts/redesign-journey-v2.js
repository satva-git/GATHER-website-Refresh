'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILES = [path.join(ROOT, 'HomePage.html'), path.join(ROOT, 'index.html')];

const OLD_CSS_START = '/* Product journey storytelling */';
const OLD_CSS_END = '.journey-dot.is-active{width:24px;border-radius:var(--r-pill);background:var(--teal)}';

const NEW_JOURNEY_CSS = `/* Product journey — split studio layout */
.journey-section{padding:40px 0 48px}
.journey-section>.wrap{display:flex;flex-direction:column;gap:0}
.journey-intro{display:none}
.journey-shell{
  display:grid;
  grid-template-columns:220px minmax(0,1fr);
  grid-template-rows:auto minmax(0,1fr) auto;
  height:clamp(760px,72vh,880px);
  background:#fff;border:1px solid var(--line);border-radius:var(--r-lg);
  box-shadow:0 20px 60px rgba(10,27,48,.07);overflow:hidden;
}
.journey-shell-head{
  grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);
  gap:20px 40px;align-items:end;padding:22px 28px 18px;
  border-bottom:1px solid var(--line);background:linear-gradient(180deg,var(--paper-2) 0%,#fff 100%);
}
.journey-shell-head .eyebrow{justify-content:flex-start;margin:0 0 8px}
.journey-shell-head .h2{margin:0;font-size:clamp(24px,2.4vw,32px);line-height:1.12;letter-spacing:-.02em}
.journey-shell-head .lead{margin:0;font-size:14px;line-height:1.55;color:var(--text-mid);max-width:42ch}
.journey-tabs-wrap{
  grid-column:1;grid-row:2/4;position:relative;display:flex;flex-direction:column;
  padding:16px 0 16px 12px;border-right:1px solid var(--line);background:var(--paper);
  min-height:0;
}
.journey-tabs-track{
  position:absolute;left:22px;top:20px;bottom:20px;width:2px;height:auto;
  background:var(--line);border-radius:2px;overflow:hidden;pointer-events:none;
}
.journey-tabs-track-fill{
  display:block;width:100%;height:20%;background:linear-gradient(180deg,var(--teal),var(--teal-2));
  border-radius:2px;transition:transform .35s var(--ease),height .35s var(--ease);
  will-change:transform;
}
.journey-tabs{
  position:relative;display:flex;flex-direction:column;gap:2px;flex:1;min-height:0;
  overflow-y:auto;overflow-x:hidden;padding:4px 12px 4px 28px;
  scrollbar-width:thin;
}
.journey-tabs::-webkit-scrollbar{width:4px}
.journey-tabs::-webkit-scrollbar-thumb{background:var(--line-2);border-radius:4px}
.journey-tab{
  position:relative;display:flex;align-items:flex-start;gap:10px;width:100%;flex:0 0 auto;
  padding:10px 12px;border-radius:var(--r-md);border:1px solid transparent;background:transparent;
  text-align:left;transition:background .2s var(--ease),border-color .2s var(--ease);
}
.journey-tab::before{
  content:'';position:absolute;left:-17px;top:50%;transform:translateY(-50%);
  width:8px;height:8px;border-radius:50%;background:var(--line-2);
  transition:background .2s var(--ease),box-shadow .2s var(--ease);
}
.journey-tab:hover{background:rgba(var(--teal-rgb),.04)}
.journey-tab.is-active{
  background:rgba(var(--teal-rgb),.07);border-color:var(--teal-line);
}
.journey-tab.is-active::before{background:var(--teal);box-shadow:0 0 0 3px rgba(var(--teal-rgb),.18)}
.journey-tab.is-complete .journey-tab-num{color:var(--teal-deep);border-color:var(--teal-line);background:var(--teal-tint)}
.journey-tab-num{
  width:24px;height:24px;flex-shrink:0;border-radius:6px;display:flex;align-items:center;justify-content:center;
  font-size:10px;font-weight:700;letter-spacing:.03em;color:var(--text-muted);
  background:#fff;border:1px solid var(--line);transition:all .2s var(--ease);
}
.journey-tab.is-active .journey-tab-num{background:var(--teal);border-color:var(--teal);color:#fff}
.journey-tab-text{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1;padding-top:1px}
.journey-tab-kicker{font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted);line-height:1.2}
.journey-tab.is-active .journey-tab-kicker{color:var(--teal-deep)}
.journey-tab-label{font-size:12.5px;font-weight:600;line-height:1.3;color:var(--text-mid)}
.journey-tab.is-active .journey-tab-label{color:var(--ink)}
.journey-stage{
  grid-column:2;grid-row:2;min-height:0;overflow:hidden;
  padding:24px 28px 20px;background:#fff;
}
.journey-panel{display:none;animation:journeyIn .32s var(--ease) both;height:100%}
.journey-panel.is-active{display:block}
@keyframes journeyIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:none}}
.journey-panel-layout{
  display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,360px);
  gap:36px;height:100%;align-items:start;
}
.journey-panel-body{
  display:flex;flex-direction:column;gap:0;min-width:0;min-height:0;
}
.journey-copy{padding-right:8px}
.journey-copy .wf-pill{margin-bottom:10px}
.journey-copy .h3{
  font-size:clamp(20px,1.8vw,26px);margin:0 0 12px;line-height:1.18;letter-spacing:-.015em;
}
.journey-copy .wf-body{font-size:14px;line-height:1.6;color:var(--text-mid);max-width:52ch}
.journey-copy .wf-body+.wf-body{margin-top:10px}
.journey-highlights{
  margin-top:18px;padding-top:18px;border-top:1px solid var(--line);
  background:transparent;border-radius:0;padding-left:0;padding-right:0;padding-bottom:0;
}
.journey-highlights .checks{
  display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 20px;margin:0;
}
.journey-highlights .checks li{font-size:13px;line-height:1.45}
.journey-highlights .wf-cta-row{margin-top:16px;padding-top:0;border:none}
.journey-checks{margin-top:0}
.journey-panel-body .journey-checks{margin-top:0}
.journey-panel-body--solo .journey-highlights .checks{grid-template-columns:1fr}
.journey-visual-hero{
  display:flex;flex-direction:column;gap:10px;min-width:0;
}
.journey-visual-frame{
  background:var(--paper-2);border:1px solid var(--line);border-radius:var(--r-md);
  padding:12px 14px;overflow:hidden;
}
.journey-visual-caption{
  display:flex;justify-content:space-between;align-items:center;gap:12px;
  font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
  color:var(--text-muted);margin-bottom:10px;
}
.journey-visual-caption span:last-child{color:var(--teal-deep);text-align:right}
.journey-visual-frame img{
  width:100%;height:auto;max-height:220px;object-fit:contain;
  border-radius:calc(var(--r-md) - 4px);display:block;
}
.journey-flow-mini,.journey-module-steps{
  display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;
}
.journey-flow-mini{
  font-size:11px;font-weight:600;color:var(--text-mid);padding:8px 12px;
  background:#fff;border-radius:var(--r-pill);border:1px solid var(--line);
}
.journey-flow-dot{width:4px;height:4px;border-radius:50%;background:var(--teal);opacity:.5;flex-shrink:0}
.journey-module-step{
  display:flex;align-items:center;gap:6px;padding:7px 11px;border-radius:var(--r-pill);
  background:#fff;border:1px solid var(--line);font-size:11px;font-weight:600;color:var(--ink);
}
.journey-module-step svg{width:14px;height:14px;color:var(--teal);flex-shrink:0}
.journey-controls{
  grid-column:2;grid-row:3;display:flex;align-items:center;justify-content:space-between;gap:16px;
  padding:0 28px;height:52px;border-top:1px solid var(--line);background:var(--paper-2);
}
.journey-nav-btn{
  display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;
  color:var(--teal-deep);padding:8px 14px;border-radius:var(--r-pill);border:1px solid var(--line);background:#fff;
  transition:all .2s var(--ease);
}
.journey-nav-btn:hover:not(:disabled){border-color:var(--teal);background:var(--teal-tint)}
.journey-nav-btn:disabled{opacity:.4;cursor:not-allowed}
.journey-nav-btn svg{width:14px;height:14px}
.journey-dots{display:flex;align-items:center;gap:8px}
.journey-dot{width:7px;height:7px;border-radius:50%;background:var(--line-2);border:none;padding:0;transition:all .2s}
.journey-dot.is-active{width:20px;border-radius:var(--r-pill);background:var(--teal)}`;

const OLD_MEDIA_JOURNEY = `@media(max-width:960px){
  .journey-tab{min-width:128px;flex:0 0 auto;padding:8px 10px}
  .journey-tab-label{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .journey-panel-layout{grid-template-columns:1fr;gap:18px}
  .journey-visual-hero{grid-column:1;grid-row:2;position:static}
  .journey-panel-body{grid-column:1;grid-row:1;grid-template-columns:1fr;gap:14px}
  .journey-highlights{padding:14px 16px}
  .journey-visual-frame img{max-height:min(34vh,220px)}
  .journey-stage{padding:16px 14px 12px}`;

const NEW_MEDIA_JOURNEY = `@media(max-width:960px){
  .journey-shell{
    grid-template-columns:1fr;grid-template-rows:auto auto minmax(0,1fr) auto;
    height:auto;min-height:0;max-height:none;
  }
  .journey-shell-head{grid-template-columns:1fr;gap:10px;padding:18px 18px 14px}
  .journey-tabs-wrap{
    grid-column:1;grid-row:2;border-right:none;border-bottom:1px solid var(--line);
    padding:0 12px;flex-direction:column;
  }
  .journey-tabs-track{display:none}
  .journey-tabs{flex-direction:row;overflow-x:auto;overflow-y:hidden;padding:10px 0;gap:6px}
  .journey-tab{min-width:148px;padding:8px 10px}
  .journey-tab::before{display:none}
  .journey-tab-label{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .journey-stage{grid-column:1;grid-row:3;padding:18px 18px 16px}
  .journey-panel-layout{grid-template-columns:1fr;gap:20px}
  .journey-highlights .checks{grid-template-columns:1fr}
  .journey-visual-frame img{max-height:200px}
  .journey-controls{grid-column:1;grid-row:4;padding:0 18px;height:auto;min-height:52px}`;

const OLD_MEDIA640_JOURNEY = `@media(max-width:640px){
  .journey-section{padding:48px 0 40px}
  .journey-intro{margin-bottom:24px}
  .journey-tabs{padding:8px 0 7px}
  .journey-tab{min-width:118px}
  .journey-visual-frame img{max-height:min(30vh,200px)}`;

const NEW_MEDIA640_JOURNEY = `@media(max-width:640px){
  .journey-section{padding:32px 0 36px}
  .journey-shell-head{padding:16px 16px 12px}
  .journey-tabs{padding:8px 0}
  .journey-tab{min-width:120px}
  .journey-stage{padding:16px}
  .journey-controls{padding:0 16px}
  .journey-visual-frame img{max-height:180px}`;

function replaceJourneyCss(html) {
  const start = html.indexOf(OLD_CSS_START);
  const end = html.indexOf(OLD_CSS_END);
  if (start === -1 || end === -1) throw new Error('Journey CSS block not found');
  return html.slice(0, start) + NEW_JOURNEY_CSS + html.slice(end + OLD_CSS_END.length);
}

function moveIntroIntoShell(html) {
  if (html.includes('journey-shell-head')) return html;

  const introRe = /(\s*)<header class="journey-intro sr">\s*<div class="eyebrow">Product journey<\/div>\s*<h2 class="h2" id="journey-heading">([\s\S]*?)<\/h2>\s*<p class="lead">([\s\S]*?)<\/p>\s*<\/header>\s*\n\s*<div class="journey-shell sr sr-d1" id="product-journey">/;

  return html.replace(introRe, (_, indent, heading, lead) => {
    return (
      `${indent}<div class="journey-shell journey-shell--split sr sr-d1" id="product-journey">\n` +
      `${indent}  <header class="journey-shell-head sr">\n` +
      `${indent}    <div>\n` +
      `${indent}      <div class="eyebrow">Product journey</div>\n` +
      `${indent}      <h2 class="h2" id="journey-heading">${heading}</h2>\n` +
      `${indent}    </div>\n` +
      `${indent}    <p class="lead">${lead}</p>\n` +
      `${indent}  </header>`
    );
  });
}

function moveControlsOutsideStage(html) {
  if (html.includes('</div>\n\n      <footer class="journey-controls">')) return html;
  return html.replace(
    /\s*<footer class="journey-controls">([\s\S]*?)<\/footer>\s*<\/div>\s*\n(\s*)<\/div>\s*\n\s*\n<!-- GATHER-ENHANCEMENTS -->/,
    '\n$2</div>\n$2<footer class="journey-controls">$1</footer>\n$2</div>\n\n<!-- GATHER-ENHANCEMENTS -->'
  );
}

function reorderPanelLayout(html) {
  return html.replace(
    /<div class="journey-panel-layout">\s*<div class="journey-visual-hero">([\s\S]*?)<\/div>\s*<div class="journey-panel-body">([\s\S]*?)<\/div>\s*<\/div>/g,
    (match, visual, body) =>
      `<div class="journey-panel-layout">\n          <div class="journey-panel-body">${body.trim()}</div>\n          <div class="journey-visual-hero">${visual.trim()}</div>\n          </div>`
  );
}

function replaceMediaQueries(html) {
  if (html.includes('.journey-shell-head{grid-template-columns:1fr')) return html;
  html = html.replace(OLD_MEDIA_JOURNEY, NEW_MEDIA_JOURNEY);
  html = html.replace(OLD_MEDIA640_JOURNEY, NEW_MEDIA640_JOURNEY);
  return html;
}

function runOnFile(file) {
  let html = fs.readFileSync(file, 'utf8');
  html = replaceJourneyCss(html);
  html = replaceMediaQueries(html);
  html = moveIntroIntoShell(html);
  html = reorderPanelLayout(html);
  html = moveControlsOutsideStage(html);
  fs.writeFileSync(file, html);
  console.log('Updated', path.basename(file));
}

for (const file of FILES) runOnFile(file);
