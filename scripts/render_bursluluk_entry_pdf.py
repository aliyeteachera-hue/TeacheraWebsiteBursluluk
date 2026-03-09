#!/usr/bin/env python3
from __future__ import annotations

import io
import json
import os
import re
import sys
import tempfile
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


PAGE_W = 2480
PAGE_H = 3508
MARGIN_X = 210
BG = "#F5F1EA"
PANEL_BG = "#FCFAF7"
INK = "#181818"
MUTED = "#67635C"
LINE = "#D5CEC3"
BRAND_RED = "#E51E25"

REPO_ROOT = Path(__file__).resolve().parent.parent
LOGO_SOURCE_PATH = REPO_ROOT / "src" / "imports" / "svg-8szu21giqm.ts"


def load_application() -> dict:
    try:
        return json.load(sys.stdin)
    except Exception as exc:  # pragma: no cover - boundary
        raise SystemExit(f"invalid_input:{exc}")


def first_existing(paths: list[Path]) -> Path | None:
    for path in paths:
        if path.exists():
            return path
    return None


def load_font(size: int, role: str) -> ImageFont.FreeTypeFont:
    home = Path.home()
    font_map = {
        "book": [
            home / "Library/Fonts/Neutra2Text-Book.otf",
            home / "Library/Fonts/Neutra2Text-Light.otf",
        ],
        "demi": [
            home / "Library/Fonts/Neutra2Text-Demi.otf",
            home / "Library/Fonts/Neutra2Text-Bold.otf",
        ],
        "bold": [
            home / "Library/Fonts/Neutra2Text-Bold.otf",
            home / "Library/Fonts/Neutra2Text-Demi.otf",
        ],
    }
    chosen = first_existing(font_map[role])
    if chosen:
        return ImageFont.truetype(str(chosen), size=size)
    return ImageFont.load_default()


def load_luxury_font(size: int) -> ImageFont.FreeTypeFont:
    home = Path.home()
    chosen = first_existing(
        [
            home / "Library/Fonts/luxury-gold.otf",
            home / "Library/Fonts/luxury-gold 2.otf",
            home / "Library/Fonts/luxury-platinum.otf",
        ]
    )
    if chosen:
        return ImageFont.truetype(str(chosen), size=size)
    return ImageFont.load_default()


FONT_BOOK_28 = load_font(28, "book")
FONT_BOOK_32 = load_font(32, "book")
FONT_BOOK_34 = load_font(34, "book")
FONT_BOOK_36 = load_font(36, "book")
FONT_DEMI_28 = load_font(28, "demi")
FONT_DEMI_32 = load_font(32, "demi")
FONT_DEMI_36 = load_font(36, "demi")
FONT_DEMI_42 = load_font(42, "demi")
FONT_DEMI_46 = load_font(46, "demi")
FONT_DEMI_50 = load_font(50, "demi")
FONT_BOLD_64 = load_font(64, "bold")
FONT_BOLD_88 = load_font(88, "bold")
FONT_LUXURY_32 = load_luxury_font(32)


def normalize_text(value: str | None) -> str:
    return (value or "").strip()


def to_turkish_upper(value: str) -> str:
    return (
        normalize_text(value)
        .replace("i", "İ")
        .replace("ı", "I")
        .upper()
    )


def format_document_date(value: str | None) -> str:
    raw = normalize_text(value)
    if not raw:
        return "-"
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00")).strftime("%d.%m.%Y")
    except ValueError:
        return raw[:10]


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = normalize_text(text).split()
    if not words:
        return []
    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        candidate = f"{current} {word}"
        if draw.textlength(candidate, font=font) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def measure_tracked_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, tracking: int) -> int:
    width = 0
    for index, char in enumerate(text):
        bbox = draw.textbbox((0, 0), char, font=font)
        width += bbox[2] - bbox[0]
        if index < len(text) - 1:
            width += tracking
    return width


