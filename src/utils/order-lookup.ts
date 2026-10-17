/**
 * Post-payment lookup for Order Success.
 *
 * Stores only orderId + phone (no prices). The backend remains
 * the source of line items and totals.
 */

export interface OrderLookup {
  orderId: string;
  phone: string;
}

const ORDER_LOOKUP_KEY = 'kawad-swad-order-lookup-v1';

const INDIAN_MOBILE = /^[6-9]\d{9}$/;

export function normalizeOrderId(value: string): string {
  return value.trim();
}

export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }

  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }

  return digits;
}

export function isValidOrderLookup(
  value: unknown,
): value is OrderLookup {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const lookup = value as Record<string, unknown>;

  return (
    typeof lookup.orderId === 'string' &&
    normalizeOrderId(lookup.orderId).length > 0 &&
    typeof lookup.phone === 'string' &&
    INDIAN_MOBILE.test(normalizePhone(lookup.phone))
  );
}

export function saveOrderLookup(lookup: OrderLookup): void {
  const orderId = normalizeOrderId(lookup.orderId);
  const phone = normalizePhone(lookup.phone);

  if (!orderId || !INDIAN_MOBILE.test(phone)) {
    return;
  }

  try {
    sessionStorage.setItem(
      ORDER_LOOKUP_KEY,
      JSON.stringify({ orderId, phone }),
    );
  } catch {
    // Ignore storage errors; URL + phone form still work.
  }
}

export function readOrderLookup(): OrderLookup | null {
  try {
    const raw = sessionStorage.getItem(ORDER_LOOKUP_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isValidOrderLookup(parsed)) {
      sessionStorage.removeItem(ORDER_LOOKUP_KEY);
      return null;
    }

    return {
      orderId: normalizeOrderId(parsed.orderId),
      phone: normalizePhone(parsed.phone),
    };
  } catch {
    return null;
  }
}

export function readPhoneForOrderId(
  orderId: string,
): string | null {
  const lookup = readOrderLookup();
  const wanted = normalizeOrderId(orderId);

  if (!lookup || !wanted) {
    return null;
  }

  if (lookup.orderId !== wanted) {
    return null;
  }

  return lookup.phone;
}
