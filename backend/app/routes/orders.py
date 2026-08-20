import time
import datetime
import traceback
from typing import Dict, List, Any

from fastapi import (
    APIRouter,
    status,
    Query,
    Request,
    HTTPException,
    Depends,
)
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

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
    sync_payment_to_google_sheets,
    sync_webhook_to_google_sheets,
)


router = APIRouter(
    prefix="/api",
    tags=["Orders"],
)


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

    history = _RATE_LIMIT_STORE.get(
        client_ip,
        [],
    )

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
# DATETIME HELPER
# ============================================================

def serialize_datetime(value):

    if value is None:
        return ""

    if hasattr(value, "isoformat"):

        return value.isoformat()

    return str(value)


# ============================================================
# PAYMENT DETAILS HELPER
# ============================================================

def extract_payment_sheet_data(
    updated_order: dict,
    payment_details: dict,
    *,
    signature_verified: bool,
    event_id: str = "",
    event_type: str = "",
    webhook_received_at: str = "",
) -> dict:
    """
    Build the complete payment record sent to the
    Google Sheets Payments tab.
    """

    order_id = updated_order.get(
        "orderId",
        "",
    )

    customer = updated_order.get(
        "customer",
        {},
    )

    razorpay_payment_id = (
        payment_details.get("id")
        or updated_order.get(
            "razorpayPaymentId",
            "",
        )
    )

    razorpay_order_id = (
        payment_details.get("order_id")
        or updated_order.get(
            "razorpayOrderId",
            "",
        )
    )

    amount_paise = payment_details.get(
        "amount"
    )

    amount_rupees = None

    if amount_paise is not None:

        try:

            amount_rupees = (
                float(amount_paise) / 100
            )

        except Exception:

            amount_rupees = None

    fee_paise = payment_details.get(
        "fee"
    )

    fee_rupees = None

    if fee_paise is not None:

        try:

            fee_rupees = (
                float(fee_paise) / 100
            )

        except Exception:

            fee_rupees = None

    tax_paise = payment_details.get(
        "tax"
    )

    tax_rupees = None

    if tax_paise is not None:

        try:

            tax_rupees = (
                float(tax_paise) / 100
            )

        except Exception:

            tax_rupees = None

    net_amount_rupees = None

    if (
        fee_rupees is not None
        and amount_rupees is not None
    ):

        net_amount_rupees = (
            amount_rupees -
            fee_rupees
        )

    method = payment_details.get(
        "method",
        "",
    )

    card = payment_details.get(
        "card"
    ) or {}

    bank = payment_details.get(
        "bank",
        "",
    )

    wallet = payment_details.get(
        "wallet",
        "",
    )

    vpa = payment_details.get(
        "vpa",
        "",
    )

    created_at = payment_details.get(
        "created_at"
    )

    payment_created_at = ""

    if created_at:

        try:

            payment_created_at = (
                datetime.datetime.fromtimestamp(
                    int(created_at),
                    tz=datetime.timezone.utc,
                ).isoformat()
            )

        except Exception:

            payment_created_at = str(
                created_at
            )

    payment_captured_at = (
        datetime.datetime.now(
            datetime.timezone.utc
        ).isoformat()
    )

    return {

        "paymentRecordId":
            razorpay_payment_id
            or (
                order_id +
                "-payment"
            ),

        "orderId":
            order_id,

        "razorpayOrderId":
            razorpay_order_id,

        "razorpayPaymentId":
            razorpay_payment_id,

        "paymentStatus":
            payment_details.get(
                "status",
                "paid",
            ),

        "paymentMethod":
            method,

        "amount":
            amount_paise,

        "amountRupees":
            amount_rupees,

        "currency":
            payment_details.get(
                "currency",
                "INR",
            ),

        "razorpayFee":
            fee_rupees,

        "razorpayTax":
            tax_rupees,

        "netAmount":
            net_amount_rupees,

        "paymentCreatedAt":
            payment_created_at,

        "paymentCapturedAt":
            payment_captured_at,

        "signatureVerified":
            signature_verified,

        "eventId":
            event_id,

        "eventType":
            event_type,

        "webhookReceivedAt":
            webhook_received_at,

        "upiId":
            vpa,

        "bank":
            bank,

        "wallet":
            wallet,

        "cardLast4":
            card.get(
                "last4",
                "",
            ),

        "cardNetwork":
            card.get(
                "network",
                "",
            ),

        "customerName":
            customer.get(
                "fullName",
                "",
            ),

        "customerPhone":
            customer.get(
                "phone",
                "",
            ),

        "customerEmail":
            customer.get(
                "email",
                "",
            ),

        "rawPaymentData":
            payment_details,
    }


