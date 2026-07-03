'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HOME = path.join(ROOT, 'HomePage.html');
const INDEX = path.join(ROOT, 'index.html');
const MARKER = '<!-- GATHER-ENHANCEMENTS -->';
const INSERT_BEFORE = '  <!-- ONE CONNECTED WORKFLOW -->';

const SECTIONS = `${MARKER}
  <!-- THREE PILLARS -->
  <div class="pillars-section" id="three-pillars">
    <div class="wrap">
      <div class="sec-head sr">
        <div class="eyebrow">Platform Features</div>
        <h2 class="h2">The Three Pillars of Your New Finance Stack</h2>
        <p class="lead">Every module works together as one connected system — not a set of disconnected tools.</p>
      </div>
      <div class="pillars-card sr sr-d1">
        <div class="pillars-layout">
          <nav class="pillars-nav" aria-label="Select a pillar">
            <div class="pillars-nav-label">Select a pillar</div>
            <button type="button" class="pillars-nav-item is-active" data-pillar="0">
              <span class="pillars-nav-radio" aria-hidden="true"></span>
              <span class="pillars-nav-body">
                <span class="pillars-nav-num">01</span>
                <span class="pillars-nav-title">Automated Group Financial Reporting</span>
                <span class="pillars-nav-meta">3 capabilities ›</span>
              </span>
            </button>
            <button type="button" class="pillars-nav-item" data-pillar="1">
              <span class="pillars-nav-radio" aria-hidden="true"></span>
              <span class="pillars-nav-body">
                <span class="pillars-nav-num">02</span>
                <span class="pillars-nav-title">Total Intercompany Control</span>
                <span class="pillars-nav-meta">3 capabilities ›</span>
              </span>
            </button>
            <button type="button" class="pillars-nav-item" data-pillar="2">
              <span class="pillars-nav-radio" aria-hidden="true"></span>
              <span class="pillars-nav-body">
                <span class="pillars-nav-num">03</span>
                <span class="pillars-nav-title">Unified Group Planning</span>
                <span class="pillars-nav-meta">3 capabilities ›</span>
              </span>
            </button>
          </nav>
          <div class="pillars-panel">
            <div class="pillars-panel-content is-active" data-pillar-panel="0">
              <span class="pillars-panel-watermark" aria-hidden="true">01</span>
              <div class="pillars-panel-head">
                <div class="pillars-panel-eyebrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg> Pillar 01</div>
                <h3 class="h3">Automated Group Financial Reporting</h3>
                <p class="body">Five connected steps — from Group Reporting Template setup to consolidated report generation.</p>
              </div>
              <div class="pillars-cap-list">
                <div class="pillars-cap"><div class="pillars-cap-ic"><svg viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="pillars-cap-body"><h4>Create GRT</h4><p>Define your Group Reporting Template once — the consolidated chart of accounts every entity rolls up into.</p></div></div>
                <div class="pillars-cap"><div class="pillars-cap-ic"><svg viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="pillars-cap-body"><h4>Map GRT with AI Assistant</h4><p>Connect entity GL accounts from Xero and QuickBooks with GATHER AI recommendations and confidence scoring.</p></div></div>
                <div class="pillars-cap"><div class="pillars-cap-ic"><svg viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="pillars-cap-body"><h4>Autojournals to Reports</h4><p>Automated consolidation journals, audit-ready working papers with three-level drill-down, and industry-specific reports.</p></div></div>
              </div>
              <div class="wf-cta-row" style="margin-top:20px">
                <a href="modules/group-reporting.html" class="btn btn--outline">Explore Group Reporting <svg class="a" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
              </div>
            </div>
            <div class="pillars-panel-content" data-pillar-panel="1">
              <span class="pillars-panel-watermark" aria-hidden="true">02</span>
              <div class="pillars-panel-head">
                <div class="pillars-panel-eyebrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M2 12h20"/></svg> Pillar 02</div>
                <h3 class="h3">Total Intercompany Control</h3>
                <p class="body">A central hub for intercompany activity — automated, reconciled, and always in balance.</p>
              </div>
              <div class="pillars-cap-list">
                <div class="pillars-cap"><div class="pillars-cap-ic"><svg viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="pillars-cap-body"><h4>Quadruple-Entry Posting</h4><p>Automate journals, invoices, and bills with counterparty entries syncing in real time to Xero and QuickBooks.</p></div></div>
                <div class="pillars-cap"><div class="pillars-cap-ic"><svg viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="pillars-cap-body"><h4>Real-Time In-Month Visibility</h4><p>Matrix and timeline views give finance teams instant visibility of intercompany balances throughout the month.</p></div></div>
                <div class="pillars-cap"><div class="pillars-cap-ic"><svg viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="pillars-cap-body"><h4>Continuous Reconciliation</h4><p>Automated intercompany reconciliation validated against consolidation working papers.</p></div></div>
              </div>
              <div class="wf-cta-row" style="margin-top:20px">
                <a href="modules/intercompany-control.html" class="btn btn--outline">Explore Intercompany Control <svg class="a" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
              </div>
            </div>
            <div class="pillars-panel-content" data-pillar-panel="2">
              <span class="pillars-panel-watermark" aria-hidden="true">03</span>
              <div class="pillars-panel-head">
                <div class="pillars-panel-eyebrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19h16M6 15l4-8 4 6 4-10"/></svg> Pillar 03</div>
                <h3 class="h3">Unified Group Planning</h3>
                <p class="body">Three connected steps — from divisional budgets through Group roll-up to actuals vs budget analysis.</p>
              </div>
              <div class="pillars-cap-list">
                <div class="pillars-cap"><div class="pillars-cap-ic"><svg viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="pillars-cap-body"><h4>Divisional Budgets</h4><p>Create and delegate budgets at division, department, or functional level across entities.</p></div></div>
                <div class="pillars-cap"><div class="pillars-cap-ic"><svg viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="pillars-cap-body"><h4>Group Budget Roll-Up</h4><p>Roll up divisional and entity budgets automatically into a consolidated Group budget.</p></div></div>
                <div class="pillars-cap"><div class="pillars-cap-ic"><svg viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="pillars-cap-body"><h4>Actuals vs Budget</h4><p>Compare budgets to live actuals with three-level variance drill-down across the Group.</p></div></div>
              </div>
              <div class="wf-cta-row" style="margin-top:20px">
                <a href="modules/group-planning.html" class="btn btn--outline">Explore Group Planning <svg class="a" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
              </div>
            </div>
          </div>
        </div>
        <div class="pillars-footer">
          <div class="pillars-dots" role="tablist" aria-label="Pillar pagination">
            <button type="button" class="pillars-dot is-active" aria-label="Pillar 1"></button>
            <button type="button" class="pillars-dot" aria-label="Pillar 2"></button>
            <button type="button" class="pillars-dot" aria-label="Pillar 3"></button>
          </div>
          <div class="pillars-arrows">
            <button type="button" class="pillars-arrow pillars-arrow--prev" aria-label="Previous pillar" disabled><svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            <button type="button" class="pillars-arrow pillars-arrow--next is-primary" aria-label="Next pillar"><svg viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          </div>
        </div>
      </div>
    </div>
  </div>


  <!-- 4 LEVELS — DATA INTEGRITY -->
  <div class="levels-section" id="data-integrity">
    <div class="wrap">
      <div class="sec-head sr">
        <div class="eyebrow">Data Integrity</div>
        <h2 class="h2">Unrivaled Data Integrity: From Group Results to Individual Transactions</h2>
        <p class="lead">Don&rsquo;t settle for &ldquo;black box&rdquo; reports. GATHER.nexus features a unique rapid drill-down functionality that ensures total validation.</p>
      </div>
      <div class="levels-flow sr sr-d1" aria-label="Drill-down levels">
        <span class="levels-flow-item">Group level</span>
        <span class="levels-flow-arrow" aria-hidden="true">→</span>
        <span class="levels-flow-item">Entity level</span>
        <span class="levels-flow-arrow" aria-hidden="true">→</span>
        <span class="levels-flow-item">Ledger level</span>
        <span class="levels-flow-arrow" aria-hidden="true">→</span>
        <span class="levels-flow-item is-active">Transaction level</span>
      </div>
      <div class="levels-stack">
        <div class="levels-card sr sr-d1">
          <div class="levels-card-left">
            <span class="levels-card-num">01</span>
            <div class="levels-card-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19h16M6 15l4-8 4 6 4-10"/></svg></div>
          </div>
          <div class="levels-card-body"><h4>Consolidated Group Result</h4><p>Review your Consolidated Group Result.</p></div>
          <span class="levels-card-tag">Group level</span>
        </div>
        <div class="levels-bridge sr"><svg viewBox="0 0 16 16" fill="none"><path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> Drill into entity level</div>
        <div class="levels-card sr sr-d2">
          <div class="levels-card-left">
            <span class="levels-card-num">02</span>
            <div class="levels-card-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg></div>
          </div>
          <div class="levels-card-body"><h4>Legal Entity Level</h4><p>Drill down into the Legal Entity level.</p></div>
          <span class="levels-card-tag">Entity level</span>
        </div>
        <div class="levels-bridge sr"><svg viewBox="0 0 16 16" fill="none"><path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> Drill into ledger code</div>
        <div class="levels-card sr sr-d3">
          <div class="levels-card-left">
            <span class="levels-card-num">03</span>
            <div class="levels-card-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
          </div>
          <div class="levels-card-body"><h4>QuickBooks / Xero Ledger Code</h4><p>Drill down into the QuickBooks / Xero Ledger Code.</p></div>
          <span class="levels-card-tag">Ledger level</span>
        </div>
        <div class="levels-bridge sr"><svg viewBox="0 0 16 16" fill="none"><path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> Drill into transaction data</div>
        <div class="levels-card is-highlight sr">
          <div class="levels-card-left">
            <span class="levels-card-num">04</span>
            <div class="levels-card-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg></div>
          </div>
          <div class="levels-card-body"><h4>Individual Transaction-Level Data</h4><p>See the Individual Transaction-Level Data in seconds.</p></div>
          <span class="levels-card-tag">Transaction level</span>
        </div>
      </div>
      <div class="levels-summary sr sr-d2">
        <div class="levels-summary-stat"><strong>4 levels</strong><span>In seconds</span></div>
        <p>Don&rsquo;t settle for &ldquo;black box&rdquo; reports. GATHER.nexus features a unique rapid drill-down functionality — from your Consolidated Group Result all the way to Individual Transaction-Level Data in seconds — ensuring total validation at every level.</p>
      </div>
    </div>
  </div>


`;

function patchHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  if (html.includes(MARKER)) {
    console.log(`${path.basename(filePath)} already has restored sections — skipping HTML insert.`);
    return html;
  }

  if (!html.includes(INSERT_BEFORE)) {
    throw new Error(`Insert marker not found in ${filePath}`);
  }

  html = html.replace(INSERT_BEFORE, `${SECTIONS}${INSERT_BEFORE}`);

  if (!html.includes('page-extensions.css')) {
    html = html.replace('</head>', '<link rel="stylesheet" href="assets/page-extensions.css"/>\n</head>');
  }

  html = html.replace(
    '#platform,#product-journey,[id^="the-"],#intercompany-control,#group-reporting,#group-planning,#gather-difference,#modules{scroll-margin-top:88px}',
    '#platform,#product-journey,[id^="the-"],#three-pillars,#data-integrity,#intercompany-control,#group-reporting,#group-planning,#gather-difference,#modules{scroll-margin-top:88px}'
  );

  if (!html.includes('href="#three-pillars"')) {
    html = html.replace(
      '<li><a href="#the-problem">Platform Overview</a></li>',
      '<li><a href="#the-problem">Platform Overview</a></li>\n          <li><a href="#three-pillars">Three Pillars</a></li>\n          <li><a href="#data-integrity">Data Integrity</a></li>'
    );
  }

  return html;
}

const homeHtml = patchHtml(HOME);
fs.writeFileSync(HOME, homeHtml, 'utf8');
fs.writeFileSync(INDEX, homeHtml, 'utf8');
console.log('Restored Three Pillars and Data Integrity sections in HomePage.html and index.html');
