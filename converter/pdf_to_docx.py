"""PDF -> Word (DOCX) converter used by the /api/convert route.

Built on pdf2docx, which rebuilds real paragraphs and tables (LibreOffice's PDF import
turns every line into a floating text box). On top of it we fix what matters for our
users' documents:

* Arabic / right-to-left lines: PDF text comes out in visual order, so mixed lines like
  "التاريخ : 24 / 10 / 2026" end up scrambled. We rebuild the logical order from the
  character positions and mark the paragraph as RTL.
* Lam-alef ligatures (لا، لإ، لأ، لآ) come out reversed, e.g. "الإعدادية" -> "اإلعدادية".
* Powers and indices: raised or lowered smaller text becomes real superscript/subscript
  (4^17 and u_n instead of 417 and un).
* Bold text detected from the font name.
* Fonts the reader probably doesn't have (GoogleSans, DejaVu, Noto, ...) are swapped for
  standard Office fonts so Word doesn't complain about missing fonts.

Usage: python3 pdf_to_docx.py input.pdf output.docx
"""

import copy
import logging
import re
import sys

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt
from pdf2docx import Converter
from pdf2docx.page.RawPageFitz import RawPageFitz
from pdf2docx.text.TextBlock import TextBlock
from pdf2docx.text.TextSpan import TextSpan

ARABIC = re.compile(r"[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]")
ALEFS = "اأإآ"


def char_type(c: str) -> str:
    """Simplified Unicode bidi class: R (Arabic), EN (digit), L (other letters), N (neutral)."""
    if ARABIC.match(c) and not c.isdigit():
        return "R"
    if c.isdigit():
        return "EN"
    if c.isalpha():
        return "L"
    return "N"


# ---------------------------------------------------------------------------
# Visual -> logical order for one physical row of a right-to-left paragraph
# ---------------------------------------------------------------------------

def logical_order(items):
    """items: list of (char, payload, x) sorted in visual left-to-right order.

    Returns them in logical (reading) order, i.e. the inverse of what the Unicode bidi
    algorithm does when Word displays a right-to-left paragraph. Left-to-right pieces
    (latin, math, numbers) keep their inner order; Arabic and the neutral characters
    around it are reversed.
    """
    n = len(items)
    t = [char_type(c) for c, _, _ in items]

    # A separator directly between two digits belongs to the number: 2/3, 3,5, 10:30.
    for i in range(1, n - 1):
        if t[i] == "N" and items[i][0] in "/.,:+-−" and t[i - 1] == "EN" and t[i + 1] == "EN":
            t[i] = "EN"

    # Digits that follow latin text are part of it ("x = 27", "N = 3412892x").
    last_strong = None
    for i in range(n):
        if t[i] in ("L", "R"):
            last_strong = t[i]
        elif t[i] == "EN" and last_strong == "L":
            t[i] = "L"

    # Neutrals join a left-to-right run only between two left-to-right characters
    # (a remaining digit counts as right-to-left here, as in the bidi algorithm).
    def strong(k):
        return "L" if k == "L" else "R"

    levels = []
    for i in range(n):
        if t[i] == "R":
            levels.append(1)
        elif t[i] in ("L", "EN"):
            levels.append(2)
        else:
            left = next((strong(t[j]) for j in range(i - 1, -1, -1) if t[j] != "N"), "R")
            right = next((strong(t[j]) for j in range(i + 1, n) if t[j] != "N"), "R")
            levels.append(2 if left == right == "L" else 1)

    # Brackets around left-to-right content stay with it: M(3 ; −5), f(x).
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for i, (c, _, _) in enumerate(items):
        if c in "([{":
            stack.append((c, i))
        elif c in pairs and stack and stack[-1][0] == pairs[c]:
            _, j = stack.pop()
            inside = t[j + 1:i]
            outside = (levels[j - 1] if j > 0 else 1, levels[i + 1] if i + 1 < n else 1)
            if "R" not in inside and any(k in ("L", "EN") for k in inside) and 2 in outside:
                for k in range(j, i + 1):
                    levels[k] = 2

    runs = []
    for item, level in zip(items, levels):
        if runs and runs[-1][0] == level:
            runs[-1][1].append(item)
        else:
            runs.append([level, [item]])

    out = []
    for level, run in reversed(runs):
        out.extend(run if level == 2 else reversed(run))
    return out


# ---------------------------------------------------------------------------
# Lam-alef ligatures
# ---------------------------------------------------------------------------

