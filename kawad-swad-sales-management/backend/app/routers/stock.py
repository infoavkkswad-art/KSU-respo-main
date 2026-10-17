from typing import List, Union
from fastapi import APIRouter, HTTPException, status, Depends
from app.models import (
    StockSummaryResponse,
    StockTransaction,
    StockIssueCreate,
    StockMovementCreate,
    StockBatchCreate,
    CompanyStockItem,
    SalesmanStockItem,
)
from app.sheets import db, StorageUnavailable
from app.auth import get_current_user
from app.stock_ledger import (
    assert_manual_permission,
    balances_from_ledger,
    find_idempotent,
    parse_quantity,
    parse_txn_datetime,
    product_unit,
    normalize_unit,
)

router = APIRouter(prefix="/api/stock", tags=["Stock"])


def _as_transaction(row: dict) -> StockTransaction:
    notes = str(row.get("notes", ""))
    return StockTransaction(
        stock_txn_id=str(row.get("stock_txn_id", "")),
        txn_datetime=str(row.get("txn_datetime", "")),
        salesman_user_id=str(row.get("salesman_user_id", "")),
        product_id=str(row.get("product_id", "")),
        sku_snapshot=str(row.get("sku_snapshot", "")),
        txn_type=str(row.get("txn_type", "")),
        quantity=float(row.get("quantity", 0) or 0),
        unit=str(row.get("unit", "PACKET")),
        pack_weight_g=int(row.get("pack_weight_g", 0) or 0),
        related_sale_id=str(row.get("related_sale_id", "")),
        issued_by_user_id=str(row.get("issued_by_user_id", "")),
        received_by_user_id=str(row.get("received_by_user_id", "")),
        confirmed_by_user_id=str(row.get("confirmed_by_user_id", "")),
        reference_id=str(row.get("reference_id", "")),
        notes=notes,
    )


def _movement_from_issue(req: Union[StockIssueCreate, StockMovementCreate]) -> StockMovementCreate:
    if isinstance(req, StockMovementCreate):
        return req
    return StockMovementCreate(
        product_id=req.product_id,
        salesman_user_id=req.salesman_user_id or "",
        txn_type=req.txn_type,
        quantity=req.quantity,
        unit=req.unit or "",
        notes=req.notes or "",
        reason=req.reason or "",
        reference_id=req.reference_id or "",
        idempotency_key=req.idempotency_key or "",
        txn_datetime=req.txn_datetime or "",
    )


def record_stock_movement(req: StockMovementCreate, current_user: dict) -> StockTransaction:
    """Validate and append one ledger row. Replays the original row when the key matches."""
    key = str(req.idempotency_key or "").strip()
    if not key or len(key) > 120:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A unique idempotency_key is required so a stock movement is not saved twice.",
        )

    salesman_user_id = str(req.salesman_user_id or "").strip()
    txn_type = assert_manual_permission(current_user, req.txn_type, salesman_user_id)
    if str(current_user.get("role", "")).upper() == "SALESMAN":
        salesman_user_id = str(current_user.get("user_id", "")).strip()

    ledger = db.get_records("SalesmanStockLedger")
    existing = find_idempotent(ledger, key)
    if existing:
        return _as_transaction(existing)

    products = db.get_records("Products")
    product = next((p for p in products if str(p.get("product_id")) == str(req.product_id).strip()), None)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    unit = product_unit(product)
    requested_unit = normalize_unit(req.unit or unit)
    if requested_unit != unit:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"This product is stocked in {unit}. {requested_unit} cannot be mixed with that unit.",
        )
    quantity = parse_quantity(req.quantity, unit)

    company_bal, salesman_bal = balances_from_ledger(ledger)
    product_id = str(product.get("product_id"))
    if txn_type == "ISSUE_TO_SALESMAN":
        available = company_bal.get(product_id, 0.0)
        if available < quantity:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Warehouse stock is {available} {unit}. Cannot issue {quantity}.",
            )
    if txn_type == "RETURN_FROM_SALESMAN":
        available = salesman_bal.get((salesman_user_id, product_id), 0.0)
        if available < quantity:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Salesman stock is {available} {unit}. Cannot return {quantity}.",
            )

    reason = str(req.reason or req.notes or "").strip()
    if txn_type == "COMPANY_RECEIPT" and len(reason) < 3:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Opening stock requires a short reason, such as the physical count reference.",
        )

    actor = str(current_user.get("user_id", "")).strip()
    txn_datetime = parse_txn_datetime(req.txn_datetime)
    stock_txn_id = db.generate_id("SalesmanStockLedger")
    notes = f"[idemp:{key}] {reason}".strip()
    reference = str(req.reference_id or "").strip() or f"idemp:{key}"
    record = {
        "stock_txn_id": stock_txn_id,
        "txn_datetime": txn_datetime,
        "salesman_user_id": salesman_user_id,
        "product_id": product_id,
        "sku_snapshot": str(product.get("sku", product_id)),
        "txn_type": txn_type,
        "quantity": quantity,
        "unit": unit,
        "pack_weight_g": int(product.get("pack_weight_g", 0) or 0),
        "related_sale_id": "",
        "issued_by_user_id": actor,
        "received_by_user_id": salesman_user_id,
        "confirmed_by_user_id": actor,
        "reference_id": reference,
        "notes": notes,
    }
    try:
        db.append_record("SalesmanStockLedger", record)
    except StorageUnavailable as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=exc.message) from exc

    db.log_audit(
        actor=actor,
        action="STOCK_MOVEMENT",
        entity_type="SalesmanStockLedger",
        entity_id=stock_txn_id,
        reason=f"{txn_type} {quantity} {unit} of {record['sku_snapshot']}",
    )
    return _as_transaction(record)


