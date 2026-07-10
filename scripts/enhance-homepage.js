'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HOME = path.join(ROOT, 'HomePage.html');
const MARKER = '<!-- GATHER-ENHANCEMENTS -->';

const checkSvg = '<svg viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const arrowSvg = '<svg class="a" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const screenshotIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10.5" r="1.5"/><path d="M21 16l-5.5-5.5L5 20"/></svg>';

function screenshotFrame(label, hint, extraClass) {
  return `<div class="screenshot-frame${extraClass ? ' ' + extraClass : ''}" role="img" aria-label="${label} placeholder">
  <div class="screenshot-frame__inner">
    <div class="screenshot-frame__ic">${screenshotIcon}</div>
    <span class="screenshot-frame__label">${label}</span>
    <p class="screenshot-frame__hint">${hint}</p>
    <span class="screenshot-frame__tag">GATHER platform screenshot</span>
  </div>
</div>`;
}

const THREE_PILLARS = `
  ${MARKER}
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
                <div class="pillars-cap"><div class="pillars-cap-ic">${checkSvg}</div><div class="pillars-cap-body"><h4>Create GRT</h4><p>Define your Group Reporting Template once — the consolidated chart of accounts every entity rolls up into.</p></div></div>
                <div class="pillars-cap"><div class="pillars-cap-ic">${checkSvg}</div><div class="pillars-cap-body"><h4>Map GRT with AI Assistant</h4><p>Connect entity GL accounts from Xero and QuickBooks with GATHER AI recommendations and confidence scoring.</p></div></div>
                <div class="pillars-cap"><div class="pillars-cap-ic">${checkSvg}</div><div class="pillars-cap-body"><h4>Autojournals to Reports</h4><p>Automated consolidation journals, audit-ready working papers with three-level drill-down, and industry-specific reports.</p></div></div>
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
                <div class="pillars-cap"><div class="pillars-cap-ic">${checkSvg}</div><div class="pillars-cap-body"><h4>Quadruple-Entry Posting</h4><p>Automate journals, invoices, and bills with counterparty entries syncing in real time to Xero and QuickBooks.</p></div></div>
                <div class="pillars-cap"><div class="pillars-cap-ic">${checkSvg}</div><div class="pillars-cap-body"><h4>Real-Time In-Month Visibility</h4><p>Matrix and timeline views give finance teams instant visibility of intercompany balances throughout the month.</p></div></div>
                <div class="pillars-cap"><div class="pillars-cap-ic">${checkSvg}</div><div class="pillars-cap-body"><h4>Continuous Reconciliation</h4><p>Automated intercompany reconciliation validated against consolidation working papers.</p></div></div>
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
                <div class="pillars-cap"><div class="pillars-cap-ic">${checkSvg}</div><div class="pillars-cap-body"><h4>Divisional Budgets</h4><p>Create and delegate budgets at division, department, or functional level across entities.</p></div></div>
                <div class="pillars-cap"><div class="pillars-cap-ic">${checkSvg}</div><div class="pillars-cap-body"><h4>Group Budget Roll-Up</h4><p>Roll up divisional and entity budgets automatically into a consolidated Group budget.</p></div></div>
                <div class="pillars-cap"><div class="pillars-cap-ic">${checkSvg}</div><div class="pillars-cap-body"><h4>Actuals vs Budget</h4><p>Compare budgets to live actuals with three-level variance drill-down across the Group.</p></div></div>
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
`;

