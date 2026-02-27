#!/usr/bin/env python3
"""Sync required source fonts and generate optimized web fonts."""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from pathlib import Path

# Source file name -> destination base name (without extension)
REQUIRED_FONTS = {
    "Neutra2Text-Book.otf": "neutra2-text-book",
    "Neutra2Text-BookItalic.otf": "neutra2-text-book-italic",
    "Neutra2Text-Demi.otf": "neutra2-text-demi",
    "Neutra2Text-Bold.otf": "neutra2-text-bold",
    "Neutra2Display-Titling.otf": "neutra2-display-titling",
    "luxury-gold.otf": "luxury-gold",
    "luxury-diamond.otf": "luxury-diamond",
    "RetroSignature.otf": "retro-signature",
    "bobby-jones-soft.otf": "bobby-jones-soft",
}

UNICODES = "U+0000-024F,U+1E00-1EFF,U+2000-206F,U+20A0-20CF"


def convert_with_subset(source_path: Path, output_path: Path, flavor: str, pythonpath: str | None) -> None:
    env = None
    if pythonpath:
        env = dict(os.environ)
        env["PYTHONPATH"] = pythonpath

    command = [
        "python3",
        "-m",
        "fontTools.subset",
        str(source_path),
        f"--output-file={output_path}",
        f"--flavor={flavor}",
        "--layout-features=*",
        f"--unicodes={UNICODES}",
    ]
    subprocess.run(command, check=True, env=env)


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync required fonts and build web-font files.")
    parser.add_argument(
        "--source-dir",
        default=str(Path.home() / "Downloads"),
        help="Directory containing source font files (default: ~/Downloads)",
    )
    parser.add_argument(
        "--dest-dir",
        default="public/fonts",
        help="Target font directory inside the project (default: public/fonts)",
    )
    parser.add_argument(
        "--pythonpath",
        default="./.fonttools",
        help="PYTHONPATH that contains fontTools/brotli packages (default: ./.fonttools)",
    )
    parser.add_argument(
        "--remove-extra",
        action="store_true",
        help="Remove files from dest-dir that are not required outputs",
    )
    parser.add_argument(
        "--fallback-otf",
        action="store_true",
        help="If conversion fails, copy source OTF into dest-dir as fallback",
    )
    parser.add_argument(
        "--include-woff",
        action="store_true",
        help="Also generate .woff fallback files (default: generate only .woff2)",
    )
    args = parser.parse_args()

    source_dir = Path(args.source_dir).expanduser().resolve()
    dest_dir = Path(args.dest_dir).resolve()
    pythonpath = args.pythonpath

    if not source_dir.exists():
        print(f"Source directory not found: {source_dir}")
        return 1

    dest_dir.mkdir(parents=True, exist_ok=True)

    missing_sources: list[str] = []
    built_files: list[str] = []
    fallback_files: list[str] = []
    conversion_errors: list[str] = []

    for source_name, output_base in REQUIRED_FONTS.items():
        source_path = source_dir / source_name
        if not source_path.exists():
            missing_sources.append(str(source_path))
            continue

        woff2_path = dest_dir / f"{output_base}.woff2"
        try:
            convert_with_subset(source_path, woff2_path, "woff2", pythonpath)
            built_files.append(woff2_path.name)
            if args.include_woff:
                woff_path = dest_dir / f"{output_base}.woff"
                convert_with_subset(source_path, woff_path, "woff", pythonpath)
                built_files.append(woff_path.name)
        except Exception as error:  # noqa: BLE001
            conversion_errors.append(f"{source_name}: {error}")
            if args.fallback_otf:
                fallback_path = dest_dir / f"{output_base}.otf"
                shutil.copy2(source_path, fallback_path)
                fallback_files.append(fallback_path.name)

    keep = set()
    for output_base in REQUIRED_FONTS.values():
        keep.add(f"{output_base}.woff2")
        if args.include_woff:
            keep.add(f"{output_base}.woff")
        if args.fallback_otf:
            keep.add(f"{output_base}.otf")

    removed_files: list[str] = []
    if args.remove_extra:
        for candidate in dest_dir.glob("*"):
            if candidate.is_file() and candidate.name not in keep:
                candidate.unlink()
                removed_files.append(candidate.name)

    print("Font sync summary")
    print(f"- Source dir: {source_dir}")
    print(f"- Destination dir: {dest_dir}")
    print(f"- Built web fonts: {len(built_files)}")

    if built_files:
        print("Built files:")
        for name in sorted(built_files):
            print(f"- {name}")

    if fallback_files:
        print(f"- Fallback OTF files: {len(fallback_files)}")
        for name in sorted(fallback_files):
            print(f"- {name}")

    if removed_files:
        print(f"- Removed extras: {len(removed_files)}")
        for name in sorted(removed_files):
            print(f"- {name}")

    if conversion_errors:
        print(f"- Conversion errors: {len(conversion_errors)}")
        for err in conversion_errors:
            print(f"- {err}")

    if missing_sources:
        print(f"- Missing source files: {len(missing_sources)}")
        for path in missing_sources:
            print(f"- {path}")

    if missing_sources or conversion_errors:
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