@router.get("/summary", response_model=StockSummaryResponse)
async def get_stock_summary(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id")
    role = str(current_user.get("role", "")).upper()
    products = db.get_records("Products")
    transactions = db.get_records("SalesmanStockLedger")
    users = db.get_records("Users")
    names = {str(u.get("user_id")): str(u.get("full_name") or u.get("user_id")) for u in users}
    company_bal, salesman_bal = balances_from_ledger(transactions)

    company_stock = []
    for product in products:
        product_id = str(product.get("product_id", "")).strip()
        if not product_id:
            continue
        balance = float(company_bal.get(product_id, 0.0))
        try:
            unit = product_unit(product)
        except HTTPException:
            unit = str(product.get("selling_unit") or "")
        company_stock.append(CompanyStockItem(
            product_id=product_id,
            sku=str(product.get("sku", product_id)),
            product_name=str(product.get("product_name", "")),
            current_stock=balance,
            company_quantity=balance,
            unit=unit,
            pack_weight_g=int(product.get("pack_weight_g", 0) or 0),
        ))

    salesman_stock = []
    for (salesman_id, product_id), balance in salesman_bal.items():
        if role not in ["OWNER", "OWNER_ADMIN", "PA"] and salesman_id != user_id:
            continue
        product = next((p for p in products if str(p.get("product_id")) == product_id), {})
        try:
            unit = product_unit(product) if product else "PACKET"
        except HTTPException:
            unit = str(product.get("selling_unit") or "PACKET")
        salesman_stock.append(SalesmanStockItem(
            salesman_user_id=salesman_id,
            salesman_name=names.get(salesman_id, salesman_id),
            product_id=product_id,
            sku=str(product.get("sku", product_id)),
            product_name=str(product.get("product_name", "")),
            current_stock=balance,
            quantity=balance,
            unit=unit,
        ))

    return StockSummaryResponse(company_stock=company_stock, salesman_stock=salesman_stock)


@router.get("/transactions", response_model=List[StockTransaction])
async def list_stock_transactions(limit: int = 250, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id")
    role = str(current_user.get("role", "")).upper()
    rows = db.get_records("SalesmanStockLedger")
    visible = []
    for row in rows:
        salesman_id = str(row.get("salesman_user_id", ""))
        if role not in ["OWNER", "OWNER_ADMIN", "PA"] and salesman_id != user_id:
            continue
        visible.append(_as_transaction(row))
    return list(reversed(visible[-limit:]))


@router.post("/transactions", response_model=StockTransaction)
async def create_stock_transaction(req: StockMovementCreate, current_user: dict = Depends(get_current_user)):
    return record_stock_movement(req, current_user)


@router.post("/issue", response_model=StockTransaction)
async def record_stock_issue(req: StockIssueCreate, current_user: dict = Depends(get_current_user)):
    """Same validation as /transactions. Kept so older clients are not a second code path."""
    return record_stock_movement(_movement_from_issue(req), current_user)


@router.post("/transactions/batch", response_model=List[StockTransaction])
async def create_stock_batch(req: StockBatchCreate, current_user: dict = Depends(get_current_user)):
    """Sequential batch. Google Sheets writes are not atomic across rows."""
    if not req.movements:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Add at least one stock line.")
    saved: List[StockTransaction] = []
    for line in req.movements:
        try:
            saved.append(record_stock_movement(line, current_user))
        except HTTPException as exc:
            if not saved:
                raise
            saved_ids = ", ".join(item.stock_txn_id for item in saved)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "This batch is not atomic. Google Sheets saved the earlier lines "
                    f"({saved_ids}). Do not submit those idempotency keys again. "
                    f"Stopped on {line.product_id}: {exc.detail}"
                ),
            ) from exc
    return saved
