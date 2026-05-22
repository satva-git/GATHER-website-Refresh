# GATHER.nexus — Figma file structure

Use this layout after importing `figma-export/gather-nexus-figma-import.zip` via **html.to.design**.

## Figma file name

**GATHER.nexus — Website**

---

## Pages (Figma tabs)

| # | Figma page | Import file(s) | Frame name |
|---|------------|----------------|------------|
| 1 | Cover | `00-cover.html` | Cover — 1440 × 900 |
| 2 | Design tokens | Manual / Tokens Studio | Color + type swatches |
| 3 | Homepage — Desktop | `01-homepage-desktop.html` | Homepage / Desktop / 1440 |
| 4 | Homepage — Mobile | `01-homepage-mobile.html` | Homepage / Mobile / 390 |
| 5 | Homepage — States | `09-pillars-state-01..03.html` | Pillars / State 01–03 |
| 6 | Intercompany Control | `02-intercompany-control-*.html` | Desktop + Mobile |
| 7 | Group Reporting | `03-group-reporting-*.html` | Desktop + Mobile |
| 8 | Group Planning | `04-group-planning-*.html` | Desktop + Mobile |
| 9 | Components | `05-components.html`, `06–08` | See COMPONENTS.md |

---

## Import order (recommended)

1. **Cover** — sets context for stakeholders
2. **Components** — build the design system first
3. **Homepage desktop + mobile**
4. **Pillar states** — place beside homepage on States page
5. **Module pages** — one Figma page per module

---

## After import — cleanup checklist

- [ ] Rename all frames using the table above
- [ ] Group desktop + mobile side-by-side on each page
- [ ] Create components from `05-components.html` (see COMPONENTS.md)
- [ ] Link colors to variables from `design-tokens.json`
- [ ] Set font family to **Instrument Sans** on all text layers
- [ ] Replace screenshot placeholders with real product images
- [ ] Add auto-layout to nav, buttons, cards where missing
- [ ] Delete duplicate layers created by re-imports

---

## Frame sizes

| Breakpoint | Width | Use |
|------------|-------|-----|
| Desktop | 1440px | Primary marketing frames |
| Mobile | 390px | iPhone-style mobile frames |
| Cover | 1440 × 900 | File cover only |

---

## Re-export workflow

When HTML changes:

```bash
npm run figma:export
```

Re-import only the changed frames in html.to.design (File tab → single HTML), or replace the full zip for a fresh import.
