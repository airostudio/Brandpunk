import type { SubscriptionPlanId } from "./plans";

/** Starts a Stripe Checkout session and returns its redirect URL, or null if payments aren't configured. */
export async function requestOneTimeCheckoutUrl(businessName: string): Promise<string | null> {
  try {
    const res = await fetch("/api/checkout/one-time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName }),
    });
    const data = await res.json();
    return data.ok && data.url ? data.url : null;
  } catch {
    return null;
  }
}

export async function requestSubscriptionCheckoutUrl(planId: SubscriptionPlanId): Promise<string | null> {
  try {
    const res = await fetch("/api/checkout/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const data = await res.json();
    return data.ok && data.url ? data.url : null;
  } catch {
    return null;
  }
}

export async function requestBillingPortalUrl(): Promise<string | null> {
  try {
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    return data.ok && data.url ? data.url : null;
  } catch {
    return null;
  }
}
