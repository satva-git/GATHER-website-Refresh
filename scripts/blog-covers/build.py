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


LOGO = {k: _logo(k + ".svg") for k in ("gather", "xero", "quickbooks", "mayday")}


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


def user_icon(cx, cy, color=TEAL):
    return (f'<g stroke="{color}" stroke-width="2.8" fill="none" stroke-linecap="round">'
            f'<circle cx="{cx}" cy="{cy - 6}" r="7"/>'
            f'<path d="M{cx - 13} {cy + 14}c1.5-8 7-12 13-12s11.5 4 13 12"/></g>')


def c_fractional_cfo():
    # One GATHER window across the whole client book: a month-end close ring,
    # per-client progress (Xero or QuickBooks), room to add the next client,
    # and a floating "1 login" badge.
    x, y, w, h = 96, 40, 588, 400
    out = [rect(x, y, w, h, WHITE, 24),
           f'<path d="M{x} {y+62}V{y+24}a24 24 0 0 1 24-24h{w-48}a24 24 0 0 1 24 24v38z" fill="{TINT}"/>',
           line(x, y + 62, x + w, y + 62, RULE, 2)]
    for k in range(3):
        out.append(f'<circle cx="{x + 28 + k * 18}" cy="{y + 31}" r="5.5" fill="{LINE}"/>')
    out += [gather_mark(x + 94, y + 17, 30),
            text(x + 136, y + 40, "Client portfolio", 24, 700, INK)]
    # close ring: 3 of 4 clients closed
    rcx, rcy, r = 210, 248, 66
    circ = 2 * 3.14159 * r
    out += [text(rcx, 150, "Month-end", 24, 600, MUTED, "middle"),
            f'<circle cx="{rcx}" cy="{rcy}" r="{r}" stroke="{TINT}" stroke-width="16"/>',
            f'<circle cx="{rcx}" cy="{rcy}" r="{r}" stroke="{TEAL}" stroke-width="16" '
            f'stroke-linecap="round" stroke-dasharray="{circ * 0.75 - 4:.1f} {circ:.1f}" '
            f'transform="rotate(-90 {rcx} {rcy})"/>',
            text(rcx, rcy + 8, "3/4", 34, 700, INK, "middle"),
            text(rcx, rcy + 36, "closed", 24, 600, MUTED, "middle"),
            line(316, 120, 316, 420, RULE, 2)]
    rows = [("Client A", "xero", 1.0), ("Client B", "quickbooks", 1.0),
            ("Client C", "xero", 0.6), ("Client D", "quickbooks", 1.0)]
    for i, (name, logo, p) in enumerate(rows):
        cy = 140 + i * 60
        out += [image(LOGO[logo], 340, cy - 18, 36, 36),
                text(388, cy + 8, name, 24, 600, INK),
                rect(500, cy - 5, 96, 10, TINT, 5, shadow=False),
                rect(500, cy - 5, round(96 * p), 10, TEAL if p == 1 else SLATE, 5, shadow=False)]
        if p == 1:
            out.append(check(634, cy, 13))
        else:
            out.append(f'<circle cx="634" cy="{cy}" r="12" stroke="{SLATE}" stroke-width="3" '
                       f'stroke-dasharray="4 4"/>')
        out.append(line(340, cy + 30, 656, cy + 30, RULE, 2))
    out += [f'<rect x="340" y="378" width="316" height="44" rx="22" fill="{WHITE}" stroke="{LINE}" '
            f'stroke-width="2.5" stroke-dasharray="7 6"/>',
            f'<path d="M386 400h16M394 392v16" stroke="{TEAL}" stroke-width="3" stroke-linecap="round"/>',
            text(412, 409, "Add client", 24, 600, TEAL)]
    # floating badge breaking the window edge
    out += [rect(34, 348, 168, 64, WHITE, 32),
            f'<circle cx="74" cy="380" r="22" fill="{TINT}"/>', user_icon(74, 380),
            text(108, 389, "1 login", 24, 700, INK)]
    return out


def control_glyph(kind, cx, cy, color=TEAL):
    """Small line glyphs for the four group controls."""
    d = {
        "recharge": f"M{cx-8} {cy-4}h15l-4-4M{cx+8} {cy+4}h-15l4 4",
        "reconcile": f"M{cx-8} {cy-4}h16M{cx-8} {cy+4}h16",
        "eliminate": f"M{cx-11} {cy}h8l-4-4m4 4-4 4M{cx+11} {cy}h-8l4-4m-4 4 4 4",
        "report": f"M{cx-6} {cy+7}v-6M{cx} {cy+7}v-14M{cx+6} {cy+7}v-9",
        "plan": f"M{cx-9} {cy+6}l6-6 4 4 8-8m-5 0h5v5",
        "kpi": f"M{cx-8} {cy+5}a8 8 0 0 1 16 0M{cx} {cy+5}l4-6",
    }[kind]
    return (f'<path d="{d}" stroke="{color}" stroke-width="2.8" stroke-linecap="round" '
            f'stroke-linejoin="round"/>')


