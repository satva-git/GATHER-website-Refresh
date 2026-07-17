'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HOME = path.join(ROOT, 'HomePage.html');

function extractImages(html) {
  const start = html.indexOf('<!-- ═════ PLATFORM WORKFLOW ═════ -->');
  const end = html.indexOf('<!-- Legacy anchor for nav -->');
  const chunk = html.slice(start, end);
  return [...chunk.matchAll(/<img class="wf-problem-img" src="(data:image[^"]+)"/g)].map((m) => m[1]);
}

function checkItem(text) {
  return `<li><div class="check-ic"><svg viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>${text}</li>`;
}

function buildJourneySection(images) {
  const [imgOverview, imgSolution, imgIC, imgGR, imgGP] = images;
  const arrow = `<svg class="journey-step-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  return `<!-- ═════ PRODUCT JOURNEY (TAB STORYTELLING) ═════ -->
<section id="platform" class="journey-section bg-paper" aria-labelledby="journey-heading">
  <div class="wrap">
    <header class="journey-intro sr">
      <div class="eyebrow">Product journey</div>
      <h2 class="h2" id="journey-heading">From fragmented spreadsheets to one connected group workflow</h2>
      <p class="lead">Dive into the workflow that finance teams follow with GATHER.nexus.</p>
    </header>

    <div class="journey-shell sr sr-d1" id="product-journey">
      <nav class="journey-rail" aria-label="Product workflow steps">
        <button type="button" class="journey-step is-active" data-journey="overview" aria-controls="journey-panel-overview" aria-selected="true">
          <span class="journey-step-num">01</span>
          <span class="journey-step-text">
            <span class="journey-step-kicker">Platform overview</span>
            <span class="journey-step-label">Finance teams in multi-entity groups</span>
          </span>
          ${arrow}
        </button>
        <button type="button" class="journey-step" data-journey="solution" aria-controls="journey-panel-solution" aria-selected="false">
          <span class="journey-step-num">02</span>
          <span class="journey-step-text">
            <span class="journey-step-kicker">The solution</span>
            <span class="journey-step-label">One integrated workflow</span>
          </span>
          ${arrow}
        </button>
        <button type="button" class="journey-step" data-journey="intercompany" aria-controls="journey-panel-intercompany" aria-selected="false">
          <span class="journey-step-num">03</span>
          <span class="journey-step-text">
            <span class="journey-step-kicker">Module 01</span>
            <span class="journey-step-label">Intercompany control</span>
          </span>
          ${arrow}
        </button>
        <button type="button" class="journey-step" data-journey="reporting" aria-controls="journey-panel-reporting" aria-selected="false">
          <span class="journey-step-num">04</span>
          <span class="journey-step-text">
            <span class="journey-step-kicker">Module 02</span>
            <span class="journey-step-label">Group financial reporting</span>
          </span>
          ${arrow}
        </button>
        <button type="button" class="journey-step" data-journey="planning" aria-controls="journey-panel-planning" aria-selected="false">
          <span class="journey-step-num">05</span>
          <span class="journey-step-text">
            <span class="journey-step-kicker">Module 05</span>
            <span class="journey-step-label">Group planning &amp; actuals vs budget</span>
          </span>
        </button>
        <div class="journey-rail-progress" aria-hidden="true"><span class="journey-rail-progress-fill"></span></div>
      </nav>

      <div class="journey-stage">
        <article class="journey-panel is-active" id="journey-panel-overview" data-journey-panel="overview" role="tabpanel" aria-labelledby="journey-step-overview">
          <div class="journey-panel-grid">
            <div class="journey-copy">
              <div class="wf-pill" id="the-problem">GATHER.NEXUS — Platform Overview</div>
              <h3 class="h3">The Platform for Finance Teams in Xero &amp; QuickBooks Multi-Entity Groups</h3>
              <p class="wf-body">GATHER.nexus helps Finance teams manage <strong>Intercompany Control</strong>, <strong>Group Financial Reporting</strong>, and <strong>Group Financial Planning</strong> on one unified platform.</p>
              <p class="wf-body">For multi-entity Groups in Xero or QuickBooks, processes are often fragmented across spreadsheets — creating slow, error-prone month-end closes.</p>
              <ul class="checks journey-checks">
                ${checkItem('Intercompany Control')}
                ${checkItem('Group Financial Reporting')}
                ${checkItem('Group Financial Planning')}
              </ul>
            </div>
            <div class="journey-visual">
              <div class="journey-visual-frame">
                <div class="journey-visual-caption"><span>The challenge</span><span>Fragmented multi-entity finance</span></div>
                <img src="${imgOverview}" alt="Diagram showing fragmented spreadsheets across multi-entity finance teams" loading="lazy" decoding="async"/>
              </div>
              <div class="journey-flow-mini" aria-hidden="true">
                <span>Spreadsheets</span><span class="journey-flow-dot"></span><span>Disconnected tools</span><span class="journey-flow-dot"></span><span>Manual close</span>
              </div>
            </div>
          </div>
        </article>

        <article class="journey-panel" id="journey-panel-solution" data-journey-panel="solution" role="tabpanel" hidden>
          <div class="journey-panel-grid">
            <div class="journey-copy">
              <div class="wf-pill" id="the-solution">GATHER.NEXUS — The Solution</div>
              <h3 class="h3">The Solution</h3>
              <p class="wf-body">GATHER.nexus provides a fully integrated workflow covering <strong>Intercompany Control</strong>, <strong>Group Financial Reporting</strong>, and <strong>Group Financial Planning</strong>.</p>
              <p class="wf-body">Each module is purpose-built for Group finance — replacing disconnected spreadsheets with a single, auditable workflow.</p>
              <ul class="checks journey-checks">
                ${checkItem('Intercompany Control')}
                ${checkItem('Group Financial Reporting')}
                ${checkItem('Group Financial Planning')}
              </ul>
            </div>
            <div class="journey-visual">
              <div class="journey-visual-frame">
                <div class="journey-visual-caption"><span>One unified Platform</span><span>Xero &amp; QuickBooks connected</span></div>
                <img src="${imgSolution}" alt="GATHER.nexus unified workflow connecting Xero and QuickBooks entities" loading="lazy" decoding="async"/>
              </div>
              <div class="journey-flow-mini" aria-hidden="true">
                <span>Xero / QB</span><span class="journey-flow-dot"></span><span>GATHER.nexus</span><span class="journey-flow-dot"></span><span>Group outputs</span>
              </div>
            </div>
          </div>
        </article>

        <article class="journey-panel" id="journey-panel-intercompany" data-journey-panel="intercompany" role="tabpanel" hidden>
          <div class="journey-panel-grid">
            <div class="journey-copy">
              <div class="wf-pill" id="intercompany-control">Module 01 — Intercompany Control</div>
              <h3 class="h3">Intercompany Control</h3>
              <p class="wf-body">A central hub for intercompany activity across all Group entities — with full balance visibility and always-accurate relationships.</p>
              <p class="wf-body">Built on a <strong>quadruple-entry posting framework</strong>, automating journals, invoices, and bills synced to Xero and QuickBooks.</p>
              <ul class="checks journey-checks">
                ${checkItem('Quadruple-entry posting framework')}
                ${checkItem('Multi-currency support')}
                ${checkItem('Recharge mark-ups, discounts and splits (highly configurable)')}
                ${checkItem('Full transaction audit trail')}
              </ul>
              <div class="wf-cta-row"><a href="modules/intercompany-control.html" class="btn btn--primary">Find out more <svg class="a" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div>
            </div>
              <div class="journey-visual">
              <div class="journey-visual-frame">
                <div class="journey-visual-caption"><span>Module 01</span><span>Intercompany workflow</span></div>
                <img src="${imgIC}" alt="Intercompany control workflow with posting, matrix views, and reconciliation" loading="lazy" decoding="async"/>
              </div>
            </div>
          </div>
        </article>

        <article class="journey-panel" id="journey-panel-reporting" data-journey-panel="reporting" role="tabpanel" hidden>
          <div class="journey-panel-grid">
            <div class="journey-copy">
              <div class="wf-pill" id="group-reporting">Module 02 — Group Financial Reporting</div>
              <h3 class="h3">Group Financial Reporting</h3>
              <p class="wf-body">A five-step consolidation workflow — from <strong>Group Reporting Template</strong> setup through AI-assisted mapping, <strong>autojournals</strong>, and <strong>Working Papers</strong> to final reports.</p>
              <p class="wf-body">Native handling of complex consolidation scenarios and audit-ready <strong>FX differences in Reserves</strong> tracking.</p>
              <ul class="checks journey-checks">
                ${checkItem('Create GRT — build your Group Reporting Template')}
                ${checkItem('Map GRT with AI Assistant')}
                ${checkItem('Create Autojournals — automated consolidation journals')}
                ${checkItem('Review Working Papers — three-level drill-down')}
                ${checkItem('Generate Reports — industry-specific consolidated reports')}
              </ul>
              <div class="wf-cta-row"><a href="modules/group-reporting.html" class="btn btn--primary">Find out more <svg class="a" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div>
            </div>
            <div class="journey-visual">
              <div class="journey-visual-frame">
                <div class="journey-visual-caption"><span>Module 02</span><span>Consolidation workflow</span></div>
                <img src="${imgGR}" alt="Group financial reporting workflow from template through consolidation" loading="lazy" decoding="async"/>
              </div>
              <div class="journey-module-steps" aria-label="Reporting workflow steps">
                <div class="journey-module-step"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg><span>GRT</span></div>
                <div class="journey-module-step"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2a4 4 0 0 1 4 4v1h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2V6a4 4 0 0 1 4-4z"/></svg><span>Map</span></div>
                <div class="journey-module-step"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 19h16M6 15l4-8 4 6 4-10"/></svg><span>Report</span></div>
              </div>
            </div>
          </div>
        </article>

        <article class="journey-panel" id="journey-panel-planning" data-journey-panel="planning" role="tabpanel" hidden>
          <div class="journey-panel-grid">
            <div class="journey-copy">
              <div class="wf-pill" id="group-planning">Module 05 — Group Financial Planning</div>
              <h3 class="h3">Integrated Group Planning &amp; Actuals vs Budget</h3>
              <p class="wf-body">Create <strong>divisional and functional budgets</strong>, roll them up into a consolidated <strong>Group budget</strong>, then compare against live actuals across the Group.</p>
              <p class="wf-body">A structured, delegated planning workflow connected to intercompany control and group reporting in one unified performance view.</p>
              <ul class="checks journey-checks">
                ${checkItem('Create divisional/functional budgets')}
                ${checkItem('Roll up budgets to create a Group budget')}
                ${checkItem('Compare budgets to actuals — three-level variance drill-down')}
              </ul>
              <div class="wf-cta-row"><a href="modules/group-planning.html" class="btn btn--primary">Find out more <svg class="a" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div>
            </div>
            <div class="journey-visual">
              <div class="journey-visual-frame">
                <div class="journey-visual-caption"><span>Module 05</span><span>Planning &amp; variance</span></div>
                <img src="${imgGP}" alt="Group planning workflow with budget roll-up and actuals vs budget analysis" loading="lazy" decoding="async"/>
              </div>
              <div class="journey-module-steps" aria-label="Planning workflow steps">
                <div class="journey-module-step"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 19h16M6 15l4-8 4 6 4-10"/></svg><span>Budget</span></div>
                <div class="journey-module-step"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v20M2 12h20"/></svg><span>Roll-up</span></div>
                <div class="journey-module-step"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg><span>Variance</span></div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <footer class="journey-controls">
        <button type="button" class="journey-nav-btn journey-nav-btn--prev" aria-label="Previous step" disabled>
          <svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Previous
        </button>
        <div class="journey-dots" role="tablist" aria-label="Journey pagination"></div>
        <button type="button" class="journey-nav-btn journey-nav-btn--next" aria-label="Next step">
          Next
          <svg viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </footer>
    </div>
  </div>

  <!-- ONE CONNECTED WORKFLOW -->
  <div class="wrap">
    <div class="connected-workflow sr" id="gather-difference">
      <header class="connected-workflow-head">
        <div class="wf-pill">The GATHER Difference</div>
        <h2 class="h2">One Platform. One Connected Workflow.</h2>
        <p class="lead">Intercompany control, consolidation, and planning are not separate tools — they flow together in one auditable path.</p>
      </header>
      <div class="connected-pipeline" role="tablist" aria-label="Connected workflow stages">
        <button type="button" class="connected-node is-active" role="tab" aria-selected="true" data-connected="ic">
          <span class="connected-node-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12h16M12 4v16"/></svg></span>
          <span class="connected-node-label">Intercompany</span>
        </button>
        <span class="connected-connector" aria-hidden="true"></span>
        <button type="button" class="connected-node" role="tab" aria-selected="false" data-connected="wp">
          <span class="connected-node-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span>
          <span class="connected-node-label">Working papers</span>
        </button>
        <span class="connected-connector" aria-hidden="true"></span>
        <button type="button" class="connected-node" role="tab" aria-selected="false" data-connected="con">
          <span class="connected-node-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 19h16M6 15l4-8 4 6 4-10"/></svg></span>
          <span class="connected-node-label">Consolidation</span>
        </button>
        <span class="connected-connector" aria-hidden="true"></span>
        <button type="button" class="connected-node" role="tab" aria-selected="false" data-connected="plan">
          <span class="connected-node-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg></span>
          <span class="connected-node-label">Planning</span>
        </button>
      </div>
      <div class="connected-detail">
        <article class="connected-panel is-active" data-connected-panel="ic" role="tabpanel">
          <h4>One Unified Workflow</h4>
          <p>From intercompany transactions through consolidation working papers to group actuals and budget variance — every step is connected in one auditable workflow.</p>
        </article>
        <article class="connected-panel" data-connected-panel="wp" role="tabpanel" hidden>
          <h4>Audit-ready by design</h4>
          <p>Detailed consolidation working papers, full transaction audit trails, and FX differences in reserves tracking — built for audit and review, not spreadsheet reconstruction.</p>
        </article>
        <article class="connected-panel" data-connected-panel="con" role="tabpanel" hidden>
          <h4>Multi-currency, multi-entity scale</h4>
          <p>Purpose-built for Group finance — scaling across entities, currencies, and periods with three-level drill-down for validation and variance analysis.</p>
        </article>
        <article class="connected-panel" data-connected-panel="plan" role="tabpanel" hidden>
          <h4>Integrated planning &amp; reporting</h4>
          <p>Collaborative budgeting rolls up natively to the consolidated Group view — connected to intercompany and reporting modules in one unified performance view.</p>
        </article>
      </div>
    </div>
  </div>
</section>

`;
}

const PRICING_SECTION = `<!-- ═════ PRICING ═════ -->
<section class="section bg-paper-2" id="pricing">
  <div class="wrap">
    <div class="pri-head sr">
      <div class="pri-head-l">
        <div class="eyebrow">Pricing</div>
        <h2 class="h2" style="margin-top:10px">Pay for the modules and groups you manage</h2>
        <p class="lead" style="margin-top:6px">Monthly per-module subscription, unlimited companies per group.<br>All plans include a 30-day free trial.</p>
      </div>
      <div class="pri-cta-row">
        <a href="https://app.gather.nexus/auth/user/signup" class="btn btn--primary">Start free trial</a>
      </div>
    </div>

    <div class="pricing-table-wrap sr">
      <table class="pricing-table">
        <colgroup>
          <col style="width:28%">
          <col style="width:18%">
          <col style="width:18%">
          <col style="width:18%">
          <col style="width:18%">
        </colgroup>
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col">
              <div class="pt-audience">Finance teams</div>
              <div class="pt-groups">1 group<br><span class="small">(unlimited companies)</span></div>
            </th>
            <th scope="col" class="pt-featured">
              <div class="pt-audience">Fractional CFOs</div>
              <div class="pt-groups">2–3 groups</div>
            </th>
            <th scope="col">
              <div class="pt-audience">Fractional CFOs</div>
              <div class="pt-groups">4–5 groups</div>
            </th>
            <th scope="col">
              <div class="pt-audience">Fractional CFOs</div>
              <div class="pt-groups">Unlimited groups</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">
              <div class="pt-module">Group Reporting &amp; Group Planning</div>
              <p class="pt-desc-text">Consolidated P&amp;L, balance sheet, cash flow. Group budgeting, forecasting, and budget vs actual.</p>
            </th>
            <td><div class="pt-price">£70</div><span class="small">/ month</span></td>
            <td class="pt-featured"><div class="pt-price">£120</div><span class="small">/ month</span></td>
            <td><div class="pt-price">£160</div><span class="small">/ month</span></td>
            <td><div class="pt-price">£200</div><span class="small">/ month</span></td>
          </tr>
          <tr>
            <th scope="row">
              <div class="pt-module">Intercompany Control</div>
              <p class="pt-desc-text">IC posting, matching, elimination workflows, and balance reconciliation across all entities.</p>
            </th>
            <td><div class="pt-price">£50</div><span class="small">/ month</span></td>
            <td class="pt-featured"><div class="pt-price">£90</div><span class="small">/ month</span></td>
            <td><div class="pt-price">£120</div><span class="small">/ month</span></td>
            <td><div class="pt-price">£150</div><span class="small">/ month</span></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" class="pricing-foot">
              <strong>All plans include</strong>
              <ul class="pricing-includes">
                <li>30-day free trial with full platform access</li>
                <li>Unlimited companies per group</li>
                <li>One-click Xero &amp; QuickBooks integration</li>
                <li>GATHER AI account auto-mapping</li>
                <li>Mixed Xero + QuickBooks groups</li>
                <li>Cancel anytime · 14 days notice</li>
              </ul>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div class="pri-note-wrap sr"><p class="pri-note"><span class="ck">✓</span> No credit card required to start · Upgrade or downgrade with 14 days notice</p></div>
  </div>
</section>
`;

const JOURNEY_CSS = `
/* Product journey storytelling */
.journey-section{padding:88px 0 72px}
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
.journey-dot.is-active{width:22px;border-radius:var(--r-pill);background:var(--teal)}

/* Connected workflow */
.connected-workflow{
  margin-top:72px;padding:40px 36px 36px;border-radius:var(--r-lg);
  background:linear-gradient(145deg,var(--ink) 0%,var(--ink-2) 100%);
  border:1px solid rgba(255,255,255,.06);position:relative;overflow:hidden;
}
.connected-workflow::before{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(circle at 85% 15%,rgba(var(--teal-rgb),.18) 0%,transparent 55%);
}
.connected-workflow-head{text-align:center;max-width:560px;margin:0 auto 32px;position:relative;z-index:1}
.connected-workflow-head .wf-pill{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12);color:var(--teal);margin-bottom:14px}
.connected-workflow-head .h2{color:#fff;margin-bottom:10px;font-size:clamp(26px,3vw,36px)}
.connected-workflow-head .lead{color:var(--text-light);font-size:15px;margin:0 auto}
.connected-pipeline{
  display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:0;
  position:relative;z-index:1;margin-bottom:24px;
}
.connected-node{
  display:flex;flex-direction:column;align-items:center;gap:10px;min-width:96px;padding:14px 10px;
  border-radius:var(--r-md);border:1px solid transparent;background:transparent;
  transition:all .2s var(--ease);
}
.connected-node:hover{background:rgba(255,255,255,.04)}
.connected-node.is-active{background:rgba(var(--teal-rgb),.14);border-color:rgba(var(--teal-rgb),.35)}
.connected-node-ic{
  width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#fff;
  transition:all .2s var(--ease);
}
.connected-node.is-active .connected-node-ic{background:var(--teal);border-color:var(--teal);box-shadow:0 8px 24px rgba(var(--teal-rgb),.35)}
.connected-node-ic svg{width:20px;height:20px}
.connected-node-label{font-size:12px;font-weight:600;color:rgba(255,255,255,.75);text-align:center;line-height:1.3}
.connected-node.is-active .connected-node-label{color:#fff}
.connected-connector{width:32px;height:2px;background:linear-gradient(90deg,rgba(255,255,255,.15),rgba(var(--teal-rgb),.5));flex-shrink:0}
.connected-detail{
  position:relative;z-index:1;max-width:640px;margin:0 auto;text-align:center;
  padding:22px 28px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:var(--r-md);
}
.connected-panel{display:none;animation:journeyIn .3s var(--ease) both}
.connected-panel.is-active{display:block}
.connected-panel h4{font-size:16px;font-weight:700;color:#fff;margin-bottom:8px}
.connected-panel p{font-size:14px;line-height:1.6;color:rgba(197,209,224,.92);margin:0}

/* Pricing (V2 improvements) */
.pt-featured{background:rgba(var(--teal-rgb),.04)!important}
.pt-popular{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:var(--teal);padding:4px 10px;border-radius:var(--r-pill);margin-bottom:10px}
.pt-desc-text{font-size:13px;line-height:1.5;color:var(--text-mid);margin-top:10px;max-width:280px}
.pricing-foot{background:var(--paper-2)!important;text-align:left!important;padding:24px 22px!important}
.pricing-includes{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px 20px;margin-top:12px;list-style:none;padding:0}
.pricing-includes li{font-size:13px;color:var(--text-mid);display:flex;gap:8px;align-items:flex-start}
.pricing-includes li::before{content:'✓';color:var(--teal);font-weight:700;flex-shrink:0}

/* FAQ polish */
.faq-section .sec-head{margin-bottom:40px}
.faq-tab{border-radius:var(--r-pill);transition:all .18s var(--ease)}
.faq-tab.active,.faq-tab:hover{box-shadow:0 2px 8px rgba(var(--teal-rgb),.08)}
.faq-item{border-radius:var(--r-md);transition:border-color .18s var(--ease),box-shadow .18s var(--ease)}
.faq-item.open{border-color:var(--teal-line);box-shadow:0 4px 16px rgba(var(--teal-rgb),.06)}

@media(max-width:960px){
  .journey-shell{grid-template-columns:1fr}
  .journey-rail{flex-direction:row;overflow-x:auto;border-right:none;border-bottom:1px solid var(--line);padding:16px;gap:8px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
  .journey-rail::-webkit-scrollbar{display:none}
  .journey-rail-progress{display:none}
  .journey-step{min-width:200px;flex-shrink:0;padding:12px}
  .journey-step-arrow{display:none}
  .journey-panel-grid{grid-template-columns:1fr}
  .journey-stage{padding:24px 20px 20px}
  .connected-pipeline{gap:8px}
  .connected-connector{width:20px}
  .connected-workflow{padding:28px 20px 24px;margin-top:48px}
}
@media(max-width:640px){
  .journey-section{padding:56px 0 48px}
  .journey-controls{flex-wrap:wrap;justify-content:center}
  .connected-node{min-width:72px;padding:10px 6px}
  .connected-node-label{font-size:11px}
}
`;

function patchHtml() {
  let html = fs.readFileSync(HOME, 'utf8');
  const images = extractImages(html);
  if (images.length < 5) {
    throw new Error(`Expected 5 workflow images, found ${images.length}`);
  }

  // Scroll anchors
  html = html.replace(
    /#platform,\[id\^="the-"\],#three-pillars,#data-integrity,#platform-features,#intercompany-control,#group-reporting,#group-planning,#gather-difference,#modules\{scroll-margin-top:88px\}/,
    '#platform,#product-journey,[id^="the-"],#intercompany-control,#group-reporting,#group-planning,#gather-difference,#modules{scroll-margin-top:88px}'
  );

  // Replace platform workflow block
  const platformStart = html.indexOf('<!-- ═════ PLATFORM WORKFLOW ═════ -->');
  const platformEnd = html.indexOf('<!-- Legacy anchor for nav -->');
  if (platformStart === -1 || platformEnd === -1) throw new Error('Platform section markers not found');
  html = html.slice(0, platformStart) + buildJourneySection(images) + '\n' + html.slice(platformEnd);

  // Replace pricing
  const priStart = html.indexOf('<!-- ═════ PRICING ═════ -->');
  const priEnd = html.indexOf('<!-- ═════ FAQ ═════ -->');
  if (priStart === -1 || priEnd === -1) throw new Error('Pricing section markers not found');
  html = html.slice(0, priStart) + PRICING_SECTION + '\n' + html.slice(priEnd);

  // Inject CSS before closing style tag (after PLATFORM WORKFLOW comment block in CSS)
  if (!html.includes('/* Product journey storytelling */')) {
    html = html.replace(
      '/* ============================================================\n   INTEGRATIONS',
      JOURNEY_CSS + '\n/* ============================================================\n   INTEGRATIONS'
    );
  }

  // Update nav dropdown
  html = html.replace(
    `<ul class="nav-drop">
          <li><a href="#the-solution">Platform Overview</a></li>
          <li><a href="#three-pillars">Three Pillars</a></li>
          <li><a href="#data-integrity">Data Integrity</a></li>
          <li><a href="modules/intercompany-control.html">Intercompany Control</a></li>
          <li><a href="modules/group-reporting.html">Group Financial Reporting</a></li>
          <li><a href="modules/group-planning.html">Group Financial Planning</a></li>
          <li><a href="#platform-features">Platform Features</a></li>
          <li><a href="#gather-difference">The GATHER Difference</a></li>
        </ul>`,
    `<ul class="nav-drop">
          <li><a href="#product-journey">Product Journey</a></li>
          <li><a href="#the-problem">Platform Overview</a></li>
          <li><a href="#intercompany-control">Intercompany Control</a></li>
          <li><a href="#group-reporting">Group Financial Reporting</a></li>
          <li><a href="#group-planning">Group Financial Planning</a></li>
          <li><a href="#gather-difference">Connected Workflow</a></li>
        </ul>`
  );

  // Remove page-extensions link to pillars CSS if separate - keep page-extensions.js
  if (!html.includes('page-extensions.js')) {
    html = html.replace(
      '<script src="/review/review.js" defer></script>',
      '<script src="/assets/page-extensions.js" defer></script>\n<script src="/review/review.js" defer></script>'
    );
  }

  fs.writeFileSync(HOME, html, 'utf8');
  fs.copyFileSync(HOME, path.join(ROOT, 'index.html'));
  console.log('HomePage.html updated and synced to index.html');
}

patchHtml();
