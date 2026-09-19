import subprocess
import sys
import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.models.product import find_sku_in_backend
from app.services.fulfillment_seed_plan import (
    apply_migration_in_memory,
    extra_manual_free_pins,
    plan_fulfillment_migration,
    post_migrate_invariant_errors,
)
from app.services.parcel_tariff import (
    DELIVERY_UNAVAILABLE_DETAIL,
    FREE_SHIPPING_PINS,
    INVALID_PIN_DETAIL,
    ORIGIN_PIN,
    billed_weight_grams,
    calculate_shipping_charge,
)
from app.services.pincode_directory import (
    DEFAULT_PINCODE_CSV,
    choose_better_record,
    detect_columns,
)
from app.services.parcel_zones import load_parcel_zone_table
from scripts.import_pincodes import prepare_pincode_import
from scripts.import_parcel_zones import prepare_zone_import


class PincodeDirectoryTests(unittest.TestCase):
    def test_detects_district_and_delivery_headers(self):
        columns = detect_columns(
            [
                "circlename",
                "officename",
                "pincode",
                "delivery",
                "district",
                "statename",
            ]
        )
        self.assertEqual(columns["districtName"], "district")
        self.assertEqual(columns["deliveryStatus"], "delivery")

    def test_duplicate_pin_choice_is_deterministic(self):
        weaker = {
            "pincode": "451225",
            "officeName": "Zebra BO",
            "districtName": None,
            "stateName": "MADHYA PRADESH",
            "deliveryStatus": "Non Delivery",
        }
        stronger = {
            "pincode": "451225",
            "officeName": "Alpha SO",
            "districtName": "KHARGONE",
            "stateName": "MADHYA PRADESH",
            "deliveryStatus": "Delivery",
        }
        self.assertEqual(
            choose_better_record(weaker, stronger)["officeName"],
            "Alpha SO",
        )
        self.assertEqual(
            choose_better_record(stronger, weaker)["officeName"],
            "Alpha SO",
        )

        a = {
            **stronger,
            "officeName": "B Office",
        }
        b = {
            **stronger,
            "officeName": "A Office",
        }
        self.assertEqual(
            choose_better_record(a, b)["officeName"],
            "A Office",
        )
        self.assertEqual(
            choose_better_record(b, a)["officeName"],
            "A Office",
        )

    def test_real_csv_contains_required_pins(self):
        self.assertTrue(DEFAULT_PINCODE_CSV.exists())
        records = prepare_pincode_import(DEFAULT_PINCODE_CSV)
        for pin in set(FREE_SHIPPING_PINS) | {ORIGIN_PIN}:
            self.assertIn(pin, records)
            self.assertEqual(
                str(records[pin]["stateName"]).upper(),
                "MADHYA PRADESH",
            )
            self.assertTrue(records[pin]["districtName"])


