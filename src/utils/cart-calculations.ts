import { ProductService } from '../services/product-service';
import type { CartItem } from '../context/CartContext';

/* ============================================================================
 * CALCULATED CART ITEM
 * ============================================================================
 *
 * websitePrice = BASE WEBSITE SELLING PRICE
 *
 * shipping = shipping resolved for the CURRENT fulfilment.
 *
 * MANUAL:
 *   shipping = ₹0
 *
 * SHIPPING:
 *   shipping = amount supplied by fulfilment service
 * ========================================================================== */

export interface CalculatedCartItem {
  sku: string;
  quantity: number;
  name: string;
  packSize: number | string;

  /*
   * Base website selling price.
   */
  websitePrice: number;

  mrp: number;

  /*
   * Resolved fulfilment shipping.
   */
  shipping: number;

  /*
   * True only when resolved shipping is ₹0.
   */
  freeShipping: boolean;

  /*
   * Final line total including this item's shipping allocation.
   *
   * For the current implementation shipping is applied at cart level,
   * so this remains the product subtotal.
   */
  lineSubtotal: number;
}

/* ============================================================================
 * CALCULATED CART
 * ========================================================================== */

export interface CalculatedCart {
  /*
   * Product prices × quantities.
   *
   * Shipping is NOT included here.
   */
  subtotal: number;

  /*
   * Fulfilment shipping for the order.
   */
  shippingTotal: number;

  /*
   * subtotal + shippingTotal.
   */
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
 * SHIPPING VALIDATION
 * ========================================================================== */

function normalizeShippingCharge(
  shippingCharge: number,
): number {
  if (
    typeof shippingCharge !==
      'number' ||
    !Number.isFinite(
      shippingCharge,
    ) ||
    shippingCharge < 0
  ) {
    return 0;
  }

  return Math.round(
    shippingCharge,
  );
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
 * IMPORTANT:
 *
 * ProductService.websitePrice is now the BASE WEBSITE SELLING PRICE.
 *
 * It does NOT include shipping.
 *
 * Shipping must be supplied separately after fulfilment resolution.
 * ========================================================================== */

export function calculateCartTotals(
  items: CartItem[],
  shippingCharge = 0,
): CalculatedCart {
  let subtotal = 0;
  let itemCount = 0;

  const resolvedItems:
    CalculatedCartItem[] = [];

  /*
   * Shipping belongs to the order, not to the product catalogue.
   */
  const resolvedShipping =
    normalizeShippingCharge(
      shippingCharge,
    );

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
      !Number.isFinite(
        item.quantity,
      ) ||
      item.quantity <= 0
    ) {
      continue;
    }

    const sku =
      normalizeSku(
        item.sku,
      );

    if (!sku) {
      continue;
    }

    const quantity =
      Math.floor(
        item.quantity,
      );

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
     * - BASE website selling price
     * - product identity
     * ---------------------------------------------------------------------- */

    const result =
      ProductService.getPurchasableProductBySku(
        sku,
      );

    if (!result) {
      /*
       * SKU is no longer purchasable.
       *
       * Ignore it instead of calculating from stale data.
       */
      continue;
    }

    const {
      family,
      skuObj,
    } = result;

    /* ------------------------------------------------------------------------
     * AUTHORITATIVE BASE PRICE VALIDATION
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
      !Number.isFinite(
        mrp,
      ) ||
      mrp < 0
    ) {
      continue;
    }

    /* ------------------------------------------------------------------------
     * LINE PRODUCT SUBTOTAL
     *
     * IMPORTANT:
     *
     * websitePrice is ONLY the product price.
     *
     * Example:
     *
     * Website Selling Price = ₹55
     * Quantity               = 2
     * Product subtotal       = ₹110
     *
     * Shipping is added separately at order level.
     * ---------------------------------------------------------------------- */

    const itemSubtotal =
      websitePrice *
      quantity;

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
     * ---------------------------------------------------------------------- */

    const nextSubtotal =
      subtotal +
      itemSubtotal;

    const nextItemCount =
      itemCount +
      quantity;

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
       * Shipping is represented at order level.
       *
       * Do NOT put the full order shipping amount on every item.
       */
      shipping: 0,

      freeShipping:
        resolvedShipping === 0,

      lineSubtotal:
        itemSubtotal,
    });
  }

  /* ==========================================================================
   * FINAL CART TOTALS
   * ======================================================================== */

  /*
   * If there are no valid products, there should be no shipping charge.
   */
  const shippingTotal =
    resolvedItems.length > 0
      ? resolvedShipping
      : 0;

  const total =
    subtotal +
    shippingTotal;

  /*
   * Final safety check.
   */
  if (
    !Number.isFinite(
      total,
    ) ||
    total < 0
  ) {
    return {
      subtotal: 0,
      shippingTotal: 0,
      total: 0,
      itemCount: 0,
      resolvedItems: [],
    };
  }

  return {
    subtotal,

    shippingTotal,

    total,

    itemCount,

    resolvedItems,
  };
}

/* ============================================================================
 * MANUAL FULFILMENT HELPER
 * ============================================================================
 *
 * MANUAL fulfilment always uses ₹0 shipping.
 * ========================================================================== */

export function calculateManualCartTotals(
  items: CartItem[],
): CalculatedCart {
  return calculateCartTotals(
    items,
    0,
  );
}

/* ============================================================================
 * SHIPPING FULFILMENT HELPER
 * ============================================================================
 *
 * The shipping amount MUST come from the fulfilment service.
 *
 * This function does not calculate India Post charges.
 * It only applies the already-resolved amount to the cart.
 * ========================================================================== */

export function calculateShippingCartTotals(
  items: CartItem[],
  shippingCharge: number,
): CalculatedCart {
  return calculateCartTotals(
    items,
    shippingCharge,
  );
}
