'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const NEW_SECTION = `  <!-- 4 LEVELS — DATA INTEGRITY -->
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

const START = '  <!-- 4 LEVELS — DATA INTEGRITY -->';
const END = '  <!-- ONE CONNECTED WORKFLOW -->';

for (const file of ['index.html', 'HomePage.html']) {
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');
  const i0 = html.indexOf(START);
  const i1 = html.indexOf(END);
  if (i0 < 0 || i1 < 0 || i1 <= i0) {
    throw new Error(`markers missing in ${file}`);
  }
  html = html.slice(0, i0) + NEW_SECTION + '\n\n' + html.slice(i1);
  fs.writeFileSync(filePath, html);
  console.log('Updated', file);
}
