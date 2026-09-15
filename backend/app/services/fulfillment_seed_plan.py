"""
Fulfillment-rule seed plan (no Mongo).

Live payable does not read these charges. This only documents
required free PINs vs leftover MANUAL+₹0 rules that must not
remain free after deploy.
"""

from __future__ import annotations

from typing import Any, Dict, Iterable, List, Tuple

from .parcel_tariff import (
    FREE_SHIPPING_PINS,
    ORIGIN_PIN,
)


LEGACY_MANUAL_PINS_TO_REVOKE = frozenset(
    {
        "451225",
        "451228",
        "451111",
        "454331",
        "453441",
        "454001",
        "452001",
        "450001",
    }
)


def required_directory_pins() -> Tuple[str, ...]:
    return tuple(sorted(set(FREE_SHIPPING_PINS) | {ORIGIN_PIN}))


def missing_required_directory_pins(
    existing_pins: Iterable[str],
) -> Tuple[str, ...]:
    have = {str(pin).strip() for pin in existing_pins}
    return tuple(
        pin for pin in required_directory_pins() if pin not in have
    )


def planned_rule_writes() -> List[Dict[str, Any]]:
    writes: List[Dict[str, Any]] = []

    for pincode in sorted(FREE_SHIPPING_PINS):
        writes.append(
            {
                "pincode": pincode,
                "fulfillmentType": "MANUAL",
                "shippingCharge": 0,
                "active": True,
                "freeShipping": True,
            }
        )

    writes.append(
        {
            "pincode": ORIGIN_PIN,
            "fulfillmentType": "SHIPPING",
            "shippingCharge": 0,
            "active": True,
            "freeShipping": False,
        }
    )

    return writes


def extra_manual_free_pins(
    existing_rules: Iterable[Dict[str, Any]],
) -> Tuple[str, ...]:
    extras = []

    for rule in existing_rules:
        pin = str(rule.get("pincode", "")).strip()
        fulfillment = str(
            rule.get("fulfillmentType", "")
        ).strip().upper()
        charge = rule.get("shippingCharge", 0)
        active = bool(rule.get("active", True))

        if not pin or not active:
            continue

        if pin in FREE_SHIPPING_PINS:
            continue

        try:
            charge_value = int(charge)
        except (TypeError, ValueError):
            continue

        if fulfillment == "MANUAL" and charge_value == 0:
            extras.append(pin)

    return tuple(sorted(set(extras)))