const FOUR_LEVELS = `
  <!-- 4 LEVELS — DATA INTEGRITY -->
  <div class="unrivaled-data-integrity-main-box top-space bottom-space" id="data-integrity">
    <div class="wrap">
      <div class="sec-head sr">
        <div class="eyebrow">Data Integrity</div>
        <h2 class="h2">
          <span class="h2-title-line">Unrivaled Data Integrity: From Group</span>
          <span class="h2-title-line">Results to Individual Transactions</span>
        </h2>
        <p class="lead">Don't settle for "black box" reports. GATHER.nexus features a unique rapid drill-down functionality that ensures total validation.</p>
      </div>

      <div class="unrivaled-data-integrity-box">
        <div class="drill-section">

          <!-- Progress Stepper -->
          <div class="progress-stepper">
            <div class="step-item">
              <span class="step-dot"></span>
              <span>Group level</span>
            </div>
            <span class="step-arrow">→</span>
            <div class="step-item">
              <span class="step-dot"></span>
              <span>Entity level</span>
            </div>
            <span class="step-arrow">→</span>
            <div class="step-item">
              <span class="step-dot"></span>
              <span>Ledger level</span>
            </div>
            <span class="step-arrow">→</span>
            <div class="step-item step-active">
              <span class="step-dot"></span>
              <span>Transaction level</span>
            </div>
          </div>

          <!-- LEVEL 01 — GROUP -->
          <div class="level-block level-1">
            <div class="level-card">
              <div class="card-left">
                <span class="card-number">01</span>
                <span class="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="13" width="4" height="8" rx="1"></rect>
                    <rect x="9.5" y="8" width="4" height="13" rx="1"></rect>
                    <rect x="17" y="4" width="4" height="17" rx="1"></rect>
                    <line x1="1" y1="22" x2="23" y2="22"></line>
                  </svg>
                </span>
                <div class="card-content">
                  <p class="card-title">Consolidated Group Result</p>
                  <p class="card-desc">Review your Consolidated Group Result.</p>
                </div>
              </div>
              <span class="level-badge">GROUP LEVEL</span>
            </div>
          </div>

          <!-- Drill → Entity -->
          <div class="drill-label-row indent-2">
            <div class="drill-label">
              <span class="label-arrow">&gt;</span>
              <span class="label-text">Drill into Entity Level</span>
            </div>
          </div>

          <!-- LEVEL 02 — ENTITY -->
          <div class="level-block level-2">
            <div class="level-card">
              <div class="card-left">
                <span class="card-number">02</span>
                <span class="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="22" x2="21" y2="22"></line>
                    <path d="M5 22V8l7-5 7 5v14"></path>
                    <rect x="9" y="13" width="6" height="9" rx="1"></rect>
                  </svg>
                </span>
                <div class="card-content">
                  <p class="card-title">Legal Entity Level</p>
                  <p class="card-desc">Drill down into the Legal Entity level.</p>
                </div>
              </div>
              <span class="level-badge">ENTITY LEVEL</span>
            </div>
          </div>

          <!-- Drill → Ledger -->
          <div class="drill-label-row indent-3">
            <div class="drill-label">
              <span class="label-arrow">&gt;</span>
              <span class="label-text">Drill into Ledger Code</span>
            </div>
          </div>

          <!-- LEVEL 03 — LEDGER -->
          <div class="level-block level-3">
            <div class="level-card">
              <div class="card-left">
                <span class="card-number">03</span>
                <span class="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </span>
                <div class="card-content">
                  <p class="card-title">QuickBooks / Xero Ledger Code</p>
                  <p class="card-desc">Drill down into the QuickBooks / Xero Ledger Code.</p>
                </div>
              </div>
              <span class="level-badge">LEDGER LEVEL</span>
            </div>
          </div>

          <!-- Drill → Transaction -->
          <div class="drill-label-row indent-4">
            <div class="drill-label">
              <span class="label-arrow">&gt;</span>
              <span class="label-text">Drill into Transaction Data</span>
            </div>
          </div>

          <!-- LEVEL 04 — TRANSACTION -->
          <div class="level-block level-4">
            <div class="level-card">
              <div class="card-left">
                <span class="card-number number-dark">04</span>
                <span class="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="7" y1="12" x2="17" y2="12"></line>
                    <line x1="7" y1="15.5" x2="17" y2="15.5"></line>
                    <line x1="7" y1="19" x2="13" y2="19"></line>
                  </svg>
                </span>
                <div class="card-content">
                  <p class="card-title">Individual Transaction-Level Data</p>
                  <p class="card-desc">See the Individual Transaction-Level Data in seconds.</p>
                </div>
              </div>
              <span class="level-badge badge-filled">TRANSACTION LEVEL</span>
            </div>
          </div>

          <!-- Summary Box -->
          <div class="summary-box">
            <div class="summary-stat">
              <span class="stat-number">4 levels</span>
              <span class="stat-sub">in seconds</span>
            </div>
            <div class="summary-text">
              <p class="summary-para">
                <strong>Don't settle for "black box" reports.</strong>
                GATHER.nexus features a unique rapid drill-down functionality — from your
                Consolidated Group Result all the way to Individual Transaction-Level Data
                in seconds — ensuring total validation at every level.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

`;

