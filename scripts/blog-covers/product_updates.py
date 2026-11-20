"""Build the GATHER.nexus Product Updates featured images.

Same visual system as the Expert Insight blog covers (build.py): 720x480 grid
exported at 2x, Figtree, brand teal palette, faded dot grid, white cards and
teal panels with one shared soft shadow. Each cover draws its own announcement.

    python scripts/blog-covers/product_updates.py
    python scripts/blog-covers/render.py --dir assets/images/product-updates

Outputs: assets/images/product-updates/<post-slug>.svg (+ .webp after render).
"""
import os

from build import (BG, INK, LINE, LOGO, MUTED, ON_TEAL, ROOT, RULE, SLATE, TEAL, TEAL_DEEP,
                   TINT, W, H, WHITE, arrow_right, build, building, check, control_glyph, curve,
                   gather_mark, image, line, rect, text)

OUT = os.path.join(ROOT, "assets", "images", "product-updates")


def flow_down(x, y1, y2, color=LINE):
    """Vertical connector (y1 above, y2 below) with a data dot and a down chevron."""
    return (line(x, y1, x, y2 - 6, color, 4)
            + f'<circle cx="{x}" cy="{(y1 + y2) / 2 - 4}" r="6" fill="{TEAL}" stroke="{BG}" stroke-width="3"/>'
            + f'<path d="M{x-8} {y2-12}l8 8 8-8" stroke="{TEAL}" stroke-width="3.2" '
              f'stroke-linecap="round" stroke-linejoin="round"/>')


def teal_panel(path, band, dots_id="dotsl"):
    """Slanted primary panel with a deeper band and a faint white dot texture."""
    return [f'<defs><pattern id="{dots_id}" width="18" height="18" patternUnits="userSpaceOnUse">'
            f'<circle cx="9" cy="9" r="1.3" fill="{WHITE}"/></pattern>'
            f'<clipPath id="panel"><path d="{path}"/></clipPath></defs>',
            f'<path d="{path}" fill="{TEAL}"/>',
            f'<path d="{band}" fill="{TEAL_DEEP}" opacity=".35"/>',
            f'<rect width="{W}" height="{H}" fill="url(#{dots_id})" opacity=".10" clip-path="url(#panel)"/>']


def pending(cx, cy, r=13):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" stroke="{SLATE}" stroke-width="3" '
            f'stroke-dasharray="4 4"/>')


def letter(cx, cy, s, r=22):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{TINT}"/>'
            + text(cx, cy + 8, s, 22, 700, TEAL, "middle"))


def tick_box(x, y, s=30):
    return (rect(x, y, s, s, TEAL, 8, shadow=False)
            + f'<path d="M{x+8} {y+s/2+1}l5 5 9-10" stroke="{WHITE}" stroke-width="3" '
              f'stroke-linecap="round" stroke-linejoin="round"/>')


