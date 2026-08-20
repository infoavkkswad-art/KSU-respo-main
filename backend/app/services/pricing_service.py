"""
KAWAD SWAD
SERVER-SIDE PRICING / FULFILMENT QUOTE SERVICE

Stage 2.3

Responsibilities:
- Resolve the customer's PIN through the existing PIN/fulfilment engine.
- Resolve every SKU from the backend catalogue.
- Determine MANUAL vs SHIPPING server-side.
- Calculate the lowest/manual product price for MANUAL fulfilment.
- Preserve the existing website price + shipping model for SHIPPING.
- Return a quote that the frontend can display.
- Never trust a frontend-supplied price.

IMPORTANT:
This service is a quote engine only.
The order/payment service will later call the same calculation again
when creating the real paid order, so the Razorpay amount remains
backend-authoritative.
"""

from typing import Any, Dict, List

from fastapi import HTTPException

from ..models.product import find_sku_in_backend
from .pincode_service import get_fulfillment_quote


# ==============================================================
# NORMALIZATION
# ==============================================================

def normalize_sku(sku: str) -> str:
    clean = str(sku).strip().upper()

    if not clean:
        raise HTTPException(
            status_code=400,
            detail="SKU cannot be empty.",
        )

    return clean


def normalize_quantity(quantity: Any, sku: str) -> int:
    try:
        value = int(quantity)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid quantity for SKU {sku}.",
        )

    if value <= 0:
        raise HTTPException(
            status_code=400,
            detail=f"Quantity must be greater than zero for SKU {sku}.",
        )

    return value


# ==============================================================
# BACKEND SKU COMMERCIAL DATA
# ==============================================================

def get_backend_prices(
    sku_code: str,
    sku_obj: Dict[str, Any],
):
    """
    Resolve the existing backend commercial fields.

    Current backend architecture exposes websitePrice as the final
    customer-facing price and shipping as the shipping component.

    Therefore:
        selling_price = websitePrice - shipping

    We calculate this rather than creating a second backend price table.
    """

    try:
        website_price = float(
            sku_obj["websitePrice"]
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Backend website price is missing for SKU {sku_code}."
            ),
        )

    try:
        shipping = float(
            sku_obj.get(
                "shipping",
                0,
            )
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Backend shipping value is invalid for SKU {sku_code}."
            ),
        )

    if website_price < 0:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Backend website price is invalid for SKU {sku_code}."
            ),
        )

    if shipping < 0:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Backend shipping value is invalid for SKU {sku_code}."
            ),
        )

    selling_price = round(
        website_price - shipping,
        2,
    )

    if selling_price < 0:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Backend selling price resolved below zero for SKU {sku_code}."
            ),
        )

    return (
        selling_price,
        shipping,
        website_price,
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
    Apply the current Stage 2.1 business rule.

    For 200g:
        selling price must be > ₹60 and < ₹75.

    Other pack sizes are not restricted by this specific rule yet.
    """

    if pack_size != 200:
        return

    if not (
        selling_price > 60
        and selling_price < 75
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"SKU {sku_code} cannot currently be sold "
                f"through MANUAL fulfilment because its 200g "
                f"price is ₹{selling_price:.2f}. "
                "The approved range is greater than ₹60 and less than ₹75."
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
    Calculate a complete server-side cart quote.

    Input:
        pincode
        [
            {"sku": "...", "quantity": 1}
        ]

    Output:
        fulfillmentType
        shippingRequired
        pricingMode
        pincode information
        item prices
        subtotal
        shipping
        total

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

    fulfillment = await get_fulfillment_quote(
        pincode
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

    is_manual = (
        fulfillment_type == "MANUAL"
    )

    # ----------------------------------------------------------
    # CALCULATION
    # ----------------------------------------------------------

    subtotal = 0.0

    shipping = 0.0

    item_quotes = []

    for raw_item in items:

        raw_sku = raw_item.get(
            "sku"
        )

        sku_code = normalize_sku(
            raw_sku
        )

        quantity = normalize_quantity(
            raw_item.get("quantity"),
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
                    f"Invalid or unavailable SKU: {sku_code}"
                ),
            )

        # ------------------------------------------------------
        # Availability
        # ------------------------------------------------------

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
        # Existing backend commercial values
        # ------------------------------------------------------

        (
            selling_price,
            sku_shipping,
            website_price,
        ) = get_backend_prices(
            sku_code,
            sku_obj,
        )

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
                    f"Invalid pack size for SKU {sku_code}."
                ),
            )

        # ------------------------------------------------------
        # MANUAL
        # ------------------------------------------------------

        if is_manual:

            validate_manual_price(
                sku_code,
                pack_size,
                selling_price,
            )

            unit_price = selling_price

            item_shipping = 0.0

            pricing_mode = "LOCAL"

        # ------------------------------------------------------
        # SHIPPING
        # ------------------------------------------------------

        else:

            unit_price = website_price

            item_shipping = sku_shipping

            pricing_mode = "STANDARD"

        # ------------------------------------------------------
        # ITEM TOTAL
        # ------------------------------------------------------

        item_subtotal = round(
            unit_price * quantity,
            2,
        )

        subtotal += item_subtotal

        # ------------------------------------------------------
        # Preserve the existing shipping rule:
        #
        # Use the largest applicable SKU shipping amount.
        #
        # This is intentionally NOT changed in Stage 2.3.
        # ------------------------------------------------------

        shipping = max(
            shipping,
            item_shipping * quantity,
        )

        item_quotes.append(
            {
                "sku": sku_code,

                "quantity": quantity,

                "unitPrice": unit_price,

                "itemSubtotal": item_subtotal,

                "shipping": round(
                    item_shipping * quantity,
                    2,
                ),

                "productName": family.get(
                    "name",
                    "Kawad Swad Product",
                ),

                "packSize": pack_size,

                "mrp": sku_obj.get(
                    "mrp"
                ),
            }
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
        subtotal + shipping,
        2,
    )

    if total <= 0:
        raise HTTPException(
            status_code=400,
            detail="Order total must be greater than zero.",
        )

    return {
        "success": True,

        "pincode": fulfillment.pincode,

        "pincodeValid": True,

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