def c_xero_quickbooks_platform():
    # Left: entities on mixed ledgers (Xero / QuickBooks). Centre: GATHER hub
    # sitting on the panel edge. Right: the group controls it runs, ending in
    # a balanced result (the "one financial truth" of the original artwork).
    panel = "M430 0H720V480H390z"
    hub = (366, 270)
    out = [
        '<defs><pattern id="dotsl" width="18" height="18" patternUnits="userSpaceOnUse">'
        f'<circle cx="9" cy="9" r="1.3" fill="{WHITE}"/></pattern>'
        f'<clipPath id="panel"><path d="{panel}"/></clipPath></defs>',
        f'<path d="{panel}" fill="{TEAL}"/>',
        f'<path d="M640 0H720V480H560z" fill="{TEAL_DEEP}" opacity=".35"/>',
        f'<rect width="{W}" height="{H}" fill="url(#dotsl)" opacity=".10" clip-path="url(#panel)"/>',
        text(28, 84, "Entity ledgers", 24, 600, MUTED),
        text(444, 84, "Group control", 28, 700, WHITE),
    ]
    ents = [("Entity A", "xero"), ("Entity B", "quickbooks"), ("Entity C", "xero")]
    ys = [128, 232, 336]
    ex, ew, eh = 28, 236, 76
    for y in ys:
        out.append(curve(ex + ew, y + eh / 2, hub[0] - 44, hub[1], LINE, 4))
    for y in ys:
        cy = y + eh / 2
        mx = (ex + ew + hub[0] - 44) / 2
        out.append(f'<circle cx="{mx}" cy="{(cy + hub[1]) / 2}" r="6" fill="{TEAL}" '
                   f'stroke="{BG}" stroke-width="3"/>')
    for (name, logo), y in zip(ents, ys):
        out += [rect(ex, y, ew, eh, WHITE, eh / 2),
                image(LOGO[logo], ex + 15, y + 15, 46, 46),
                text(ex + 74, y + eh / 2 + 9, name, 26, 700, INK)]
    # hub "socket" cut into the panel edge, then the GATHER node
    out += [f'<circle cx="{hub[0]}" cy="{hub[1]}" r="60" fill="{BG}" stroke="{LINE}" stroke-width="2"/>',
            f'<circle cx="{hub[0]}" cy="{hub[1]}" r="44" fill="{WHITE}" filter="url(#sh)"/>',
            gather_mark(hub[0] - 25, hub[1] - 23, 50)]
    rows = [("recharge", "Recharges"), ("reconcile", "Reconciliation"),
            ("eliminate", "Eliminations"), ("report", "Group reporting")]
    rx, rw, rh = 436, 262, 54
    for i, (kind, label) in enumerate(rows):
        y = 110 + i * 64
        cy = y + rh / 2
        out += [rect(rx, y, rw, rh, TEAL_DEEP, 16, shadow=False),
                f'<circle cx="{rx + 30}" cy="{cy}" r="16" fill="{WHITE}"/>',
                control_glyph(kind, rx + 30, cy),
                text(rx + 56, cy + 9, label, 26, 600, WHITE)]
    out += [rect(rx, 380, rw, 60, WHITE, 30),
            check(rx + 32, 410, 16),
            text(rx + 60, 419, "Balanced", 26, 700, INK),
            rect(rx + rw - 74, 393, 58, 34, TINT, 17, shadow=False),
            text(rx + rw - 45, 417, "£0", 22, 700, TEAL, "middle")]
    return out


