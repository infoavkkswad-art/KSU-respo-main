"""
Seed Mongo `products` from approved src/data/sales-config.ts sellingPrice + MRP.

Names and weights come from src/data/products.ts. Packed-in
backend/app/models/product.py websitePrice values are never used.

    python scripts/seed_product_master.py --dry-run
    python scripts/seed_product_master.py
"""

import argparse
import asyncio
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.database import (  # noqa: E402
    close_mongo_connection,
    connect_to_mongo,
)
from app.services.product_master import (  # noqa: E402
    seed_products_collection,
)


async def main(dry_run: bool) -> None:
    catalog = None

    if dry_run:
        catalog = await seed_products_collection(dry_run=True)
        print(
            f"Dry-run: would upsert {len(catalog)} SKUs "
            "from sales-config.ts (no Mongo writes)."
        )
        for item in catalog:
            print(
                f"  {item['sku']}  {item['name']}  "
                f"{item['weight_g']}g  MRP ₹{item['mrp']}  "
                f"selling ₹{item['selling_price']}  "
                f"active={item['active']}"
            )
        return

    await connect_to_mongo()
    try:
        catalog = await seed_products_collection(dry_run=False)
        print(f"Upserted {len(catalog)} product master SKUs into Mongo.")
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Seed the commercial product master from sales-config.ts.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse and print SKUs without writing to Mongo.",
    )
    args = parser.parse_args()
    asyncio.run(main(dry_run=args.dry_run))