# ---------------------------------------------------------------- covers
def c_multi_entity_layer():
    # The new Intercompany Overview: every entity pair against the three
    # linked controls (one recharge creates its reconciliation and
    # elimination), one missing control flagged, feeding group reporting.
    x, y, w, h = 32, 40, 656, 400
    cols = [(330, "recharge", "Recharge"), (452, "reconcile", "Reconcile"),
            (574, "eliminate", "Eliminate")]
    out = [rect(x, y, w, h, WHITE, 24),
           gather_mark(60, 74, 32),
           text(102, 101, "Intercompany overview", 28, 700, INK),
           rect(516, 70, 144, 42, TINT, 21, shadow=False),
           text(588, 99, "Linked", 22, 700, TEAL, "middle"),
           line(60, 130, 660, 130, RULE, 2),
           text(60, 218, "Entity pairs", 22, 600, MUTED),
           line(cols[0][0], 170, cols[-1][0], 170, LINE, 4)]
    for cx, kind, label in cols:
        out += [f'<circle cx="{cx}" cy="170" r="22" fill="{TEAL}"/>',
                control_glyph(kind, cx, 170, WHITE),
                text(cx, 218, label, 22, 600, MUTED, "middle")]
    rows = [("A", "B", [1, 1, 1]), ("A", "C", [1, 1, 1]), ("B", "C", [1, 1, 0])]
    for i, (a, b, done) in enumerate(rows):
        cy = 260 + i * 56
        out += [letter(84, cy, a), letter(176, cy, b),
                f'<path d="M112 {cy-5}h36l-6-6M148 {cy+5}h-36l6 6" stroke="{TEAL}" stroke-width="2.8" '
                f'stroke-linecap="round" stroke-linejoin="round"/>']
        for (cx, _, _), ok in zip(cols, done):
            if ok:
                out.append(check(cx, cy, 15))
            else:
                out += [rect(cx - 54, cy - 19, 108, 38, BG, 19, shadow=False,
                             extra=f'stroke="{SLATE}" stroke-width="2.5" stroke-dasharray="6 5"'),
                        text(cx, cy + 8, "Missing", 22, 700, MUTED, "middle")]
        if i < 2:
            out.append(line(60, cy + 28, 660, cy + 28, RULE, 2))
    # floating hand-off into Group Financial Reporting, breaking the card edge
    out += [rect(436, 412, 256, 56, TEAL, 28),
            f'<circle cx="466" cy="440" r="18" fill="{WHITE}"/>', control_glyph("report", 466, 440),
            text(494, 448, "Group reporting", 22, 700, WHITE)]
    return out


def c_ageing():
    # Group AR/AP by ageing bucket, then the drill path from the group total
    # to one entity to the overdue invoice behind it.
    out = [rect(32, 40, 400, 400, WHITE, 24),
           text(60, 96, "Group ageing", 28, 700, INK),
           f'<circle cx="290" cy="88" r="8" fill="{TEAL}"/>', text(304, 96, "AR", 22, 700, INK),
           f'<circle cx="352" cy="88" r="8" fill="{LINE}"/>', text(366, 96, "AP", 22, 700, INK),
           line(60, 124, 404, 124, RULE, 2)]
    base = 372
    ar, ap = [190, 122, 82, 142], [156, 104, 66, 52]
    for k, label in enumerate(["Current", "30", "60", "90+"]):
        c = 103 + k * 86
        out += [rect(c - 29, base - ar[k], 26, ar[k], TEAL_DEEP if k == 3 else TEAL, 6, shadow=False),
                rect(c + 3, base - ap[k], 26, ap[k], LINE, 6, shadow=False),
                text(c, base + 40, label, 22, 600, MUTED, "middle")]
    out += [line(60, base, 404, base, RULE, 3),
            rect(310, base - ar[3] - 50, 102, 36, TINT, 18, shadow=False),
            text(361, base - ar[3] - 25, "Overdue", 22, 700, TEAL_DEEP, "middle")]
    # drill path
    dx, dw = 460, 228
    out += [flow_down(574, 152, 192), flow_down(574, 288, 328)]
    for y, label, val in [(56, "Group", "£1.24m"), (192, "Entity B", "£340k")]:
        out += [rect(dx, y, dw, 96, WHITE, 22),
                text(dx + 24, y + 38, label, 22, 600, MUTED),
                text(dx + 24, y + 76, val, 32, 700, INK)]
    out += [rect(dx, 328, dw, 96, TEAL, 22),
            text(dx + 24, 366, "Invoice", 22, 600, ON_TEAL),
            rect(dx + dw - 104, 344, 88, 34, TEAL_DEEP, 17, shadow=False),
            text(dx + dw - 60, 368, "64 days", 20, 700, WHITE, "middle"),
            text(dx + 24, 404, "£12,400", 32, 700, WHITE)]
    return out


