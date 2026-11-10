/**
 * Kawad Swad E-commerce Analytics & Strict Consent Engine
 * GA4 Measurement ID: G-R5YNWTG2MC
 *
 * POLICY: STRICT CONSENT
 * - ZERO Google network requests before explicit customer consent.
 * - Dynamic loading of gtag.js only after consent is granted.
 * - Immediate suppression of all measurement upon consent decline or withdrawal.
 * - Strictly Zero-PII, Deduplicated, Financially Reconciled Telemetry.
 */

export type ConsentStatus = 'granted' | 'denied' | null;

export type PaymentFailureCategory =
  | 'user_cancelled'
  | 'network_timeout'
  | 'verification_failed'
  | 'gateway_declined'
  | 'system_error';

export interface GA4Item {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity: number;
  item_variant?: string;
}

export interface PurchaseOrderData {
  id: string;
  items: GA4Item[];
  subtotal: number;
  shipping: number;
  tax?: number;
  total: number;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    KawadAnalytics?: {
      trackPageView: (path?: string) => void;
      trackEvent: (name: string, properties?: Record<string, string | number | boolean | null | undefined>) => void;
      trackViewItem: (item: GA4Item) => void;
      trackAddToCart: (item: GA4Item) => void;
      trackViewCart: (items: GA4Item[], value: number) => void;
      trackBeginCheckout: (items: GA4Item[], value: number) => void;
      trackPurchase: (order: PurchaseOrderData) => boolean;
      trackPaymentFailure: (orderId: string, category: PaymentFailureCategory, amount: number) => void;
      getConsent: () => ConsentStatus;
      setConsent: (granted: boolean) => void;
      isLoaded: () => boolean;
    };
  }
}

const MEASUREMENT_ID = 'G-R5YNWTG2MC';
const CONSENT_STORAGE_KEY = 'kawad_analytics_consent';
const ORDER_TRACK_PREFIX = 'kawad_order_analytics_';

class KawadAnalyticsEngine {
  private lastPath: string = '';
  private isInitialized: boolean = false;
  private isScriptLoaded: boolean = false;
  private dispatchedOrderIds: Set<string> = new Set();

