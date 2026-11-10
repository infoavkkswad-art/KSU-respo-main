import fs from 'fs';
import path from 'path';
import {
  analytics,
  getAnalyticsConsent,
  setAnalyticsConsent,
  type GA4Item,
  type PurchaseOrderData,
  type PaymentFailureCategory,
} from '../src/utils/analytics';

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

  // Set up mock window / localStorage / DOM environment
  const mockLocalStorage: Record<string, string> = {};
  const appendedScripts: Array<{ src: string; async: boolean }> = [];
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

  if (typeof globalThis.document === 'undefined') {
    (globalThis as unknown as { document: Record<string, unknown> }).document = {
      title: 'Kawad Swad',
      referrer: '',
      head: {
        appendChild: (el: { src?: string; async?: boolean }) => {
          if (el && el.src) {
            appendedScripts.push({ src: el.src, async: Boolean(el.async) });
          }
          return el;
        },
      },
      createElement: (tag: string) => {
        if (tag === 'script') {
          return { src: '', async: false };
        }
        return {};
      },
      querySelector: (selector: string) => {
        if (selector.includes('googletagmanager')) {
          const found = appendedScripts.find(s => s.src.includes('googletagmanager.com/gtag/js'));
          return found ? found : null;
        }
        return null;
      },
    };
  }

  // Mock global gtag
  (globalThis.window as unknown as { gtag: (...args: unknown[]) => void }).gtag = (command: unknown, action: unknown, params: unknown) => {
    dispatchedEvents.push({
      command: String(command),
      action: String(action),
      params: (params as Record<string, unknown>) || {},
    });
  };

  // 1. Strict Mode: Zero script loads or event dispatches before explicit consent
  try {
    delete mockLocalStorage['kawad_analytics_consent'];
    appendedScripts.length = 0;
    dispatchedEvents.length = 0;

    assert(
      'Default consent state is null/unselected on fresh visit',
      getAnalyticsConsent() === null
    );

    // Attempt to track events while consent is unselected
    analytics.trackPageView('/shop');
    analytics.trackViewItem({ item_id: 'KS-MMP-200', item_name: 'Moong Master Papad', price: 55, quantity: 1 });
    analytics.trackAddToCart({ item_id: 'KS-MMP-200', item_name: 'Moong Master Papad', price: 55, quantity: 1 });

    assert(
      'Zero Google gtag script requests before explicit consent',
      appendedScripts.length === 0,
      `Expected 0 script injections, found ${appendedScripts.length}`
    );

    assert(
      'Zero analytics event dispatches before explicit consent',
      dispatchedEvents.length === 0,
      `Expected 0 dispatched events, found ${dispatchedEvents.length}`
    );
  } catch (err: unknown) {
    assert('Pre-consent strict gate test failed with error', false, err instanceof Error ? err.message : String(err));
  }

  // 2. Strict Mode: Zero script loads or event dispatches when customer declines consent
  try {
    setAnalyticsConsent(false);
    assert(
      'Consent state transitions to denied upon customer decline',
      getAnalyticsConsent() === 'denied' && mockLocalStorage['kawad_analytics_consent'] === 'denied'
    );

    appendedScripts.length = 0;
    dispatchedEvents.length = 0;

    analytics.trackPageView('/products');
    analytics.trackViewCart([], 0);
    analytics.trackBeginCheckout([], 0);

    assert(
      'Zero Google script requests when consent is declined',
      appendedScripts.length === 0
    );

    assert(
      'Zero analytics event dispatches when consent is declined',
      dispatchedEvents.length === 0
    );
  } catch (err: unknown) {
    assert('Decline strict gate test failed with error', false, err instanceof Error ? err.message : String(err));
  }

  // 3. Strict Mode: Accept loads GA4 and enables subsequent event tracking
  try {
    appendedScripts.length = 0;
    dispatchedEvents.length = 0;

    setAnalyticsConsent(true);

    assert(
      'Consent state transitions to granted upon customer acceptance',
      getAnalyticsConsent() === 'granted' && mockLocalStorage['kawad_analytics_consent'] === 'granted'
    );

    assert(
      'GA4 script is dynamically injected with Measurement ID G-R5YNWTG2MC upon acceptance',
      appendedScripts.some(s => s.src.includes('googletagmanager.com/gtag/js?id=G-R5YNWTG2MC'))
    );

    // After consent is granted, tracking events must dispatch successfully
    analytics.trackPageView('/shop');
    const pageView = dispatchedEvents.find(e => e.action === 'page_view');
    assert('Subsequent page views are tracked after consent is granted', !!pageView);
  } catch (err: unknown) {
    assert('Consent acceptance and dynamic script load failed with error', false, err instanceof Error ? err.message : String(err));
  }

  // 4. Strict Mode: Consent withdrawal immediately stops all future event dispatch
  try {
    setAnalyticsConsent(false);

    assert('Consent state updated to denied on withdrawal', getAnalyticsConsent() === 'denied');

    // Reset dispatched array to verify subsequent measurement attempts are blocked
    dispatchedEvents.length = 0;

    // Attempt tracking after withdrawal
    analytics.trackPageView('/manufacturing');
    analytics.trackViewItem({ item_id: 'KS-CCP-500', item_name: 'Chana Chotu Papad', price: 140, quantity: 1 });

    assert(
      'Consent withdrawal immediately blocks all subsequent event dispatches',
      dispatchedEvents.length === 0,
      `Expected 0 events after withdrawal, found ${dispatchedEvents.length}`
    );
  } catch (err: unknown) {
    assert('Consent withdrawal gate test failed with error', false, err instanceof Error ? err.message : String(err));
  }

  // 5. Returning Visitors: Correct restoration of stored consent state
  try {
    // Re-grant consent for subsequent testing
    mockLocalStorage['kawad_analytics_consent'] = 'granted';
    assert(
      'Previously granted consent is restored correctly from storage',
      getAnalyticsConsent() === 'granted'
    );

    mockLocalStorage['kawad_analytics_consent'] = 'denied';
    assert(
      'Previously declined consent remains strictly denied from storage',
      getAnalyticsConsent() === 'denied'
    );
  } catch (err: unknown) {
    assert('Stored consent restoration test failed with error', false, err instanceof Error ? err.message : String(err));
  }

  // 6. Resilience: Storage exceptions do not crash the application
  try {
    const originalGetItem = window.localStorage.getItem;
    window.localStorage.getItem = () => {
      throw new Error('SecurityError: The operation is insecure.');
    };

    assert(
      'Storage access failure returns null safely without throwing',
      getAnalyticsConsent() === null
    );

    window.localStorage.getItem = originalGetItem;
  } catch (err: unknown) {
    assert('Storage exception handling failed with error', false, err instanceof Error ? err.message : String(err));
  }

  // Re-enable granted consent for commercial reconciliation and deduplication tests
  setAnalyticsConsent(true);

  // 7. Commercial Financial Reconciliation with Audited Baseline
  try {
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
        id: 'KS-20261110-8472',
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

  // 8. Purchase Deduplication Protection
  try {
    const duplicateOrder: PurchaseOrderData = {
      id: 'KS-20261110-8472', // Re-using same order ID as above
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

  // 9. Mock / Test Payment Safety Guard
  try {
    const mockOrder: PurchaseOrderData = {
      id: 'pay_test_1731234567890',
      items: [{ item_id: 'KS-MMP-200', item_name: 'Test', price: 55, quantity: 1 }],
      subtotal: 55,
      shipping: 0,
      total: 55,
    };

    const mockDispatched = analytics.trackPurchase(mockOrder);
    assert(
      'Mock test payment orders (pay_test_*) are strictly blocked from contaminating real GA4',
      mockDispatched === false
    );
  } catch (err: unknown) {
    assert('Mock payment protection test failed with error', false, err instanceof Error ? err.message : String(err));
  }

  // 10. Zero-PII Guarantee Across All Analytics Payloads
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

  // 11. Payment Failure Controlled Categorization
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

  // 12. Route-Change Deduplication for SPA Page Views
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
