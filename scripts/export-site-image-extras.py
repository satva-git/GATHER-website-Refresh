"""Second pass after build-site-images.py: animated GIFs -> animated WEBP (1x/2x), blog covers 1x/2x,
then write CHECKLIST.md into the delivery tree.  Run after build-site-images.py."""
import json, pathlib, re
from PIL import Image, ImageSequence

ROOT = pathlib.Path(__file__).resolve().parents[1]
IMG = ROOT / "assets" / "images"
OUT = pathlib.Path(r"E:\Howard\Website-Images")
MAN = [list(m) for m in json.load(open(OUT / "manifest.json"))]
SITE = "https://gather.nexus"

GIFS = {  # file -> (delivery folder, page it appears on, displayed width)
    "budget-vs-actual-report.gif": ("modules/group-planning", "modules/group-planning.html", 551),
    "consolidation-working-papers.gif": ("modules/group-reporting", "modules/group-reporting.html + group-financial-reporting/complex-consolidations/", 551),
    "complex-consolidations-step-acquisition.gif": ("homepage", "index.html + group-financial-reporting/complex-consolidations/", 542),
    "working-papers-drill-down.gif": ("group-financial-reporting/complex-consolidations", "group-financial-reporting/complex-consolidations/", 520),
}


def anim(src, w):
    im = Image.open(src)
    frames, durs = [], []
    for fr in ImageSequence.Iterator(im):
        f = fr.convert("RGBA")
        frames.append(f.resize((w, round(f.height * w / f.width)), Image.LANCZOS) if w != f.width else f.copy())
        durs.append(fr.info.get("duration", 100))
    return frames, durs


for name, (folder, page, w1) in GIFS.items():
    src = IMG / name
    if not src.exists():
        continue
    native = Image.open(src).width
    sizes = {}
    for tier, w in (("1x", w1), ("2x", min(native, w1 * 2))):
        frames, durs = anim(src, w)
        dst = OUT / folder / tier / (src.stem + ".webp")
        dst.parent.mkdir(parents=True, exist_ok=True)
        frames[0].save(dst, "WEBP", save_all=True, append_images=frames[1:], duration=durs, loop=0, quality=88, method=4)
        sizes[tier] = frames[0].size
    MAN.append([folder, src.stem, list(sizes["1x"]), list(sizes["2x"]), page,
                "animated WEBP export (site still uses GIF: the replay script targets .gif)"])

BLOG = IMG / "blog"
for f in sorted(BLOG.glob("*.webp")):
    im = Image.open(f).convert("RGB")
    d1 = OUT / "blog" / "1x" / f.name
    d2 = OUT / "blog" / "2x" / f.name
    d1.parent.mkdir(parents=True, exist_ok=True)
    d2.parent.mkdir(parents=True, exist_ok=True)
    im.resize((720, 480), Image.LANCZOS).save(d1, "WEBP", lossless=True, quality=100, method=6)
    im.save(d2, "WEBP", lossless=True, quality=100, method=6)
    MAN.append(["blog", f.stem, [720, 480], [1440, 960], "WordPress blog post cover", "re-exported 1x/2x"])

json.dump(MAN, open(OUT / "manifest.json", "w"), indent=1)


def url_for(page):
    page = page.split(" + ")[0].strip()
    if page.endswith(".html"):
        p = page[:-5]
        return SITE + ("/" if p == "index" else "/" + p + "/")
    return SITE + "/" + page.strip("/") + "/" if page and not page.startswith(("site", "WordPress", "Knowledge", "Resources")) else ""


lines = ["# Image delivery checklist", "",
         "Every revised image: WEBP, `1x/` and `2x/` subfolders under its page folder (root: `E:\\Howard\\Website-Images\\`).",
         "`1x` = CSS display size, `2x` = double (or the native source width where the source is smaller).", "",
         "| Done | Page folder | Image | 1x px | 2x px | Used on | Note |", "|---|---|---|---|---|---|---|"]
for folder, name, s1, s2, used, note in sorted(MAN, key=lambda m: (m[0], m[1])):
    lines.append(f"| [x] | `{folder}/` | `{name}.webp` | {s1[0]}x{s1[1]} | {s2[0]}x{s2[1]} | {used} | {note} |")
(OUT / "CHECKLIST.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(len(MAN), "entries")
