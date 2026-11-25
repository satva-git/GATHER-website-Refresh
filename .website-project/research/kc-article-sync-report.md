# KC article deep-synchronization report

Date: 2026-11-25  
Live HTML: `.website-project/research/live-html/` (84/84 fetched)  
Layout: existing `kc-page` / `kc-prose` / `faq-stack` / `kc-table` components kept.

The sitemap has **10 custom KC guide layouts** (not 9). All 10 were audited and synced. Product landing pages and the homepage were not redesigned.

## Guides processed

| Guide | Changes applied | Unmapped (manual) |
| --- | ---: | --- |
| bulk-intercompany-recharge-setup | 4 | 0 |
| consolidation-auditability-transaction-drill-down | 1 | 0 |
| foreign-exchange-consolidation | 1 | 0 |
| fractional-cfo-client-report-access | 10 | 0 |
| intercompany-loan-accounting-xero-quickbooks | 7 | 0 |
| intercompany-recharges-guide | 13 | 1 |
| multi-gaap-reporting-xero-quickbooks | 6 | 0 |
| multi-ledger-multi-entity-consolidation | 1 | 0 |
| schedule-intercompany-recharges | 2 | 3 |
| xero-tracking-categories-quickbooks-class-consolidation | 5 | 0 |

Machine-readable log: `kc-deep-sync-report.json`.

## What was synced (layout-preserving)

- Hero H1 and lead from live `hero-title` / `hero-description`.
- H2 wording where the same section exists (e.g. `1.` vs live `1:`).
- Body paragraphs matched by text; leftover live paragraphs **appended** as extra `p.body` (not raw WordPress columns).
- Table cell text where row/column counts match.
- FAQ questions/answers and FAQPage JSON-LD.
- Callouts (`p.kc-callout`), TOC, related cards, and CTA band were **not** replaced with WordPress markup.

## Content that could not be safely mapped

1. **intercompany-recharges-guide** — live H3 “Example” under “What is an intercompany recharge?” has no matching local `h3.h3`. The worked examples already exist as `kc-example` blocks.
2. **schedule-intercompany-recharges** — three tables differ in cell count (live includes an extra header/caption cell vs local `kc-table`). Local tables were left unchanged rather than flattening WordPress table HTML into the custom grid.

Related-article cards use the custom `kc-related` component; live “ALSO IN THIS COLLECTION” headings are expected chrome, not missing article copy.

## Mapper follow-up (resolved)

Phase 2 removed the confirmed duplicates on `intercompany-recharges-guide` after apostrophe normalisation. Live HTML has each sentence once. A second scan found no remaining exact or prefix duplicates in that article. The other nine custom guides had no exact duplicates. See `remaining-manual-review.md`.

## Safeguard

An earlier mapper split live `<p>` tags into local callouts. That version was discarded. Tracked guides were restored from git, the approved skip-link/shell was re-applied, then the safer mapper ran. Callouts such as the multi-GAAP formula remain `p.kc-callout`.