class FulfillmentMigratePlanTests(unittest.TestCase):
    def test_dry_run_plan_without_mongo(self):
        existing = [
            {
                "pincode": "451228",
                "fulfillmentType": "MANUAL",
                "shippingCharge": 0,
                "active": True,
                "notes": "legacy local",
            },
            {
                "pincode": "400001",
                "fulfillmentType": "SHIPPING",
                "shippingCharge": 99,
                "active": True,
                "notes": "do not touch",
            },
        ]
        plan = plan_fulfillment_migration(
            pin_count=100,
            directory_pins=set(FREE_SHIPPING_PINS) | {ORIGIN_PIN},
            existing_rules=existing,
        )
        self.assertTrue(plan["ok"], plan["errors"])
        self.assertIn("451228", plan["revokes"])
        self.assertEqual(plan["untouchedPincodes"], ("400001",))

        projected = apply_migration_in_memory(existing)
        by_pin = {row["pincode"]: row for row in projected}

        for pin in FREE_SHIPPING_PINS:
            self.assertEqual(by_pin[pin]["fulfillmentType"], "MANUAL")
            self.assertTrue(by_pin[pin]["freeShipping"])

        self.assertFalse(by_pin[ORIGIN_PIN]["freeShipping"])
        self.assertEqual(by_pin[ORIGIN_PIN]["fulfillmentType"], "SHIPPING")
        self.assertEqual(by_pin["451228"]["fulfillmentType"], "SHIPPING")
        self.assertFalse(by_pin["451228"]["freeShipping"])
        self.assertEqual(by_pin["451228"]["notes"], "legacy local")
        self.assertEqual(by_pin["400001"]["shippingCharge"], 99)
        self.assertEqual(by_pin["400001"]["notes"], "do not touch")
        self.assertEqual(extra_manual_free_pins(projected), ())
        self.assertEqual(post_migrate_invariant_errors(projected), [])

    def test_empty_directory_fails_loudly(self):
        plan = plan_fulfillment_migration(
            pin_count=0,
            directory_pins=[],
            existing_rules=[],
        )
        self.assertFalse(plan["ok"])
        self.assertTrue(any("empty" in error.lower() for error in plan["errors"]))

    def test_missing_required_pin_fails_loudly(self):
        plan = plan_fulfillment_migration(
            pin_count=10,
            directory_pins=["451220"],
            existing_rules=[],
        )
        self.assertFalse(plan["ok"])
        self.assertTrue(
            any("451225" in error or "451001" in error for error in plan["errors"])
        )


class ZoneCsvEmptyTests(unittest.TestCase):
    def test_prepare_zone_import_is_empty(self):
        table, status = prepare_zone_import()
        self.assertEqual(status, "empty")
        self.assertEqual(table, {})
        self.assertEqual(load_parcel_zone_table(), {})


class CheckoutAuthorityTests(unittest.TestCase):
    def test_quote_and_order_inputs_are_sku_qty_pin_only(self):
        fulfillment_source = (
            BACKEND_DIR / "app" / "routes" / "fulfillment.py"
        ).read_text(encoding="utf-8")
        self.assertIn("class CartQuoteItem", fulfillment_source)
        self.assertIn("class CartQuoteRequest", fulfillment_source)
        item_block = fulfillment_source.split("class CartQuoteItem")[1].split(
            "class CartQuoteRequest"
        )[0]
        request_block = fulfillment_source.split("class CartQuoteRequest")[1].split(
            "@router"
        )[0]
        self.assertIn("sku", item_block)
        self.assertIn("quantity", item_block)
        self.assertNotIn("unitPrice", item_block)
        self.assertNotIn("websitePrice", item_block)
        self.assertIn("pincode", request_block)
        self.assertIn("items", request_block)
        self.assertNotIn("shipping", request_block)
        self.assertNotIn("total", request_block)

        order_source = (
            BACKEND_DIR / "app" / "models" / "order.py"
        ).read_text(encoding="utf-8")
        create_block = order_source.split("class CreateOrderRequest")[1].split(
            "class "
        )[0]
        self.assertNotIn("unitPrice", create_block)
        self.assertNotIn("shipping", create_block)
        self.assertNotIn("total", create_block)
        self.assertIn('pattern=r"^[1-9][0-9]{5}$"', order_source)


