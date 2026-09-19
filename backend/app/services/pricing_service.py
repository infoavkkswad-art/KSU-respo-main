"""
KAWAD SWAD
SERVER-SIDE PRICING / FULFILMENT QUOTE SERVICE

Commercial rule:

- websitePrice is PRODUCT SELLING PRICE ONLY.
- Shipping is India Post Parcel CONTRACTUAL tariff (PIN + billed weight).
- Free shipping (₹0) only for the approved PIN list.
- Payable = product subtotal + shipping.
- Frontend prices are NEVER trusted.
"""

from typing import Any, Dict, List, Tuple

from fastapi import HTTPException

from ..models.product import find_sku_in_backend

from .pincode_service import (
    lookup_pincode,
)

from .parcel_tariff import (
    INVALID_PIN_DETAIL,
    billed_weight_grams,
    calculate_shipping_charge,
    is_free_shipping_pin,
)


# ==============================================================
# NORMALIZATION
# ==============================================================

def normalize_sku(
    sku: str,
) -> str:
    clean = (
        str(sku)
        .strip()
        .upper()
    )

    if not clean:
        raise HTTPException(
            status_code=400,
            detail="SKU cannot be empty.",
        )

    return clean


def normalize_quantity(
    quantity: Any,
    sku: str,
) -> int:
    try:
        value = int(quantity)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid quantity for SKU {sku}."
            ),
        )

    if value <= 0:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Quantity must be greater than zero "
                f"for SKU {sku}."
            ),
        )

    return value


def normalize_money(
    value: Any,
    field_name: str,
    sku: str,
) -> float:
    try:
        amount = float(value)

    except Exception:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Invalid {field_name} for SKU {sku}."
            ),
        )

    if (
        amount < 0
        or not amount == amount
        or amount == float("inf")
        or amount == float("-inf")
    ):
        raise HTTPException(
            status_code=500,
            detail=(
                f"Invalid {field_name} for SKU {sku}."
            ),
        )

    return round(
        amount,
        2,
    )


# ==============================================================
# BACKEND COMMERCIAL PRICE RESOLUTION
# ==============================================================

def get_backend_prices(
    sku_code: str,
    sku_obj: Dict[str, Any],
) -> Tuple[
    float,
    float,
]:
    """
    Resolve:

        website_selling_price
        mrp

    IMPORTANT:

    websitePrice is now the BASE WEBSITE SELLING PRICE.

    It must NOT be interpreted as:

        selling price + shipping

    Shipping is resolved separately by the fulfilment layer.
    """

    website_price_raw = (
        sku_obj.get(
            "websitePrice"
        )
    )

    if website_price_raw is None:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Backend website price is missing "
                f"for SKU {sku_code}."
            ),
        )

    website_price = normalize_money(
        website_price_raw,
        "website price",
        sku_code,
    )

    if website_price < 0:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Backend website price is invalid "
                f"for SKU {sku_code}."
            ),
        )

    mrp_raw = sku_obj.get(
        "mrp"
    )

    if mrp_raw is None:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Backend MRP is missing "
                f"for SKU {sku_code}."
            ),
        )

    mrp = normalize_money(
        mrp_raw,
        "MRP",
        sku_code,
    )

    return (
        website_price,
        mrp,
    )


# ==============================================================
# MANUAL PRICE VALIDATION
# ==============================================================

def validate_manual_price(
    sku_code: str,
    pack_size: int,
    selling_price: float,
):
    """
    Manual fulfilment uses the normal approved website
    selling price.

    The previous Stage 2.1 restriction:

        200g > ₹60 and < ₹75

    has been REMOVED.

    This is required because the approved current website
    selling prices include:

        ₹55
        ₹60
        ₹65
        ₹70

    for 200g products.
    """

    if selling_price < 0:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Invalid selling price for SKU "
                f"{sku_code}."
            ),
        )


# ==============================================================
# CART QUOTE
# ==============================================================

