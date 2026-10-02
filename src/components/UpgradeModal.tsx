"use client";

import { useState } from "react";
import { ONE_TIME_PRICE_DISPLAY, SUBSCRIPTION_PLANS, type SubscriptionPlanId } from "@/lib/plans";

export type AccountStatus = {
  signedIn: boolean;
  planId?: SubscriptionPlanId | null;
  status?: string;
  packsUsedThisPeriod?: number;
  packsPerPeriod?: number | null;
  packsRemaining?: boolean;
};

const PLAN_IDS = Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlanId[];

export function UpgradeModal({
  onClose,
  businessName,
  accountStatus,
}: {
  onClose: () => void;
  businessName: string;
  accountStatus: AccountStatus | null;
}) {
  const [tab, setTab] = useState<"one-time" | "subscription">("one-time");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startOneTimeCheckout() {
    setLoading("one-time");
    setError(null);
    try {
      const res = await fetch("/api/checkout/one-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName }),
      });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.assign(data.url);
      } else {
        setError("Payments aren't set up on this deployment yet.");
        setLoading(null);
      }
    } catch {
      setError("Something went wrong starting checkout — try again.");
      setLoading(null);
    }
  }

  async function startSubscriptionCheckout(planId: SubscriptionPlanId) {
    setLoading(planId);
    setError(null);
    try {
      const res = await fetch("/api/checkout/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.assign(data.url);
      } else {
        setError("Payments aren't set up on this deployment yet.");
        setLoading(null);
      }
    } catch {
      setError("Something went wrong starting checkout — try again.");
      setLoading(null);
    }
  }

  async function manageBilling() {
    setLoading("portal");
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.assign(data.url);
      } else {
        setError("Could not open the billing portal.");
        setLoading(null);
      }
    } catch {
      setError("Could not open the billing portal.");
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#111114] p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
              BrandPunk Pro
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight">Envelopes, quotes, cover banners & print-ready exports</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/60 hover:border-white/40 hover:text-white"
          >
            Close
          </button>
        </div>

        {accountStatus?.signedIn && (
          <div className="mt-5 flex flex-col gap-2 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-white/80">
              You&apos;re on the <strong className="text-accent">{accountStatus.planId ? SUBSCRIPTION_PLANS[accountStatus.planId].label : "—"}</strong>{" "}
              plan — {accountStatus.packsPerPeriod === null ? "unlimited" : `${accountStatus.packsUsedThisPeriod ?? 0}/${accountStatus.packsPerPeriod}`}{" "}
              packs used this period.
            </span>
            <button
              type="button"
              onClick={manageBilling}
              disabled={loading === "portal"}
              className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/70 hover:border-white/40 hover:text-white disabled:opacity-50"
            >
              {loading === "portal" ? "Opening…" : "Manage Subscription"}
            </button>
          </div>
        )}

        <div className="mt-6 flex gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-1">
          <button
            type="button"
            onClick={() => setTab("one-time")}
            className={`flex-1 rounded-md py-2 text-xs font-bold uppercase tracking-widest transition ${
              tab === "one-time" ? "bg-accent text-black" : "text-white/60 hover:text-white"
            }`}
          >
            One-time ({ONE_TIME_PRICE_DISPLAY})
          </button>
          <button
            type="button"
            onClick={() => setTab("subscription")}
            className={`flex-1 rounded-md py-2 text-xs font-bold uppercase tracking-widest transition ${
              tab === "subscription" ? "bg-accent text-black" : "text-white/60 hover:text-white"
            }`}
          >
            Subscription
          </button>
        </div>

        {tab === "one-time" ? (
          <div className="mt-6">
            <p className="text-sm text-white/60">
              Pay once to unlock the full Pro asset set for <strong>this</strong> brand pack — no recurring charge.
            </p>
            <button
              type="button"
              onClick={startOneTimeCheckout}
              disabled={loading === "one-time"}
              className="mt-4 w-full rounded-lg bg-accent px-6 py-3 text-center text-sm font-extrabold uppercase tracking-widest text-black transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60"
            >
              {loading === "one-time" ? "Starting checkout…" : `Pay ${ONE_TIME_PRICE_DISPLAY} — Unlock This Pack`}
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PLAN_IDS.map((id) => {
              const plan = SUBSCRIPTION_PLANS[id];
              const isCurrent = accountStatus?.signedIn && accountStatus.planId === id;
              return (
                <div key={id} className="flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white">{plan.label}</h3>
                  <p className="mt-1 text-2xl font-black">{plan.priceDisplay}</p>
                  <p className="mt-1 text-xs text-white/50">{plan.blurb}</p>
                  <button
                    type="button"
                    onClick={() => startSubscriptionCheckout(id)}
                    disabled={loading === id || isCurrent}
                    className="mt-4 rounded-lg border border-accent/40 px-4 py-2 text-xs font-bold uppercase tracking-widest text-accent transition hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCurrent ? "Current Plan" : loading === id ? "Starting…" : "Subscribe"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {error && <p className="mt-4 text-sm text-accent-2">{error}</p>}

        <p className="mt-6 text-xs leading-relaxed text-white/40">
          Payments are processed securely by Stripe. Subscriptions can be cancelled anytime from &quot;Manage Subscription&quot; above.
        </p>
      </div>
    </div>
  );
}
