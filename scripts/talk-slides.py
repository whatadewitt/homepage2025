"""Turn a talk's slide PDF into the images its page swipes through.

Run once per deck and commit the output:

    pip install pymupdf pillow
    python scripts/talk-slides.py <deck.pdf> <talk-slug> "<Talk title>" [--skip 14,15]

Writes:

- public/talks/<slug>/NNN-<width>.webp: each slide at two widths (srcset).
- public/talks/<slug>.pdf: the deck itself, titled, for the download link.
- src/data/slides/<slug>.json: slide size, PDF path and alt text, read by the
  talk page (src/lib/entries.ts).

Alt text is the slide's own text. Lines that repeat on most slides (a deck
title in the header, "TECH SHARE"...) are dropped so each slide reads as what's
on it. Slides with no text get an empty alt; the slide's "n of N" label still
says where you are.

--skip drops 1-based page numbers, e.g. a slide that worked in the room but
shouldn't be online. --collapse-builds drops Keynote build steps so each
animation shows only its finished state; it prints what it dropped, so check
the result and --skip or re-add by hand as needed.
"""

import argparse
import io
import json
import re
from collections import Counter
from pathlib import Path

import pymupdf
from PIL import Image, ImageChops

WIDTHS = (720, 1440)
QUALITY = 80
ALT_MAX = 400
THUMB = 320  # width used to compare build steps
BUILD_MAX_CHANGE = 0.12  # share of the slide a build step may change
ROOT = Path(__file__).resolve().parent.parent


def page_lines(page):
    text = page.get_text("text")
    return [re.sub(r"\s+", " ", line).strip() for line in text.splitlines() if line.strip()]


def alt_text(lines, repeated):
    kept = [line for line in lines if line not in repeated]
    alt = " ".join(kept)
    if len(alt) > ALT_MAX:
        alt = alt[: ALT_MAX - 1].rsplit(" ", 1)[0] + "…"
    return alt


def thumb(page):
    pix = page.get_pixmap(matrix=pymupdf.Matrix(THUMB / page.rect.width, THUMB / page.rect.width), alpha=False)
    return Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")


def small_change(a, b):
    """True if only a small part of the slide differs (a build, not a new slide)."""
    diff = ImageChops.difference(a, b).convert("L").point(lambda v: 255 if v > 24 else 0)
    return diff.histogram()[255] <= BUILD_MAX_CHANGE * a.width * a.height


def build_steps(doc):
    """Pages that are intermediate steps of a Keynote build.

    Keynote exports every build step as its own page. Two neighbours are steps
    of one build when one's text is the other's plus some lines and only a
    small part of the slide changes. A page the next one adds to is a step on
    the way in; a page that only takes away from the one before is a step on
    the way out. Either way the fuller page stays. A section title followed by
    its content page shares text too, but the whole slide changes, so both stay.
    """
    pages = list(doc)
    texts = [Counter(page_lines(p)) for p in pages]
    thumbs = [thumb(p) for p in pages]
    drop = set()
    for i in range(len(pages) - 1):
        a, b = texts[i], texts[i + 1]
        if not small_change(thumbs[i], thumbs[i + 1]):
            continue
        if not a - b:
            drop.add(i)
        elif not b - a:
            drop.add(i + 1)
    return drop


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf")
    parser.add_argument("slug")
    parser.add_argument("title")
    parser.add_argument("--skip", default="", help="1-based pages to drop, e.g. 14,15")
    parser.add_argument(
        "--collapse-builds",
        action="store_true",
        help="keep only the last step of each Keynote build (see build_steps)",
    )
    args = parser.parse_args()

    # Read into memory so the source can also be the destination PDF.
    doc = pymupdf.open(stream=Path(args.pdf).read_bytes(), filetype="pdf")
    skip = {int(n) - 1 for n in args.skip.split(",") if n.strip()}
    if args.collapse_builds:
        steps = build_steps(doc)
        print("build steps dropped:", ",".join(str(i + 1) for i in sorted(steps)) or "none")
        skip |= steps
    if skip:
        doc.delete_pages(sorted(skip))

    pages = list(doc)
    lines = [page_lines(p) for p in pages]
    counts = Counter(line for page in lines for line in set(page))
    repeated = {line for line, n in counts.items() if len(pages) > 3 and n > len(pages) / 2}

    out_dir = ROOT / "public" / "talks" / args.slug
    out_dir.mkdir(parents=True, exist_ok=True)
    for old in out_dir.glob("*.webp"):
        old.unlink()

    slides = []
    width = height = 0
    for i, page in enumerate(pages):
        scale = max(WIDTHS) / page.rect.width
        pix = page.get_pixmap(matrix=pymupdf.Matrix(scale, scale), alpha=False)
        img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        width, height = img.size
        for w in WIDTHS:
            sized = img if w == img.width else img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)
            sized.save(out_dir / f"{i + 1:03d}-{w}.webp", "WEBP", quality=QUALITY, method=6)
        slides.append(alt_text(lines[i], repeated))

    doc.set_metadata({**doc.metadata, "title": args.title, "author": "Luke DeWitt"})
    pdf_path = ROOT / "public" / "talks" / f"{args.slug}.pdf"
    pdf_path.write_bytes(doc.tobytes(garbage=3, deflate=True))

    data_dir = ROOT / "src" / "data" / "slides"
    data_dir.mkdir(parents=True, exist_ok=True)
    manifest = {
        "width": max(WIDTHS),
        "height": round(height * max(WIDTHS) / width),
        "widths": list(WIDTHS),
        "pdf": f"/talks/{args.slug}.pdf",
        "alts": slides,
    }
    (data_dir / f"{args.slug}.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(f"{args.slug}: {len(slides)} slides, pdf {pdf_path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