async def calculate_cart_quote(
    pincode: str,
    items: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Calculate the complete server-side cart quote.

    IMPORTANT:

    Product price:
        backend websitePrice (product selling only)

    Shipping:
        approved free PIN → ₹0
        Madhya Pradesh → Parcel contractual Within State
        otherwise → fail closed (no Zone/Metro guess)

    No frontend price is accepted.
    """

    if not items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty.",
        )

    if not str(pincode or "").strip():
        raise HTTPException(
            status_code=400,
            detail=INVALID_PIN_DETAIL,
        )

    pin_record = await lookup_pincode(
        pincode
    )

    if not pin_record.valid:
        raise HTTPException(
            status_code=400,
            detail=INVALID_PIN_DETAIL,
        )

    is_free_pin = is_free_shipping_pin(
        pin_record.pincode
    )

    fulfillment_type = (
        "MANUAL"
        if is_free_pin
        else "SHIPPING"
    )

    # ----------------------------------------------------------
    # ORDER-LEVEL TOTALS
    # ----------------------------------------------------------

    subtotal = 0.0

    item_quotes: List[
        Dict[str, Any]
    ] = []

    # ----------------------------------------------------------
    # SKU CALCULATION
    # ----------------------------------------------------------

    for raw_item in items:

        if not isinstance(
            raw_item,
            dict,
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid cart item."
                ),
            )

        raw_sku = raw_item.get(
            "sku"
        )

        sku_code = normalize_sku(
            raw_sku
        )

        quantity = normalize_quantity(
            raw_item.get(
                "quantity"
            ),
            sku_code,
        )

        family, sku_obj = (
            find_sku_in_backend(
                sku_code
            )
        )

        if not family or not sku_obj:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Invalid or unavailable SKU: "
                    f"{sku_code}"
                ),
            )

        if not bool(
            sku_obj.get(
                "available",
                True,
            )
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"SKU {sku_code} is currently unavailable."
                ),
            )

        # ------------------------------------------------------
        # AUTHORITATIVE PRODUCT PRICE
        # ------------------------------------------------------

        (
            selling_price,
            mrp,
        ) = get_backend_prices(
            sku_code,
            sku_obj,
        )

        # ------------------------------------------------------
        # PACK SIZE
        # ------------------------------------------------------

        try:
            pack_size = int(
                sku_obj.get(
                    "packSize",
                    0,
                )
            )

        except Exception:
            pack_size = 0

        if pack_size <= 0:
            raise HTTPException(
                status_code=500,
                detail=(
                    f"Invalid pack size for SKU "
                    f"{sku_code}."
                ),
            )

        unit_price = selling_price

        validate_manual_price(
            sku_code,
            pack_size,
            selling_price,
        )

        # ------------------------------------------------------
        # ITEM SUBTOTAL
        # ------------------------------------------------------

        item_subtotal = round(
            unit_price *
            quantity,
            2,
        )

        if item_subtotal < 0:
            raise HTTPException(
                status_code=500,
                detail=(
                    f"Invalid item subtotal for SKU "
                    f"{sku_code}."
                ),
            )

        subtotal += (
            item_subtotal
        )

        item_quotes.append(
            {
                "sku":
                    sku_code,

                "quantity":
                    quantity,

                # BASE WEBSITE SELLING PRICE.
                #
                # Shipping is kept separate.
                "unitPrice":
                    unit_price,

                "itemSubtotal":
                    item_subtotal,

                # Shipping is resolved below at order level.
                #
                # We do NOT multiply the order shipping
                # by every SKU.
                "shipping":
                    0.0,

                "productName":
                    family.get(
                        "name",
                        "Kawad Swad Product",
                    ),

                "packSize":
                    pack_size,

                "mrp":
                    mrp,
            }
        )

    # ----------------------------------------------------------
    # ORDER SHIPPING
    # ----------------------------------------------------------

    weight_items = [
        {
            "packSize": item["packSize"],
            "quantity": item["quantity"],
        }
        for item in item_quotes
    ]

    billed_grams = billed_weight_grams(
        weight_items
    )

    shipping_quote = calculate_shipping_charge(
        pin_record.pincode,
        billed_grams,
        pin_record.stateName,
    )

    shipping = float(
        shipping_quote["shippingCharge"]
    )

    pricing_mode = (
        "FREE"
        if is_free_pin
        else "PARCEL_CONTRACTUAL"
    )

    # ----------------------------------------------------------
    # FINAL TOTAL
    # ----------------------------------------------------------

    subtotal = round(
        subtotal,
        2,
    )

    shipping = round(
        shipping,
        2,
    )

    total = round(
        subtotal +
        shipping,
        2,
    )

    if total <= 0:
        raise HTTPException(
            status_code=400,
            detail=(
                "Order total must be greater than zero."
            ),
        )

    # ----------------------------------------------------------
    # RETURN SERVER QUOTE
    # ----------------------------------------------------------

    return {
        "success":
            True,

        "pincode":
            pin_record.pincode,

        "pincodeValid":
            True,

        "fulfillmentType":
            fulfillment_type,

        "shippingRequired":
            not is_free_pin,

        "pricingMode":
            pricing_mode,

        "shippingZone":
            shipping_quote["zone"],

        "billedWeightGrams":
            billed_grams,

        "shipping":
            shipping,

        "subtotal":
            subtotal,

        "total":
            total,

        "location": {
            "officeName":
                pin_record.officeName,

            "districtName":
                pin_record.districtName,

            "stateName":
                pin_record.stateName,
        },

        "items":
            item_quotes,
    }
