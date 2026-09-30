/**
 * Checkout session idempotency helpers.
 *
 * One key per checkout attempt identity (customer + cart).
 * The backend returns the existing Mongo/Razorpay order for a repeat key.
 */

export const PAY_DEBOUNCE_MS = 600;

export function createIdempotencyKey(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return `ks-${crypto.randomUUID()}`;
  }

  return `ks-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

export function checkoutSessionFingerprint(
  customer: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  },
  items: Array<{ sku: string; quantity: number }>,
): string {
  const itemPart = items
    .map((item) => `${item.sku}:${item.quantity}`)
    .sort()
    .join('|');

  return [
    customer.fullName.trim(),
    customer.phone.trim(),
    customer.email.trim(),
    customer.address.trim(),
    customer.city.trim(),
    customer.state.trim(),
    customer.pincode.trim(),
    itemPart,
  ].join('\n');
}
