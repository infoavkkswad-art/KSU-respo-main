"""
KAWAD SWAD
INITIAL FULFILMENT RULES

First configured local/manual PIN:
    451225

All other valid Indian PINs remain SHIPPING
until a Kawad Swad rule is explicitly created.
"""

import asyncio
import os

from motor.motor_asyncio import AsyncIOMotorClient


MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb://localhost:27017",
)

MONGODB_DATABASE = os.getenv(
    "MONGODB_DATABASE",
    "kawad_swad_db",
)


INITIAL_RULES = [
    {
        "pincode": "451225",
        "fulfillmentType": "MANUAL",
        "shippingCharge": 0,
        "active": True,
    },
]


async def main():

    client = AsyncIOMotorClient(
        MONGODB_URI,
        serverSelectionTimeoutMS=10000,
    )

    db = client[
        MONGODB_DATABASE
    ]

    pin_collection = db[
        "pincodes"
    ]

    rules_collection = db[
        "fulfillment_rules"
    ]

    try:

        for rule in INITIAL_RULES:

            pin = rule[
                "pincode"
            ]

            exists = (
                await pin_collection.find_one(
                    {
                        "pincode": pin
                    }
                )
            )

            if not exists:

                raise RuntimeError(
                    f"PIN {pin} is not present "
                    "in the imported India PIN directory."
                )

            await rules_collection.update_one(
                {
                    "pincode": pin
                },
                {
                    "$set": rule
                },
                upsert=True,
            )

            print(
                f"Configured {pin} → "
                f"{rule['fulfillmentType']}"
            )

        print(
            "Initial Kawad Swad fulfilment rules "
            "configured successfully."
        )

    finally:

        client.close()


if __name__ == "__main__":

    asyncio.run(
        main()
    )
