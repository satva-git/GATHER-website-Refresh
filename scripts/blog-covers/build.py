"""Build the GATHER.nexus blog featured images.

One shared visual system (same palette, Figtree, pill/panel shapes as the
knowledge-centre kc-cover-*.svg set), 3:2 canvas so every blog card is the same
height. Each cover is drawn on a 720x480 grid and exported at 2x (1440x960).

    python scripts/blog-covers/build.py            # writes SVG sources
    python scripts/blog-covers/render.py           # SVG -> WebP (headless Chrome)

Outputs: assets/images/blog/<slug>.svg (self-contained, Figtree subset embedded).
"""
import base64
import io
import os
import re

from fontTools import subset
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "assets", "images", "blog")

# Approved GATHER.nexus brand colours: primary #2B7869, deep #1D5449, light #EDF4F2.
# The remaining tokens are tints/shades derived from those three (plus neutral ink).
TEAL = "#2B7869"       # brand primary
TEAL_DEEP = "#1D5449"  # brand deep
BG = "#EDF4F2"         # brand light (canvas)
TINT = "#EDF4F2"       # brand light (icon wells / tags on white)
TEAL_MID = "#5A978A"   # divider on primary panels
LINE = "#BFD9D1"       # connector lines on the canvas
ON_TEAL = "#EDF4F2"    # secondary text on primary panels (brand light, 4.7:1)
INK = "#0A1B30"
MUTED = "#536273"
SLATE = "#94A3B8"
RULE = "#DDE8E4"
WHITE = "#FFFFFF"

W, H = 720, 480


def _logo(name):
    s = open(os.path.join(HERE, "logos", name), encoding="utf-8").read()
    return "data:image/svg+xml;base64," + base64.b64encode(s.encode()).decode()


LOGO = {k: _logo(k + ".svg") for k in ("gather", "xero", "quickbooks")}


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# ---------------------------------------------------------------- primitives
def rect(x, y, w, h, fill, r=0, extra="", shadow=None):
    """Rounded rect. White cards and primary panels get the shared soft shadow."""
    if shadow is None:
        shadow = fill in (WHITE, TEAL) and w >= 100 and h >= 56
    f = ' filter="url(#sh)"' if shadow else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"{f} {extra}/>'


# Shared background + depth: faint brand-teal dot grid fading out toward the
# edges, and one soft teal-tinted shadow used by every card and panel.
DEFS = (
    '<defs>'
    '<pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">'
    f'<circle cx="9" cy="9" r="1.5" fill="{TEAL}"/></pattern>'
    '<radialGradient id="fade" cx="50%" cy="46%" r="70%">'
    '<stop offset="0" stop-color="#fff" stop-opacity=".9"/>'
    '<stop offset=".6" stop-color="#fff" stop-opacity=".45"/>'
    '<stop offset="1" stop-color="#fff" stop-opacity=".12"/></radialGradient>'
    f'<mask id="dotmask"><rect width="{W}" height="{H}" fill="url(#fade)"/></mask>'
    '<filter id="sh" x="-20%" y="-20%" width="140%" height="150%">'
    f'<feDropShadow dx="0" dy="6" stdDeviation="9" flood-color="{TEAL_DEEP}" flood-opacity=".12"/>'
    '</filter></defs>'
)


def background():
    return (rect(0, 0, W, H, BG, shadow=False)
            + f'<rect width="{W}" height="{H}" fill="url(#dots)" opacity=".22" mask="url(#dotmask)"/>')


def gather_mark(x, y, size):
    """Just the GATHER 'G' briefcase mark, clipped from the full logo."""
    return (f'<svg x="{x}" y="{y}" width="{size}" height="{size * 74 / 80:.1f}" viewBox="0 0 80 74">'
            f'<image href="{LOGO["gather"]}" width="264" height="74"/></svg>')


def text(x, y, s, size=24, weight=600, fill=INK, anchor="start"):
    return (f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" '
            f'fill="{fill}" text-anchor="{anchor}">{esc(s)}</text>')


def image(href, x, y, w, h):
    return (f'<image href="{href}" x="{x}" y="{y}" width="{w}" height="{h}" '
            f'preserveAspectRatio="xMidYMid meet"/>')


