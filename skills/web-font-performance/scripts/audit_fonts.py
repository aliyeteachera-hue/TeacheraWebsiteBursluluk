#!/usr/bin/env python3
"""Audit web-font usage and local font inventory for performance hygiene."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

FONT_CLASS_PATTERN = re.compile(r"font-\['([^']+)")
CSS_FONT_FAMILY_PATTERN = re.compile(r"font-family\s*:\s*([^;]+);")

# Map family names used in code/CSS to local web-font files in public/fonts.
FAMILY_TO_FILE = {
    "Neutraface 2 Text": "neutra2-text-book.woff2",
    "Neutraface 2 Text:Book": "neutra2-text-book.woff2",
    "Neutraface 2 Text:BookItalic": "neutra2-text-book-italic.woff2",
    "Neutraface 2 Text:Demi": "neutra2-text-demi.woff2",
    "Neutraface 2 Text:Bold": "neutra2-text-bold.woff2",
    "Neutraface_2_Text:Book": "neutra2-text-book.woff2",
    "Neutraface_2_Text:BookItalic": "neutra2-text-book-italic.woff2",
    "Neutraface_2_Text:Demi": "neutra2-text-demi.woff2",
    "Neutraface_2_Text:Bold": "neutra2-text-bold.woff2",
    "Neutraface 2 Display:Titling": "neutra2-display-titling.woff2",
    "Neutraface_2_Display:Titling": "neutra2-display-titling.woff2",
    "Luxury:Gold": "luxury-gold.woff2",
    "Luxury:Diamond": "luxury-diamond.woff2",
    "Retro Signature": "retro-signature.woff2",
    "Retro Signature:Regular": "retro-signature.woff2",
    "Retro_Signature": "retro-signature.woff2",
    "Retro_Signature:Regular": "retro-signature.woff2",
    "Bobby Jones Soft": "bobby-jones-soft.woff2",
    "Bobby_Jones_Soft": "bobby-jones-soft.woff2",
}

SOURCE_GLOBS = ("*.ts", "*.tsx", "*.js", "*.jsx", "*.css")
SYSTEM_FONT_MARKERS = (
    "system",
    "blinkmacsystemfont",
    "roboto",
    "oxygen",
    "ubuntu",
    "cantarell",
    "fira sans",
    "droid sans",
    "helvetica neue",
    "segoe ui",
)


def iter_source_files(root: Path, source_dirs: list[str]) -> list[Path]:
    files: list[Path] = []
    for source_dir in source_dirs:
        base = root / source_dir
        if not base.exists():
            continue
        for pattern in SOURCE_GLOBS:
            files.extend(base.rglob(pattern))
    return sorted(set(files))


def extract_used_families(file_path: Path) -> set[str]:
    text = file_path.read_text(encoding="utf-8", errors="ignore")
    families: set[str] = set()

    for match in FONT_CLASS_PATTERN.findall(text):
        value = match.strip()
        if "${" in value or "?" in value:
            continue
        families.add(value)

    for family_decl in CSS_FONT_FAMILY_PATTERN.findall(text):
        for token in family_decl.split(","):
            cleaned = token.strip().strip("'\"")
            if cleaned:
                families.add(cleaned)

    return families


def is_unknown_family(family: str) -> bool:
    if family in FAMILY_TO_FILE:
        return False
    if family.startswith("-"):
        return False
    if family in {"sans-serif", "serif", "cursive", "inherit", "initial", "unset"}:
        return False
    lowered = family.lower()
    return not any(marker in lowered for marker in SYSTEM_FONT_MARKERS)


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit local web-font usage and file inventory.")
    parser.add_argument("--project-root", default=".", help="Project root (default: current directory)")
    parser.add_argument(
        "--source-dirs",
        default="src",
        help="Comma-separated source dirs to scan (default: src)",
    )
    parser.add_argument("--fonts-dir", default="public/fonts", help="Fonts directory to verify")
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Exit non-zero on unknown family, missing file, or extra local font",
    )
    args = parser.parse_args()

    root = Path(args.project_root).resolve()
    source_dirs = [segment.strip() for segment in args.source_dirs.split(",") if segment.strip()]
    fonts_dir = (root / args.fonts_dir).resolve()

    files = iter_source_files(root, source_dirs)
    used: set[str] = set()
    for file_path in files:
        used.update(extract_used_families(file_path))

    known_used = sorted(family for family in used if family in FAMILY_TO_FILE)
    unknown_used = sorted(family for family in used if is_unknown_family(family))

    required_files = sorted({FAMILY_TO_FILE[family] for family in known_used})
    installed_files = sorted(path.name for path in fonts_dir.glob("*") if path.is_file()) if fonts_dir.exists() else []

    missing_files = sorted(set(required_files) - set(installed_files))
    extra_files = sorted(set(installed_files) - set(required_files))

    print("Font audit summary")
    print(f"- Scanned files: {len(files)}")
    print(f"- Known families in use: {len(known_used)}")
    print(f"- Required font files: {len(required_files)}")
    print(f"- Installed font files: {len(installed_files)}")

    if known_used:
        print("\nKnown families used:")
        for family in known_used:
            print(f"- {family} -> {FAMILY_TO_FILE[family]}")

    if unknown_used:
        print("\nUnknown families (review manifest):")
        for family in unknown_used:
            print(f"- {family}")

    if missing_files:
        print("\nMissing local font files:")
        for filename in missing_files:
            print(f"- {filename}")

    if extra_files:
        print("\nExtra local font files (candidate for removal):")
        for filename in extra_files:
            print(f"- {filename}")

    if not missing_files and not extra_files and not unknown_used:
        print("\nStatus: OK (font usage and local inventory are aligned)")

    if args.strict and (missing_files or extra_files or unknown_used):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
