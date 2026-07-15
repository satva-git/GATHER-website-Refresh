from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "images" / "featured-ifa.png"


def is_background(pixel, threshold=28):
    r, g, b = pixel[:3]
    return max(r, g, b) <= threshold


def flood_fill_background(img, threshold=28):
    rgba = img.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    visited = [[False] * width for _ in range(height)]
    queue = deque()

    for x in range(width):
        for y in (0, height - 1):
            if is_background(pixels[x, y], threshold):
                queue.append((x, y))
    for y in range(height):
        for x in (0, width - 1):
            if is_background(pixels[x, y], threshold):
                queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        if x < 0 or y < 0 or x >= width or y >= height:
            continue
        if visited[y][x]:
            continue
        if not is_background(pixels[x, y], threshold):
            continue

        visited[y][x] = True
        r, g, b, a = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)

        queue.append((x - 1, y))
        queue.append((x + 1, y))
        queue.append((x, y - 1))
        queue.append((x, y + 1))

    return rgba


def main():
    img = Image.open(SRC)
    result = flood_fill_background(img)
    result.save(SRC, format="PNG", optimize=True)
    print(f"updated {SRC} ({result.size[0]}x{result.size[1]})")


if __name__ == "__main__":
    main()