def c_seven_controls():
    # Close timeline. Manual: nothing happens in the month, then a long close.
    # GATHER: the seven controls run through the month, the close is short.
    cx0, cy0, cw, ch = 32, 46, 656, 384
    m0, m1, c1 = 214, 512, 664          # month span, close zone end
    r1, r2 = 252, 354                   # row centres
    out = [rect(cx0, cy0, cw, ch, WHITE, 24),
           text(60, 102, "7 controls, in-period", 28, 700, INK),
           rect(456, 68, 208, 50, TEAL, 25, shadow=False),
           check(484, 93, 14, WHITE, TEAL),
           text(508, 102, "Faster close", 24, 700, WHITE),
           line(60, 140, 664, 140, RULE, 2),
           rect(m1 + 6, 152, c1 - m1 - 6, 258, TINT, 14, shadow=False),
           text((m0 + m1) / 2, 186, "Month", 24, 600, MUTED, "middle"),
           text((m1 + 6 + c1) / 2, 186, "Close", 26, 700, TEAL, "middle")]
    for k in range(5):  # week ticks
        tx = m0 + k * (m1 - m0) / 4
        out.append(line(tx, 202, tx, 210, LINE, 3))
    out.append(line(m0, 206, m1, 206, LINE, 3))
    # manual row
    out += [text(60, r1 + 10, "Manual", 26, 700, MUTED),
            line(m0, r1, m1 - 64, r1, RULE, 4, "2 10"),
            f'<rect x="{m1 - 56}" y="{r1 - 21}" width="{c1 - m1 + 40}" height="42" rx="21" fill="{RULE}" '
            f'stroke="{SLATE}" stroke-width="2.5" stroke-dasharray="7 6"/>',
            text(m1 + 66, r1 + 10, "Day 10", 26, 700, MUTED, "middle")]
    # GATHER row
    out += [gather_mark(60, r2 - 14, 30),
            text(98, r2 + 10, "GATHER", 26, 700, TEAL),
            line(m0, r2, m1 - 10, r2, LINE, 6)]
    for i in range(7):
        out.append(num(m0 + 16 + i * 44, r2, i + 1, 17, TEAL, WHITE, 22))
    out += [rect(m1 + 18, r2 - 22, 112, 44, TEAL, 22, shadow=False),
            check(m1 + 42, r2, 12, WHITE, TEAL),
            text(m1 + 62, r2 + 9, "Day 2", 24, 700, WHITE),
            line(60, r1 + 52, 664, r1 + 52, RULE, 2)]
    return out


def c_bridging_gaap():
    # One set of books kept as parallel ledgers: a single GATHER source
    # branches into Local GAAP, US GAAP and IFRS lanes (transit-map style);
    # conversion adjustments sit on the lanes and each lane ends in its own
    # reported figure (1.20 + 0.04 = 1.24, 1.20 - 0.02 = 1.18).
    node = (74, 244)
    lanes = [  # y, colour, label, adjustment, result
        (112, LINE, "Local GAAP", None, "£1.20m"),
        (244, TEAL, "US GAAP", "+£40k", "£1.24m"),
        (376, TEAL_DEEP, "IFRS", "−£20k", "£1.18m"),
    ]
    out = [text(456, 62, "Adjustments", 24, 600, MUTED, "middle"),
           text(608, 62, "Reported", 24, 600, MUTED, "middle")]
    for y, col, *_ in lanes:  # rails first, so everything else sits on them
        x0 = node[0] + 40
        out.append(f'<path d="M{x0} {node[1]}C{x0 + 60} {node[1]} {x0 + 40} {y} {x0 + 100} {y}H600" '
                   f'stroke="{col}" stroke-width="10" stroke-linecap="round" fill="none"/>')
    out += [f'<circle cx="{node[0]}" cy="{node[1]}" r="44" fill="{WHITE}" filter="url(#sh)"/>',
            f'<circle cx="{node[0]}" cy="{node[1]}" r="44" stroke="{LINE}" stroke-width="2"/>',
            gather_mark(node[0] - 24, node[1] - 22, 48),
            text(node[0], node[1] + 78, "One", 24, 700, INK, "middle"),
            text(node[0], node[1] + 106, "ledger", 24, 700, INK, "middle")]
    for y, col, label, adj, val in lanes:
        out += [rect(196, y - 28, 186, 56, WHITE, 28),
                f'<circle cx="222" cy="{y}" r="9" fill="{col}"/>',
                text(242, y + 9, label, 24, 700, INK)]
        if adj:
            out += [rect(406, y - 24, 100, 48, col, 24, shadow=False),
                    text(456, y + 9, adj, 24, 700, WHITE, "middle")]
        else:
            out += [rect(406, y - 24, 100, 48, BG, 24, shadow=False,
                         extra=f'stroke="{LINE}" stroke-width="2.5" stroke-dasharray="6 5"'),
                    text(456, y + 8, "None", 22, 600, MUTED, "middle")]
        out += [rect(528, y - 36, 160, 72, WHITE, 22),
                text(608, y + 11, val, 30, 700, INK, "middle")]
    return out


