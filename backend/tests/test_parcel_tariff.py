import math
import sys
import unittest
from pathlib import Path

from fastapi import HTTPException

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.models.product import BACKEND_PRODUCTS, find_sku_in_backend
from app.services.parcel_tariff import (
    FREE_SHIPPING_PINS,
    ORIGIN_PIN,
    billed_weight_grams,
    calculate_shipping_charge,
    classify_zone,
    contractual_rate,
)


FRONTEND_SELLING = {
    "KS-MMP-200": 55,
    "KS-MMP-500": 140,
    "KS-MMP-1000": 275,
    "KS-MGP-200": 60,
    "KS-MGP-500": 145,
    "KS-MGP-1000": 290,
    "KS-MJP-200": 65,
    "KS-MJP-500": 155,
    "KS-MJP-1000": 305,
    "KS-MPP-200": 60,
    "KS-MPP-500": 145,
    "KS-MPP-1000": 285,
    "KS-MGCP-200": 60,
    "KS-MGCP-500": 145,
    "KS-MGCP-1000": 285,
    "KS-MKMP-200": 60,
    "KS-MKMP-500": 150,
    "KS-MKMP-1000": 300,
    "KS-MPMP-200": 60,
    "KS-MPMP-500": 145,
    "KS-MPMP-1000": 285,
    "KS-CCP-200": 55,
    "KS-CCP-500": 140,
    "KS-CCP-1000": 275,
    "KS-CGP-200": 60,
    "KS-CGP-500": 150,
    "KS-CGP-1000": 300,
    "KS-CKM-200": 60,
    "KS-CKM-500": 145,
    "KS-CKM-1000": 285,
    "KS-CTP-200": 60,
    "KS-CTP-500": 150,
    "KS-CTP-1000": 300,
    "KS-CPM-200": 60,
    "KS-CPM-500": 145,
    "KS-CPM-1000": 285,
    "KS-UGP-200": 65,
    "KS-UGP-500": 160,
    "KS-UGP-1000": 315,
    "KS-UGG-200": 70,
    "KS-UGG-500": 170,
    "KS-UGG-1000": 335,
    "KS-COMB-235": 150,
}

OLD_EMBEDDED = {47, 71, 150}


class ParcelTariffTests(unittest.TestCase):
    def test_free_pins_are_zero(self):
        for pin in sorted(FREE_SHIPPING_PINS):
            quote = calculate_shipping_charge(
                pin,
                2000,
                "Maharashtra",
            )
            self.assertEqual(quote["shippingCharge"], 0, pin)

    def test_origin_pin_is_not_free(self):
        self.assertNotIn(ORIGIN_PIN, FREE_SHIPPING_PINS)
        quote = calculate_shipping_charge(
            ORIGIN_PIN,
            200,
            "MADHYA PRADESH",
        )
        self.assertEqual(quote["zone"], "WITHIN_STATE")
        self.assertEqual(quote["shippingCharge"], 31)

    def test_weight_slabs_within_state(self):
        cases = [
            (200, 31),
            (600, 44),
            (1000, 44),
            (2000, 80),
        ]
        for grams, expected in cases:
            rate = contractual_rate("WITHIN_STATE", grams)
            self.assertEqual(rate, expected, grams)

    def test_billed_weight_examples(self):
        self.assertEqual(
            billed_weight_grams(
                [{"packSize": 200, "quantity": 1}]
            ),
            200,
        )
        self.assertEqual(
            billed_weight_grams(
                [{"packSize": 200, "quantity": 3}]
            ),
            600,
        )
        self.assertEqual(
            billed_weight_grams(
                [{"packSize": 500, "quantity": 2}]
            ),
            1000,
        )
        self.assertEqual(
            billed_weight_grams(
                [{"packSize": 1000, "quantity": 2}]
            ),
            2000,
        )

    def test_non_mp_fails_closed(self):
        with self.assertRaises(HTTPException) as ctx:
            classify_zone("400001", "MAHARASHTRA")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("cannot be classified", ctx.exception.detail)

    def test_extra_kg_within_state(self):
        # 5001g → 5000 slab 140 + 1 extra kg 20
        self.assertEqual(
            contractual_rate("WITHIN_STATE", 5001),
            160,
        )
        extra = int(math.ceil((6001 - 5000) / 1000))
        self.assertEqual(
            contractual_rate("WITHIN_STATE", 6001),
            140 + extra * 20,
        )


class ProductPriceTests(unittest.TestCase):
    def test_backend_matches_frontend_selling(self):
        found = {}
        for family in BACKEND_PRODUCTS:
            for sku in family["skus"]:
                found[sku["sku"]] = sku["websitePrice"]
                self.assertEqual(
                    sku["websitePrice"],
                    FRONTEND_SELLING[sku["sku"]],
                    sku["sku"],
                )
                self.assertNotIn(
                    sku["websitePrice"] - FRONTEND_SELLING[sku["sku"]],
                    OLD_EMBEDDED,
                )
        self.assertEqual(len(found), 43)

    def test_no_old_embedded_postage_in_website_price(self):
        for sku, selling in FRONTEND_SELLING.items():
            _family, sku_obj = find_sku_in_backend(sku)
            self.assertIsNotNone(sku_obj)
            price = sku_obj["websitePrice"]
            self.assertNotEqual(price, selling + 47, sku)
            self.assertNotEqual(price, selling + 71, sku)
            self.assertNotEqual(price, selling + 150, sku)
            self.assertEqual(price, selling, sku)


if __name__ == "__main__":
    unittest.main()
