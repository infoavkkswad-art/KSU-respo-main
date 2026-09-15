"""
India PIN directory CSV → checkout records.

No Mongo. Used by import_pincodes.py (including --dry-run).

Dedup is deterministic: one row per PIN, preferring a delivery office
with more filled fields, then the lexicographically smallest office name.
"""

from __future__ import annotations

import csv
import re
from pathlib import Path
from typing import Dict, Iterable, Optional, Tuple


BACKEND_DIR = Path(__file__).resolve().parents[2]

DEFAULT_PINCODE_CSV = (
    BACKEND_DIR
    / "data"
    / "pincode"
    / "all-india-pincode-html-csv.csv"
)

RECORD_FIELDS = (
    "officeName",
    "districtName",
    "stateName",
    "deliveryStatus",
)


def normalize_header(value: str) -> str:
    return re.sub(
        r"[^a-z0-9]",
        "",
        str(value).strip().lower(),
    )


def find_column(
    headers: Iterable[str],
    *candidates: str,
) -> Optional[str]:
    normalized = {
        normalize_header(header): header
        for header in headers
    }

    for candidate in candidates:
        key = normalize_header(candidate)
        if key in normalized:
            return normalized[key]

    return None


def clean_value(value: object) -> Optional[str]:
    if value is None:
        return None

    text = str(value).strip()
    if not text:
        return None

    return text


def clean_pincode(value: object) -> Optional[str]:
    text = clean_value(value)

    if not text:
        return None

    if text.endswith(".0"):
        text = text[:-2]

    digits = re.sub(r"\D", "", text)

    if len(digits) != 6 or digits.startswith("0"):
        return None

    return digits


def is_delivery_office(delivery_status: Optional[str]) -> bool:
    token = re.sub(
        r"[^a-z]",
        "",
        str(delivery_status or "").lower(),
    )
    return token == "delivery"


def detect_columns(fieldnames: Iterable[str]) -> Dict[str, Optional[str]]:
    return {
        "pincode": find_column(
            fieldnames,
            "pincode",
            "pin code",
        ),
        "officeName": find_column(
            fieldnames,
            "officename",
            "office name",
        ),
        "districtName": find_column(
            fieldnames,
            "districtname",
            "district name",
            "district",
        ),
        "stateName": find_column(
            fieldnames,
            "statename",
            "state name",
        ),
        "deliveryStatus": find_column(
            fieldnames,
            "deliverystatus",
            "delivery status",
            "delivery",
        ),
    }


def row_to_record(
    row: Dict[str, str],
    columns: Dict[str, Optional[str]],
) -> Optional[dict]:
    pincode = clean_pincode(
        row.get(columns["pincode"]) if columns["pincode"] else None
    )

    if not pincode:
        return None

    return {
        "pincode": pincode,
        "officeName": clean_value(
            row.get(columns["officeName"]) if columns["officeName"] else None
        ),
        "districtName": clean_value(
            row.get(columns["districtName"]) if columns["districtName"] else None
        ),
        "stateName": clean_value(
            row.get(columns["stateName"]) if columns["stateName"] else None
        ),
        "deliveryStatus": clean_value(
            row.get(columns["deliveryStatus"]) if columns["deliveryStatus"] else None
        ),
        "source": "all-india-pincode-directory",
    }


def record_rank(record: dict) -> Tuple:
    filled = sum(bool(record.get(field)) for field in RECORD_FIELDS)
    delivery = 1 if is_delivery_office(record.get("deliveryStatus")) else 0
    office = str(record.get("officeName") or "").lower()
    return (filled, delivery, office)


def choose_better_record(current: dict, candidate: dict) -> dict:
    current_rank = record_rank(current)
    candidate_rank = record_rank(candidate)

    if candidate_rank[0] > current_rank[0]:
        return candidate

    if candidate_rank[0] < current_rank[0]:
        return current

    if candidate_rank[1] > current_rank[1]:
        return candidate

    if candidate_rank[1] < current_rank[1]:
        return current

    if candidate_rank[2] < current_rank[2]:
        return candidate

    return current


def load_pincode_records(
    csv_path: Optional[Path] = None,
) -> Dict[str, dict]:
    path = csv_path or DEFAULT_PINCODE_CSV

    if not path.exists():
        raise FileNotFoundError(f"PIN CSV not found: {path}")

    records: Dict[str, dict] = {}

    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)

        if not reader.fieldnames:
            raise RuntimeError("PIN CSV has no header row.")

        columns = detect_columns(reader.fieldnames)

        if not columns["pincode"]:
            raise RuntimeError(
                "Could not find the PIN code column in the CSV."
            )

        for row in reader:
            record = row_to_record(row, columns)

            if not record:
                continue

            existing = records.get(record["pincode"])

            if existing is None:
                records[record["pincode"]] = record
                continue

            records[record["pincode"]] = choose_better_record(
                existing,
                record,
            )

    if not records:
        raise RuntimeError("No valid PIN records were found in the CSV.")

    return records