def c_quadruple_entry():
    # One recharge posted once by GATHER (top) becomes four linked entries
    # across two entities; the intercompany pair (IC receivable / IC payable)
    # is highlighted, and everything resolves to one balanced result.
    cw, top, ch = 332, 152, 236
    cards = [(20, "Entity A", [("Dr", "IC receivable", True), ("Cr", "Revenue", False)]),
             (368, "Entity B", [("Dr", "Expense", False), ("Cr", "IC payable", True)])]
    out = [line(360, 96, 360, 124),
           f'<path d="M186 {top}V140q0-16 16-16H518q16 0 16 16v{top-140}" stroke="{LINE}" '
           f'stroke-width="4" stroke-linecap="round"/>']
    for px in (272, 448):
        out.append(f'<circle cx="{px}" cy="124" r="6" fill="{TEAL}" stroke="{BG}" stroke-width="3"/>')
    # result connectors (drawn first so the cards and pill sit on top)
    out += [line(186, top + ch, 186, 436), line(534, top + ch, 534, 436)]
    out += [rect(165, 28, 390, 68, TEAL, 34),
            f'<circle cx="203" cy="62" r="24" fill="{WHITE}"/>',
            gather_mark(188, 48, 30),
            text(240, 72, "One £10,000 recharge", 28, 700, WHITE)]
    for x, name, rows in cards:
        out += [rect(x, top, cw, ch, WHITE, 24),
                f'<circle cx="{x+44}" cy="{top+42}" r="22" fill="{TINT}"/>', building(x + 44, top + 42, 0.78),
                text(x + 78, top + 52, name, 28, 700, INK),
                line(x + 20, top + 78, x + cw - 20, top + 78, RULE, 2)]
        for j, (tag, acct, ic) in enumerate(rows):
            cy = top + 120 + j * 66
            if ic:
                out.append(rect(x + 10, cy - 28, cw - 20, 56, TINT, 14, shadow=False))
            if tag == "Dr":
                out.append(rect(x + 20, cy - 19, 50, 38, TEAL, 10, shadow=False))
                fg = WHITE
            else:
                out.append(f'<rect x="{x+21}" y="{cy-18}" width="48" height="36" rx="9" fill="{WHITE}" '
                           f'stroke="{LINE}" stroke-width="2"/>')
                fg = TEAL
            out += [text(x + 45, cy + 8, tag, 22, 700, fg, "middle"),
                    text(x + 82, cy + 8, acct, 24, 600, INK),
                    text(x + cw - 22, cy + 8, "£10k", 24, 700, TEAL if ic else MUTED, "end")]
    out += [rect(120, 412, 480, 56, WHITE, 28),
            check(152, 440, 15),
            text(178, 448, "4 entries, balanced", 24, 700, INK),
            rect(424, 422, 160, 36, TINT, 18, shadow=False),
            text(504, 447, "IC matched", 22, 700, TEAL, "middle")]
    return out


