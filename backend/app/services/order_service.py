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


async def process_and_save_order(
    payload: CreateOrderRequest,
):
    """
    Create and save a new order in MongoDB.

    Important:
    - Pricing comes from backend SKU data.
    - Frontend prices are NOT trusted.
    - Razorpay is created later by routes/orders.py.
    - Google Sheets failure must NEVER prevent checkout.
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
                "idempotencyKey":
                    payload.idempotencyKey
            }
        )

        if existing:

            existing.pop("_id", None)

            # If an older order exists without a payment status,
            # make the response predictable.
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
        # Backend price
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
        # Shipping
        # ------------------------------------------------------

        try:

            is_free_shipping = bool(
                sku_obj.get(
                    "freeShipping",
                    False,
                )
            )

            if is_free_shipping:

                item_shipping = 0.0

            else:

                item_shipping = float(
                    sku_obj.get(
                        "shipping",
                        49,
                    )
                )

        except Exception:

            item_shipping = 49.0

        # ------------------------------------------------------
        # Calculate item total
        # ------------------------------------------------------

        item_total = (
            unit_price * quantity
        )

        subtotal += item_total

        # Keep the existing business rule:
        # use the largest applicable shipping charge.
        shipping = max(
            shipping,
            item_shipping * quantity,
        )

        # ------------------------------------------------------
        # Snapshot item
        # ------------------------------------------------------

        item_snapshots.append(
            {
                "sku":
                    sku_obj.get(
                        "sku",
                        item.sku,
                    ),

                "quantity":
                    quantity,

                "unitPrice":
                    unit_price,

                "productNameSnapshot":
                    family.get(
                        "name",
                        "Kawad Swad Product",
                    ),

                "packSizeSnapshot":
                    int(
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

    final_total = round(
        subtotal + shipping,
        2,
    )

    if final_total <= 0:

        raise HTTPException(
            status_code=400,
            detail="Order total must be greater than zero.",
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
    # 6. CREATE SIMPLE MONGODB DOCUMENT
    # ==========================================================
    #
    # IMPORTANT:
    # We intentionally do NOT construct OrderDocument here.
    #
    # This removes model/schema incompatibilities from the
    # checkout creation path.
    #

    now = datetime.utcnow()

    customer_data = {
        "fullName":
            payload.customer.fullName,

        "phone":
            payload.customer.phone,

        "email":
            str(payload.customer.email)
            if payload.customer.email
            else "",

        "address":
            payload.customer.address,

        "city":
            payload.customer.city,

        "state":
            payload.customer.state,

        "pincode":
            payload.customer.pincode,
    }

    order_doc = {

        "orderId":
            order_id,

        "paymentStatus":
            "pending",

        "status":
            "pending",

        "customer":
            customer_data,

        "items":
            item_snapshots,

        "subtotal":
            subtotal,

        "shipping":
            shipping,

        "total":
            final_total,

        "createdAt":
            now,

        "idempotencyKey":
            payload.idempotencyKey,
    }

    # ==========================================================
    # 7. INSERT INTO MONGODB
    # ==========================================================

    try:

        await orders_collection.insert_one(
            order_doc
        )

    except DuplicateKeyError:

        # Another request may have created the same
        # idempotency key at almost exactly the same time.

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
                "This order reference already exists."
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
    # 8. GOOGLE SHEETS
    # ==========================================================
    #
    # This is deliberately non-blocking from the checkout
    # perspective. If Google Sheets fails, payment must still
    # continue.
    #

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

                "shipping":
                    shipping,

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

        # NEVER stop checkout because Sheets failed.

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

    db = get_database()

    orders_collection = db["orders"]

    clean_order_id = (
        order_id
        .strip()
        .upper()
    )

    clean_phone = (
        phone
        .strip()
    )

    order = await orders_collection.find_one(
        {
            "orderId":
                clean_order_id
        }
    )

    if not order:

        raise HTTPException(
            status_code=404,
            detail="Order not found.",
        )

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

    return OrderTrackingResponse(
        orderId=order_id,
        status=order.get(
            "status",
            "pending",
        ),
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
