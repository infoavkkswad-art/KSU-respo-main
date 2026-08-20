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
from .pricing_service import calculate_cart_quote


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
    Create and save a new order using the authoritative server-side
    fulfilment and pricing quote.

    Frontend prices are never trusted.

    The same quote engine used by Checkout is recalculated here before
    the order is saved. This guarantees that MANUAL and SHIPPING orders
    receive the same commercial treatment at order creation time.
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

    # ==========================================================
    # 3. AUTHORITATIVE SERVER-SIDE QUOTE
    # ==========================================================

    try:

        quote = await calculate_cart_quote(
            pincode=payload.customer.pincode,
            items=[
                {
                    "sku": item.sku,
                    "quantity": item.quantity,
                }
                for item in payload.items
            ],
        )

    except HTTPException:
        raise

    except Exception as e:

        print(
            "========== ORDER QUOTE ERROR =========="
        )

        print(
            f"TYPE: {type(e).__name__}"
        )

        print(
            f"MESSAGE: {str(e)}"
        )

        print(
            "========================================"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to calculate the final order price."
            ),
        )

    # ==========================================================
    # 4. VALIDATE QUOTE
    # ==========================================================

    if not quote.get(
        "success",
        False,
    ):

        raise HTTPException(
            status_code=500,
            detail=(
                "Invalid server pricing quote."
            ),
        )

    fulfillment_type = (
        str(
            quote.get(
                "fulfillmentType",
                "SHIPPING",
            )
        )
        .strip()
        .upper()
    )

    if fulfillment_type not in {
        "MANUAL",
        "SHIPPING",
    }:

        raise HTTPException(
            status_code=500,
            detail=(
                "Invalid server fulfilment type."
            ),
        )

    try:

        subtotal = round(
            float(
                quote["subtotal"]
            ),
            2,
        )

        shipping = round(
            float(
                quote["shipping"]
            ),
            2,
        )

        final_total = round(
            float(
                quote["total"]
            ),
            2,
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail=(
                "Invalid server pricing values."
            ),
        )

    if (
        subtotal < 0
        or shipping < 0
        or final_total <= 0
    ):

        raise HTTPException(
            status_code=500,
            detail=(
                "Server pricing calculation is invalid."
            ),
        )

    expected_total = round(
        subtotal + shipping,
        2,
    )

    if final_total != expected_total:

        raise HTTPException(
            status_code=500,
            detail=(
                "Server pricing quote total is inconsistent."
            ),
        )

    if (
        fulfillment_type == "MANUAL"
        and shipping != 0
    ):

        raise HTTPException(
            status_code=500,
            detail=(
                "MANUAL fulfilment cannot contain a shipping charge."
            ),
        )

    # ==========================================================
    # 5. BUILD ITEM SNAPSHOTS FROM SERVER QUOTE
    # ==========================================================

    quote_items_by_sku = {}

    for quote_item in quote.get(
        "items",
        [],
    ):

        quote_sku = str(
            quote_item.get(
                "sku",
                "",
            )
        ).strip().upper()

        if quote_sku:
            quote_items_by_sku[
                quote_sku
            ] = quote_item

    item_snapshots = []

    for item in payload.items:

        sku_code = str(
            item.sku
        ).strip().upper()

        quote_item = quote_items_by_sku.get(
            sku_code
        )

        if not quote_item:

            raise HTTPException(
                status_code=500,
                detail=(
                    f"Server quote is missing SKU {sku_code}."
                ),
            )

        family, sku_obj = find_sku_in_backend(
            sku_code
        )

        if not family or not sku_obj:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Invalid or unknown SKU: {sku_code}"
                ),
            )

        if not sku_obj.get(
            "available",
            True,
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Product is currently unavailable: "
                    f"{sku_code}"
                ),
            )

        try:

            quantity = int(
                item.quantity
            )

            quoted_quantity = int(
                quote_item["quantity"]
            )

            unit_price = round(
                float(
                    quote_item["unitPrice"]
                ),
                2,
            )

            item_shipping = round(
                float(
                    quote_item.get(
                        "shipping",
                        0,
                    )
                ),
                2,
            )

            item_subtotal = round(
                float(
                    quote_item["itemSubtotal"]
                ),
                2,
            )

        except Exception:

            raise HTTPException(
                status_code=500,
                detail=(
                    f"Invalid server quote for SKU {sku_code}."
                ),
            )

        if (
            quantity <= 0
            or quantity != quoted_quantity
            or unit_price < 0
            or item_shipping < 0
            or item_subtotal < 0
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    f"Server quote validation failed for SKU {sku_code}."
                ),
            )

        item_snapshots.append(
            {
                "sku": sku_obj.get(
                    "sku",
                    sku_code,
                ),

                "quantity":
                    quantity,

                "unitPrice":
                    unit_price,

                "itemShipping":
                    item_shipping,

                "itemSubtotal":
                    item_subtotal,

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
    # 6. GENERATE UNIQUE ORDER ID
    # ==========================================================

    order_id = generate_backend_order_id()

    while await orders_collection.find_one(
        {
            "orderId":
                order_id
        }
    ):

        order_id = generate_backend_order_id()

    # ==========================================================
    # 7. CREATE MONGODB DOCUMENT
    # ==========================================================

    now = datetime.utcnow()

    customer_data = {
        "fullName":
            payload.customer.fullName,

        "phone":
            payload.customer.phone,

        "email":
            (
                str(
                    payload.customer.email
                )
                if payload.customer.email
                else ""
            ),

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

        "fulfillmentType":
            fulfillment_type,

        "pricingMode":
            quote.get(
                "pricingMode",
                (
                    "LOCAL"
                    if fulfillment_type ==
                    "MANUAL"
                    else "STANDARD"
                ),
            ),

        "shippingRequired":
            bool(
                quote.get(
                    "shippingRequired",
                    fulfillment_type ==
                    "SHIPPING",
                )
            ),

        "fulfillmentLocation":
            quote.get(
                "location",
                {},
            ),

        "createdAt":
            now,

        "idempotencyKey":
            payload.idempotencyKey,
    }

    # ==========================================================
    # 8. INSERT INTO MONGODB
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

            existing = (
                await orders_collection.find_one(
                    {
                        "idempotencyKey":
                            payload.idempotencyKey
                    }
                )
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
    # 9. GOOGLE SHEETS SYNC
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
                        str(
                            payload.customer.email
                        )
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

                "fulfillmentType":
                    fulfillment_type,

                "pricingMode":
                    quote.get(
                        "pricingMode",
                        (
                            "LOCAL"
                            if fulfillment_type ==
                            "MANUAL"
                            else "STANDARD"
                        ),
                    ),

                "shippingRequired":
                    bool(
                        quote.get(
                            "shippingRequired",
                            fulfillment_type ==
                            "SHIPPING",
                        )
                    ),

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
    # 10. RETURN CLEAN ORDER DATA
    # ==========================================================

    order_doc.pop(
        "_id",
        None,
    )

    return order_doc


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