def c_chaos_to_control():
    # Left: at month-end the two entities disagree (£150 gap). Centre: GATHER
    # on the panel seam. Right: in-period, both sides match.
    panel = "M410 0H720V480H362z"
    hub = (384, 276)
    lx, rx, cw, ch = 32, 440, 248, 92
    ya, yb = 152, 308                       # card tops (A, B)
    out = [
        '<defs><pattern id="dotsl" width="18" height="18" patternUnits="userSpaceOnUse">'
        f'<circle cx="9" cy="9" r="1.3" fill="{WHITE}"/></pattern>'
        f'<clipPath id="panel"><path d="{panel}"/></clipPath></defs>',
        f'<path d="{panel}" fill="{TEAL}"/>',
        f'<path d="M640 0H720V480H570z" fill="{TEAL_DEEP}" opacity=".35"/>',
        f'<rect width="{W}" height="{H}" fill="url(#dotsl)" opacity=".10" clip-path="url(#panel)"/>',
        text(lx, 116, "Month-end", 30, 700, MUTED),
        text(rx, 116, "In-period", 30, 700, WHITE),
    ]
    # one straight line through the hub, level with the gap between the cards
    out += [line(lx + 64, hub[1], hub[0] - 56, hub[1], LINE, 4, "2 9"),
            line(hub[0] + 56, hub[1], rx + 24, hub[1], ON_TEAL, 4),
            # entity link: broken on the left, solid on the right
            line(lx + 44, ya + ch, lx + 44, yb, SLATE, 3, "3 8"),
            line(rx + 44, ya + ch, rx + 44, yb, ON_TEAL, 4)]

    def card(x, y, label, amt, dark):
        fill, well, glyph, lc, ac = ((TEAL_DEEP, TEAL, ON_TEAL, ON_TEAL, WHITE) if dark
                                     else (WHITE, TINT, TEAL, MUTED, INK))
        return (rect(x, y, cw, ch, fill, 24, shadow=True)
                + f'<circle cx="{x+46}" cy="{y+ch/2}" r="27" fill="{well}"/>'
                + building(x + 46, y + ch / 2, 0.9, glyph)
                + text(x + 90, y + 38, label, 22, 600, lc)
                + text(x + 90, y + 72, amt, 32, 700, ac))

    mid = hub[1]
    out += [card(lx, ya, "Entity A", "£10,000", False),
            card(lx, yb, "Entity B", "£9,850", False),
            f'<circle cx="{lx+44}" cy="{mid}" r="20" fill="{BG}" stroke="{SLATE}" stroke-width="3" '
            f'stroke-dasharray="5 4"/>',
            f'<path d="M{lx+36} {mid-4}h16M{lx+36} {mid+4}h16M{lx+48} {mid-10}l-8 20" stroke="{MUTED}" '
            f'stroke-width="2.8" stroke-linecap="round"/>',
            card(rx, ya, "Entity A", "£10,000", True),
            card(rx, yb, "Entity B", "£10,000", True),
            f'<circle cx="{rx+44}" cy="{mid}" r="20" fill="{WHITE}"/>',
            check(rx + 44, mid, 15, WHITE, TEAL)]
    # short labels on the link, set on a chip so the connector stays clean
    out += [rect(lx + 72, mid - 19, 120, 38, BG, 19, shadow=False),
            text(lx + 132, mid + 8, "£150 gap", 22, 700, MUTED, "middle"),
            rect(rx + 72, mid - 19, 120, 38, TEAL, 19, shadow=False),
            text(rx + 132, mid + 8, "Matched", 22, 700, WHITE, "middle")]
    # GATHER hub socket on the panel seam
    out += [f'<circle cx="{hub[0]}" cy="{hub[1]}" r="56" fill="{BG}" stroke="{LINE}" stroke-width="2"/>',
            f'<circle cx="{hub[0]}" cy="{hub[1]}" r="42" fill="{WHITE}" filter="url(#sh)"/>',
            gather_mark(hub[0] - 24, hub[1] - 22, 48)]
    return out


def c_fragmented_processes():
    # The article's four disciplines as product modules, each with a small
    # visual of what it does, converging on one GATHER engine. Dotted orbit
    # rings around the hub add depth behind the cards.
    hx, hy = 360, 240
    cw, ch = 264, 156
    out = []
    for r, op in ((112, .40), (156, .28), (204, .18)):
        out.append(f'<circle cx="{hx}" cy="{hy}" r="{r}" stroke="{TEAL}" stroke-width="2.6" '
                   f'stroke-linecap="round" stroke-dasharray="0 11" opacity="{op}"/>')
    out.append(f'<circle cx="{hx}" cy="{hy}" r="92" fill="{WHITE}" opacity=".55"/>')
    # connectors: out of each card's inner edge, merging into the hub sides
    for sx, sy, ex in ((228, 180, 298), (492, 180, 422), (228, 300, 298), (492, 300, 422)):
        p = [(sx, sy), (sx, (sy + hy) / 2 + (hy - sy) * .3), ((sx + ex) / 2, hy), (ex, hy)]
        bx = (p[0][0] + 3 * p[1][0] + 3 * p[2][0] + p[3][0]) / 8
        by = (p[0][1] + 3 * p[1][1] + 3 * p[2][1] + p[3][1]) / 8
        out += [f'<path d="M{p[0][0]} {p[0][1]}C{p[1][0]} {p[1][1]} {p[2][0]} {p[2][1]} {p[3][0]} {p[3][1]}" '
                f'stroke="{LINE}" stroke-width="4" stroke-linecap="round"/>',
                f'<circle cx="{bx:.1f}" cy="{by:.1f}" r="6" fill="{TEAL}" stroke="{BG}" stroke-width="3"/>']
    out += [f'<circle cx="{hx}" cy="{hy}" r="62" fill="{WHITE}" filter="url(#sh)"/>',
            f'<circle cx="{hx}" cy="{hy}" r="62" stroke="{TEAL}" stroke-width="5"/>',
            gather_mark(hx - 30, hy - 27.75, 60)]

    def card(x, y, glyph, title):
        return [rect(x, y, cw, ch, WHITE, 22),
                f'<circle cx="{x + 42}" cy="{y + 42}" r="22" fill="{TINT}"/>',
                control_glyph(glyph, x + 42, y + 42),
                text(x + 76, y + 51, title, 26, 700, INK),
                line(x + 20, y + 80, x + cw - 20, y + 80, RULE, 2)]

    # 1. Recharges: Entity A bills Entity B
    x, y = 24, 24
    out += card(x, y, "recharge", "Recharges")
    for ex, s in ((x + 44, "A"), (x + 136, "B")):
        out += [f'<circle cx="{ex}" cy="{y + 118}" r="21" fill="{TINT}"/>',
                text(ex, y + 126, s, 22, 700, TEAL, "middle")]
    out += [line(x + 72, y + 118, x + 100, y + 118, TEAL, 3.2), arrow_right(x + 100, y + 118, TEAL, .8),
            rect(x + cw - 84, y + 100, 64, 36, TEAL, 18, shadow=False),
            text(x + cw - 52, y + 125, "£10k", 22, 700, WHITE, "middle")]
    # 2. Reconciliation: both sides agree
    x, y = 432, 24
    out += card(x, y, "reconcile", "Reconciliation")
    for j, s in enumerate("AB"):
        ry = y + 104 + j * 30
        out += [text(x + 24, ry + 8, s, 22, 700, MUTED),
                rect(x + 52, ry - 5, 130, 10, LINE, 5, shadow=False)]
    out += [f'<path d="M{x + 194} {y + 99}h8v40h-8" stroke="{LINE}" stroke-width="3" '
            f'stroke-linecap="round" stroke-linejoin="round"/>', check(x + 226, y + 119, 16)]
    # 3. Reporting: group P&L trend
    x, y = 432, 300
    out += card(x, y, "report", "Reporting")
    for j, h in enumerate([18, 26, 22, 34, 30, 44]):
        out.append(rect(x + 24 + j * 20, y + 140 - h, 13, h, TEAL if j == 5 else LINE, 3, shadow=False))
    out += [rect(x + cw - 84, y + 100, 64, 36, TINT, 18, shadow=False),
            text(x + cw - 52, y + 125, "+12%", 22, 700, TEAL, "middle")]
    # 4. Planning: actuals tracking against budget
    x, y = 24, 300
    out += card(x, y, "plan", "Planning")
    out += [text(x + 24, y + 112, "Budget", 22, 600, MUTED),
            text(x + cw - 24, y + 112, "92%", 22, 700, INK, "end"),
            rect(x + 24, y + 124, cw - 48, 12, TINT, 6, shadow=False),
            rect(x + 24, y + 124, round((cw - 48) * .92), 12, TEAL, 6, shadow=False)]
    return out


