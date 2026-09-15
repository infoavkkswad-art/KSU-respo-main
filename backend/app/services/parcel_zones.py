"""
Optional India Post Parcel CONTRACTUAL dest-PIN zone table.

Production file:
    backend/data/india-post/parcel-contractual-zones.csv

Empty or absent file is valid: nationwide Local / Zone-Metro /
Other States stay unclassified. Do not invent rows.
"""

from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, Optional


BACKEND_DIR = Path(__file__).resolve().parents[2]

DEFAULT_ZONES_CSV = (
    BACKEND_DIR
    / "data"
    / "india-post"
    / "parcel-contractual-zones.csv"
)

ALLOWED_PARCEL_ZONES = frozenset(
    {
        "LOCAL",
        "WITHIN_STATE",
        "ZONE_METRO",
        "OTHER_STATES",
    }
)

REQUIRED_HEADERS = (
    "pincode",
    "parcelZone",
    "originPincode",
    "source",
    "active",
)


@dataclass(frozen=True)
class ParcelZoneRow:
    pincode: str
    parcel_zone: str
    origin_pincode: str
    source: str
    active: bool


def _clean(value: object) -> str:
    return str(value or "").strip()


def _parse_active(value: object) -> bool:
    token = _clean(value).lower()

    if token in {"1", "true", "yes", "y"}:
        return True

    if token in {"0", "false", "no", "n"}:
        return False

    raise ValueError(
        f"Invalid active flag {value!r}. Use true or false."
    )


def load_parcel_zone_table(
    path: Optional[Path] = None,
) -> Dict[str, ParcelZoneRow]:
    csv_path = path or DEFAULT_ZONES_CSV

    if not csv_path.exists():
        return {}

    with csv_path.open(
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as handle:
        reader = csv.DictReader(handle)

        if not reader.fieldnames:
            return {}

        headers = {
            str(name).strip()
            for name in reader.fieldnames
            if str(name).strip()
        }

        missing = [
            name
            for name in REQUIRED_HEADERS
            if name not in headers
        ]

        if missing:
            raise RuntimeError(
                "parcel-contractual-zones.csv missing columns: "
                + ", ".join(missing)
            )

        rows: Dict[str, ParcelZoneRow] = {}

        for index, raw in enumerate(reader, start=2):
            pincode = _clean(raw.get("pincode"))
            parcel_zone = _clean(raw.get("parcelZone")).upper()
            origin = _clean(raw.get("originPincode"))
            source = _clean(raw.get("source"))
            active_raw = _clean(raw.get("active"))

            if not any(
                (pincode, parcel_zone, origin, source, active_raw)
            ):
                continue

            if (
                len(pincode) != 6
                or not pincode.isdigit()
                or pincode.startswith("0")
            ):
                raise RuntimeError(
                    f"Invalid pincode on row {index}: {pincode!r}"
                )

            if parcel_zone not in ALLOWED_PARCEL_ZONES:
                raise RuntimeError(
                    f"Invalid parcelZone on row {index}: {parcel_zone!r}"
                )

            if not origin or not source or not active_raw:
                raise RuntimeError(
                    f"Incomplete zone row {index} for PIN {pincode}."
                )

            parsed = ParcelZoneRow(
                pincode=pincode,
                parcel_zone=parcel_zone,
                origin_pincode=origin,
                source=source,
                active=_parse_active(active_raw),
            )

            if pincode in rows:
                raise RuntimeError(
                    f"Duplicate pincode in zone CSV: {pincode}"
                )

            rows[pincode] = parsed

        return rows


def production_zone_row_count(
    path: Optional[Path] = None,
) -> int:
    return len(load_parcel_zone_table(path))


def iter_active_zones(
    table: Optional[Dict[str, ParcelZoneRow]] = None,
) -> Iterable[ParcelZoneRow]:
    data = table if table is not None else load_parcel_zone_table()
    return tuple(row for row in data.values() if row.active)