# ============================================================
# RAZORPAY AMOUNT SAFETY
# ============================================================

def get_order_amount_in_paise(
    order: dict,
) -> int:

    total_amount = order.get(
        "total"
    )

    if total_amount is None:
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
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Invalid order amount.",
        )

    if amount_in_paise <= 0:
        raise HTTPException(
            status_code=400,
            detail=(
                "Order amount must be greater than zero."
            ),
        )

    return amount_in_paise


def assert_razorpay_amount_matches_order(
    razorpay_amount: Any,
    order_amount_in_paise: int,
) -> None:
    """
    Hard payment guard.

    Razorpay amount must exactly equal the authoritative
    server-side order total.
    """

    try:
        gateway_amount = int(
            razorpay_amount
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=(
                "Invalid amount returned by Razorpay."
            ),
        )

    if gateway_amount != order_amount_in_paise:
        raise HTTPException(
            status_code=500,
            detail=(
                "Razorpay amount does not match the "
                "authoritative order total."
            ),
        )


# ============================================================
# CREATE ORDER
# ============================================================


@router.post(
    "/orders",
    status_code=status.HTTP_201_CREATED,
)
async def create_order(
    payload: CreateOrderRequest,
    db: AsyncIOMotorDatabase = Depends(
        get_database
    ),
):

    try:

        print(
            "========== CREATE ORDER START =========="
        )

        print(
            f"Creating order for customer: "
            f"{getattr(payload.customer, 'fullName', 'unknown')}"
        )

        # --------------------------------------------------------
        # 1. CREATE ORDER
        # --------------------------------------------------------

        order = await process_and_save_order(
            payload
        )

        if isinstance(order, dict):

            order_data = order

        elif hasattr(
            order,
            "model_dump",
        ):

            order_data = order.model_dump()

        elif hasattr(
            order,
            "dict",
        ):

            order_data = order.dict()

        else:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Invalid order record returned "
                    "by order service."
                ),
            )

        order_id = order_data.get(
            "orderId"
        )

        if not order_id:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Created order is missing orderId."
                ),
            )

        print(
            f"MongoDB order created: {order_id}"
        )

        # --------------------------------------------------------
        # 2. RETRIEVE AUTHORITATIVE ORDER
        # --------------------------------------------------------

        existing_order = (
            await db.orders.find_one(
                {
                    "orderId":
                        order_id
                }
            )
        )

        if not existing_order:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Failed to retrieve created "
                    "order record."
                ),
            )

        # --------------------------------------------------------
        # 3. AMOUNT
        # --------------------------------------------------------

        amount_in_paise = (
            get_order_amount_in_paise(
                existing_order
            )
        )

        # --------------------------------------------------------
        # 4. RAZORPAY ORDER
        # --------------------------------------------------------

        razorpay_order_id = (
            existing_order.get(
                "razorpayOrderId"
            )
        )

        if not razorpay_order_id:

            print(
                "Creating Razorpay order..."
            )

            try:

                rzp_order = (
                    razorpay_client.order.create(
                        {
                            "amount":
                                amount_in_paise,

                            "currency":
                                "INR",

                            "receipt":
                                str(
                                    order_id
                                ),

                            "notes": {
                                "orderId":
                                    str(
                                        order_id
                                    ),

                                "fulfillmentType":
                                    str(
                                        existing_order.get(
                                            "fulfillmentType",
                                            "SHIPPING",
                                        )
                                    ),
                            },
                        }
                    )
                )

                razorpay_order_id = (
                    rzp_order.get(
                        "id"
                    )
                )

                if not razorpay_order_id:
                    raise Exception(
                        "Razorpay did not return an order ID."
                    )

                assert_razorpay_amount_matches_order(
                    rzp_order.get(
                        "amount"
                    ),
                    amount_in_paise,
                )

                await db.orders.update_one(
                    {
                        "orderId":
                            order_id
                    },
                    {
                        "$set": {
                            "razorpayOrderId":
                                razorpay_order_id,

                            "razorpayOrderAmount":
                                amount_in_paise,

                            "paymentStatus":
                                "pending",
                        }
                    },
                )

                print(
                    f"Razorpay order created: "
                    f"{razorpay_order_id}"
                )

            except HTTPException:
                raise

            except Exception as e:

                print(
                    "========== RAZORPAY CREATE ERROR =========="
                )

                print(
                    f"{type(e).__name__}: {str(e)}"
                )

                traceback.print_exc()

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Failed to initialize payment "
                        "gateway order."
                    ),
                )

        else:

            # Existing Razorpay orders must still match the
            # current authoritative MongoDB total.
            try:

                gateway_order = (
                    razorpay_client.order.fetch(
                        razorpay_order_id
                    )
                )

                assert_razorpay_amount_matches_order(
                    gateway_order.get(
                        "amount"
                    ),
                    amount_in_paise,
                )

            except HTTPException:
                raise

            except Exception as e:

                print(
                    "========== RAZORPAY EXISTING ORDER CHECK ERROR =========="
                )

                print(
                    f"{type(e).__name__}: {str(e)}"
                )

                traceback.print_exc()

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Unable to verify the existing "
                        "payment gateway order."
                    ),
                )

        # --------------------------------------------------------
        # 5. RESPONSE
        # --------------------------------------------------------

        response_data = dict(
            order_data
        )

        response_data[
            "razorpayOrderId"
        ] = razorpay_order_id

        response_data[
            "razorpayKeyId"
        ] = settings.razorpay_key_id

        response_data[
            "amount"
        ] = amount_in_paise

        response_data[
            "currency"
        ] = "INR"

        response_data[
            "paymentStatus"
        ] = existing_order.get(
            "paymentStatus",
            "pending",
        )

        print(
            "========== CREATE ORDER SUCCESS =========="
        )

        return response_data

    except HTTPException:

        raise

    except Exception as e:

        print(
            "========== CREATE ORDER ERROR =========="
        )

        print(
            f"{type(e).__name__}: {str(e)}"
        )

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=(
                "Order could not be processed."
            ),
        )


