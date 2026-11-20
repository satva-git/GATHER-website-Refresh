"""Point every page at the crisp WEBP 1x/2x assets built by build-site-images.py.

Idempotent: safe to re-run.  The Intuit QuickBooks sprite crops are deliberately left alone.
"""
import json, pathlib, re, shutil

ROOT = pathlib.Path(__file__).resolve().parents[1]
IMG = ROOT / "assets" / "images"
MAN = json.load(open(r"E:\Howard\Website-Images\manifest.json"))
SHOTS = {m[1] for m in MAN if m[0] not in ("_global", "_global/nav-icons", "knowledge-centre", "homepage") or m[1] in ()}
# screenshots = anything delivered with a lossy 'displayed' note
SHOTS = {m[1] for m in MAN if str(m[5]).startswith("displayed")}
FEATURED = {
    "XU Biweekly": "featured-biweekly-logo",
    "AccountingWeb": "featured-accountingweb-logo",
    "Digital Disruptors": "featured-digital-disruptors-logo",
    "Accounting & Tech Happenings": "featured-accounting-tech-happenings-logo",
    "Accounting &amp; Tech Happenings": "featured-accounting-tech-happenings-logo",
    "Institute of Financial Accountants": "featured-ifa-logo",
}
PAGES = [p for p in ROOT.rglob("*.html")
         if not any(s in p.parts for s in ("node_modules", "_kc-preview", "exports", "review", "page-comment", "shared"))]
IMG_TAG = re.compile(r"<img\b[^>]*>", re.I | re.S)


def rel(page, name):
    depth = len(page.relative_to(ROOT).parts) - 1
    return "../" * depth + "assets/images/" + name


def set_src(tag, src, src2, extra=""):
    tag = re.sub(r'\ssrc="[^"]*"', f' src="{src}"', tag, count=1)
    tag = re.sub(r'\ssrcset="[^"]*"', "", tag)
    return re.sub(r"<img\b", f'<img srcset="{src2} 2x"{extra}', tag, count=1) if False else tag.replace(
        f' src="{src}"', f' src="{src}" srcset="{src2} 2x"', 1)


def fix_tag(page, tag):
    m = re.search(r'\ssrc="([^"]*)"', tag)
    if not m:
        return tag
    src = m.group(1)
    q = ""
    base = src
    if "?" in src:
        base, q = src.split("?", 1)
        q = "?" + q
    name = base.rsplit("/", 1)[-1]
    # header / footer logo (png file or the old inline base64 header mark)
    if name == "gather-logo.png":
        return set_src(tag, rel(page, "gather-logo.webp"), rel(page, "gather-logo@2x.webp"))
    if src.startswith("data:image/png") and re.search(r'alt="GATHER"', tag):
        return set_src(tag, rel(page, "gather-logo.webp"), rel(page, "gather-logo@2x.webp"))
    if src.startswith("data:"):
        alt = re.search(r'alt="([^"]*)"', tag)
        stem = FEATURED.get(alt.group(1)) if alt else None
        if stem:
            return set_src(tag, rel(page, stem + ".webp"), rel(page, stem + "@2x.webp"))
        return tag
    if name.endswith(".png") and name[:-4] in SHOTS:
        s = name[:-4]
        return set_src(tag, base[: -len(name)] + s + ".webp" + q, base[: -len(name)] + s + "@2x.webp" + q)
    return tag


def main():
    changed = 0
    for page in PAGES:
        t = page.read_text(encoding="utf-8")
        n = IMG_TAG.sub(lambda m: fix_tag(page, m.group(0)), t)
        n = n.replace(
            '<li class="hero-partner-xero sprite-img" role="img" aria-label="Xero Connected App"></li>',
            '<li class="hero-partner-xero"><img src="assets/images/hero-xero-connected.webp" '
            'srcset="assets/images/hero-xero-connected@2x.webp 2x" width="115" height="50" '
            'alt="Xero Connected App" decoding="async"/></li>')
        n = re.sub(r"(page-extensions\.css\?v=)[0-9a-z]+", r"\g<1>20261119n", n)
        if n != t:
            page.write_text(n, encoding="utf-8")
            changed += 1
    shutil.copyfile(ROOT / "index.html", ROOT / "HomePage.html")
    print("pages changed:", changed)


if __name__ == "__main__":
    main()
