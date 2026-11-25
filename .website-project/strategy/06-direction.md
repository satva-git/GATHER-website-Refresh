# Direction: sitemap, page plan, and roadmap

Date: 2026-11-25. This is the proposal for the direction gate. Nothing here is built or published.

## Recommendation

Rebuild the marketing site as the static pages already started in this folder, and serve them on the **current gather.nexus addresses**. Leave the live WordPress site exactly as it is until you approve production.

All **84** live URLs are **KEEP**. None are removed. No redirect is proposed yet. A redirect is only allowed later if a page truly cannot keep its address, and then only to the closest matching page.

Local folder names such as `modules/` and `compare/` are working files. They must not become the public URL when a live address already exists.

## Navigation (six items, in customer words)

1. Group reporting (includes Complex consolidations)
2. Intercompany
3. Planning
4. Pricing
5. Knowledge
6. Company (About and Contact)

The trial button stays in the header and is not a seventh menu item. Finance teams, fractional CFOs, GATHER AI, Xero, and QuickBooks stay as pages, linked from the menus above and from the footer. Integrations do not need their own top-level item.

## Templates

1. Home
2. Product page (reporting, complex consolidations, intercompany, planning, AI)
3. Audience page (finance teams, fractional CFOs)
4. Article (knowledge, comparisons, and blog use one article template)
5. Pricing
6. Utility (contact, news, video, docs, legal, product updates, landing pages)

Shared parts: header, footer, trial band, proof row, article layout.

## Page plan (commercial pages)

| Page | Job | Main action | Search topic | Source |
| --- | --- | --- | --- | --- |
| Home | Explain the platform and point people to their module | Start trial | Multi-entity finance platform for Xero and QuickBooks | Live home, already drafted locally |
| Group reporting | Show consolidation and drill-down | Start trial | Group financial reporting | Live page plus `modules/group-reporting.html` |
| Complex consolidations | Show acquisitions, disposals, ownership layers | Start trial | Complex consolidations | Live page plus the local complex-consolidations folder |
| Intercompany | Show recharges, matching, eliminations | Start trial | Intercompany control | Live page plus the local module |
| Planning | Show budgets rolling to the group | Start trial | Group financial planning | Live page plus the local module |
| GATHER AI | Explain what the AI does and what it does not do | Start trial | GATHER AI | Live `/ai/` page. The local MCP article stays a separate knowledge URL |
| Finance teams | Speak to in-house teams | Start trial | Software for multi-entity finance teams | Live page. Not in this folder yet |
| Fractional CFOs | Speak to advisers with many groups | Start trial | Software for fractional CFOs | Live page. Not in this folder yet |
| Pricing | Show the real monthly prices | Start trial, or request a price over 5 groups | GATHER pricing | Live page. Copy the figures from the source, do not retype from memory |
| Knowledge hub and articles | Answer one question each, then offer the product | Read, then trial | The topic already in the URL | Live articles. Keep every slug |
| Blog and product updates | Keep the dated posts | Read, then trial | The existing headline | Live posts. Only two blog posts are in this folder |
| Contact, video, news, docs, legal, landing pages | Keep the current job of each URL | The action already on that page | Keep the current title meaning | Live pages. Legal text is copied, then marked for a lawyer, not rewritten as if it were new advice |

## Journeys

- In-house finance lead: Home or a knowledge article, then Intercompany or Group reporting, then trial.
- Fractional CFO: Audience page or a comparison article, then Pricing, then trial.
- Someone comparing tools: The existing comparison URL, a straight answer in the first paragraph, then the matching product page.

## Technology and cost

The live site is WordPress, on a host that uses SiteGround’s optimizer. That host’s monthly price was not looked up.

The redesign is static HTML. That is a change of technology, and it is part of what you have asked for. WordPress stays in place until a later production approval. After launch, the practical loss is editing in the WordPress screens. Articles would be updated in the files, unless you later add a simple editor. I recommend living with file updates for now, because the rebuild is already static and it removes the theme and plugin layer. A headless editor can be added later if writing new articles every week becomes painful.

Prices checked on 2026-11-25:

- GitHub Pages: included at $0 for a public repository (GitHub’s own plans page). This is how the preview in the README is already described. A public repository is visible.
- Vercel Pro: $20 per month (vercel.com/pricing). Use this if you want a commercial host, preview links, and the redirect file this folder already contains. The free Hobby plan is described by Vercel as personal and non-commercial, so it is the wrong plan for this site.
- Domain: already yours. No domain or email change is proposed.
- Current WordPress hosting: keep paying it through launch and for 30 days afterwards. Amount: unknown until you tell me the bill.

No new paid tool is required to continue design and page building on this computer.

## Roadmap

1. You approve this direction, or you mark what to change.
2. A real local preview of the style guide and the homepage. You approve the design before the rest is skinned.
3. Build the missing pages locally, on the live URLs, without removing content you have not approved.
4. You approve the rewritten key pages and the list of anything tightened.
5. Test on this computer, then a private staging link only when you allow it. Git push is off until you say otherwise, so staging cannot be published yet.
6. Production only after a complete media backup, a clean test, and your explicit go-ahead.

Out of scope: the app at app.gather.nexus, the help centre, and any change to email or DNS.

## Risks

- Publishing the folder paths would throw away the current URLs. The plan above avoids that.
- The About page proof is unfinished. It must not be copied blindly.
- The image backup is incomplete, so production stays blocked.
- Search Console is not connected, so “this page gets visits” is unknown. Until it is, every indexed URL is treated as worth keeping.