def draw_tracked_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    x: int,
    y: int,
    font: ImageFont.FreeTypeFont,
    fill: str,
    tracking: int,
) -> int:
    cursor_x = x
    max_h = 0
    for char in text:
        draw.text((cursor_x, y), char, font=font, fill=fill)
        bbox = draw.textbbox((cursor_x, y), char, font=font)
        cursor_x += (bbox[2] - bbox[0]) + tracking
        max_h = max(max_h, bbox[3] - bbox[1])
    return max_h


def draw_tracked_text_center(
    draw: ImageDraw.ImageDraw,
    text: str,
    center_x: int,
    y: int,
    font: ImageFont.FreeTypeFont,
    fill: str,
    tracking: int,
) -> int:
    width = measure_tracked_text(draw, text, font, tracking)
    x = center_x - (width // 2)
    return draw_tracked_text(draw, text, x, y, font, fill, tracking)


def draw_paragraph(
    draw: ImageDraw.ImageDraw,
    text: str,
    box: tuple[int, int, int, int],
    font: ImageFont.FreeTypeFont,
    fill: str,
    line_gap: int = 12,
) -> int:
    x1, y1, x2, _ = box
    lines = wrap_text(draw, text, font, x2 - x1)
    y = y1
    for line in lines:
        draw.text((x1, y), line, font=font, fill=fill)
        bbox = draw.textbbox((x1, y), line, font=font)
        y += (bbox[3] - bbox[1]) + line_gap
    return y


def draw_centered_paragraph(
    draw: ImageDraw.ImageDraw,
    text: str,
    center_x: int,
    y: int,
    max_width: int,
    font: ImageFont.FreeTypeFont,
    fill: str,
    line_gap: int = 12,
) -> int:
    lines = wrap_text(draw, text, font, max_width)
    current_y = y
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        line_x = center_x - ((bbox[2] - bbox[0]) // 2)
        draw.text((line_x, current_y), line, font=font, fill=fill)
        current_y += (bbox[3] - bbox[1]) + line_gap
    return current_y


def draw_kv_pair(draw: ImageDraw.ImageDraw, x: int, y: int, label: str, value: str, width: int) -> int:
    draw_tracked_text(draw, to_turkish_upper(label), x, y, FONT_DEMI_28, MUTED, 6)
    y += 46
    lines = wrap_text(draw, value or "-", FONT_DEMI_46, width)
    for line in lines:
        draw.text((x, y), line, font=FONT_DEMI_46, fill=INK)
        bbox = draw.textbbox((x, y), line, font=FONT_DEMI_46)
        y += (bbox[3] - bbox[1]) + 12
    return y + 28


def draw_bullets(draw: ImageDraw.ImageDraw, items: list[str], x: int, y: int, width: int) -> int:
    current_y = y
    for item in items:
        draw.text((x, current_y), "•", font=FONT_DEMI_36, fill=INK)
        text_x = x + 24
        lines = wrap_text(draw, item, FONT_BOOK_34, width - 24)
        for index, line in enumerate(lines):
            draw.text((text_x, current_y), line, font=FONT_BOOK_34, fill=INK)
            bbox = draw.textbbox((text_x, current_y), line, font=FONT_BOOK_34)
            current_y += (bbox[3] - bbox[1]) + (10 if index < len(lines) - 1 else 6)
        current_y += 24
    return current_y


def draw_dashed_line(draw: ImageDraw.ImageDraw, start_x: int, end_x: int, y: int, dash: int = 24, gap: int = 18) -> None:
    current_x = start_x
    while current_x < end_x:
        draw.line((current_x, y, min(current_x + dash, end_x), y), fill=LINE, width=3)
        current_x += dash + gap


def build_page(application: dict) -> Image.Image:
    image = Image.new("RGB", (PAGE_W, PAGE_H), BG)
    draw = ImageDraw.Draw(image)
    center_x = PAGE_W // 2

    draw_tracked_text_center(draw, "ONLINE BURSLULUK SINAVI", center_x, 332, FONT_DEMI_28, MUTED, 9)

    title = "Sınav Giriş Belgesi"
    title_bbox = draw.textbbox((0, 0), title, font=FONT_BOLD_88)
    draw.text((center_x - ((title_bbox[2] - title_bbox[0]) // 2), 390), title, font=FONT_BOLD_88, fill=INK)

    intro_y = draw_centered_paragraph(
        draw,
        "Bu belge, Teachera Online Bursluluk Sınavı için adınıza düzenlenmiştir. Sınav gününde oturumunuza düzenli ve güvenli biçimde katılabilmeniz için aşağıdaki bilgileri kontrol ederek belgenizi saklayınız.",
        center_x,
        510,
        1620,
        FONT_BOOK_34,
        MUTED,
        line_gap=12,
    )

    code_box_w = 820
    code_box_h = 148
    code_box_x = center_x - (code_box_w // 2)
    code_box_y = intro_y + 54
    draw.rounded_rectangle((code_box_x, code_box_y, code_box_x + code_box_w, code_box_y + code_box_h), radius=34, fill=PANEL_BG, outline=LINE, width=3)
    draw_tracked_text_center(draw, "BAŞVURU KODU", center_x, code_box_y + 24, FONT_DEMI_28, MUTED, 6)
    code = normalize_text(application.get("applicationCode")) or "-"
    code_bbox = draw.textbbox((0, 0), code, font=FONT_BOLD_64)
    draw.text((center_x - ((code_bbox[2] - code_bbox[0]) // 2), code_box_y + 68), code, font=FONT_BOLD_64, fill=INK)

    top = code_box_y + code_box_h + 64
    gap = 42
    card_w = (PAGE_W - (MARGIN_X * 2) - gap) // 2
    top_h = 760
    bottom_h = 650

    top_left = (MARGIN_X, top, MARGIN_X + card_w, top + top_h)
    top_right = (MARGIN_X + card_w + gap, top, PAGE_W - MARGIN_X, top + top_h)
    bottom_left = (MARGIN_X, top + top_h + 40, MARGIN_X + card_w, top + top_h + 40 + bottom_h)
    bottom_right = (MARGIN_X + card_w + gap, top + top_h + 40, PAGE_W - MARGIN_X, top + top_h + 40 + bottom_h)

    for card in (top_left, top_right, bottom_left, bottom_right):
        draw.rounded_rectangle(card, radius=34, fill=PANEL_BG, outline=LINE, width=3)

    tlx, tly, _, _ = top_left
    trx, try_, _, _ = top_right
    blx, bly, _, _ = bottom_left
    brx, bry, _, _ = bottom_right

    draw_tracked_text(draw, "ADAY BİLGİLERİ", tlx + 54, tly + 42, FONT_DEMI_32, INK, 6)
    y = tly + 118
    y = draw_kv_pair(draw, tlx + 54, y, "Öğrenci", normalize_text(application.get("studentFullName")) or "-", card_w - 108)
    y = draw_kv_pair(
        draw,
        tlx + 54,
        y,
        "Sınıf / Şube",
        " / ".join(filter(None, [normalize_text(application.get("gradeLabel")) or "-", normalize_text(application.get("branch"))])) or "-",
        card_w - 108,
    )
    y = draw_kv_pair(draw, tlx + 54, y, "Okul", normalize_text(application.get("schoolName")) or "-", card_w - 108)
    y = draw_kv_pair(draw, tlx + 54, y, "Veli", normalize_text(application.get("guardianFullName")) or "-", card_w - 108)
    draw_kv_pair(draw, tlx + 54, y, "Belge Tarihi", format_document_date(application.get("createdAt")), card_w - 108)

    draw_tracked_text(draw, "OTURUM VE GİRİŞ", trx + 54, try_ + 42, FONT_DEMI_32, INK, 6)
    y = try_ + 118
    y = draw_kv_pair(draw, trx + 54, y, "Oturum", normalize_text(application.get("sessionLabel")) or "-", card_w - 108)
    y = draw_kv_pair(draw, trx + 54, y, "Kullanıcı Adı", normalize_text(application.get("username")) or "-", card_w - 108)
    y = draw_kv_pair(draw, trx + 54, y, "Şifre", normalize_text(application.get("password")) or "Başvuru sonrası SMS ile iletilmiştir.", card_w - 108)
    draw_paragraph(
        draw,
        "Aynı kullanıcı adı ve şifre, sınav girişinde ve sonuçların görüntüleneceği ekranda yeniden kullanılacaktır.",
        (trx + 54, y + 6, trx + card_w - 54, top_right[3] - 56),
        FONT_BOOK_32,
        MUTED,
        line_gap=10,
    )

    draw_tracked_text(draw, "SINAVA GİRİŞ VE TEKNİK HAZIRLIK", blx + 54, bly + 42, FONT_DEMI_28, INK, 6)
    tech_items = [
        "Oturum saatinden en az 10 dakika önce giriş ekranında hazır olun.",
        "Güncel bir tarayıcı ve stabil internet bağlantısı kullanın.",
        "Mümkünse sessiz bir ortamda ve tek cihaz üzerinden ilerleyin.",
        "Bağlantı kesilirse aynı bilgilerle yeniden giriş yaparak devam etmeyi deneyin.",
        "Kullanıcı adı ve şifrenizi sonuçlar açıklanana kadar saklayın.",
    ]
    draw_bullets(draw, tech_items, blx + 54, bly + 116, card_w - 108)

    draw_tracked_text(draw, "SINAV DİSİPLİNİ", brx + 54, bry + 42, FONT_DEMI_28, INK, 6)
    rule_items = [
        "Sınav bireysel katılım esasına göre yürütülür; başka bir kişiden yardım almayınız.",
        "Kopya, yönlendirme veya dış destek tespit edilirse kurum sonucu yeniden inceleme hakkını saklı tutar.",
        "Sınav süresince dikkat dağıtıcı uygulamaları ve bildirimleri kapatmanız önerilir.",
        "Sonuçlar açıklandığında tarafınıza SMS ile bilgilendirme yapılacaktır.",
    ]
    draw_bullets(draw, rule_items, brx + 54, bry + 116, card_w - 108)

    note_y = bottom_left[3] + 46
    note_box = (MARGIN_X, note_y, PAGE_W - MARGIN_X, note_y + 190)
    draw.rounded_rectangle(note_box, radius=30, fill=PANEL_BG, outline=LINE, width=3)
    draw_tracked_text(draw, "TEACHERA NOTU", note_box[0] + 54, note_box[1] + 34, FONT_DEMI_28, INK, 6)
    draw_paragraph(
        draw,
        "Teachera ekibi olarak sınav deneyiminizin her aşamasını özenle planlıyoruz. Belge üzerindeki bilgilerde bir eksiklik fark ederseniz sınav saatini beklemeden bize ulaşın; destek ekibimiz kaydınızı aynı gün içinde netleştirecektir.",
        (note_box[0] + 54, note_box[1] + 82, note_box[2] - 54, note_box[3] - 28),
        FONT_BOOK_32,
        MUTED,
        line_gap=10,
    )

    footer_y = PAGE_H - 330
    draw_dashed_line(draw, MARGIN_X + 36, PAGE_W - MARGIN_X - 36, footer_y)

    left_lines = [
        "Musallabağları Mah.",
        "Kule Cd. 2/42",
        "Kule Plaza Kat:26",
        "Selçuklu / KONYA",
    ]
    left_y = footer_y + 48
    for index, line in enumerate(left_lines):
        draw.text((MARGIN_X, left_y + (index * 38)), line, font=FONT_BOOK_28, fill=MUTED)

    draw_tracked_text_center(draw, "A NEW ERA OF TEACHING", center_x, footer_y + 58, FONT_LUXURY_32, INK, 11)

    right_lines = [
        "info@teachera.com.tr",
        "www.teachera.com.tr",
        "+90 (332) 236 80 66",
        "+90 (552) 867 42 26",
    ]
    right_y = footer_y + 38
    for index, line in enumerate(right_lines):
        bbox = draw.textbbox((0, 0), line, font=FONT_DEMI_28)
        draw.text((PAGE_W - MARGIN_X - (bbox[2] - bbox[0]), right_y + (index * 34)), line, font=FONT_DEMI_28, fill=INK if index >= 2 else MUTED)

    return image


def load_logo_paths() -> list[str]:
    if not LOGO_SOURCE_PATH.exists():
        return []
    source = LOGO_SOURCE_PATH.read_text(encoding="utf-8")
    return re.findall(r': "([^"]+)"', source)


def tokenize_svg_path(path_data: str) -> list[str]:
    return re.findall(r"[MmLlHhVvCcZz]|-?\d*\.?\d+(?:[eE][-+]?\d+)?", path_data)


def draw_svg_path(path_obj, path_data: str, x0: float, y0: float, scale: float, svg_height: float) -> None:
    tokens = tokenize_svg_path(path_data)
    index = 0
    command = None
    current_x = 0.0
    current_y = 0.0

    def read_number() -> float:
        nonlocal index
        value = float(tokens[index])
        index += 1
        return value

    def transform_point(x: float, y: float) -> tuple[float, float]:
        return x0 + (x * scale), y0 + ((svg_height - y) * scale)

    while index < len(tokens):
        token = tokens[index]
        if re.fullmatch(r"[MmLlHhVvCcZz]", token):
            command = token
            index += 1
        if command is None:
            break

        if command in {"M", "m"}:
            x = read_number()
            y = read_number()
            if command == "m":
                x += current_x
                y += current_y
            px, py = transform_point(x, y)
            path_obj.moveTo(px, py)
            current_x, current_y = x, y
            command = "L" if command == "M" else "l"
        elif command in {"L", "l"}:
            x = read_number()
            y = read_number()
            if command == "l":
                x += current_x
                y += current_y
            px, py = transform_point(x, y)
            path_obj.lineTo(px, py)
            current_x, current_y = x, y
        elif command in {"H", "h"}:
            x = read_number()
            if command == "h":
                x += current_x
            px, py = transform_point(x, current_y)
            path_obj.lineTo(px, py)
            current_x = x
        elif command in {"V", "v"}:
            y = read_number()
            if command == "v":
                y += current_y
            px, py = transform_point(current_x, y)
            path_obj.lineTo(px, py)
            current_y = y
        elif command in {"C", "c"}:
            x1 = read_number()
            y1 = read_number()
            x2 = read_number()
            y2 = read_number()
            x = read_number()
            y = read_number()
            if command == "c":
                x1 += current_x
                y1 += current_y
                x2 += current_x
                y2 += current_y
                x += current_x
                y += current_y
            p1x, p1y = transform_point(x1, y1)
            p2x, p2y = transform_point(x2, y2)
            px, py = transform_point(x, y)
            path_obj.curveTo(p1x, p1y, p2x, p2y, px, py)
            current_x, current_y = x, y
        elif command in {"Z", "z"}:
            path_obj.close()
            command = None
        else:  # pragma: no cover - unsupported command
            break


def draw_teachera_logo(pdf: canvas.Canvas, page_w: float, page_h: float) -> None:
    paths = load_logo_paths()
    if not paths:
        return

    svg_width = 146.0
    svg_height = 29.0
    logo_width = 125.0
    scale = logo_width / svg_width
    logo_height = svg_height * scale
    top_margin = 42.0
    x0 = (page_w - logo_width) / 2
    y0 = page_h - top_margin - logo_height

    pdf.saveState()
    pdf.setFillColor(HexColor(BRAND_RED))
    pdf.setStrokeColor(HexColor(BRAND_RED))
    for path_data in paths:
        path_obj = pdf.beginPath()
        draw_svg_path(path_obj, path_data, x0, y0, scale, svg_height)
        pdf.drawPath(path_obj, stroke=0, fill=1)
    pdf.restoreState()


def render_pdf(application: dict) -> bytes:
    image = build_page(application)
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_png:
        image.save(temp_png.name, format="PNG", optimize=True)
        png_path = temp_png.name

    try:
        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        page_w, page_h = A4
        pdf.drawImage(ImageReader(png_path), 0, 0, width=page_w, height=page_h, preserveAspectRatio=True, mask="auto")
        draw_teachera_logo(pdf, page_w, page_h)
        pdf.showPage()
        pdf.save()
        return buffer.getvalue()
    finally:
        try:
            os.remove(png_path)
        except OSError:
            pass


def main() -> None:
    application = load_application()
    pdf = render_pdf(application)
    sys.stdout.buffer.write(pdf)


if __name__ == "__main__":
    main()
