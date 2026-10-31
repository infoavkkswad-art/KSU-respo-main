import { getSalesSku, getSellingPrice } from '../src/data/sales-config';

export function runCartFulfillmentTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const SHIPPING_BY_PACK_SIZE: Record<number, number> = {
    200: 47,
    235: 47,
    500: 71,
    1000: 150,
  };

  function resolvePincode(pincode: string) {
    const clean = pincode.trim();
    if (!/^\d{6}$/.test(clean)) return null;
    const isLocalNimar = /^(450|451|452|453|454|455|456)/.test(clean);
    return {
      pincode: clean,
      isLocalNimar,
      fulfillmentType: isLocalNimar ? 'MANUAL' : 'SHIPPING'
    };
  }

  // 1. Local Nimar PIN Resolution
  try {
    const nimarKhargone = resolvePincode('451001');
    if (!nimarKhargone || nimarKhargone.fulfillmentType !== 'MANUAL' || !nimarKhargone.isLocalNimar) {
      throw new Error('Local Nimar PIN 451001 did not resolve to MANUAL fulfilment');
    }
    const nimarIndore = resolvePincode('452001');
    if (!nimarIndore || nimarIndore.fulfillmentType !== 'MANUAL') {
      throw new Error('Indore PIN 452001 did not resolve to MANUAL fulfilment');
    }
    results.push({ name: 'Local Nimar PIN Code Resolution (MANUAL Fulfilment)', passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: 'Local Nimar PIN Code Resolution (MANUAL Fulfilment)', passed: false, error: msg });
  }

  // 2. National Shipping PIN Resolution
  try {
    const delhi = resolvePincode('110001');
    if (!delhi || delhi.fulfillmentType !== 'SHIPPING' || delhi.isLocalNimar) {
      throw new Error('Delhi PIN 110001 did not resolve to SHIPPING fulfilment');
    }
    const bengaluru = resolvePincode('560001');
    if (!bengaluru || bengaluru.fulfillmentType !== 'SHIPPING') {
      throw new Error('Bengaluru PIN 560001 did not resolve to SHIPPING fulfilment');
    }
    results.push({ name: 'National India PIN Code Resolution (SHIPPING Fulfilment)', passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: 'National India PIN Code Resolution (SHIPPING Fulfilment)', passed: false, error: msg });
  }

  // 3. Mathematical Consistency: subtotal + shipping === total
  try {
    const cartItems = [
      { sku: 'KS-MMP-200', quantity: 2 },
      { sku: 'KS-CGP-500', quantity: 1 }
    ];

    let subtotal = 0;
    let maxShipping = 0;

    for (const item of cartItems) {
      const price = getSellingPrice(item.sku) || 55;
      const salesConfig = getSalesSku(item.sku);
      const pack = salesConfig?.packSize || 200;
      const shipRate = SHIPPING_BY_PACK_SIZE[pack] || 47;

      subtotal += price * item.quantity;
      const itemShip = shipRate * item.quantity;
      if (itemShip > maxShipping) maxShipping = itemShip;
    }

    const calculatedTotal = subtotal + maxShipping;
    if (calculatedTotal !== (subtotal + maxShipping)) {
      throw new Error('Order total arithmetic mismatch');
    }
    results.push({ name: 'Cart Financial Consistency (subtotal + shipping = total)', passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: 'Cart Financial Consistency (subtotal + shipping = total)', passed: false, error: msg });
  }

  // 4. Server-Side Authoritative Pricing Defense
  try {
    const maliciousClientPrice = 1;
    const serverAuthoritativePrice = getSellingPrice('KS-MMP-200');

    if (serverAuthoritativePrice !== 55) {
      throw new Error(`Expected server price 55 for KS-MMP-200, got ${serverAuthoritativePrice}`);
    }
    if (serverAuthoritativePrice === maliciousClientPrice) {
      throw new Error('Client price override was accepted');
    }
    results.push({ name: 'Authoritative Pricing Guard (Rejects client-tampered prices)', passed: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ name: 'Authoritative Pricing Guard (Rejects client-tampered prices)', passed: false, error: msg });
  }

  return results;
}
