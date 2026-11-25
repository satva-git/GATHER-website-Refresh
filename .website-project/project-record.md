# Project record

## Project

- Name: GATHER.nexus website refresh
- Type: redesign (existing marketing site rebuilt in this folder)
- Live URL: https://gather.nexus/
- This folder: static HTML refresh. Preview named in README: https://satva-git.github.io/GATHER-website-Refresh/
- Repository named in README: https://github.com/satva-git/GATHER-website-Refresh
- Scope: public marketing site in the live sitemap (84 URLs). The signed-in product at app.gather.nexus and the help centre at help.gather.nexus are separate and out of scope unless added later.
- Goal: Replace the live GATHER.nexus marketing site with this redesign only after discovery, design, content, and technical reviews, and only with approval at each milestone. Confirmed 2026-11-25.

## Step status

| Step | Activity | Status |
| --- | --- | --- |
| 01 | Project discovery | done |
| 02 | Content and business research | done |
| 03 | Competitor research (5 to 7) | done |
| 04 | Site audit and opportunities | done |
| 05 | Design discovery | done |
| 06 | Sitemap and strategy. Gate: direction | done |
| 07 | Design system and direction | in progress |
| 08 | Design approval. Gate: design | skipped with reason: user asked to implement locally on the existing brand and review the built pages before any publish, rather than pause for a separate mock |
| 09 | Page-by-page development | in progress |
| 10 | Content and SEO. Gate: content | pending |
| 11 | GEO, AEO, technical SEO | pending |
| 12 | Marketing and brand collateral | pending |
| 13 | Performance and quality testing | pending |
| 14 | GitHub and deployment setup | pending |
| 15 | Staging review. Gate: staging | pending |
| 16 | Production launch. Gate: production | pending |
| 17 | Final audit and documentation | pending |
| 18 | Ongoing maintenance | pending |

No design, content, SEO, marketing or build work starts before the direction approval.

## Decisions

| Topic | Decision | Date |
| --- | --- | --- |
| Goal | Replace the live marketing site with the redesign only after the reviews, and only with approval at each milestone. User's words: "Yes, the goal is to replace the existing live GATHER.nexus marketing website with the redesigned version, but only after completing all discovery, design, content, and technical reviews and receiving my approval at each milestone." | 2026-11-25 |
| URLs | Keep every existing live URL wherever the page survives, including About, Pricing, Contact, legal pages, product and module pages, and knowledge articles. | 2026-11-25 |
| SEO | Keep the search value: relevant titles, descriptions, headings, internal links, canonicals, and indexed content. | 2026-11-25 |
| Redirects | If a URL must change, use a 301 to the closest relevant page. No broken links and no redirect to the homepage by default. | 2026-11-25 |
| Content | Do not remove important content, features, integrations, testimonials, or business information without review and approval. | 2026-11-25 |
| Live site | Do not modify or publish the live site until the relevant milestone is approved. | 2026-11-25 |
| Backup | A complete backup of the live pages, assets, content, and URL structure is required before any production change. | 2026-11-25 |
| Git | Do not pull or push. Keep every update local until the user says otherwise. User's words: "make sure do not pull push on git keep all the updates stuff in local please". | 2026-11-25 |
| Build now, do not publish | After direction approval, implement locally. Do not push to GitHub, change the live WordPress site, change DNS, or publish a preview without explicit approval. User's words: "For now, keep everything local. Do not push anything to GitHub, modify the live WordPress website, change DNS, or publish a preview without my explicit approval." | 2026-11-25 |

## Assumptions

| Topic | Working value | Date |
| --- | --- | --- |
| Company | The site is published by CFO Tech Limited. Taken from the live footer copyright line. | 2026-11-25 |
| Competitors | The comparison set is Joiin, Fathom, Spotlight Reporting, Translucent, and Mayday, because the site already publishes pages about them. One aspirational and one adjacent name will be added from public sites and listed for confirmation at the direction gate. | 2026-11-25 |

## Approvals

| Gate | Date | User's words |
| --- | --- | --- |
| direction | 2026-11-25 | "I approve the proposed direction. The overall strategy looks good, especially retaining all 84 existing live URLs, protecting the existing content and SEO value, and keeping the current domain and URL structure unchanged." |

## Issues

| Id | Severity | Title | Status | How the fix was verified |
| --- | --- | --- | --- | --- |
| about-team-cards | high | About page shows three team cards all named Alexa | open | Not fixed. Seen on https://gather.nexus/about/ on 2026-11-25. |
| about-testimonial-repeat | high | About page repeats the same David Mitchell / Directly Energy quote four times | open | Not fixed. Seen on https://gather.nexus/about/ on 2026-11-25. Treat as unverified until the business confirms the person and company. |
| redesign-urls-differ | high | Local files use different paths from the live URLs | open | Not fixed. Mapped in strategy/06-direction.md. Must be served on the live paths. |

## Evidence

- Backup verified: no. Page HTML for all 84 sitemap URLs is saved locally (84 files, 21,235,177 bytes) in research/live-html. Images and other media are not downloaded, so this is a partial backup, not a verified full backup.
- Redirects validated: no.
- Secret scan clean: not run.
- Speed and Lighthouse: not measured.
- Visual review: not done. No browser screenshots in this pass.
- Crawl limit: the 84 URLs in the Yoast sitemap index were requested and all returned HTTP 200. Pages outside that sitemap were not crawled. This is not a verified full-site backup.

## Notes on method

The fuller automation (one-command crawl, verified backup, Lighthouse, real-browser screenshots) is not beside the skill file. This pass used the live sitemap and direct page requests.
