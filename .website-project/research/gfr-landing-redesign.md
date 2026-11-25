# Group Financial Reporting landing page — pilot redesign

Date: 2026-11-25  
Branch: `review/blog-images-kc-articles-2026-11-20`  
HEAD: `74b3e19` (unchanged)  
No commit or push. Homepage, mega-menu, footer, and the other product pages were not edited.

## Before / after

**Before.** `/group-financial-reporting/` was a WordPress column stack: nested `wp-block-columns`, a heading hidden at every breakpoint, breadcrumbs pointing at `#`, and product screenshots sitting in unframed columns. The approved mega-menu and footer were already in place. Copy, title, description, canonical URL, and WebPage JSON-LD matched the live page.

**After.** The same copy is set in a scoped product-page layout: hero with the dashboard, a ledger link row, the workflow overview and four feature points, six alternating workflow steps with the original screenshots and lists, an integrations row, a closing trial band, and the existing newsletter. Nav and footer markup were left as they were.

## Design decisions

- Used the existing tokens: Instrument Sans, ink `#0a1b30`, teal `#2d7261`, paper `#ffffff` / `#f6f8fb`.
- Rejected a purple gradient hero, a fake customer-logo wall, and a second invented “problem” story. The live page does not publish customer counts, testimonials, or a separate problem headline.
- The product screenshots are the visual system. They sit in a quiet frame (1px line, 16px radius) rather than stacked cards.
- Feature points use the existing icons and sit in an open grid, not cards inside cards.
- “Back to overview” still goes to the existing Calendly URL. The label was not rewritten.
- The local QuickBooks SVG does not scale cleanly at pill size, so the trust row uses the words Xero and QuickBooks as links. The product screenshots remain the visual proof.

## Reusable modules

All styles live in `assets/product-landing.css` and apply only when `body` has `product-page`. Another product page can reuse a subset by copying the section markup.

| Module | Class | Used on this page |
| --- | --- | --- |
| Product hero | `.pl-hero` | Yes |
| Trust / integrations | `.pl-trust` | Yes — Xero and QuickBooks links only |
| Problem and solution | `.pl-section` overview | Yes — verified workflow paragraph. No invented problem headline |
| Feature overview | `.pl-features` | Yes — four existing points |
| Product workflow | `.pl-step` | Yes — six steps, image flips on even steps |
| Product screenshots | `.pl-shot` | Yes — original live image URLs and alt text |
| Benefits | `.pl-benefits` | Yes — the existing check lists, kept inside each step |
| Integrations | `.pl-integrations` | Yes |
| FAQ | `.pl-faq` | CSS only. This page has no published FAQ |
| Final CTA | `.pl-cta` | Yes — repeats the existing headline, lead, and trial actions |

## Files modified in this phase

- `group-financial-reporting/index.html` — main content only, plus the stylesheet link and `product-page` body class
- `assets/product-landing.css` — new
- `scripts/outline-gfr.js`, `scripts/dump-gfr-copy.js`, `scripts/apply-gfr-landing.js` — build/audit helpers
- `.website-project/research/gfr-copy.json` — preserved source copy
- `.website-project/research/gfr-landing-redesign.md` — this note

Not modified: `index.html`, `HomePage.html`, `modules/group-reporting.html`, `modules/intercompany-control.html`, `modules/group-planning.html`, nav markup, footer markup.

## SEO and accessibility

| Check | Result |
| --- | --- |
| Title, meta description, canonical, Open Graph, WebPage JSON-LD | Unchanged |
| Single H1 | “Audit-ready Group Financial Reporting” |
| Heading order | H1, then H2 workflow, H3 features, H2 per step, H2 integrations, H2 closing band, H2 newsletter |
| Image alt text | Preserved on product shots and feature icons |
| Internal links | Trial, Calendly, privacy policy, plus Xero and QuickBooks integration pages |
| Skip link | Present |
| Email field name | `aria-label` matches the placeholder |
| Contrast | Ink on white; white label on teal buttons; white heading on ink closing band |
| Removed | One H2, “Group Financial Reporting”, that was hidden at desktop, tablet, and mobile, plus a breadcrumb whose links were `#` |

## Validation

Measured in the local preview. This is not a production compile.

| Viewport | Result |
| --- | --- |
| 1440 | Hero grid `522px / 549px`. Screenshot sits at x=723. No horizontal overflow. 0 broken main images |
| 1280 | Same two-column hero. No horizontal overflow |
| 768 | Hero, screenshot, and CTAs stack. Nav keeps Login and the trial button |
| 390 | `scrollWidth` 390. H1 36px. Primary CTA 358px wide. Screenshot remains inside the column |

## Remaining issues

- “Back to overview” still opens `https://calendly.com/gather-support-`. Preserved from the live page. The label and destination do not match.
- No FAQ was published on the live page, so none was added.
- The closing band repeats the H1 wording. It does not add a new claim.
- The integrations cards repeat one existing sentence under both Xero and QuickBooks.
- Product screenshots are the live WebP/GIF files. The P&L table is dense at 390px because that is the source image.
- Other product pages are unchanged until this pilot is approved.