def c_manual_fx():
    # Choose the policy rate type, then override system rates with your own:
    # the Manual column is the one the group translates at.
    out = [rect(32, 64, 232, 352, WHITE, 24),
           text(56, 110, "Rate type", 26, 700, INK),
           line(56, 130, 240, 130, RULE, 2)]
    for i, s in enumerate(["Period-end", "Average", "Budget", "Treasury"]):
        cy = 176 + i * 60
        on = i == 0
        if on:
            out.append(rect(44, cy - 24, 208, 48, TINT, 16, shadow=False))
        out += [f'<circle cx="74" cy="{cy}" r="11" fill="{WHITE}" stroke="{TEAL if on else SLATE}" '
                f'stroke-width="3"/>',
                f'<circle cx="74" cy="{cy}" r="5.5" fill="{TEAL}"/>' if on else "",
                text(98, cy + 8, s, 24, 700 if on else 600, INK if on else MUTED)]
    tx, tw = 288, 400
    out += [rect(tx, 64, tw, 352, WHITE, 24),
            text(tx + 24, 110, "Manual FX", 26, 700, INK),
            rect(tx + tw - 132, 86, 108, 36, TINT, 18, shadow=False),
            text(tx + tw - 78, 111, "to GBP", 22, 700, TEAL, "middle"),
            line(tx + 24, 130, tx + tw - 24, 130, RULE, 2),
            rect(548, 142, 124, 258, TINT, 14, shadow=False),
            text(tx + 24, 172, "Pair", 22, 600, MUTED),
            text(520, 172, "System", 22, 600, MUTED, "end"),
            text(650, 172, "Manual", 22, 700, TEAL, "end")]
    rows = [("USD", "0.7912", "0.7900"), ("EUR", "0.8541", "0.8500"),
            ("AUD", "0.5218", "0.5200"), ("INR", "0.0094", "0.0095")]
    for i, (pair, sysr, man) in enumerate(rows):
        cy = 222 + i * 52
        out += [text(tx + 24, cy + 8, pair, 24, 700, INK),
                text(520, cy + 8, sysr, 24, 600, SLATE, "end")]
        if i == 0:  # the rate being edited
            out += [rect(552, cy - 21, 114, 42, WHITE, 10, shadow=False,
                         extra=f'stroke="{TEAL}" stroke-width="2.5"'),
                    line(654, cy - 11, 654, cy + 11, TEAL, 2.5)]
        out.append(text(650 if i else 644, cy + 8, man, 24, 700, INK, "end"))
        if i < 3:
            out.append(line(tx + 24, cy + 26, 540, cy + 26, RULE, 2))
    # selected rate type feeds the table, chip on the seam between the cards
    out += [f'<circle cx="276" cy="176" r="20" fill="{TEAL}" filter="url(#sh)"/>',
            arrow_right(276, 176, WHITE, .7)]
    return out


def c_complex_consolidations():
    # Left: a multi-level group (80% and 60% holdings, a disposed sub).
    # Right: the group-level accounting GATHER now automates, with audit trail.
    out = teal_panel("M452 0H720V480H412z", "M650 0H720V480H580z")

    def node(x, y, w, name, ghost=False):
        if ghost:
            return (rect(x, y, w, 68, BG, 34, shadow=False,
                         extra=f'stroke="{SLATE}" stroke-width="2.5" stroke-dasharray="7 6"')
                    + building(x + 36, y + 34, 0.8, SLATE)
                    + text(x + 68, y + 43, name, 24, 700, MUTED))
        return (rect(x, y, w, 68, WHITE, 34)
                + f'<circle cx="{x+36}" cy="{y+34}" r="22" fill="{TINT}"/>' + building(x + 36, y + 34, 0.8)
                + text(x + 68, y + 43, name, 24, 700, INK))

    def pct(cx, cy, s, ghost=False):
        if ghost:
            return (rect(cx - 36, cy - 17, 72, 34, BG, 17, shadow=False,
                         extra=f'stroke="{SLATE}" stroke-width="2" stroke-dasharray="5 4"')
                    + text(cx, cy + 7, s, 20, 700, MUTED, "middle"))
        return rect(cx - 36, cy - 17, 72, 34, TEAL, 17, shadow=False) + text(cx, cy + 7, s, 20, 700, WHITE, "middle")

    out += [f'<path d="M212 116V154H108V196M212 154H300V196" stroke="{LINE}" stroke-width="4" '
            f'stroke-linecap="round" stroke-linejoin="round"/>',
            line(300, 264, 300, 340),
            line(108, 264, 108, 340, SLATE, 3, "3 8"),
            node(112, 48, 200, "Holdco"),
            node(32, 196, 156, "Sub A"), node(222, 196, 156, "Sub B"),
            node(222, 340, 156, "Sub C"), node(32, 340, 156, "Sub D", ghost=True),
            pct(108, 174, "100%"), pct(300, 174, "80%"), pct(300, 302, "60%"),
            pct(108, 302, "Sold", ghost=True)]
    out.append(text(462, 92, "Group adjustments", 24, 700, WHITE))
    rows = [("Goodwill", "£1.2m"), ("NCI", "£0.4m"), ("Fair value", "+£90k"), ("Disposal", "−£0.3m")]
    for i, (label, val) in enumerate(rows):
        y = 120 + i * 64
        out += [rect(452, y, 244, 52, TEAL_DEEP, 16, shadow=False),
                text(474, y + 34, label, 24, 600, WHITE),
                text(676, y + 34, val, 24, 700, WHITE, "end")]
    out += [rect(452, 384, 244, 60, WHITE, 30), check(484, 414, 16),
            text(512, 423, "Audit trail", 26, 700, INK)]
    return out