def c_multi_entity_growth():
    # Full-bleed white panel (same system as c_group_ledger_uses): GATHER header
    # with the Xero / QuickBooks sources, then two tiles. Left: the group grows
    # 1 -> 3 -> 8 entities. Right: one teal "Group view" whose four rows each
    # carry a small live-looking result (chart, trend, KPI, matched check).
    out = [rect(0, 0, W, H, WHITE, shadow=False),
           f'<circle cx="64" cy="60" r="32" fill="{TINT}"/>',
           gather_mark(40, 38, 48),
           text(112, 72, "Multi-entity platform", 32, 700, INK),
           text(556, 69, "Sources", 24, 600, MUTED, "end")]
    for logo, lx in (("xero", 604), ("quickbooks", 664)):
        out += [f'<circle cx="{lx}" cy="60" r="26" fill="{WHITE}" filter="url(#sh)"/>',
                image(LOGO[logo], lx - 22, 38, 44, 44)]
    out.append(line(32, 112, 688, 112, RULE, 2))

    ty, th = 132, 324
    # left tile: entity count growing
    lx, lw = 32, 300
    out += [rect(lx, ty, lw, th, BG, 24, shadow=False),
            text(lx + 24, ty + 48, "Entities", 28, 700, INK)]
    base, tile, pitch, cw, gap = ty + th - 70, 30, 36, 82, 14
    x0 = lx + (lw - (3 * cw + 2 * gap)) / 2
    out.append(line(x0 - 4, base, x0 + 3 * cw + 2 * gap + 4, base, LINE, 3))
    for k, n in enumerate((1, 3, 8)):
        bx = x0 + k * (cw + gap)
        top = base - (n + 1) // 2 * pitch - 12
        out.append(rect(bx, top, cw, base - top, WHITE, 14, shadow=True))
        for i in range(n):
            r, c = divmod(i, 2)
            tx = bx + (cw - tile) / 2 if (n - i == 1 and n % 2) else bx + 8 + c * pitch
            ty2 = base - 8 - tile - r * pitch
            out += [rect(tx, ty2, tile, tile, TINT, 8, shadow=False),
                    building(tx + tile / 2, ty2 + tile / 2, 0.54)]
        out.append(text(bx + cw / 2, base + 40, str(n), 28, 700, TEAL if n == 8 else MUTED, "middle"))

    # right tile: one group view
    rx, rw = 348, 340
    out += [rect(rx, ty, rw, th, TEAL, 24, shadow=False),
            text(rx + 24, ty + 48, "Group view", 28, 700, WHITE)]
    for i, (kind, label) in enumerate([("report", "Reporting"), ("plan", "Planning"),
                                       ("kpi", "KPIs"), ("recharge", "Intercompany")]):
        x, y, h = rx + 16, ty + 68 + i * 62, 52
        cy, end = y + h / 2, rx + rw - 36
        out += [rect(x, y, rw - 32, h, WHITE, 16, shadow=False),
                f'<circle cx="{x + 32}" cy="{cy}" r="18" fill="{TINT}"/>',
                control_glyph(kind, x + 32, cy),
                text(x + 62, cy + 8, label, 24, 600, INK)]
        if kind == "report":
            for j, bh in enumerate((10, 16, 13, 24)):
                out.append(rect(end - 47 + j * 13, cy + 12 - bh, 8, bh, LINE if j < 3 else TEAL, 2,
                                shadow=False))
        elif kind == "plan":
            out.append(f'<path d="M{end - 50} {cy + 9}l13-8 11 5 26-15" stroke="{TEAL}" '
                       f'stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>')
        elif kind == "kpi":
            out.append(text(end, cy + 8, "+12%", 22, 700, TEAL, "end"))
        else:
            out.append(check(end - 12, cy, 13))
    # bridge between the tiles
    out += [f'<circle cx="{(lx + lw + rx) / 2}" cy="{ty + th / 2}" r="20" fill="{WHITE}" filter="url(#sh)"/>',
            arrow_right((lx + lw + rx) / 2, ty + th / 2, TEAL, .7)]
    return out


