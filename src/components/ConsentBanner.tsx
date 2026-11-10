import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Check, X } from 'lucide-react';
import { getAnalyticsConsent, setAnalyticsConsent, type ConsentStatus } from '@/utils/analytics';

export function ConsentBanner() {
  const [consent, setConsentState] = useState<ConsentStatus>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setConsentState(getAnalyticsConsent());

    const handleConsentChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ status: ConsentStatus }>;
      if (customEvent.detail && customEvent.detail.status) {
        setConsentState(customEvent.detail.status);
      } else {
        setConsentState(getAnalyticsConsent());
      }
    };

    window.addEventListener('kawad_consent_changed', handleConsentChange);
    return () => {
      window.removeEventListener('kawad_consent_changed', handleConsentChange);
    };
  }, []);

  if (!isClient || consent !== null) {
    return null;
  }

  const handleAccept = () => {
    setAnalyticsConsent(true);
    setConsentState('granted');
  };

  const handleDecline = () => {
    setAnalyticsConsent(false);
    setConsentState('denied');
  };

  return (
    <aside
      aria-label="Privacy & Analytics Preferences"
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 animate-fade-in"
    >
      <div className="container-max mx-auto max-w-4xl rounded-2xl border border-brand-saffron/20 bg-brand-brown/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md text-brand-cream">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-saffron/20 text-brand-saffron-light">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white">
                Privacy & Analytics Preferences
              </h4>
              <p className="mt-0.5 text-xs text-brand-cream/75 leading-relaxed">
                We use anonymous analytics cookies to understand store traffic and improve your browsing experience. No personal contact or payment information is ever tracked.{' '}
                <Link
                  to="/policies"
                  className="underline underline-offset-2 text-brand-saffron-light hover:text-white"
                >
                  View Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={handleDecline}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-cream/20 bg-transparent px-3.5 py-2 text-xs font-medium text-brand-cream hover:bg-brand-cream/10 transition-colors"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Decline
            </button>

            <button
              type="button"
              onClick={handleAccept}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-saffron px-4 py-2 text-xs font-semibold text-brand-brown hover:bg-brand-saffron-light transition-colors shadow-sm"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Accept Analytics
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