def c_platform_2():
    # The 2.0 app window: all three modules in one place and the guided
    # onboarding checklist (AI mapping, auto-matching, templates).
    x, y, w, h = 96, 40, 588, 400
    out = [rect(x, y, w, h, WHITE, 24),
           f'<path d="M{x} {y+62}V{y+24}a24 24 0 0 1 24-24h{w-48}a24 24 0 0 1 24 24v38z" fill="{TINT}"/>',
           line(x, y + 62, x + w, y + 62, RULE, 2)]
    for k in range(3):
        out.append(f'<circle cx="{x + 28 + k * 18}" cy="{y + 31}" r="5.5" fill="{LINE}"/>')
    out += [gather_mark(x + 94, y + 17, 30), text(x + 136, y + 40, "Getting started", 24, 700, INK),
            line(326, 120, 326, 420, RULE, 2)]
    for i, (kind, label) in enumerate([("recharge", "Intercompany"), ("report", "Reporting"),
                                       ("plan", "Planning")]):
        cy = 146 + i * 58
        if i == 0:
            out.append(rect(110, cy - 24, 206, 48, TINT, 14, shadow=False))
        out += [f'<circle cx="138" cy="{cy}" r="16" fill="{TEAL if i == 0 else TINT}"/>',
                control_glyph(kind, 138, cy, WHITE if i == 0 else TEAL),
                text(164, cy + 8, label, 22, 700 if i == 0 else 600, INK if i == 0 else MUTED)]
    out += [text(350, 140, "Onboarding", 22, 600, MUTED),
            text(660, 140, "80%", 22, 700, TEAL, "end"),
            rect(350, 154, 310, 10, TINT, 5, shadow=False),
            rect(350, 154, 248, 10, TEAL, 5, shadow=False)]
    steps = ["Connect entities", "AI account mapping", "Auto-match IC", "Pick a template", "Run first close"]
    for i, s in enumerate(steps):
        cy = 204 + i * 50
        out.append(check(366, cy, 13) if i < 4 else pending(366, cy))
        out.append(text(392, cy + 8, s, 22, 600, INK if i < 4 else MUTED))
    # floating release badge breaking the window edge
    out += [rect(28, 352, 216, 72, TEAL, 36),
            f'<circle cx="64" cy="388" r="26" fill="{WHITE}"/>', gather_mark(48, 373.2, 32),
            text(102, 401, "2.0", 36, 700, WHITE),
            text(174, 399, "Live", 22, 700, ON_TEAL)]
    return out


