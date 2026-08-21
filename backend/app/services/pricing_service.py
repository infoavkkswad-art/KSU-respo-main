"""
KAWAD SWAD
SERVER-SIDE PRICING / FULFILMENT QUOTE SERVICE

Stage 2.7

COMMERCIAL RULE
---------------

The commercial sales master defines:

    sellingPrice + shipping = websitePrice

The customer-facing frontend may expose websitePrice as the final
product price, but the backend quote must keep product price and
shipping separate.

MANUAL fulfilment:
    subtotal = selling price
    shipping = ₹0
    total = subtotal

SHIPPING fulfilment:
    subtotal = selling price
    shipping = applicable commercial shipping
    total = subtotal + shipping

CURRENT COMMERCIAL SHIPPING MASTER
----------------------------------

    200g  -> ₹47
    500g  -> ₹71
    1000g -> ₹150
    235g  -> ₹47

IMPORTANT
---------

1. Frontend prices are NEVER trusted.
2. Backend product data is authoritative.
3. Customer-facing websitePrice is NOT used as the subtotal.
4. Shipping is resolved from the commercial SKU/pack-size rules.
5. MANUAL fulfilment always has ₹0 shipping.
6. SHIPPING fulfilment must NEVER silently become free because
   pincode_service returns shippingCharge = 0.
7. No shipping is added twice.
"""

from typing import Any, Dict, List, Tuple

from fastapi import HTTPException

from ..models.product import find_sku_in_backend

from .pincode_service import (
    get_fulfillment_quote,
)


# ==============================================================
# COMMERCIAL SHIPPING MASTER
# ==============================================================

"""
These values match the active commercial sales configuration.

sales-config.ts defines:

    200g  -> ₹47
    500g  -> ₹71
    1000g -> ₹150

The active combo SKU KS-COMB-235 is also configured with ₹47.

Do NOT use ProductService.shipping here because the frontend
ProductService intentionally exposes customer-facing shipping
separately and may show it as zero after the final website price
has been assembled.
"""

SHIPPING_BY_PACK_SIZE: Dict[int, float] = {
    200: 47.0,
    235: 47.0,
    500: 71.0,
    1000: 150.0,
}


# ==============================================================
# NORMALIZATION
# ==============================================================

def normalize_sku(
    sku: Any,
) -> str:
    """
    Normalize and validate a SKU.
    """

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
    """
    Normalize and validate quantity.
    """

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
    """
    Safely convert a backend monetary value to float.
    """

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
        or amount != amount
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
# PACK SIZE
# ==============================================================

def get_pack_size(
    sku_code: str,
    sku_obj: Dict[str, Any],
) -> int:
    """
    Resolve the authoritative pack size from backend SKU data.
    """

    try:
        pack_size = int(
            sku_obj.get(
                "packSize",
                0,
            )
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Invalid pack size for SKU {sku_code}."
            ),
        )

    if pack_size <= 0:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Invalid pack size for SKU {sku_code}."
            ),
        )

    return pack_size


# ==============================================================
# COMMERCIAL SHIPPING RESOLUTION
# ==============================================================

def get_commercial_shipping(
    sku_code: str,
    pack_size: int,
) -> float:
    """
    Resolve the shipping component from the commercial master.

    IMPORTANT:

    We intentionally do NOT trust the fulfilment layer's
    shippingCharge for the commercial website shipping amount.

    The fulfilment layer decides:

        MANUAL
        or
        SHIPPING

    The commercial master decides:

        how much shipping applies to the SKU.
    """

    shipping = SHIPPING_BY_PACK_SIZE.get(
        pack_size
    )

    if shipping is None:
        raise HTTPException(
            status_code=500,
            detail=(
                f"No commercial shipping rule is configured "
                f"for SKU {sku_code} with pack size "
                f"{pack_size}g."
            ),
        )

    return round(
        shipping,
        2,
    )


# ==============================================================
# BACKEND COMMERCIAL PRICE RESOLUTION
# ==============================================================

