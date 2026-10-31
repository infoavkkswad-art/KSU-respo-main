# Kawad Swad 2.0 — Production Deployment Readiness Checklist

**Date:** 31 October 2026  
**Status:** CODE REMEDIATED, TESTED & DEPLOYMENT-READY

---

## 1. Production Architecture Overview

The repository is configured for two hosting modalities:

1. **Full-Stack Node/Express Deployment (Primary AI Studio / Standalone):**
   - **Command:** `npm start` -> runs `node dist/server.cjs`
   - **Capabilities:** Serves compiled static assets from `dist/`, mounts all API endpoints, enforces HMAC payment verification, handles webhooks, and writes durable persistent records to `/data/`.
   - **Port:** Automatically binds to `$PORT` or defaults to 3000.

2. **Render Microservice Deployment (`render.yaml`):**
   - **Service:** `ksu-backend` (FastAPI + Python 3.12 + Uvicorn)
   - **Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Database:** MongoDB Atlas (`kawad_swad_db`)
   - **Static Frontend:** Hosted on Render Static Site or connected CDN pointing to `ksu-backend` via `VITE_API_BASE_URL`.

---

## 2. Required Production Environment Variables

Before promoting to production, verify the following variables in the hosting provider's dashboard:

### For Node/Express Full-Stack Server:
- `PORT`: Server port (configured automatically on Render/Cloud Run).
- `NODE_ENV`: Must be set to `production`.
- `RAZORPAY_KEY_ID`: Live Razorpay Key ID (`rzp_live_...`).
- `RAZORPAY_KEY_SECRET`: Live Razorpay Key Secret.
- `RAZORPAY_WEBHOOK_SECRET`: Live Razorpay Webhook Secret.

### For FastAPI Service (`ksu-backend` on Render):
- `MONGODB_URI`: Production MongoDB Atlas connection string.
- `MONGODB_DATABASE`: `kawad_swad_db`.
- `CORS_ORIGINS`: `https://kawadswad.in,https://www.kawadswad.in`.
- `RAZORPAY_KEY_ID`: Live Razorpay Key ID (`rzp_live_...`).
- `RAZORPAY_KEY_SECRET`: Live Razorpay Key Secret.
- `RAZORPAY_WEBHOOK_SECRET`: Live Webhook Secret.
- `GOOGLE_APPS_SCRIPT_URL`: Google Sheets sync endpoint.
- `GOOGLE_APPS_SCRIPT_TOKEN`: Authorization token for Google Sheets sync.

---

## 3. Pre-Flight Verification Checklist for Owner

1. **DNS & SSL:**
   - [ ] Ensure `https://kawadswad.in` and `https://www.kawadswad.in` point to the production service.
   - [ ] Confirm valid SSL/TLS certificate.
2. **Payment Gateway:**
   - [ ] In the Razorpay Dashboard, set the Webhook URL to:  
     `https://kawadswad.in/api/webhooks/razorpay` (or your backend URL).
   - [ ] Enable the `payment.captured` and `order.paid` webhook events.
   - [ ] Verify the secret matches `RAZORPAY_WEBHOOK_SECRET`.
3. **Database Connectivity:**
   - [ ] Whitelist Render/server egress IPs in MongoDB Atlas network access (or allow `0.0.0.0/0` with strong password authentication).
4. **Health Check:**
   - [ ] Test `GET https://kawadswad.in/api/health` -> returns HTTP 200 with `status: "ok"`.

---

## 4. Post-Deployment Safe Smoke Tests

Follow this sequence to verify the live site without placing real charges:
1. **Catalog & Commercial Prices:**
   - Navigate to `/shop` and open Moong Master 200g (`KS-MMP-200`).
   - Confirm selling price displays exactly **₹55** (MRP ₹102).
   - Confirm the 4-item gallery tray switches between packaging and food photography cleanly.
2. **Cart & PIN Delivery:**
   - Add item to cart and enter PIN `451001` (Khargone) -> verify delivery shows Local Nimar (₹0 shipping).
   - Enter PIN `110001` (Delhi) -> verify national shipping rate is calculated accurately.
3. **Checkout Screen:**
   - Fill in valid customer details and click proceed to checkout.
   - Confirm Razorpay modal opens with the exact calculated order total in paise.
   - Close modal without completing payment -> verify graceful dismissal without false confirmation.
4. **Order Tracking:**
   - Navigate to `/track-order`.
   - Enter a random order ID without a phone number -> verify it prompts for a valid phone number.
   - Verify non-existent orders return a safe 404 error without disclosing server stack traces.

---

## 5. Rollback Procedure

If unexpected runtime issues occur during live traffic cutover:
1. In the Render / hosting dashboard, click **Rollback to Previous Deploy**.
2. Because all 43 commercial SKU definitions and backend schemas maintain strict backwards compatibility, no database migration rollback is required.
