"""
KAWAD SWAD
FULFILMENT RULES MIGRATION

Run from the backend directory after PIN import:

    python scripts/migrate_fulfillment_rules.py
    python scripts/migrate_fulfillment_rules.py --dry-run

--dry-run validates the plan against current Mongo collections and
writes nothing.

Does NOT invent India Post Zone/Metro mapping.

Touches only:
- the six approved free-shipping PINs (upsert MANUAL + ₹0)
- origin PIN 451225 (SHIPPING, not free)
- leftover active MANUAL + ₹0 rules that are not on the free list
  (convert to SHIPPING, freeShipping false)

Other fulfillment_rules documents are left unchanged, including any
extra fields on the pins above (owned commercial fields are overlaid).

Live payable still uses parcel_tariff.py, not Mongo shippingCharge.
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
    owned_rule_patch,
    plan_fulfillment_migration,
    revoke_patch,
)
from app.services.parcel_tariff import (  # noqa: E402
    FREE_SHIPPING_PINS,
)


async def load_migration_inputs():
    from app.database import get_database

    db = get_database()

    if db is None:
        raise RuntimeError(
            "MongoDB is not connected. Set MONGODB_URI and start the app DB."
        )

    pincodes = db["pincodes"]
    rules = db["fulfillment_rules"]

    pin_count = await pincodes.count_documents({})
    required_found: list[str] = []

    from app.services.fulfillment_seed_plan import required_directory_pins

    for pin in required_directory_pins():
        exists = await pincodes.find_one(
            {"pincode": pin},
            {"_id": 1},
        )
        if exists:
            required_found.append(pin)

    existing = await rules.find({}).to_list(length=10000)

    return db, pin_count, required_found, existing


def describe_plan(plan: dict) -> None:
    if plan["errors"]:
        print("Migration plan errors:")
        for error in plan["errors"]:
            print(f"  - {error}")
        return

    print("Planned free-PIN upserts:")
    for write in plan["upserts"]:
        print(
            f"  {write['pincode']} → "
            f"{write['fulfillmentType']} "
            f"freeShipping={write['freeShipping']}"
        )

    if plan["revokes"]:
        print("Planned leftover MANUAL+₹0 revokes:")
        for pin in plan["revokes"]:
            print(f"  {pin} → SHIPPING freeShipping=False")
    else:
        print("No leftover MANUAL+₹0 rules to revoke.")

    if plan["untouchedPincodes"]:
        print(
            "Unrelated fulfillment_rules left unchanged: "
            + ", ".join(plan["untouchedPincodes"])
        )


async def migrate_fulfillment_rules(dry_run: bool = False) -> None:
    db, pin_count, required_found, existing = await load_migration_inputs()

    plan = plan_fulfillment_migration(
        pin_count=pin_count,
        directory_pins=required_found,
        existing_rules=existing,
    )

    describe_plan(plan)

    if not plan["ok"]:
        raise RuntimeError("; ".join(plan["errors"]))

    if dry_run:
        print("Dry-run: no MongoDB writes.")
        print(f"Free-shipping PINs: {len(FREE_SHIPPING_PINS)}")
        print(f"Leftover MANUAL+₹0 to revoke: {len(plan['revokes'])}")
        return

    rules = db["fulfillment_rules"]

    for write in plan["upserts"]:
        await rules.update_one(
            {"pincode": write["pincode"]},
            {"$set": owned_rule_patch(write)},
            upsert=True,
        )

    for pin in plan["revokes"]:
        await rules.update_one(
            {"pincode": pin},
            {"$set": owned_rule_patch(revoke_patch(pin))},
        )
        print(f"  revoked leftover MANUAL free rule {pin}")

    await rules.create_index(
        "pincode",
        unique=True,
        name="fulfillment_pincode_unique",
    )

    print("Fulfillment rules migration completed.")
    print(f"Free-shipping PINs: {len(FREE_SHIPPING_PINS)}")
    print(f"Revoked leftover MANUAL free PINs: {len(plan['revokes'])}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Migrate Kawad Swad fulfillment_rules (free PINs + origin).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate the plan without writing MongoDB.",
    )
    args = parser.parse_args()
    asyncio.run(migrate_fulfillment_rules(dry_run=args.dry_run))


if __name__ == "__main__":
    main()
