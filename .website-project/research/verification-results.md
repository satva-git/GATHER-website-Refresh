# Build and validation results

Updated: 2026-11-25, Phase 2 content cleanup.

## Baseline preserved

Recorded before any Phase 2 edit:

- Branch: `review/blog-images-kc-articles-2026-11-20`
- HEAD: `74b3e19` Review: blog cover redesign, knowledge-centre articles, site image polish
- Working tree: 112 porcelain lines (tracked modifications plus untracked directories)
- No reset, stash, clean, commit, or push

After cleanup the branch and HEAD are unchanged. The only page edited is `knowledge-centre/intercompany-recharges-guide/index.html`. Homepage, product landings, mega-menu, and footer were not redesigned.

## Production compilation

There is no webpack or Next.js production build in this repo. Validation is the static preview on port 3000 plus the checks below. A production compilation was **not** run.

## Passed

| Check | Evidence |
| --- | --- |
| Sitemap files on disk | `check-sitemap-files.js`: 84 URLs, 0 missing |
| HTTP 200 after `?review=` redirect | `check-http-sitemap.js`: 84 / 84 |
| Local image files | same script: 0 pages with missing images |
| FAQ GEO script | `verify-faq-geo.js`: Home 8 FAQs and `intercompany-control-faqs.html` 30 FAQs, schema matches DOM |
| FAQ GEO test | `server/test/faq-geo.test.js`: 1 pass |
| Comment restore test | `server/test/comment-restore.e2e.test.js`: 1 pass |
| beforeunload tests | 3 pass (`same-origin navigation`, `offline draft`, `stale composer draft`) |
| Header / mega-menu | 84 / 84 pages have `#nav` containing “Modules” |
| Footer on public pages | 83 / 84 use `footer.site-foot` or `footer.subpage-foot` |
| Homepage footer | The remaining page is `/`. It uses the approved homepage `<footer>`, not `site-foot` |
| Recharges duplicates | `find-prefix-dupes.js`: 0 exact or prefix duplicates after apostrophe normalisation |
| Schedule tables at 768px | 3 tables, row counts 6 / 4 / 4, no horizontal overflow, 0 broken images |
| Schedule page at 390px | `innerWidth` 390, `scrollWidth` 390 (no page overflow) |

## Blocked (not failed content checks)

| Check | Why it did not finish |
| --- | --- |
| `scripts/verify-links.js` | False positives. Root-absolute links are resolved under the nested folder (`modules/pricing` for `/pricing/`). HTTP sitemap check is the authoritative link result. |
| `server/test/pin-shake.dom.test.js` | Hangs in jsdom (MutationObserver loop). Stopped. Not a content failure. |
| `server/test/review-api.test.js` | Starts `server/index.js` and does not finish while the preview is already bound to port 3000. |
| Combined `node --test` process | beforeunload’s three assertions passed, then the process kept running (open handles). It was stopped. The three assertions are counted as passed above. |

## Layout spot checks

Preview toolbar (“E2E Review”) is local review chrome, not live site chrome.

- `/knowledge-centre/intercompany-recharges-guide/` desktop: H1 “Intercompany recharges explained”, TOC, 6 FAQs, mega-menu, footer. The removed duplicate sentences no longer appear twice (allocation/settlement, Parent A net expense, missing bill, £20,000 consolidation note, shorter quadruple-entry sentence).
- `/knowledge-centre/schedule-intercompany-recharges/` tablet 768 and mobile 390: custom guide layout, TOC chips wrap, tables stay inside the column, mega-menu and footer present.

## Restrictions honoured

- Homepage not redesigned.
- Product landing pages not redesigned.
- Approved mega-menu and footer not modified.
- No commit or push.