def c_group_ledger_uses():
    # Full-bleed white panel (covers the shared dot-grid canvas): one GATHER
    # group ledger header fed by Xero and QuickBooks Online, and the article's
    # two uses as tiles, each a two-step "from -> to" stepper ending in a check.
    out = [rect(0, 0, W, H, WHITE, shadow=False),
           f'<circle cx="70" cy="66" r="36" fill="{TINT}"/>',
           gather_mark(43, 41, 54),
           text(124, 78, "Group ledger", 34, 700, INK),
           text(556, 75, "Sources", 24, 600, MUTED, "end")]
    for logo, lx in (("xero", 604), ("quickbooks", 664)):
        out += [f'<circle cx="{lx}" cy="66" r="28" fill="{WHITE}" filter="url(#sh)"/>',
                image(LOGO[logo], lx - 24, 42, 48, 48)]
    out.append(line(32, 128, 688, 128, RULE, 2))
    tiles = [  # x, fill, title, subtitle, from, to, (title, sub, step, rail)
        (32, BG, "Multi-GAAP", "Second reporting basis", "UK GAAP", "IFRS", (INK, MUTED, MUTED, LINE)),
        (370, TEAL, "Exit readiness", "Normalised earnings", "Reported", "Adjusted",
         (WHITE, ON_TEAL, ON_TEAL, TEAL_MID)),
    ]
    ty, tw, th = 152, 318, 300
    for tx, fill, title, sub, a, b, (tc, sc, stc, rail) in tiles:
        out += [rect(tx, ty, tw, th, fill, 24, shadow=False),
                text(tx + 28, ty + 60, title, 32, 700, tc),
                text(tx + 28, ty + 98, sub, 24, 600, sc),
                line(tx + 48, ty + 178, tx + 48, ty + 214, rail, 3),
                f'<circle cx="{tx + 48}" cy="{ty + 164}" r="12" stroke="{stc}" stroke-width="3"/>',
                text(tx + 78, ty + 173, a, 26, 600, stc),
                rect(tx + 18, ty + 210, tw - 36, 64, WHITE, 20, shadow=fill == BG),
                check(tx + 48, ty + 242, 15),
                text(tx + 78, ty + 252, b, 28, 700, INK)]
    return out


# Drawn-ink bounds of each logo inside its viewBox (x0, y0, x1, y1, vb_w, vb_h),
# measured from a 10x render, so logos centre on their ink, not their padding.
LOGO_INK = {"gather": (2.2, 2.0, 261.8, 71.9, 264, 74),
            "mayday": (0.0, 0.0, 149.6, 38.0, 150, 38)}


def centred_logo(name, cx, cy, width):
    x0, y0, x1, y1, vw, vh = LOGO_INK[name]
    k = width / vw
    x = cx - (x0 + x1) / 2 * k
    y = cy - (y0 + y1) / 2 * k
    return image(LOGO[name], round(x, 2), round(y, 2), width, round(vh * k, 2))