def check(cx, cy, r=16, bg=TEAL, fg=WHITE):
    s = r / 16
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{bg}"/>'
            f'<path d="M{cx-7*s} {cy+0.5*s}l{5*s} {5*s} {9.5*s}-{10*s}" stroke="{fg}" '
            f'stroke-width="{3.2*s}" stroke-linecap="round" stroke-linejoin="round"/>')


def num(cx, cy, n, r=18, bg=TEAL, fg=WHITE, size=22):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{bg}"/>'
            + text(cx, cy + size * 0.36, str(n), size, 700, fg, "middle"))


def building(cx, cy, s=1.0, color=TEAL):
    """Line-style building glyph (same family as the kc-cover icon)."""
    def p(v):
        return round(v * s, 2)
    return (f'<g transform="translate({cx} {cy})" stroke="{color}" stroke-width="{p(2.6)}" '
            f'stroke-linecap="round" stroke-linejoin="round" fill="none">'
            f'<path d="M{p(-12)} {p(14)}V{p(-14)}h{p(15)}v{p(28)}M{p(3)} {p(-4)}h{p(9)}v{p(18)}'
            f'M{p(-16)} {p(14)}h{p(32)}"/>'
            f'<path d="M{p(-7)} {p(-7)}h{p(5)}M{p(-7)} {p(0)}h{p(5)}M{p(-7)} {p(7)}h{p(5)}"/></g>')


def arrow_right(cx, cy, color=TEAL, s=1.0):
    return (f'<path d="M{cx-11*s} {cy}h{22*s}m-{8*s}-{8*s} {8*s} {8*s}-{8*s} {8*s}" stroke="{color}" '
            f'stroke-width="{3.2*s}" stroke-linecap="round" stroke-linejoin="round"/>')


def curve(x1, y1, x2, y2, color=LINE, w=4, dash=""):
    mx = (x1 + x2) / 2
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<path d="M{x1} {y1}C{mx} {y1} {mx} {y2} {x2} {y2}" stroke="{color}" '
            f'stroke-width="{w}" stroke-linecap="round"{d}/>')


def line(x1, y1, x2, y2, color=LINE, w=4, dash=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{color}" stroke-width="{w}" '
            f'stroke-linecap="round"{d}/>')


def entity_pill(x, y, w, label, logo=None, h=72):
    out = [rect(x, y, w, h, WHITE, h / 2)]
    if logo:
        out.append(image(LOGO[logo], x + 14, y + 12, 48, 48))
    else:
        out.append(f'<circle cx="{x+38}" cy="{y+h/2}" r="24" fill="{TINT}"/>')
        out.append(building(x + 38, y + h / 2, 0.82))
    out.append(text(x + 76, y + h / 2 + 9, label, 26, 600, INK))
    return "".join(out)