const PLATFORM_FEATURES = `
  <!-- PLATFORM FEATURES SHOWCASE -->
  <div class="features-section" id="platform-features">
    <div class="wrap">
      <div class="sec-head sr">
        <div class="eyebrow">Platform Capabilities</div>
        <h2 class="h2">See How GATHER.nexus Works in Practice</h2>
        <p class="lead">Structured five-step Group Financial Reporting workflows with platform screenshots at every step — built for finance teams who need clarity, not complexity.</p>
      </div>

      <div class="feature-row sr">
        <div class="feature-row__media">
          ${screenshotFrame('Create Group Reporting Template', 'Replace with GATHER GRT creation screenshot', 'screenshot-frame--tall')}
        </div>
        <div class="feature-row__content">
          <div class="feature-row__pill">Group Financial Reporting</div>
          <h3 class="h3">Build Your Group Reporting Template</h3>
          <p class="body">Define the consolidated chart of accounts that every entity rolls up into — starting from industry templates or a custom structure ready to map entity ledgers from Xero and QuickBooks.</p>
          <div class="feature-cards">
            <div class="feature-card"><div class="feature-card-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div><div><h5>Industry templates</h5><p>Pre-designed structures for SaaS, Manufacturing, Healthcare, and more.</p></div></div>
            <div class="feature-card"><div class="feature-card-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v20M2 12h20"/></svg></div><div><h5>Reusable GRT structure</h5><p>Set up once and reuse across every consolidation period.</p></div></div>
          </div>
        </div>
      </div>

      <div class="feature-row feature-row--reverse sr sr-d1">
        <div class="feature-row__media">
          ${screenshotFrame('AI-Assisted GL Mapping', 'Replace with GATHER AI mapping interface screenshot', 'screenshot-frame--tall')}
        </div>
        <div class="feature-row__content">
          <div class="feature-row__pill">Group Financial Reporting</div>
          <h3 class="h3">Map GRT with AI Assistant</h3>
          <p class="body">Connect each entity&rsquo;s General Ledger to your GRT with drag-and-drop mapping assisted by GATHER AI — with confidence scores and clear logic for every recommended connection.</p>
          <div class="feature-cards">
            <div class="feature-card"><div class="feature-card-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2a4 4 0 0 1 4 4v1h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2V6a4 4 0 0 1 4-4z"/></svg></div><div><h5>Smart recommendations</h5><p>AI suggests ledger connections with confidence scoring.</p></div></div>
            <div class="feature-card"><div class="feature-card-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/></svg></div><div><h5>Privacy-safe AI</h5><p>Only account name, ID, and type shared with the AI engine.</p></div></div>
          </div>
        </div>
      </div>

      <div class="feature-row sr sr-d2">
        <div class="feature-row__media">
          ${screenshotFrame('Intercompany Matrix View', 'Replace with GATHER intercompany matrix / timeline screenshot', 'screenshot-frame--tall')}
        </div>
        <div class="feature-row__content">
          <div class="feature-row__pill">Intercompany Control</div>
          <h3 class="h3">Real-Time Intercompany Visibility</h3>
          <p class="body">Matrix and timeline views show intercompany balances across all entity pairs — with continuous reconciliation validated against working papers.</p>
          <div class="feature-cards">
            <div class="feature-card"><div class="feature-card-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></div><div><h5>Matrix view</h5><p>Entity-pair balance visibility at a glance.</p></div></div>
            <div class="feature-card"><div class="feature-card-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg></div><div><h5>Timeline view</h5><p>In-month activity tracking across the Group.</p></div></div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

function moduleCta(href) {
  return `<div class="wf-cta-row">
  <a href="${href}" class="btn btn--primary">Find out more ${arrowSvg}</a>
