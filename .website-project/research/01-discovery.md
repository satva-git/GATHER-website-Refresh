# Discovery notes (step 01, in progress)

Date: 2026-11-25

## What was checked

- robots.txt at https://gather.nexus/robots.txt allows all listed crawlers, including major search and AI crawlers, and points to https://gather.nexus/sitemap_index.xml.
- The sitemap index lists 10 child sitemaps. Together they contain 84 URLs.
- Each of those 84 URLs was requested. All returned HTTP 200.
- For each URL the title, meta description and first H1 were saved in content-inventory.csv. Several archive, news and legal pages have a blank description or a blank H1. Counts are in that file, not estimated here.
- The About page and the Pricing page were read in full text.

## What was not checked

- Full body text, images, alt text, forms and link lists are not saved for every page yet.
- No screenshots. No speed test. No Lighthouse score. Those results are not measured.
- app.gather.nexus and help.gather.nexus were not crawled.
- Pages that only appear after login, or that are missing from the sitemap, were not found.

## What the live site is

GATHER.nexus is a multi-entity finance platform for finance teams and fractional CFOs who use Xero and QuickBooks. The live marketing site is WordPress (Yoast sitemaps, /wp-content/ image paths).

The homepage H1 is "One Powerful Platform Unifying All Your Multi-Entity Workflows". The meta description says it simplifies multi-entity, multi-currency consolidation for Xero and QuickBooks, including intercompany recharges, reconciliations and eliminations.

From the About page: founded by Howard Thompson, a scale-up CFO, from building finance functions across seven countries and four continents for a VC-backed business. Three modules named there: Group Financial Reporting, Group Financial Control (including Intercompany Control), and Group Financial Planning. The navigation also has Complex Consolidations and GATHER AI.

Primary action on the site: "Start 30 days Free Trial", with "No Credit Card Required". Login goes to the app. Pricing is a separate page with monthly, per-module fees and a currency switcher (GBP, USD, AUD, EUR, NZD, CAD, ZAR). The fetched pricing text did not line up cleanly enough to copy the full price grid. Prices stay on the live page until they are read from the page source.

Footer copyright: CFO Tech Limited. Legal pages present: privacy, cookies, website terms.

## This folder compared with the live site

This folder is already a static HTML rebuild of parts of the site. The homepage in index.html uses the same headline idea and still sets its canonical URL to https://gather.nexus/.

Live product addresses such as /intercompany-control/, /group-financial-reporting/ and /group-financial-planning/ are not the same paths as the local files under modules/. Several live pages have no local file yet: About, Pricing, Contact, audience pages, legal pages, integrations, product updates, docs, and most blog posts. Two blog posts and a set of knowledge-centre articles do exist locally, often under different file names from the live URLs.

## Must not lose (early list)

- The 84 live URLs, or a redirect to the closest matching page. Homepage is not the default target.
- Trial and login paths.
- Xero and QuickBooks integration pages.
- Published prices, legal pages, and knowledge-centre articles.
- Anything Search Console later shows as a page that already gets visits. That data has not been connected.

## Open questions for the business

- Confirm the goal (see the project record assumption).
- Confirm whether the repeated testimonial and the three "Alexa" team cards are placeholders.
- Who the business loses customers to, and which sites they admire. Needed before competitor research is finished.
