# Kawad Swad 2.0 — API Endpoint Inventory

This inventory documents all backend API endpoints across Express (`server.ts`) and FastAPI (`backend/app`).

---

## 1. Health Endpoints
- **Method:** `GET`
- **Route:** `/api/health`, `/health`, `/healthz`
- **Caller:** Load balancers, Render health check, `apiClient.checkHealth()`
- **Auth:** Public
- **Request:** None
- **Response:** `{ "status": "ok", "mongodb"?: "connected" }`
- **Failure:** 503 if database unreachable (FastAPI)
- **Rate Limit:** None
- **Test Coverage:** Automated build check

---

## 2. Product Catalog
- **Method:** `GET`
- **Route:** `/api/products`
- **Caller:** `ProductService`, `ProductMasterContext`
- **Auth:** Public
- **Request:** None
- **Response:** `{ "success": true, "products": [...] }` (43 commercial SKUs)
- **DB Operations:** Reads from `products` collection / `SALES_SKUS`
- **Failure:** 500 error message
- **Rate Limit:** Standard
- **Test Coverage:** `tests/commercial-data.test.ts`

---

## 3. Fulfillment & Pincode Lookup
- **Method:** `GET`
- **Route:** `/api/fulfillment/pincode/:pincode`
- **Caller:** `Cart.tsx`, `Checkout.tsx`
- **Auth:** Public
- **Request:** 6-digit Indian PIN code in URL param
- **Response:** `{ "pincode": string, "validPincode": boolean, "fulfillmentType": "MANUAL" | "SHIPPING", "officeName": string, ... }`
- **DB Operations:** Lookup in pincode directory / regional regex
- **Failure:** 400 if invalid PIN
- **Test Coverage:** `tests/cart-fulfillment.test.ts`

---

## 4. Server-Side Cart Pricing Quote
- **Method:** `POST`
- **Route:** `/api/fulfillment/cart-quote`
- **Caller:** `Checkout.tsx`, `apiClient.getCartQuote()`
- **Auth:** Public
- **Request:** `{ "pincode": string, "items": [{ "sku": string, "quantity": number }] }`
- **Response:** `{ "success": true, "pincode": string, "fulfillmentType": string, "subtotal": number, "shipping": number, "total": number, "items": [...] }`
- **DB Operations:** Reads pricing config; recalculates authoritative prices
- **Failure:** 400 if invalid PIN or empty cart
- **Test Coverage:** `tests/cart-fulfillment.test.ts`

---

## 5. Order Creation
- **Method:** `POST`
- **Route:** `/api/orders`
- **Caller:** `Checkout.tsx`, `apiClient.createOrder()`
- **Auth:** Public (requires customer details)
- **Request:** `{ "customer": { "fullName", "phone", "email", "address", "city", "state", "pincode" }, "items": [{ "sku", "quantity" }], "idempotencyKey"?: string }`
- **Response:** `{ "orderId": string, "razorpayOrderId": string, "razorpayKeyId": string, "amount": number, "currency": "INR", "status": "pending", ... }`
- **DB Operations:** Creates order record (`orders` collection / `/data/orders_store.json`)
- **Failure:** 400 if missing customer details or cart empty
- **Test Coverage:** `tests/payment-security.test.ts`, `tests/cart-fulfillment.test.ts`

---

## 6. Payment Verification
- **Method:** `POST`
- **Route:** `/api/orders/verify-payment`
- **Caller:** `Checkout.tsx`, `apiClient.verifyPayment()`
- **Auth:** Public (HMAC signature verification required)
- **Request:** `{ "razorpay_order_id": string, "razorpay_payment_id": string, "razorpay_signature": string }`
- **Response:** `{ "success": true, "message": string, "orderId": string, "paymentStatus": "paid", "status": "confirmed" }`
- **DB Operations:** Atomic update of order to `paid` and `confirmed`
- **Failure:** 400 for invalid/missing signature, 404 if order not found, 500 if unconfigured secret in production
- **Test Coverage:** `tests/payment-security.test.ts`

---

## 7. Razorpay Webhook
- **Method:** `POST`
- **Route:** `/api/webhooks/razorpay`
- **Caller:** Razorpay Webhook Service
- **Auth:** HMAC-SHA256 signature via `X-Razorpay-Signature` header
- **Request:** Raw event JSON (`payment.captured`, `order.paid`)
- **Response:** `{ "status": "ok", "received": true }`
- **DB Operations:** Updates order to `paid` if not already paid
- **Failure:** 400 if signature invalid
- **Test Coverage:** `tests/payment-security.test.ts`

---

## 8. Order Tracking Lookup
- **Method:** `GET`
- **Route:** `/api/orders/:orderId?phone=<phone>`
- **Caller:** `TrackOrder.tsx`, `apiClient.trackOrder()`
- **Auth:** Customer Phone Verification Required (SEC-002)
- **Request:** URL param `orderId` + Query param `phone`
- **Response:** `{ "orderId": string, "status": string, "customer": { "fullName", "phoneMasked", "city", "state" }, "items": [...], "subtotal", "shipping", "total" }`
- **DB Operations:** Query by `orderId`
- **Failure:** 400 if phone missing, 404 if order not found or phone does not match
- **Rate Limit:** 10 requests per minute per IP
- **Test Coverage:** `tests/order-authorization.test.ts`

---

## 9. Product Reviews
- **Method:** `GET`
- **Route:** `/api/reviews/:productId`
- **Caller:** `ProductDetail.tsx`, `ReviewService.getReviews()`
- **Auth:** Public
- **Request:** `limit`, `skip` query params
- **Response:** Array of approved reviews
- **DB Operations:** Filter reviews by `productId` and `status === 'approved'`
- **Test Coverage:** `tests/review-moderation.test.ts`

---

## 10. Product Review Summary
- **Method:** `GET`
- **Route:** `/api/reviews/:productId/summary`
- **Caller:** `ProductDetail.tsx`, `ReviewService.getSummary()`
- **Auth:** Public
- **Response:** `{ "productId": string, "averageRating": number, "reviewCount": number, "ratingCounts": {...} }`
- **Behavior:** Returns `averageRating = 0` when 0 reviews exist
- **Test Coverage:** `tests/review-moderation.test.ts`

---

## 11. Submit Product Review
- **Method:** `POST`
- **Route:** `/api/reviews`
- **Caller:** `ProductDetail.tsx`, `ReviewService.createReview()`
- **Auth:** Purchase verification required for immediate approval
- **Request:** `{ "productId", "rating", "customerName", "userLocation", "comment", "orderId"?: string, "sku"?: string }`
- **Response:** Created review record (`status: 'approved'` if purchase verified; `'pending'` if unverified)
- **Test Coverage:** `tests/review-moderation.test.ts`

---

## 12. Business Enquiries
- **Method:** `POST`
- **Route:** `/api/enquiries`
- **Caller:** `Contact.tsx`, `BulkOrders.tsx`, `Distributor.tsx`
- **Auth:** Public
- **Request:** `{ "type", "contactPerson", "phone", "email", "businessName", "location", "message" }`
- **Response:** `{ "success": true, "enquiryId": string, "message": string }`
- **DB Operations:** Appends enquiry to store/database
- **Test Coverage:** Automated build check
