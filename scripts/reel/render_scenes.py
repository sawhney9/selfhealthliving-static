#!/usr/bin/env python3
"""Render 1080x1920 Instagram/TikTok reel scenes for a smoothie recipe.

Usage: python3 render_scenes.py <config.json>

Config: { hero, accent: [r,g,b] | "auto", outdir,
          scenes: [ {img, tag, title, benefit, kicker, cta} ] }
Scenes with img=null use the hero photo (hook / outro). Relative img paths
resolve against the config's "img_base" (default: this script's ingredients dir).
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os, sys, json, colorsys

W, H = 1080, 1920
WHITE = (247, 246, 250)
MUTED = (198, 196, 206)
BASE  = (10, 8, 16)

# Prefer Arial (macOS) then Liberation/DejaVu (Linux/CI) so local and CI match visually.
BOLD_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]
REG_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]

def first_font(cands):
    for p in cands:
        if os.path.exists(p):
            return p
    raise SystemExit(f"No usable font found; tried: {cands}")

BOLD = first_font(BOLD_CANDIDATES)
REG  = first_font(REG_CANDIDATES)


def load_cfg():
    cfg = json.load(open(sys.argv[1]))
    cfg.setdefault("img_base", os.path.join(os.path.dirname(os.path.abspath(__file__)), "ingredients"))
    return cfg


def square(im):
    s = min(im.size)
    return im.crop(((im.width - s)//2, (im.height - s)//2,
                    (im.width + s)//2, (im.height + s)//2))


def auto_accent(hero_path):
    """Pick the accent from the drink itself: sample the central column of the
    hero (where the glass sits) so surrounding garnish/greens don't dominate,
    then take the median hue of vivid pixels."""
    im = square(Image.open(hero_path).convert("RGB"))
    w, h = im.size
    im = im.crop((int(w*0.30), int(h*0.28), int(w*0.70), int(h*0.82))).resize((70, 90))
    hues = []
    for r, g, b in list(im.getdata()):
        hh, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
        if 0.30 < v < 0.96 and s > 0.28:
            hues.append((hh, s, v))
    if not hues:
        return (168, 85, 247)
    hues.sort(key=lambda t: t[0])
    mh, ms, mv = hues[len(hues)//2]              # median-hue vivid pixel
    r, g, b = colorsys.hsv_to_rgb(mh, min(1, max(ms, 0.6) * 1.1), min(1, max(mv, 0.62)))
    return (int(r*255), int(g*255), int(b*255))


def font(p, s): return ImageFont.truetype(p, s)

def rounded(img, radius):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, *img.size], radius, fill=255)
    out = img.convert("RGBA"); out.putalpha(mask); return out

def photo_card(width, src, hero):
    im = square(Image.open(src or hero).convert("RGB")).resize((width, width), Image.LANCZOS)
    im = ImageEnhance.Sharpness(im).enhance(1.3)
    im = ImageEnhance.Color(im).enhance(1.1)
    im = ImageEnhance.Contrast(im).enhance(1.04)
    return rounded(im, 46)

def background(hero, accent):
    bg = square(Image.open(hero).convert("RGB")).resize((W, H), Image.LANCZOS)
    bg = bg.filter(ImageFilter.GaussianBlur(70))
    bg = ImageEnhance.Brightness(bg).enhance(0.32)
    canvas = Image.blend(Image.new("RGB", (W, H), BASE), bg, 0.55)
    glow = Image.new("L", (W, H), 0)
    ImageDraw.Draw(glow).ellipse([-200, -600, W + 200, 560], fill=90)
    glow = glow.filter(ImageFilter.GaussianBlur(160))
    accent_layer = Image.new("RGB", (W, H), accent)
    return Image.composite(accent_layer, canvas, glow.point(lambda p: int(p * 0.5)))

def wrap(draw, text, fnt, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=fnt) <= max_w: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def draw_center(draw, cx, y, text, fnt, fill, ls=0):
    w = draw.textlength(text, font=fnt)
    draw.text((cx - w/2, y), text, font=fnt, fill=fill)
    return y + fnt.size + ls

def pill(canvas, cx, y, text, fnt, accent):
    d = ImageDraw.Draw(canvas)
    tw = d.textlength(text, font=fnt); pad_x, h = 34, fnt.size + 26
    x0, x1 = cx - tw/2 - pad_x, cx + tw/2 + pad_x
    layer = Image.new("RGBA", canvas.size, (0,0,0,0))
    ImageDraw.Draw(layer).rounded_rectangle([x0, y, x1, y + h], h//2, fill=accent + (255,))
    canvas.alpha_composite(layer)
    ImageDraw.Draw(canvas).text((cx - tw/2, y + 13), text, font=fnt, fill=(15,10,15))
    return y + h

def scene(out, name, hero, accent, accent_hi, tag, title, benefit, kicker=None, cta=False, img=None):
    canvas = background(hero, accent).convert("RGBA")
    d = ImageDraw.Draw(canvas); cx = W // 2
    card_w = 620
    card = photo_card(card_w, img, hero)
    card_x, card_y = cx - card_w // 2, 250
    shadow = Image.new("RGBA", canvas.size, (0,0,0,0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [card_x, card_y+18, card_x+card_w, card_y+card_w+18], 46, fill=(0,0,0,150))
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(30)))
    canvas.alpha_composite(card, (card_x, card_y))
    ImageDraw.Draw(canvas).rounded_rectangle(
        [card_x, card_y, card_x+card_w, card_y+card_w], 46, outline=accent+(160,), width=3)

    y = card_y + card_w + 90
    if kicker:
        f_k = font(BOLD, 40)
        for ln in wrap(d, kicker, f_k, 900):
            y = draw_center(d, cx, y, ln, f_k, accent_hi, ls=8)
        y += 24
    if tag:
        y = pill(canvas, cx, y, tag, font(BOLD, 34), accent) + 34
    f_t = font(BOLD, 104 if not cta else 92)
    for ln in wrap(d, title, f_t, 980):
        y = draw_center(d, cx, y, ln, f_t, WHITE, ls=6)
    y += 22
    f_b = font(REG, 50)
    for ln in wrap(d, benefit, f_b, 900):
        y = draw_center(d, cx, y, ln, f_b, MUTED, ls=10)
    canvas.convert("RGB").save(os.path.join(out, name), quality=95)

def main():
    cfg = load_cfg()
    hero = cfg["hero"]
    accent = auto_accent(hero) if cfg.get("accent") in (None, "auto") else tuple(cfg["accent"])
    accent_hi = tuple(min(255, int(c + (255 - c) * 0.45)) for c in accent)
    out = cfg["outdir"]; os.makedirs(out, exist_ok=True)
    base = cfg["img_base"]

    for i, s in enumerate(cfg["scenes"]):
        img = s.get("img")
        if img and not os.path.isabs(img):
            img = os.path.join(base, img)
        scene(out, f"s{i}.png", hero, accent, accent_hi,
              s.get("tag"), s["title"], s["benefit"],
              kicker=s.get("kicker"), cta=s.get("cta", False), img=img)
    print(f"accent={accent}  scenes={len(cfg['scenes'])}  -> {out}")

if __name__ == "__main__":
    main()
