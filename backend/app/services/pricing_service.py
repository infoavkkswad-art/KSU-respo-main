"""
KAWAD SWAD
SERVER-SIDE PRICING / FULFILMENT QUOTE SERVICE

Stage 2.5

Commercial rule:
- sales-config.ts stores:
    sellingPrice + shipping = websitePrice
- The customer-facing ProductService intentionally exposes shipping: 0
  because websitePrice is already final.
- Therefore the backend quote service must NOT read shipping from
  ProductService.
- For the current active sales master, the shipping component is ₹47
  for every active SKU.
- SHIPPING order:
    subtotal = sellingPrice
    shipping = ₹47
    total = websitePrice
- MANUAL order:
    subtotal = sellingPrice
    shipping = ₹0
    total = sellingPrice

The backend is authoritative. Frontend prices are never trusted.
"""

from typing import Any, Dict, List, Tuple

from fastapi import HTTPException

from ..models.product import find_sku_in_backend
from .pincode_service import get_fulfillment_quote


# ==============================================================
# COMMERCIAL MASTER BRIDGE
# ==============================================================

# Current active src/data/sales-config.ts uses ₹47 as the shipping
# component for all 43 active SKU records.
#
# We keep this value in one backend constant instead of reading the
# customer-facing `shipping: 0` field exposed by ProductService.
#
# If the commercial master changes later, update the backend bridge
# at the same time as the sales master and run the pricing validation.
STANDARD_SHIPPING_COMPONENT = 47.0


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
        value = int(
            quantity
        )

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


# ==============================================================
# BACKEND COMMERCIAL PRICE RESOLUTION
# ==============================================================

def get_backend_prices(
    sku_code: str,
    sku_obj: Dict[str, Any],
) -> Tuple[
    float,
    float,
    float,
]:
    """
    Resolve:

        selling_price
        shipping_component
        website_price

    IMPORTANT:

    ProductService deliberately exposes:
        shipping = 0
        freeShipping = true

    because websitePrice is already the final customer-facing price.

    Therefore that field MUST NOT be used to determine the actual
    shipping component here.

    Current commercial master:
        websitePrice = sellingPrice + ₹47
    """

    try:

        website_price = float(
            sku_obj["websitePrice"]
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Backend website price is missing "
                f"for SKU {sku_code}."
            ),
        )

    if (
        not website_price >= 0
    ):

        raise HTTPException(
            status_code=500,
            detail=(
                f"Backend website price is invalid "
                f"for SKU {sku_code}."
            ),
        )

    shipping_component = (
        STANDARD_SHIPPING_COMPONENT
    )

    selling_price = round(
        website_price -
        shipping_component,
        2,
    )

    if selling_price < 0:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Backend selling price resolved below zero "
                f"for SKU {sku_code}."
            ),
        )

    # Commercial integrity check:
    #
    # Current sales-config defines:
    # sellingPrice + shipping = websitePrice
    expected_website_price = round(
        selling_price +
        shipping_component,
        2,
    )

    if (
        expected_website_price !=
        round(
            website_price,
            2,
        )
    ):

        raise HTTPException(
            status_code=500,
            detail=(
                f"Commercial price mismatch for SKU "
                f"{sku_code}."
            ),
        )

    return (
        selling_price,
        shipping_component,
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
    Current Stage 2.1 rule:

    For 200g:
        selling price > ₹60
        selling price < ₹75

    Other pack sizes are not restricted by this specific rule.
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
                f"selling price is ₹{selling_price:.2f}. "
                "The approved range is greater than ₹60 "
                "and less than ₹75."
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

    SHIPPING:
        selling price + shipping component
        = existing websitePrice

    MANUAL:
        selling price + ₹0 shipping

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

    subtotal = 0.0
    shipping = 0.0

    item_quotes = []

    # ----------------------------------------------------------
    # SKU CALCULATION
    # ----------------------------------------------------------

    for raw_item in items:

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
                    f"Invalid pack size for SKU "
                    f"{sku_code}."
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

            unit_price = (
                selling_price
            )

            item_shipping = 0.0

            pricing_mode = (
                "LOCAL"
            )

        # ------------------------------------------------------
        # SHIPPING
        # ------------------------------------------------------

        else:

            # IMPORTANT:
            #
            # Do NOT use websitePrice as unit price and then add
            # shipping again. websitePrice already contains the
            # shipping component.
            #
            # Instead:
            #
            # sellingPrice + shipping = websitePrice
            #
            unit_price = (
                selling_price
            )

            item_shipping = (
                sku_shipping
            )

            pricing_mode = (
                "STANDARD"
            )

        item_subtotal = round(
            unit_price *
            quantity,
            2,
        )

        item_shipping_total = round(
            item_shipping *
            quantity,
            2,
        )

        subtotal += (
            item_subtotal
        )

        # Preserve the existing business rule:
        # largest applicable shipping charge.
        shipping = max(
            shipping,
            item_shipping_total,
        )

        item_quotes.append(
            {
                "sku":
                    sku_code,

                "quantity":
                    quantity,

                "unitPrice":
                    unit_price,

                "itemSubtotal":
                    item_subtotal,

                "shipping":
                    item_shipping_total,

                "productName":
                    family.get(
                        "name",
                        "Kawad Swad Product",
                    ),

                "packSize":
                    pack_size,

                "mrp":
                    sku_obj.get(
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