class CustomerScenarioTests(unittest.TestCase):
    """A–G for supported data: free PINs + MP Within State."""

    def _line(self, sku: str, qty: int):
        _family, sku_obj = find_sku_in_backend(sku)
        self.assertIsNotNone(sku_obj)
        return {
            "sku": sku,
            "packSize": int(sku_obj["packSize"]),
            "quantity": qty,
            "websitePrice": int(sku_obj["websitePrice"]),
        }

    def _totals(self, pin: str, state: str, sku: str, qty: int):
        line = self._line(sku, qty)
        billed = billed_weight_grams(
            [{"packSize": line["packSize"], "quantity": qty}]
        )
        quote = calculate_shipping_charge(pin, billed, state)
        subtotal = line["websitePrice"] * qty
        shipping = quote["shippingCharge"]
        return subtotal, shipping, subtotal + shipping, quote["zone"], billed

    def test_a_missing_pin_is_invalid_not_zero(self):
        self.assertEqual(INVALID_PIN_DETAIL, "Please enter a valid Indian PIN code.")

    def test_b_free_pin_zero_shipping(self):
        for pin in sorted(FREE_SHIPPING_PINS):
            subtotal, shipping, total, zone, billed = self._totals(
                pin,
                "MAHARASHTRA",
                "KS-MMP-200",
                1,
            )
            self.assertEqual(subtotal, 55)
            self.assertEqual(shipping, 0)
            self.assertEqual(total, 55)
            self.assertEqual(zone, "FREE")
            self.assertEqual(billed, 200)

    def test_c_mp_within_state_200g(self):
        subtotal, shipping, total, zone, billed = self._totals(
            "452001",
            "MADHYA PRADESH",
            "KS-MMP-200",
            1,
        )
        self.assertEqual(billed, 200)
        self.assertEqual(zone, "WITHIN_STATE")
        self.assertEqual(shipping, 31)
        self.assertEqual(total, 55 + 31)

    def test_d_origin_451225_not_free(self):
        subtotal, shipping, total, zone, _billed = self._totals(
            ORIGIN_PIN,
            "MADHYA PRADESH",
            "KS-MMP-200",
            1,
        )
        self.assertNotEqual(shipping, 0)
        self.assertEqual(zone, "WITHIN_STATE")
        self.assertEqual(shipping, 31)
        self.assertEqual(total, 86)

    def test_e_invalid_blank_state_unavailable(self):
        from fastapi import HTTPException

        with self.assertRaises(HTTPException) as ctx:
            calculate_shipping_charge(ORIGIN_PIN, 200, "")
        self.assertEqual(ctx.exception.detail, DELIVERY_UNAVAILABLE_DETAIL)

    def test_f_outside_mp_unavailable(self):
        from fastapi import HTTPException

        with self.assertRaises(HTTPException) as ctx:
            calculate_shipping_charge("400001", 200, "MAHARASHTRA")
        self.assertEqual(ctx.exception.detail, DELIVERY_UNAVAILABLE_DETAIL)

    def test_g_multi_qty_slabs(self):
        cases = [
            ("KS-MMP-200", 1, 200, 31),
            ("KS-MMP-200", 3, 600, 44),
            ("KS-MMP-500", 2, 1000, 44),
            ("KS-MMP-1000", 2, 2000, 80),
        ]
        for sku, qty, grams, rate in cases:
            subtotal, shipping, total, zone, billed = self._totals(
                ORIGIN_PIN,
                "MADHYA PRADESH",
                sku,
                qty,
            )
            self.assertEqual(billed, grams, sku)
            self.assertEqual(zone, "WITHIN_STATE")
            self.assertEqual(shipping, rate, sku)
            self.assertEqual(total, subtotal + shipping)


class ImportDryRunCliTests(unittest.TestCase):
    def test_import_pincodes_dry_run_subprocess(self):
        result = subprocess.run(
            [
                sys.executable,
                str(BACKEND_DIR / "scripts" / "import_pincodes.py"),
                "--dry-run",
            ],
            cwd=str(BACKEND_DIR),
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("Dry-run: no MongoDB writes.", result.stdout)
        self.assertIn("451225", result.stdout)
        self.assertIn("Unique PIN codes prepared:", result.stdout)

    def test_import_parcel_zones_dry_run_subprocess(self):
        result = subprocess.run(
            [
                sys.executable,
                str(BACKEND_DIR / "scripts" / "import_parcel_zones.py"),
                "--dry-run",
            ],
            cwd=str(BACKEND_DIR),
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("no data rows", result.stdout)
        self.assertIn("Dry-run: no MongoDB writes.", result.stdout)


if __name__ == "__main__":
    unittest.main()
