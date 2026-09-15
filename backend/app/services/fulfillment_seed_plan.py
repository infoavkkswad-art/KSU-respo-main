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


OWNED_RULE_FIELDS = (
    "pincode",
    "fulfillmentType",
    "shippingCharge",
    "active",
    "freeShipping",
)


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


def owned_rule_patch(write: Dict[str, Any]) -> Dict[str, Any]:
    return {
        field: write[field]
        for field in OWNED_RULE_FIELDS
        if field in write
    }


def revoke_patch(pincode: str) -> Dict[str, Any]:
    return {
        "pincode": pincode,
        "fulfillmentType": "SHIPPING",
        "shippingCharge": 0,
        "active": True,
        "freeShipping": False,
    }


def apply_migration_in_memory(
    existing_rules: Iterable[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    by_pin: Dict[str, Dict[str, Any]] = {}

    for rule in existing_rules:
        pin = str(rule.get("pincode", "")).strip()
        if pin:
            by_pin[pin] = dict(rule)

    for write in planned_rule_writes():
        pin = write["pincode"]
        merged = dict(by_pin.get(pin, {}))
        merged.update(owned_rule_patch(write))
        by_pin[pin] = merged

    extras = extra_manual_free_pins(by_pin.values())

    for pin in extras:
        merged = dict(by_pin.get(pin, {}))
        merged.update(owned_rule_patch(revoke_patch(pin)))
        by_pin[pin] = merged

    return [by_pin[pin] for pin in sorted(by_pin)]


def plan_fulfillment_migration(
    *,
    pin_count: int,
    directory_pins: Iterable[str],
    existing_rules: Iterable[Dict[str, Any]],
) -> Dict[str, Any]:
    errors: List[str] = []

    if pin_count < 1:
        errors.append(
            "pincodes collection is empty. "
            "Run python scripts/import_pincodes.py before this migration."
        )

    missing = missing_required_directory_pins(directory_pins)

    if missing:
        errors.append(
            "Required PIN(s) missing from pincodes: " + ", ".join(missing)
        )

    existing = [dict(rule) for rule in existing_rules]
    upserts = [owned_rule_patch(write) for write in planned_rule_writes()]
    revokes = extra_manual_free_pins(existing)
    owned_pins = {
        write["pincode"] for write in upserts
    } | set(revokes)

    untouched = tuple(
        sorted(
            {
                str(rule.get("pincode", "")).strip()
                for rule in existing
                if str(rule.get("pincode", "")).strip()
                and str(rule.get("pincode", "")).strip() not in owned_pins
            }
        )
    )

    projected = [] if errors else apply_migration_in_memory(existing)
    invariant_errors = (
        [] if errors else post_migrate_invariant_errors(projected)
    )
    errors.extend(invariant_errors)

    return {
        "ok": not errors,
        "errors": tuple(errors),
        "upserts": upserts,
        "revokes": revokes,
        "untouchedPincodes": untouched,
        "projectedRules": projected,
    }


def post_migrate_invariant_errors(
    rules: Iterable[Dict[str, Any]],
) -> List[str]:
    errors: List[str] = []
    by_pin = {
        str(rule.get("pincode", "")).strip(): rule
        for rule in rules
    }

    for pin in sorted(FREE_SHIPPING_PINS):
        rule = by_pin.get(pin)
        if not rule:
            errors.append(f"Free PIN {pin} missing from fulfillment_rules.")
            continue
        if str(rule.get("fulfillmentType", "")).upper() != "MANUAL":
            errors.append(f"Free PIN {pin} is not MANUAL.")
        if int(rule.get("shippingCharge", -1)) != 0:
            errors.append(f"Free PIN {pin} shippingCharge is not 0.")
        if not bool(rule.get("freeShipping")):
            errors.append(f"Free PIN {pin} is not marked freeShipping.")
        if not bool(rule.get("active", True)):
            errors.append(f"Free PIN {pin} is not active.")

    origin = by_pin.get(ORIGIN_PIN)
    if origin:
        if bool(origin.get("freeShipping")):
            errors.append("Origin PIN 451225 must not be freeShipping.")
        if (
            str(origin.get("fulfillmentType", "")).upper() == "MANUAL"
            and int(origin.get("shippingCharge", 0)) == 0
        ):
            errors.append("Origin PIN 451225 must not remain MANUAL+₹0.")

    leftovers = extra_manual_free_pins(rules)
    if leftovers:
        errors.append(
            "Leftover MANUAL+₹0 rules would still grant free shipping: "
            + ", ".join(leftovers)
        )

    return errors
