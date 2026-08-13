import time
import datetime
import traceback
from typing import Dict, List

from fastapi import (
    APIRouter,
    status,
    Query,
    Request,
    HTTPException,
    Depends,
)
from motor.motor_asyncio import AsyncIOMotorDatabase

import razorpay

from ..database import get_database
from ..config import settings
from ..models.order import (
    CreateOrderRequest,
    OrderTrackingResponse,
    VerifyPaymentRequest,
)
from ..services.order_service import (
    process_and_save_order,
    get_order_by_id_and_phone,
)
from ..services.google_sheets_service import (
    post_to_google_apps_script,
)


router = APIRouter(prefix="/api", tags=["Orders"])


# ============================================================
# RAZORPAY CLIENT
# ============================================================

razorpay_client = razorpay.Client(
    auth=(
        settings.razorpay_key_id,
        settings.razorpay_key_secret,
    )
)


# ============================================================
# ORDER TRACKING RATE LIMIT
# ============================================================

_RATE_LIMIT_STORE: Dict[str, List[float]] = {}

MAX_LOOKUPS_PER_MINUTE = 10


def apply_rate_limit(client_ip: str):
    now = time.time()

    history = _RATE_LIMIT_STORE.get(client_ip, [])

    history = [
        ts
        for ts in history
        if now - ts < 60
    ]

    if len(history) >= MAX_LOOKUPS_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                "Too many tracking lookup requests. "
                "Please wait a minute before trying again."
            ),
        )

    history.append(now)

    _RATE_LIMIT_STORE[client_ip] = history


# ============================================================
# CREATE ORDER
# ============================================================

