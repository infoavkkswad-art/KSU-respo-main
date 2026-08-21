"""
KAWAD SWAD
PINCODE + FULFILMENT SERVICE

Stage 2.7

Responsibilities:
- Validate Indian PIN codes.
- Maintain the India PIN directory in MongoDB.
- Resolve postal-office information.
- Resolve Kawad Swad fulfilment rules.
- Keep postal data separate from business rules.

FULFILMENT RULE
---------------

1. Explicit active MongoDB fulfilment rule wins.
2. If no MongoDB rule exists, approved MANUAL PIN list is checked.
3. If the PIN is not in the MANUAL list, it defaults to SHIPPING.
4. MANUAL always has ₹0 shipping.
5. Standard SHIPPING amount is resolved later by pricing_service
   from the commercial SKU/pack-size master.

This service decides MANUAL vs SHIPPING.
pricing_service decides the commercial shipping amount.
"""

from __future__ import annotations

import csv
from pathlib import Path
from typing import Optional

from fastapi import HTTPException

from ..database import get_database

from ..models.fulfillment import (
    FulfillmentType,
    PincodeLookupResponse,
    FulfillmentQuote,
)


# ============================================================
# CONFIGURATION
# ============================================================

PINCODE_CSV_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "pincode"
    / "all-india-pincode-html-csv.csv"
)

PINCODE_COLLECTION_NAME = "pincodes"

PINCODE_IMPORT_META_COLLECTION = (
    "pincode_import_meta"
)

IMPORT_BATCH_SIZE = 2000


# ============================================================
# APPROVED MANUAL / LOCAL PIN CODES
# ============================================================

DEFAULT_MANUAL_PINCODES = {
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
}


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
                "Please enter a valid 6-digit "
                "Indian PIN code."
            ),
        )

    return clean


# ============================================================
# CSV FIELD NORMALIZATION
# ============================================================

def _normalized_header(
    value: str,
) -> str:

    return (
        str(value or "")
        .strip()
        .lower()
        .replace(" ", "")
        .replace("_", "")
    )


def _get_csv_value(
    row: dict,
    *possible_names: str,
) -> str:

    normalized_row = {
        _normalized_header(key): value
        for key, value in row.items()
    }

    for name in possible_names:

        value = normalized_row.get(
            _normalized_header(name)
        )

        if value is not None:

            return str(
                value
            ).strip()

    return ""


# ============================================================
# IMPORT INDIA PIN DIRECTORY
# ============================================================

async def ensure_pincode_directory_imported() -> None:
    """
    Import the repository PIN CSV into MongoDB only when
    the PIN collection is empty.

    Existing MongoDB data is not re-imported on every request.
    """

    db = get_database()

    collection = db[
        PINCODE_COLLECTION_NAME
    ]

    existing_count = (
        await collection.count_documents(
            {}
        )
    )

    if existing_count > 0:
        return

    if not PINCODE_CSV_PATH.exists():

        raise HTTPException(
            status_code=500,
            detail=(
                "India PIN directory is not "
                "installed on the server."
            ),
        )

    meta_collection = db[
        PINCODE_IMPORT_META_COLLECTION
    ]

    meta = await meta_collection.find_one(
        {
            "_id":
                "india_pincode_directory",

            "status":
                "complete",
        }
    )

    if meta:
        return

    batch = []

    try:

        with PINCODE_CSV_PATH.open(
            "r",
            encoding="utf-8-sig",
            newline="",
        ) as csv_file:

            reader = csv.DictReader(
                csv_file
            )

            if not reader.fieldnames:

                raise RuntimeError(
                    "PIN directory CSV has no header."
                )

            for row in reader:

                raw_pincode = _get_csv_value(
                    row,
                    "pincode",
                    "PINCODE",
                    "pin",
                )

                clean_pincode = (
                    raw_pincode
                    .strip()
                    .split(".")[0]
                    .zfill(6)
                )

                if (
                    len(clean_pincode) != 6
                    or not clean_pincode.isdigit()
                    or clean_pincode.startswith("0")
                ):
                    continue

                document = {
                    "pincode":
                        clean_pincode,

                    "officeName":
                        _get_csv_value(
                            row,
                            "officename",
                            "officeName",
                        ),

                    "officeType":
                        _get_csv_value(
                            row,
                            "officeType",
                            "officetype",
                        ),

                    "deliveryStatus":
                        _get_csv_value(
                            row,
                            "Deliverystatus",
                            "deliveryStatus",
                            "delivery",
                        ),

                    "divisionName":
                        _get_csv_value(
                            row,
                            "divisionname",
                            "divisionName",
                        ),

                    "regionName":
                        _get_csv_value(
                            row,
                            "regionname",
                            "regionName",
                        ),

                    "circleName":
                        _get_csv_value(
                            row,
                            "circlename",
                            "circleName",
                        ),

                    "taluk":
                        _get_csv_value(
                            row,
                            "Taluk",
                            "taluk",
                        ),

                    "districtName":
                        _get_csv_value(
                            row,
                            "Districtname",
                            "districtName",
                            "district",
                        ),

                    "stateName":
                        _get_csv_value(
                            row,
                            "statename",
                            "stateName",
                            "state",
                        ),
                }

                batch.append(
                    document
                )

                if (
                    len(batch)
                    >= IMPORT_BATCH_SIZE
                ):

                    await collection.insert_many(
                        batch,
                        ordered=False,
                    )

                    batch = []

            if batch:

                await collection.insert_many(
                    batch,
                    ordered=False,
                )

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to import the India "
                "PIN directory."
            ),
        ) from exc

    imported_count = (
        await collection.count_documents(
            {}
        )
    )

    if imported_count <= 0:

        raise HTTPException(
            status_code=500,
            detail=(
                "India PIN directory import "
                "completed with no PIN records."
            ),
        )

    try:

        await collection.create_index(
            "pincode"
        )

    except Exception:
        pass

    await meta_collection.update_one(
        {
            "_id":
                "india_pincode_directory",
        },
        {
            "$set": {
                "status":
                    "complete",

                "source":
                    str(
                        PINCODE_CSV_PATH
                    ),

                "recordCount":
                    imported_count,
            }
        },
        upsert=True,
    )