def c_158_currencies():
    # Left: the currency wall (11 shown, 147 more). Right: the post's example:
    # Vietnamese and Mexican subsidiaries into a EUR group, re-translated to USD.
    out = [rect(32, 40, 316, 400, WHITE, 24),
           text(56, 112, "158", 56, 700, TEAL),
           text(166, 110, "currencies", 26, 600, MUTED),
           line(56, 140, 324, 140, RULE, 2)]
    codes = ["GBP", "USD", "EUR", "INR", "SGD", "MXN", "VND", "ZAR", "KES", "AED", "HKD", "+147"]
    for i, c in enumerate(codes):
        r, k = divmod(i, 3)
        cx, cy = 56 + k * 94, 166 + r * 64
        last = i == len(codes) - 1
        out += [rect(cx, cy, 84, 44, TEAL if last else TINT, 22, shadow=False),
                text(cx + 42, cy + 30, c, 22, 700, WHITE if last else TEAL, "middle")]
    gx, gw = 412, 236
    gc = gx + gw / 2
    for px in (452, 610):
        out.append(f'<path d="M{px} 124C{px} 164 {gc} 156 {gc} 196" stroke="{LINE}" stroke-width="4" '
                   f'stroke-linecap="round"/>')
        out.append(f'<circle cx="{(px + gc) / 2}" cy="160" r="6" fill="{TEAL}" stroke="{BG}" stroke-width="3"/>')
    for px, code in ((380, "VND"), (538, "MXN")):
        out += [rect(px, 56, 144, 68, WHITE, 34),
                f'<circle cx="{px+36}" cy="90" r="22" fill="{TINT}"/>', building(px + 36, 90, 0.8),
                text(px + 70, 99, code, 26, 700, INK)]
    out += [rect(gx, 196, gw, 92, WHITE, 22),
            text(gx + 24, 232, "Group", 22, 600, MUTED),
            text(gx + 24, 272, "€4.8m", 32, 700, INK),
            rect(gx + gw - 84, 214, 64, 36, TINT, 18, shadow=False),
            text(gx + gw - 52, 239, "EUR", 20, 700, TEAL, "middle"),
            line(gc, 288, gc, 340, LINE, 4),
            f'<circle cx="{gc}" cy="314" r="20" fill="{WHITE}" stroke="{LINE}" stroke-width="2"/>',
            text(gc, 322, "FX", 20, 700, TEAL, "middle"),
            rect(gx, 340, gw, 92, TEAL, 22),
            text(gx + 24, 376, "Re-translated", 22, 600, ON_TEAL),
            text(gx + 24, 416, "$5.2m", 32, 700, WHITE),
            rect(gx + gw - 84, 384, 64, 36, TEAL_DEEP, 18, shadow=False),
            text(gx + gw - 52, 409, "USD", 20, 700, WHITE, "middle")]
    return out


def c_stripe():
    # Subscribe in-app: pick one module or both, pay by card or bank.
    out = [rect(40, 64, 240, 150, TEAL, 20),
           f'<path d="M180 64h80a20 20 0 0 1 20 20v110a20 20 0 0 1-20 20H120z" fill="{TEAL_DEEP}" opacity=".35"/>',
           rect(64, 96, 44, 32, LINE, 7, shadow=False),
           line(64, 112, 108, 112, TEAL, 2), line(86, 96, 86, 128, TEAL, 2)]
    for g in range(3):
        for d in range(4):
            out.append(f'<circle cx="{70 + g * 50 + d * 10}" cy="178" r="3.5" fill="{ON_TEAL}"/>')
    out += [text(218, 186, "4242", 22, 700, WHITE),
            rect(40, 246, 240, 60, WHITE, 30),
            rect(46, 252, 114, 48, TEAL, 24, shadow=False),
            check(76, 276, 11, WHITE, TEAL),
            text(96, 284, "Card", 22, 700, WHITE),
            text(220, 284, "Bank", 22, 600, MUTED, "middle"),
            f'<g stroke="{MUTED}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round">'
            f'<rect x="44" y="364" width="22" height="18" rx="4"/><path d="M49 364v-6a6 6 0 0 1 12 0v6"/></g>',
            text(78, 381, "Secure via Stripe", 22, 600, MUTED)]
    x, y, w = 312, 40, 376
    out += [rect(x, y, w, 400, WHITE, 24),
            f'<path d="M{x} {y+76}V{y+24}a24 24 0 0 1 24-24h{w-48}a24 24 0 0 1 24 24v52z" fill="{TEAL}"/>',
            f'<circle cx="{x+48}" cy="{y+38}" r="22" fill="{WHITE}"/>', gather_mark(x + 34, y + 25, 28),
            text(x + 84, y + 47, "GATHER Platform", 26, 700, WHITE)]
    for i, s in enumerate(["Intercompany Control", "Reporting & Planning"]):
        cy = 172 + i * 60
        out += [rect(x + 16, cy - 26, w - 32, 52, TINT, 14, shadow=False),
                tick_box(x + 30, cy - 15),
                text(x + 76, cy + 8, s, 24, 600, INK)]
    out += [line(x + 24, 280, x + w - 24, 280, RULE, 2),
            text(x + 24, 324, "Modules", 22, 600, MUTED),
            text(x + w - 24, 324, "Both", 24, 700, INK, "end"),
            rect(x + 24, 360, w - 48, 60, TEAL, 30, shadow=False),
            text(x + w / 2, 399, "Subscribe", 26, 700, WHITE, "middle")]
    return out


