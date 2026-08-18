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
   * Customer-facing shipping is FREE.
   *
   * The final websitePrice already includes the
   * commercial shipping component from sales-config.
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
 * THIS FILE MUST NOT CONTAIN PRODUCT PRICES.
 *
 * IMPORTANT:
 *
 * ProductService.websitePrice is already:
 *
 * selling price + commercial shipping
 *
 * Therefore this file NEVER adds shipping again.
 * ========================================================================== */

export function calculateCartTotals(
  items: CartItem[],
): CalculatedCart {
  let subtotal = 0;
  let itemCount = 0;

  const resolvedItems: CalculatedCartItem[] =
    [];

  /* --------------------------------------------------------------------------
   * INVALID CART INPUT
   * ------------------------------------------------------------------------ */

  if (!Array.isArray(items)) {
    return {
      subtotal: 0,
      shippingTotal: 0,
      total: 0,
      itemCount: 0,
      resolvedItems: [],
    };
  }

  /* --------------------------------------------------------------------------
   * RESOLVE EACH CART ITEM
   * ------------------------------------------------------------------------ */

  for (const item of items) {
    /* ------------------------------------------------------------------------
     * BASIC VALIDATION
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
     * ProductService is the authority for:
     *
     * - SKU validity
     * - availability
     * - MRP
     * - final website price
     * - product identity
     * ---------------------------------------------------------------------- */

    const result =
      ProductService.getPurchasableProductBySku(
        sku,
      );

    if (!result) {
      /*
       * SKU is no longer purchasable.
       * Ignore it instead of calculating with stale data.
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
     * websitePrice is already the FINAL customer-facing price.
     *
     * Example:
     *
     * Selling Price = ₹55
     * Shipping       = ₹47
     * Final Price    = ₹102
     *
     * Cart calculation:
     *
     * ₹102 × quantity
     *
     * NEVER:
     *
     * ₹102 + ₹47
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

    /* ------------------------------------------------------------------------
     * SAFE ACCUMULATION
     *
     * Calculate the next values BEFORE changing the accumulators.
     * This prevents partially updated totals if malformed/extreme input
     * produces unsafe numbers.
     * ---------------------------------------------------------------------- */

    const nextSubtotal =
      subtotal + itemSubtotal;

    const nextItemCount =
      itemCount + quantity;

    if (
      !Number.isFinite(
        nextSubtotal,
      ) ||
      nextSubtotal < 0
    ) {
      continue;
    }

    if (
      !Number.isSafeInteger(
        nextItemCount,
      ) ||
      nextItemCount < 0
    ) {
      continue;
    }

    /* ------------------------------------------------------------------------
     * COMMIT ACCUMULATORS
     * ---------------------------------------------------------------------- */

    subtotal =
      nextSubtotal;

    itemCount =
      nextItemCount;

    /* ------------------------------------------------------------------------
     * RESOLVED CUSTOMER-FACING ITEM
     * ---------------------------------------------------------------------- */

    resolvedItems.push({
      sku:
        skuObj.sku,

      quantity,

      name:
        family.name,

      packSize:
        skuObj.packSize,

      websitePrice,

      mrp,

      /*
       * Shipping is already included in websitePrice.
       *
       * Customer-facing checkout therefore shows:
       *
       * Shipping = FREE
       */
      shipping: 0,

      freeShipping: true,
    });
  }

  /* ==========================================================================
   * FINAL CART TOTALS
   *
   * CENTRAL WEBSITE RULE:
   *
   * Final Website Price
   * already includes the commercial shipping component.
   *
   * Therefore:
   *
   * subtotal      = final website prices × quantities
   * shippingTotal = ₹0
   * total         = subtotal
   * ======================================================================== */

  const shippingTotal = 0;

  const total =
    subtotal;

  return {
    subtotal,
    shippingTotal,
    total,
    itemCount,
    resolvedItems,
  };
}
