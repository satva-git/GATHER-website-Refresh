"""Final image polish: crisp WEBP 1x/2x assets for the whole site.

    python scripts/build-site-images.py

Writes site-ready files next to the originals (assets/images/<name>.webp and <name>@2x.webp) and a
copy of every revised asset into the delivery tree (E:/Howard/Website-Images/<page>/{1x,2x}/).
The Intuit QuickBooks logo crops are deliberately NOT touched.
"""
import os, base64, io, json, math, pathlib, re, shutil, sys
from PIL import Image, ImageFilter
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[1]
IMG = ROOT / "assets" / "images"
ICONS = IMG / "nav-icons"
DELIVER = pathlib.Path(r"E:\Howard\Website-Images")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
MANIFEST = []  # (page_folder, name, 1x size, 2x size, used_on, note)


def webp(im, dst, lossless=True):
    dst.parent.mkdir(parents=True, exist_ok=True)
    im = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")
    if lossless:
        im.save(dst, "WEBP", lossless=True, quality=100, method=6)
    else:
        im.save(dst, "WEBP", quality=92, method=6)


def deliver(folder, name, im1, im2, used_on, note="", lossless=True):
    """Save <name>.webp (1x) + <name>@2x.webp (2x) into the site and the delivery tree."""
    for suffix, im in (("", im1), ("@2x", im2)):
        webp(im, IMG / f"{name}{suffix}.webp", lossless)
        tier = "2x" if suffix else "1x"
        webp(im, DELIVER / folder / tier / f"{name}.webp", lossless)
    MANIFEST.append((folder, name, im1.size, im2.size, used_on, note))


# ---------- SVG rendering (headless Chrome) ----------
class Renderer:
    def __init__(self, pw):
        self.b = pw.chromium.launch(executable_path=CHROME)

    def svg(self, svg_text, w, h, scale):
        pg = self.b.new_page(viewport={"width": w, "height": h}, device_scale_factor=scale)
        pg.set_content(f"<html><body style='margin:0;background:transparent'>"
                       f"<div style='width:{w}px;height:{h}px'>{svg_text}</div></body></html>")
        pg.wait_for_timeout(150)
        png = pg.screenshot(omit_background=True, clip={"x": 0, "y": 0, "width": w, "height": h})
        pg.close()
        return Image.open(io.BytesIO(png)).convert("RGBA")

    def file_svg(self, path, w, h, scale):
        text = pathlib.Path(path).read_text(encoding="utf-8")
        text = re.sub(r"<svg\b", f'<svg width="{w}" height="{h}"', text, count=1) if "width=" not in text.split(">")[0] else text
        return self.svg(text, w, h, scale)


# ---------- hand-built vector marks ----------
XERO_PATH_SVG = (IMG / "xero-logo.svg").read_text(encoding="utf-8")


def hero_xero_svg():
    """Xero logo + 'Connected App' badge, 115x50 box (replaces the 1x sprite crop)."""
    xero = re.sub(r'\s(width|height)="[^"]*"', "", XERO_PATH_SVG, count=2)
    xero = xero.replace("<svg ", '<svg x="1" y="1" width="46" height="47" ', 1)
    badge = (
        '<g transform="translate(62 3)">'
        '<path d="M0 0H44V37L22 47.5 0 37Z" fill="#000"/>'
        '<path d="M0 29 22 19 44 29V37L22 47.5 0 37Z" fill="#13B5EA"/>'
        '<path d="M0 37 22 26.5 44 37 22 47.5Z" fill="#13B5EA"/>'
        '<text font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="5.3" fill="#fff" letter-spacing=".1">'
        '<tspan x="5" y="9.5">CONNECTED</tspan><tspan x="5" y="16.5">APP</tspan></text></g>'
    )
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="115" height="50" viewBox="0 0 115 50">{xero}{badge}</svg>'


def cog_path(cx, cy, r_out, r_in, teeth=8):
    pts = []
    for i in range(teeth):
        a = 2 * math.pi * i / teeth
        step = 2 * math.pi / teeth
        for da, r in ((-0.30, r_in), (-0.16, r_out), (0.16, r_out), (0.30, r_in)):
            ang = a + da * step * 1.6
            pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    return "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in pts) + "Z"


def icon_svg(body):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 31" fill="none" stroke="#111" '
            'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + body + "</svg>")


