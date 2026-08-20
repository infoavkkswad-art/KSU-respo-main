"""
KAWAD SWAD
FULFILMENT API

Public endpoints used by checkout.

Important:
    These endpoints only resolve PIN/fulfilment information.

    Product pricing will be connected in the next stage.
"""

from fastapi import APIRouter

from ..models.fulfillment import (
    FulfillmentQuote,
    PincodeLookupResponse,
)

from ..services.pincode_service import (
    lookup_pincode,
    get_fulfillment_quote,
)


router = APIRouter(
    prefix="/api/fulfillment",
    tags=["Fulfillment"],
)


# ============================================================
# PIN LOOKUP
# ============================================================

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


# ============================================================
# FULFILMENT QUOTE
# ============================================================

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