# ============================================================
# VERIFY PAYMENT
# ============================================================

@router.post(
    "/orders/verify-payment"
)
async def verify_payment(
    payload: VerifyPaymentRequest,
    db: AsyncIOMotorDatabase = Depends(
        get_database
    ),
):

    print(
        "========== VERIFY PAYMENT START =========="
    )

    print(
        f"Razorpay Order ID: "
        f"{payload.razorpay_order_id}"
    )

    print(
        f"Razorpay Payment ID: "
        f"{payload.razorpay_payment_id}"
    )

    # ---------------------------------------------------------
    # 1. FIND ORDER
    # ---------------------------------------------------------

    existing_order = (
        await db.orders.find_one(
            {
                "razorpayOrderId":
                    payload.razorpay_order_id
            }
        )
    )

    if not existing_order:

        raise HTTPException(
            status_code=404,
            detail=(
                "Order reference not found "
                "for this payment session."
            ),
        )

    # ---------------------------------------------------------
    # 2. SIGNATURE VERIFICATION
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
                "Invalid cryptographic "
                "payment signature."
            ),
        )

    # ---------------------------------------------------------
    # 3. FETCH RAZORPAY PAYMENT
    # ---------------------------------------------------------

    try:

        payment_details = (
            razorpay_client.payment.fetch(
                payload.razorpay_payment_id
            )
        )

        payment_status = (
            payment_details.get(
                "status"
            )
        )

        print(
            f"Razorpay payment status: "
            f"{payment_status}"
        )

        expected_amount = (
            get_order_amount_in_paise(
                existing_order
            )
        )

        assert_razorpay_amount_matches_order(
            payment_details.get(
                "amount"
            ),
            expected_amount,
        )

        payment_order_id = (
            payment_details.get(
                "order_id"
            )
        )

        if (
            payment_order_id
            and payment_order_id
            != payload.razorpay_order_id
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Payment is linked to a different "
                    "Razorpay order."
                ),
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
                "Unable to verify payment "
                "capture status with gateway."
            ),
        )

    # ---------------------------------------------------------
    # 4. ATOMIC MONGODB CONFIRMATION
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

                    "paymentVerifiedAt":
                        datetime.datetime.utcnow(),
                }
            },
            return_document=ReturnDocument.AFTER,
        )
    )

    # ---------------------------------------------------------
    # 5. ALREADY PAID
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

        if not stored_payment_id:

            await db.orders.update_one(
                {
                    "_id":
                        already_paid_order["_id"]
                },
                {
                    "$set": {
                        "razorpayPaymentId":
                            payload.razorpay_payment_id
                    }
                },
            )

            already_paid_order[
                "razorpayPaymentId"
            ] = payload.razorpay_payment_id

        updated_order = (
            already_paid_order
        )

        print(
            "Order was already confirmed."
        )

    else:

        print(
            f"MongoDB order confirmed: "
            f"{updated_order.get('orderId')}"
        )

    # ---------------------------------------------------------
    # 6. SAVE FULL PAYMENT DETAILS TO MONGODB
    # ---------------------------------------------------------

    payment_record = (
        extract_payment_sheet_data(
            updated_order,
            payment_details,
            signature_verified=True,
        )
    )

    await db.orders.update_one(
        {
            "_id":
                updated_order["_id"]
        },
        {
            "$set": {
                "paymentDetails":
                    payment_record,

                "paymentMethod":
                    payment_details.get(
                        "method"
                    ),

                "razorpayFee":
                    payment_record.get(
                        "razorpayFee"
                    ),

                "razorpayTax":
                    payment_record.get(
                        "razorpayTax"
                    ),

                "paymentCapturedAt":
                    payment_record.get(
                        "paymentCapturedAt"
                    ),
            }
        },
    )

    # Keep local copy synchronized
    updated_order[
        "paymentDetails"
    ] = payment_record

    # ---------------------------------------------------------
    # 7. GOOGLE SHEETS: UPDATE ORDERS
    # ---------------------------------------------------------

    customer = (
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

    created_at = serialize_datetime(
        updated_order.get(
            "createdAt"
        )
    )

    address = (
        f"{customer.get('address', '')}, "
        f"{customer.get('city', '')}, "
        f"{customer.get('state', '')} - "
        f"{customer.get('pincode', '')}"
    )

    order_sheet_payload = {

        "type":
            "order",

        "data": {

            "orderId":
                updated_order.get(
                    "orderId",
                    "",
                ),

            "createdAt":
                created_at,

            "customerName":
                customer.get(
                    "fullName",
                    "",
                ),

            "phone":
                customer.get(
                    "phone",
                    "",
                ),

            "email":
                customer.get(
                    "email",
                    "",
                ),

            "address":
                address,

            "city":
                customer.get(
                    "city",
                    "",
                ),

            "state":
                customer.get(
                    "state",
                    "",
                ),

            "pincode":
                customer.get(
                    "pincode",
                    "",
                ),

            "items":
                updated_order.get(
                    "items",
                    [],
                ),

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

            "fulfillmentType":
                updated_order.get(
                    "fulfillmentType",
                    "",
                ),

            "pricingMode":
                updated_order.get(
                    "pricingMode",
                    "",
                ),

            "shippingRequired":
                updated_order.get(
                    "shippingRequired",
                    False,
                ),

            "currency":
                "INR",

            "paymentStatus":
                "paid",

            "orderStatus":
                "confirmed",

            "paymentMethod":
                payment_details.get(
                    "method",
                    "",
                ),

            "razorpayOrderId":
                payload.razorpay_order_id,

            "razorpayPaymentId":
                payload.razorpay_payment_id,

            "razorpaySignatureVerified":
                True,

            "paymentCapturedAt":
                payment_record.get(
                    "paymentCapturedAt",
                    "",
                ),

            "createdSource":
                "website",
        },
    }

    try:

        await post_to_google_apps_script(
            order_sheet_payload
        )

        print(
            "Google Sheets Orders synchronized."
        )

    except Exception as sheet_error:

        print(
            "Google Sheets Orders sync failed:"
        )

        print(
            f"{type(sheet_error).__name__}: "
            f"{str(sheet_error)}"
        )

    # ---------------------------------------------------------
    # 8. GOOGLE SHEETS: PAYMENT RECORD
    # ---------------------------------------------------------

    try:

        await sync_payment_to_google_sheets(
            payment_record
        )

        print(
            "Google Sheets Payments synchronized."
        )

    except Exception as sheet_payment_error:

        print(
            "Google Sheets Payments sync failed:"
        )

        print(
            f"{type(sheet_payment_error).__name__}: "
            f"{str(sheet_payment_error)}"
        )

    # ---------------------------------------------------------
    # 9. FINAL RESPONSE
    # ---------------------------------------------------------

    print(
        "========== VERIFY PAYMENT COMPLETE =========="
    )

    return {

        "success":
            True,

        "message":
            (
                "Payment verified and order "
                "confirmed successfully."
            ),

        "orderId":
            updated_order.get(
                "orderId"
            ),

        "paymentStatus":
            "paid",

        "status":
            "confirmed",

        "razorpayOrderId":
            payload.razorpay_order_id,

        "razorpayPaymentId":
            payload.razorpay_payment_id,

        "paymentMethod":
            payment_details.get(
                "method",
                "",
            ),

        "amount":
            payment_details.get(
                "amount"
            ),

        "currency":
            payment_details.get(
                "currency",
                "INR",
            ),
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
    db: AsyncIOMotorDatabase = Depends(
        get_database
    ),
):

    print(
        "========== RAZORPAY WEBHOOK START =========="
    )

    event_id = request.headers.get(
        "X-Razorpay-Event-Id"
    )

    webhook_signature = request.headers.get(
        "X-Razorpay-Signature"
    )

    # ---------------------------------------------------------
    # 1. SIGNATURE
    # ---------------------------------------------------------

    if not webhook_signature:

        raise HTTPException(
            status_code=400,
            detail=(
                "Missing webhook signature header."
            ),
        )

    # ---------------------------------------------------------
    # 2. RAW BODY
    # ---------------------------------------------------------

    raw_body = await request.body()

    # ---------------------------------------------------------
    # 3. VERIFY WEBHOOK SIGNATURE
    # ---------------------------------------------------------

    try:

        razorpay_client.utility.verify_webhook_signature(
            raw_body.decode(
                "utf-8"
            ),
            webhook_signature,
            settings.razorpay_webhook_secret,
        )

        print(
            "Razorpay webhook signature verified."
        )

    except Exception as e:

        print(
            "Webhook signature verification failed:"
        )

        print(
            f"{type(e).__name__}: "
            f"{str(e)}"
        )

        raise HTTPException(
            status_code=400,
            detail=(
                "Webhook signature verification failed."
            ),
        )

    # ---------------------------------------------------------
    # 4. PARSE JSON
    # ---------------------------------------------------------

    try:

        event_data = await request.json()

    except Exception:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid webhook JSON payload."
            ),
        )

    event_type = (
        event_data.get(
            "event"
        )
    )

    received_at = (
        datetime.datetime.now(
            datetime.timezone.utc
        ).isoformat()
    )

    # ---------------------------------------------------------
    # 5. RAZORPAY PAYMENT ENTITY
    # ---------------------------------------------------------

    payment_entity = (
        event_data
        .get("payload", {})
        .get("payment", {})
        .get("entity", {})
    )

    order_entity = (
        event_data
        .get("payload", {})
        .get("order", {})
        .get("entity", {})
    )

    razorpay_order_id = (
        payment_entity.get(
            "order_id"
        )
        or order_entity.get(
            "id"
        )
    )

    razorpay_payment_id = (
        payment_entity.get(
            "id"
        )
    )

    print(
        f"Webhook event: {event_type}"
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
    # 6. LOG WEBHOOK TO GOOGLE SHEETS
    # ---------------------------------------------------------

    webhook_sheet_data = {

        "webhookId":
            event_id
            or (
                "rzp-"
                + str(
                    int(
                        time.time() *
                        1000
                    )
                )
            ),

        "source":
            "razorpay",

        "eventType":
            event_type
            or "",

        "eventId":
            event_id
            or "",

        "orderId":
            "",

        "razorpayOrderId":
            razorpay_order_id
            or "",

        "razorpayPaymentId":
            razorpay_payment_id
            or "",

        "receivedAt":
            received_at,

        "processingStatus":
            "received",

        "payload":
            event_data,
    }

    try:

        await sync_webhook_to_google_sheets(
            webhook_sheet_data
        )

        print(
            "Webhook recorded in Google Sheets."
        )

    except Exception as webhook_sheet_error:

        print(
            "Webhook Sheets logging failed:"
        )

        print(
            f"{type(webhook_sheet_error).__name__}: "
            f"{str(webhook_sheet_error)}"
        )

    # ---------------------------------------------------------
    # 7. IGNORE UNSUPPORTED EVENTS
    # ---------------------------------------------------------

    supported_events = {
        "payment.captured",
        "order.paid",
        "payment.failed",
    }

    if event_type not in supported_events:

        print(
            f"Ignoring unsupported webhook: "
            f"{event_type}"
        )

        return {
            "status":
                "ignored",

            "event":
                event_type,
        }

    if not razorpay_order_id:

        print(
            "Webhook missing Razorpay order ID."
        )

        return {
            "status":
                "ignored",

            "reason":
                "missing_razorpay_order_id",
        }

    # ---------------------------------------------------------
    # 8. PAYMENT CAPTURED / ORDER PAID
    # ---------------------------------------------------------

    if event_type in {
        "payment.captured",
        "order.paid",
    }:

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

                        "razorpayPaymentId":
                            razorpay_payment_id,

                        "paymentVerifiedAt":
                            datetime.datetime.utcnow(),
                    }
                },
                return_document=
                    ReturnDocument.AFTER,
            )
        )

        if not updated_order:

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
                "Webhook received before the order "
                "was available in MongoDB."
            )

            return {
                "status":
                    "retry_required"
            }

        # -----------------------------------------------------
        # 9. STORE COMPLETE PAYMENT DETAILS
        # -----------------------------------------------------

        payment_record = (
            extract_payment_sheet_data(
                updated_order,
                payment_entity,
                signature_verified=True,
                event_id=event_id or "",
                event_type=event_type or "",
                webhook_received_at=received_at,
            )
        )

        await db.orders.update_one(
            {
                "_id":
                    updated_order["_id"]
            },
            {
                "$set": {
                    "paymentDetails":
                        payment_record,

                    "paymentMethod":
                        payment_entity.get(
                            "method"
                        ),

                    "razorpayFee":
                        payment_record.get(
                            "razorpayFee"
                        ),

                    "razorpayTax":
                        payment_record.get(
                            "razorpayTax"
                        ),

                    "paymentCapturedAt":
                        payment_record.get(
                            "paymentCapturedAt"
                        ),
                }
            },
        )

        # -----------------------------------------------------
        # 10. GOOGLE SHEETS ORDERS
        # -----------------------------------------------------

        customer = (
            updated_order.get(
                "customer",
                {},
            )
        )

        address = (
            f"{customer.get('address', '')}, "
            f"{customer.get('city', '')}, "
            f"{customer.get('state', '')} - "
            f"{customer.get('pincode', '')}"
        )

        order_sheet_payload = {

            "type":
                "order",

            "data": {

                "orderId":
                    updated_order.get(
                        "orderId",
                        "",
                    ),

                "createdAt":
                    serialize_datetime(
                        updated_order.get(
                            "createdAt"
                        )
                    ),

                "customerName":
                    customer.get(
                        "fullName",
                        "",
                    ),

                "phone":
                    customer.get(
                        "phone",
                        "",
                    ),

                "email":
                    customer.get(
                        "email",
                        "",
                    ),

                "address":
                    address,

                "city":
                    customer.get(
                        "city",
                        "",
                    ),

                "state":
                    customer.get(
                        "state",
                        "",
                    ),

                "pincode":
                    customer.get(
                        "pincode",
                        "",
                    ),

                "items":
                    updated_order.get(
                        "items",
                        [],
                    ),

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

                "currency":
                    "INR",

                "paymentStatus":
                    "paid",

                "orderStatus":
                    "confirmed",

                "paymentMethod":
                    payment_entity.get(
                        "method",
                        "",
                    ),

                "razorpayOrderId":
                    razorpay_order_id,

                "razorpayPaymentId":
                    razorpay_payment_id,

                "razorpaySignatureVerified":
                    True,

                "paymentCapturedAt":
                    payment_record.get(
                        "paymentCapturedAt",
                        "",
                    ),

                "lastWebhookEvent":
                    event_type,

                "lastWebhookAt":
                    received_at,

                "createdSource":
                    "razorpay_webhook",
            },
        }

        try:

            await post_to_google_apps_script(
                order_sheet_payload
            )

            print(
                "Google Sheets Orders webhook sync successful."
            )

        except Exception as e:

            print(
                "Google Sheets Orders webhook sync failed:"
            )

            print(
                f"{type(e).__name__}: {str(e)}"
            )

        # -----------------------------------------------------
        # 11. GOOGLE SHEETS PAYMENT RECORD
        # -----------------------------------------------------

        try:

            await sync_payment_to_google_sheets(
                payment_record
            )

            print(
                "Google Sheets Payments webhook sync successful."
            )

        except Exception as e:

            print(
                "Google Sheets Payments webhook sync failed:"
            )

            print(
                f"{type(e).__name__}: {str(e)}"
            )

        # -----------------------------------------------------
        # 12. RETURN
        # -----------------------------------------------------

        print(
            "========== RAZORPAY WEBHOOK COMPLETE =========="
        )

        return {

            "status":
                "ok",

            "event":
                event_type,

            "orderId":
                updated_order.get(
                    "orderId"
                ),

            "paymentStatus":
                "paid",

            "orderStatus":
                "confirmed",
        }

    # ---------------------------------------------------------
    # 13. PAYMENT FAILED
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

        print(
            "Payment failure recorded."
        )

        return {
            "status":
                "ok",

            "event":
                event_type,

            "paymentStatus":
                "failed",
        }

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
