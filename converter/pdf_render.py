"""PDF -> images (one per page) or plain text, used by /api/convert.

Usage: python3 pdf_render.py input.pdf jpg|png|txt output_base
Prints the path of the file it wrote: output_base.<ext> for a single image or text,
output_base.zip when the PDF has several pages.
"""

import sys
import zipfile

import pymupdf

DPI = 150
MAX_PAGES = 200


def main(src: str, to: str, out_base: str):
    doc = pymupdf.open(src)
    if to == "txt":
        path = f"{out_base}.txt"
        with open(path, "w", encoding="utf-8") as f:
            f.write("\n\n".join(page.get_text() for page in doc))
        print(path)
        return

    pages = list(doc)[:MAX_PAGES]
    if len(pages) == 1:
        path = f"{out_base}.{to}"
        pages[0].get_pixmap(dpi=DPI).save(path, jpg_quality=90)
        print(path)
        return

    path = f"{out_base}.zip"
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as zf:
        for i, page in enumerate(pages, 1):
            pix = page.get_pixmap(dpi=DPI)
            data = pix.tobytes("jpeg", jpg_quality=90) if to == "jpg" else pix.tobytes("png")
            zf.writestr(f"page-{i:03d}.{to}", data)
    print(path)


if __name__ == "__main__":
    if len(sys.argv) != 4 or sys.argv[2] not in ("jpg", "png", "txt"):
        sys.exit("usage: pdf_render.py input.pdf jpg|png|txt output_base")
    main(*sys.argv[1:])
