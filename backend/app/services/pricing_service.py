"""
KAWAD SWAD
SERVER-SIDE PRICING / FULFILMENT QUOTE SERVICE

Stage 2.6

Commercial rule:

- The website selling price is the BASE PRODUCT PRICE.
- Shipping is NOT embedded in the product price.

MANUAL fulfilment:
    subtotal = website selling price
    shipping = ₹0
    total = subtotal

SHIPPING fulfilment:
    subtotal = website selling price
    shipping = fulfilment-resolved shipping
    total = subtotal + shipping

IMPORTANT:
- Frontend prices are NEVER trusted.
- Backend product data is authoritative.
- Shipping is supplied by the fulfilment layer.
- This service must NOT invent or subtract shipping from product prices.
"""

from typing import Any, Dict, List, Tuple

from fastapi import HTTPException

from ..models.product import find_sku_in_backend

from .pincode_service import (
    get_fulfillment_quote,
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

    websitePrice is the BASE WEBSITE SELLING PRICE.

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

    No artificial minimum or maximum price is imposed here.
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
# SHIPPING VALIDATION
# ==============================================================

def resolve_shipping_amount(
    fulfillment: Any,
    is_manual: bool,
) -> float:
    """
    Resolve shipping from the fulfilment quote.

    MANUAL:
        Always ₹0.

    SHIPPING:
        Use the shipping amount supplied by the
        fulfilment layer.

    IMPORTANT:
        This function does NOT use a hard-coded shipping
        amount such as ₹47.
    """

    if is_manual:
        return 0.0

    shipping_raw = getattr(
        fulfillment,
        "shippingCharge",
        0,
    )

    try:
        shipping = float(
            shipping_raw
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail=(
                "Invalid shipping amount returned "
                "by fulfilment service."
            ),
        )

    if (
        shipping < 0
        or shipping != shipping
        or shipping == float("inf")
        or shipping == float("-inf")
    ):
        raise HTTPException(
            status_code=500,
            detail=(
                "Invalid shipping amount returned "
                "by fulfilment service."
            ),
        )

    return round(
        shipping,
        2,
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
        backend websitePrice

    MANUAL:
        product subtotal + ₹0

    SHIPPING:
        product subtotal + fulfilment shipping

    No frontend price is accepted.
    """

    if not items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty.",
        )

    # ----------------------------------------------------------
    # PIN / FULFILMENT
    # ----------------------------------------------------------

    fulfillment = (
        await get_fulfillment_quote(
            pincode
        )
    )

    if not fulfillment.validPincode:
        raise HTTPException(
            status_code=400,
            detail=(
                "Please enter a valid Indian PIN code."
            ),
        )

    fulfillment_type = (
        fulfillment.fulfillmentType.value
        if fulfillment.fulfillmentType
        else "SHIPPING"
    )

    if fulfillment_type not in (
        "MANUAL",
        "SHIPPING",
    ):
        raise HTTPException(
            status_code=500,
            detail=(
                "Invalid fulfilment type."
            ),
        )

    is_manual = (
        fulfillment_type ==
        "MANUAL"
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

        # ------------------------------------------------------
        # PRICING MODE
        # ------------------------------------------------------

        if is_manual:

            validate_manual_price(
                sku_code,
                pack_size,
                selling_price,
            )

            unit_price = (
                selling_price
            )

            pricing_mode = (
                "LOCAL"
            )

        else:

            unit_price = (
                selling_price
            )

            pricing_mode = (
                "STANDARD"
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
                # Shipping is kept separate.
                "unitPrice":
                    unit_price,

                "itemSubtotal":
                    item_subtotal,

                # Shipping is resolved at order level.
                # It is never multiplied by every SKU.
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

    shipping = resolve_shipping_amount(
        fulfillment,
        is_manual,
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
            fulfillment.pincode,

        "pincodeValid":
            True,

        "fulfillmentType":
            fulfillment_type,

        "shippingRequired":
            not is_manual,

        "pricingMode":
            pricing_mode,

        "shipping":
            shipping,

        "subtotal":
            subtotal,

        "total":
            total,

        "location": {
            "officeName":
                fulfillment.officeName,

            "districtName":
                fulfillment.districtName,

            "stateName":
                fulfillment.stateName,
        },

        "items":
            item_quotes,
    }
