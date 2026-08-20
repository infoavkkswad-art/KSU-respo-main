"""
KAWAD SWAD
PINCODE + FULFILMENT SERVICE

Responsibilities:
- Validate Indian PIN codes against the India PIN directory.
- Automatically import the repository CSV into MongoDB when the
  pincode collection is empty.
- Resolve postal-office information.
- Resolve Kawad Swad fulfilment rules.
- Keep postal data separate from business rules.

Important:
- The CSV is a DATA SOURCE, not a per-request lookup source.
- It is imported once into MongoDB and then MongoDB handles lookups.
- Existing fulfilment_rules remain the business-rule layer.
- 451225 is included as the initial local/manual PIN because this is
  the configured Kawad Swad local PIN for the current implementation.
  Additional manual PINs should be added through fulfillment_rules.
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

# Repository location:
# backend/data/pincode/all-india-pincode-html-csv.csv
PINCODE_CSV_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "pincode"
    / "all-india-pincode-html-csv.csv"
)

PINCODE_COLLECTION_NAME = "pincodes"
PINCODE_IMPORT_META_COLLECTION = "pincode_import_meta"

# Initial Kawad Swad local/manual PIN.
# This can later be moved entirely to fulfillment_rules.
DEFAULT_MANUAL_PINCODES = {
    "451225",
}

IMPORT_BATCH_SIZE = 2000


# ============================================================
# INPUT NORMALIZATION
# ============================================================

def normalize_pincode(
    pincode: str,
) -> str:

    clean = str(
        pincode
    ).strip()

    if (
        len(clean) != 6
        or not clean.isdigit()
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Please enter a valid 6-digit PIN code."
            ),
        )

    # Indian PINs do not start with zero.
    if clean[0] == "0":
        raise HTTPException(
            status_code=400,
            detail=(
                "Please enter a valid Indian PIN code."
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
    Ensure the repository CSV exists in MongoDB.

    This runs safely from the lookup path:
    - If MongoDB already contains PIN records, nothing happens.
    - If the collection is empty, the CSV is imported in batches.
    - A metadata document records the successful import.
    """

    db = get_database()

    collection = db[
        PINCODE_COLLECTION_NAME
    ]

    existing_count = await collection.count_documents(
        {}
    )

    if existing_count > 0:
        return

    if not PINCODE_CSV_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=(
                "India PIN directory is not installed on the server."
            ),
        )

    # Prevent repeated import after a completed import.
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
                    or clean_pincode[0] == "0"
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

                if len(batch) >= IMPORT_BATCH_SIZE:
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
                "Unable to import the India PIN directory."
            ),
        ) from exc

    imported_count = await collection.count_documents(
        {}
    )

    if imported_count <= 0:
        raise HTTPException(
            status_code=500,
            detail=(
                "India PIN directory import completed with no PIN records."
            ),
        )

    # Index the lookup field after import.
    try:
        await collection.create_index(
            "pincode"
        )
    except Exception:
        # Index creation is helpful but should not make an already
        # imported directory unusable.
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

    pin_record = await lookup_pincode(
        clean_pincode
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
    # BUSINESS RULE
    #
    # Explicit MongoDB rule wins.
    # If no rule exists, the configured local PIN list is checked.
    # Everything else defaults safely to SHIPPING.
    # --------------------------------------------------------

    rule = await lookup_fulfillment_rule(
        clean_pincode
    )

    if not rule:

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

    fulfillment_value = rule.get(
        "fulfillmentType"
    )

    try:
        fulfillment_type = FulfillmentType(
            fulfillment_value
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "Invalid Kawad Swad fulfilment rule."
            ),
        ) from exc

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
                "Shipping charge cannot be negative."
            ),
        )

    # Ensure the PIN directory is available before validating the PIN.
    await ensure_pincode_directory_imported()

    db = get_database()

    pin_collection = db[
        PINCODE_COLLECTION_NAME
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
