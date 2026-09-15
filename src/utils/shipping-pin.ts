const SHIPPING_PIN_KEY =
  'kawad-swad-shipping-pin-v1';

export function readStoredShippingPin(): string {
  try {
    if (typeof window === 'undefined') {
      return '';
    }

    const saved =
      window.localStorage.getItem(
        SHIPPING_PIN_KEY,
      );

    if (!saved) {
      return '';
    }

    const pin = saved.trim();

    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      return '';
    }

    return pin;
  } catch {
    return '';
  }
}

export function writeStoredShippingPin(
  pincode: string,
): void {
  try {
    const pin = pincode.trim();

    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      window.localStorage.removeItem(
        SHIPPING_PIN_KEY,
      );
      return;
    }

    window.localStorage.setItem(
      SHIPPING_PIN_KEY,
      pin,
    );
  } catch {
    // Ignore storage errors.
  }
}
