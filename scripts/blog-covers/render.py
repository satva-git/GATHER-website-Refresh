"""Render assets/images/blog/*.svg to 1440x960 WebP with headless Chrome.

    python scripts/blog-covers/render.py [--chrome PATH]
"""
import argparse
import os
import pathlib
import subprocess
import tempfile

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "assets" / "images" / "blog"
CHROME = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "/usr/bin/google-chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--chrome", default=next((c for c in CHROME if os.path.exists(c)), None))
    args = ap.parse_args()
    if not args.chrome:
        raise SystemExit("Chrome not found; pass --chrome")
    with tempfile.TemporaryDirectory() as tmp:
        for svg in sorted(OUT.glob("*.svg")):
            page = pathlib.Path(tmp) / "p.html"
            page.write_text(
                "<!doctype html><style>html,body{margin:0;background:#E8F1EE}"
                "img{display:block;width:1440px;height:960px}</style>"
                f'<img src="{svg.as_uri()}">', encoding="utf-8")
            png = pathlib.Path(tmp) / "p.png"
            subprocess.run([args.chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                            "--allow-file-access-from-files", "--force-device-scale-factor=1",
                            "--virtual-time-budget=2000", f"--screenshot={png}",
                            "--window-size=1440,960", page.as_uri()],
                           check=True, capture_output=True)
            im = Image.open(png).convert("RGB").crop((0, 0, 1440, 960))
            dst = svg.with_suffix(".webp")
            im.save(dst, "WEBP", lossless=True, quality=100, method=6)
            print(f"{dst.name}: {im.size[0]}x{im.size[1]}, {dst.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
