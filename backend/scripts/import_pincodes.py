"""
KAWAD SWAD
INDIA PIN DIRECTORY IMPORTER

Run from the backend project directory:

    python scripts/import_pincodes.py
    python scripts/import_pincodes.py --dry-run

--dry-run parses the CSV, validates required checkout PINs, and
does not connect to MongoDB.

Expected CSV:
    backend/data/pincode/all-india-pincode-html-csv.csv

Rerunnable: upserts directory fields only (pincode, office, district,
state, deliveryStatus, source). Does not write fulfillment_rules.
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.fulfillment_seed_plan import (  # noqa: E402
    missing_required_directory_pins,
    required_directory_pins,
)
from app.services.pincode_directory import (  # noqa: E402
    DEFAULT_PINCODE_CSV,
    load_pincode_records,
)


COLLECTION_NAME = "pincodes"
BATCH_SIZE = 2000


def validate_prepared_directory(records: dict) -> None:
    missing = missing_required_directory_pins(records.keys())

    if missing:
        raise RuntimeError(
            "Required PIN(s) missing from PIN CSV: "
            + ", ".join(missing)
        )


def prepare_pincode_import(csv_path: Path = DEFAULT_PINCODE_CSV) -> dict:
    records = load_pincode_records(csv_path)
    validate_prepared_directory(records)
    return records


async def import_pincodes(dry_run: bool = False) -> None:
    print(f"Reading PIN directory: {DEFAULT_PINCODE_CSV}")

    records = prepare_pincode_import(DEFAULT_PINCODE_CSV)

    print(f"Unique PIN codes prepared: {len(records):,}")
    print(
        "Required directory PINs present: "
        + ", ".join(required_directory_pins())
    )

    if dry_run:
        print("Dry-run: no MongoDB writes.")
        return

    from app.database import get_database

    db = get_database()

    if db is None:
        raise RuntimeError(
            "MongoDB is not connected. Set MONGODB_URI and start the app DB."
        )

    collection = db[COLLECTION_NAME]
    items = list(records.values())
    imported = 0

    for start in range(0, len(items), BATCH_SIZE):
        batch = items[start:start + BATCH_SIZE]

        for record in batch:
            await collection.update_one(
                {"pincode": record["pincode"]},
                {"$set": record},
                upsert=True,
            )

        imported += len(batch)
        print(f"Imported/upserted {imported:,}/{len(items):,}")

    await collection.create_index(
        [("pincode", 1)],
        unique=False,
        name="pincode_lookup",
    )

    print("MongoDB index ready: pincode_lookup")
    print("PIN directory import completed successfully.")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Import India PIN directory into MongoDB.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse and validate the CSV without writing MongoDB.",
    )
    args = parser.parse_args()
    asyncio.run(import_pincodes(dry_run=args.dry_run))


if __name__ == "__main__":
    main()