# ---------------------------------------------------------------- covers
# Type scale on the 720 grid. Cards render 330-405px wide (x0.46-0.56), so:
# numbers 34-48, primary labels 26-30, nothing below 26 except the step digits.
def c_quickbooks():
    # Three QBO entities (each its own currency) flow through GATHER into one
    # group report; the stacked bar re-uses each entity's chip colour.
    seg = [(TEAL_DEEP, WHITE, "GBP", 80), (TEAL, WHITE, "USD", 58), (LINE, TEAL_DEEP, "AUD", 36)]
    ys = [64, 197, 330]
    node = (398, 240)
    out = []
    for y in ys:
        cy = y + 43
        out.append(curve(304, cy, node[0] - 30, node[1], LINE, 4))
    for y in ys:  # data packets travelling along each connector
        cy = y + 43
        mx = (304 + node[0] - 30) / 2
        out.append(f'<circle cx="{mx}" cy="{(cy + node[1]) / 2}" r="6" fill="{TEAL}" '
                   f'stroke="{BG}" stroke-width="3"/>')
    out += [line(node[0] + 36, 240, 448, 240, LINE, 4),
            f'<path d="M444 232l9 8-9 8" stroke="{TEAL}" stroke-width="3.2" stroke-linecap="round" '
            f'stroke-linejoin="round"/>',
            f'<circle cx="{node[0]}" cy="{node[1]}" r="38" fill="{WHITE}" filter="url(#sh)"/>',
            f'<circle cx="{node[0]}" cy="{node[1]}" r="38" stroke="{LINE}" stroke-width="2"/>',
            gather_mark(node[0] - 22, node[1] - 20.5, 44)]
    for i, y in enumerate(ys):
        bg, fg, ccy, _ = seg[i]
        cy = y + 43
        out += [rect(32, y, 272, 86, WHITE, 22),
                image(LOGO["quickbooks"], 50, cy - 23, 46, 46),
                text(110, cy + 9, f"Entity {'ABC'[i]}", 26, 700, INK),
                rect(226, cy - 18, 62, 36, bg, 18, shadow=False),
                text(257, cy + 8, ccy, 22, 700, fg, "middle")]
    x, y, w = 462, 52, 230
    out += [rect(x, y, w, 376, WHITE, 24),
            f'<path d="M{x} {y+72}V{y+24}a24 24 0 0 1 24-24h{w-48}a24 24 0 0 1 24 24v48z" fill="{TEAL}"/>',
            text(x + 24, y + 46, "Group report", 26, 700, WHITE),
            text(x + 24, y + 116, "Group revenue", 22, 600, MUTED),
            text(x + 24, y + 170, "£2.4m", 48, 700, INK)]
    bx = x + 24
    for bg, _, _, sw in seg:
        out.append(rect(bx, y + 194, sw, 18, bg, 6, shadow=False))
        bx += sw + 4
    out.append(line(x + 24, y + 244, x + w - 24, y + 244, RULE, 2))
    for j, s in enumerate(["FX converted", "Eliminated"]):
        cy = y + 284 + j * 48
        out += [check(x + 38, cy, 13), text(x + 62, cy + 9, s, 24, 600, INK)]
    return out


def doc_icon(x, y, color=TEAL, s=1.0):
    return (f'<g transform="translate({x} {y}) scale({s})" stroke="{color}" stroke-width="2.6" '
            f'fill="none" stroke-linejoin="round" stroke-linecap="round">'
            f'<path d="M0 0h18l8 8v24H0z"/><path d="M18 0v8h8M6 15h14M6 21h14M6 27h9"/></g>')


def flow_up(x, y1, y2):
    """Vertical connector (y1 below, y2 above) with a data dot and an up chevron."""
    return (line(x, y1, x, y2 + 6, LINE, 4)
            + f'<circle cx="{x}" cy="{(y1 + y2) / 2 + 4}" r="6" fill="{TEAL}" stroke="{BG}" stroke-width="3"/>'
            + f'<path d="M{x-8} {y2+12}l8-8 8 8" stroke="{TEAL}" stroke-width="3.2" '
              f'stroke-linecap="round" stroke-linejoin="round"/>')


def c_xero():
    # Bottom: Xero organisations (own ledgers, own currency). Middle: the
    # GATHER layer and what it does. Top: the group reports it produces.
    cols = [30, 255, 480]
    cw = 210
    cur = [(TEAL_DEEP, WHITE, "GBP"), (TEAL, WHITE, "USD"), (LINE, TEAL_DEEP, "AUD")]
    out = []
    for x in cols:
        cx = x + cw / 2
        out.append(flow_up(cx, 168, 104))
        out.append(flow_up(cx, 316, 264))
    for x, s in zip(cols, ["Group P&L", "Balance sheet", "Cash flow"]):
        out += [rect(x, 32, cw, 72, WHITE, 36), doc_icon(x + 20, 54, TEAL, 0.85),
                text(x + 52, 77, s, 24, 600, INK)]
    out += [rect(30, 168, 660, 96, TEAL, 28),
            rect(50, 190, 196, 52, WHITE, 26, shadow=False),
            image(LOGO["gather"], 68, 196, 160, 40)]
    cx = 690 - 24
    for s in reversed(["Mapping", "FX", "Eliminations"]):
        wch = len(s) * 12.6 + 34
        cx -= wch
        out += [rect(round(cx), 194, round(wch), 44, TEAL_DEEP, 22, shadow=False),
                text(round(cx + wch / 2), 224, s, 24, 600, WHITE, "middle")]
        cx -= 12
    for i, x in enumerate(cols):
        bg, fg, code = cur[i]
        out += [rect(x, 316, cw, 132, WHITE, 22),
                image(LOGO["xero"], x + 18, 332, 44, 44),
                text(x + 74, 364, f"Entity {'ABC'[i]}", 26, 700, INK)]
        # mini ledger: six trial-balance bars
        for j, h in enumerate([16, 26, 20, 32, 24, 30]):
            out.append(rect(x + 20 + j * 15, 430 - h, 10, h, LINE if j < 5 else TEAL, 3, shadow=False))
        out += [rect(x + cw - 78, 396, 60, 34, bg, 17, shadow=False),
                text(x + cw - 48, 420, code, 22, 700, fg, "middle")]
    return out


