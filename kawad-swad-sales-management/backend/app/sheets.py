import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Any

from app.config import (
    SALES_GOOGLE_SPREADSHEET_ID,
    SALES_GOOGLE_SERVICE_ACCOUNT_FILE,
    SALES_GOOGLE_SERVICE_ACCOUNT_JSON,
    SALES_STORAGE_MODE,
)

logger = logging.getLogger("kawad_swad.sheets")

ID_PREFIXES = {
    "Users": "USR",
    "Products": "PRD",
    "Customers": "CUS",
    "Sales": "SALE",
    "SaleItems": "ITEM",
    "Payments": "PAY",
    "SalesmanStockLedger": "STK",
    "CashLedger": "CSH",
    "Expenses": "EXP",
    "ShopVisits": "VIS",
    "DailyClosing": "CLOSE",
    "SalaryIncentives": "SAL",
    "AuditLog": "AUD",
}

FINANCIAL_TABS = {
    "Sales",
    "SaleItems",
    "Payments",
    "SalesmanStockLedger",
    "CashLedger",
    "Expenses",
    "DailyClosing",
    "SalaryIncentives",
}


class StorageUnavailable(RuntimeError):
    """Durable Google Sheets storage is not available for this operation."""

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class SheetsDatabase:
    """Google Sheets persistence. In-memory mode is explicit and for tests only."""

    def __init__(self):
        self.client = None
        self.spreadsheet = None
        self.is_connected = False
        self.storage_mode = "sheets"
        self.storage_error = ""
        self.fail_writes = False
        self.memory_store: Dict[str, List[Dict[str, Any]]] = {}
        self._reset_memory()
        self.configure(mode=SALES_STORAGE_MODE or "sheets")

    def _reset_memory(self):
        self.memory_store = {
            "AuthUsers": [],
            "Users": [],
            "Products": [],
            "Customers": [],
            "Sales": [],
            "SaleItems": [],
            "Payments": [],
            "SalesmanStockLedger": [],
            "CashLedger": [],
            "Expenses": [],
            "ShopVisits": [],
            "DailyClosing": [],
            "SalaryIncentives": [],
            "AuditLog": [],
            "Settings": [],
        }

    def configure(self, mode: str = "sheets", storage_error: str = "", fail_writes: bool = False):
        """Switch storage mode without touching a live spreadsheet.

        mode="memory" is the explicit test fixture. mode="sheets" requires a
        successful Google Sheets connection before any read or write.
        """
        requested = (mode or "sheets").strip().lower()
        self.fail_writes = bool(fail_writes)
        self.client = None
        self.spreadsheet = None
        self.is_connected = False
        if requested == "memory":
            self.storage_mode = "memory"
            self.storage_error = ""
            logger.info("In-memory storage explicitly enabled for this process.")
            return
        self.storage_mode = "sheets"
        self.storage_error = storage_error or ""
        if storage_error:
            return
        self.init_connection()

    def durable_ready(self) -> bool:
        if self.storage_mode == "memory":
            return True
        return bool(self.is_connected and self.spreadsheet is not None)

    def init_connection(self):
        """Connect to Google Sheets. Never falls back to in-memory storage."""
        if self.storage_mode == "memory":
            self.is_connected = False
            self.storage_error = ""
            return

        self.is_connected = False
        self.client = None
        self.spreadsheet = None

        spreadsheet_id = (SALES_GOOGLE_SPREADSHEET_ID or "").strip()
        if not spreadsheet_id:
            self.storage_error = (
                "SALES_GOOGLE_SPREADSHEET_ID is not configured. "
                "In-memory storage is not used for normal operation."
            )
            logger.error(self.storage_error)
            return

        try:
            import gspread
            from google.oauth2.service_account import Credentials

            scopes = [
                "https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/drive",
            ]

            creds = None
            raw_json = (SALES_GOOGLE_SERVICE_ACCOUNT_JSON or "").strip()
            if raw_json:
                info = json.loads(raw_json)
                creds = Credentials.from_service_account_info(info, scopes=scopes)

            key_file = (SALES_GOOGLE_SERVICE_ACCOUNT_FILE or "").strip()
            if creds is None and key_file and os.path.exists(key_file):
                creds = Credentials.from_service_account_file(key_file, scopes=scopes)

            if creds is None:
                self.storage_error = (
                    "Google service account credentials are missing or invalid. "
                    "In-memory storage is not used."
                )
                logger.error(self.storage_error)
                return

            self.client = gspread.authorize(creds)
            self.spreadsheet = self.client.open_by_key(spreadsheet_id)
            self.is_connected = True
            self.storage_error = ""
            logger.info("Connected to Google Sheet for sales storage.")
        except Exception as exc:
            self.is_connected = False
            self.client = None
            self.spreadsheet = None
            self.storage_error = (
                "Google Sheets connection failed. In-memory storage is not used. "
                f"{exc}"
            )
            logger.error(self.storage_error)

    def require_durable(self):
        if self.storage_mode == "memory":
            return
        if not self.durable_ready():
            raise StorageUnavailable(
                self.storage_error
                or "Durable Google Sheets storage is unavailable. The record was not saved."
            )

    def _reject_forced_write_failure(self):
        if self.fail_writes:
            raise StorageUnavailable("Durable write failed. The record was not saved.")

    def get_records(self, tab_name: str) -> List[Dict[str, Any]]:
        """Fetch rows. In sheets mode this never returns the in-memory store."""
        if self.storage_mode == "memory":
            return self.memory_store.get(tab_name, [])

        self.require_durable()
        try:
            worksheet = self.spreadsheet.worksheet(tab_name)
            return worksheet.get_all_records()
        except Exception as exc:
            raise StorageUnavailable(f"Failed to read {tab_name} from Google Sheets: {exc}") from exc

    def append_record(self, tab_name: str, record: Dict[str, Any], raise_on_error: bool = False) -> bool:
        """Append a row. Returns True only after the active storage mode accepts it."""
        self._reject_forced_write_failure()
        if self.storage_mode == "memory":
            self.memory_store.setdefault(tab_name, []).append(dict(record))
            return True

        self.require_durable()
        try:
            worksheet = self.spreadsheet.worksheet(tab_name)
            headers = worksheet.row_values(1)
            if not headers:
                headers = list(record.keys())
                worksheet.append_row(headers)
            row = [record.get(h, "") for h in headers]
            worksheet.append_row(row)
            return True
        except StorageUnavailable:
            raise
        except Exception as exc:
            message = f"Failed to append to {tab_name} in Google Sheets. The record was not saved. {exc}"
            logger.error(message)
            raise StorageUnavailable(message) from exc

    def delete_record(self, tab_name: str, id_field: str, id_value: str) -> bool:
        """Delete a row. Used for rollback. Does not report success if the sheet delete fails."""
        if self.storage_mode == "memory":
            items = self.memory_store.get(tab_name, [])
            kept = [item for item in items if str(item.get(id_field)) != str(id_value)]
            self.memory_store[tab_name] = kept
            return len(kept) < len(items)

        self.require_durable()
        try:
            worksheet = self.spreadsheet.worksheet(tab_name)
            records = worksheet.get_all_records()
            for idx, row in enumerate(records, start=2):
                if str(row.get(id_field)) == str(id_value):
                    worksheet.delete_rows(idx)
                    return True
            return False
        except Exception as exc:
            raise StorageUnavailable(f"Failed to delete from {tab_name} in Google Sheets: {exc}") from exc

    def update_record(self, tab_name: str, id_field: str, id_value: str, updates: Dict[str, Any]) -> bool:
        """Update a row. A sheets failure raises instead of returning a memory-only success."""
        self._reject_forced_write_failure()
        if self.storage_mode == "memory":
            found = False
            for item in self.memory_store.get(tab_name, []):
                if str(item.get(id_field)) == str(id_value):
                    item.update(updates)
                    found = True
                    break
            return found

        self.require_durable()
        try:
            worksheet = self.spreadsheet.worksheet(tab_name)
            records = worksheet.get_all_records()
            headers = worksheet.row_values(1)
            header_map = {str(h).strip().lower(): i + 1 for i, h in enumerate(headers)}
            for idx, row in enumerate(records, start=2):
                val = row.get(id_field)
                if val is None:
                    for key, value in row.items():
                        if str(key).strip().lower() == str(id_field).strip().lower():
                            val = value
                            break
                if str(val) == str(id_value):
                    for key, value in updates.items():
                        column = header_map.get(str(key).strip().lower())
                        if column:
                            worksheet.update_cell(idx, column, value)
                    return True
            return False
        except Exception as exc:
            raise StorageUnavailable(f"Failed to update {tab_name} in Google Sheets: {exc}") from exc

    def generate_id(self, tab_name: str) -> str:
        """Generate a human-readable id from the current tab length."""
        prefix = ID_PREFIXES.get(tab_name, tab_name[:3].upper())
        records = self.get_records(tab_name)
        seq = len(records) + 1
        return f"{prefix}-{str(seq).zfill(6)}"

    def log_audit(
        self,
        actor: str,
        action: str,
        entity_type: str,
        entity_id: str,
        field_changed: str = "",
        old_val: str = "",
        new_val: str = "",
        reason: str = "",
        approved_by: str = "",
        related_id: str = "",
    ):
        """Append an audit row. Audit text must not include secrets or passwords."""
        audit_id = self.generate_id("AuditLog")
        record = {
            "audit_id": audit_id,
            "event_datetime": datetime.utcnow().isoformat(),
            "actor_user_id": actor,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "field_changed": field_changed,
            "old_value": str(old_val),
            "new_value": str(new_val),
            "reason": reason,
            "approved_by_user_id": approved_by,
            "related_record_id": related_id,
        }
        self.append_record("AuditLog", record)


db = SheetsDatabase()