def split_ligatures(blocks):
    """MuPDF reports a lam-alef ligature glyph as a zero-width alef followed by a lam that
    owns the whole glyph. Split the glyph between them (lam on the right, alef on the
    left), so the letters read in the right order and the alef isn't dropped later."""
    for block in blocks:
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                chars = span.get("chars", [])
                for a, b in zip(chars, chars[1:]):
                    ax0, ay0, ax1, ay1 = a["bbox"]
                    bx0, by0, bx1, by1 = b["bbox"]
                    if a["c"] in ALEFS and b["c"] == "ل" and ax1 - ax0 < 0.05 and abs(bx1 - ax0) < 0.5:
                        mid = (bx0 + bx1) / 2
                        a["bbox"] = (bx0, by0, mid, by1)
                        b["bbox"] = (mid, by0, bx1, by1)
                        a["origin"] = (bx0, b["origin"][1])
                        b["origin"] = (mid, b["origin"][1])
    return blocks


_original_preprocess_text = RawPageFitz._preprocess_text


def _preprocess_text(self, **settings):
    return split_ligatures(_original_preprocess_text(self, **settings))


RawPageFitz._preprocess_text = _preprocess_text


# ---------------------------------------------------------------------------
# pdf2docx hook: rewrite RTL lines just before the paragraph is written
# ---------------------------------------------------------------------------

class _Char:
    """Minimal stand-in for pdf2docx's Char, carrying the possibly mirrored glyph."""

    def __init__(self, src, c):
        self.__dict__.update(src.__dict__)
        self.c = c


def _rows(lines):
    """Group the lines of a block into physical rows (lines whose vertical ranges overlap)."""
    rows = []
    for line in sorted(lines, key=lambda l: l.bbox.y0):
        y0, y1 = line.bbox.y0, line.bbox.y1
        for row in rows:
            ry0, ry1 = row["y"]
            overlap = min(y1, ry1) - max(y0, ry0)
            if overlap > 0.5 * min(y1 - y0, ry1 - ry0):
                row["lines"].append(line)
                row["y"] = (min(y0, ry0), max(y1, ry1))
                break
        else:
            rows.append({"y": (y0, y1), "lines": [line]})
    return [r["lines"] for r in rows]


def _rebuild_rtl_row(row_lines):
    """Turn all spans of a physical row into new spans in logical order."""
    items = []
    for line in row_lines:
        for span in line.spans:
            if not isinstance(span, TextSpan):
                continue
            for ch in span.chars:
                x0, x1 = ch.bbox.x0, ch.bbox.x1
                items.append((ch, span, (x0 + x1) / 2, x1 - x0))
    if not items:
        return None

    fixed = [(ch.c, (ch, span), x) for ch, span, x, _ in items]
    fixed.sort(key=lambda t: t[2])

    ordered = logical_order(fixed)

    main_size, base_y = _row_baseline([(span.size, ch.origin) for _, (ch, span), _ in ordered])

    new_spans = []
    current = None
    for c, (ch, span), _ in ordered:
        if current is None or current["src"] is not span:
            current = {"src": span, "chars": []}
            new_spans.append(current)
        current["chars"].append(_Char(ch, c))

    spans = []
    for group in new_spans:
        src = group["src"]
        span = copy.copy(src)
        span.chars = group["chars"]
        span.rtl = any(char_type(c.c) == "R" for c in span.chars)
        _set_vertical_position(span, group["chars"][0].origin, main_size, base_y)
        spans.append(span)
    return spans


_original_block_make_docx = TextBlock.make_docx
_original_set_text_format = TextSpan._set_text_format


def _block_make_docx(self, p):
    text = "".join(line.text for line in self.lines)
    if not ARABIC.search(text):
        _mark_ltr_scripts(self)
        return _original_block_make_docx(self, p)

    rows = _rows(list(self.lines))
    for row in rows:
        spans = _rebuild_rtl_row(row)
        if spans is None:
            continue
        # Keep one line per row, carrying the row's line break.
        first = row[0]
        first.line_break = max(line.line_break for line in row)
        first.tab_stop = 0
        first.spans.reset(spans)
        for extra in row[1:]:
            extra.spans.reset([])
            extra.line_break = 0
            extra.tab_stop = 0

    result = _original_block_make_docx(self, p)

    # Right-to-left paragraph: start on the right, no left/right indents from the PDF.
    pPr = p._p.get_or_add_pPr()
    bidi = OxmlElement("w:bidi")
    pPr.insert(0, bidi)
    pf = p.paragraph_format
    pf.left_indent = None
    pf.right_indent = None
    pf.first_line_indent = None
    if pf.alignment != WD_ALIGN_PARAGRAPH.CENTER:
        pf.alignment = WD_ALIGN_PARAGRAPH.LEFT  # "left" means "start" (= right) in an RTL paragraph
    return result


