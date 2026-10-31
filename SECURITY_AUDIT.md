# Kawad Swad 2.0 — Comprehensive Security Audit Report

**Date:** 31 October 2026  
**Security Standard:** OWASP Top 10 API Security / Web Application Security Controls  
**Target Architecture:** Vite/React Frontend, Express Node Server (`server.ts`), FastAPI Backend (`backend/app/`), MongoDB, Razorpay Gateway.

---

## 1. Threat Analysis & Security Surface

| Area | Risk Analyzed | Implemented Control | Status |
|:---|:---|:---|:---:|
| **Payment Signature Verification** | Payment bypass or forgery | Server-side HMAC-SHA256 signature verification comparing `order_id|payment_id` against `RAZORPAY_KEY_SECRET`. Mock payments disabled in production. | **SECURE** |
| **Webhook Integrity** | Spoofed payment capture events | Raw body cryptographic verification using `RAZORPAY_WEBHOOK_SECRET` and event idempotency check. | **SECURE** |
| **Data Access / Authorization** | IDOR/BOLA customer order exposure | Mandatory phone verification on `/api/orders/:orderId` matching order records. Brute-force scanning rate-limited (10 req/min/IP). | **SECURE** |
| **Cross-Origin Resource Sharing** | Malicious origin data exfiltration | Restricted CORS origin allowlist (`https://kawadswad.in`, staging, localhost) with `Vary: Origin`. Wildcard removed. | **SECURE** |
| **Review & Trust Manipulation** | Astroturfing, fake reviews, star tampering | Purchase verification required (`verifyReviewPurchase`) for immediate approval; unverified reviews placed in moderation queue. Zero-review summary returns 0. | **SECURE** |
| **Authoritative Pricing** | Client-side price tampering | Server resolves prices strictly from `SALES_SKUS` / product database; client unit prices in payload are ignored. | **SECURE** |
| **Persistence Safety** | Process crash data loss | Synchronous file-backed persistent disk writes in `/data/` in Node; distributed MongoDB storage in FastAPI. | **SECURE** |
| **Secret Management** | Accidental credential exposure | No hardcoded production secrets in source control. Environment variable configuration enforced. | **SECURE** |

---

## 2. In-Depth Security Remediation Details

### 2.1 Cryptographic Payment Verification (PAY-001)
- **Vulnerability:** Earlier audit noted Express accepted `verify-payment` without signature validation.
- **Resolution:**
  - Implemented Node `node:crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id).digest('hex')`.
  - Added strict production check: If `NODE_ENV === 'production'` and secret is absent or signature fails, payment verification immediately rejects with HTTP 500/400.
  - Guarded frontend checkout against test mock invocation in production (`import.meta.env.PROD`).

### 2.2 Broken Object Level Authorization (SEC-002)
- **Vulnerability:** Order tracking route evaluated `if (cleanQueryPhone && ...)`, allowing unauthenticated requests with no phone number to view order details.
- **Resolution:** Enforced mandatory phone validation requiring at least 4 digits. Implemented IP-based rate limiting (10 lookups per minute).

### 2.3 CORS Hardening (SEC-001)
- **Vulnerability:** Wildcard `*` in Express CORS header.
- **Resolution:** Allowed origins restricted to `kawadswad.in` domains, local development ports, and secure staging endpoints with dynamic origin reflection and `Vary: Origin` header.

### 2.4 Review Manipulation (REV-001)
- **Vulnerability:** Unverified reviews automatically marked verified and approved; zero reviews yielded default 5.0 score.
- **Resolution:** Implemented server-side purchase verification. Non-verified reviews default to `pending` status. Products with zero reviews return rating `0`.
