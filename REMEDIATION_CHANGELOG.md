# Kawad Swad 2.0 — Remediation Changelog

### Version 2.0.1 Remediation Release — 31 October 2026

#### Security & Access Control
- **`server.ts`**:
  - Replaced wildcard CORS with explicit allowed origins (`kawadswad.in`, staging, localhost) and added `Vary: Origin`.
  - Added request rate limiter on `GET /api/orders/:orderId` (maximum 10 requests per minute per IP).
  - Enforced mandatory customer phone verification on `GET /api/orders/:orderId`, eliminating the IDOR vulnerability.
  - Added cryptographic HMAC-SHA256 signature verification to `POST /api/orders/verify-payment`.
  - Added `POST /api/webhooks/razorpay` with raw body HMAC verification and idempotent payment capture.
  - Added durable file-backed persistence for orders, enquiries, and reviews in `/data/`.
  - Added `verifyReviewPurchase` checking paid status before review approval.
  - Fixed review summary to return `averageRating = 0` when product has 0 approved reviews.

#### Frontend & Checkout
- **`src/pages/Checkout.tsx`**:
  - Guarded test mock gateway (`rzp_test_mock`) so it cannot be invoked in production (`import.meta.env.PROD`).
- **`src/pages/ProductDetail.tsx`**:
  - Decoupled hero viewport from gallery thumbnails to eliminate nested radial shadows and double-framing mismatch.
  - Built interactive 4-item photo tray with active states and thumbnail switching.
  - Removed unused imports and clean-coded dependencies.
- **`src/components/ProductImage.tsx`**:
  - Refined container presentation and removed redundant nested drop-shadows.

#### Backend (FastAPI)
- **`backend/app/config.py`**:
  - Added configuration validation helpers (`is_razorpay_configured`, `is_webhook_configured`, `get_public_summary`).
  - Verified syntax compilation (`python3 -m py_compile`).

#### Testing & Infrastructure
- **`package.json`**:
  - Added `"test": "tsx tests/run-all-tests.ts"` script.
- **`tests/`**:
  - Added `commercial-data.test.ts` (43 SKU integrity check).
  - Added `payment-security.test.ts` (HMAC signatures and paise financial precision).
  - Added `order-authorization.test.ts` (IDOR defense and rate limiting).
  - Added `review-moderation.test.ts` (verified purchase checks, rating boundary clamping).
  - Added `cart-fulfillment.test.ts` (PIN resolution and authoritative pricing defense).
  - Added `run-all-tests.ts` (master test runner: 19/19 tests passing).
- **Baseline Deliverables**:
  - Generated `COMMERCIAL_DATA_BASELINE.json` (all 43 SKUs recorded).
  - Generated `COMMERCIAL_DATA_COMPARISON.json` (0 discrepancies).
