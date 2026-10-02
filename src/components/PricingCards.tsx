"use client";

import { useState } from "react";
import { requestSubscriptionCheckoutUrl } from "@/lib/checkout";
import { SUBSCRIPTION_PLANS, type SubscriptionPlanId } from "@/lib/plans";

const PLAN_IDS = Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlanId[];

export function PricingCards() {
  const [loading, setLoading] = useState<SubscriptionPlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(planId: SubscriptionPlanId) {
    setLoading(planId);
    setError(null);
    const url = await requestSubscriptionCheckoutUrl(planId);
    if (url) {
      window.location.assign(url);
    } else {
      setError("Payments aren't set up on this deployment yet.");
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLAN_IDS.map((id) => {
          const plan = SUBSCRIPTION_PLANS[id];
          const isFeatured = id === "pro";
          return (
            <div
              key={id}
              className={`flex flex-col rounded-2xl border p-6 ${
                isFeatured ? "border-accent/50 bg-accent/5" : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {isFeatured && (
                <span className="mb-3 w-fit rounded-full bg-accent px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-black">
                  Most Popular
                </span>
              )}
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">{plan.label}</h3>
              <p className="mt-2 text-3xl font-black">{plan.priceDisplay}</p>
              <p className="mt-2 text-sm text-white/50">{plan.blurb}</p>
              <button
                type="button"
                onClick={() => subscribe(id)}
                disabled={loading === id}
                className={`mt-6 rounded-lg px-4 py-3 text-xs font-extrabold uppercase tracking-widest transition disabled:cursor-wait disabled:opacity-60 ${
                  isFeatured
                    ? "bg-accent text-black hover:brightness-95"
                    : "border border-accent/40 text-accent hover:bg-accent/10"
                }`}
              >
                {loading === id ? "Starting checkout…" : "Subscribe"}
              </button>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-4 text-center text-sm text-accent-2">{error}</p>}
      <p className="mt-6 text-center text-xs text-white/40">
        Prefer to pay as you go? Unlock any single pack for $19, one-time, right from the download screen.
      </p>
    </div>
  );
}