def get_backend_prices(
    sku_code: str,
    sku_obj: Dict[str, Any],
    pack_size: int,
) -> Tuple[
    float,
    float,
    float,
]:
    """
    Resolve:

        selling_price
        commercial_shipping
        website_price

    The backend catalogue contains websitePrice.

    The commercial master defines:

        websitePrice = sellingPrice + shipping

    Therefore:

        sellingPrice =
            websitePrice - applicable shipping

    Example:

        200g
        websitePrice = ₹102
        shipping = ₹47

        sellingPrice = ₹55
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

    commercial_shipping = (
        get_commercial_shipping(
            sku_code,
            pack_size,
        )
    )

    selling_price = round(
        website_price -
        commercial_shipping,
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

    # ----------------------------------------------------------
    # COMMERCIAL INTEGRITY CHECK
    # ----------------------------------------------------------

    expected_website_price = round(
        selling_price +
        commercial_shipping,
        2,
    )

    if (
        expected_website_price !=
        website_price
    ):
        raise HTTPException(
            status_code=500,
            detail=(
                f"Commercial price mismatch for SKU "
                f"{sku_code}: website price ₹"
                f"{website_price:.2f} does not equal "
                f"selling price ₹"
                f"{selling_price:.2f} + shipping ₹"
                f"{commercial_shipping:.2f}."
            ),
        )

    # ----------------------------------------------------------
    # MRP
    # ----------------------------------------------------------

    mrp_raw = (
        sku_obj.get(
            "mrp"
        )
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
        selling_price,
        commercial_shipping,
        mrp,
    )


# ==============================================================
# MANUAL PRICE VALIDATION
# ==============================================================

def validate_manual_price(
    sku_code: str,
    pack_size: int,
    selling_price: float,
) -> None:
    """
    MANUAL fulfilment uses the approved backend selling price.

    No shipping is added.

    This function intentionally does not modify the price.
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

    MANUAL:

        subtotal = selling price × quantity
        shipping = ₹0
        total = subtotal

    SHIPPING:

        subtotal = selling price × quantity
        shipping = commercial shipping
        total = subtotal + shipping

    Frontend prices are never accepted.
    """

    if not items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty.",
        )

    # ==========================================================
    # PIN / FULFILMENT
    # ==========================================================

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

    # ==========================================================
    # ORDER TOTALS
    # ==========================================================

    subtotal = 0.0
    shipping = 0.0

    item_quotes: List[
        Dict[str, Any]
    ] = []

    pricing_mode = (
        "LOCAL"
        if is_manual
        else "STANDARD"
    )

    # ==========================================================
    # SKU CALCULATION
    # ==========================================================

    for raw_item in items:

        if not isinstance(
            raw_item,
            dict,
        ):
            raise HTTPException(
                status_code=400,
                detail="Invalid cart item.",
            )

        raw_sku = (
            raw_item.get(
                "sku"
            )
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

        # ------------------------------------------------------
        # BACKEND SKU
        # ------------------------------------------------------

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

        # ------------------------------------------------------
        # AVAILABILITY
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
        # PACK SIZE
        # ------------------------------------------------------

        pack_size = get_pack_size(
            sku_code,
            sku_obj,
        )

        # ------------------------------------------------------
        # AUTHORITATIVE COMMERCIAL PRICE
        # ------------------------------------------------------

        (
            selling_price,
            sku_shipping,
            mrp,
        ) = get_backend_prices(
            sku_code,
            sku_obj,
            pack_size,
        )

        # ======================================================
        # MANUAL FULFILMENT
        # ======================================================

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

        # ======================================================
        # STANDARD SHIPPING FULFILMENT
        # ======================================================

        else:

            unit_price = (
                selling_price
            )

            item_shipping = (
                sku_shipping
            )

        # ------------------------------------------------------
        # ITEM SUBTOTAL
        # ------------------------------------------------------

        item_subtotal = round(
            unit_price *
            quantity,
            2,
        )

        if (
            not item_subtotal >= 0
        ):
            raise HTTPException(
                status_code=500,
                detail=(
                    f"Invalid item subtotal for SKU "
                    f"{sku_code}."
                ),
            )

        # ------------------------------------------------------
        # ITEM SHIPPING
        # ------------------------------------------------------

        item_shipping_total = round(
            item_shipping *
            quantity,
            2,
        )

        # ------------------------------------------------------
        # ORDER SUBTOTAL
        # ------------------------------------------------------

        subtotal = round(
            subtotal +
            item_subtotal,
            2,
        )

        # ------------------------------------------------------
        # SHIPPING RULE
        #
        # Preserve existing business rule:
        # use the largest applicable shipping charge.
        #
        # This prevents shipping being added once per different
        # SKU while still allowing quantity to affect the charge.
        # ------------------------------------------------------

        if item_shipping_total > shipping:
            shipping = (
                item_shipping_total
            )

        # ------------------------------------------------------
        # ITEM QUOTE
        # ------------------------------------------------------

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
                    mrp,
            }
        )

    # ==========================================================
    # FINAL TOTALS
    # ==========================================================

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

    # ==========================================================
    # RETURN SERVER QUOTE
    # ==========================================================

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
