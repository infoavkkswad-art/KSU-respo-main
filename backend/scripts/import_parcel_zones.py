"""
Optional importer for India Post Parcel contractual dest PIN zones.

    python scripts/import_parcel_zones.py
    python scripts/import_parcel_zones.py --dry-run

If the CSV is absent or has only a header (no data rows), this
exits successfully and does not write Mongo.

Do not invent rows.
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.parcel_tariff import ORIGIN_PIN  # noqa: E402
from app.services.parcel_zones import (  # noqa: E402
    DEFAULT_ZONES_CSV,
    load_parcel_zone_table,
)


COLLECTION_NAME = "parcel_contractual_zones"


def prepare_zone_import():
    if not DEFAULT_ZONES_CSV.exists():
        return None, "absent"

    table = load_parcel_zone_table(DEFAULT_ZONES_CSV)

    if not table:
        return {}, "empty"

    for row in table.values():
        if row.origin_pincode != ORIGIN_PIN:
            raise RuntimeError(
                f"PIN {row.pincode} originPincode {row.origin_pincode} "
                f"does not match booking origin {ORIGIN_PIN}."
            )

    return table, "ready"


async def import_parcel_zones(dry_run: bool = False) -> None:
    table, status = prepare_zone_import()

    if status == "absent":
        print(
            f"Zone CSV absent ({DEFAULT_ZONES_CSV}). "
            "Skipping Mongo import. Nationwide destinations stay fail-closed."
        )
        return

    if status == "empty":
        print(
            f"Zone CSV has no data rows ({DEFAULT_ZONES_CSV}). "
            "Skipping Mongo import. Nationwide destinations stay fail-closed."
        )
        if dry_run:
            print("Dry-run: no MongoDB writes.")
        return

    print(f"Prepared {len(table)} parcel zone rows.")

    if dry_run:
        print("Dry-run: no MongoDB writes.")
        return

    from app.database import get_database

    db = get_database()

    if db is None:
        raise RuntimeError(
            "MongoDB is not connected. Set MONGODB_URI before importing zones."
        )

    collection = db[COLLECTION_NAME]
    imported = 0

    for row in table.values():
        await collection.update_one(
            {"pincode": row.pincode},
            {
                "$set": {
                    "pincode": row.pincode,
                    "parcelZone": row.parcel_zone,
                    "originPincode": row.origin_pincode,
                    "source": row.source,
                    "active": row.active,
                }
            },
            upsert=True,
        )
        imported += 1

    await collection.create_index(
        "pincode",
        unique=True,
        name="parcel_zone_pincode_unique",
    )

    print(f"Upserted {imported} parcel_contractual_zones rows.")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Import Parcel contractual dest PIN zones.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate the CSV without writing MongoDB.",
    )
    args = parser.parse_args()
    asyncio.run(import_parcel_zones(dry_run=args.dry_run))


if __name__ == "__main__":
    main()