def c_quickbooks_integration():
    # QuickBooks Online connects to GATHER; one interface then runs every
    # client group (reporting, intercompany and planning per group).
    qx, gx, ny = 180, 540, 132
    out = [line(qx + 56, ny, gx - 56, ny, LINE, 6)]
    for px in (262, 458):
        out.append(f'<circle cx="{px}" cy="{ny}" r="7" fill="{TEAL}" stroke="{BG}" stroke-width="3"/>')
    out += [f'<circle cx="{qx}" cy="{ny}" r="64" fill="{BG}" stroke="{LINE}" stroke-width="2"/>',
            f'<circle cx="{qx}" cy="{ny}" r="50" fill="{WHITE}" filter="url(#sh)"/>',
            image(LOGO["quickbooks"], qx - 32, ny - 32, 64, 64),
            f'<circle cx="{gx}" cy="{ny}" r="64" fill="{BG}" stroke="{LINE}" stroke-width="2"/>',
            f'<circle cx="{gx}" cy="{ny}" r="50" fill="{WHITE}" filter="url(#sh)"/>',
            gather_mark(gx - 30, ny - 27.75, 60),
            rect(270, ny - 26, 180, 52, TEAL, 26),
            check(298, ny, 13, WHITE, TEAL),
            text(320, ny + 8, "Connected", 22, 700, WHITE)]
    cards = [32, 260, 488]
    out.append(f'<path d="M{gx} {ny + 64}V258M132 300V258H588V300" stroke="{LINE}" stroke-width="4" '
               f'stroke-linecap="round" stroke-linejoin="round"/>')
    out.append(f'<path d="M360 258V300" stroke="{LINE}" stroke-width="4" stroke-linecap="round"/>')
    for i, cx in enumerate(cards):
        out += [rect(cx, 300, 200, 136, WHITE, 22),
                image(LOGO["quickbooks"], cx + 18, 316, 40, 40),
                text(cx + 70, 345, f"Group {'ABC'[i]}", 26, 700, INK),
                line(cx + 20, 372, cx + 180, 372, RULE, 2)]
        for j, kind in enumerate(("report", "recharge", "plan")):
            out += [f'<circle cx="{cx + 44 + j * 44}" cy="404" r="17" fill="{TINT}"/>',
                    control_glyph(kind, cx + 44 + j * 44, 404)]
        out.append(check(cx + 174, 404, 12))
    return out


