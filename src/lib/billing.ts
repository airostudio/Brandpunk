import { randomUUID } from "crypto";
import { get, put, BlobNotFoundError } from "@vercel/blob";
import { allowanceForPlan, type SubscriptionPlanId } from "./plans";

export {
  ACCOUNT_COOKIE_NAME,
  ACCOUNT_COOKIE_MAX_AGE_SECONDS,
  SUBSCRIPTION_PLANS,
  ONE_TIME_PRICE_ENV_VAR,
  ONE_TIME_PRICE_DISPLAY,
  planIdForPriceId,
  allowanceForPlan,
  type SubscriptionPlanId,
} from "./plans";

export type CustomerRecord = {
  accountToken: string;
  email: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  planId: SubscriptionPlanId | null;
  status: "active" | "past_due" | "canceled" | "incomplete";
  packsUsedThisPeriod: number;
  periodResetAt: string;
  createdAt: string;
  updatedAt: string;
};

function pathForToken(token: string): string {
  return `accounts/${token}.json`;
}

function pointerPathForStripeCustomer(stripeCustomerId: string): string {
  return `stripe-customers/${stripeCustomerId}.json`;
}

export function newAccountToken(): string {
  return randomUUID();
}

export async function getCustomerRecord(token: string): Promise<CustomerRecord | null> {
  try {
    const result = await get(pathForToken(token), { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return null;
    const text = await new Response(result.stream).text();
    return JSON.parse(text) as CustomerRecord;
  } catch (err) {
    if (err instanceof BlobNotFoundError) return null;
    throw err;
  }
}

export async function saveCustomerRecord(record: CustomerRecord): Promise<void> {
  await put(pathForToken(record.accountToken), JSON.stringify(record), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

/** Finds an existing customer record by Stripe customer ID (used by webhook handlers, which only know the Stripe IDs). */
export async function findCustomerRecordByStripeCustomerId(stripeCustomerId: string): Promise<CustomerRecord | null> {
  // Accounts are keyed by our own random token, not the Stripe customer ID, so the
  // webhook (which only has Stripe IDs) stores a small pointer record it can look up directly.
  try {
    const result = await get(pointerPathForStripeCustomer(stripeCustomerId), { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return null;
    const token = await new Response(result.stream).text();
    return getCustomerRecord(token.trim());
  } catch (err) {
    if (err instanceof BlobNotFoundError) return null;
    throw err;
  }
}

export async function linkStripeCustomerToToken(stripeCustomerId: string, token: string): Promise<void> {
  await put(pointerPathForStripeCustomer(stripeCustomerId), token, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "text/plain",
  });
}

export function periodResetFromNow(): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d.toISOString();
}

/** Null allowance means unlimited (the Agency tier). */
export function hasPacksRemaining(record: CustomerRecord): boolean {
  const allowance = allowanceForPlan(record.planId);
  if (allowance === null) return true;
  return record.packsUsedThisPeriod < allowance;
}

/**
 * Creates or reuses the account for a Stripe customer and (re)starts their
 * billing period at zero packs used. Called both from the success-page
 * verify route (for immediate feedback) and the webhook (as the durable,
 * authoritative write) — idempotent on stripeCustomerId, so whichever runs
 * first wins and the other just confirms the same state.
 */
export async function activateSubscription(params: {
  stripeCustomerId: string;
  email: string;
  stripeSubscriptionId: string;
  planId: SubscriptionPlanId;
}): Promise<CustomerRecord> {
  const existing = await findCustomerRecordByStripeCustomerId(params.stripeCustomerId);
  const now = new Date().toISOString();
  const record: CustomerRecord = {
    accountToken: existing?.accountToken ?? newAccountToken(),
    email: params.email,
    stripeCustomerId: params.stripeCustomerId,
    stripeSubscriptionId: params.stripeSubscriptionId,
    planId: params.planId,
    status: "active",
    packsUsedThisPeriod: 0,
    periodResetAt: periodResetFromNow(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await saveCustomerRecord(record);
  if (!existing) await linkStripeCustomerToToken(params.stripeCustomerId, record.accountToken);
  return record;
}

/** Called on invoice.paid for billing-period renewals — resets the usage counter. */
export async function renewSubscriptionPeriod(stripeCustomerId: string): Promise<CustomerRecord | null> {
  const existing = await findCustomerRecordByStripeCustomerId(stripeCustomerId);
  if (!existing) return null;
  const record: CustomerRecord = {
    ...existing,
    status: "active",
    packsUsedThisPeriod: 0,
    periodResetAt: periodResetFromNow(),
    updatedAt: new Date().toISOString(),
  };
  await saveCustomerRecord(record);
  return record;
}

/** Called on customer.subscription.updated/deleted to reflect cancellation, pauses, etc. */
export async function updateSubscriptionStatus(
  stripeCustomerId: string,
  status: CustomerRecord["status"],
  planId?: SubscriptionPlanId,
): Promise<CustomerRecord | null> {
  const existing = await findCustomerRecordByStripeCustomerId(stripeCustomerId);
  if (!existing) return null;
  const record: CustomerRecord = {
    ...existing,
    status,
    planId: planId ?? existing.planId,
    updatedAt: new Date().toISOString(),
  };
  await saveCustomerRecord(record);
  return record;
}

export async function incrementPacksUsed(token: string): Promise<CustomerRecord | null> {
  const existing = await getCustomerRecord(token);
  if (!existing) return null;
  const record: CustomerRecord = { ...existing, packsUsedThisPeriod: existing.packsUsedThisPeriod + 1, updatedAt: new Date().toISOString() };
  await saveCustomerRecord(record);
  return record;
}
