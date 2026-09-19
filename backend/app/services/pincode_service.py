"""
KAWAD SWAD
PINCODE + FULFILMENT SERVICE

Stage 2.4.1

Responsibilities:
- Validate Indian PIN codes.
- Resolve postal-office information from MongoDB.
- Resolve Kawad Swad fulfilment rules.
- Keep postal data separate from business rules.

IMPORTANT:
The India PIN CSV is NOT imported during a customer request.
The CSV must be imported once using:

    backend/scripts/import_pincodes.py

Checkout requests perform MongoDB lookups only.
"""

from typing import Optional

from fastapi import HTTPException

from ..database import get_database

from ..models.fulfillment import (
    FulfillmentType,
    PincodeLookupResponse,
    FulfillmentQuote,
)


# ============================================================
# INPUT NORMALIZATION
# ============================================================

def normalize_pincode(
    pincode: str,
) -> str:

    clean = (
        str(pincode)
        .strip()
    )

    if (
        len(clean) != 6
        or not clean.isdigit()
        or clean.startswith("0")
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Please enter a valid 6-digit PIN code."
            ),
        )

    return clean


# ============================================================
# LOOKUP INDIA PIN DIRECTORY
# ============================================================

async def lookup_pincode(
    pincode: str,
) -> PincodeLookupResponse:

    clean_pincode = normalize_pincode(
        pincode
    )

    db = get_database()

    collection = db[
        "pincodes"
    ]

    # IMPORTANT:
    # Do not import the CSV here.
    # Customer requests must only query the indexed MongoDB
    # directory prepared by the one-time importer.
    record = await collection.find_one(
        {
            "pincode":
                clean_pincode
        },
        {
            "_id": 0,
            "pincode": 1,
            "officeName": 1,
            "districtName": 1,
            "stateName": 1,
            "deliveryStatus": 1,
        },
    )

    if not record:

        return PincodeLookupResponse(
            valid=False,
            pincode=clean_pincode,
            message="PIN code not found.",
        )

    return PincodeLookupResponse(
        valid=True,
        pincode=clean_pincode,
        officeName=record.get(
            "officeName"
        ),
        districtName=record.get(
            "districtName"
        ),
        stateName=record.get(
            "stateName"
        ),
        deliveryStatus=record.get(
            "deliveryStatus"
        ),
    )


# ============================================================
# LOOKUP KAWAD SWAD RULE
# ============================================================

async def lookup_fulfillment_rule(
    pincode: str,
) -> Optional[dict]:

    clean_pincode = normalize_pincode(
        pincode
    )

    db = get_database()

    collection = db[
        "fulfillment_rules"
    ]

    rule = await collection.find_one(
        {
            "pincode":
                clean_pincode,

            "active":
                True,
        },
        {
            "_id": 0,
        },
    )

    return rule


# ============================================================
# COMPLETE FULFILMENT QUOTE
# ============================================================

async def get_fulfillment_quote(
    pincode: str,
) -> FulfillmentQuote:

    clean_pincode = normalize_pincode(
        pincode
    )

    pin_record = (
        await lookup_pincode(
            clean_pincode
        )
    )

    if not pin_record.valid:

        return FulfillmentQuote(
            validPincode=False,
            pincode=clean_pincode,
            fulfillmentType=None,
            shippingCharge=0,
            message=(
                "We could not verify this PIN code."
            ),
        )

    # --------------------------------------------------------
    # IMPORTANT BUSINESS RULE
    #
    # A valid Indian PIN defaults to SHIPPING.
    #
    # Only an active Kawad Swad rule can make it MANUAL.
    #
    # This prevents an accidental zero-shipping price from
    # being granted to an unconfigured PIN.
    # --------------------------------------------------------

    rule = (
        await lookup_fulfillment_rule(
            clean_pincode
        )
    )

    if not rule:

        return FulfillmentQuote(
            validPincode=True,
            pincode=clean_pincode,
            fulfillmentType=(
                FulfillmentType.SHIPPING
            ),
            shippingCharge=0,
            officeName=(
                pin_record.officeName
            ),
            districtName=(
                pin_record.districtName
            ),
            stateName=(
                pin_record.stateName
            ),
            message=(
                "Delivery available."
            ),
        )

    fulfillment_value = (
        rule.get(
            "fulfillmentType"
        )
    )

    try:

        fulfillment_type = (
            FulfillmentType(
                fulfillment_value
            )
        )

    except ValueError:

        raise HTTPException(
            status_code=500,
            detail=(
                "Invalid Kawad Swad fulfilment rule."
            ),
        )

    shipping_charge = int(
        rule.get(
            "shippingCharge",
            0,
        )
    )

    return FulfillmentQuote(
        validPincode=True,
        pincode=clean_pincode,
        fulfillmentType=(
            fulfillment_type
        ),
        shippingCharge=shipping_charge,
        officeName=(
            pin_record.officeName
        ),
        districtName=(
            pin_record.districtName
        ),
        stateName=(
            pin_record.stateName
        ),
        message=(
            "Delivery available."
        ),
    )


# ============================================================
# CREATE / UPDATE FULFILMENT RULE
# ============================================================

async def set_fulfillment_rule(
    pincode: str,
    fulfillment_type: FulfillmentType,
    shipping_charge: int,
    active: bool = True,
) -> dict:

    clean_pincode = normalize_pincode(
        pincode
    )

    if shipping_charge < 0:

        raise HTTPException(
            status_code=400,
            detail=(
                "Shipping charge cannot be negative."
            ),
        )

    db = get_database()

    pin_collection = db[
        "pincodes"
    ]

    pin_exists = await pin_collection.find_one(
        {
            "pincode":
                clean_pincode
        },
        {
            "_id": 1,
        },
    )

    if not pin_exists:

        raise HTTPException(
            status_code=400,
            detail=(
                f"PIN {clean_pincode} "
                "does not exist in the India PIN directory."
            ),
        )

    collection = db[
        "fulfillment_rules"
    ]

    rule = {
        "pincode":
            clean_pincode,

        "fulfillmentType":
            fulfillment_type.value,

        "shippingCharge":
            int(shipping_charge),

        "active":
            bool(active),
    }

    await collection.update_one(
        {
            "pincode":
                clean_pincode
        },
        {
            "$set":
                rule
        },
        upsert=True,
    )

    return rule
