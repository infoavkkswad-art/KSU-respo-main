# ---------------------------------------------------------
# PAYMENT FAILED
# ---------------------------------------------------------

if event_type == "payment.failed":

    failure_reason = (
        payment_entity.get("error_description")
        or payment_entity.get("error_reason")
        or payment_entity.get("error_code")
        or "Payment failed."
    )

    failed_order = await db.orders.find_one_and_update(
        {
            "razorpayOrderId": razorpay_order_id,

            # Never overwrite a successfully paid order
            "paymentStatus": {
                "$ne": "paid",
            },
        },
        {
            "$set": {
                "paymentStatus": "failed",

                "status":
                    "payment_failed",

                "fulfillmentStatus":
                    "AWAITING_PAYMENT",

                "paymentFailureReason":
                    str(failure_reason),

                "razorpayPaymentId":
                    razorpay_payment_id,

                "lastWebhookEvent":
                    event_type,

                "lastWebhookAt":
                    received_at,
            }
        },
        return_document=ReturnDocument.AFTER,
    )

    if not failed_order:

        # The order may already be paid.
        existing = await db.orders.find_one(
            {
                "razorpayOrderId":
                    razorpay_order_id,
            }
        )

        if existing and (
            existing.get("paymentStatus")
            == "paid"
        ):

            return {
                "status": "ok",
                "event": event_type,
                "paymentStatus": "paid",
                "orderStatus":
                    existing.get(
                        "status",
                        "confirmed",
                    ),
            }

        raise HTTPException(
            status_code=404,
            detail="Order not found for payment failure.",
        )

    # ---------------------------------------------------------
    # GOOGLE SHEETS ORDER UPDATE
    # ---------------------------------------------------------

    customer = failed_order.get(
        "customer",
        {},
    )

    address = (
        f"{customer.get('address', '')}, "
        f"{customer.get('city', '')}, "
        f"{customer.get('state', '')} - "
        f"{customer.get('pincode', '')}"
    )

    failed_order_sheet_payload = {
        "type": "order",

        "data": {
            "orderId":
                failed_order.get(
                    "orderId",
                    "",
                ),

            "createdAt":
                serialize_datetime(
                    failed_order.get(
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
                failed_order.get(
                    "items",
                    [],
                ),

            "subtotal":
                failed_order.get(
                    "subtotal",
                    0,
                ),

            "shipping":
                failed_order.get(
                    "shipping",
                    0,
                ),

            "total":
                failed_order.get(
                    "total",
                    0,
                ),

            "fulfillmentType":
                failed_order.get(
                    "fulfillmentType",
                    "",
                ),

            "pricingMode":
                failed_order.get(
                    "pricingMode",
                    "",
                ),

            "shippingRequired":
                failed_order.get(
                    "shippingRequired",
                    False,
                ),

            "fulfillmentStatus":
                failed_order.get(
                    "fulfillmentStatus",
                    "AWAITING_PAYMENT",
                ),

            "currency":
                "INR",

            "paymentStatus":
                "failed",

            "orderStatus":
                "payment_failed",

            "paymentMethod":
                payment_entity.get(
                    "method",
                    "",
                ),

            "razorpayOrderId":
                razorpay_order_id,

            "razorpayPaymentId":
                razorpay_payment_id,

            "paymentFailureReason":
                str(failure_reason),

            "razorpaySignatureVerified":
                True,

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
            failed_order_sheet_payload
        )

        print(
            "Google Sheets failed-order update successful."
        )

    except Exception as e:

        print(
            "Google Sheets failed-order update failed:"
        )

        print(
            f"{type(e).__name__}: {str(e)}"
        )

    # ---------------------------------------------------------
    # GOOGLE SHEETS PAYMENT RECORD
    # ---------------------------------------------------------

    try:

        failed_payment_record = (
            extract_payment_sheet_data(
                failed_order,
                payment_entity,
                signature_verified=True,
                event_id=event_id or "",
                event_type=event_type or "",
                webhook_received_at=received_at,
            )
        )

        failed_payment_record[
            "paymentStatus"
        ] = "failed"

        failed_payment_record[
            "orderStatus"
        ] = "payment_failed"

        failed_payment_record[
            "failureReason"
        ] = str(failure_reason)

        await sync_payment_to_google_sheets(
            failed_payment_record
        )

        print(
            "Google Sheets failed-payment sync successful."
        )

    except Exception as e:

        print(
            "Google Sheets failed-payment sync failed:"
        )

        print(
            f"{type(e).__name__}: {str(e)}"
        )

    print(
        "Payment failure recorded and order marked payment_failed."
    )

    return {
        "status": "ok",
        "event": event_type,
        "orderId":
            failed_order.get(
                "orderId"
            ),
        "paymentStatus": "failed",
        "orderStatus": "payment_failed",
    }
