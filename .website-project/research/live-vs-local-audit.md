# Live vs local comparison report

Generated: 2026-11-25T10:30:04.998Z

## How to read this report

This audit compared downloaded live HTML with local files. It **did not overwrite pages**.

- **Rebuilt 70** are WordPress-restyled public pages. 66 match live title/H1/headings/paragraphs. The remaining 4 are archive/index shells (`/product-updates/`, `/lp/`, `/blog/category/consolidated-planning/`, `/docs/group-reporting-template-option-2-pl/`) whose body counts match but WordPress archive titles differ — classified **Expected difference**.
- **Custom 13** keep approved layouts (10 KC guides, blog index, two custom blog articles). The machine tally still says **Missing content** because live WordPress related-widget titles/blurbs are not the same nodes as local `kc-related` cards, and live often splits one sentence across extra `<p>` tags. Article H1s, FAQs, and tables were synced separately (see `kc-article-sync-report.md`). Those related-widget diffs are **Expected difference**, not missing article copy.
- **About** is in the rebuilt 70 as Exact match on unique heading text. Live still has **three Alexa cards** and **four identical testimonials**; local shows the cards and the quote once, with review flags. See `about-page-issues.md`.
- Header/mega-menu/footer are **Expected difference** on every page (approved shell, not live WordPress chrome).
- Homepage (`index.html`) was excluded from this 70-page content rebuild.

## Scope

- Sitemap URLs: 84
- Rebuilt pages compared: 70
- Custom layouts compared: 13
- Skipped: index.html (homepage excluded from 70-page rebuild set)

## Rebuilt-page tally

- Exact match: 66
- Expected difference: 4

## Custom-layout tally

- Missing content: 13 (see interpretation above — related-widget chrome, not unsynced article bodies)

## Classification key

- **Exact match** — title/H1/headings/paragraphs match live; nav/footer chrome differs by design.
- **Expected difference** — chrome, breadcrumbs, review flags, localised links, or approved shell.
- **Missing content** — live headings, paragraphs, FAQs, or CTAs not present locally.
- **Unexpected content** — local body text not present on live.
- **Broken asset or link** — missing nav/footer or image-count gap.
- **Requires manual review** — title/meta/tables/FAQ answers differ, or ambiguous mapping.

This audit did not overwrite any pages.

## Rebuilt pages (70-set)

