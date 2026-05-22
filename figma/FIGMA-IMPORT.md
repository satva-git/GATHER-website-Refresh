# GATHER.nexus → Figma import

Turn your HTML pages into **editable Figma layers** using **html.to.design**.

## Quick start (≈15 minutes)

```bash
npm run figma:export
```

Then in Figma:

1. Install plugin **html.to.design**
2. Create file: **GATHER.nexus — Website**
3. Run plugin → **File** tab
4. Drag in **`figma-export/gather-nexus-figma-import.zip`**
5. Organize frames using **`figma/FILE-STRUCTURE.md`**
6. Build components using **`figma/COMPONENTS.md`**

---

## What gets exported

| File | Purpose |
|------|---------|
| `00-cover.html` | Figma file cover page |
| `01-homepage-desktop.html` | Full homepage — 1440px |
| `01-homepage-mobile.html` | Full homepage — 390px |
| `02–04 *-desktop/mobile.html` | Module pages |
| `05-components.html` | **Component library** — buttons, cards, typography |
| `06-nav-default.html` | Main nav — default state |
| `07-nav-modules-open.html` | Main nav — Modules dropdown open |
| `08-subpage-nav.html` | Module page navigation |
| `09-pillars-state-01.html` | Three Pillars — Reporting active |
| `09-pillars-state-02.html` | Three Pillars — Intercompany active |
| `09-pillars-state-03.html` | Three Pillars — Planning active |
| `gather-nexus-figma-import.zip` | All files bundled |
| `manifest.json` | Machine-readable export index |

**Total: 17 HTML frames** ready for Figma import.

---

## Install html.to.design

1. Figma → **Plugins → Browse plugins** → search **html.to.design** → Install
2. Optional: [Chrome extension](https://chromewebstore.google.com/detail/htmltodesign/ldnheaepmnmbjjjahokphckbpgciiaed) for live URL capture

Docs: [Import local files](https://html.to.design/docs/file-tab/) · [Import HTML code](https://html.to.design/docs/code-tab/)

---

## Import methods

### Method A — Zip import (recommended)

1. Run `npm run figma:export`
2. In Figma, run **html.to.design → File tab**
3. Drop **`figma-export/gather-nexus-figma-import.zip`**
4. Wait for all frames to convert

### Method B — Single page paste

1. Open any file from `figma-export/` in a text editor
2. Copy all (Ctrl+A)
3. **html.to.design → Editor tab → Paste → Create**

### Method C — Live capture (best fidelity)

```bash
npm run preview
```

Chrome extension → Capture each URL:

- `http://localhost:3000/`
- `http://localhost:3000/modules/intercompany-control.html`
- `http://localhost:3000/modules/group-reporting.html`
- `http://localhost:3000/modules/group-planning.html`

Paste into Figma (Ctrl+V) or send to plugin.

---

## Organize your Figma file

Follow **`figma/FILE-STRUCTURE.md`** for page tabs and frame names.

Suggested Figma pages:

```
📄 Cover
📄 Design tokens
📄 Homepage — Desktop
📄 Homepage — Mobile
📄 Homepage — States (3 pillar tabs)
📄 Intercompany Control
📄 Group Reporting
📄 Group Planning
📄 Components
```

---

## Build the component library

Import **`05-components.html`** first, then follow **`figma/COMPONENTS.md`** to create:

- Button / Primary, Outline, Ghost
- Nav / Main (default + dropdown open)
- Nav / Subpage
- Cards, screenshot frames, typography styles
- Three Pillars section (3 tab states)

---

## Apply design tokens

1. Install **Tokens Studio for Figma**
2. Import **`figma/design-tokens.json`**
3. Sync to Figma variables

Font: install **Instrument Sans** from [Google Fonts](https://fonts.google.com/specimen/Instrument+Sans) before import.

---

## Notes

- Export forces all scroll-reveal content visible (`.sr` fix)
- Screenshot placeholders import as designed — swap for real images in Figma
- Three Pillars: use `09-pillars-state-*.html` for all 3 tab states
- Re-run `npm run figma:export` after HTML changes

---

## Related docs

| Doc | Purpose |
|-----|---------|
| `figma/FILE-STRUCTURE.md` | Figma page + frame layout |
| `figma/COMPONENTS.md` | Component naming + inventory |
| `figma/design-tokens.json` | Colors, type, spacing tokens |
