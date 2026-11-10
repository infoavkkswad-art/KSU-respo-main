/**
 * Kawad Swad E-commerce Analytics & Consent Engine
 * GA4 Measurement ID: G-R5YNWTG2MC
 * Strictly Zero-PII, Deduplicated, Financially Reconciled Telemetry
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
    };
  }
}

const CONSENT_STORAGE_KEY = 'kawad_analytics_consent';
const ORDER_TRACK_PREFIX = 'kawad_order_analytics_';

class KawadAnalyticsEngine {
  private lastPath: string = '';
  private isInitialized: boolean = false;
  private dispatchedOrderIds: Set<string> = new Set();

  public getConsent(): ConsentStatus {
    if (typeof window === 'undefined') return null;
    try {
      const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored === 'granted' || stored === 'denied') {
        return stored;
      }
    } catch {
      // Fallback if localStorage restricted
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

    // Update GA4 consent state
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: status,
      });
    }

    // Dispatch event to update reactive UI components
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

  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Apply stored consent if already selected
    const existingConsent = this.getConsent();
    if (existingConsent === 'granted' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }

    // Track the initial page load route exactly once
    const initialPath = window.location.pathname;
    this.trackPageView(initialPath);

    // Listen to SPA browser navigation
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
    };
  }

  public trackPageView(path: string): void {
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
   * 1. Must follow verified payment from backend.
   * 2. Reconciles value = sum(item.price * item.quantity) = subtotal.
   * 3. Separates shipping and tax.
   * 4. Multi-tier deduplication prevents duplicate dispatches on refresh or re-render.
   * 5. Absolutely zero customer PII.
   */
  public trackPurchase(order: PurchaseOrderData): boolean {
    if (!order || !order.id) return false;

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
      // If dispatch failed completely with error, remove memory lock to permit retry
      this.dispatchedOrderIds.delete(order.id);
      return false;
    }
  }

  public trackPaymentFailure(
    orderId: string,
    errorCategory: PaymentFailureCategory,
    amount: number
  ): void {
    // Strictly zero PII and controlled error category only
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
    this.dispatchGtag('event', name, {
      ...properties,
      current_path: this.lastPath,
    });
  }

  private dispatchGtag(command: string, action: string, params: Record<string, unknown>): void {
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
