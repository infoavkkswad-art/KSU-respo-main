import { ProductService } from '../services/product-service';
import { CartItem } from '../context/CartContext';

export interface CalculatedCart {
  subtotal: number;
  shippingTotal: number;
  total: number;
  itemCount: number;
  resolvedItems: Array<{
    sku: string;
    quantity: number;
    name: string;
    packSize: number | string;
    websitePrice: number;
    mrp: number;
    shipping: number;
    freeShipping: boolean;
  }>;
}

export function calculateCartTotals(
  items: CartItem[],
): CalculatedCart {
  let subtotal = 0;
  let itemCount = 0;

  const resolvedItems: CalculatedCart['resolvedItems'] =
    [];

  for (const item of items) {
    if (
      !item ||
      typeof item.sku !== 'string' ||
      typeof item.quantity !== 'number' ||
      !Number.isFinite(item.quantity) ||
      item.quantity <= 0
    ) {
      continue;
    }

    const res = ProductService.getProductBySku(
      item.sku,
    );

    if (!res) {
      continue;
    }

    const { family, skuObj } = res;

    /*
     * A SKU without a website price is not purchasable.
     * Never treat a missing price as ₹0.
     */
    if (
      skuObj.websitePrice === null ||
      !Number.isFinite(skuObj.websitePrice)
    ) {
      continue;
    }

    const qty = Math.floor(item.quantity);

    if (qty <= 0) {
      continue;
    }

    /*
     * websitePrice is the final customer-facing price.
     * Shipping is already included in this price.
     *
     * Therefore:
     * - no shipping is added to the subtotal
     * - no separate shipping charge is calculated
     * - customer-facing shipping remains FREE
     */
    const itemSubtotal =
      skuObj.websitePrice * qty;

    subtotal += itemSubtotal;
    itemCount += qty;

    resolvedItems.push({
      sku: skuObj.sku,
      quantity: qty,
      name: family.name,
      packSize: skuObj.packSize,
      websitePrice: skuObj.websitePrice,
      mrp: skuObj.mrp,
      shipping: 0,
      freeShipping: true,
    });
  }

  /*
   * Shipping is already included in websitePrice.
   * The cart total therefore equals the displayed
   * product selling-price subtotal.
   */
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
