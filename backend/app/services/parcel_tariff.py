"""
India Post Parcel CONTRACTUAL tariff (approved Kawad Swad card).

Does not use retail parcel, Speed Post, or the old ₹47/₹71/₹150 SKU table.

Destinations:
- exact free-shipping PIN list → ₹0
- Madhya Pradesh (directory state) → Within State slabs
- owner-supplied CSV rows (when present) → LOCAL / ZONE_METRO /
  OTHER_STATES / WITHIN_STATE without guessing
- otherwise fail closed with a customer-facing unavailable message
"""

from __future__ import annotations

import math
import re
from typing import Any, Dict, Iterable, List, Optional, Tuple

from fastapi import HTTPException

from .parcel_zones import (
    ALLOWED_PARCEL_ZONES,
    ParcelZoneRow,
    load_parcel_zone_table,
)


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

INVALID_PIN_DETAIL = "Please enter a valid Indian PIN code."

DELIVERY_UNAVAILABLE_DETAIL = (
    "Delivery is currently unavailable for that PIN."
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


def _unavailable() -> HTTPException:
    return HTTPException(
        status_code=400,
        detail=DELIVERY_UNAVAILABLE_DETAIL,
    )


def classify_zone(
    pincode: str,
    state_name: str | None,
    zone_table: Optional[Dict[str, ParcelZoneRow]] = None,
) -> str:
    pin = normalize_pincode(pincode)

    if pin in FREE_SHIPPING_PINS:
        raise HTTPException(
            status_code=500,
            detail="Free-shipping PINs must not be zone-classified.",
        )

    table = (
        zone_table
        if zone_table is not None
        else load_parcel_zone_table()
    )
    row = table.get(pin)

    if row is not None:
        if (
            not row.active
            or row.origin_pincode != ORIGIN_PIN
            or row.parcel_zone not in ALLOWED_PARCEL_ZONES
        ):
            raise _unavailable()

        if row.parcel_zone == ZONE_WITHIN_STATE and not is_madhya_pradesh(
            state_name or ""
        ):
            raise _unavailable()

        return row.parcel_zone

    if not state_name or not str(state_name).strip():
        raise _unavailable()

    if is_madhya_pradesh(state_name):
        return ZONE_WITHIN_STATE

    raise _unavailable()


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
    zone_table: Optional[Dict[str, ParcelZoneRow]] = None,
) -> Dict[str, Any]:
    pin = normalize_pincode(pincode)

    if pin in FREE_SHIPPING_PINS:
        return {
            "pincode": pin,
            "zone": "FREE",
            "billedWeightGrams": billed_grams,
            "shippingCharge": 0,
        }

    zone = classify_zone(pin, destination_state, zone_table=zone_table)
    charge = contractual_rate(zone, billed_grams)

    return {
        "pincode": pin,
        "zone": zone,
        "billedWeightGrams": billed_grams,
        "shippingCharge": charge,
    }
