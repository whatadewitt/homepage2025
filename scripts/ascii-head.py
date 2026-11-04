"""Generate the ASCII version of the headshot used by the full-terminal morph.

Run once and commit the output:

    pip install pillow
    python scripts/ascii-head.py public/images/luke-head.png src/data/ascii-head.json

The headshot is a cartoon on a transparent background, so the alpha channel is
the silhouette: transparent pixels become spaces and every opaque pixel gets at
least the lightest non-space character, so dark hair and outlines still read.

- dark: for dark themes, where denser characters read as brighter pixels.
- light: for light themes, where the mapping is inverted.

Each cell is also colored with the cartoon's own flat color under it (skin,
hair, tongue...), nudged lighter or darker until it reads on every theme
background of that mode. Output is one list of [text, color] runs per line.
"""

import colorsys
import json
import sys
from collections import Counter

from PIL import Image, ImageOps

COLS, ROWS = 36, 20  # cells are ~0.6w x 1.08h, so 36x20 renders square
RAMP = " .:-=+*#%@"  # sparse -> dense
CROP = (0.5, 0.45)  # must match the photo's crop (object-position 50% 45%)
SIZE = 512
# The cartoon's flat colors; every pixel snaps to the nearest one. Update these
# if the art changes.
PALETTE = {
    "outline": (0, 0, 0),
    "hair": (52, 44, 39),
    "skin": (237, 187, 152),
    "streak": (224, 224, 224),
    "tongue": (210, 81, 122),
    "white": (255, 255, 255),
}

# Theme backgrounds per mode (src/styles/global.css). The head is decorative
# (aria-hidden), so 3:1 against the worst of these is enough.
BACKGROUNDS = {
    "dark": ["#111111", "#1A1B26", "#282A36"],
    "light": ["#F5F3FF", "#EFF1F5"],
}
MIN_CONTRAST = 3.0
# Light themes: the lightest character any filled cell can get (0..1 on RAMP).
LIGHT_MIN_DENSITY = 0.5


def load(path):
    img = Image.open(path).convert("RGBA")
    img = ImageOps.fit(img, (SIZE, SIZE), centering=CROP)
    alpha = img.getchannel("A")
    lum = ImageOps.autocontrast(img.convert("L"), cutoff=2)
    lum = lum.resize((COLS, ROWS), Image.LANCZOS)  # non-uniform on purpose
    return img, alpha, lum


def cell_colors(img, alpha):
    """The dominant flat color under each cell, as RGB tuples (None if empty)."""
    flat = Image.new("RGB", img.size, (255, 255, 255))
    flat.paste(img, mask=alpha)
    # A "P" palette has 256 slots; pad with the first color.
    colors = list(PALETTE.values())
    colors += [colors[0]] * (256 - len(colors))
    pal_img = Image.new("P", (1, 1))
    pal_img.putpalette([v for rgb in colors for v in rgb])
    quant = flat.quantize(palette=pal_img, dither=Image.Dither.NONE)
    q, a = quant.load(), alpha.load()

    grid = []
    for r in range(ROWS):
        row = []
        y0, y1 = r * SIZE // ROWS, (r + 1) * SIZE // ROWS
        for c in range(COLS):
            x0, x1 = c * SIZE // COLS, (c + 1) * SIZE // COLS
            votes = Counter(
                q[x, y] for y in range(y0, y1) for x in range(x0, x1) if a[x, y] >= 128
            )
            if not votes:
                row.append(None)
                continue
            ranked = votes.most_common()
            pick = ranked[0][0]
            # Thin black outlines shouldn't win a cell unless they fill it.
            total = sum(votes.values())
            if luminance(colors[pick]) < 0.02 and len(ranked) > 1 and ranked[0][1] / total < 0.6:
                pick = ranked[1][0]
            row.append(colors[pick])
        grid.append(row)
    return grid


def luminance(rgb):
    c = [x / 255 for x in rgb]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contrast(a, b):
    la, lb = luminance(a), luminance(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def hex_rgb(h):
    return tuple(int(h[i : i + 2], 16) for i in (1, 3, 5))


def readable(rgb, mode):
    """Lighten (dark mode) or darken (light mode) until it reads on every bg."""
    bgs = [hex_rgb(b) for b in BACKGROUNDS[mode]]
    h, l, s = colorsys.rgb_to_hls(*(x / 255 for x in rgb))
    step = 0.02 if mode == "dark" else -0.02
    if mode == "light":
        s *= 0.7  # darkened pastels go loud (peach -> orange); calm them down
    while True:
        out = tuple(round(x * 255) for x in colorsys.hls_to_rgb(h, l, s))
        if min(contrast(out, bg) for bg in bgs) >= MIN_CONTRAST or not 0 <= l + step <= 1:
            return "#%02X%02X%02X" % out
        l += step


def to_ascii(lum, alpha, colors, mode):
    small_alpha = alpha.resize((COLS, ROWS), Image.LANCZOS)
    invert = mode == "light"
    cache = {}
    lines = []
    for r in range(ROWS):
        runs = []  # [text, color]; spaces join whatever run they're in
        for c in range(COLS):
            rgb = colors[r][c]
            if small_alpha.getpixel((c, r)) < 128 or rgb is None:
                ch, color = " ", None
            else:
                v = lum.getpixel((c, r)) / 255  # 0 dark .. 1 bright
                if invert:
                    # Inverted, the bright skin would be all dots and its color
                    # would vanish; keep everything at least medium density.
                    v = LIGHT_MIN_DENSITY + (1 - LIGHT_MIN_DENSITY) * (1 - v)
                ch = RAMP[1 + min(len(RAMP) - 2, round(v * (len(RAMP) - 2)))]
                if rgb not in cache:
                    cache[rgb] = readable(rgb, mode)
                color = cache[rgb]
            if runs and (color is None or runs[-1][1] in (None, color)):
                runs[-1][0] += ch
                if runs[-1][1] is None:
                    runs[-1][1] = color
            else:
                runs.append([ch, color])
        if runs:
            runs[-1][0] = runs[-1][0].rstrip()
        lines.append([run for run in runs if run[0]])
    return lines


if __name__ == "__main__":
    src, out = sys.argv[1], sys.argv[2]
    img, alpha, lum = load(src)
    colors = cell_colors(img, alpha)
    with open(out, "w") as f:
        json.dump(
            {mode: to_ascii(lum, alpha, colors, mode) for mode in ("dark", "light")},
            f,
            separators=(",", ":"),
        )
        f.write("\n")
