"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { requestBillingPortalUrl } from "@/lib/checkout";
import { SUBSCRIPTION_PLANS, type SubscriptionPlanId } from "@/lib/plans";

type AccountStatus = {
  signedIn: boolean;
  planId?: SubscriptionPlanId | null;
  packsUsedThisPeriod?: number;
  packsPerPeriod?: number | null;
  creditsBalance?: number;
};

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/account/status");
        const data = await res.json();
        if (data.ok) setStatus(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function manageBilling() {
    setPortalLoading(true);
    setError(null);
    const url = await requestBillingPortalUrl();
    if (url) {
      window.location.assign(url);
    } else {
      setError("Could not open the billing portal.");
      setPortalLoading(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 sm:py-24">
      <div className="mb-10 flex max-w-xl flex-col items-center text-center">
        <span className="mb-4 rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
          Account
        </span>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Your BrandPunk account</h1>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        {loading ? (
          <p className="text-center text-sm text-white/50">Checking your subscription…</p>
        ) : status?.signedIn ? (
          <div className="flex flex-col items-center text-center">
            {status.planId && (
              <>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">Current plan</p>
                <p className="mt-2 text-2xl font-black text-accent">{SUBSCRIPTION_PLANS[status.planId].label}</p>
                <p className="mt-2 text-sm text-white/60">
                  {status.packsPerPeriod === null
                    ? "Unlimited packs this period."
                    : `${status.packsUsedThisPeriod ?? 0} / ${status.packsPerPeriod} packs used this period.`}
                </p>
                <button
                  type="button"
                  onClick={manageBilling}
                  disabled={portalLoading}
                  className="mt-6 w-full rounded-lg bg-accent px-6 py-3 text-center text-sm font-extrabold uppercase tracking-widest text-black transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60"
                >
                  {portalLoading ? "Opening…" : "Manage Subscription"}
                </button>
              </>
            )}

            <div className={status.planId ? "mt-6 w-full border-t border-white/10 pt-6" : "w-full"}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Ad Studio credits</p>
              <p className="mt-2 text-2xl font-black text-accent-2">{(status.creditsBalance ?? 0).toLocaleString()}</p>
              <Link
                href="/studio"
                className="mt-4 block w-full rounded-lg bg-accent-2 px-6 py-3 text-center text-sm font-extrabold uppercase tracking-widest text-black transition hover:brightness-95"
              >
                Open Ad Studio
              </Link>
            </div>

            <Link
              href="/start"
              className="mt-3 w-full rounded-lg border border-white/15 px-6 py-3 text-center text-sm font-semibold uppercase tracking-widest text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Start a New Brand Pack
            </Link>
            {error && <p className="mt-3 text-sm text-accent-2">{error}</p>}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <p className="text-sm text-white/60">
              No account found in this browser. If you&apos;ve already subscribed or bought credits, make sure
              you&apos;re on the same browser and device you checked out from.
            </p>
            <Link
              href="/start"
              className="mt-6 w-full rounded-lg bg-accent px-6 py-3 text-center text-sm font-extrabold uppercase tracking-widest text-black transition hover:brightness-95"
            >
              Start Building — It&apos;s Free
            </Link>
            <Link
              href="/studio"
              className="mt-3 w-full rounded-lg border border-white/15 px-6 py-3 text-center text-sm font-semibold uppercase tracking-widest text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Try Ad Studio
            </Link>
          </div>
        )}
      </div>

      <Link
        href="/"
        className="mt-10 text-xs font-semibold uppercase tracking-widest text-white/40 transition hover:text-white"
      >
        ← Back to BrandPunk
      </Link>
    </main>
  );
}
