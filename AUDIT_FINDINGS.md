# Kawad Swad 2.0 — Audit Findings

**Audit Scope:** Frontend, Express Backend, FastAPI Backend, MongoDB, Razorpay Flow, Security, and Configuration.  
**Report Date:** 31 October 2026

---

## 1. Confirmed Fixes & Remediated Defects

### Finding SEC-001: Wildcard CORS Configuration
- **Finding ID:** SEC-001
- **Title:** Wildcard CORS Policy Replaced with Explicit Domain Allowlist
- **Severity:** High
- **Status:** Tested
- **Affected files:** `/server.ts`, `/backend/app/config.py`, `/backend/app/main.py`
- **Affected routes or components:** All HTTP endpoints (`app.use` CORS middleware)
- **Evidence:** `server.ts` previously configured `res.header('Access-Control-Allow-Origin', '*')`.
- **Business impact:** Any external web origin could query API endpoints or read responses in cross-origin contexts.
- **Root cause:** Default dev boilerplate left in production middleware.
- **Patch implemented:** Restricted CORS to explicit origin allowlist (`https://kawadswad.in`, `https://www.kawadswad.in`, authorized staging domains, and local dev origins), with `Vary: Origin` response headers.
- **Tests executed:** Tested preflight and allowed origins vs unallowed origins.
- **Test results:** Passed. Only trusted origins receive Access-Control headers.
- **Remaining risks:** None in code. If new staging subdomains are added, they must be added to the allowlist.

---

### Finding SEC-002: BOLA / IDOR in Order Tracking Endpoint
- **Finding ID:** SEC-002
- **Title:** Broken Object Level Authorization (IDOR) on Order Tracking
- **Severity:** High
- **Status:** Tested
- **Affected files:** `/server.ts`
- **Affected routes or components:** `GET /api/orders/:orderId`
- **Evidence:** `server.ts` line 625 previously evaluated `if (cleanQueryPhone && ...)`. When a caller provided no phone parameter, the condition was bypassed and customer PII was returned.
- **Business impact:** Anyone guessing or enumerating order IDs could read customer full names, masked phones, addresses, and order contents.
- **Root cause:** Falsy guard on optional query parameter instead of strict parameter requirement.
- **Patch implemented:** Enforced mandatory `phone` parameter validation (minimum 4 digits required). Requests without matching customer phone are rejected with HTTP 400/404. Added IP rate limiting (10 requests/minute).
- **Tests executed:** `tests/order-authorization.test.ts` (suite with valid phone, empty phone, mismatched phone, and rate limit).
- **Test results:** Passed (4/4 tests passed).
- **Remaining risks:** None.

---

### Finding PAY-001: Missing Cryptographic Payment Verification in Node Server
- **Finding ID:** PAY-001
- **Title:** Simulated Payment Verification Replaced with HMAC-SHA256 Cryptographic Check
- **Severity:** Critical
- **Status:** Tested
- **Affected files:** `/server.ts`, `/src/pages/Checkout.tsx`
- **Affected routes or components:** `POST /api/orders/verify-payment`, `Checkout.tsx`
- **Evidence:** `server.ts` previously accepted `razorpay_order_id` and updated `paymentStatus = 'paid'` without verifying `razorpay_signature` against `RAZORPAY_KEY_SECRET`.
- **Business impact:** Malicious clients could mark orders as paid without paying on Razorpay.
- **Root cause:** Test stub from local prototyping left in place.
- **Patch implemented:**
  1. Configured HMAC-SHA256 signature verification in `server.ts` (`razorpay_signature` checked against `RAZORPAY_KEY_SECRET`).
  2. Enforced strict production checks: missing secrets in production trigger HTTP 500 rejection; tampered signatures trigger HTTP 400.
  3. Added frontend guard in `Checkout.tsx` ensuring `rzp_test_mock` cannot execute in production (`import.meta.env.PROD`).
- **Tests executed:** `tests/payment-security.test.ts` (valid signature, tampered signature, paise calculation).
- **Test results:** Passed (4/4 tests passed).
- **Remaining risks:** Production requires real `RAZORPAY_KEY_SECRET` in environment variables.

---

### Finding PAY-002: Missing Razorpay Webhook Verification in Express Layer
- **Finding ID:** PAY-002
- **Title:** Missing Webhook Handler in Express Layer
- **Severity:** High
- **Status:** Tested
- **Affected files:** `/server.ts`
- **Affected routes or components:** `POST /api/webhooks/razorpay`
- **Evidence:** `server.ts` only handled `/api/webhooks/indiapost` and lacked `/api/webhooks/razorpay`.
- **Business impact:** If Render routed webhook traffic to the Node server rather than FastAPI, payment events would 404.
- **Root cause:** Express server had incomplete webhook route parity with FastAPI.
- **Patch implemented:** Added `POST /api/webhooks/razorpay` in `server.ts` with raw buffer HMAC-SHA256 signature verification and idempotent order state transition to `paid` on `payment.captured`.
- **Tests executed:** `tests/payment-security.test.ts` (webhook raw body signature verification test).
- **Test results:** Passed.
- **Remaining risks:** None.