def c_fractional_cfo():
    x, y, w = 110, 46, 500
    rows = [("Client A", "xero", True), ("Client B", "quickbooks", True),
            ("Client C", "xero", False), ("Client D", "quickbooks", True)]
    out = [rect(x, y, w, 388, WHITE, 26),
           text(x + 32, y + 58, "Client portfolio", 28, 700, INK),
           line(x + 32, y + 90, x + w - 32, y + 90, RULE, 2)]
    for i, (name, logo, done) in enumerate(rows):
        cy = y + 132 + i * 70
        out.append(image(LOGO[logo], x + 32, cy - 21, 42, 42))
        out.append(text(x + 90, cy + 10, name, 28, 600, INK))
        if done:
            out += [check(x + w - 168, cy, 15), text(x + w - 142, cy + 9, "Closed", 26, 600, TEAL)]
        else:
            out += [f'<circle cx="{x+w-168}" cy="{cy}" r="14" fill="none" stroke="{SLATE}" '
                    f'stroke-width="3" stroke-dasharray="4 4"/>',
                    text(x + w - 142, cy + 9, "In review", 26, 600, MUTED)]
        if i < 3:
            out.append(line(x + 32, cy + 35, x + w - 32, cy + 35, RULE, 2))
    return out


def c_xero_quickbooks_platform():
    out = [f'<path d="M410 0H720V480H340z" fill="{TEAL}"/>',
           entity_pill(40, 140, 260, "Xero", "xero", 84),
           entity_pill(40, 256, 260, "QuickBooks", "quickbooks", 84),
           f'<circle cx="374" cy="240" r="30" fill="{WHITE}"/>', arrow_right(374, 240)]
    for i, s in enumerate(["Recharges", "Reconciliation", "Eliminations", "Group reporting"]):
        cy = 132 + i * 72
        out += [check(446, cy, 17, WHITE, TEAL), text(474, cy + 10, s, 28, 600, WHITE)]
    return out


def c_seven_controls():
    y = 290
    xs = [56 + i * 58 for i in range(7)]
    out = [rect(190, 120, 340, 72, TEAL, 36),
           text(360, 166, "7 controls, in-period", 30, 700, WHITE, "middle"),
           line(56, y, 440, y, LINE, 8)]
    for i, x in enumerate(xs):
        out.append(num(x, y, i + 1, 24, TEAL, WHITE, 26))
    out += [rect(436, y - 42, 252, 84, WHITE, 42),
            check(476, y, 19), text(504, y + 10, "Faster close", 28, 700, INK)]
    return out


def c_bridging_gaap():
    out = [rect(32, 180, 210, 120, WHITE, 24),
           text(137, 252, "Local GAAP", 30, 700, INK, "middle"),
           rect(478, 130, 210, 220, TEAL, 24),
           text(583, 218, "US GAAP", 30, 700, WHITE, "middle"),
           line(510, 240, 656, 240, TEAL_MID, 2),
           text(583, 288, "IFRS", 30, 700, WHITE, "middle")]
    for hx in (282, 321, 360, 399, 438):
        t = (hx - 242) / 236
        ay = (1 - t) ** 2 * 240 + 2 * (1 - t) * t * 100 + t ** 2 * 240
        out.append(line(hx, ay + 4, hx, 240, TEAL, 3))
    out += [f'<path d="M242 240Q360 100 478 240" stroke="{TEAL}" stroke-width="7" '
            f'fill="none" stroke-linecap="round"/>',
            line(242, 240, 478, 240, TEAL, 8),
            text(360, 296, "Adjustments", 28, 600, TEAL, "middle")]
    return out


