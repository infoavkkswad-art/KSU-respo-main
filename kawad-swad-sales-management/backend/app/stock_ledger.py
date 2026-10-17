"""Stock balance rules shared by the stock screen, billing, and dashboard.

Quantities stay in the product's own unit. Packet counts and kilograms are
never converted. Balances are not clamped to zero.
"""

from datetime import datetime
from typing import Dict, List, Optional, Tuple

from fastapi import HTTPException, status

TXN_ALIASES = {
    "COMPANY_RECEIPT": "COMPANY_RECEIPT",
    "OPENING": "COMPANY_RECEIPT",
    "OPENING_STOCK": "COMPANY_RECEIPT",
    "ISSUE_TO_SALESMAN": "ISSUE_TO_SALESMAN",
    "ISSUED": "ISSUE_TO_SALESMAN",
    "RETURN_FROM_SALESMAN": "RETURN_FROM_SALESMAN",
    "RETURNED": "RETURN_FROM_SALESMAN",
    "POSITIVE_ADJUSTMENT": "POSITIVE_ADJUSTMENT",
    "COMPANY_ADJUSTMENT": "POSITIVE_ADJUSTMENT",
    "SALESMAN_ADJUSTMENT": "SALESMAN_ADJUSTMENT",
    "SOLD_DELIVERY": "SOLD_DELIVERY",
    "SALE_DELIVERY": "SOLD_DELIVERY",
    "SOLD": "SOLD_DELIVERY",
    "COMPANY_SOLD": "COMPANY_SOLD",
}

MANUAL_TYPES = {
    "COMPANY_RECEIPT",
    "ISSUE_TO_SALESMAN",
    "RETURN_FROM_SALESMAN",
    "POSITIVE_ADJUSTMENT",
    "SALESMAN_ADJUSTMENT",
}

SALE_ONLY_TYPES = {"SOLD_DELIVERY", "COMPANY_SOLD"}

WAREHOUSE_INCREASE = {"COMPANY_RECEIPT", "POSITIVE_ADJUSTMENT", "RETURN_FROM_SALESMAN"}
WAREHOUSE_DECREASE = {"ISSUE_TO_SALESMAN", "COMPANY_SOLD"}
SALESMAN_INCREASE = {"ISSUE_TO_SALESMAN", "SALESMAN_ADJUSTMENT"}
SALESMAN_DECREASE = {"RETURN_FROM_SALESMAN", "SOLD_DELIVERY"}


def canonical_txn_type(raw: str) -> str:
    key = str(raw or "").strip().upper()
    if key not in TXN_ALIASES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported stock transaction type '{raw}'.",
        )
    return TXN_ALIASES[key]


def normalize_unit(raw: str) -> str:
    key = str(raw or "").strip().upper()
    if key in {"KG", "KGS", "KILOGRAM", "KILOGRAMS"}:
        return "KG"
    if key in {"PACKET", "PACKETS", "PKT", "PKTS", "PACK"}:
        return "PACKET"
    return key


def product_unit(product: dict) -> str:
    unit = normalize_unit(str(product.get("selling_unit") or "PACKET"))
    if unit not in {"PACKET", "KG"}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Product {product.get('sku') or product.get('product_id')} uses unsupported stock unit '{product.get('selling_unit')}'.",
        )
    return unit


def product_is_active(product: dict) -> bool:
    value = product.get("active", True)
    if isinstance(value, bool):
        return value
    if value is None or str(value).strip() == "":
        return True
    return str(value).strip().lower() in {"true", "1", "yes", "y", "active"}


def parse_quantity(quantity, unit: str) -> float:
    try:
        value = float(quantity)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Quantity must be a number greater than zero.",
        )
    if value <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Quantity must be greater than zero.",
        )
    if unit == "PACKET":
        if abs(value - round(value)) > 1e-9:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Packaged products use whole packet counts. Kilograms are only allowed when the product stock unit is KG.",
            )
        return float(int(round(value)))
    if unit == "KG":
        return value
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=f"Unsupported stock unit '{unit}'.",
    )


def parse_txn_datetime(raw: Optional[str]) -> str:
    if raw is None or str(raw).strip() == "":
        return datetime.utcnow().isoformat()
    text = str(raw).strip().replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Transaction date must be an ISO date or date-time.",
        )
    return parsed.isoformat()


def balances_from_ledger(records: List[dict]) -> Tuple[Dict[str, float], Dict[Tuple[str, str], float]]:
    """Return warehouse balances and (salesman, product) balances. Negatives are kept."""
    company: Dict[str, float] = {}
    salesman: Dict[Tuple[str, str], float] = {}

    for txn in records:
        product_id = str(txn.get("product_id", "")).strip()
        if not product_id:
            continue
        try:
            txn_type = canonical_txn_type(str(txn.get("txn_type", "")))
        except HTTPException:
            continue
        try:
            magnitude = abs(float(txn.get("quantity", 0) or 0))
        except (TypeError, ValueError):
            continue
        user_id = str(txn.get("salesman_user_id", "")).strip()

        if txn_type in WAREHOUSE_INCREASE:
            company[product_id] = company.get(product_id, 0.0) + magnitude
        elif txn_type in WAREHOUSE_DECREASE:
            company[product_id] = company.get(product_id, 0.0) - magnitude

        if not user_id:
            continue
        key = (user_id, product_id)
        if txn_type in SALESMAN_INCREASE:
            salesman[key] = salesman.get(key, 0.0) + magnitude
        elif txn_type in SALESMAN_DECREASE:
            salesman[key] = salesman.get(key, 0.0) - magnitude

    return company, salesman


def assert_manual_permission(current_user: dict, txn_type: str, salesman_user_id: str) -> str:
    role = str(current_user.get("role", "")).upper()
    canonical = canonical_txn_type(txn_type)
    if canonical in SALE_ONLY_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Sales deduct stock from the billing screen. Do not post a manual sold movement.",
        )
    if canonical not in MANUAL_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Stock type {canonical} cannot be posted manually.",
        )
    if role in {"OWNER", "OWNER_ADMIN", "PA"}:
        if canonical in {"ISSUE_TO_SALESMAN", "RETURN_FROM_SALESMAN", "SALESMAN_ADJUSTMENT"} and not salesman_user_id:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Select the salesman for this stock movement.",
            )
        return canonical
    if role == "SALESMAN" and canonical == "RETURN_FROM_SALESMAN":
        actor = str(current_user.get("user_id", "")).strip()
        if salesman_user_id and salesman_user_id != actor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="A salesman can return only their own assigned stock.",
            )
        return canonical
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You cannot record this stock movement.",
    )


def find_idempotent(records: List[dict], key: str) -> Optional[dict]:
    marker = f"[idemp:{key}]"
    for row in records:
        notes = str(row.get("notes", ""))
        if marker in notes:
            return row
        if str(row.get("reference_id", "")).strip() == f"idemp:{key}":
            return row
    return None
