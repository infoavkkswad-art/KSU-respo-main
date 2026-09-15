"""
KAWAD SWAD
SEED FREE-SHIPPING PIN CODES

Do not use this as a weaker path than migrate_fulfillment_rules.py.
Deploy must not silently skip required PIN checks or leftover MANUAL+₹0 revoke.

Approved free-shipping PINs only (shippingCharge = ₹0).
Origin booking PIN 451225 is NOT free shipping.
"""

import asyncio
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
SCRIPTS_DIR = Path(__file__).resolve().parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(
        0,
        str(BACKEND_DIR),
    )


from app.services.parcel_tariff import (  # noqa: E402
    FREE_SHIPPING_PINS,
)


# Keep in lockstep with parcel_tariff.FREE_SHIPPING_PINS.
MANUAL_PINCODES = sorted(FREE_SHIPPING_PINS)


async def seed_manual_pincodes():
    if str(SCRIPTS_DIR) not in sys.path:
        sys.path.insert(0, str(SCRIPTS_DIR))

    from migrate_fulfillment_rules import migrate_fulfillment_rules

    print("Kawad Swad MANUAL PIN seed delegates to fulfillment migration...")
    print(f"Required free-shipping PINs: {len(MANUAL_PINCODES)}")
    await migrate_fulfillment_rules()


if __name__ == "__main__":
    asyncio.run(seed_manual_pincodes())
