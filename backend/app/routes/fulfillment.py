"""
KAWAD SWAD
FULFILMENT + PRICING API

Stage 2.3

Public endpoints:
- PIN lookup
- PIN fulfilment quote
- Full cart pricing quote

The full cart quote is server-side and never trusts frontend prices.
"""

from typing import Any, Dict, List

from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..models.fulfillment import (
    FulfillmentQuote,
    PincodeLookupResponse,
)

from ..services.pincode_service import (
    lookup_pincode,
    get_fulfillment_quote,
)

from ..services.pricing_service import (
    calculate_cart_quote,
)


router = APIRouter(
    prefix="/api/fulfillment",
    tags=["Fulfillment"],
)


# ==============================================================
# REQUEST MODELS
# ==============================================================

class CartQuoteItem(BaseModel):
    sku: str = Field(
        ...,
        min_length=1,
    )

    quantity: int = Field(
        ...,
        ge=1,
    )


class CartQuoteRequest(BaseModel):
    pincode: str = Field(
        ...,
        min_length=6,
        max_length=6,
    )

    items: List[
        CartQuoteItem
    ] = Field(
        ...,
        min_length=1,
    )


# ==============================================================
# PIN LOOKUP
# ==============================================================

@router.get(
    "/pincode/{pincode}",
    response_model=PincodeLookupResponse,
)
async def pincode_lookup(
    pincode: str,
):
    return await lookup_pincode(
        pincode
    )


# ==============================================================
# PIN FULFILMENT QUOTE
# ==============================================================

@router.get(
    "/quote/{pincode}",
    response_model=FulfillmentQuote,
)
async def fulfillment_quote(
    pincode: str,
):
    return await get_fulfillment_quote(
        pincode
    )


# ==============================================================
# FULL CART PRICE QUOTE
# ==============================================================

@router.post(
    "/cart-quote",
)
async def cart_quote(
    payload: CartQuoteRequest,
):
    return await calculate_cart_quote(
        pincode=payload.pincode,
        items=[
            {
                "sku": item.sku,
                "quantity": item.quantity,
            }
            for item in payload.items
        ],
    )
