"""
KAWAD SWAD
FULFILMENT MODELS

This module separates:

1. Indian postal directory data
2. Kawad Swad business fulfilment rules

The PIN directory tells us:
    "Where is this PIN?"

The fulfilment rule tells us:
    "How does Kawad Swad fulfil this PIN?"
"""

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ============================================================
# FULFILMENT TYPE
# ============================================================

class FulfillmentType(str, Enum):
    MANUAL = "MANUAL"
    SHIPPING = "SHIPPING"


# ============================================================
# PIN DIRECTORY RESPONSE
# ============================================================

class PincodeLookupResponse(BaseModel):

    valid: bool

    pincode: str

    officeName: Optional[str] = None

    districtName: Optional[str] = None

    stateName: Optional[str] = None

    deliveryStatus: Optional[str] = None


# ============================================================
# KAWAD SWAD FULFILMENT RULE
# ============================================================

class FulfillmentRule(BaseModel):

    pincode: str = Field(
        ...,
        pattern=r"^\d{6}$",
    )

    fulfillmentType: FulfillmentType

    shippingCharge: int = Field(
        ...,
        ge=0,
    )

    active: bool = True


# ============================================================
# FULFILMENT QUOTE RESPONSE
# ============================================================

class FulfillmentQuote(BaseModel):

    validPincode: bool

    pincode: str

    fulfillmentType: Optional[
        FulfillmentType
    ] = None

    shippingCharge: int = 0

    officeName: Optional[str] = None

    districtName: Optional[str] = None

    stateName: Optional[str] = None

    message: str