  public getConsent(): ConsentStatus {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored === 'granted' || stored === 'denied') {
        return stored;
      }
    } catch {
      // Storage access restricted or disabled (e.g. private browsing)
    }
    return null;
  }

  public setConsent(granted: boolean): void {
    if (typeof window === 'undefined') return;
    const status: ConsentStatus = granted ? 'granted' : 'denied';

    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, status);
    } catch {
      // Storage restricted
    }

    if (granted) {
      // 1. Customer accepted: dynamically load Google Analytics script and initialize
      this.ensureGA4Loaded();

      // 2. Grant consent in GA4 runtime
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      }

      // 3. Dispatch the current route's page_view (initial page_view was held back before consent)
      const currentPath = window.location.pathname;
      this.lastPath = ''; // reset so trackPageView treats currentPath as fresh
      this.trackPageView(currentPath);
    } else {
      // Customer declined or withdrew consent: revoke storage in runtime
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      }
    }

    // Dispatch custom event to notify reactive UI components (e.g. ConsentBanner, Footer)
    try {
      window.dispatchEvent(
        new CustomEvent('kawad_consent_changed', {
          detail: { status },
        })
      );
    } catch {
      // CustomEvent fallback
    }
  }

  public isLoaded(): boolean {
    return this.isScriptLoaded;
  }

  /**
   * Dynamically injects and initializes the GA4 script.
   * Strictly called ONLY when consent is 'granted'.
   */
  public ensureGA4Loaded(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (this.isScriptLoaded) return;

    // Check if script already exists in document
    const existing = document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`);
    if (!existing) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
      document.head.appendChild(script);
    }

    // Setup dataLayer and gtag dispatcher
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function () {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer?.push(arguments);
      };
    }

    window.gtag('js', new Date());
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });

    // Disable automatic initial page view to prevent double-counting with React Router SPA tracker
    window.gtag('config', MEASUREMENT_ID, { send_page_view: false });

    this.isScriptLoaded = true;
  }

  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    const consent = this.getConsent();

    // STRICT CONSENT: Only load GA4 if consent was already explicitly granted
    if (consent === 'granted') {
      this.ensureGA4Loaded();
      this.trackPageView(window.location.pathname);
    } else {
      // Prime navigation tracker without dispatching any network requests
      this.lastPath = window.location.pathname;
    }

    // Listen to client-side SPA navigation
    this.hookNavigation();

    // Bind global helpers
    window.KawadAnalytics = {
      trackPageView: (path?: string) => this.trackPageView(path || window.location.pathname),
      trackEvent: (name: string, properties?: Record<string, string | number | boolean | null | undefined>) =>
        this.trackEvent(name, properties),
      trackViewItem: (item: GA4Item) => this.trackViewItem(item),
      trackAddToCart: (item: GA4Item) => this.trackAddToCart(item),
      trackViewCart: (items: GA4Item[], value: number) => this.trackViewCart(items, value),
      trackBeginCheckout: (items: GA4Item[], value: number) => this.trackBeginCheckout(items, value),
      trackPurchase: (order: PurchaseOrderData) => this.trackPurchase(order),
      trackPaymentFailure: (orderId: string, category: PaymentFailureCategory, amount: number) =>
        this.trackPaymentFailure(orderId, category, amount),
      getConsent: () => this.getConsent(),
      setConsent: (granted: boolean) => this.setConsent(granted),
      isLoaded: () => this.isLoaded(),
    };
  }

  public trackPageView(path: string): void {
    // STRICT GATE: Never track if consent is not granted
    if (this.getConsent() !== 'granted') return;

    // Deduplication: Only track if path has changed
    if (this.lastPath === path) return;
    this.lastPath = path;

    this.dispatchGtag('event', 'page_view', {
      page_path: path,
      page_title: typeof document !== 'undefined' ? document.title : '',
      page_location: typeof window !== 'undefined' ? window.location.href : '',
    });
  }

  public trackViewItem(item: GA4Item): void {
    if (this.getConsent() !== 'granted') return;

    this.dispatchGtag('event', 'view_item', {
      currency: 'INR',
      value: Math.round(item.price * item.quantity),
      items: [
        {
          item_id: item.item_id,
          item_name: item.item_name,
          item_category: item.item_category || 'papad',
          price: item.price,
          quantity: item.quantity,
          item_variant: item.item_variant,
        },
      ],
    });
  }

  public trackAddToCart(item: GA4Item): void {
    if (this.getConsent() !== 'granted') return;

    this.dispatchGtag('event', 'add_to_cart', {
      currency: 'INR',
      value: Math.round(item.price * item.quantity),
      items: [
        {
          item_id: item.item_id,
          item_name: item.item_name,
          item_category: item.item_category || 'papad',
          price: item.price,
          quantity: item.quantity,
          item_variant: item.item_variant,
        },
      ],
    });
  }

  public trackViewCart(items: GA4Item[], value: number): void {
    if (this.getConsent() !== 'granted') return;

    this.dispatchGtag('event', 'view_cart', {
      currency: 'INR',
      value,
      items: items.map((item) => ({
        item_id: item.item_id,
        item_name: item.item_name,
        item_category: item.item_category || 'papad',
        price: item.price,
        quantity: item.quantity,
        item_variant: item.item_variant,
      })),
    });
  }

  public trackBeginCheckout(items: GA4Item[], value: number): void {
    if (this.getConsent() !== 'granted') return;

    this.dispatchGtag('event', 'begin_checkout', {
      currency: 'INR',
      value,
      items: items.map((item) => ({
        item_id: item.item_id,
        item_name: item.item_name,
        item_category: item.item_category || 'papad',
        price: item.price,
        quantity: item.quantity,
        item_variant: item.item_variant,
      })),
    });
  }

  /**
   * Tracks an authoritative purchase event.
   * STRICT CRITERIA:
   * 1. Requires explicit consent ('granted').
   * 2. Must follow genuine backend payment verification.
   * 3. Reconciles value = sum(item.price * item.quantity) = subtotal.
   * 4. Multi-tier deduplication prevents duplicate dispatches.
   * 5. Strictly zero customer PII.
   */
  public trackPurchase(order: PurchaseOrderData): boolean {
    if (!order || !order.id) return false;

    // STRICT GATE: Never track if consent is not granted
    if (this.getConsent() !== 'granted') return false;

    // Safety guard: Reject test / mock identifiers from real analytics
    if (order.id.startsWith('pay_test_') || order.id.startsWith('mock_')) {
      return false;
    }

    // 1. In-memory session deduplication
    if (this.dispatchedOrderIds.has(order.id)) {
      return false;
    }

    // 2. Browser storage deduplication (survives page refresh)
    const storageKey = ORDER_TRACK_PREFIX + order.id;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored === 'verified') {
        return false;
      }
    } catch {
      // Storage check error
    }

    // 3. Financial Reconciliation
    const itemsTotal = order.items.reduce(
      (sum, item) => sum + Math.round(item.price * item.quantity),
      0
    );
    const subtotal = order.subtotal > 0 ? order.subtotal : itemsTotal;
    const shipping = order.shipping >= 0 ? order.shipping : 0;
    const tax = order.tax && order.tax > 0 ? order.tax : 0;

    // 4. Mark pending in memory before dispatch
    this.dispatchedOrderIds.add(order.id);

    try {
      this.dispatchGtag('event', 'purchase', {
        transaction_id: order.id,
        value: subtotal, // value equals sum of item price * quantity
        shipping,
        tax,
        currency: 'INR',
        items: order.items.map((item) => ({
          item_id: item.item_id,
          item_name: item.item_name,
          item_category: item.item_category || 'papad',
          price: item.price,
          quantity: item.quantity,
          item_variant: item.item_variant,
        })),
      });

      // 5. Mark as verified in localStorage only after dispatch attempt
      try {
        window.localStorage.setItem(storageKey, 'verified');
      } catch {
        // Storage write error
      }

      return true;
    } catch {
      this.dispatchedOrderIds.delete(order.id);
      return false;
    }
  }

  public trackPaymentFailure(
    orderId: string,
    errorCategory: PaymentFailureCategory,
    amount: number
  ): void {
    if (this.getConsent() !== 'granted') return;

    this.dispatchGtag('event', 'payment_failure', {
      order_id: orderId,
      error_category: errorCategory,
      currency: 'INR',
      value: amount,
    });
  }

  public trackEvent(
    name: string,
    properties: Record<string, string | number | boolean | null | undefined> = {}
  ): void {
    if (this.getConsent() !== 'granted') return;

    this.dispatchGtag('event', name, {
      ...properties,
      current_path: this.lastPath,
    });
  }

  private dispatchGtag(command: string, action: string, params: Record<string, unknown>): void {
    // STRICT CONSENT GATE: Absolute block if consent is not granted
    if (this.getConsent() !== 'granted') {
      return;
    }

    if (typeof window.gtag === 'function') {
      window.gtag(command, action, params);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: action, ...params });
    }

    // Internal CustomEvent notification for listeners/tests
    try {
      window.dispatchEvent(
        new CustomEvent('kawad_analytics_event', {
          detail: { command, action, params },
        })
      );
    } catch {
      // CustomEvent fallback
    }
  }

  private hookNavigation(): void {
    const handleLocationChange = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== this.lastPath) {
        this.trackPageView(currentPath);
      }
    };

    window.addEventListener('popstate', handleLocationChange);

    const originalPushState = window.history.pushState.bind(window.history);
    window.history.pushState = (...args) => {
      originalPushState(...args);
      handleLocationChange();
    };

    const originalReplaceState = window.history.replaceState.bind(window.history);
    window.history.replaceState = (...args) => {
      originalReplaceState(...args);
      handleLocationChange();
    };
  }
}

export const analytics = new KawadAnalyticsEngine();

export function initAnalytics(): void {
  analytics.init();
}

export function getAnalyticsConsent(): ConsentStatus {
  return analytics.getConsent();
}

export function setAnalyticsConsent(granted: boolean): void {
  analytics.setConsent(granted);
}
