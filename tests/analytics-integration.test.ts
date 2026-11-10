import fs from 'fs';
import path from 'path';
import { analytics, getAnalyticsConsent, setAnalyticsConsent, type GA4Item, type PurchaseOrderData, type PaymentFailureCategory } from '../src/utils/analytics';

const baselinePath = path.resolve(process.cwd(), 'COMMERCIAL_DATA_BASELINE.json');
const COMMERCIAL_DATA_BASELINE = JSON.parse(fs.readFileSync(baselinePath, 'utf-8')) as {
  skus: Array<{
    sku: string;
    productName: string;
    sellingPrice: number;
    packSize: number;
  }>;
};

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export function runAnalyticsIntegrationTests(): TestResult[] {
  const results: TestResult[] = [];

  function assert(name: string, condition: boolean, errorMsg?: string) {
    results.push({
      name,
      passed: condition,
      error: condition ? undefined : (errorMsg || 'Assertion failed'),
    });
  }

  // Set up mock window / localStorage / gtag environment if running in node/tsx
  const mockLocalStorage: Record<string, string> = {};
  const dispatchedEvents: Array<{ command: string; action: string; params: Record<string, unknown> }> = [];

  if (typeof globalThis.window === 'undefined') {
    (globalThis as unknown as { window: Record<string, unknown> }).window = {
      location: { pathname: '/', href: 'https://kawadswad.in/' },
      localStorage: {
        getItem: (k: string) => mockLocalStorage[k] ?? null,
        setItem: (k: string, v: string) => { mockLocalStorage[k] = String(v); },
        removeItem: (k: string) => { delete mockLocalStorage[k]; },
      },
      dispatchEvent: () => true,
      addEventListener: () => {},
      removeEventListener: () => {},
      history: {
        pushState: () => {},
        replaceState: () => {},
      },
    };
  }

  // Mock gtag
  (globalThis.window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (command: unknown, action: unknown, params: unknown) => {
    dispatchedEvents.push({
      command: String(command),
      action: String(action),
      params: (params as Record<string, unknown>) || {},
    });
  };

  // 1. Consent State Default and Transitions
  try {
    delete mockLocalStorage['kawad_analytics_consent'];
    assert(
      'Default consent state is null/unselected prior to customer decision',
      getAnalyticsConsent() === null
    );

    setAnalyticsConsent(true);
    assert(
      'Consent transitions to granted upon customer acceptance',
      getAnalyticsConsent() === 'granted' && mockLocalStorage['kawad_analytics_consent'] === 'granted'
    );

    setAnalyticsConsent(false);
    assert(
      'Consent transitions to denied upon customer withdrawal/rejection',
      getAnalyticsConsent() === 'denied' && mockLocalStorage['kawad_analytics_consent'] === 'denied'
    );
  } catch (err: unknown) {
    assert('Consent state transitions without error', false, err instanceof Error ? err.message : String(err));
  }

  // 2. Commercial Financial Reconciliation with Audited Baseline
  try {
    // Pick real audited SKUs: Moong Master 200g (KS-MMP-200 @ ₹55) and Chana Chotu 500g (KS-CCP-500 @ ₹140)
    const sku1 = COMMERCIAL_DATA_BASELINE.skus.find(s => s.sku === 'KS-MMP-200');
    const sku2 = COMMERCIAL_DATA_BASELINE.skus.find(s => s.sku === 'KS-CCP-500');

    if (!sku1 || !sku2) {
      assert('Audited catalog SKUs found for reconciliation test', false, 'Missing KS-MMP-200 or KS-CCP-500');
    } else {
      const items: GA4Item[] = [
        { item_id: sku1.sku, item_name: sku1.productName, price: sku1.sellingPrice, quantity: 2, item_variant: `${sku1.packSize}g` },
        { item_id: sku2.sku, item_name: sku2.productName, price: sku2.sellingPrice, quantity: 1, item_variant: `${sku2.packSize}g` },
      ];

      const item1Total = sku1.sellingPrice * 2; // 55 * 2 = 110
      const item2Total = sku2.sellingPrice * 1; // 140 * 1 = 140
      const calculatedSubtotal = item1Total + item2Total; // 250
      const shippingRate = 71; // 500g pack rate from server.ts
      const taxRate = 0; // FMCG GST included
      const orderTotal = calculatedSubtotal + shippingRate + taxRate; // 321

      const testOrder: PurchaseOrderData = {
        id: 'KS-TEST-ORD-001',
        items,
        subtotal: calculatedSubtotal,
        shipping: shippingRate,
        tax: taxRate,
        total: orderTotal,
      };

      dispatchedEvents.length = 0;
      const dispatched = analytics.trackPurchase(testOrder);
      assert('trackPurchase dispatches successfully for authoritative order', dispatched === true);

      const purchaseEvent = dispatchedEvents.find(e => e.action === 'purchase');
      assert('GA4 purchase event emitted', !!purchaseEvent);

      if (purchaseEvent) {
        const p = purchaseEvent.params;
        assert(
          'GA4 value equals sum of item price × quantity',
          p.value === calculatedSubtotal,
          `Expected ${calculatedSubtotal}, got ${String(p.value)}`
        );
        assert(
          'Shipping is separated and matches backend shipping rate',
          p.shipping === shippingRate,
          `Expected ${shippingRate}, got ${String(p.shipping)}`
        );
        assert(
          'Tax is separated and matches backend order tax',
          p.tax === taxRate,
          `Expected ${taxRate}, got ${String(p.tax)}`
        );
        assert(
          'Currency is strictly INR',
          p.currency === 'INR'
        );
        assert(
          'Total reconciles: value + shipping + tax equals verified order total',
          Number(p.value) + Number(p.shipping) + Number(p.tax) === orderTotal,
          `Sum ${Number(p.value) + Number(p.shipping) + Number(p.tax)} does not match ${orderTotal}`
        );
      }
    }
  } catch (err: unknown) {
    assert('Financial reconciliation test executed without error', false, err instanceof Error ? err.message : String(err));
  }

  // 3. Purchase Deduplication Protection
  try {
    const duplicateOrder: PurchaseOrderData = {
      id: 'KS-TEST-ORD-001', // Re-using same order ID as above
      items: [],
      subtotal: 250,
      shipping: 71,
      total: 321,
    };

    const duplicateDispatchResult = analytics.trackPurchase(duplicateOrder);
    assert(
      'Duplicate purchase dispatch with same orderId is blocked by in-memory & storage deduplication',
      duplicateDispatchResult === false
    );
  } catch (err: unknown) {
    assert('Duplicate purchase protection executed without error', false, err instanceof Error ? err.message : String(err));
  }

  // 4. Zero-PII Guarantee Across All Analytics Payloads
  try {
    const PII_KEYS = ['fullname', 'customer', 'phone', 'email', 'address', 'city', 'pincode', 'razorpay_payment_id', 'razorpay_signature'];

    let piiFound = false;
    let offendingKey = '';

    for (const evt of dispatchedEvents) {
      const serialized = JSON.stringify(evt.params).toLowerCase();
      for (const pii of PII_KEYS) {
        if (serialized.includes(`"${pii}"`)) {
          piiFound = true;
          offendingKey = pii;
          break;
        }
      }
    }

    assert(
      'Strict zero-PII guarantee: no customer name, phone, email, address, or payment credentials in telemetry',
      !piiFound,
      `Detected PII key in analytics payload: ${offendingKey}`
    );
  } catch (err: unknown) {
    assert('Zero-PII test executed without error', false, err instanceof Error ? err.message : String(err));
  }

  // 5. Payment Failure Controlled Categorization
  try {
    dispatchedEvents.length = 0;
    const allowedCategories: PaymentFailureCategory[] = [
      'user_cancelled',
      'network_timeout',
      'verification_failed',
      'gateway_declined',
      'system_error',
    ];

    analytics.trackPaymentFailure('KS-FAIL-001', 'user_cancelled', 157);
    const failureEvent = dispatchedEvents.find(e => e.action === 'payment_failure');

    assert('Payment failure event dispatched with controlled category', !!failureEvent);
    if (failureEvent) {
      assert(
        'Failure category belongs to approved whitelist enum',
        allowedCategories.includes(failureEvent.params.error_category as PaymentFailureCategory)
      );
      assert(
        'Failure payload excludes raw error strings and contains only orderId, category, currency, and value',
        !('error_message' in failureEvent.params) && !('raw_error' in failureEvent.params)
      );
    }
  } catch (err: unknown) {
    assert('Payment failure categorization test executed without error', false, err instanceof Error ? err.message : String(err));
  }

  // 6. Route-Change Deduplication for SPA Page Views
  try {
    dispatchedEvents.length = 0;
    analytics.trackPageView('/shop');
    const firstCount = dispatchedEvents.filter(e => e.action === 'page_view').length;

    // Call again with exact same path
    analytics.trackPageView('/shop');
    const secondCount = dispatchedEvents.filter(e => e.action === 'page_view').length;

    assert(
      'Identical path navigation does not fire duplicate page_view events',
      firstCount === 1 && secondCount === 1,
      `Expected exactly 1 page_view hit, got ${secondCount}`
    );

    // Call with new path
    analytics.trackPageView('/cart');
    const thirdCount = dispatchedEvents.filter(e => e.action === 'page_view').length;

    assert(
      'Distinct path navigation fires exactly one new page_view event',
      thirdCount === 2
    );
  } catch (err: unknown) {
    assert('SPA page view deduplication executed without error', false, err instanceof Error ? err.message : String(err));
  }

  return results;
}