### https://gather.nexus/docs-category/group-financial-reporting/
- File: `docs-category/group-financial-reporting/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 1/1 (live/local), paragraphs 0/0, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/docs-category/group-financial-reporting/group-reporting-templates/
- File: `docs-category/group-financial-reporting/group-reporting-templates/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 1/1 (live/local), paragraphs 0/0, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/docs-category/grt/
- File: `docs-category/grt/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 1/1 (live/local), paragraphs 0/0, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/group-financial-reporting/
- File: `group-financial-reporting/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 14/14 (live/local), paragraphs 24/24, FAQs 0/0, tables 0/0, images 11/11
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/complex-consolidations/
- File: `complex-consolidations/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 15/15 (live/local), paragraphs 16/16, FAQs 0/0, tables 0/0, images 9/9
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/about/
- File: `about/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 11/6 (live/local), paragraphs 18/12, FAQs 0/0, tables 0/0, images 2/2
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/ai/
- File: `ai/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 7/7 (live/local), paragraphs 7/7, FAQs 0/0, tables 0/0, images 3/2
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/intercompany-control/
- File: `intercompany-control/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 12/12 (live/local), paragraphs 20/20, FAQs 0/0, tables 0/0, images 9/9
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/contact/
- File: `contact/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 1/1 (live/local), paragraphs 0/0, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/cookie-policy/
- File: `cookie-policy/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 4/4 (live/local), paragraphs 12/12, FAQs 0/0, tables 1/1, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/for-finance-teams/
- File: `for-finance-teams/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 14/11 (live/local), paragraphs 15/15, FAQs 0/0, tables 0/0, images 5/5
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/for-fractional-cfos/
- File: `for-fractional-cfos/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 14/11 (live/local), paragraphs 18/18, FAQs 0/0, tables 0/0, images 5/5
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/group-financial-planning/
- File: `group-financial-planning/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 18/17 (live/local), paragraphs 18/18, FAQs 0/0, tables 0/0, images 9/9
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/news-latest/
- File: `news-latest/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 1/1 (live/local), paragraphs 3/3, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/pricing/
- File: `pricing/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 4/4 (live/local), paragraphs 21/21, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/privacy-policy/
- File: `privacy-policy/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 19/19 (live/local), paragraphs 7/7, FAQs 0/0, tables 1/1, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/video/
- File: `video/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 2/2 (live/local), paragraphs 4/4, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/website-terms-of-use/
- File: `website-terms-of-use/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 18/18 (live/local), paragraphs 49/49, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/product-updates/
- File: `product-updates/index.html`
- Build status: built from live text
- Classification: **Expected difference**
- Counts: headings 1/1 (live/local), paragraphs 1/1, FAQs 0/0, tables 0/0, images 1/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/product-updates/intercompany-control-group-financial-reporting-updates/
- File: `product-updates/intercompany-control-group-financial-reporting-updates/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 6/6 (live/local), paragraphs 11/11, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/product-updates/group-ap-ar-ageing-analysis/
- File: `product-updates/group-ap-ar-ageing-analysis/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 6/6 (live/local), paragraphs 9/9, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/product-updates/manual-fx-is-now-live-in-gather-nexus/
- File: `product-updates/manual-fx-is-now-live-in-gather-nexus/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 3/3 (live/local), paragraphs 5/5, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/product-updates/complex-financial-consolidation/
- File: `product-updates/complex-financial-consolidation/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 4/3 (live/local), paragraphs 9/9, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/product-updates/gather-platform-2-0/
- File: `product-updates/gather-platform-2-0/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 10/10 (live/local), paragraphs 8/8, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/product-updates/gather-nexus-goes-live-with-158-currencies/
- File: `product-updates/gather-nexus-goes-live-with-158-currencies/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 5/5 (live/local), paragraphs 5/5, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/product-updates/gather-nexus-integrates-with-payments-platform-stripe/
- File: `product-updates/gather-nexus-integrates-with-payments-platform-stripe/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 7/7 (live/local), paragraphs 7/7, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/product-updates/gather-nexus-announces-integration-with-intuit-quickbooks/
- File: `product-updates/gather-nexus-announces-integration-with-intuit-quickbooks/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 8/8 (live/local), paragraphs 11/11, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/product-updates/introducing-gather-nexus/
- File: `product-updates/introducing-gather-nexus/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 7/7 (live/local), paragraphs 9/9, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/lp/
- File: `lp/index.html`
- Build status: built from live text
- Classification: **Expected difference**
- Counts: headings 1/1 (live/local), paragraphs 1/1, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/lp/usa_001_332026/
- File: `lp/usa_001_332026/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 19/19 (live/local), paragraphs 49/49, FAQs 0/0, tables 0/0, images 11/11
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/integrations/quickbooks/
- File: `integrations/quickbooks/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 16/13 (live/local), paragraphs 36/36, FAQs 0/0, tables 0/0, images 4/4
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/integrations/xero/
- File: `integrations/xero/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 15/15 (live/local), paragraphs 33/33, FAQs 0/0, tables 0/0, images 4/4
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/blog/category/consolidated-planning/
- File: `blog/category/consolidated-planning/index.html`
- Build status: built from live text
- Classification: **Expected difference**
- Counts: headings 1/1 (live/local), paragraphs 1/1, FAQs 0/0, tables 0/0, images 1/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/build-group-budget-xero-quickbooks/
- File: `knowledge-centre/build-group-budget-xero-quickbooks/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 16/16 (live/local), paragraphs 37/37, FAQs 3/3, tables 1/1, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/group-budget-actual-common-reporting-structure/
- File: `knowledge-centre/group-budget-actual-common-reporting-structure/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 16/16 (live/local), paragraphs 31/31, FAQs 3/3, tables 1/1, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/group-budget-vs-actual-analysis/
- File: `knowledge-centre/group-budget-vs-actual-analysis/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 16/16 (live/local), paragraphs 41/41, FAQs 3/3, tables 1/1, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/financial-consolidation-xero-quickbooks-guide/
- File: `knowledge-centre/financial-consolidation-xero-quickbooks-guide/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 18/18 (live/local), paragraphs 52/52, FAQs 3/3, tables 2/2, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/consolidation-working-papers-explained/
- File: `knowledge-centre/consolidation-working-papers-explained/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 17/17 (live/local), paragraphs 47/47, FAQs 3/3, tables 2/2, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/aggregation-vs-consolidation/
- File: `knowledge-centre/aggregation-vs-consolidation/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 18/18 (live/local), paragraphs 51/51, FAQs 3/3, tables 2/2, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/how-to-consolidate-acquired-company/
- File: `knowledge-centre/how-to-consolidate-acquired-company/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 16/16 (live/local), paragraphs 45/45, FAQs 3/3, tables 1/1, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/map-charts-of-accounts-group-reporting/
- File: `knowledge-centre/map-charts-of-accounts-group-reporting/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 16/16 (live/local), paragraphs 39/39, FAQs 3/3, tables 1/1, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/group-financial-planning/
- File: `knowledge-centre/group-financial-planning/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 7/7 (live/local), paragraphs 8/8, FAQs 0/0, tables 0/0, images 5/5
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/unified-intercompany-recharges-reconciliations-eliminations/
- File: `knowledge-centre/unified-intercompany-recharges-reconciliations-eliminations/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 30/30 (live/local), paragraphs 63/63, FAQs 6/6, tables 2/2, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/transfer-pricing-intercompany-accounting-guide/
- File: `knowledge-centre/transfer-pricing-intercompany-accounting-guide/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 13/13 (live/local), paragraphs 72/72, FAQs 0/0, tables 0/0, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/intercompany-reconciliation-recharges-faq/
- File: `knowledge-centre/intercompany-reconciliation-recharges-faq/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 40/40 (live/local), paragraphs 34/34, FAQs 30/30, tables 0/0, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/manual-vs-automated-intercompany-accounting/
- File: `knowledge-centre/manual-vs-automated-intercompany-accounting/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 11/11 (live/local), paragraphs 29/29, FAQs 0/0, tables 4/4, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/intercompany-reconciliation-guide/
- File: `knowledge-centre/intercompany-reconciliation-guide/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 29/29 (live/local), paragraphs 90/90, FAQs 5/5, tables 6/6, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/gather-vs-mayday/
- File: `knowledge-centre/gather-vs-mayday/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 44/44 (live/local), paragraphs 100/100, FAQs 15/15, tables 2/2, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/gather-vs-fathom/
- File: `knowledge-centre/gather-vs-fathom/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 19/19 (live/local), paragraphs 35/35, FAQs 5/5, tables 1/1, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/gather-nexus-vs-spotlight-reporting/
- File: `knowledge-centre/gather-nexus-vs-spotlight-reporting/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 16/15 (live/local), paragraphs 39/39, FAQs 4/4, tables 1/1, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/gather-nexus-vs-translucent/
- File: `knowledge-centre/gather-nexus-vs-translucent/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 17/17 (live/local), paragraphs 45/45, FAQs 4/4, tables 1/1, images 2/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/group-financial-reporting/
- File: `knowledge-centre/group-financial-reporting/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 16/16 (live/local), paragraphs 16/16, FAQs 0/0, tables 0/0, images 14/14
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/gather-vs-joiin/
- File: `knowledge-centre/gather-vs-joiin/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 16/16 (live/local), paragraphs 38/38, FAQs 5/5, tables 1/1, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/intercompany-control/
- File: `knowledge-centre/intercompany-control/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 12/12 (live/local), paragraphs 13/13, FAQs 0/0, tables 0/0, images 10/10
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/our-unified-platform/
- File: `knowledge-centre/our-unified-platform/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 3/3 (live/local), paragraphs 3/3, FAQs 0/0, tables 0/0, images 1/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/fractional-cfos-outsourced-finance/
- File: `knowledge-centre/fractional-cfos-outsourced-finance/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 3/3 (live/local), paragraphs 3/3, FAQs 0/0, tables 0/0, images 1/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/knowledge-centre/gather-ai-and-mcp/
- File: `knowledge-centre/gather-ai-and-mcp/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 4/4 (live/local), paragraphs 3/3, FAQs 0/0, tables 0/0, images 2/2
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/blog/author/howard/
- File: `blog/author/howard/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 12/12 (live/local), paragraphs 10/10, FAQs 0/0, tables 0/0, images 1/1
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/docs/
- File: `docs/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 1/1 (live/local), paragraphs 0/0, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/docs/group-reporting-template-option-2-pl/
- File: `docs/group-reporting-template-option-2-pl/index.html`
- Build status: built from live text
- Classification: **Expected difference**
- Counts: headings 1/1 (live/local), paragraphs 0/0, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/blog/quickbooks-online-multi-entity-consolidation/
- File: `blog/quickbooks-online-multi-entity-consolidation/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 10/10 (live/local), paragraphs 29/29, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/blog/xero-multi-entity-consolidation/
- File: `blog/xero-multi-entity-consolidation/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 10/10 (live/local), paragraphs 28/28, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/blog/gather-nexus-for-fractional-cfos/
- File: `blog/gather-nexus-for-fractional-cfos/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 5/5 (live/local), paragraphs 16/16, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/blog/xero-quickbooks-multi-entity-consolidation/
- File: `blog/xero-quickbooks-multi-entity-consolidation/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 18/18 (live/local), paragraphs 48/48, FAQs 0/0, tables 1/1, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/blog/intercompany-accounting-controls-month-end-close/
- File: `blog/intercompany-accounting-controls-month-end-close/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 14/13 (live/local), paragraphs 44/44, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/blog/bridging-the-gaap/
- File: `blog/bridging-the-gaap/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 15/15 (live/local), paragraphs 64/64, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/blog/quadruple-entry-accounting-multi-entity-finance/
- File: `blog/quadruple-entry-accounting-multi-entity-finance/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 8/8 (live/local), paragraphs 25/25, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/blog/from-intercompany-chaos-to-intercompany-control/
- File: `blog/from-intercompany-chaos-to-intercompany-control/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 11/11 (live/local), paragraphs 18/18, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/blog/fragmented-processes-multi-entity-groups/
- File: `blog/fragmented-processes-multi-entity-groups/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 13/13 (live/local), paragraphs 32/32, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

### https://gather.nexus/blog/benefits-of-multi-entity-accounting-software/
- File: `blog/benefits-of-multi-entity-accounting-software/index.html`
- Build status: built from live text
- Classification: **Exact match**
- Counts: headings 12/12 (live/local), paragraphs 29/29, FAQs 0/0, tables 0/0, images 0/0
- No content mismatches beyond expected chrome (nav/footer).

## Custom layouts (kept)

### https://gather.nexus/knowledge-centre/intercompany-recharges-guide/
- File: `knowledge-centre/intercompany-recharges-guide/index.html`
- Build status: custom layout kept
- Classification: **Missing content**
- Counts: headings 28/27 (live/local), paragraphs 75/74, FAQs 6/6, tables 11/11, images 2/0
- Requires manual review: Title differs. Live: "Intercompany Recharges: Journal Entries & Examples | GATHER.nexus" Local: "Intercompany Recharges: Journal Entries & Examples | Knowledge Centre | GATHER.nexus"
- Missing content: Headings on live not found locally (2): Example | Manual vs automated intercompany accounting
- Unexpected content: Local headings not on live (1): Transfer Pricing and Intercompany Accounting
- Missing content: 8 live paragraph(s) not found locally. First: "Journal entries cost allocations and worked examples. A practical guide for multi-entity groups using Xero and QuickBooks Online."
- Unexpected content: 20 local paragraph(s) not on live. First: "An allocation determines each company's share of a cost. A recharge records the charge between companies. Settlement clears the amount owed,"

### https://gather.nexus/knowledge-centre/foreign-exchange-consolidation/
- File: `knowledge-centre/foreign-exchange-consolidation/index.html`
- Build status: custom layout kept
- Classification: **Missing content**
- Counts: headings 27/21 (live/local), paragraphs 65/51, FAQs 5/5, tables 3/3, images 2/0
- Requires manual review: Title differs. Live: "FX Consolidation Issues and Solutions | GATHER.nexus" Local: "FX Consolidation Issues and Solutions | Knowledge Centre | GATHER.nexus"
- Missing content: Headings on live not found locally (2): Intercompany Reconciliations and Recharges FAQs | Manual vs automated intercompany accounting
- Unexpected content: Local headings not on live (2): Auditability and transaction-level drill-down | Multi-ledger, multi-entity consolidation
- Missing content: 2 live paragraph(s) not found locally. First: "Reconciliation, recharges, Xero, QuickBooks Online and FX."
- Unexpected content: 2 local paragraph(s) not on live. First: "Why audit trails and drill-down are essential for Xero and QuickBooks consolidation."

### https://gather.nexus/knowledge-centre/consolidation-auditability-transaction-drill-down/
- File: `knowledge-centre/consolidation-auditability-transaction-drill-down/index.html`
- Build status: custom layout kept
- Classification: **Missing content**
- Counts: headings 22/21 (live/local), paragraphs 68/62, FAQs 5/5, tables 2/2, images 2/0
- Requires manual review: Title differs. Live: "Xero & QuickBooks Consolidation: Audit Trails & Drill-Down | GATHER.nexus" Local: "Xero & QuickBooks Consolidation: Audit Trails & Drill-Down | Knowledge Centre | GATHER.nexus"
- Missing content: Headings on live not found locally (2): Transfer Pricing and Intercompany Accounting | Intercompany Reconciliations & Recharges
- Unexpected content: Local headings not on live (2): Consolidation working papers explained | Foreign exchange in consolidation
- Missing content: 2 live paragraph(s) not found locally. First: "Transfer-pricing policy, cost-plus recharges, automation and intercompany accounting for multi-entity Groups."
- Unexpected content: 2 local paragraph(s) not on live. First: "How working papers bridge entity balances to the consolidated result."

### https://gather.nexus/knowledge-centre/multi-gaap-reporting-xero-quickbooks/
- File: `knowledge-centre/multi-gaap-reporting-xero-quickbooks/index.html`
- Build status: custom layout kept
- Classification: **Missing content**
- Counts: headings 14/14 (live/local), paragraphs 30/19, FAQs 3/3, tables 1/1, images 2/0
- Missing content: Headings on live not found locally (2): GATHER.nexus vs Fathom | GATHER.nexus vs Joiin
- Unexpected content: Local headings not on live (3): How to map different charts of accounts for group reporting | Consolidation working papers explained | Xero tracking category and QuickBooks class consolidation
- Missing content: 2 live paragraph(s) not found locally. First: "Consolidation control or reporting and forecasting?"
- Unexpected content: 3 local paragraph(s) not on live. First: "Connect each company’s chart of accounts to a common group reporting structure."

### https://gather.nexus/knowledge-centre/bulk-intercompany-recharge-setup/
- File: `knowledge-centre/bulk-intercompany-recharge-setup/index.html`
- Build status: custom layout kept
- Classification: **Missing content**
- Counts: headings 13/12 (live/local), paragraphs 27/15, FAQs 3/3, tables 1/1, images 2/0
- Missing content: Headings on live not found locally (3): Worked example | How does manual intercompany accounting compare to the intercompany process with GATHER.nexus? | A practical guide for multi-entity groups using Xero and QuickBooks
- Unexpected content: Local headings not on live (3): How to schedule intercompany recharges in GATHER.nexus | Intercompany recharges explained: journal entries, cost allocations and worked examples | Manual vs automated intercompany accounting
- Missing content: 2 live paragraph(s) not found locally. First: "Journal entries cost allocations and worked examples. A practical guide for multi-entity groups using Xero and QuickBooks Online."
- Unexpected content: 3 local paragraph(s) not on live. First: "Schedule recurring recharges, document them, review proposals centrally and post to the connected ledgers."

### https://gather.nexus/knowledge-centre/schedule-intercompany-recharges/
- File: `knowledge-centre/schedule-intercompany-recharges/index.html`
- Build status: custom layout kept
- Classification: **Missing content**
- Counts: headings 15/15 (live/local), paragraphs 30/18, FAQs 4/4, tables 3/3, images 2/0
- Missing content: Headings on live not found locally (2): Unifying intercompany recharges, reconciliations and eliminations | Intercompany Reconciliations & Recharges
- Unexpected content: Local headings not on live (3): How to set up intercompany recharges in bulk with GATHER.nexus | Intercompany Reconciliation Guide | Intercompany recharges explained: journal entries, cost allocations and worked examples
- Missing content: 3 live paragraph(s) not found locally. First: "You can source costs by ledger account, vendor, Xero Tracking Category option or QuickBooks Online Class. ."
- Unexpected content: 3 local paragraph(s) not on live. First: "Configure several recharge rules together using ledger accounts, vendors, Xero Tracking Categories or QuickBooks Online Classes."

### https://gather.nexus/knowledge-centre/intercompany-loan-accounting-xero-quickbooks/
- File: `knowledge-centre/intercompany-loan-accounting-xero-quickbooks/index.html`
- Build status: custom layout kept
- Classification: **Missing content**
- Counts: headings 11/11 (live/local), paragraphs 26/24, FAQs 3/3, tables 3/3, images 2/0
- Missing content: Headings on live not found locally (1): How to set up intercompany recharges in bulk with GATHER.nexus
- Unexpected content: Local headings not on live (2): Intercompany Reconciliation Guide | Intercompany recharges explained: journal entries, cost allocations and worked examples
- Missing content: 1 live paragraph(s) not found locally. First: "GATHER.nexus lets finance teams configure multiple intercompany recharges in one setup workflow."
- Unexpected content: 2 local paragraph(s) not on live. First: "A practical guide for multi-entity groups using Xero and QuickBooks"

### https://gather.nexus/knowledge-centre/xero-tracking-categories-quickbooks-class-consolidation/
- File: `knowledge-centre/xero-tracking-categories-quickbooks-class-consolidation/index.html`
- Build status: custom layout kept
- Classification: **Missing content**
- Counts: headings 34/33 (live/local), paragraphs 50/30, FAQs 8/8, tables 5/5, images 2/0
- Requires manual review: Title differs. Live: "Xero Tracking Categories & QuickBooks Class Consolidation | GATHER.nexus" Local: "Xero Tracking Categories & QuickBooks Class Consolidation"
- Missing content: Headings on live not found locally (2): Financial consolidation for Xero and QuickBooks Online groups | Consolidation working papers explained
- Unexpected content: Local headings not on live (2): Multi-ledger, multi-entity consolidation | Multi-GAAP reporting for one company
- Missing content: 3 live paragraph(s) not found locally. First: "This creates inconsistent definitions, spreadsheet maintenance, errors and difficulty comparing divisions especially after acquisitions."
- Unexpected content: 2 local paragraph(s) not on live. First: "Bringing Xero and QuickBooks Online groups together in one consolidation workflow."

### https://gather.nexus/knowledge-centre/multi-ledger-multi-entity-consolidation/
- File: `knowledge-centre/multi-ledger-multi-entity-consolidation/index.html`
- Build status: custom layout kept
- Classification: **Missing content**
- Counts: headings 24/23 (live/local), paragraphs 72/63, FAQs 6/6, tables 1/1, images 2/0
- Requires manual review: Title differs. Live: "Xero & QuickBooks Multi-Ledger Consolidation | GATHER.nexus" Local: "Xero & QuickBooks Multi-Ledger Consolidation | Knowledge Centre | GATHER.nexus"
- Missing content: 3 live paragraph(s) not found locally. First: "GATHER.nexus is fully compatible with both Xero and QuickBooks Online for group reporting and consolidation including groups that use both p"
- Unexpected content: 3 local paragraph(s) not on live. First: "GATHER.nexus is fully compatible with both Xero and QuickBooks Online for group reporting and consolidation-including groups that use both p"

### https://gather.nexus/knowledge-centre/fractional-cfo-client-report-access/
- File: `knowledge-centre/fractional-cfo-client-report-access/index.html`
- Build status: custom layout kept
- Classification: **Missing content**
- Counts: headings 12/8 (live/local), paragraphs 27/21, FAQs 3/3, tables 1/1, images 2/0
- Missing content: Headings on live not found locally (2): Financial consolidation for Xero and QuickBooks Online groups | Consolidation working papers explained
- Missing content: 5 live paragraph(s) not found locally. First: "Yes. A fractional CFO platform can give clients access to their own financial reports if it lets the firm control which client groups each u"

### https://gather.nexus/blog/
- File: `blog/index.html`
- Build status: custom layout kept
- Classification: **Missing content**
- Counts: headings 1/20 (live/local), paragraphs 1/24, FAQs 0/0, tables 0/0, images 1/14
- Missing content: H1 differs. Live: "GATHER Insights" Local: "Expert Insights"
- Unexpected content: Local headings not on live (18): Group Financial Reporting | Intercompany Control | Group Financial Planning | QuickBooks | Xero | Expert Insights | Latest insights | How a group ledger supports multi-GAAP reporting and exit readiness
- Missing content: 1 live paragraph(s) not found locally. First: "November 24, 2026"
- Unexpected content: 20 local paragraph(s) not on live. First: "Consolidated Financial Reporting with multi-level Drill Down for data validation and analysis. Full audit trail with user logs"

### https://gather.nexus/blog/group-ledger-multi-gaap-exit-readiness/
- File: `blog/group-ledger-multi-gaap-exit-readiness/index.html`
- Build status: custom layout kept
- Classification: **Missing content**
- Counts: headings 8/7 (live/local), paragraphs 44/18, FAQs 0/0, tables 0/0, images 0/0
- Missing content: Headings on live not found locally (1): Introduction
- Unexpected content: Local headings not on live (3): How to set up multi-GAAP reporting for one company | Group Financial Reporting | Auditability and transaction drill-down
- Missing content: 9 live paragraph(s) not found locally. First: "In GATHER.nexus, that means the same ledger can support consolidation, single-entity multi-GAAP reporting and monthly normalisations for a f"
- Unexpected content: 4 local paragraph(s) not on live. First: "Some of the most interesting uses of that architecture are ones we had not envisaged at the outset. A single company can use it for single-e"
- Missing content: Live has 1 CTA(s); local main/prose has none (may live in footer/hero).

### https://gather.nexus/blog/mayday-vs-gather-multi-entity-layer/
- File: `blog/mayday-vs-gather-multi-entity-layer/index.html`
- Build status: custom layout kept
- Classification: **Missing content**
- Counts: headings 9/11 (live/local), paragraphs 37/14, FAQs 0/2, tables 1/1, images 0/0
- Unexpected content: Local headings not on live (5): What is the difference between Mayday and GATHER.nexus? | How does intercompany reconciliation differ from elimination? | GATHER vs Mayday: Intercompany Accounting Software Compared | Intercompany Control | Group Financial Reporting
- Missing content: 8 live paragraph(s) not found locally. First: "Month-end close and the multi-entity finance layer"
- Unexpected content: 3 local paragraph(s) not on live. First: "GATHER.nexus and Mayday both automate intercompany accounting for multi-entity finance teams using Xero and QuickBooks Online."
- Missing content: Live has 1 CTA(s); local main/prose has none (may live in footer/hero).
