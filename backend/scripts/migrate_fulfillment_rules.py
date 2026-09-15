"""
KAWAD SWAD
FULFILMENT RULES MIGRATION

Run from the backend directory after PIN import:

    python scripts/migrate_fulfillment_rules.py

Does NOT invent India Post Zone/Metro mapping.

Required production rules:
- The six approved free-shipping PINs exist in `pincodes` and are
  upserted as MANUAL + shippingCharge 0.
- Origin PIN 451225 is not free.
- Any other active MANUAL + ₹0 rule left from older seeds is
  converted to SHIPPING so deploy cannot silently keep extra free PINs.

Live payable still uses parcel_tariff.py (free list + MP Within State).
This collection is ops/seed hygiene so Mongo cannot contradict that list.
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.database import get_database  # noqa: E402
from app.services.fulfillment_seed_plan import (  # noqa: E402
    extra_manual_free_pins,
    missing_required_directory_pins,
    planned_rule_writes,
    required_directory_pins,
)
from app.services.parcel_tariff import (  # noqa: E402
    FREE_SHIPPING_PINS,
)


async def migrate_fulfillment_rules() -> None:
    db = get_database()

    if db is None:
        raise RuntimeError(
            "MongoDB is not connected. Set MONGODB_URI and start the app DB."
        )

    pincodes = db["pincodes"]
    rules = db["fulfillment_rules"]

    pin_count = await pincodes.estimated_document_count()

    if pin_count < 1:
        raise RuntimeError(
            "pincodes collection is empty. "
            "Run python scripts/import_pincodes.py before this migration."
        )

    required_pins = required_directory_pins()
    found: list[str] = []

    for pin in required_pins:
        exists = await pincodes.find_one(
            {"pincode": pin},
            {"_id": 1},
        )
        if exists:
            found.append(pin)

    missing = missing_required_directory_pins(found)

    if missing:
        raise RuntimeError(
            "Required PIN(s) missing from pincodes: "
            + ", ".join(missing)
            + ". Re-run the India PIN directory import."
        )

    for write in planned_rule_writes():
        await rules.update_one(
            {"pincode": write["pincode"]},
            {"$set": write},
            upsert=True,
        )
        print(
            f"  upsert {write['pincode']} → "
            f"{write['fulfillmentType']} "
            f"freeShipping={write['freeShipping']}"
        )

    existing = await rules.find(
        {"active": True}
    ).to_list(length=10000)

    extras = extra_manual_free_pins(existing)

    for pin in extras:
        await rules.update_one(
            {"pincode": pin},
            {
                "$set": {
                    "fulfillmentType": "SHIPPING",
                    "shippingCharge": 0,
                    "active": True,
                    "freeShipping": False,
                }
            },
        )
        print(
            f"  revoked leftover MANUAL free rule {pin}"
        )

    await rules.create_index(
        "pincode",
        unique=True,
        name="fulfillment_pincode_unique",
    )

    print("Fulfillment rules migration completed.")
    print(f"Free-shipping PINs: {len(FREE_SHIPPING_PINS)}")
    print(f"Revoked leftover MANUAL free PINs: {len(extras)}")


if __name__ == "__main__":
    asyncio.run(migrate_fulfillment_rules())
