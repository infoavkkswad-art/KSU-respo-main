"""
India Post Parcel CONTRACTUAL tariff (approved Kawad Swad card).

Does not use retail parcel, Speed Post, or the old ₹47/₹71/₹150 SKU table.

Zone/Metro and Local are on the rate card but are never guessed.
Existing PIN data only supports:
- exact free-shipping PIN list
- Within State when destination state is Madhya Pradesh

Any other destination fails closed.
"""

from __future__ import annotations

import math
import re
from typing import Any, Dict, Iterable, List, Tuple

from fastapi import HTTPException


ORIGIN_PIN = "451225"

FREE_SHIPPING_PINS = frozenset(
    {
        "451220",
        "451221",
        "451224",
        "451113",
        "451115",
        "451001",
    }
)

ZONE_WITHIN_STATE = "WITHIN_STATE"
ZONE_LOCAL = "LOCAL"
ZONE_METRO = "ZONE_METRO"
ZONE_OTHER_STATES = "OTHER_STATES"

# Approved contractual Parcel rates (₹). Local / Zone-Metro are stored
# only so the card is complete; classify_zone never returns them.
TARIFF_SLABS: List[Tuple[int, Dict[str, int]]] = [
    (500, {"LOCAL": 27, "WITHIN_STATE": 31, "ZONE_METRO": 34, "OTHER_STATES": 35}),
    (1000, {"LOCAL": 31, "WITHIN_STATE": 44, "ZONE_METRO": 51, "OTHER_STATES": 57}),
    (1500, {"LOCAL": 36, "WITHIN_STATE": 58, "ZONE_METRO": 70, "OTHER_STATES": 80}),
    (2000, {"LOCAL": 45, "WITHIN_STATE": 80, "ZONE_METRO": 100, "OTHER_STATES": 115}),
    (3000, {"LOCAL": 57, "WITHIN_STATE": 100, "ZONE_METRO": 125, "OTHER_STATES": 145}),
    (4000, {"LOCAL": 69, "WITHIN_STATE": 120, "ZONE_METRO": 150, "OTHER_STATES": 175}),
    (5000, {"LOCAL": 81, "WITHIN_STATE": 140, "ZONE_METRO": 175, "OTHER_STATES": 205}),
]

EXTRA_KG: Dict[str, int] = {
    "LOCAL": 15,
    "WITHIN_STATE": 20,
    "ZONE_METRO": 25,
    "OTHER_STATES": 30,
}

UNCLASSIFIABLE_DETAIL = (
    "Unable to calculate India Post Parcel contractual shipping "
    "for this PIN. Destination zone cannot be classified as Local, "
    "Within State, Zone/Metro, or Other States from existing PIN "
    "directory data. Shipping was not charged."
)


def normalize_pincode(pincode: str) -> str:
    return str(pincode).strip()


def is_free_shipping_pin(pincode: str) -> bool:
    return normalize_pincode(pincode) in FREE_SHIPPING_PINS


def _normalize_state(state_name: str) -> str:
    return re.sub(
        r"[^a-z]",
        "",
        str(state_name or "").strip().lower(),
    )


def is_madhya_pradesh(state_name: str) -> bool:
    return _normalize_state(state_name) == "madhyapradesh"


def billed_weight_grams(items: Iterable[Dict[str, Any]]) -> int:
    total = 0

    for item in items:
        try:
            pack_size = int(item["packSize"])
            quantity = int(item["quantity"])
        except (KeyError, TypeError, ValueError):
            raise HTTPException(
                status_code=500,
                detail="Unable to calculate shipment weight.",
            )

        if pack_size <= 0 or quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="Invalid pack size or quantity for shipping weight.",
            )

        line = pack_size * quantity

        if line <= 0:
            raise HTTPException(
                status_code=500,
                detail="Unable to calculate shipment weight.",
            )

        total += line

    if total <= 0:
        raise HTTPException(
            status_code=400,
            detail="Shipment weight must be greater than zero.",
        )

    return total


def classify_zone(pincode: str, state_name: str | None) -> str:
    pin = normalize_pincode(pincode)

    if pin in FREE_SHIPPING_PINS:
        raise HTTPException(
            status_code=500,
            detail="Free-shipping PINs must not be zone-classified.",
        )

    if not state_name or not str(state_name).strip():
        raise HTTPException(
            status_code=400,
            detail=UNCLASSIFIABLE_DETAIL,
        )

    if is_madhya_pradesh(state_name):
        return ZONE_WITHIN_STATE

    raise HTTPException(
        status_code=400,
        detail=UNCLASSIFIABLE_DETAIL,
    )


def contractual_rate(zone: str, billed_grams: int) -> int:
    if billed_grams <= 0:
        raise HTTPException(
            status_code=400,
            detail="Shipment weight must be greater than zero.",
        )

    if zone not in EXTRA_KG:
        raise HTTPException(
            status_code=500,
            detail="Unknown shipping zone.",
        )

    for max_grams, rates in TARIFF_SLABS:
        if billed_grams <= max_grams:
            return int(rates[zone])

    base = int(TARIFF_SLABS[-1][1][zone])
    extra_kg = int(
        math.ceil((billed_grams - 5000) / 1000)
    )
    return base + extra_kg * int(EXTRA_KG[zone])


def calculate_shipping_charge(
    pincode: str,
    billed_grams: int,
    destination_state: str | None,
) -> Dict[str, Any]:
    pin = normalize_pincode(pincode)

    if pin in FREE_SHIPPING_PINS:
        return {
            "pincode": pin,
            "zone": "FREE",
            "billedWeightGrams": billed_grams,
            "shippingCharge": 0,
        }

    zone = classify_zone(pin, destination_state)
    charge = contractual_rate(zone, billed_grams)

    return {
        "pincode": pin,
        "zone": zone,
        "billedWeightGrams": billed_grams,
        "shippingCharge": charge,
    }
