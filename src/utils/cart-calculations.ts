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

export function calculateCartTotals(items: CartItem[]): CalculatedCart {
  let subtotal = 0;
  let maxShipping = 0;
  let itemCount = 0;
  const resolvedItems = [];

  for (const item of items) {
    if (!item || typeof item.sku !== 'string' || typeof item.quantity !== 'number' || item.quantity <= 0) {
      continue;
    }

    const res = ProductService.getProductBySku(item.sku);
    if (!res) {
      // Skip invalid or outdated SKUs safely
      continue;
    }

    const { family, skuObj } = res;
    const qty = Math.floor(item.quantity);
    const itemSubtotal = skuObj.websitePrice * qty;
    const itemShipping = skuObj.freeShipping ? 0 : skuObj.shipping * qty;

    subtotal += itemSubtotal;
    maxShipping = Math.max(maxShipping, itemShipping);
    itemCount += qty;

    resolvedItems.push({
      sku: skuObj.sku,
      quantity: qty,
      name: family.name,
      packSize: skuObj.packSize,
      websitePrice: skuObj.websitePrice,
      mrp: skuObj.mrp,
      shipping: skuObj.shipping,
      freeShipping: skuObj.freeShipping,
    });
  }

  const total = subtotal + maxShipping;

  return {
    subtotal,
    shippingTotal: maxShipping,
    total,
    itemCount,
    resolvedItems,
  };
}
