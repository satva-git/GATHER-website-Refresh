"""Upload the Product Updates covers to WordPress and set them as featured images.

Uses the WordPress REST API with an Application Password (Users > Profile >
Application Passwords) for a user who can upload media and edit the posts.
Point it at the STAGING site first; only the posts' featured image is changed.

    set WP_URL=https://staging.example.com
    set WP_USER=your-username
    set WP_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
    python scripts/blog-covers/upload_wp.py --dry-run   # find posts, change nothing
    python scripts/blog-covers/upload_wp.py             # upload + set featured images

Each post is found by slug across every REST-enabled post type, so it works
whether Product Updates are regular posts or a custom post type.
"""
import argparse
import os
import sys

import requests

from product_updates import COVERS, OUT


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="resolve posts only; upload nothing")
    args = ap.parse_args()
    try:
        base = os.environ["WP_URL"].rstrip("/") + "/wp-json/wp/v2"
        auth = (os.environ["WP_USER"], os.environ["WP_APP_PASSWORD"])
    except KeyError as e:
        sys.exit(f"missing environment variable {e}")
    s = requests.Session()
    s.auth = auth

    def call(method, url, **kw):
        r = s.request(method, url, timeout=60, **kw)
        if not r.ok:
            sys.exit(f"{method} {url} -> {r.status_code}: {r.text[:300]}")
        return r.json()

    types = call("GET", f"{base}/types", params={"context": "edit"})
    bases = [t["rest_base"] for k, t in types.items() if k != "attachment" and t.get("rest_base")]

    def find(slug):
        for rb in bases:
            r = s.get(f"{base}/{rb}", params={"slug": slug, "status": "any", "context": "edit"}, timeout=60)
            if r.ok and r.json():
                return rb, r.json()[0]
        return None, None

    targets = []
    for slug, alt, _ in COVERS:
        path = os.path.join(OUT, slug + ".webp")
        if not os.path.exists(path):
            sys.exit(f"missing {path}; run product_updates.py and render.py first")
        rb, post = find(slug)
        if not post:
            sys.exit(f"no post found with slug '{slug}'")
        print(f"{slug}: {rb} #{post['id']} ({post['status']}), featured_media={post.get('featured_media')}")
        targets.append((slug, alt, path, rb, post))
    if args.dry_run:
        return

    for slug, alt, path, rb, post in targets:
        with open(path, "rb") as fh:
            media = call("POST", f"{base}/media", data=fh.read(), headers={
                "Content-Type": "image/webp",
                "Content-Disposition": f'attachment; filename="{slug}.webp"'})
        title = post["title"]["raw"] if isinstance(post["title"], dict) else slug
        call("POST", f"{base}/media/{media['id']}", json={"alt_text": alt, "title": title})
        call("POST", f"{base}/{rb}/{post['id']}", json={"featured_media": media["id"]})
        print(f"{slug}: media #{media['id']} set (was {post.get('featured_media')}) -> {post['link']}")


if __name__ == "__main__":
    main()
