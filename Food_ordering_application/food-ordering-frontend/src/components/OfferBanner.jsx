import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const DISMISS_KEY = 'foodapp_offer_banner_dismissed';
const FIRST_TIME_KEY = 'foodapp_offer_seen';
const PREAPPLY_COUPON_KEY = 'preAppliedCoupon';
const COUPON_CODE = 'WELCOME20';

/**
 * Guest-first promotional banner with coupon copy and quick claim action.
 */
export default function OfferBanner() {
  const { currentUser } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(DISMISS_KEY) === 'true';
    const seenBefore = window.localStorage.getItem(FIRST_TIME_KEY) === 'true';

    if (dismissed) {
      setIsVisible(false);
      return;
    }

    if (!currentUser) {
      setIsVisible(true);
      return;
    }

    setIsVisible(!seenBefore);
  }, [currentUser]);

  const dismissBanner = () => {
    window.localStorage.setItem(DISMISS_KEY, 'true');
    window.localStorage.setItem(FIRST_TIME_KEY, 'true');
    setIsVisible(false);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const claimOffer = () => {
    window.localStorage.setItem(PREAPPLY_COUPON_KEY, COUPON_CODE);
    window.localStorage.setItem(FIRST_TIME_KEY, 'true');

    const target = document.getElementById('restaurant-grid');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <section className="mx-auto mt-6 w-full max-w-6xl px-4">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-cyan-500 p-6 text-white shadow-lg">
        <button
          type="button"
          onClick={dismissBanner}
          aria-label="Dismiss offer"
          className="absolute right-3 top-3 rounded-md px-2 py-1 text-sm text-white/80 transition hover:bg-white/20 hover:text-white"
        >
          ×
        </button>

        <div className="grid items-center gap-4 md:grid-cols-[1fr,auto]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">Limited time welcome deal</p>
            <h3 className="mt-2 text-2xl font-bold">Save 20% on your first order</h3>
            <p className="mt-1 text-sm text-white/90">Use this coupon at checkout and get your first delivery offer instantly.</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1.5">
                <code className="font-mono text-sm font-bold text-white">{COUPON_CODE}</code>
                <button type="button" onClick={copyCode} className="text-xs text-white/85 transition hover:text-white">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              <button
                type="button"
                onClick={claimOffer}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Claim offer
              </button>
            </div>
          </div>

          <div className="hidden rounded-2xl bg-white/15 px-6 py-5 text-5xl md:block" aria-hidden="true">
            🎉
          </div>
        </div>
      </div>
    </section>
  );
}