def c_quadruple_entry():
    out = [line(360, 116, 360, 150),
           f'<path d="M190 176V166q0-16 16-16H514q16 0 16 16v10" stroke="{LINE}" stroke-width="4" '
           f'stroke-linecap="round"/>',
           rect(170, 40, 380, 76, TEAL, 38),
           text(360, 88, "One £10,000 recharge", 28, 700, WHITE, "middle")]
    cards = [(36, "Entity A", [("Dr", "IC receivable"), ("Cr", "Revenue")]),
             (380, "Entity B", [("Dr", "Expense"), ("Cr", "IC payable")])]
    for x, name, rows in cards:
        out += [rect(x, 176, 304, 264, WHITE, 24),
                f'<circle cx="{x+50}" cy="226" r="24" fill="{TINT}"/>', building(x + 50, 226, 0.82),
                text(x + 88, 236, name, 28, 700, INK),
                line(x + 28, 274, x + 276, 274, RULE, 2)]
        for j, (tag, acct) in enumerate(rows):
            cy = 320 + j * 70
            out += [rect(x + 24, cy - 22, 56, 44, TINT, 10),
                    text(x + 52, cy + 9, tag, 26, 700, TEAL, "middle"),
                    text(x + 94, cy + 10, acct, 26, 600, INK)]
    return out


def c_chaos_to_control():
    out = [f'<path d="M386 0H720V480H346z" fill="{TEAL}"/>',
           text(36, 122, "Month-end", 28, 700, MUTED),
           text(414, 122, "In-period", 28, 700, WHITE)]

    def row(x, y, label, amt, fill, lc, ac):
        return (rect(x, y, 276, 76, fill, 38) + text(x + 26, y + 48, label, 26, 600, lc)
                + text(x + 250, y + 48, amt, 26, 700, ac, "end"))

    out += [row(36, 150, "Entity A", "£10,000", WHITE, INK, INK),
            row(36, 296, "Entity B", "£9,850", WHITE, INK, MUTED),
            f'<circle cx="174" cy="261" r="24" fill="{BG}" stroke="{SLATE}" stroke-width="3" '
            f'stroke-dasharray="5 4"/>',
            f'<path d="M164 256h20M164 266h20M178 249l-8 24" stroke="{MUTED}" stroke-width="3" '
            f'stroke-linecap="round"/>',
            row(414, 150, "Entity A", "£10,000", TEAL_DEEP, WHITE, WHITE),
            row(414, 296, "Entity B", "£10,000", TEAL_DEEP, WHITE, WHITE),
            check(552, 261, 24, WHITE, TEAL)]
    return out


def c_fragmented_processes():
    nw, nh = 262, 76
    nodes = [(28, 52, "Recharges"), (430, 52, "Reconciliation"),
             (430, 352, "Reporting"), (28, 352, "Planning")]
    out = [line(x + nw / 2, y + nh if y < 200 else y, 360, 240) for x, y, _ in nodes]
    out += [f'<circle cx="360" cy="240" r="100" fill="{WHITE}" stroke="{TEAL}" stroke-width="6"/>',
            image(LOGO["gather"], 276, 215, 168, 50)]
    for i, (x, y, s) in enumerate(nodes):
        out += [rect(x, y, nw, nh, WHITE, nh / 2), num(x + 38, y + nh / 2, i + 1, 20, TEAL, WHITE, 24),
                text(x + 70, y + 48, s, 26, 600, INK)]
    return out


def c_multi_entity_growth():
    base = 396
    bars = [(40, 100, "1"), (136, 180, "3"), (232, 260, "8")]
    out = [line(32, base, 324, base, LINE, 4)]
    for x, h, n in bars:
        out += [rect(x, base - h, 84, h, WHITE, 16),
                text(x + 42, base - h + 46, n, 34, 700, TEAL, "middle")]
    out += [text(178, 440, "Entities", 26, 600, MUTED, "middle"),
            f'<circle cx="358" cy="240" r="26" fill="{WHITE}"/>', arrow_right(358, 240, TEAL, 0.9),
            rect(396, 56, 292, 368, TEAL, 26),
            text(424, 108, "Group view", 28, 700, WHITE)]
    for i, s in enumerate(["Reporting", "Planning", "KPIs", "Intercompany"]):
        ty = 134 + i * 70
        out += [rect(420, ty, 244, 58, TEAL_DEEP, 14),
                check(448, ty + 29, 13, WHITE, TEAL), text(472, ty + 38, s, 26, 600, WHITE)]
    return out