def _row_baseline(sized_origins):
    """Main font size of a row and the baseline of its main-size text."""
    main_size = max(size for size, _ in sized_origins)
    base = [o[1] for size, o in sized_origins if o and size >= main_size * 0.9]
    return main_size, (max(base) if base else None)


def _set_vertical_position(span, origin, main_size, base_y):
    """Smaller text raised above the baseline is a power (x²), lowered below it an index (uₙ)."""
    span.vert = None
    span.main_size = main_size
    if base_y is None or not origin or span.size >= main_size * 0.85:
        return
    if origin[1] < base_y - main_size * 0.2:
        span.vert = "superscript"
    elif origin[1] > base_y + main_size * 0.1:
        span.vert = "subscript"


def _mark_ltr_scripts(block):
    for row in _rows(list(block.lines)):
        spans = [s for line in row for s in line.spans if isinstance(s, TextSpan) and s.chars]
        if not spans:
            continue
        main_size, base_y = _row_baseline([(s.size, s.chars[0].origin) for s in spans])
        for s in spans:
            _set_vertical_position(s, s.chars[0].origin, main_size, base_y)


def _set_text_format(self, docx_run):
    _original_set_text_format(self, docx_run)
    vert = getattr(self, "vert", None)
    if vert:
        setattr(docx_run.font, vert, True)
        # Word shrinks super/subscript itself, so use the size of the surrounding text.
        docx_run.font.size = Pt(round(self.main_size * 2) / 2)
    if "bold" in (self.font or "").lower() or "black" in (self.font or "").lower():
        docx_run.bold = True
    if getattr(self, "rtl", False):
        rPr = docx_run._element.get_or_add_rPr()
        rPr.append(OxmlElement("w:rtl"))
        if docx_run.bold:
            rPr.append(OxmlElement("w:bCs"))
        if docx_run.font.size:
            szcs = OxmlElement("w:szCs")
            szcs.set(qn("w:val"), str(int(docx_run.font.size.pt * 2)))
            rPr.append(szcs)


TextBlock.make_docx = _block_make_docx
TextSpan._set_text_format = _set_text_format


# ---------------------------------------------------------------------------
# Fonts: use fonts every Word installation has
# ---------------------------------------------------------------------------

STANDARD_FONTS = {
    "arial", "arial black", "calibri", "cambria", "cambria math", "candara", "comic sans ms",
    "consolas", "constantia", "corbel", "courier new", "georgia", "impact", "segoe ui",
    "symbol", "tahoma", "times new roman", "trebuchet ms", "verdana", "wingdings",
    "traditional arabic", "simplified arabic", "arabic typesetting", "sakkal majalla",
    "aldhabi", "andalus", "microsoft uighur", "garamond", "book antiqua", "century gothic",
}


def standard_font(name: str) -> str:
    clean = re.sub(r"^[A-Z]{6}\+", "", name or "")  # subset prefix like ABCDEF+
    family = re.split(r"[-,]", clean)[0].strip()
    spaced = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", family)
    for candidate in (family, spaced):
        if candidate.lower() in STANDARD_FONTS:
            return candidate
    low = clean.lower()
    if "math" in low:
        return "Cambria Math"
    if "mono" in low or "courier" in low or "code" in low:
        return "Courier New"
    if "serif" in low and "sans" not in low or "times" in low or "roman" in low:
        return "Times New Roman"
    if "symbol" in low:
        return "Symbol"
    return "Arial"


def normalize_fonts(path: str):
    doc = Document(path)
    parts = [doc.element, doc.styles.element]
    for root in parts:
        for rfonts in root.iter(qn("w:rFonts")):
            for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
                value = rfonts.get(qn(attr))
                if value:
                    rfonts.set(qn(attr), standard_font(value))
    doc.save(path)


def convert(src: str, dst: str):
    logging.disable(logging.INFO)
    cv = Converter(src)
    try:
        cv.convert(dst, multi_processing=False)
    finally:
        cv.close()
    normalize_fonts(dst)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("usage: pdf_to_docx.py input.pdf output.docx")
    convert(sys.argv[1], sys.argv[2])
