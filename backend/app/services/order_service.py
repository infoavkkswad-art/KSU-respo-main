from datetime import datetime
import random
import string

from fastapi import HTTPException
from pymongo.errors import DuplicateKeyError

from ..database import get_database
from ..models.product import find_sku_in_backend
from ..models.order import (
    CreateOrderRequest,
    OrderTrackingResponse,
    PublicCustomerSnapshot,
)
from .google_sheets_service import post_to_google_apps_script


# ==============================================================
# ORDER ID GENERATOR
# ==============================================================

def generate_backend_order_id() -> str:
    """
    Generate a unique Kawad Swad order ID.

    Example:
    KS-123456ABC
    """

    timestamp = str(
        int(datetime.utcnow().timestamp())
    )[-6:]

    random_part = "".join(
        random.choices(
            string.ascii_uppercase + string.digits,
            k=3,
        )
    )

    return f"KS-{timestamp}{random_part}"


# ==============================================================
# CREATE + SAVE ORDER
# ==============================================================

async def process_and_save_order(
    payload: CreateOrderRequest,
):
    """
    Create and save a new order in MongoDB.

    IMPORTANT PRICING RULE:

    Backend SKU websitePrice is the FINAL customer-facing price.

    The commercial pricing master calculates:

        sellingPrice + commercial shipping
        --------------------------------
        final websitePrice

    Therefore this service MUST NOT add shipping again.

    Frontend prices are NOT trusted.

    Pricing authority:

        Backend SKU catalogue
              ↓
        websitePrice
              ↓
        order subtotal
              ↓
        final total

    Razorpay is created later by routes/orders.py.

    Google Sheets failure must NEVER prevent checkout.
    """

    db = get_database()
    orders_collection = db["orders"]

    # ==========================================================
    # 1. BASIC VALIDATION
    # ==========================================================

    if not payload.items:
        raise HTTPException(
            status_code=400,
            detail="Cart is empty.",
        )

    # ==========================================================
    # 2. IDEMPOTENCY CHECK
    # ==========================================================

    if payload.idempotencyKey:

        existing = await orders_collection.find_one(
            {
                "idempotencyKey": payload.idempotencyKey
            }
        )

        if existing:

            existing.pop("_id", None)

            existing.setdefault(
                "paymentStatus",
                "pending",
            )

            existing.setdefault(
                "status",
                "pending",
            )

            return existing

    # ==========================================================
    # 3. SERVER-SIDE PRICE CALCULATION
    # ==========================================================

    subtotal = 0.0

    # ==========================================================
    # CUSTOMER-FACING SHIPPING
    #
    # Shipping is already included in websitePrice.
    #
    # Therefore:
    #
    # shipping = 0
    #
    # NEVER add another shipping amount here.
    # ==========================================================

    shipping = 0.0

    item_snapshots = []

    for item in payload.items:

        # ------------------------------------------------------
        # Find SKU in backend product catalogue
        # ------------------------------------------------------

        family, sku_obj = find_sku_in_backend(
            item.sku
        )

        if not family or not sku_obj:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Invalid or unknown SKU: "
                    f"{item.sku}"
                ),
            )

        # ------------------------------------------------------
        # Availability validation
        # ------------------------------------------------------

        if not sku_obj.get(
            "available",
            True,
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Product is currently unavailable: "
                    f"{item.sku}"
                ),
            )

        # ------------------------------------------------------
        # Quantity validation
        # ------------------------------------------------------

        try:

            quantity = int(
                item.quantity
            )

        except Exception:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Invalid quantity for SKU "
                    f"{item.sku}."
                ),
            )

        if quantity <= 0:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Quantity must be greater than zero."
                ),
            )

        # ------------------------------------------------------
        # Backend final customer price
        # ------------------------------------------------------

        try:

            unit_price = float(
                sku_obj["websitePrice"]
            )

        except Exception:

            raise HTTPException(
                status_code=500,
                detail=(
                    f"Backend price is missing for SKU "
                    f"{item.sku}."
                ),
            )

        # ------------------------------------------------------
        # Validate backend price
        # ------------------------------------------------------

        if (
            unit_price < 0
            or not (
                unit_price == unit_price
            )
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    f"Backend price is invalid for SKU "
                    f"{item.sku}."
                ),
            )

        # ------------------------------------------------------
        # Calculate item total
        #
        # websitePrice already includes the commercial
        # shipping component.
        #
        # Therefore:
        #
        # item total = final website price × quantity
        #
        # NEVER add shipping here.
        # ------------------------------------------------------

        item_total = (
            unit_price * quantity
        )

        if (
            item_total < 0
            or not (
                item_total == item_total
            )
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    f"Invalid calculated total for SKU "
                    f"{item.sku}."
                ),
            )

        subtotal += item_total

        # ------------------------------------------------------
        # Snapshot item
        # ------------------------------------------------------

        item_snapshots.append(
            {
                "sku": sku_obj.get(
                    "sku",
                    item.sku,
                ),

                "quantity": quantity,

                /*
                 * This is the FINAL customer-facing
                 * unit price, not the pre-shipping price.
                 */
                "unitPrice": unit_price,

                "productNameSnapshot": family.get(
                    "name",
                    "Kawad Swad Product",
                ),

                "packSizeSnapshot": int(
                    sku_obj.get(
                        "packSize",
                        0,
                    )
                ),
            }
        )

    # ==========================================================
    # 4. FINAL TOTAL
    # ==========================================================

    /*
     * Shipping is already included in each websitePrice.
     *
     * Therefore:
     *
     * final_total = subtotal
     */

    final_total = round(
        subtotal,
        2,
    )

    if final_total <= 0:

        raise HTTPException(
            status_code=400,
            detail=(
                "Order total must be greater than zero."
            ),
        )

    # ==========================================================
    # 5. GENERATE UNIQUE ORDER ID
    # ==========================================================

    order_id = generate_backend_order_id()

    while await orders_collection.find_one(
        {
            "orderId": order_id
        }
    ):

        order_id = generate_backend_order_id()

    # ==========================================================
    # 6. CREATE MONGODB DOCUMENT
    # ==========================================================

    now = datetime.utcnow()

    customer_data = {
        "fullName": payload.customer.fullName,

        "phone": payload.customer.phone,

        "email": (
            str(payload.customer.email)
            if payload.customer.email
            else ""
        ),

        "address": payload.customer.address,

        "city": payload.customer.city,

        "state": payload.customer.state,

        "pincode": payload.customer.pincode,
    }

    order_doc = {
        "orderId": order_id,

        # Newly created orders always begin as pending.
        # Razorpay verification changes this later.
        "paymentStatus": "pending",

        "status": "pending",

        "customer": customer_data,

        "items": item_snapshots,

        "subtotal": subtotal,

        /*
         * Customer-facing shipping is FREE because
         * commercial shipping is already included in
         * websitePrice.
         */
        "shipping": 0.0,

        "total": final_total,

        "createdAt": now,

        "idempotencyKey": payload.idempotencyKey,
    }

    # ==========================================================
    # 7. INSERT INTO MONGODB
    # ==========================================================

    try:

        await orders_collection.insert_one(
            order_doc
        )

    except DuplicateKeyError as e:

        print(
            "========== DUPLICATE KEY ERROR =========="
        )

        print(
            f"ERROR: {str(e)}"
        )

        print(
            "=========================================="
        )

        if payload.idempotencyKey:

            existing = await orders_collection.find_one(
                {
                    "idempotencyKey":
                        payload.idempotencyKey
                }
            )

            if existing:

                existing.pop(
                    "_id",
                    None,
                )

                existing.setdefault(
                    "paymentStatus",
                    "pending",
                )

                existing.setdefault(
                    "status",
                    "pending",
                )

                return existing

        raise HTTPException(
            status_code=409,
            detail=(
                f"MongoDB duplicate key: "
                f"{str(e)}"
            ),
        )

    except Exception as e:

        print(
            "========== MONGODB ORDER INSERT ERROR =========="
        )

        print(
            f"TYPE: {type(e).__name__}"
        )

        print(
            f"MESSAGE: {str(e)}"
        )

        print(
            "================================================="
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to save order to database."
            ),
        )

    # ==========================================================
    # 8. GOOGLE SHEETS SYNC
    # ==========================================================

    try:

        address_payload = {
            "name":
                payload.customer.fullName,

            "addressLine1":
                payload.customer.address,

            "city":
                payload.customer.city,

            "state":
                payload.customer.state,

            "pincode":
                payload.customer.pincode,

            "country":
                "India",
        }

        script_payload = {
            "type":
                "order",

            "data": {
                "orderId":
                    order_id,

                "createdAt":
                    now.isoformat(),

                "customerName":
                    payload.customer.fullName,

                "phone":
                    payload.customer.phone,

                "email":
                    (
                        str(payload.customer.email)
                        if payload.customer.email
                        else ""
                    ),

                "address":
                    address_payload,

                "items":
                    item_snapshots,

                "subtotal":
                    subtotal,

                /*
                 * Shipping is already included in
                 * websitePrice.
                 */
                "shipping":
                    0.0,

                "total":
                    final_total,

                "paymentStatus":
                    "pending",

                "orderStatus":
                    "new",
            },
        }

        await post_to_google_apps_script(
            script_payload
        )

    except Exception as e:

        print(
            "WARNING: Google Sheets sync failed."
        )

        print(
            f"{type(e).__name__}: {str(e)}"
        )

        # Sheets failure must NEVER stop checkout.

    # ==========================================================
    # 9. RETURN CLEAN ORDER DATA
    # ==========================================================

    order_doc.pop(
        "_id",
        None,
    )

    return order_doc