def nav_icons():
    gear = lambda cx, cy: (f'<path d="{cog_path(cx, cy, 11, 8.6)}"/><circle cx="{cx}" cy="{cy}" r="3.6"/>')
    return {
        "layers": icon_svg('<path d="M15.5 3 28 9.5 15.5 16 3 9.5Z"/><path d="M3 15l12.5 6.5L28 15"/><path d="M3 20.5 15.5 27 28 20.5"/>'),
        "chip": icon_svg('<rect x="7" y="7" width="17" height="17" rx="2.5"/><path d="M12 7V3M19 7V3M12 28v-4M19 28v-4M7 12H3M7 19H3M28 12h-4M28 19h-4"/>'
                         '<path d="M12.5 21l3-9 3 9M13.6 18h3.8"/>'),
        "doc-help": icon_svg('<path d="M20 28H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h15a3 3 0 0 1 3 3v12"/><path d="M10 10h11M10 15h8M10 20h5"/>'
                             '<path d="M19.5 22.5c0-1.6 1.2-2.5 2.6-2.5s2.6.9 2.6 2.3c0 2-2.6 2-2.6 3.7"/><circle cx="22.1" cy="28.4" r=".5"/>'),
        "gear-star": icon_svg(f'<g transform="translate(-1.5 -2) scale(.95)">{gear(14, 14)}</g>'
                              '<path d="M23.5 19.5v9M19 24h9M20.3 20.8l6.4 6.4M26.7 20.8l-6.4 6.4" stroke-width="1.5"/>'),
        "gear-help": icon_svg(f'<g transform="translate(-1.5 -2) scale(.95)">{gear(14, 14)}</g>'
                              '<path d="M20.8 20.5c0-1.6 1.2-2.4 2.6-2.4s2.6.8 2.6 2.2c0 2-2.6 2-2.6 3.8"/><circle cx="23.4" cy="28.2" r=".5"/>'),
        "video": icon_svg('<rect x="3" y="7" width="18" height="17" rx="4"/><path d="M21 13.5l7-3.5v11l-7-3.5"/>'),
    }


# ---------- raster helpers ----------
def sharpen_up(im, scale):
    big = im.convert("RGBA").resize((im.width * scale, im.height * scale), Image.LANCZOS)
    return big.filter(ImageFilter.UnsharpMask(radius=1.2, percent=70, threshold=2))


def strip_edge_ticks(im):
    """Drop faint 1-2px vertical tick artefacts that the upstream logo files carry on their right edge."""
    import numpy as np
    a = np.array(im.convert("RGBA"))
    al = a[:, :, 3]
    for _ in range(3):
        cols = np.where((al > 0).any(0))[0]
        x = cols[-1]
        if al[:, x].max() < 120 and (al[:, x] > 0).sum() <= 14:
            al[:, x] = 0
            a[:, x, 3] = 0
    return Image.fromarray(a, "RGBA")


def resize(im, w):
    h = round(im.height * w / im.width)
    return im.convert("RGBA" if im.mode in ("RGBA", "P") else "RGB").resize((w, h), Image.LANCZOS)


