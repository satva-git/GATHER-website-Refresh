# Audit: live site and this redesign

Date: 2026-11-25. The live sitemap has 84 URLs. Each returned HTTP 200 and a copy was saved in `research/live-html` (84 files, 21,235,177 bytes). Titles, descriptions, canonicals, and headings were read from those files.

## What was not measured

- Speed, Lighthouse, and Core Web Vitals: not measured.
- Visual layout: no screenshots in this pass.
- Images and other files under `/wp-content/`: not downloaded. The page-text backup is not a complete asset backup.
- Search volumes and which pages already earn visits: not available. Search Console has not been connected.
- Word counts include the shared header and footer, so they are only a hint of thin pages, not an article length.

## Strengths to keep

- The offer is clear: one platform for multi-entity work on Xero and QuickBooks, with a 30-day trial and no card.
- Product pages, audience pages, pricing, integrations, knowledge articles, and a blog already exist. That library is the search asset.
- Every saved page had a canonical URL, and none of the 84 sent a “do not index” instruction.
- The redesign in this folder already uses the same headline idea, the teal and ink colours, and real product links.

## Live site problems, by impact

**High. About page is not safe to copy as-is.** Three team cards are all named Alexa. One customer quote is repeated four times. Publishing that would hurt trust. Keep the page, replace those blocks only after you confirm what is real.

**High. Many titles are longer than the 50–60 characters that usually show in full in Google.** The homepage title is 77 characters. Most product, knowledge, and blog titles are over 60. Meaning should stay. Length should be tightened at the content step, not before you approve the wording.

**Medium. 14 pages have no meta description.** They include the blog index, the docs, the news page, the privacy page, the cookie page, the terms page, both landing pages, the product-updates index, the author archive, and one knowledge article (`group-budget-vs-actual-analysis`). Five pages have no H1: three doc archives, the news page, and `/docs/`.

**Medium. One docs archive points its canonical at a different address** (`/docs-category/group-financial-reporting/group-reporting-templates/` points at `/docs-category/group-reporting-templates/`). Whether that shorter address is a real page was not checked. Do not add a redirect until it is.

**Medium. Several important pages are thin once the menu is ignored:** Contact, News, Video, and four short knowledge hubs (group planning, unified platform, fractional CFOs, GATHER AI). They should be expanded with material you already have, not deleted.

**Low. Descriptions that exist are often longer than 155 characters,** so the last words may be cut in search results. Same rule as titles: tighten later, with your approval.

## Redesign compared with the live site

The folder does not yet contain the whole site. These live URLs have no matching page here: About, AI product page, Contact, both audience pages, Pricing, News, Video, cookie policy, privacy policy, terms, both integration pages, both landing pages, the docs, the product updates, the blog index, and 10 of the 12 blog posts.

Where a local file does exist, the address often differs from the live one. Examples: live `/intercompany-control/` is `modules/intercompany-control.html` here; live `/complex-consolidations/` sits under `group-financial-reporting/complex-consolidations/`; several knowledge articles use a longer or shorter file name; two comparisons use `/compare/...` while the indexed pages are under `/knowledge-centre/`.

If those folder paths were published, Google would see new URLs and the old ones would break. The rebuild must be served on the existing addresses.

The local homepage title is also different from the live title. Keep the live title until the content step agrees a replacement.

## Top 10

1. Publish every surviving page on its current URL. Impact: protects the search asset. Effort: medium, mostly routing.
2. Build the missing commercial and legal pages before any launch. Impact: the trial, pricing, and trust paths exist today and must exist on day one.
3. Confirm or replace the About team cards and the repeated quote before they move across. Impact: trust. Effort: small, waiting on you.
4. Move local articles onto the live knowledge and blog slugs. Do not launch `/compare/` or `/modules/` as the public address.
5. Port the 10 blog posts and the product updates that are not in this folder yet.
6. Tighten titles and fill the 14 empty descriptions, keeping the current meaning. Do this at the content step.
7. Give Contact, News, Video, and the short knowledge hubs a real job and enough text to deserve their URL.
8. Keep one primary action, the trial, with login and contact as the secondary paths.
9. Measure speed on the rebuilt pages before staging. Not measured yet. A static site should help, and that is a hope until a test is run.
10. Finish the asset backup (images, downloads, favicon) before any production change. Page HTML is saved. Media files are not.

## Scores

No score out of 10. Speed, accessibility, and the visual design were not measured, so an overall score would be made up.
