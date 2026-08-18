import { ProductService } from '../services/product-service';
import type { CartItem } from '../context/CartContext';

/* ============================================================================
 * CALCULATED CART ITEM
 * ========================================================================== */

export interface CalculatedCartItem {
  sku: string;
  quantity: number;
  name: string;
  packSize: number | string;
  websitePrice: number;
  mrp: number;

  /*
   * Shipping is permanently FREE at checkout.
   *
   * The websitePrice supplied by the central product
   * service is the final customer-facing product price.
   */
  shipping: 0;
  freeShipping: true;
}

/* ============================================================================
 * CALCULATED CART
 * ========================================================================== */

export interface CalculatedCart {
  subtotal: number;
  shippingTotal: 0;
  total: number;
  itemCount: number;
  resolvedItems: CalculatedCartItem[];
}

/* ============================================================================
 * SKU NORMALIZATION
 * ========================================================================== */

function normalizeSku(
  sku: string,
): string {
  return sku
    .trim()
    .toUpperCase();
}

/* ============================================================================
 * CART TOTAL CALCULATION
 *
 * PRICE AUTHORITY:
 *
 * sales-config.ts
 *      ↓
 * ProductService
 *      ↓
 * calculateCartTotals()
 *      ↓
 * CartContext
 *      ↓
 * Checkout
 *
 * This file MUST NOT contain product prices.
 * ========================================================================== */

export function calculateCartTotals(
  items: CartItem[],
): CalculatedCart {
  let subtotal = 0;
  let itemCount = 0;

  const resolvedItems: CalculatedCartItem[] =
    [];

  if (!Array.isArray(items)) {
    return {
      subtotal: 0,
      shippingTotal: 0,
      total: 0,
      itemCount: 0,
      resolvedItems: [],
    };
  }

  for (const item of items) {
    /* ------------------------------------------------------------------------
     * BASIC CART ITEM VALIDATION
     * ---------------------------------------------------------------------- */

    if (
      !item ||
      typeof item.sku !== 'string' ||
      !item.sku.trim() ||
      typeof item.quantity !== 'number' ||
      !Number.isFinite(item.quantity) ||
      item.quantity <= 0
    ) {
      continue;
    }

    const sku =
      normalizeSku(item.sku);

    if (!sku) {
      continue;
    }

    const quantity =
      Math.floor(item.quantity);

    if (
      quantity <= 0 ||
      !Number.isSafeInteger(
        quantity,
      )
    ) {
      continue;
    }

    /* ------------------------------------------------------------------------
     * CENTRAL PRODUCT RESOLUTION
     *
     * ProductService decides whether the SKU is currently purchasable
     * and supplies its authoritative product data.
     * ---------------------------------------------------------------------- */

    const result =
      ProductService.getPurchasableProductBySku(
        sku,
      );

    if (!result) {
      /*
       * SKU is no longer purchasable.
       * Do not include it in totals.
       */
      continue;
    }

    const {
      family,
      skuObj,
    } = result;

    /* ------------------------------------------------------------------------
     * AUTHORITATIVE PRICE VALIDATION
     * ---------------------------------------------------------------------- */

    const websitePrice =
      skuObj.websitePrice;

    const mrp =
      skuObj.mrp;

    if (
      typeof websitePrice !==
        'number' ||
      !Number.isFinite(
        websitePrice,
      ) ||
      websitePrice < 0
    ) {
      continue;
    }

    if (
      typeof mrp !== 'number' ||
      !Number.isFinite(mrp) ||
      mrp < 0
    ) {
      continue;
    }

    /* ------------------------------------------------------------------------
     * LINE TOTAL
     *
     * websitePrice is already the final customer-facing price.
     *
     * DO NOT add shipping here.
     * ---------------------------------------------------------------------- */

    const itemSubtotal =
      websitePrice * quantity;

    if (
      !Number.isFinite(
        itemSubtotal,
      ) ||
      itemSubtotal < 0
    ) {
      continue;
    }

    subtotal += itemSubtotal;
    itemCount += quantity;

    /*
     * Protect the accumulator from malformed/extreme input.
     */
    if (
      !Number.isFinite(subtotal) ||
      !Number.isSafeInteger(itemCount)
    ) {
      continue;
    }

    /* ------------------------------------------------------------------------
     * RESOLVED ITEM
     * ---------------------------------------------------------------------- */

    resolvedItems.push({
      sku: skuObj.sku,
      quantity,

      name: family.name,

      packSize:
        skuObj.packSize,

      websitePrice,

      mrp,

      /*
       * FINAL WEBSITE RULE:
       *
       * Customer-facing shipping = FREE
       */
      shipping: 0,

      freeShipping: true,
    });
  }

  /* ==========================================================================
   * FINAL TOTALS
   *
   * Shipping is NOT added to the product price.
   *
   * Customer sees:
   *
   *   Product price → final website price
   *   Shipping      → FREE
   *   Total         → product prices × quantities
   * ======================================================================== */

  const shippingTotal = 0;

  const total = subtotal;

  return {
    subtotal,
    shippingTotal,
    total,
    itemCount,
    resolvedItems,
  };
}
