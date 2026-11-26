#!/usr/bin/env python3
"""Ritar appikoner, favicon, og-bild, manifest, robots och sitemap för Kotten och påsen.
Ingen tredjepart. Ikonen är en påse med en nöt i – appens mekanik – med tre tjocka former
och inga tunna streck, så den överlever 48 px."""
import json
import pathlib

from PIL import Image, ImageDraw, ImageFont

P = pathlib.Path(__file__).parent / "public"
P.mkdir(exist_ok=True)
ACCENT = (47, 125, 90, 255)
PAPPER = (250, 247, 242, 255)
BLACK = (20, 24, 31, 255)
NOT = (201, 80, 63, 255)


def pase(d, N, fg, notfarg=None):
    """En påse (avsmalnande upptill, rund botten) med en nöt i mynningen."""
    w, h = N * 0.56, N * 0.46
    x0, y0 = N / 2 - w / 2, N * 0.40
    topp = w * 0.30
    d.polygon([(x0 + topp, y0), (x0 + w - topp, y0), (x0 + w, y0 + h), (x0, y0 + h)], fill=fg)
    d.rounded_rectangle([x0, y0 + h - N * 0.16, x0 + w, y0 + h], radius=N * 0.08, fill=fg)
    if notfarg is not None:
        r = N * 0.115
        cx, cy = N / 2, y0 - r * 1.45
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=notfarg)


def ikon(N):
    ss = 4
    im = Image.new("RGBA", (N * ss, N * ss), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, N * ss - 1, N * ss - 1], radius=N * ss * 0.23, fill=ACCENT)
    pase(d, N * ss, (255, 255, 255, 255), (255, 255, 255, 255))
    return im.resize((N, N), Image.LANCZOS)


def favicon():
    (P / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
        '<rect width="100" height="100" rx="23" fill="#2f7d5a"/>'
        '<g fill="#fff">'
        '<path d="M38 36 h24 l6 40 a8 8 0 0 1 -8 8 h-20 a8 8 0 0 1 -8 -8 z"/>'
        '<circle cx="50" cy="30" r="9"/></g></svg>',
        encoding="utf-8")
    ikon(512).save(P / "favicon.png")


def og():
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), PAPPER)
    d = ImageDraw.Draw(im)
    ico = ikon(150)
    im.paste(ico, (int(W / 2 - 75), 54), ico)
    font = small = None
    for path in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                 "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if pathlib.Path(path).exists():
            font = ImageFont.truetype(path, 86)
            small = ImageFont.truetype(path, 36)
            break
    if font:
        for t, y, f, col in (
            ("Kotten och påsen", 250, font, BLACK),
            ("Säkert, kanske eller omöjligt? · matematik åk 1–3", 362, small, (74, 82, 96)),
            ("Gratis · ingen inloggning · skolappar.org", 424, small, (120, 126, 136)),
        ):
            d.text((W / 2 - d.textlength(t, font=f) / 2, y), t, fill=col, font=f)
    im.save(P / "og.png")


def main():
    favicon()
    ikon(192).save(P / "icon-192.png")
    ikon(512).save(P / "icon-512.png")
    ikon(512).convert("RGB").save(P / "icon-maskable-512.png")
    ikon(180).save(P / "apple-touch-icon.png")
    og()
    (P / "site.webmanifest").write_text(json.dumps({
        "name": "Kotten och påsen – säkert, kanske, omöjligt",
        "short_name": "Påsen",
        "lang": "sv",
        "start_url": "/",
        "display": "standalone",
        "orientation": "any",
        "background_color": "#faf7f2",
        "theme_color": "#2f7d5a",
        "icons": [
            {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    (P / "robots.txt").write_text(
        "User-agent: *\nAllow: /\nSitemap: https://kottenpase.skolappar.org/sitemap.xml\n", encoding="utf-8")
    (P / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        '<url><loc>https://kottenpase.skolappar.org/</loc></url>\n</urlset>\n', encoding="utf-8")
    print("skrev ikoner, favicon, og.png, manifest, robots, sitemap till", P)


if __name__ == "__main__":
    main()