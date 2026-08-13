import time
import datetime
from typing import Dict, List
from fastapi import APIRouter, status, Query, Request, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
import razorpay
from ..database import get_database
from ..config import settings
from ..models.order import CreateOrderRequest, OrderTrackingResponse, VerifyPaymentRequest
from ..services.order_service import process_and_save_order, get_order_by_id_and_phone
from ..services.google_sheets_service import post_to_google_apps_script

router = APIRouter(prefix="/api", tags=["Orders"])

razorpay_client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))

_RATE_LIMIT_STORE: Dict[str, List[float]] = {}
MAX_LOOKUPS_PER_MINUTE = 10

def apply_rate_limit(client_ip: str):
    now = time.time()
    history = _RATE_LIMIT_STORE.get(client_ip, [])
    history = [ts for ts in history if now - ts < 60]
    if len(history) >= MAX_LOOKUPS_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many tracking lookup requests. Please wait a minute before trying again."
        )
    history.append(now)
    _RATE_LIMIT_STORE[client_ip] = history

@router.post("/orders", status_code=status.HTTP_201_CREATED)
async def create_order(payload: CreateOrderRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    order = await process_and_save_order(payload)
    
    existing_order = await db.orders.find_one({"orderId": order.orderId})
    if not existing_order:
        raise HTTPException(status_code=500, detail="Failed to retrieve created order record.")

    total_amount = existing_order["total"]
    amount_in_paise = int(round(total_amount * 100))

    razorpay_order_id = existing_order.get("razorpayOrderId")
    if not razorpay_order_id:
        try:
            rzp_order = razorpay_client.order.create({
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": order.orderId,
                "notes": {"orderId": order.orderId}
            })
            razorpay_order_id = rzp_order["id"]
            await db.orders.update_one(
                {"orderId": order.orderId},
                {"$set": {"razorpayOrderId": razorpay_order_id, "paymentStatus": "pending"}}
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to initialize Razorpay order: {str(e)}")

    response_data = order.dict()
    response_data["razorpayOrderId"] = razorpay_order_id
    response_data["razorpayKeyId"] = settings.razorpay_key_id
    response_data["amount"] = amount_in_paise
    response_data["currency"] = "INR"
    response_data["paymentStatus"] = existing_order.get("paymentStatus", "pending")
    return response_data

@router.post("/orders/verify-payment")
async def verify_payment(payload: VerifyPaymentRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    existing_order = await db.orders.find_one({"razorpayOrderId": payload.razorpay_order_id})
    if not existing_order:
        raise HTTPException(status_code=404, detail="Order reference not found for this payment session.")

    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': payload.razorpay_order_id,
            'razorpay_payment_id': payload.razorpay_payment_id,
            'razorpay_signature': payload.razorpay_signature
        })
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid cryptographic payment signature.")

    try:
        payment_details = razorpay_client.payment.fetch(payload.razorpay_payment_id)
        if payment_details.get("status") != "captured":
            raise HTTPException(status_code=400, detail="Payment has not been fully captured yet.")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Unable to verify payment capture status with gateway.")

    updated_order = await db.orders.find_one_and_update(
        {
            "razorpayOrderId": payload.razorpay_order_id,
            "paymentStatus": "pending"
        },
        {
            "$set": {
                "paymentStatus": "paid",
                "status": "confirmed",
                "razorpayPaymentId": payload.razorpay_payment_id
            }
        },
        return_document=True
    )

    if updated_order:
        try:
            customer_data = updated_order.get("customer", {})
            formatted_items = ", ".join([f"{i.get('productNameSnapshot', i.get('sku'))} (x{i.get('quantity')})" for i in updated_order.get("items", [])])
            
            sheets_payload = {
                "type": "order",
                "data": {
                    "orderId": updated_order["orderId"],
                    "createdAt": updated_order["createdAt"].isoformat() if hasattr(updated_order["createdAt"], "isoformat") else str(updated_order["createdAt"]),
                    "customerName": customer_data.get("fullName"),
                    "phone": customer_data.get("phone"),
                    "email": customer_data.get("email"),
                    "address": f"{customer_data.get('address')}, {customer_data.get('city')}, {customer_data.get('state')} - {customer_data.get('pincode')}",
                    "items": formatted_items,
                    "subtotal": updated_order["subtotal"],
                    "shipping": updated_order["shipping"],
                    "total": updated_order["total"],
                    "paymentStatus": "paid",
                    "orderStatus": "confirmed"
                }
            }
            await post_to_google_apps_script(sheets_payload)
        except Exception as sync_err:
            print(f"Warning: Google Sheets sync failed during verification: {str(sync_err)}")
    else:
        already_paid_order = await db.orders.find_one({"razorpayOrderId": payload.razorpay_order_id})
        if not already_paid_order or already_paid_order.get("paymentStatus") != "paid":
            raise HTTPException(status_code=400, detail="Order state transition error.")

    return {
        "success": True,
        "message": "Payment verified and order confirmed successfully.",
        "orderId": existing_order["orderId"]
    }

@router.post("/webhooks/razorpay", include_in_schema=False)
async def razorpay_webhook(request: Request, db: AsyncIOMotorDatabase = Depends(get_database)):
    event_id = request.headers.get("X-Razorpay-Event-Id")
    webhook_signature = request.headers.get("X-Razorpay-Signature")

    if not webhook_signature:
        raise HTTPException(status_code=400, detail="Missing webhook signature header.")

    raw_body = await request.body()
    try:
        razorpay_client.utility.verify_webhook_signature(
            raw_body.decode("utf-8"),
            webhook_signature,
            settings.razorpay_webhook_secret
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Webhook signature verification failed.")

    event_data = await request.json()
    resolved_event_id = event_id or event_data.get("event_id")
    event_type = event_data.get("event")

    if resolved_event_id:
        existing_event = await db.webhook_events.find_one({"eventId": resolved_event_id})
        if existing_event:
            return {"status": "already_processed"}
        try:
            await db.webhook_events.insert_one({"eventId": resolved_event_id, "event": event_type, "createdAt": datetime.datetime.utcnow()})
        except Exception:
            return {"status": "already_processed"}

    payload_entity = event_data.get("payload", {}).get("payment", {}).get("entity", {}) or event_data.get("payload", {}).get("order", {}).get("entity", {})
    razorpay_order_id = payload_entity.get("order_id") or payload_entity.get("id")

    if razorpay_order_id:
        if event_type in ["payment.captured", "order.paid"]:
            updated_order = await db.orders.find_one_and_update(
                {
                    "razorpayOrderId": razorpay_order_id,
                    "paymentStatus": "pending"
                },
                {
                    "$set": {
                        "paymentStatus": "paid",
                        "status": "confirmed"
                    }
                },
                return_document=True
            )

            if updated_order:
                try:
                    customer_data = updated_order.get("customer", {})
                    formatted_items = ", ".join([f"{i.get('productNameSnapshot', i.get('sku'))} (x{i.get('quantity')})" for i in updated_order.get("items", [])])
                    
                    sheets_payload = {
                        "type": "order",
                        "data": {
                            "orderId": updated_order["orderId"],
                            "createdAt": updated_order["createdAt"].isoformat() if hasattr(updated_order["createdAt"], "isoformat") else str(updated_order["createdAt"]),
                            "customerName": customer_data.get("fullName"),
                            "phone": customer_data.get("phone"),
                            "email": customer_data.get("email"),
                            "address": f"{customer_data.get('address')}, {customer_data.get('city')}, {customer_data.get('state')} - {customer_data.get('pincode')}",
                            "items": formatted_items,
                            "subtotal": updated_order["subtotal"],
                            "shipping": updated_order["shipping"],
                            "total": updated_order["total"],
                            "paymentStatus": "paid",
                            "orderStatus": "confirmed"
                        }
                    }
                    await post_to_google_apps_script(sheets_payload)
                except Exception as sheet_err:
                    print(f"Warning: Google Sheets sync failed in webhook: {str(sheet_err)}")
        elif event_type == "payment.failed":
            await db.orders.update_one(
                {"razorpayOrderId": razorpay_order_id, "paymentStatus": "pending"},
                {"$set": {"paymentStatus": "failed"}}
            )

    return {"status": "ok"}

@router.get("/orders/{order_id}", response_model=OrderTrackingResponse)
async def track_order(
    order_id: str,
    request: Request,
    phone: str = Query(..., min_length=10, max_length=10, description="Customer 10-digit phone number for verification")
):
    client_ip = request.client.host if request.client else "unknown"
    apply_rate_limit(client_ip)
    order = await get_order_by_id_and_phone(order_id, phone)
    return order
