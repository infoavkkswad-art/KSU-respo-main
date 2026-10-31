# Kawad Swad 2.0 — Remediation Plan

## 1. Objectives & Non-Negotiables
1. **Commercial Data Protection:** Preserve all 43 commercial SKUs, pack sizes, MRPs, and selling prices without recalculation or alteration.
2. **Payment Integrity:** Enforce strict cryptographic HMAC-SHA256 signature verification on order payments and webhooks.
3. **Data Security & Privacy:** Eliminate IDOR/BOLA risks on order lookup and restrict cross-origin access with domain allowlists.
4. **Durable Persistence:** Ensure order and review records persist reliably across application restarts.
5. **Review Moderation:** Prevent fraudulent ratings; enforce purchase verification and moderation queues.

---

## 2. Implementation Execution Phases

### Phase 1: Baseline Verification
- [x] Lock 43 commercial SKUs in `COMMERCIAL_DATA_BASELINE.json`.
- [x] Run automated comparison script to verify zero discrepancies (`COMMERCIAL_DATA_COMPARISON.json`).

### Phase 2: Security Hardening
- [x] **CORS:** Replaced wildcard with origin validation in `server.ts` and verified `backend/app/config.py`.
- [x] **IDOR / BOLA:** Added mandatory phone parameter check and rate limiting (10 req/min) on `/api/orders/:orderId`.
- [x] **Secrets:** Guarded production payment flows against placeholder secrets.

### Phase 3: Payment & Order Integrity
- [x] **Payment Verification:** Integrated HMAC-SHA256 signature verification in `server.ts`.
- [x] **Mock Guarding:** Added production environment guard preventing `rzp_test_mock` from running in production builds.
- [x] **Webhooks:** Created `/api/webhooks/razorpay` in `server.ts` with raw-buffer HMAC verification and idempotent status updates.

### Phase 4: Persistence & Trust
- [x] **Persistence:** Added `/data/` file-backed storage synchronization for Express.
- [x] **Review Moderation:** Implemented `verifyReviewPurchase` against paid orders; fixed empty-review rating to `0`.

### Phase 5: Automated Testing & Verification
- [x] Created test suite in `/tests/` covering commercial data, payment signatures, authorization, reviews, and cart calculations.
- [x] Verified type checking (`npm run typecheck` - passed).
- [x] Verified linting (`npm run lint` - 0 errors).
- [x] Verified production build (`npm run build` - passed).
