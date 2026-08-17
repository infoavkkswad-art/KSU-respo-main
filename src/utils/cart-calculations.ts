import { ProductService } from '../services/product-service';
import { CartItem } from '../context/CartContext';

export interface CalculatedCartItem {
  sku: string;
  quantity: number;
  name: string;
  packSize: number | string;
  websitePrice: number;
  mrp: number;
  shipping: 0;
  freeShipping: true;
}

export interface CalculatedCart {
  subtotal: number;
  shippingTotal: 0;
  total: number;
  itemCount: number;
  resolvedItems: CalculatedCartItem[];
}

export function calculateCartTotals(
  items: CartItem[],
): CalculatedCart {
  let subtotal = 0;
  let itemCount = 0;

  const resolvedItems: CalculatedCartItem[] = [];

  for (const item of items) {
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

    /*
     * Resolve through the central purchasable-product
     * method so TypeScript knows that websitePrice and
     * MRP are guaranteed to be numbers.
     */
    const result =
      ProductService.getPurchasableProductBySku(
        item.sku,
      );

    if (!result) {
      continue;
    }

    const { family, skuObj } = result;

    const quantity = Math.floor(
      item.quantity,
    );

    if (quantity <= 0) {
      continue;
    }

    /*
     * websitePrice is the FINAL customer-facing price.
     *
     * Shipping is already included.
     *
     * NEVER:
     * websitePrice + shipping
     *
     * ALWAYS:
     * websitePrice × quantity
     */
    const itemSubtotal =
      skuObj.websitePrice * quantity;

    subtotal += itemSubtotal;
    itemCount += quantity;

    resolvedItems.push({
      sku: skuObj.sku,
      quantity,
      name: family.name,
      packSize: skuObj.packSize,
      websitePrice: skuObj.websitePrice,
      mrp: skuObj.mrp,

      // Free shipping is the permanent website rule.
      shipping: 0,
      freeShipping: true,
    });
  }

  /*
   * CENTRAL WEBSITE SALES RULE
   *
   * Product websitePrice already includes the
   * customer's shipping cost.
   *
   * Customer sees:
   * Product price = Final price
   * Shipping = FREE
   * Cart total = Product price total
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
