"""
KAWAD SWAD
ONE-TIME INDIA PIN DIRECTORY IMPORTER

Stage 2.4.1

Run from the backend project directory:

    python scripts/import_pincodes.py

Expected CSV:
    backend/data/pincode/all-india-pincode-html-csv.csv

The importer:
- Reads the CSV once.
- Normalizes the source headers.
- Converts rows into the MongoDB schema used by pincode_service.py.
- Deduplicates by PIN code.
- Upserts the PIN records.
- Creates a NON-UNIQUE index on pincode.

Why deduplicate?
The source directory can contain multiple postal-office rows for
one PIN. Checkout only needs one representative postal record for
district/state display, while the business fulfilment rule remains
separate and keyed by PIN.
"""

import asyncio
import csv
import re
import sys
from pathlib import Path
from typing import Dict, Iterable, Optional


# Make "from app..." imports work when this script is run as:
# python scripts/import_pincodes.py
BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(
        0,
        str(BACKEND_DIR),
    )


from app.database import get_database  # noqa: E402


CSV_PATH = (
    BACKEND_DIR
    / "data"
    / "pincode"
    / "all-india-pincode-html-csv.csv"
)

COLLECTION_NAME = "pincodes"

BATCH_SIZE = 2000


# ============================================================
# HEADER HELPERS
# ============================================================

def normalize_header(
    value: str,
) -> str:

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

        key = normalize_header(
            candidate
        )

        if key in normalized:
            return normalized[key]

    return None


# ============================================================
# VALUE HELPERS
# ============================================================

def clean_value(
    value,
) -> Optional[str]:

    if value is None:
        return None

    value = str(value).strip()

    if not value:
        return None

    return value


def clean_pincode(
    value,
) -> Optional[str]:

    value = clean_value(
        value
    )

    if not value:
        return None

    # Handles values such as 451225.0 if a source/export
    # has represented the PIN numerically.
    if value.endswith(".0"):
        value = value[:-2]

    digits = re.sub(
        r"\D",
        "",
        value,
    )

    if (
        len(digits) != 6
        or digits.startswith("0")
    ):
        return None

    return digits


# ============================================================
# CSV ROW CONVERSION
# ============================================================

def row_to_record(
    row: Dict[str, str],
    columns: Dict[str, Optional[str]],
) -> Optional[dict]:

    pincode = clean_pincode(
        row.get(
            columns["pincode"]
        )
        if columns["pincode"]
        else None
    )

    if not pincode:
        return None

    office_name = clean_value(
        row.get(
            columns["officeName"]
        )
        if columns["officeName"]
        else None
    )

    district_name = clean_value(
        row.get(
            columns["districtName"]
        )
        if columns["districtName"]
        else None
    )

    state_name = clean_value(
        row.get(
            columns["stateName"]
        )
        if columns["stateName"]
        else None
    )

    delivery_status = clean_value(
        row.get(
            columns["deliveryStatus"]
        )
        if columns["deliveryStatus"]
        else None
    )

    return {
        "pincode": pincode,
        "officeName": office_name,
        "districtName": district_name,
        "stateName": state_name,
        "deliveryStatus": delivery_status,
        "source": "all-india-pincode-directory",
    }


# ============================================================
# IMPORT
# ============================================================

async def import_pincodes():

    if not CSV_PATH.exists():

        raise FileNotFoundError(
            f"PIN CSV not found: {CSV_PATH}"
        )

    print(
        f"Reading PIN directory: {CSV_PATH}"
    )

    db = get_database()

    collection = db[
        COLLECTION_NAME
    ]

    # --------------------------------------------------------
    # Read all rows and keep one representative record per PIN.
    # Prefer a record with richer location information.
    # --------------------------------------------------------

    records: Dict[str, dict] = {}

    with CSV_PATH.open(
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as csv_file:

        reader = csv.DictReader(
            csv_file
        )

        if not reader.fieldnames:
            raise RuntimeError(
                "PIN CSV has no header row."
            )

        columns = {
            "pincode": find_column(
                reader.fieldnames,
                "pincode",
                "pin code",
                "pincode",
            ),

            "officeName": find_column(
                reader.fieldnames,
                "officename",
                "office name",
                "officename",
            ),

            "districtName": find_column(
                reader.fieldnames,
                "districtname",
                "district name",
            ),

            "stateName": find_column(
                reader.fieldnames,
                "statename",
                "state name",
            ),

            "deliveryStatus": find_column(
                reader.fieldnames,
                "deliverystatus",
                "delivery status",
            ),
        }

        if not columns["pincode"]:
            raise RuntimeError(
                "Could not find the PIN code column in the CSV."
            )

        print(
            "Detected columns:",
            columns,
        )

        for row in reader:

            record = row_to_record(
                row,
                columns,
            )

            if not record:
                continue

            existing = records.get(
                record["pincode"]
            )

            if existing is None:
                records[
                    record["pincode"]
                ] = record
                continue

            # Prefer the richer record.
            existing_score = sum(
                bool(
                    existing.get(field)
                )
                for field in (
                    "officeName",
                    "districtName",
                    "stateName",
                    "deliveryStatus",
                )
            )

            new_score = sum(
                bool(
                    record.get(field)
                )
                for field in (
                    "officeName",
                    "districtName",
                    "stateName",
                    "deliveryStatus",
                )
            )

            if new_score > existing_score:
                records[
                    record["pincode"]
                ] = record

    if not records:
        raise RuntimeError(
            "No valid PIN records were found in the CSV."
        )

    print(
        f"Unique PIN codes prepared: {len(records):,}"
    )

    # --------------------------------------------------------
    # Upsert in batches.
    # --------------------------------------------------------

    items = list(
        records.values()
    )

    imported = 0

    for start in range(
        0,
        len(items),
        BATCH_SIZE,
    ):

        batch = items[
            start:
            start + BATCH_SIZE
        ]

        for record in batch:

            await collection.update_one(
                {
                    "pincode":
                        record["pincode"]
                },
                {
                    "$set":
                        record
                },
                upsert=True,
            )

        imported += len(
            batch
        )

        print(
            f"Imported/upserted {imported:,}/{len(items):,}"
        )

    # --------------------------------------------------------
    # IMPORTANT:
    # pincode is NOT unique because source data can contain
    # multiple offices for the same PIN.
    #
    # We intentionally use a normal index.
    # --------------------------------------------------------

    await collection.create_index(
        [
            (
                "pincode",
                1,
            )
        ],
        unique=False,
        name="pincode_lookup",
    )

    print(
        "MongoDB index ready: pincode_lookup"
    )

    print(
        "PIN directory import completed successfully."
    )


if __name__ == "__main__":

    asyncio.run(
        import_pincodes()
    )
