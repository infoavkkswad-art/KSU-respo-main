/**
 * Lightweight Client-Side Analytics for Kawad Swad
 * Tracks page views across SPA navigation, session duration, scroll depth, and user engagement.
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean | null | undefined>;
  timestamp: number;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    KawadAnalytics?: {
      trackPageView: (path?: string) => void;
      trackEvent: (name: string, properties?: Record<string, string | number | boolean | null | undefined>) => void;
      getSessionDuration: () => number;
    };
  }
}

class LightweightAnalytics {
  private sessionStartTime: number;
  private lastPath: string;
  private pageStartTime: number;
  private maxScrollDepth: number = 0;
  private isInitialized: boolean = false;

  constructor() {
    this.sessionStartTime = Date.now();
    this.pageStartTime = Date.now();
    this.lastPath = typeof window !== 'undefined' ? window.location.pathname : '';
  }

  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Initial Page View
    this.trackPageView(window.location.pathname);

    // 2. SPA Navigation Listener (popstate, pushState, replaceState)
    this.hookHistoryEvents();

    // 3. User Engagement Tracking (Scroll depth, interaction, visibility)
    this.hookEngagementEvents();

    // Expose on window for components / debug
    window.KawadAnalytics = {
      trackPageView: (path?: string) => this.trackPageView(path || window.location.pathname),
      trackEvent: (name: string, properties?: Record<string, string | number | boolean | null | undefined>) =>
        this.trackEvent(name, properties),
      getSessionDuration: () => Math.round((Date.now() - this.sessionStartTime) / 1000),
    };
  }

  public trackPageView(path: string): void {
    const timeSpentOnPreviousPage = Math.round((Date.now() - this.pageStartTime) / 1000);

    // If leaving a previous page with meaningful engagement time, record page unload stats
    if (this.lastPath && this.lastPath !== path && timeSpentOnPreviousPage > 0) {
      this.trackEvent('page_engagement', {
        path: this.lastPath,
        durationSeconds: timeSpentOnPreviousPage,
        scrollDepthPercent: this.maxScrollDepth,
      });
    }

    // Reset page metrics
    this.lastPath = path;
    this.pageStartTime = Date.now();
    this.maxScrollDepth = 0;

    // Send Page View
    this.dispatch('page_view', {
      path,
      title: typeof document !== 'undefined' ? document.title : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      timestamp: Date.now(),
    });
  }

  public trackEvent(
    name: string,
    properties: Record<string, string | number | boolean | null | undefined> = {}
  ): void {
    this.dispatch(name, {
      ...properties,
      currentPath: this.lastPath,
      sessionElapsedSeconds: Math.round((Date.now() - this.sessionStartTime) / 1000),
      timestamp: Date.now(),
    });
  }

  private dispatch(
    eventName: string,
    payload: Record<string, string | number | boolean | null | undefined>
  ): void {
    // Forward to Google Tag Manager / GA4 if present
    if (typeof window.gtag === 'function') {
      if (eventName === 'page_view') {
        window.gtag('event', 'page_view', {
          page_path: payload.path,
          page_title: payload.title,
          page_location: typeof window !== 'undefined' ? window.location.href : '',
          ...payload,
        });
      } else {
        window.gtag('event', eventName, payload);
      }
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: eventName, ...payload });
    }

    // Custom browser event for internal subscribers
    try {
      const customEvent = new CustomEvent('kawad_analytics_event', {
        detail: { eventName, payload },
      });
      window.dispatchEvent(customEvent);
    } catch {
      // Ignore if CustomEvent is unsupported in environment
    }
  }

  private hookHistoryEvents(): void {
    const handleLocationChange = () => {
      const currentPath = window.location.pathname;
      if (currentPath !== this.lastPath) {
        this.trackPageView(currentPath);
      }
    };

    window.addEventListener('popstate', handleLocationChange);

    // Monkey-patch pushState & replaceState to detect SPA client-side route transitions
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

  private hookEngagementEvents(): void {
    // Scroll depth tracking (25%, 50%, 75%, 100%)
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
              const currentPercent = Math.min(100, Math.round((scrollTop / docHeight) * 100));
              if (currentPercent > this.maxScrollDepth) {
                this.maxScrollDepth = currentPercent;
              }
            }
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );

    // Visibility change / tab switch engagement pause
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        const timeSpent = Math.round((Date.now() - this.pageStartTime) / 1000);
        if (timeSpent > 2) {
          this.trackEvent('session_visibility_hidden', {
            path: this.lastPath,
            activeSeconds: timeSpent,
            maxScrollDepth: this.maxScrollDepth,
          });
        }
      }
    });

    // Delegated click tracking for data-analytics or CTA elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const trackableElement = target.closest('[data-analytics], button, a') as HTMLElement | null;
      if (!trackableElement) return;

      const trackingLabel =
        trackableElement.getAttribute('data-analytics') ||
        trackableElement.getAttribute('aria-label') ||
        trackableElement.innerText?.slice(0, 40).trim();

      if (trackingLabel) {
        this.trackEvent('user_interaction', {
          action: 'click',
          label: trackingLabel,
          tagName: trackableElement.tagName.toLowerCase(),
        });
      }
    }, { passive: true });
  }
}

export const analytics = new LightweightAnalytics();
export function initAnalytics(): void {
  analytics.init();
}
