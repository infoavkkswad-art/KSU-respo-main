"""Storage safety and warehouse stock rules. Uses explicit in-memory mode only."""

import os
import sys
import types
import unittest

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ["SALES_STORAGE_MODE"] = "memory"

# The older test modules install a small FastAPI stand-in when the suite
# loads. Extend that stand-in so this module can import the health check.
if "fastapi" in sys.modules and not hasattr(sys.modules["fastapi"], "FastAPI"):
    fastapi_mod = sys.modules["fastapi"]

    class _FastAPI:
        def __init__(self, *args, **kwargs):
            pass

        def add_middleware(self, *args, **kwargs):
            pass

        def include_router(self, *args, **kwargs):
            pass

        def exception_handler(self, *args, **kwargs):
            return lambda func: func

        def get(self, *args, **kwargs):
            return lambda func: func

    fastapi_mod.FastAPI = _FastAPI
    if not hasattr(fastapi_mod, "Query"):
        fastapi_mod.Query = lambda *args, **kwargs: None
    if not hasattr(fastapi_mod, "Header"):
        fastapi_mod.Header = lambda *args, **kwargs: None
    middleware = types.ModuleType("fastapi.middleware")
    cors = types.ModuleType("fastapi.middleware.cors")
    cors.CORSMiddleware = object
    responses = types.ModuleType("fastapi.responses")
    responses.JSONResponse = lambda *args, **kwargs: kwargs
    sys.modules["fastapi.middleware"] = middleware
    sys.modules["fastapi.middleware.cors"] = cors
    sys.modules["fastapi.responses"] = responses

from fastapi import HTTPException

from app.models import SaleCreate, SaleItemCreate, StockMovementCreate
from app.sheets import db, StorageUnavailable
import app.sheets as sheets
import app.routers.sales as sales_router
import app.routers.stock as stock_router
from app.main import health_check


OWNER = {"user_id": "USR-OWNER", "full_name": "Owner", "role": "OWNER"}
PA = {"user_id": "USR-PA", "full_name": "Mahi", "role": "PA"}
SALESMAN = {"user_id": "USR-SALES", "full_name": "Ramesh", "role": "SALESMAN"}


def _packet(product_id="PRD-PAPAD", sku="KS-PAPAD", unit="PACKET"):
    return {
        "product_id": product_id,
        "sku": sku,
        "product_name": "Papad",
        "selling_unit": unit,
        "pack_weight_g": 200,
        "active": "true",
    }


class StorageAndStockTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        db.configure(mode="memory")
        db.fail_writes = False
        db.memory_store["Products"] = [_packet(), _packet("PRD-BESAN", "KS-BESAN", "KG")]
        db.memory_store["SalesmanStockLedger"] = []
        db.memory_store["Sales"] = []
        db.memory_store["SaleItems"] = []
        db.memory_store["Payments"] = []
        db.memory_store["CashLedger"] = []
        db.memory_store["AuditLog"] = []
        db.memory_store["Users"] = []
        db.memory_store["AuthUsers"] = []

    def test_missing_sheets_configuration_does_not_use_memory(self):
        original_id = sheets.SALES_GOOGLE_SPREADSHEET_ID
        original_json = sheets.SALES_GOOGLE_SERVICE_ACCOUNT_JSON
        original_file = sheets.SALES_GOOGLE_SERVICE_ACCOUNT_FILE
        try:
            sheets.SALES_GOOGLE_SPREADSHEET_ID = ""
            sheets.SALES_GOOGLE_SERVICE_ACCOUNT_JSON = ""
            sheets.SALES_GOOGLE_SERVICE_ACCOUNT_FILE = "/tmp/missing-sales-service-account.json"
            db.configure(mode="sheets")
            self.assertFalse(db.is_connected)
            self.assertFalse(db.durable_ready())
            self.assertIn("SALES_GOOGLE_SPREADSHEET_ID", db.storage_error)
            with self.assertRaises(StorageUnavailable):
                db.append_record("Sales", {"sale_id": "SALE-SHOULD-NOT-SAVE"})
            self.assertEqual(db.memory_store["Sales"], [])
            with self.assertRaises(HTTPException) as ctx:
                health_check()
            self.assertEqual(ctx.exception.status_code, 503)
            self.assertFalse(ctx.exception.detail["google_sheets_connected"])
        finally:
            sheets.SALES_GOOGLE_SPREADSHEET_ID = original_id
            sheets.SALES_GOOGLE_SERVICE_ACCOUNT_JSON = original_json
            sheets.SALES_GOOGLE_SERVICE_ACCOUNT_FILE = original_file
            db.configure(mode="memory")

    def test_sheets_connection_failure_does_not_use_memory(self):
        original_id = sheets.SALES_GOOGLE_SPREADSHEET_ID
        original_json = sheets.SALES_GOOGLE_SERVICE_ACCOUNT_JSON
        try:
            sheets.SALES_GOOGLE_SPREADSHEET_ID = "development-sheet-id"
            sheets.SALES_GOOGLE_SERVICE_ACCOUNT_JSON = "{not-json"
            db.configure(mode="sheets")
            self.assertFalse(db.is_connected)
            self.assertIn("connection failed", db.storage_error.lower())
            before = list(db.memory_store["Payments"])
            with self.assertRaises(StorageUnavailable):
                db.append_record("Payments", {"payment_id": "PAY-NO"})
            self.assertEqual(db.memory_store["Payments"], before)
        finally:
            sheets.SALES_GOOGLE_SPREADSHEET_ID = original_id
            sheets.SALES_GOOGLE_SERVICE_ACCOUNT_JSON = original_json
            db.configure(mode="memory")

    def test_explicit_memory_mode_accepts_test_writes(self):
        db.configure(mode="memory")
        self.assertTrue(db.durable_ready())
        self.assertFalse(db.is_connected)
        self.assertTrue(db.append_record("AuditLog", {"audit_id": "AUD-1", "action": "TEST"}))
        self.assertEqual(len(db.get_records("AuditLog")), 1)

    async def test_financial_sale_blocked_when_sheets_unavailable(self):
        db.configure(mode="sheets", storage_error="Google Sheets is down")
        req = SaleCreate(
            sales_type="Retail",
            payment_method="CASH",
            items=[SaleItemCreate(product_id="PRD-PAPAD", quantity=1, actual_unit_price=10)],
        )
        with self.assertRaises(StorageUnavailable):
            await sales_router.create_sale(req, current_user=SALESMAN)
        self.assertEqual(db.memory_store["Sales"], [])

    async def test_salesman_cannot_record_warehouse_opening_stock(self):
        req = StockMovementCreate(
            product_id="PRD-PAPAD",
            txn_type="COMPANY_RECEIPT",
            quantity=10,
            reason="Opening count",
            idempotency_key="open-salesman",
        )
        with self.assertRaises(HTTPException) as ctx:
            await stock_router.create_stock_transaction(req, current_user=SALESMAN)
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertEqual(db.memory_store["SalesmanStockLedger"], [])

    async def test_opening_issue_and_return_balances(self):
        opening = await stock_router.create_stock_transaction(
            StockMovementCreate(
                product_id="PRD-PAPAD",
                txn_type="COMPANY_RECEIPT",
                quantity=20,
                unit="PACKET",
                reason="Factory floor count",
                txn_datetime="2026-10-17",
                idempotency_key="open-1",
            ),
            current_user=OWNER,
        )
        self.assertEqual(opening.txn_type, "COMPANY_RECEIPT")
        self.assertTrue(opening.stock_txn_id)
        self.assertEqual(opening.issued_by_user_id, "USR-OWNER")

        again = await stock_router.create_stock_transaction(
            StockMovementCreate(
                product_id="PRD-PAPAD",
                txn_type="COMPANY_RECEIPT",
                quantity=20,
                reason="Factory floor count",
                idempotency_key="open-1",
            ),
            current_user=OWNER,
        )
        self.assertEqual(again.stock_txn_id, opening.stock_txn_id)
        self.assertEqual(len(db.memory_store["SalesmanStockLedger"]), 1)

        summary = await stock_router.get_stock_summary(current_user=OWNER)
        papad = next(item for item in summary.company_stock if item.product_id == "PRD-PAPAD")
        self.assertEqual(papad.current_stock, 20)
        self.assertEqual(papad.company_quantity, 20)

        await stock_router.create_stock_transaction(
            StockMovementCreate(
                product_id="PRD-PAPAD",
                txn_type="ISSUE_TO_SALESMAN",
                salesman_user_id="USR-SALES",
                quantity=8,
                reason="Morning issue",
                idempotency_key="issue-1",
            ),
            current_user=PA,
        )
        summary = await stock_router.get_stock_summary(current_user=OWNER)
        papad = next(item for item in summary.company_stock if item.product_id == "PRD-PAPAD")
        held = next(item for item in summary.salesman_stock if item.salesman_user_id == "USR-SALES")
        self.assertEqual(papad.current_stock, 12)
        self.assertEqual(held.quantity, 8)

        returned = await stock_router.create_stock_transaction(
            StockMovementCreate(
                product_id="PRD-PAPAD",
                txn_type="RETURNED",
                salesman_user_id="USR-SALES",
                quantity=3,
                reason="Unsold packets",
                idempotency_key="return-1",
            ),
            current_user=SALESMAN,
        )
        self.assertEqual(returned.txn_type, "RETURN_FROM_SALESMAN")
        summary = await stock_router.get_stock_summary(current_user=OWNER)
        papad = next(item for item in summary.company_stock if item.product_id == "PRD-PAPAD")
        held = next(item for item in summary.salesman_stock if item.salesman_user_id == "USR-SALES")
        self.assertEqual(papad.current_stock, 15)
        self.assertEqual(held.quantity, 5)

    async def test_invalid_quantity_and_unit(self):
        with self.assertRaises(HTTPException) as ctx:
            await stock_router.create_stock_transaction(
                StockMovementCreate(
                    product_id="PRD-PAPAD",
                    txn_type="COMPANY_RECEIPT",
                    quantity=0,
                    reason="Bad count",
                    idempotency_key="bad-qty",
                ),
                current_user=OWNER,
            )
        self.assertEqual(ctx.exception.status_code, 422)

        with self.assertRaises(HTTPException) as ctx:
            await stock_router.create_stock_transaction(
                StockMovementCreate(
                    product_id="PRD-PAPAD",
                    txn_type="COMPANY_RECEIPT",
                    quantity=1.5,
                    unit="PACKET",
                    reason="Bad packets",
                    idempotency_key="bad-packets",
                ),
                current_user=OWNER,
            )
        self.assertEqual(ctx.exception.status_code, 422)

        with self.assertRaises(HTTPException) as ctx:
            await stock_router.create_stock_transaction(
                StockMovementCreate(
                    product_id="PRD-PAPAD",
                    txn_type="COMPANY_RECEIPT",
                    quantity=2,
                    unit="KG",
                    reason="Wrong unit",
                    idempotency_key="bad-unit",
                ),
                current_user=OWNER,
            )
        self.assertEqual(ctx.exception.status_code, 422)
        self.assertEqual(db.memory_store["SalesmanStockLedger"], [])

        saved = await stock_router.create_stock_transaction(
            StockMovementCreate(
                product_id="PRD-BESAN",
                txn_type="COMPANY_RECEIPT",
                quantity=2.5,
                unit="KG",
                reason="Bulk opening",
                idempotency_key="kg-open",
            ),
            current_user=OWNER,
        )
        self.assertEqual(saved.unit, "KG")
        self.assertEqual(saved.quantity, 2.5)

    async def test_failed_write_is_not_reported_as_saved(self):
        db.fail_writes = True
        with self.assertRaises(HTTPException) as ctx:
            await stock_router.create_stock_transaction(
                StockMovementCreate(
                    product_id="PRD-PAPAD",
                    txn_type="COMPANY_RECEIPT",
                    quantity=4,
                    reason="Should fail",
                    idempotency_key="fail-write",
                ),
                current_user=OWNER,
            )
        self.assertEqual(ctx.exception.status_code, 503)
        self.assertEqual(db.memory_store["SalesmanStockLedger"], [])

    async def test_inactive_product_rejected_for_new_bill_history_remains(self):
        db.memory_store["SalesmanStockLedger"] = [
            {
                "stock_txn_id": "STK-SEED",
                "salesman_user_id": "USR-SALES",
                "product_id": "PRD-PAPAD",
                "txn_type": "ISSUE_TO_SALESMAN",
                "quantity": 10,
                "unit": "PACKET",
            }
        ]
        db.memory_store["Products"][0]["active"] = "false"
        db.memory_store["Sales"] = [{
            "sale_id": "SALE-OLD",
            "bill_number": "KS-OLD",
            "sale_datetime": "2026-01-01T00:00:00",
            "sales_type": "Retail",
            "customer_id": "CUS-WALKIN",
            "customer_name_snapshot": "Walk-in Customer",
            "salesman_user_id": "USR-SALES",
            "bill_status": "ISSUED",
            "payment_status": "PAID",
            "subtotal": 10,
            "discount_amount": 0,
            "tax_amount": 0,
            "bill_total": 10,
            "created_at": "2026-01-01T00:00:00",
        }]
        with self.assertRaises(HTTPException) as ctx:
            await sales_router.create_sale(
                SaleCreate(
                    sales_type="Retail",
                    payment_method="CASH",
                    items=[SaleItemCreate(product_id="PRD-PAPAD", quantity=1, actual_unit_price=10)],
                ),
                current_user=SALESMAN,
            )
        self.assertEqual(ctx.exception.status_code, 422)
        listed = await sales_router.list_sales(current_user=OWNER)
        self.assertEqual(listed[0].sale_id, "SALE-OLD")
        self.assertEqual(len(db.get_records("SalesmanStockLedger")), 1)

    async def test_negative_balance_is_not_clamped(self):
        db.memory_store["SalesmanStockLedger"] = [
            {
                "stock_txn_id": "STK-1",
                "product_id": "PRD-PAPAD",
                "txn_type": "COMPANY_RECEIPT",
                "quantity": 2,
                "salesman_user_id": "",
            },
            {
                "stock_txn_id": "STK-2",
                "product_id": "PRD-PAPAD",
                "txn_type": "COMPANY_SOLD",
                "quantity": 5,
                "salesman_user_id": "USR-OWNER",
            },
        ]
        summary = await stock_router.get_stock_summary(current_user=OWNER)
        papad = next(item for item in summary.company_stock if item.product_id == "PRD-PAPAD")
        self.assertEqual(papad.current_stock, -3)


if __name__ == "__main__":
    unittest.main()