# ============================================================
# LOOKUP INDIA PIN DIRECTORY
# ============================================================

async def lookup_pincode(
    pincode: str,
) -> PincodeLookupResponse:

    clean_pincode = normalize_pincode(
        pincode
    )

    await ensure_pincode_directory_imported()

    db = get_database()

    collection = db[
        PINCODE_COLLECTION_NAME
    ]

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
            message=(
                "PIN code not found."
            ),
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
# LOOKUP KAWAD SWAD FULFILMENT RULE
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
    # EXPLICIT DATABASE RULE HAS PRIORITY
    # --------------------------------------------------------

    rule = (
        await lookup_fulfillment_rule(
            clean_pincode
        )
    )

    if not rule:

        # ----------------------------------------------------
        # APPROVED LOCAL / MANUAL PIN
        # ----------------------------------------------------

        if (
            clean_pincode
            in DEFAULT_MANUAL_PINCODES
        ):

            return FulfillmentQuote(
                validPincode=True,
                pincode=clean_pincode,
                fulfillmentType=(
                    FulfillmentType.MANUAL
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
                    "Local fulfilment available."
                ),
            )

        # ----------------------------------------------------
        # NORMAL SHIPPING PIN
        # ----------------------------------------------------

        return FulfillmentQuote(
            validPincode=True,
            pincode=clean_pincode,
            fulfillmentType=(
                FulfillmentType.SHIPPING
            ),

            # Commercial shipping is resolved by
            # pricing_service from the SKU master.
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

    # --------------------------------------------------------
    # DATABASE RULE
    # --------------------------------------------------------

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

    except ValueError as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Invalid Kawad Swad "
                "fulfilment rule."
            ),
        ) from exc

    try:

        shipping_charge = int(
            rule.get(
                "shippingCharge",
                0,
            )
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Invalid fulfilment "
                "shipping charge."
            ),
        ) from exc

    if shipping_charge < 0:

        raise HTTPException(
            status_code=500,
            detail=(
                "Fulfilment shipping charge "
                "cannot be negative."
            ),
        )

    # MANUAL is always free.
    if (
        fulfillment_type
        == FulfillmentType.MANUAL
    ):
        shipping_charge = 0

    return FulfillmentQuote(
        validPincode=True,

        pincode=clean_pincode,

        fulfillmentType=(
            fulfillment_type
        ),

        shippingCharge=(
            shipping_charge
        ),

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
            "Local fulfilment available."
            if fulfillment_type
            == FulfillmentType.MANUAL
            else "Delivery available."
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
                "Shipping charge cannot "
                "be negative."
            ),
        )

    # MANUAL is always ₹0.
    if (
        fulfillment_type
        == FulfillmentType.MANUAL
    ):
        shipping_charge = 0

    await ensure_pincode_directory_imported()

    db = get_database()

    pin_collection = db[
        PINCODE_COLLECTION_NAME
    ]

    pin_exists = (
        await pin_collection.find_one(
            {
                "pincode":
                    clean_pincode
            },
            {
                "_id": 1,
            },
        )
    )

    if not pin_exists:

        raise HTTPException(
            status_code=400,
            detail=(
                f"PIN {clean_pincode} "
                "does not exist in the "
                "India PIN directory."
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
            int(
                shipping_charge
            ),

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