---

### Finding DB-001: Transient In-Memory Storage in Express
- **Finding ID:** DB-001
- **Title:** In-Memory Orders & Reviews Replaced with Durable File-Backed Persistence
- **Severity:** High
- **Status:** Tested
- **Affected files:** `/server.ts`
- **Affected routes or components:** Order creation, payment verification, reviews, and enquiries
- **Evidence:** Orders and reviews were held in memory Maps and arrays in `server.ts`.
- **Business impact:** Restarting the Node server caused newly placed orders and customer reviews to be erased.
- **Root cause:** In-memory mocks used during UI development without persistent disk synchronization.
- **Patch implemented:** Integrated persistent file-backed JSON stores (`/data/orders_store.json`, `/data/reviews_store.json`, `/data/enquiries_store.json`) with automatic disk synchronization on write.
- **Tests executed:** Server build and persistence verification.
- **Test results:** Passed. Orders and reviews persist across restarts.
- **Remaining risks:** For multi-instance horizontal scaling, the FastAPI + MongoDB architecture remains the authoritative distributed store.

---

### Finding REV-001: Artificial Review Approval & False 5-Star Ratings
- **Finding ID:** REV-001
- **Title:** Unmoderated Review Submissions and Fabricated 5.0 Star Summary
- **Severity:** High
- **Status:** Tested
- **Affected files:** `/server.ts`
- **Affected routes or components:** `GET /api/reviews/:productId`, `GET /api/reviews/:productId/summary`, `POST /api/reviews`
- **Evidence:** `server.ts` line 669 defaulted `averageRating = 5.0` when `totalReviews === 0`, and automatically marked all posted reviews as `verifiedPurchase: true` and `status: 'approved'`.
- **Business impact:** Deceptive rating display and potential for spam/fraudulent reviews to be immediately published.
- **Root cause:** Hardcoded optimistic defaults.
- **Patch implemented:**
  1. Corrected `averageRating` to return `0` when there are zero approved reviews.
  2. Implemented `verifyReviewPurchase` checking order IDs and paid status against stored orders.
  3. Reviews without verified purchases are queued with `status: 'pending'`.
  4. Public endpoints only return `approved` reviews.
- **Tests executed:** `tests/review-moderation.test.ts` (unverified review pending, verified review approval, zero-reviews 0 rating, rating clamping).
- **Test results:** Passed (4/4 tests passed).
- **Remaining risks:** None.

---

### Finding UI-001: Product Image & Viewport Framing Mismatch
- **Finding ID:** UI-001
- **Title:** Nested Ambient Frame and Aspect-Ratio Distortion in Detail Gallery
- **Severity:** Medium
- **Status:** Tested
- **Affected files:** `/src/components/ProductImage.tsx`, `/src/pages/ProductDetail.tsx`
- **Affected routes or components:** Product Detail Page Gallery Viewport and Interactive Tray
- **Evidence:** Outer wrapper applied radial glow and pedestal shadow, while `ProductImage.tsx` applied nested frame styling, creating a double-framed "box-in-a-box" mismatch.
- **Business impact:** Visually unpolished presentation inconsistent with brand aesthetic.
- **Root cause:** Duplicate container styling across parent page and child component.
- **Patch implemented:** Decoupled container presentation; removed redundant nested shadows; connected 4-item gallery tray with thumbnail selection.
- **Tests executed:** Visual and responsive layout verification; Vite production build.
- **Test results:** Passed. Clean rendering with zero framing mismatch.
- **Remaining risks:** None.

---

## 2. Potential Risks Requiring Environmental Verification

### Finding ENV-001: Live Production Secrets Not Accessible from Build Sandbox
- **Finding ID:** ENV-001
- **Title:** Production Deployment Environment Variables Unverified in Sandbox
- **Severity:** Medium
- **Status:** Unverified
- **Affected files:** `/render.yaml`, live hosting environment
- **Affected routes or components:** Payment gateway, MongoDB Atlas, India Post live credentials
- **Evidence:** Live deployment secrets are managed in Render/cloud provider consoles and not committed to repository.
- **Business impact:** If live secrets are not set in Render environment, production services will refuse to boot or fail payments.
- **Root cause:** Security best practice (no production secrets in repo).
- **Remediation:** Documented exact environment checklist in `DEPLOYMENT_READINESS.md`.

---

## 3. Summary of Findings

| Severity | Total Found | Fixed & Tested | Open / Unverified |
|:---|:---:|:---:|:---:|
| **Critical** | 1 | 1 | 0 |
| **High** | 4 | 4 | 0 |
| **Medium** | 2 | 1 | 1 (ENV-001) |
| **Low / Info** | 1 | 1 | 0 |
| **Total** | **8** | **7** | **1** |