def c_introducing():
    # Launch: GATHER.nexus on Xero and QuickBooks, delivered as three modules.
    out = [f'<defs><pattern id="dotsb" width="16" height="16" patternUnits="userSpaceOnUse">'
           f'<circle cx="8" cy="8" r="1.2" fill="{WHITE}"/></pattern>'
           f'<clipPath id="band"><rect x="32" y="40" width="656" height="128" rx="28"/></clipPath></defs>',
           rect(32, 40, 656, 128, TEAL, 28),
           f'<rect x="32" y="40" width="656" height="128" fill="url(#dotsb)" opacity=".12" clip-path="url(#band)"/>',
           rect(60, 72, 236, 64, WHITE, 32, shadow=False),
           image(LOGO["gather"], 80, 77, 196, 55),
           text(420, 112, "Works with", 22, 600, ON_TEAL)]
    for cx, logo in ((572, "xero"), (636, "quickbooks")):
        out += [f'<circle cx="{cx}" cy="104" r="26" fill="{WHITE}"/>',
                image(LOGO[logo], cx - 20, 84, 40, 40)]
    mods = [("report", ("Group", "Reporting")), ("recharge", ("Intercompany", "Control")),
            ("plan", ("Group", "Planning"))]
    for i, (kind, (l1, l2)) in enumerate(mods):
        x = 32 + i * 228
        cx = x + 100
        out += [flow_down(cx, 168, 216),
                rect(x, 216, 200, 216, WHITE, 22),
                f'<circle cx="{x + 46}" cy="262" r="24" fill="{TINT}"/>',
                control_glyph(kind, x + 46, 262),
                text(x + 24, 326, l1, 24, 700, INK),
                text(x + 24, 356, l2, 24, 700, INK),
                line(x + 20, 382, x + 180, 382, RULE, 2)]
        if kind == "report":
            for j, hgt in enumerate([10, 16, 13, 20, 26]):
                out.append(rect(x + 24 + j * 18, 418 - hgt, 12, hgt, TEAL if j == 4 else LINE, 3, shadow=False))
        elif kind == "recharge":
            out += [letter(x + 40, 406, "A", 16), letter(x + 120, 406, "B", 16),
                    line(x + 60, 406, x + 92, 406, TEAL, 3), arrow_right(x + 94, 406, TEAL, .6)]
        else:
            out += [rect(x + 24, 401, 152, 10, TINT, 5, shadow=False),
                    rect(x + 24, 401, 124, 10, TEAL, 5, shadow=False)]
    return out


COVERS = [
    # (post slug, alt text, builder) — newest first, as listed on /product-updates/
    ("intercompany-control-group-financial-reporting-updates",
     "Intercompany overview showing recharge, reconciliation and elimination linked for each entity pair, "
     "with a missing control flagged and results flowing into group reporting", c_multi_entity_layer),
    ("group-ap-ar-ageing-analysis",
     "Group AR and AP balances by ageing bucket with drill-down from the group total to an entity and an "
     "overdue invoice", c_ageing),
    ("manual-fx-is-now-live-in-gather-nexus",
     "Manual FX table where a period-end rate type is selected and system exchange rates are overridden "
     "with custom rates", c_manual_fx),
    ("complex-financial-consolidation",
     "Multi-level group structure with partial holdings and a disposed subsidiary, alongside goodwill, NCI, "
     "fair value and disposal adjustments with an audit trail", c_complex_consolidations),
    ("gather-platform-2-0",
     "GATHER Platform 2.0 window with Intercompany, Reporting and Planning modules and a guided onboarding "
     "checklist", c_platform_2),
    ("gather-nexus-goes-live-with-158-currencies",
     "158 supported currencies, with Vietnamese and Mexican subsidiaries consolidated into a EUR group and "
     "re-translated to USD", c_158_currencies),
    ("gather-nexus-integrates-with-payments-platform-stripe",
     "Subscribing to the GATHER Platform by card or bank through Stripe, with Intercompany Control and "
     "Reporting & Planning modules selected", c_stripe),
    ("gather-nexus-announces-integration-with-intuit-quickbooks",
     "QuickBooks Online connected to GATHER.nexus, running reporting, intercompany and planning for several "
     "client groups", c_quickbooks_integration),
    ("introducing-gather-nexus",
     "GATHER.nexus works with Xero and QuickBooks across Group Reporting, Intercompany Control and Group "
     "Planning", c_introducing),
]


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for slug, alt, fn in COVERS:
        build(slug, alt, fn(), OUT)
        print("wrote", slug + ".svg")