COVERS = [
    # (slug, replaces WP file, alt text, builder)
    ("quickbooks-online-multi-entity-consolidation",
     "2026/08/quickbooks-multi-entity-consolidation-gather-nexus.webp",
     "Three QuickBooks Online entities consolidated by GATHER.nexus into one group report", c_quickbooks),
    ("xero-multi-entity-consolidation",
     "2026/06/xero-multi-entity-consolidation-with-gather-nexus.webp",
     "Three Xero entities feeding a GATHER.nexus group layer that produces consolidated reports", c_xero),
    ("gather-nexus-for-fractional-cfos",
     "2026/06/gather-nexus-fractional-cfo-multi-client-management.webp",
     "Fractional CFO client portfolio in one place, showing each client's month-end status", c_fractional_cfo),
    ("xero-quickbooks-multi-entity-control-platform",
     "2026/06/multi-entity-control-consolidation-xero-quickbooks.webp",
     "Xero and QuickBooks entity ledgers connected to group control for recharges, reconciliation, eliminations and reporting",
     c_xero_quickbooks_platform),
    ("intercompany-accounting-controls-month-end-close",
     "2026/06/gather-nexus-intercompany-accounting-automation-workflow.webp",
     "Seven intercompany controls applied during the period, leading to a faster month-end close", c_seven_controls),
    ("bridging-the-gaap",
     "2026/04/multi-gaap-financial-reconciliation-consolidated-reporting-global-accounting.webp",
     "Local GAAP ledgers bridged to US GAAP and IFRS group reporting through conversion adjustments", c_bridging_gaap),
    ("quadruple-entry-accounting",
     "2026/04/double-entry-vs-quadruple-entry-accounting-centralized-automated-intercompany-transactions.webp",
     "One £10,000 intercompany recharge creating four linked entries across Entity A and Entity B", c_quadruple_entry),
    ("intercompany-chaos-to-control",
     "2026/04/intercompany-chaos-vs-centralized-control-data-sync-dashboard-comparison.webp",
     "Mismatched intercompany balances at month-end versus matched balances under in-period control", c_chaos_to_control),
    ("fragmented-processes-multi-entity-groups",
     "2026/03/group_finance_control_intercompany_billing_reporting_reconciliation.webp",
     "Recharges, reconciliation, reporting and planning connected through one GATHER.nexus engine", c_fragmented_processes),
    ("benefits-of-multi-entity-accounting-platform",
     "2024/11/listing-image.webp",
     "Growing number of entities supported by one group view for reporting, planning, KPIs and intercompany",
     c_multi_entity_growth),
]


# ---------------------------------------------------------------- fonts
def font_face(weight, chars):
    src = os.path.join(HERE, "fonts", f"Figtree-{weight}.ttf")
    f = TTFont(src)
    opts = subset.Options()
    opts.layout_features = ["kern", "liga"]
    opts.name_IDs = []
    opts.notdef_outline = True
    s = subset.Subsetter(opts)
    s.populate(text=chars)
    s.subset(f)
    buf = io.BytesIO()
    f.save(buf)
    b64 = base64.b64encode(buf.getvalue()).decode()
    return (f"@font-face{{font-family:'FT';font-weight:{weight};"
            f"src:url(data:font/ttf;base64,{b64}) format('truetype')}}")


def build(slug, alt, body):
    inner = "".join(body)
    used = {}
    for m in re.finditer(r'font-weight="(\d+)"[^>]*>([^<]*)</text>', inner):
        used.setdefault(m.group(1), set()).update(m.group(2))
    faces = "".join(font_face(w, "".join(sorted(c)) + " ") for w, c in sorted(used.items()))
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W*2}" '
           f'height="{H*2}" fill="none" role="img" aria-label="{esc(alt)}">'
           f"<style>{faces}text{{font-family:'FT','Figtree',Arial,sans-serif}}</style>"
           f'{DEFS}{background()}{inner}</svg>\n')
    with open(os.path.join(OUT, slug + ".svg"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write(svg)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for slug, _, alt, fn in COVERS:
        build(slug, alt, fn())
        print("wrote", slug + ".svg")
