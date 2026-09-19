"""
KAWAD SWAD
SEED MANUAL / LOCAL FULFILMENT PIN CODES

Stage 2.8

Run once from the backend project directory:

    python scripts/seed_manual_pincodes.py

This creates/updates the approved Kawad Swad MANUAL fulfilment
rules in MongoDB.

The India PIN directory remains separate.
"""

import asyncio
import sys
from pathlib import Path


# Allow:
# python scripts/seed_manual_pincodes.py
BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(
        0,
        str(BACKEND_DIR),
    )


from app.database import get_database  # noqa: E402


# ============================================================
# OFFICIAL KAWAD SWAD MANUAL PIN LIST
# ============================================================

MANUAL_PINCODES = [
    "451225",
    "451224",
    "451221",
    "451228",
    "451220",
    "454331",
    "451111",
    "451001",
    "453441",
    "451115",
    "454001",
    "452001",
    "450001",
]


# ============================================================
# SEED
# ============================================================

async def seed_manual_pincodes():

    db = get_database()

    collection = db[
        "fulfillment_rules"
    ]

    print(
        "Kawad Swad MANUAL PIN seed starting..."
    )

    for pincode in MANUAL_PINCODES:

        rule = {
            "pincode":
                pincode,

            "fulfillmentType":
                "MANUAL",

            "shippingCharge":
                0,

            "active":
                True,
        }

        await collection.update_one(
            {
                "pincode":
                    pincode,
            },
            {
                "$set":
                    rule,
            },
            upsert=True,
        )

        print(
            f"  ✓ {pincode} → MANUAL"
        )

    await collection.create_index(
        [
            (
                "pincode",
                1,
            )
        ],
        unique=True,
        name="fulfillment_pincode_unique",
    )

    print()
    print(
        f"Seeded {len(MANUAL_PINCODES)} MANUAL PIN codes."
    )

    print(
        "MANUAL shipping charge: ₹0"
    )

    print(
        "Seed completed successfully."
    )


if __name__ == "__main__":

    asyncio.run(
        seed_manual_pincodes()
    )
