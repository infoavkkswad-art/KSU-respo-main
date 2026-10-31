# Kawad Swad 2.0 — Test Verification Report

**Execution Date:** 31 October 2026  
**Environment:** Linux (x86_64), Node.js v22.23.4, Python 3.10.12  
**Test Command:** `npm run test` (via `tsx tests/run-all-tests.ts`)

---

## 1. Executive Summary

| Category | Suite | Tests Executed | Passed | Failed | Status |
|:---|:---|:---:|:---:|:---:|:---:|
| **Commercial Integrity** | `commercial-data.test.ts` | 3 | 3 | 0 | **PASS** |
| **Payment Security** | `payment-security.test.ts` | 4 | 4 | 0 | **PASS** |
| **Authorization & Privacy** | `order-authorization.test.ts` | 4 | 4 | 0 | **PASS** |
| **Review Moderation** | `review-moderation.test.ts` | 4 | 4 | 0 | **PASS** |
| **Cart & Pricing Logic** | `cart-fulfillment.test.ts` | 4 | 4 | 0 | **PASS** |
| **Frontend Typecheck** | `npm run typecheck` (`tsc --noEmit`) | 1 | 1 | 0 | **PASS** |
| **Code Quality / Linter** | `npm run lint` (`eslint .`) | 1 | 1 | 0 | **PASS** |
| **Production Build** | `npm run build` (`vite build + esbuild`) | 1 | 1 | 0 | **PASS** |
| **Python Syntax Check** | `python3 -m py_compile` | 1 | 1 | 0 | **PASS** |
| **Total Test Runs** | — | **20** | **20** | **0** | **100% PASS** |

---

## 2. Detailed Test Suite Log

### Suite 1: Commercial Data Integrity
- `✓ PASS: Commercial SKUs Count (Exactly 43 SKUs)`
  - Validates `SALES_SKUS` has 43 entries and product variant definitions match 43 items.
- `✓ PASS: Price & MRP Integrity (Valid positive ranges)`
  - Confirms all SKUs have valid positive MRP and selling prices with `sellingPrice <= mrp`.
- `✓ PASS: Catalog to Commercial Sales Mapping Alignment`
  - Confirms every commercial sales SKU links to a valid catalog product family.

### Suite 2: Payment Security & Cryptographic Verification
- `✓ PASS: Payment HMAC-SHA256 Signature Verification`
  - Tests cryptographic signature generation against expected gateway format.
- `✓ PASS: Tampered Signature Rejection`
  - Tests that forged/altered signatures are strictly rejected.
- `✓ PASS: Razorpay Webhook Raw Body Signature Check`
  - Validates that webhook verification uses raw payload bytes and succeeds with matching secret.
- `✓ PASS: Paise Financial Precision Integer Conversion`
  - Validates that rupee amounts convert cleanly to integer paise with zero floating-point rounding errors.

### Suite 3: Order Authorization & IDOR Defense
- `✓ PASS: Order Tracking Phone Authorization (Valid User Access)`
  - Confirms that providing the customer's phone number grants authorized access to order status.
- `✓ PASS: IDOR Prevention: Missing Phone Parameter Rejection`
  - Verifies that requests without phone parameter receive HTTP 400 rejection.
- `✓ PASS: IDOR Prevention: Mismatched Customer Phone Rejection`
  - Verifies that requests with an attacker phone number receive HTTP 404 rejection.
- `✓ PASS: Order Lookup Rate Limiting (10 req/min per IP threshold)`
  - Verifies that rapid automated lookups (>10/minute) trigger rate limiting threshold.

### Suite 4: Review Moderation & Customer Trust
- `✓ PASS: Unverified Review Moderation (status queued as pending)`
  - Verifies that review submissions without a verified paid order are held in `pending` status.
- `✓ PASS: Verified Paid Purchase Review Approval`
  - Verifies that orders with confirmed payment containing the SKU automatically qualify for verified purchase status.
- `✓ PASS: Zero-Reviews Rating Guard (Returns 0, no fabricated 5.0)`
  - Verifies that products with zero reviews return rating `0` and count `0`.
- `✓ PASS: Rating Boundary Clamping [1 to 5 stars]`
  - Validates input clamping for star ratings.

### Suite 5: Cart Calculations & Fulfilment
- `✓ PASS: Local Nimar PIN Code Resolution (MANUAL Fulfilment)`
  - Tests PIN codes (451001, 452001) resolving to local MANUAL delivery (₹0 shipping).
- `✓ PASS: National India PIN Code Resolution (SHIPPING Fulfilment)`
  - Tests PIN codes (110001, 560001) resolving to tiered national shipping.
- `✓ PASS: Cart Financial Consistency (subtotal + shipping = total)`
  - Tests mathematical consistency of cart quotes.
- `✓ PASS: Authoritative Pricing Guard (Rejects client-tampered prices)`
  - Verifies that client payloads attempting to inject reduced prices are ignored.

---

## 3. Toolchain & Build Verification

1. **TypeScript Typecheck (`npm run typecheck`):**
   - Command: `tsc --noEmit -p tsconfig.app.json`
   - Exit code: 0
2. **ESLint Code Quality (`npm run lint`):**
   - Command: `eslint .`
   - Exit code: 0 (0 errors)
3. **Production Build (`npm run build`):**
   - Output: `dist/index.html` (1.87 kB), `dist/server.cjs` (57.5 kB), asset chunks bundled in 7.48s.
   - Exit code: 0
4. **Python Backend Compile:**
   - Command: `python3 -m py_compile backend/app/main.py backend/app/database.py backend/app/config.py backend/app/routes/*.py`
   - Exit code: 0
