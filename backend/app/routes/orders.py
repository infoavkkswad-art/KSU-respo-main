@router.post("/verify-payment")
async def verify_payment(payload: VerifyPaymentRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    # Retrieve authoritative order linked to this razorpay order ID from MongoDB
    existing_order = await db.orders.find_one({"razorpayOrderId": payload.razorpay_order_id})
    if not existing_order:
        raise HTTPException(status_code=404, detail="Order reference not found for this payment session.")

    # Verify signature server-side using RAZORPAY_KEY_SECRET
    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': payload.razorpay_order_id,
            'razorpay_payment_id': payload.razorpay_payment_id,
            'razorpay_signature': payload.razorpay_signature
        })
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid cryptographic payment signature.")

    # Confirm payment status via Razorpay API to ensure 'captured' state
    try:
        payment_details = razorpay_client.payment.fetch(payload.razorpay_payment_id)
        if payment_details.get("status") != "captured":
            raise HTTPException(status_code=400, detail="Payment has not been fully captured yet.")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Unable to verify payment capture status with gateway.")

    # Atomically update the MongoDB order from paymentStatus="pending" to paymentStatus="paid"
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

    # Only perform the Google Sheets/email synchronization if THIS request actually changed the order from pending to paid
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
        # If updated_order is None, it means the order was already paid or not in pending state
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

    # Verify webhook signature using RAW request body before parsing JSON
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

    # Webhook event deduplication via database check
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
            # Atomically transition from pending to paid
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

            # Synchronize to Google Sheets only if this webhook execution successfully updated the state
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
