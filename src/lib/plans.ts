/**
 * Plan metadata shared between server (billing.ts, API routes) and client
 * (pricing UI) code. Deliberately has no server-only imports (no @vercel/blob,
 * no node:crypto) so client components can import it directly.
 */

export const ACCOUNT_COOKIE_NAME = "bp_account";
/** 1 year — long enough that a subscriber rarely has to re-checkout, short enough to rotate eventually. */
export const ACCOUNT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type SubscriptionPlanId = "starter" | "pro" | "agency";

export const SUBSCRIPTION_PLANS: Record<
  SubscriptionPlanId,
  { label: string; packsPerPeriod: number | null; priceEnvVar: string; priceDisplay: string; blurb: string }
> = {
  starter: {
    label: "Starter",
    packsPerPeriod: 3,
    priceEnvVar: "STRIPE_PRICE_SUBSCRIPTION_STARTER",
    priceDisplay: "$9/mo",
    blurb: "3 brand packs a month",
  },
  pro: {
    label: "Pro",
    packsPerPeriod: 10,
    priceEnvVar: "STRIPE_PRICE_SUBSCRIPTION_PRO",
    priceDisplay: "$24/mo",
    blurb: "10 brand packs a month",
  },
  agency: {
    label: "Agency",
    packsPerPeriod: null,
    priceEnvVar: "STRIPE_PRICE_SUBSCRIPTION_AGENCY",
    priceDisplay: "$59/mo",
    blurb: "Unlimited brand packs",
  },
};

export const ONE_TIME_PRICE_ENV_VAR = "STRIPE_PRICE_ONE_TIME";
export const ONE_TIME_PRICE_DISPLAY = "$19";

/** Maps a Stripe Price ID back to our plan ID, by matching against each plan's configured env var. */
export function planIdForPriceId(priceId: string | null | undefined): SubscriptionPlanId | null {
  if (!priceId) return null;
  for (const id of Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlanId[]) {
    if (process.env[SUBSCRIPTION_PLANS[id].priceEnvVar] === priceId) return id;
  }
  return null;
}

export function allowanceForPlan(planId: SubscriptionPlanId | null): number | null {
  if (!planId) return 0;
  return SUBSCRIPTION_PLANS[planId].packsPerPeriod;
}

/**
 * Ad Studio — the social/advert add-on. Generates images via OpenAI's image
 * model and video via OpenAI's video model, paid for with credits instead of
 * a per-pack or subscription charge, since usage (and OpenAI's own per-call
 * cost) varies a lot more than a brand pack download does.
 */
export type CreditPackId = "starter";

export const CREDIT_PACKS: Record<CreditPackId, { credits: number; priceDisplay: string; priceEnvVar: string }> = {
  starter: { credits: 5000, priceDisplay: "$6.99", priceEnvVar: "STRIPE_PRICE_CREDITS_STARTER" },
};

/**
 * Credit costs per generation. These bake in a margin over OpenAI's own
 * per-call price — tune them once you have real OpenAI invoices in hand,
 * they're not derived from a live price feed.
 */
export const IMAGE_CREDIT_COST = 2800;
/** Video generation (Sora-class models) costs OpenAI dramatically more per call than a single image. */
export const VIDEO_CREDIT_COST = 14000;

export function creditPackForPriceId(priceId: string | null | undefined): CreditPackId | null {
  if (!priceId) return null;
  for (const id of Object.keys(CREDIT_PACKS) as CreditPackId[]) {
    if (process.env[CREDIT_PACKS[id].priceEnvVar] === priceId) return id;
  }
  return null;
}
