#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile

NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkg": "http://schemas.openxmlformats.org/package/2006/relationships",
}

DEFAULT_SOURCE = Path("/Users/afumacpro/Downloads/OKULLAR.xlsx")
DEFAULT_DEST = Path("api/_data/bursluluk-schools.json")
PREFERRED_SHEETS = ("OKULLAR", "BURSLULUK OKUL")


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_value.lower()).strip("-")
    return re.sub(r"-{2,}", "-", slug) or "school"


def parse_shared_strings(archive: ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []

    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    shared_strings: list[str] = []
    for entry in root.findall("main:si", NS):
        text = "".join(node.text or "" for node in entry.findall(".//main:t", NS))
        shared_strings.append(text)
    return shared_strings


def resolve_sheet_targets(archive: ZipFile) -> list[tuple[str, str]]:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    relationships = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    rel_map = {
        rel.attrib["Id"]: rel.attrib["Target"]
        for rel in relationships.findall("pkg:Relationship", NS)
    }

    targets: list[tuple[str, str]] = []
    for sheet in workbook.find("main:sheets", NS) or []:
        rel_id = sheet.attrib.get(f"{{{NS['rel']}}}id")
        if not rel_id or rel_id not in rel_map:
            continue
        targets.append((sheet.attrib["name"].strip(), f"xl/{rel_map[rel_id]}"))
    return targets


def read_sheet_rows(archive: ZipFile, target: str, shared_strings: list[str]) -> list[list[str]]:
    root = ET.fromstring(archive.read(target))
    rows: list[list[str]] = []

    for row in root.findall(".//main:sheetData/main:row", NS):
        row_values: list[str] = []
        for cell in row.findall("main:c", NS):
            cell_type = cell.attrib.get("t")
            value_node = cell.find("main:v", NS)
            if value_node is None or value_node.text is None:
                row_values.append("")
                continue

            raw_value = value_node.text.strip()
            if cell_type == "s":
                try:
                    row_values.append(shared_strings[int(raw_value)])
                except (IndexError, ValueError):
                    row_values.append("")
            else:
                row_values.append(raw_value)
        rows.append(row_values)
    return rows


def normalize_text(value: str) -> str:
    collapsed = value.replace("\n", " ").replace("\r", " ")
    return re.sub(r"\s+", " ", collapsed).strip()


def extract_name(raw_name: str) -> str:
    normalized = normalize_text(raw_name)
    if " - " not in normalized:
        return normalized
    parts = [part.strip() for part in normalized.split(" - ") if part.strip()]
    return parts[-1] if parts else normalized


def select_sheet(archive: ZipFile, shared_strings: list[str]) -> list[list[str]]:
    targets = resolve_sheet_targets(archive)
    for preferred in PREFERRED_SHEETS:
        for sheet_name, target in targets:
            if sheet_name.strip().upper() == preferred:
                return read_sheet_rows(archive, target, shared_strings)
    if not targets:
        raise RuntimeError("Workbook does not include readable sheets.")
    return read_sheet_rows(archive, targets[0][1], shared_strings)


def build_school_index(rows: list[list[str]]) -> list[dict[str, str]]:
    schools_by_id: dict[str, dict[str, str]] = {}

    for row in rows[1:]:
        if len(row) < 5:
            continue

        raw_school = normalize_text(row[2])
        district = normalize_text(row[4]).upper()
        school_type = normalize_text(row[3]).upper()

        if not raw_school:
            continue

        public_name = extract_name(raw_school)
        school_id = slugify(f"{district}-{public_name}")
        schools_by_id[school_id] = {
            "id": school_id,
            "name": public_name,
            "district": district,
            "type": school_type or "BELIRTILMEDI",
        }

    return sorted(schools_by_id.values(), key=lambda item: (item["district"], item["name"]))


def main() -> int:
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SOURCE
    dest = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_DEST

    if not source.exists():
        raise FileNotFoundError(f"Source workbook not found: {source}")

    with ZipFile(source) as archive:
        shared_strings = parse_shared_strings(archive)
        rows = select_sheet(archive, shared_strings)

    schools = build_school_index(rows)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(schools, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Exported {len(schools)} schools to {dest}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
