# Kawad Swad 2.0 — System Audit Baseline

**Date:** 31 October 2026  
**Auditor:** Senior Full-Stack & Security Reliability Engineering  
**Application Scope:** Frontend (Vite/React/TypeScript), Node/Express Server (`server.ts`), FastAPI Backend (`backend/app`), MongoDB integration, and Razorpay payment flow.

---

## 1. Executive Baseline Summary

This baseline establishes the authoritative architectural and operational state of the Kawad Swad 2.0 application derived directly from the inspected source files.

### Core Safeguards
- **Commercial Data:** All 43 commercial SKUs, pack sizes (200g, 235g, 500g, 1000g), MRPs, selling prices, and availability are verified and locked.
- **Brand Palette:** Deep Nimar Green (`#1B4D3E`), Rich Saffron (`#D97706`), Warm Terracotta (`#C85A17`), and Ivory Cream (`#FDFBF7`).
- **No Fabricated Claims:** Zero unverified certifications, fake ratings, or artificial testimonials.

---

## 2. Architecture & Entry Points

### 2.1 Frontend Architecture
- **Framework:** React 18.3.1 with TypeScript 5.5.3, bundled via Vite 5.4.21.
- **Entry Points:** `index.html` -> `/src/main.tsx` -> `/src/App.tsx`.
- **Routing:** `react-router-dom` v6.30 with client-side SPA routing (`/`, `/shop`, `/product/:slug`, `/cart`, `/checkout`, `/order-success`, `/track-order`, `/contact`, `/bulk-orders`, `/distributor`, `/about`, `/policies`).
- **State Management:** React Contexts (`CartContext`, `OrderContext`, `ProductMasterContext`).
- **API Client:** `/src/services/api-client.ts` using `import.meta.env.VITE_API_BASE_URL` with resilient fallbacks and server authority enforcement.

### 2.2 Backend Architecture & Overlapping Implementations
The repository contains two operational backend layers:
1. **Express Server (`server.ts`):**
   - Serves Vite dev middleware in development; serves compiled `dist/` in production.
   - Implements REST endpoints for products, fulfillment quotes, orders, payment verification, order tracking, reviews, and webhooks.
   - Upgraded with durable JSON file persistence in `/data/` and cryptographic HMAC-SHA256 signature verification.
2. **FastAPI Backend (`backend/app`):**
   - Configured in `render.yaml` as the `ksu-backend` web service (`uvicorn app.main:app`).
   - Uses MongoDB (`motor` async client) for persistent document storage and index enforcement.
   - Implements Razorpay payment signature and webhook cryptographic verification with Google Sheets sync.

### 2.3 Database & Persistence
- **FastAPI / MongoDB Collections:** `orders`, `enquiries`, `reviews`, `webhook_events`, `pincodes`, `fulfillment_rules`, `products`.
- **Express Persistence:** `/data/orders_store.json`, `/data/enquiries_store.json`, `/data/reviews_store.json`.

---

## 3. Commercial Data Baseline Status

- **Total Commercial SKUs:** Exactly 43 SKUs.
- **Catalog Alignment:** 100% agreement between `src/data/sales-config.ts` (commercial pricing) and `src/data/products.ts` (product metadata).
- **Machine-Readable Artifacts:**
  - `COMMERCIAL_DATA_BASELINE.json`: Authoritative snapshot of all 43 SKUs.
  - `COMMERCIAL_DATA_COMPARISON.json`: Continuous verification check (`match: true`, `discrepancies: 0`).

---

## 4. Environment & Deployment Manifests

- **Node/Express:** `package.json` (`dev`, `build`, `start`, `lint`, `test`, `typecheck`).
- **Python/FastAPI:** `backend/requirements.txt` (FastAPI 0.110.0, Uvicorn 0.28.0, Motor 3.3.2, Pydantic 2.6.4, Razorpay 1.4.1).
- **Hosting Specification:** `render.yaml` declaring `ksu-backend` on Python 3.12 with health check at `/api/health`.