</div>`;
}

function patch() {
  let html = fs.readFileSync(HOME, 'utf8');

  if (html.includes('id="product-journey"')) {
    console.log('HomePage.html already uses V1 product journey — skipping legacy enhance-homepage.js patches.');
    return;
  }

  if (html.includes(MARKER)) {
    console.log('HomePage.html already enhanced — skipping HTML insertions.');
    return;
  }

  /* CSS + JS links */
  if (!html.includes('page-extensions.css')) {
    html = html.replace(
      '</head>',
      '<link rel="stylesheet" href="/assets/page-extensions.css"/>\n</head>'
    );
  }

  /* Scroll margin for new section ids */
  html = html.replace(
    '#platform,[id^="the-"],#intercompany-control,#group-reporting,#group-planning,#gather-difference,#modules{scroll-margin-top:88px}',
    '#platform,[id^="the-"],#three-pillars,#data-integrity,#platform-features,#intercompany-control,#group-reporting,#group-planning,#gather-difference,#modules{scroll-margin-top:88px}'
  );

  /* Insert Three Pillars + 4 Levels after the-solution section */
  html = html.replace(
    '  <!-- INTERCOMPANY CONTROL -->',
    THREE_PILLARS + '\n' + FOUR_LEVELS + '\n\n  <!-- INTERCOMPANY CONTROL -->'
  );

  /* Insert Platform Features before GATHER Difference */
  html = html.replace(
    '  <!-- THE GATHER DIFFERENCE -->',
    PLATFORM_FEATURES + '\n\n  <!-- THE GATHER DIFFERENCE -->'
  );

  /* Module CTAs */
  html = html.replace(
    /(<div class="wf-section" id="intercompany-control">[\s\S]*?<\/ul>)(\s*\n\s*<\/div>\s*\n\s*<div class="wf-vis)/,
    '$1' + moduleCta('modules/intercompany-control.html') + '$2'
  );
  html = html.replace(
    /(<div class="wf-section wf-section--alt" id="group-reporting">[\s\S]*?<\/ul>)(\s*\n\s*<\/div>\s*\n\s*<div class="wf-vis)/,
    '$1' + moduleCta('modules/group-reporting.html') + '$2'
  );
  html = html.replace(
    /(<div class="wf-section" id="group-planning">[\s\S]*?<\/ul>)(\s*\n\s*<\/div>\s*\n\s*<div class="wf-vis)/,
    '$1' + moduleCta('modules/group-planning.html') + '$2'
  );

  /* Nav dropdown updates */
  html = html.replace(
    '<li><a href="#the-solution">Platform Overview</a></li>',
    '<li><a href="#the-solution">Platform Overview</a></li>\n          <li><a href="#three-pillars">Three Pillars</a></li>\n          <li><a href="#data-integrity">Data Integrity</a></li>'
  );
  html = html.replace(
    '<li><a href="#intercompany-control">Intercompany Control</a></li>',
    '<li><a href="modules/intercompany-control.html">Intercompany Control</a></li>'
  );
  html = html.replace(
    '<li><a href="#group-reporting">Group Financial Reporting</a></li>',
    '<li><a href="modules/group-reporting.html">Group Financial Reporting</a></li>'
  );
  html = html.replace(
    '<li><a href="#group-planning">Group Financial Planning</a></li>',
    '<li><a href="modules/group-planning.html">Group Financial Planning</a></li>'
  );
  html = html.replace(
    '<li><a href="#gather-difference">The GATHER Difference</a></li>',
    '<li><a href="#platform-features">Platform Features</a></li>\n          <li><a href="#gather-difference">The GATHER Difference</a></li>'
  );

  /* Footer product links */
  html = html.replace(
    '<li><a href="#">Group Financial Reporting</a></li>',
    '<li><a href="modules/group-reporting.html">Group Financial Reporting</a></li>'
  );
  html = html.replace(
    '<li><a href="#">Intercompany Control</a></li>',
    '<li><a href="modules/intercompany-control.html">Intercompany Control</a></li>'
  );
  html = html.replace(
    '<li><a href="#">Group Financial Planning</a></li>',
    '<li><a href="modules/group-planning.html">Group Financial Planning</a></li>'
  );

  /* Page extensions JS */
  if (!html.includes('page-extensions.js')) {
    html = html.replace(
      '<script src="/review/review.js" defer></script>',
      '<script src="/assets/page-extensions.js" defer></script>\n<script src="/review/review.js" defer></script>'
    );
  }

  fs.writeFileSync(HOME, html, 'utf8');
  console.log('HomePage.html enhanced successfully.');
}

patch();
