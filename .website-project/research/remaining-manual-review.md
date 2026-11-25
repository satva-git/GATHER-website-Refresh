# Remaining manual review

Updated: 2026-11-25, after Phase 2 content cleanup.  
No names, biographies, or testimonials were invented. Custom layouts, the homepage, product landings, mega-menu, and footer were not redesigned.

## Resolved in this pass

- **Intercompany recharges guide** — five sync duplicates removed after apostrophe normalisation. Live HTML contains each sentence once. See the list below. Exact and prefix duplicates in `.kc-prose` are now **0**.
- **Schedule recharges tables** — the three custom grids already contain the live data rows. The extra live cells are a title row plus a header row, not missing values. Grids were left unchanged.

## About page — approval still required

Local file: `about/index.html`  
Live source: https://gather.nexus/about/  
Flags remain on the page. Nothing was replaced.

### Team cards (live and local text is the same)

| Card | Name as published | Job line as published |
| --- | --- | --- |
| 1 | Alexa | Dev team. Our ideas into action man. Busy helping clients. |
| 2 | Alexa | Marketing head. Startup tsar. Growth hacker. |
| 3 | Alexa | Marketing. King of copywriting. Loves design. |

No photos are published. These are three separate blocks, not one card repeated by a slider.

**Local presentation:** all three cards, plus the review flag: “Needs your review before this page is treated as final…”

**Decision needed:** confirm real names and job lines, or ask for the block to be removed.

### Testimonial

| Field | Published text |
| --- | --- |
| Name | David Mitchell |
| Role | CFO at Directly Energy |
| Quote | “Managing multiple entities used to be a challenge, but with GATHER.nexus, we can consolidate all our financial data in real-time. The integration with QuickBooks is seamless, and the reports are accurate and easy to understand. Highly recommend it for any growing business!” |

**Live:** the same quote and attribution are stored in **four** slider slots.  
**Local:** the quote is shown **once**, with the inline flag “Shown once. The live page repeats this same quote in four slider slots.”

**Decision needed:** confirm whether this person and company are real, and whether the quote should appear once, four times, or not at all.

## Related articles — custom cards kept

Live “ALSO IN THIS COLLECTION” cards were compared with local `.kc-related` cards. Custom cards were **not** replaced. Several local links use older Knowledge Centre paths (`*.html` or a path without `/knowledge-centre/`) for the same article the live site now publishes at a `/knowledge-centre/…/` URL.

| Guide | Same topic, different local URL | Local cards live does not show | Live cards local does not show |
| --- | --- | --- | --- |
| bulk-intercompany-recharge-setup | Manual vs automated (legacy `.html`) | Schedule recharges; recharges explained | Intercompany reconciliation guide |
| consolidation-auditability-transaction-drill-down | — | Working papers; foreign exchange | Transfer pricing; reconciliations & recharges FAQ |
| foreign-exchange-consolidation | — | Auditability; multi-ledger | Reconciliations FAQ; manual vs automated |
| fractional-cfo-client-report-access | — | none (no related block) | Financial consolidation guide; working papers |
| intercompany-loan-accounting-xero-quickbooks | Schedule recharges (path differs) | Reconciliation guide; recharges explained | Bulk recharge setup |
| intercompany-recharges-guide | Unifying recharges (legacy `.html`) | Transfer pricing | Manual vs automated |
| multi-gaap-reporting-xero-quickbooks | — | Account mapping; working papers; tracking categories | GATHER vs Fathom; GATHER vs Joiin |
| multi-ledger-multi-entity-consolidation | Account mapping; acquired company (legacy `.html`) | — | — |
| schedule-intercompany-recharges | — | Bulk setup; reconciliation guide; recharges explained | Unifying recharges; reconciliations FAQ |
| xero-tracking-categories-quickbooks-class-consolidation | — | Multi-ledger; multi-GAAP | Financial consolidation guide; working papers |

`fractional-cfo-client-report-access` is the only custom guide with **no** related cards. Adding the live pair would be a content decision, not a layout repair, so it was left empty.

## Blog heading — custom heading kept

| Surface | H1 text |
| --- | --- |
| Live `/blog/` | GATHER Insights |
| Local `/blog/` and the approved nav label | Expert Insights |

The local heading matches the mega-menu label “Expert Insights”. It was not changed.

## Still unmapped, not a duplicate

- **intercompany-recharges-guide** — live H3 “Example” under “What is an intercompany recharge?”. Worked examples already exist as `kc-example` blocks.
- Rebuilt archive shells still classified as expected difference: `/product-updates/`, `/lp/`, `/blog/category/consolidated-planning/`, `/docs/group-reporting-template-option-2-pl/`.
- Custom blog articles (`group-ledger-multi-gaap-exit-readiness`, `mayday-vs-gather-multi-entity-layer`) still use their own layouts rather than live “Related Posts” blocks.

## Tooling, not content

- `scripts/verify-links.js` treats a root path such as `/pricing/` as a file under the page’s folder. HTTP checks are the valid result. Not changed in this pass.
- `pin-shake.dom.test.js` hangs in jsdom.
- `review-api.test.js` hangs while the preview server is already listening.
- Homepage uses `<footer>` without `site-foot`. That is the approved homepage footer and was not edited.