@router.post(
    "/orders",
    status_code=status.HTTP_201_CREATED,
)
async def create_order(
    payload: CreateOrderRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Create the authoritative MongoDB order first.

    Then create a Razorpay order using the configured
    Razorpay credentials.

    The response contains everything required by the frontend
    Razorpay Checkout integration.
    """

    try:

        # --------------------------------------------------------
        # 1. CREATE ORDER USING EXISTING ORDER SERVICE
        # --------------------------------------------------------

        print("========== CREATE ORDER START ==========")

        print(
            f"Creating order for customer: "
            f"{getattr(payload.customer, 'fullName', 'unknown')}"
        )

        order = await process_and_save_order(payload)

        print(
            f"process_and_save_order returned type: "
            f"{type(order).__name__}"
        )

        # --------------------------------------------------------
        # 2. NORMALIZE SERVICE RESULT
        # --------------------------------------------------------

        if isinstance(order, dict):

            order_data = order

        elif hasattr(order, "model_dump"):

            order_data = order.model_dump()

        elif hasattr(order, "dict"):

            order_data = order.dict()

        else:

            print(
                "ERROR: Invalid order object returned from "
                "process_and_save_order()"
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Invalid order record returned by order service."
                ),
            )

        print(
            f"Order data keys: "
            f"{list(order_data.keys())}"
        )

        # --------------------------------------------------------
        # 3. GET ORDER ID
        # --------------------------------------------------------

        order_id = order_data.get("orderId")

        if not order_id:

            print(
                "ERROR: Created order does not contain orderId."
            )

            raise HTTPException(
                status_code=500,
                detail="Created order is missing orderId.",
            )

        print(
            f"MongoDB order created: {order_id}"
        )

        # --------------------------------------------------------
        # 4. RETRIEVE AUTHORITATIVE MONGODB ORDER
        # --------------------------------------------------------

        existing_order = await db.orders.find_one(
            {
                "orderId": order_id
            }
        )

        if not existing_order:

            print(
                f"ERROR: MongoDB order not found: {order_id}"
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Failed to retrieve created order record."
                ),
            )

        print(
            "MongoDB order successfully retrieved."
        )

        # --------------------------------------------------------
        # 5. GET TOTAL
        # --------------------------------------------------------

        total_amount = existing_order.get("total")

        if total_amount is None:

            print(
                "ERROR: Order total is missing."
            )

            raise HTTPException(
                status_code=500,
                detail="Order total is missing.",
            )

        try:

            amount_in_paise = int(
                round(
                    float(total_amount) * 100
                )
            )

        except Exception as amount_error:

            print(
                "ERROR converting order amount:"
            )

            print(
                f"{type(amount_error).__name__}: "
                f"{str(amount_error)}"
            )

            raise HTTPException(
                status_code=500,
                detail="Invalid order amount.",
            )

        if amount_in_paise <= 0:

            print(
                f"ERROR: Invalid Razorpay amount: "
                f"{amount_in_paise}"
            )

            raise HTTPException(
                status_code=400,
                detail=(
                    "Order amount must be greater than zero."
                ),
            )

        print(
            f"Order total: ₹{total_amount}"
        )

        print(
            f"Razorpay amount: {amount_in_paise} paise"
        )

        # --------------------------------------------------------
        # 6. CHECK FOR EXISTING RAZORPAY ORDER
        # --------------------------------------------------------

        razorpay_order_id = existing_order.get(
            "razorpayOrderId"
        )

        if razorpay_order_id:

            print(
                f"Existing Razorpay order found: "
                f"{razorpay_order_id}"
            )

        # --------------------------------------------------------
        # 7. CREATE RAZORPAY ORDER
        # --------------------------------------------------------

        if not razorpay_order_id:

            print(
                "Creating new Razorpay order..."
            )

            try:

                rzp_order = razorpay_client.order.create(
                    {
                        "amount": amount_in_paise,
                        "currency": "INR",
                        "receipt": str(order_id),
                        "notes": {
                            "orderId": str(order_id)
                        },
                    }
                )

                print(
                    "Razorpay response received."
                )

                razorpay_order_id = rzp_order.get(
                    "id"
                )

                if not razorpay_order_id:

                    print(
                        "ERROR: Razorpay response did not "
                        "contain an order ID."
                    )

                    print(
                        f"Razorpay response: {rzp_order}"
                    )

                    raise Exception(
                        "Razorpay did not return an order ID."
                    )

                print(
                    f"Razorpay order created: "
                    f"{razorpay_order_id}"
                )

                # ------------------------------------------------
                # SAVE RAZORPAY ORDER ID TO MONGODB
                # ------------------------------------------------

                update_result = await db.orders.update_one(
                    {
                        "orderId": order_id
                    },
                    {
                        "$set": {
                            "razorpayOrderId": razorpay_order_id,
                            "paymentStatus": "pending",
                        }
                    },
                )

                print(
                    "MongoDB Razorpay fields updated."
                )

                print(
                    f"MongoDB modified count: "
                    f"{update_result.modified_count}"
                )

            except HTTPException:
                raise

            except Exception as razorpay_error:

                print(
                    "========== RAZORPAY CREATE ERROR =========="
                )

                print(
                    f"ERROR TYPE: "
                    f"{type(razorpay_error).__name__}"
                )

                print(
                    f"ERROR MESSAGE: "
                    f"{str(razorpay_error)}"
                )

                traceback.print_exc()

                print(
                    "============================================"
                )

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Failed to initialize payment gateway order: "
                        f"{type(razorpay_error).__name__}: "
                        f"{str(razorpay_error)}"
                    ),
                )

        # --------------------------------------------------------
        # 8. BUILD RESPONSE
        # --------------------------------------------------------

        response_data = dict(order_data)

        response_data["razorpayOrderId"] = (
            razorpay_order_id
        )

        response_data["razorpayKeyId"] = (
            settings.razorpay_key_id
        )

        response_data["amount"] = (
            amount_in_paise
        )

        response_data["currency"] = "INR"

        response_data["paymentStatus"] = (
            existing_order.get(
                "paymentStatus",
                "pending",
            )
        )

        print(
            "========== CREATE ORDER SUCCESS =========="
        )

        print(
            f"Order ID: {order_id}"
        )

        print(
            f"Razorpay Order ID: "
            f"{razorpay_order_id}"
        )

        print(
            "==========================================="
        )

        return response_data

    except HTTPException:
        raise

    except Exception as e:

        print(
            "========== CREATE ORDER ERROR =========="
        )

        print(
            f"ERROR TYPE: {type(e).__name__}"
        )

        print(
            f"ERROR MESSAGE: {str(e)}"
        )

        traceback.print_exc()

        print(
            "========================================"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Order could not be processed: "
                f"{type(e).__name__}: {str(e)}"
            ),
        )


# ============================================================
# VERIFY PAYMENT
# ============================================================

@router.post("/orders/verify-payment")
async def verify_payment(
    payload: VerifyPaymentRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    print("========== VERIFY PAYMENT START ==========")

    print(
        f"Razorpay Order ID: "
        f"{payload.razorpay_order_id}"
    )

    print(
        f"Razorpay Payment ID: "
        f"{payload.razorpay_payment_id}"
    )

    # ---------------------------------------------------------
    # 1. FIND MONGODB ORDER
    # ---------------------------------------------------------

    existing_order = await db.orders.find_one(
        {
            "razorpayOrderId":
                payload.razorpay_order_id
        }
    )

    if not existing_order:

        raise HTTPException(
            status_code=404,
            detail=(
                "Order reference not found for "
                "this payment session."
            ),
        )

    # ---------------------------------------------------------
    # 2. VERIFY RAZORPAY SIGNATURE
    # ---------------------------------------------------------

    try:

        razorpay_client.utility.verify_payment_signature(
            {
                "razorpay_order_id":
                    payload.razorpay_order_id,

                "razorpay_payment_id":
                    payload.razorpay_payment_id,

                "razorpay_signature":
                    payload.razorpay_signature,
            }
        )

        print(
            "Razorpay signature verified."
        )

    except razorpay.errors.SignatureVerificationError:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid cryptographic payment signature."
            ),
        )

    # ---------------------------------------------------------
    # 3. VERIFY PAYMENT IS CAPTURED
    # ---------------------------------------------------------

    try:

        payment_details = (
            razorpay_client.payment.fetch(
                payload.razorpay_payment_id
            )
        )

        payment_status = (
            payment_details.get("status")
        )

        print(
            f"Razorpay payment status: "
            f"{payment_status}"
        )

        if payment_status != "captured":

            raise HTTPException(
                status_code=400,
                detail=(
                    "Payment has not been fully "
                    "captured yet."
                ),
            )

    except HTTPException:
        raise

    except Exception as e:

        print(
            "Razorpay payment fetch error:",
            str(e),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to verify payment capture "
                "status with gateway."
            ),
        )

    # ---------------------------------------------------------
    # 4. ATOMIC PAYMENT CONFIRMATION
    #
    # Only a pending order can transition to paid.
    # This prevents duplicate confirmation.
    # ---------------------------------------------------------

    updated_order = (
        await db.orders.find_one_and_update(
            {
                "razorpayOrderId":
                    payload.razorpay_order_id,

                "paymentStatus":
                    "pending",
            },
            {
                "$set": {
                    "paymentStatus":
                        "paid",

                    "status":
                        "confirmed",

                    "razorpayPaymentId":
                        payload.razorpay_payment_id,
                }
            },
            return_document=True,
        )
    )

    # ---------------------------------------------------------
    # 5. IDEMPOTENT ALREADY-PAID CASE
    #
    # The Razorpay webhook may have confirmed the payment
    # before the frontend calls this endpoint.
    # That is a valid condition, not a payment failure.
    # ---------------------------------------------------------

    if not updated_order:

        already_paid_order = (
            await db.orders.find_one(
                {
                    "razorpayOrderId":
                        payload.razorpay_order_id,

                    "paymentStatus":
                        "paid",
                }
            )
        )

        if not already_paid_order:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Unable to confirm order."
                ),
            )

        stored_payment_id = (
            already_paid_order.get(
                "razorpayPaymentId"
            )
        )

        # -----------------------------------------------------
        # DIFFERENT PAYMENT ID PROTECTION
        # -----------------------------------------------------

        if (
            stored_payment_id
            and stored_payment_id
            != payload.razorpay_payment_id
        ):

            raise HTTPException(
                status_code=409,
                detail=(
                    "This order is already associated "
                    "with a different payment."
                ),
            )

        # -----------------------------------------------------
        # STORE PAYMENT ID IF WEBHOOK DID NOT STORE IT
        # -----------------------------------------------------

        if not stored_payment_id:

            await db.orders.update_one(
                {
                    "_id":
                        already_paid_order["_id"],

                    "paymentStatus":
                        "paid",
                },
                {
                    "$set": {
                        "razorpayPaymentId":
                            payload.razorpay_payment_id,
                    }
                },
            )

            already_paid_order[
                "razorpayPaymentId"
            ] = payload.razorpay_payment_id

        updated_order = already_paid_order

        print(
            "Payment was already confirmed by "
            "another request or webhook."
        )

        print(
            "Continuing idempotently."
        )

    else:

        print(
            f"MongoDB order confirmed: "
            f"{updated_order.get('orderId')}"
        )

    # ---------------------------------------------------------
    # 6. GOOGLE SHEETS + EMAIL
    # ---------------------------------------------------------

    customer_data = (
        updated_order.get(
            "customer",
            {},
        )
    )

    formatted_items = ", ".join(
        [
            (
                f"{item.get('productNameSnapshot', item.get('sku'))}"
                f" (x{item.get('quantity', 1)})"
            )
            for item in updated_order.get(
                "items",
                [],
            )
        ]
    )

    created_at = (
        updated_order.get(
            "createdAt"
        )
    )

    if hasattr(
        created_at,
        "isoformat"
    ):

        created_at = (
            created_at.isoformat()
        )

    else:

        created_at = str(
            created_at
        )

    address = (
        f"{customer_data.get('address', '')}, "
        f"{customer_data.get('city', '')}, "
        f"{customer_data.get('state', '')} - "
        f"{customer_data.get('pincode', '')}"
    )

    sheets_payload = {
        "type": "order",

        "data": {

            "orderId":
                updated_order["orderId"],

            "createdAt":
                created_at,

            "customerName":
                customer_data.get(
                    "fullName",
                    "",
                ),

            "phone":
                customer_data.get(
                    "phone",
                    "",
                ),

            "email":
                customer_data.get(
                    "email",
                    "",
                ),

            "address":
                address,

            "items":
                formatted_items,

            "subtotal":
                updated_order.get(
                    "subtotal",
                    0,
                ),

            "shipping":
                updated_order.get(
                    "shipping",
                    0,
                ),

            "total":
                updated_order.get(
                    "total",
                    0,
                ),

            "paymentStatus":
                "paid",

            "orderStatus":
                "confirmed",
        },
    }

    print(
        "Sending confirmed order to Google Apps Script..."
    )

    print(
        f"Order: "
        f"{updated_order['orderId']}"
    )

    print(
        f"Customer: "
        f"{customer_data.get('fullName', '')}"
    )

    print(
        f"Email: "
        f"{customer_data.get('email', '')}"
    )

    try:

        sheets_result = (
            await post_to_google_apps_script(
                sheets_payload
            )
        )

        print(
            "Google Apps Script SUCCESS:"
        )

        print(
            sheets_result
        )

    except Exception as sync_error:

        print(
            "========== GOOGLE APPS SCRIPT ERROR =========="
        )

        print(
            f"TYPE: "
            f"{type(sync_error).__name__}"
        )

        print(
            f"MESSAGE: "
            f"{str(sync_error)}"
        )

        print(
            "=============================================="
        )

        # Payment is already confirmed.
        # Do NOT tell the customer payment failed.

    # ---------------------------------------------------------
    # 7. RESPONSE TO FRONTEND
    # ---------------------------------------------------------

    print(
        "========== VERIFY PAYMENT COMPLETE =========="
    )

    return {
        "success": True,

        "message":
            "Payment verified and order confirmed successfully.",

        "orderId":
            updated_order["orderId"],

        "paymentStatus":
            "paid",

        "status":
            "confirmed",
    }


# ============================================================
# RAZORPAY WEBHOOK
# ============================================================

@router.post(
    "/webhooks/razorpay",
    include_in_schema=False,
)
async def razorpay_webhook(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    print("========== RAZORPAY WEBHOOK START ==========")

    event_id = request.headers.get(
        "X-Razorpay-Event-Id"
    )

    webhook_signature = request.headers.get(
        "X-Razorpay-Signature"
    )

    # ---------------------------------------------------------
    # 1. SIGNATURE HEADER
    # ---------------------------------------------------------

    if not webhook_signature:
        raise HTTPException(
            status_code=400,
            detail="Missing webhook signature header.",
        )

    # ---------------------------------------------------------
    # 2. RAW BODY
    # ---------------------------------------------------------

    raw_body = await request.body()

    # ---------------------------------------------------------
    # 3. VERIFY RAZORPAY WEBHOOK SIGNATURE
    # ---------------------------------------------------------

    try:
        razorpay_client.utility.verify_webhook_signature(
            raw_body.decode("utf-8"),
            webhook_signature,
            settings.razorpay_webhook_secret,
        )

        print(
            "Razorpay webhook signature verified."
        )

    except Exception as e:
        print(
            "========== WEBHOOK SIGNATURE ERROR =========="
        )

        print(
            f"TYPE: {type(e).__name__}"
        )

        print(
            f"MESSAGE: {str(e)}"
        )

        print(
            "=============================================="
        )

        raise HTTPException(
            status_code=400,
            detail=(
                "Webhook signature verification failed."
            ),
        )

    # ---------------------------------------------------------
    # 4. PARSE EVENT
    # ---------------------------------------------------------

    try:
        event_data = await request.json()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid webhook JSON payload.",
        )

    resolved_event_id = (
        event_id
        or event_data.get("event_id")
    )

    event_type = event_data.get(
        "event"
    )

    print(
        f"Webhook event: {event_type}"
    )

    print(
        f"Webhook event ID: {resolved_event_id}"
    )

    # ---------------------------------------------------------
    # 5. GET RAZORPAY ENTITY
    # ---------------------------------------------------------

    payload_entity = (
        event_data
        .get("payload", {})
        .get("payment", {})
        .get("entity", {})
    )

    if not payload_entity:

        payload_entity = (
            event_data
            .get("payload", {})
            .get("order", {})
            .get("entity", {})
        )

    razorpay_order_id = (
        payload_entity.get("order_id")
        or payload_entity.get("id")
    )

    razorpay_payment_id = (
        payload_entity.get("id")
        if payload_entity.get("entity")
        == "payment"
        else None
    )

    print(
        f"Razorpay Order ID: "
        f"{razorpay_order_id}"
    )

    print(
        f"Razorpay Payment ID: "
        f"{razorpay_payment_id}"
    )

    # ---------------------------------------------------------
    # 6. ONLY PAYMENT EVENTS NEED ORDER PROCESSING
    # ---------------------------------------------------------

    supported_events = {
        "payment.captured",
        "order.paid",
        "payment.failed",
    }

    if event_type not in supported_events:

        print(
            f"Ignoring unsupported webhook event: "
            f"{event_type}"
        )

        return {
            "status": "ignored",
            "event": event_type,
        }

    if not razorpay_order_id:

        print(
            "Webhook does not contain a Razorpay order ID."
        )

        return {
            "status": "ignored",
            "reason": "missing_razorpay_order_id",
        }

    # ---------------------------------------------------------
    # 7. WEBHOOK EVENT IDEMPOTENCY
    #
    # IMPORTANT:
    #
    # We do NOT mark the event as successfully processed
    # before Google Apps Script succeeds.
    #
    # "processing" means another request may currently be
    # working on it.
    #
    # "processed" means the downstream sync completed.
    # ---------------------------------------------------------

    if resolved_event_id:

        existing_event = (
            await db.webhook_events.find_one(
                {
                    "eventId":
                        resolved_event_id
                }
            )
        )

        if existing_event:

            existing_status = (
                existing_event.get(
                    "status",
                    "processed",
                )
            )

            # ---------------------------------------------
            # Already completely processed
            # ---------------------------------------------

            if existing_status == "processed":

                print(
                    "Webhook already processed successfully."
                )

                return {
                    "status":
                        "already_processed"
                }

            # ---------------------------------------------
            # Existing event was previously attempted but
            # downstream processing did not complete.
            #
            # Continue processing so Razorpay retries can
            # recover from a temporary Google failure.
            # ---------------------------------------------

            print(
                "Previous webhook processing was not "
                "completed. Retrying downstream sync."
            )

        else:

            # ---------------------------------------------
            # Create processing record.
            #
            # We intentionally do NOT set processed=True.
            # ---------------------------------------------

            try:

                await db.webhook_events.insert_one(
                    {
                        "eventId":
                            resolved_event_id,

                        "event":
                            event_type,

                        "status":
                            "processing",

                        "createdAt":
                            datetime.datetime.utcnow(),

                        "updatedAt":
                            datetime.datetime.utcnow(),
                    }
                )

                print(
                    "Webhook processing record created."
                )

            except Exception as event_insert_error:

                # Another webhook request may have inserted
                # the same event simultaneously.
                #
                # Re-read it rather than treating the payment
                # as failed.

                print(
                    "Webhook event insert race:"
                )

                print(
                    f"{type(event_insert_error).__name__}: "
                    f"{str(event_insert_error)}"
                )

                existing_event = (
                    await db.webhook_events.find_one(
                        {
                            "eventId":
                                resolved_event_id
                        }
                    )
                )

                if existing_event and (
                    existing_event.get(
                        "status"
                    ) == "processed"
                ):

                    return {
                        "status":
                            "already_processed"
                    }

    # ---------------------------------------------------------
    # 8. PAYMENT CAPTURED / ORDER PAID
    # ---------------------------------------------------------

    if event_type in [
        "payment.captured",
        "order.paid",
    ]:

        # -----------------------------------------------------
        # FIRST: atomically transition pending → paid
        #
        # If verify-payment already did this, updated_order
        # will be None. That is okay.
        # -----------------------------------------------------

        updated_order = (
            await db.orders.find_one_and_update(
                {
                    "razorpayOrderId":
                        razorpay_order_id,

                    "paymentStatus":
                        "pending",
                },
                {
                    "$set": {
                        "paymentStatus":
                            "paid",

                        "status":
                            "confirmed",

                        **(
                            {
                                "razorpayPaymentId":
                                    razorpay_payment_id
                            }
                            if razorpay_payment_id
                            else {}
                        ),
                    }
                },
                return_document=True,
            )
        )

        # -----------------------------------------------------
        # If webhook performed the transition, use that order.
        # -----------------------------------------------------

        if updated_order:

            print(
                f"MongoDB order confirmed by webhook: "
                f"{updated_order.get('orderId')}"
            )

        else:

            # -------------------------------------------------
            # verify-payment may have already confirmed it.
            # Retrieve the already-paid order.
            # -------------------------------------------------

            updated_order = (
                await db.orders.find_one(
                    {
                        "razorpayOrderId":
                            razorpay_order_id,

                        "paymentStatus":
                            "paid",
                    }
                )
            )

            if not updated_order:

                print(
                    "Webhook could not find a confirmed "
                    "MongoDB order."
                )

                # Leave webhook event unprocessed so a future
                # Razorpay retry can try again.

                if resolved_event_id:

                    await db.webhook_events.update_one(
                        {
                            "eventId":
                                resolved_event_id
                        },
                        {
                            "$set": {
                                "status":
                                    "failed",

                                "updatedAt":
                                    datetime.datetime.utcnow(),

                                "error":
                                    (
                                        "Confirmed order "
                                        "not found."
                                    ),
                            }
                        },
                    )

                return {
                    "status":
                        "retry_required"
                }

            print(
                "Order was already confirmed by "
                "verify-payment."
            )

        # -----------------------------------------------------
        # 9. PREPARE GOOGLE APPS SCRIPT PAYLOAD
        # -----------------------------------------------------

        customer_data = (
            updated_order.get(
                "customer",
                {},
            )
        )

        formatted_items = ", ".join(
            [
                (
                    f"{item.get('productNameSnapshot', item.get('sku'))}"
                    f" (x{item.get('quantity', 1)})"
                )
                for item in updated_order.get(
                    "items",
                    [],
                )
            ]
        )

        created_at = (
            updated_order.get(
                "createdAt"
            )
        )

        if hasattr(
            created_at,
            "isoformat",
        ):

            created_at = (
                created_at.isoformat()
            )

        else:

            created_at = str(
                created_at
            )

        address = (
            f"{customer_data.get('address', '')}, "
            f"{customer_data.get('city', '')}, "
            f"{customer_data.get('state', '')} - "
            f"{customer_data.get('pincode', '')}"
        )

        sheets_payload = {
            "type":
                "order",

            "data": {

                "orderId":
                    updated_order["orderId"],

                "createdAt":
                    created_at,

                "customerName":
                    customer_data.get(
                        "fullName",
                        "",
                    ),

                "phone":
                    customer_data.get(
                        "phone",
                        "",
                    ),

                "email":
                    customer_data.get(
                        "email",
                        "",
                    ),

                "address":
                    address,

                "items":
                    formatted_items,

                "subtotal":
                    updated_order.get(
                        "subtotal",
                        0,
                    ),

                "shipping":
                    updated_order.get(
                        "shipping",
                        0,
                    ),

                "total":
                    updated_order.get(
                        "total",
                        0,
                    ),

                "paymentStatus":
                    "paid",

                "orderStatus":
                    "confirmed",
            },
        }

        # -----------------------------------------------------
        # 10. GOOGLE SHEETS / EMAIL SYNC
        #
        # IMPORTANT:
        #
        # The webhook event is marked "processed" ONLY after
        # this succeeds.
        # -----------------------------------------------------

        try:

            print(
                "Sending webhook-confirmed order "
                "to Google Apps Script..."
            )

            print(
                f"Order: "
                f"{updated_order['orderId']}"
            )

            print(
                f"Customer: "
                f"{customer_data.get('fullName', '')}"
            )

            print(
                f"Email: "
                f"{customer_data.get('email', '')}"
            )

            sheets_result = (
                await post_to_google_apps_script(
                    sheets_payload
                )
            )

            print(
                "Google Apps Script SUCCESS:"
            )

            print(
                sheets_result
            )

        except Exception as sync_error:

            print(
                "========== GOOGLE APPS SCRIPT ERROR =========="
            )

            print(
                f"TYPE: "
                f"{type(sync_error).__name__}"
            )

            print(
                f"MESSAGE: "
                f"{str(sync_error)}"
            )

            print(
                "=============================================="
            )

            # ---------------------------------------------
            # DO NOT mark webhook processed.
            #
            # Razorpay can retry the webhook and the next
            # attempt will try the Google sync again.
            # ---------------------------------------------

            if resolved_event_id:

                await db.webhook_events.update_one(
                    {
                        "eventId":
                            resolved_event_id
                    },
                    {
                        "$set": {
                            "status":
                                "failed",

                            "updatedAt":
                                datetime.datetime.utcnow(),

                            "error":
                                str(sync_error),
                        }
                    },
                )

            # Payment itself is successful.
            # Return 500 so Razorpay knows downstream
            # processing did not complete and can retry.

            raise HTTPException(
                status_code=500,
                detail=(
                    "Payment captured, but order "
                    "notification synchronization failed."
                ),
            )

        # -----------------------------------------------------
        # 11. MARK WEBHOOK SUCCESSFULLY PROCESSED
        # -----------------------------------------------------

        if resolved_event_id:

            await db.webhook_events.update_one(
                {
                    "eventId":
                        resolved_event_id
                },
                {
                    "$set": {
                        "status":
                            "processed",

                        "processedAt":
                            datetime.datetime.utcnow(),

                        "updatedAt":
                            datetime.datetime.utcnow(),

                        "error":
                            None,
                    }
                },
            )

        print(
            "Webhook processing completed successfully."
        )

        print(
            "========== RAZORPAY WEBHOOK END =========="
        )

        return {
            "status":
                "ok",

            "event":
                event_type,

            "orderId":
                updated_order["orderId"],
        }

    # ---------------------------------------------------------
    # 12. PAYMENT FAILED
    # ---------------------------------------------------------

    if event_type == "payment.failed":

        await db.orders.update_one(
            {
                "razorpayOrderId":
                    razorpay_order_id,

                "paymentStatus":
                    "pending",
            },
            {
                "$set": {
                    "paymentStatus":
                        "failed",
                }
            },
        )

        # -----------------------------------------------------
        # A payment.failed event has no Google order-confirmation
        # sync to perform, so it can safely be marked processed.
        # -----------------------------------------------------

        if resolved_event_id:

            await db.webhook_events.update_one(
                {
                    "eventId":
                        resolved_event_id
                },
                {
                    "$set": {
                        "status":
                            "processed",

                        "processedAt":
                            datetime.datetime.utcnow(),

                        "updatedAt":
                            datetime.datetime.utcnow(),

                        "error":
                            None,
                    }
                },
            )

        print(
            "Payment failure webhook processed."
        )

        print(
            "========== RAZORPAY WEBHOOK END =========="
        )

        return {
            "status":
                "ok",

            "event":
                event_type,
        }

    # ---------------------------------------------------------
    # 13. SAFETY FALLBACK
    # ---------------------------------------------------------

    return {
        "status":
            "ignored",

        "event":
            event_type,
    }


# ============================================================
# ORDER TRACKING
# ============================================================

@router.get(
    "/orders/{order_id}",
    response_model=OrderTrackingResponse,
)
async def track_order(
    order_id: str,
    request: Request,
    phone: str = Query(
        ...,
        min_length=10,
        max_length=10,
        description=(
            "Customer 10-digit phone number "
            "for verification"
        ),
    ),
):

    client_ip = (
        request.client.host
        if request.client
        else "unknown"
    )

    apply_rate_limit(
        client_ip
    )

    order = await get_order_by_id_and_phone(
        order_id,
        phone,
    )

    return order
