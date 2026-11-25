# Files touched in this verification / KC-sync pass

Branch: `review/blog-images-kc-articles-2026-11-20`  
HEAD before and after Phase 2: `74b3e19`  
The working tree was already dirty (112 porcelain lines) before Phase 2. Nothing was reset, stashed, cleaned, committed, or pushed. Homepage and approved module landings were not redesigned.

## Phase 2 content cleanup (this pass)

Page edited:

- `knowledge-centre/intercompany-recharges-guide/index.html` — removed five confirmed duplicate paragraphs (apostrophe-only copies and one shorter prefix of the quadruple-entry sentence). Layout, callouts, tables, and examples kept.

Read-only comparison scripts added:

- `scripts/find-kc-dupes.js`
- `scripts/find-prefix-dupes.js`
- `scripts/compare-schedule-tables.js`
- `scripts/compare-related.js`

Reports updated:

- `.website-project/research/remaining-manual-review.md`
- `.website-project/research/verification-results.md`
- `.website-project/research/modified-files.md`

Schedule recharges tables, About page, related cards, blog H1, mega-menu, and footer were reviewed and not rewritten.

## Reports (new / updated)

- `.website-project/research/live-vs-local-audit.md`
- `.website-project/research/live-vs-local-audit.json`
- `.website-project/research/kc-article-sync-report.md`
- `.website-project/research/kc-deep-sync-report.json`
- `.website-project/research/about-page-issues.md`
- `.website-project/research/http-sitemap-check.json`
- `.website-project/research/verification-results.md`
- `.website-project/research/remaining-manual-review.md`
- `.website-project/research/modified-files.md`

## Scripts

- `scripts/audit-live-vs-local.js` — read-only live vs local comparison
- `scripts/sync-kc-deep.js` — layout-preserving KC mapper
- `scripts/promote-lazy-images.js` — `data-src` → `src` on rebuilt pages
- `scripts/check-sitemap-files.js`
- `scripts/check-http-sitemap.js`
- `scripts/sync-kc-heroes-from-live.js`
- `scripts/sync-live-force.js`
- `scripts/build-public-pages.js`
- `scripts/fetch-live-html.js`
- `scripts/apply-approved-shell.js`
- `package.json` — `fetch:live`, `sync:live:force`

## Custom KC guides (content sync, layouts kept)

- `knowledge-centre/bulk-intercompany-recharge-setup/index.html`
- `knowledge-centre/consolidation-auditability-transaction-drill-down/index.html`
- `knowledge-centre/foreign-exchange-consolidation/index.html`
- `knowledge-centre/fractional-cfo-client-report-access/index.html`
- `knowledge-centre/intercompany-loan-accounting-xero-quickbooks/index.html`
- `knowledge-centre/intercompany-recharges-guide/index.html`
- `knowledge-centre/multi-gaap-reporting-xero-quickbooks/index.html`
- `knowledge-centre/multi-ledger-multi-entity-consolidation/index.html`
- `knowledge-centre/schedule-intercompany-recharges/index.html`
- `knowledge-centre/xero-tracking-categories-quickbooks-class-consolidation/index.html`

## Rebuilt public pages

70 sitemap pages under `about/`, `ai/`, `blog/` (rebuilt posts), `complex-consolidations/`, `contact/`, `cookie-policy/`, `docs/`, `docs-category/`, `for-finance-teams/`, `for-fractional-cfos/`, `group-financial-planning/`, `group-financial-reporting/index.html`, `integrations/`, `intercompany-control/`, `knowledge-centre/*/` (rebuilt, not the 10 custom guides), `lp/`, `news-latest/`, `pricing/`, `privacy-policy/`, `product-updates/`, `video/`, `website-terms-of-use/`.

34 of those had lazy-load `data-src` promoted to `src` so images resolve without WordPress lazy JS.

## CSS (WP restyle, not homepage)

- `assets/public-pages.css` (untracked)

## Not modified in this pass (restrictions)

- `index.html` / `HomePage.html` — preserved
- `modules/group-reporting.html`, `modules/intercompany-control.html`, `modules/group-planning.html` — no product-page redesign
- Approved mega-menu and `site-foot` markup — left as the approved shell
