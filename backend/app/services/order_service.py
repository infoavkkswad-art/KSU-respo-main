from fastapi import HTTPException
import random
import string
from datetime import datetime
from pymongo.errors import DuplicateKeyError # Import specific error
from ..database import get_database
from ..models.product import find_sku_in_backend
from ..models.order import CreateOrderRequest, OrderDocument, OrderItemSnapshot, OrderTrackingResponse, PublicCustomerSnapshot

def generate_backend_order_id() -> str:
    ts = str(int(datetime.utcnow().timestamp()))[-6:]
    rand = ''.join(random.choices(string.ascii_uppercase + string.digits, k=3))
    return f"KS-{ts}{rand}"

async def process_and_save_order(payload: CreateOrderRequest):
    db = get_database()
    orders_collection = db["orders"]

    # 1. Idempotency Check
    if payload.idempotencyKey:
        existing = await orders_collection.find_one({"idempotencyKey": payload.idempotencyKey})
        if existing:
            existing.pop("_id", None)
            return existing

    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty.")

    subtotal = 0
    max_shipping = 0
    item_snapshots = []

    # 2. Server-side validation & Authoritative price calculation
    for item in payload.items:
        family, sku_obj = find_sku_in_backend(item.sku)
        if not family or not sku_obj:
            raise HTTPException(status_code=400, detail=f"Invalid or unknown SKU: {item.sku}")

        qty = item.quantity
        unit_price = sku_obj["websitePrice"]
        item_subtotal = unit_price * qty
        item_shipping = 0 if sku_obj["freeShipping"] else (sku_obj["shipping"] * qty)

        subtotal += item_subtotal
        max_shipping = max(max_shipping, item_shipping)

        item_snapshots.append(
            OrderItemSnapshot(
                sku=sku_obj["sku"],
                quantity=qty,
                unitPrice=unit_price,
                productNameSnapshot=family["name"],
                packSizeSnapshot=sku_obj["packSize"]
            ).model_dump()
        )

    final_total = subtotal + max_shipping
    order_id = generate_backend_order_id()

    # 3. Construct Order Document
    order_doc = OrderDocument(
        orderId=order_id,
        customer=payload.customer,
        items=item_snapshots,
        subtotal=subtotal,
        shipping=max_shipping,
        total=final_total,
        status="pending",
        idempotencyKey=payload.idempotencyKey
    )

    doc_dict = order_doc.model_dump()

    # 4. Save to MongoDB with duplicate key handling
    try:
        await orders_collection.insert_one(doc_dict)
    except DuplicateKeyError:
        # If insertion failed due to duplicate idempotencyKey, fetch the existing record
        existing = await orders_collection.find_one({"idempotencyKey": payload.idempotencyKey})
        if existing:
            existing.pop("_id", None)
            return existing
        raise HTTPException(status_code=500, detail="Order could not be processed.")
    
    doc_dict.pop("_id", None)
    return doc_dict

async def get_order_by_id_and_phone(order_id: str, phone: str):
    db = get_database()
    orders_collection = db["orders"]

    # Normalize inputs
    clean_order_id = order_id.strip().upper()
    clean_phone = phone.strip()

    order = await orders_collection.find_one({"orderId": clean_order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    # Verify phone number matches customer record securely
    stored_phone = order.get("customer", {}).get("phone", "")
    if stored_phone != clean_phone:
        raise HTTPException(status_code=404, detail="Order not found with provided details.")

    customer_info = order.get("customer", {})
    raw_phone = customer_info.get("phone", "----------")
    masked_phone = f"******{raw_phone[-4:]}" if len(raw_phone) >= 4 else "******"

    return OrderTrackingResponse(
        orderId=order["orderId"],
        status=order.get("status", "pending"),
        customer=PublicCustomerSnapshot(
            fullName=customer_info.get("fullName", "Valued Customer"),
            phoneMasked=masked_phone,
            city=customer_info.get("city", ""),
            state=customer_info.get("state", "")
        ),
        items=order.get("items", []),
        subtotal=order.get("subtotal", 0),
        shipping=order.get("shipping", 0),
        total=order.get("total", 0),
        createdAt=order.get("createdAt", datetime.utcnow())
    )