MAYDAY = "#FF4461"       # Mayday brand red (from their logo), used only for its scope bar
MAYDAY_TINT = "#FFE9ED"


def text_width(s, size, weight):
    """Advance width of s in Figtree at size px (kerning ignored; Figtree's is small)."""
    f = TTFont(os.path.join(HERE, "fonts", f"Figtree-{weight}.ttf"))
    cmap, hmtx, upm = f.getBestCmap(), f["hmtx"], f["head"].unitsPerEm
    return sum(hmtx[cmap[ord(c)]][0] for c in s) * size / upm


def c_mayday_vs_gather():
    # Big white card. Header: the two real logos with a "vs" badge. Body: the
    # article's worked example as one intercompany event moving through five
    # stages, with a scope bar under each product showing how far it carries
    # that work (Mayday: the close; GATHER.nexus: recharge through to planning).
    # Everything sits between y=40 and y=440 so the 16:10 / 16:9 card crops keep it.
    out = [rect(8, 8, W - 16, H - 16, WHITE, 28),
           # logo header
           rect(40, 48, 280, 84, BG, 20, shadow=False),
           centred_logo("mayday", 180, 90, 200),
           rect(400, 48, 280, 84, BG, 20, shadow=False),
           centred_logo("gather", 540, 90, 212),
           f'<circle cx="360" cy="90" r="30" fill="{TEAL_DEEP}"/>',
           text(360, 99, "vs", 26, 700, WHITE, "middle"),
           text(360, 182, "One intercompany event, end to end", 22, 600, MUTED, "middle")]
    stages = ["Recharge", "Reconcile", "Eliminate", "Report", "Plan"]
    xs = [96 + i * 132 for i in range(5)]
    cy = 230
    out.append(line(xs[0], cy, xs[-1], cy, LINE, 4))
    for i, (x, label) in enumerate(zip(xs, stages)):
        out += [f'<circle cx="{x}" cy="{cy}" r="30" fill="{WHITE}" filter="url(#sh)"/>',
                num(x, cy, i + 1, 22, TEAL, WHITE, 22),
                text(x, cy + 62, label, 22, 700, INK, "middle")]
    # scope bars
    # Pill widths come from the measured label width so the right padding
    # matches the left (dot inset 24, then label, then 28).
    bx = xs[0] - 44
    pad_l, pad_r = 42, 28
    may_w = pad_l + text_width("Month-end close", 22, 700) + pad_r
    out += [rect(bx, 322, round(may_w), 46, MAYDAY_TINT, 23, shadow=False),
            f'<circle cx="{bx + 24}" cy="345" r="7" fill="{MAYDAY}"/>',
            text(bx + 42, 353, "Month-end close", 22, 700, "#B3172F"),
            rect(bx, 380, xs[-1] + 44 - bx, 50, TEAL, 25),
            f'<circle cx="{bx + 24}" cy="405" r="7" fill="{WHITE}"/>',
            text(bx + 42, 413, "Multi-entity layer: intercompany to planning", 24, 700, WHITE)]
    return out


COVERS = [
    # (slug, replaces WP file, alt text, builder)
    ("mayday-vs-gather-multi-entity-layer", None,
     "Mayday organised around the month-end close compared with GATHER.nexus organised around the group, "
     "connecting intercompany control, consolidation, group reporting and planning", c_mayday_vs_gather),
    ("group-ledger-multi-gaap-exit-readiness", None,
     "Xero and QuickBooks Online ledgers feeding one GATHER.nexus group ledger used for UK GAAP to IFRS "
     "reporting and exit-readiness normalisation from reported to adjusted earnings", c_group_ledger_uses),
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
    f = TTFont(src, recalcTimestamp=False)  # keep output byte-stable across rebuilds
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


def build(slug, alt, body, out=OUT):
    inner = "".join(body)
    used = {}
    for m in re.finditer(r'font-weight="(\d+)"[^>]*>([^<]*)</text>', inner):
        used.setdefault(m.group(1), set()).update(m.group(2))
    faces = "".join(font_face(w, "".join(sorted(c)) + " ") for w, c in sorted(used.items()))
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W*2}" '
           f'height="{H*2}" fill="none" role="img" aria-label="{esc(alt)}">'
           f"<style>{faces}text{{font-family:'FT','Figtree',Arial,sans-serif}}</style>"
           f'{DEFS}{background()}{inner}</svg>\n')
    with open(os.path.join(out, slug + ".svg"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write(svg)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for slug, _, alt, fn in COVERS:
        build(slug, alt, fn())
        print("wrote", slug + ".svg")
