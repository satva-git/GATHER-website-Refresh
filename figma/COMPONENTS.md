# GATHER.nexus — Component inventory for Figma

Convert imported layers into Figma components using these names and variants.

## Naming convention

`Category / Component / Variant`

Examples:
- `Button / Primary / Default`
- `Nav / Main / Modules open`
- `Card / Overview / Default`

---

## Atoms

| Figma component name | Source in export | Notes |
|---------------------|------------------|-------|
| `Color / Ink` | Cover swatches | `#0a1b30` |
| `Color / Teal` | Cover swatches | `#2d7261` |
| `Color / Teal Tint` | Cover swatches | `#e9f2ef` |
| `Color / Paper 2` | Cover swatches | `#f6f8fb` |
| `Typography / H1` | `05-components.html` | 48px / Bold |
| `Typography / H2` | `05-components.html` | 40px / Semibold |
| `Typography / H3` | `05-components.html` | 28px / Semibold |
| `Typography / Lead` | `05-components.html` | 18px / Regular |
| `Typography / Body` | `05-components.html` | 15px / Regular |
| `Typography / Eyebrow` | `05-components.html` | 12px / Semibold / uppercase |
| `Label / Pill` | `05-components.html` | Module pill badge |
| `Button / Primary` | `05-components.html` | Teal fill + arrow icon |
| `Button / Outline` | `05-components.html` | Teal border |
| `Button / Ghost Light` | `05-components.html` | For dark backgrounds |
| `Badge / Step` | `05-components.html` | Numbered step badge |

---

## Molecules

| Figma component name | Source | Notes |
|---------------------|--------|-------|
| `Card / Overview` | `05-components.html` | 3-col module overview cards |
| `Card / Feature` | `05-components.html` | Icon + title + description |
| `Card / Level` | `05-components.html` | Data integrity level row |
| `Row / Capability` | `05-components.html` | Pillars check row |
| `Frame / Screenshot Tall` | `05-components.html` | 4:3 placeholder |
| `Frame / Screenshot Wide` | `05-components.html` | 21:9 placeholder |
| `Notice / Coming Soon` | `05-components.html` | Dashed teal notice |
| `Band / CTA Dark` | `05-components.html` | Ink background CTA section |

---

## Organisms

| Figma component name | Source | Variants |
|---------------------|--------|----------|
| `Nav / Main` | `06-nav-default.html` | Default |
| `Nav / Main` | `07-nav-modules-open.html` | Modules dropdown open |
| `Nav / Subpage` | `08-subpage-nav.html` | Active link per module page |
| `Section / Three Pillars` | `09-pillars-state-01.html` | State 01 — Reporting |
| `Section / Three Pillars` | `09-pillars-state-02.html` | State 02 — Intercompany |
| `Section / Three Pillars` | `09-pillars-state-03.html` | State 03 — Planning |
| `Section / Hero` | Homepage import | Extract from full page |
| `Section / Pricing Table` | Homepage import | Extract from `#pricing` |
| `Section / FAQ` | Homepage import | Extract from `#faq` |
| `Footer / Main` | Homepage import | Extract from `<footer>` |

---

## Component set recommendations

### Button set
Create one component set with variants:
- **Type:** Primary | Outline | Ghost Light
- **State:** Default | Hover (optional)

### Nav / Main set
- **Dropdown:** Closed | Modules open
- **Scroll:** Default | Stuck (extract from homepage if needed)

### Three Pillars set
- **Active tab:** 01 Reporting | 02 Intercompany | 03 Planning

### Screenshot frame set
- **Ratio:** Tall (4:3) | Wide (21:9)
- **State:** Placeholder | With image

---

## Tokens to link (from design-tokens.json)

| Token | Value |
|-------|-------|
| `color/ink` | `#0a1b30` |
| `color/teal` | `#2d7261` |
| `color/teal-deep` | `#245a4e` |
| `color/teal-tint` | `#e9f2ef` |
| `color/paper` | `#ffffff` |
| `color/paper-2` | `#f6f8fb` |
| `color/text-mid` | `#4a5b70` |
| `color/line` | `#e2e8f0` |
| `radius/lg` | `16px` |
| `radius/pill` | `100px` |
| `font/primary` | Instrument Sans |

Import via **Tokens Studio for Figma** → `figma/design-tokens.json` → Sync to variables.

---

## Priority order for componentization

1. Buttons (used everywhere)
2. Nav / Main + Nav / Subpage
3. Screenshot frames (module pages)
4. Cards (Overview, Feature)
5. Three Pillars section (3 variants)
6. CTA band + Footer