def main():
    DELIVER.mkdir(parents=True, exist_ok=True)
    dom = json.load(open(pathlib.Path(sys.argv[1]))) if len(sys.argv) > 1 else {}
    with sync_playwright() as pw:
        r = Renderer(pw)

        # 1. GATHER header logo (205x56 raster -> vector source)
        logo_svg = (ROOT / "scripts/blog-covers/logos/gather.svg").read_text(encoding="utf-8")
        for_page = lambda s: s
        l1 = r.svg(re.sub(r"<svg\b", '<svg width="205" height="56"', logo_svg, 1), 205, 56, 1)
        l2 = r.svg(re.sub(r"<svg\b", '<svg width="205" height="56"', logo_svg, 1), 205, 56, 2)
        deliver("_global", "gather-logo", l1, l2, "site header + footer, all pages", "rebuilt from vector")

        # 2. Hero Xero + Connected-App badge
        hs = hero_xero_svg()
        deliver("homepage", "hero-xero-connected", r.svg(hs, 115, 50, 1), r.svg(hs, 115, 50, 2),
                "index.html hero partner row", "vector rebuild of sprite crop")
        # 3. Xero mark for the Integrations mega menu
        xs = re.sub(r'\s(width|height)="[^"]*"', "", XERO_PATH_SVG, count=2).replace("<svg ", '<svg width="50" height="50" ', 1)
        deliver("_global", "xero-mark", r.svg(xs, 50, 50, 1), r.svg(xs, 50, 50, 2), "Integrations dropdown (all pages)", "official vector")

        # 4. Nav icons
        ICONS.mkdir(exist_ok=True)
        for name, svg in nav_icons().items():
            (ICONS / f"{name}.svg").write_text(svg, encoding="utf-8")
            sv = svg.replace("<svg ", '<svg width="31" height="31" ', 1)
            deliver("_global/nav-icons", f"nav-icon-{name}", r.svg(sv, 31, 31, 1), r.svg(sv, 31, 31, 2),
                    "Resources + Knowledge Centre dropdowns (all pages)", "redrawn as vector (site uses SVG)")

        # 5. Knowledge-centre + blog covers
        for svg in ([] if os.environ.get("SKIP_KC") else sorted(IMG.glob("kc-cover-*.svg"))):
            text = svg.read_text(encoding="utf-8")
            c1 = r.file_svg(svg, 640, 400, 1).convert("RGB")
            c2 = r.file_svg(svg, 640, 400, 2).convert("RGB")
            deliver("knowledge-centre", svg.stem, c1, c2, "Knowledge Centre listing / collection pages", "SVG stays the on-site master")
        # tidy: covers are delivered only, the site keeps SVG
        for svg in IMG.glob("kc-cover-*.webp"):
            svg.unlink()
        for svg in IMG.glob("kc-cover-*@2x.webp"):
            svg.unlink()
        r.b.close()

    # 6. Featured-in logos (source-limited: upstream files are 80px tall)
    for stem, src in (("featured-biweekly", IMG / "featured-biweekly.webp"),
                      ("featured-accountingweb", IMG / "featured-accountingweb.webp"),
                      ("featured-digital-disruptors", IMG / "featured-digital-disruptors.webp"),
                      ("featured-accounting-tech-happenings", IMG / "featured-accounting-tech-happenings.webp")):
        im = strip_edge_ticks(Image.open(src).convert("RGBA"))
        one = resize(im, round(im.width * 64 / 80)) if False else im
        deliver("homepage", stem + "-logo", im, sharpen_up(im, 2), "index.html 'We've been featured in' strip",
                "SOURCE-LIMITED: upstream file is 80px tall; 2x is lanczos+sharpen. Replace with vector originals if supplied")
    ifa = Image.open(IMG / "featured-ifa.png").convert("RGBA")
    deliver("homepage", "featured-ifa-logo", resize(ifa, 214), resize(ifa, 428), "index.html featured strip",
            "downscaled from 1024px source (true 2x)")

    # 7. Product screenshots / diagrams: PNG -> WEBP 1x (display width) + 2x (native, capped at 2x display)
    disp = {}
    for page, items in dom.items():
        for i in items:
            if i.get("k") == "img" and "assets/images/" in i["src"]:
                f = i["src"].split("assets/images/")[1].split("?")[0]
                disp[f] = max(disp.get(f, 0), i["rw"])
    page_of = {}
    for page, items in dom.items():
        for i in items:
            if i.get("k") == "img" and "assets/images/" in i["src"]:
                page_of.setdefault(i["src"].split("assets/images/")[1].split("?")[0], page)
    for f, w1 in sorted(disp.items()):
        if not f.lower().endswith(".png") or f.startswith(("gather-logo",)):
            continue
        im = Image.open(IMG / f)
        w2 = min(im.width, w1 * 2)
        stem = pathlib.Path(f).stem
        folder = pathlib.Path(page_of[f]).with_suffix("")
        folder = str(folder.parent / folder.name if folder.name != "index" else folder.parent) or "homepage"
        folder = "homepage" if folder in (".", "") else folder.replace("\\", "/")
        deliver(folder, stem, resize(im, w1), resize(im, w2), page_of[f],
                f"displayed {w1}px; 2x = {w2}px", lossless=False)

    json.dump([(a, b, list(c), list(d), e, f) for a, b, c, d, e, f in MANIFEST],
              open(DELIVER / "manifest.json", "w"), indent=1)
    print(len(MANIFEST), "assets exported to", DELIVER)


if __name__ == "__main__":
    main()