# ==============================================================
# ORDER TRACKING
# ==============================================================

async def get_order_by_id_and_phone(
    order_id: str,
    phone: str,
):
    """
    Retrieve an order using order ID + customer phone.

    Payment status is read directly from MongoDB.
    """

    db = get_database()

    orders_collection = db["orders"]

    # ==========================================================
    # 1. CLEAN INPUT
    # ==========================================================

    clean_order_id = (
        order_id
        .strip()
        .upper()
    )

    clean_phone = (
        phone
        .strip()
    )

    # ==========================================================
    # 2. FIND ORDER
    # ==========================================================

    order = await orders_collection.find_one(
        {
            "orderId": clean_order_id
        }
    )

    # ==========================================================
    # 2A. TRACKING DATABASE DIAGNOSTICS
    # ==========================================================

    print(
        "========== TRACKING DATABASE CHECK =========="
    )

    print(
        f"Tracking Order ID: {clean_order_id}"
    )

    print(
        f"MongoDB paymentStatus: "
        f"{order.get('paymentStatus') if order else 'ORDER NOT FOUND'}"
    )

    print(
        f"MongoDB status: "
        f"{order.get('status') if order else 'ORDER NOT FOUND'}"
    )

    print(
        f"MongoDB razorpayPaymentId: "
        f"{order.get('razorpayPaymentId') if order else 'ORDER NOT FOUND'}"
    )

    print(
        "============================================="
    )

    # ==========================================================
    # 3. ORDER NOT FOUND
    # ==========================================================

    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found.",
        )

    # ==========================================================
    # 4. VERIFY PHONE
    # ==========================================================

    stored_phone = (
        order
        .get("customer", {})
        .get("phone", "")
    )

    if stored_phone != clean_phone:

        raise HTTPException(
            status_code=404,
            detail=(
                "Order not found with provided details."
            ),
        )

    # ==========================================================
    # 5. CUSTOMER DISPLAY DATA
    # ==========================================================

    customer_info = (
        order.get(
            "customer",
            {},
        )
    )

    raw_phone = customer_info.get(
        "phone",
        "",
    )

    if len(raw_phone) >= 4:

        masked_phone = (
            "******"
            + raw_phone[-4:]
        )

    else:

        masked_phone = "******"

    # ==========================================================
    # 6. PAYMENT STATUS
    # ==========================================================

    payment_status = order.get(
        "paymentStatus",
        "pending",
    )

    # ==========================================================
    # 7. ORDER STATUS
    # ==========================================================

    order_status = order.get(
        "status",
        "pending",
    )

    # ==========================================================
    # 8. TRACKING RESPONSE
    # ==========================================================

    return OrderTrackingResponse(

        orderId=clean_order_id,

        status=order_status,

        paymentStatus=payment_status,

        customer=PublicCustomerSnapshot(

                fullName=customer_info.get(
                        "fullName",
                        "Valued Customer",
                    ),

                phoneMasked=masked_phone,

                city=customer_info.get(
                        "city",
                        "",
                    ),

                state=customer_info.get(
                        "state",
                        "",
                    ),
            ),

        items=order.get(
                "items",
                [],
            ),

        subtotal=order.get(
                "subtotal",
                0,
            ),

        shipping=order.get(
                "shipping",
                0,
            ),

        total=order.get(
                "total",
                0,
            ),

        createdAt=order.get(
                "createdAt",
                datetime.utcnow(),
            ),
    )
