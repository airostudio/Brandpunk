import { randomUUID } from "crypto";
import { get, put, BlobNotFoundError, BlobPreconditionFailedError } from "@vercel/blob";
import { ACCOUNT_COOKIE_NAME, allowanceForPlan, type SubscriptionPlanId } from "./plans";

export {
  ACCOUNT_COOKIE_NAME,
  ACCOUNT_COOKIE_MAX_AGE_SECONDS,
  SUBSCRIPTION_PLANS,
  ONE_TIME_PRICE_ENV_VAR,
  ONE_TIME_PRICE_DISPLAY,
  CREDIT_PACKS,
  IMAGE_CREDIT_COST,
  VIDEO_CREDIT_COST,
  planIdForPriceId,
  creditPackForPriceId,
  allowanceForPlan,
  type SubscriptionPlanId,
  type CreditPackId,
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
  /** Ad Studio credits — independent of subscription plan; anyone can buy a pack. */
  creditsBalance: number;
  createdAt: string;
  updatedAt: string;
};

function pathForToken(token: string): string {
  return `accounts/${token}.json`;
}

function pointerPathForStripeCustomer(stripeCustomerId: string): string {
  return `stripe-customers/${stripeCustomerId}.json`;
}

function creditGrantMarkerPath(sessionId: string): string {
  return `credit-grants/${sessionId}.json`;
}

export function newAccountToken(): string {
  return randomUUID();
}

/** Whether Vercel Blob (the account/subscription/credits store) is set up — routes should check this before touching it. */
export function isStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Reads the account cookie off a Request's raw Cookie header. */
export function getAccountTokenFromRequest(request: Request): string | undefined {
  const cookieHeader = request.headers.get("cookie") ?? "";
  return cookieHeader
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${ACCOUNT_COOKIE_NAME}=`))
    ?.slice(ACCOUNT_COOKIE_NAME.length + 1);
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

/** Finds the customer record for a Stripe customer, or creates a bare one (no subscription, no credits) if none exists yet. */
async function findOrCreateCustomerRecord(stripeCustomerId: string, email: string): Promise<CustomerRecord> {
  const existing = await findCustomerRecordByStripeCustomerId(stripeCustomerId);
  if (existing) return existing;
  const now = new Date().toISOString();
  const record: CustomerRecord = {
    accountToken: newAccountToken(),
    email,
    stripeCustomerId,
    stripeSubscriptionId: null,
    planId: null,
    status: "incomplete",
    packsUsedThisPeriod: 0,
    periodResetAt: periodResetFromNow(),
    creditsBalance: 0,
    createdAt: now,
    updatedAt: now,
  };
  await saveCustomerRecord(record);
  await linkStripeCustomerToToken(stripeCustomerId, record.accountToken);
  return record;
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
  const existing = await findOrCreateCustomerRecord(params.stripeCustomerId, params.email);
  const record: CustomerRecord = {
    ...existing,
    email: params.email,
    stripeSubscriptionId: params.stripeSubscriptionId,
    planId: params.planId,
    status: "active",
    packsUsedThisPeriod: 0,
    periodResetAt: periodResetFromNow(),
    updatedAt: new Date().toISOString(),
  };
  await saveCustomerRecord(record);
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

/**
 * Grants credits to a Stripe customer exactly once per Checkout Session,
 * no matter how many times this is called (webhook retries, and the
 * success-page verify route both call it). The marker blob is written with
 * allowOverwrite:false, so whichever caller writes it first "claims" the
 * session; a second caller gets BlobPreconditionFailedError and skips the
 * grant instead of double-crediting the purchase.
 */
export async function grantCreditsOnce(params: {
  checkoutSessionId: string;
  stripeCustomerId: string;
  email: string;
  credits: number;
}): Promise<CustomerRecord | null> {
  try {
    await put(creditGrantMarkerPath(params.checkoutSessionId), new Date().toISOString(), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: "text/plain",
    });
  } catch (err) {
    if (err instanceof BlobPreconditionFailedError) return null;
    throw err;
  }

  const existing = await findOrCreateCustomerRecord(params.stripeCustomerId, params.email);
  const record: CustomerRecord = {
    ...existing,
    email: params.email,
    creditsBalance: existing.creditsBalance + params.credits,
    updatedAt: new Date().toISOString(),
  };
  await saveCustomerRecord(record);
  return record;
}

/** Deducts credits for a generation. Returns null if the account doesn't exist or doesn't have enough credits. */
export async function deductCredits(token: string, amount: number): Promise<CustomerRecord | null> {
  const existing = await getCustomerRecord(token);
  if (!existing || existing.creditsBalance < amount) return null;
  const record: CustomerRecord = { ...existing, creditsBalance: existing.creditsBalance - amount, updatedAt: new Date().toISOString() };
  await saveCustomerRecord(record);
  return record;
}

/** Refunds credits back onto the balance — used when a generation fails after credits were already deducted. */
export async function refundCredits(token: string, amount: number): Promise<CustomerRecord | null> {
  const existing = await getCustomerRecord(token);
  if (!existing) return null;
  const record: CustomerRecord = { ...existing, creditsBalance: existing.creditsBalance + amount, updatedAt: new Date().toISOString() };
  await saveCustomerRecord(record);
  return record;
}

type VideoJobRecord = { accountToken: string; refunded: boolean; mirroredUrl: string | null };

function videoJobPath(videoId: string): string {
  return `video-jobs/${videoId}.json`;
}

/** Tracks which account owns a video generation job, so /video-status can refund the right account and only once. */
export async function recordVideoJob(videoId: string, accountToken: string): Promise<void> {
  const record: VideoJobRecord = { accountToken, refunded: false, mirroredUrl: null };
  await put(videoJobPath(videoId), JSON.stringify(record), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function getVideoJob(videoId: string): Promise<VideoJobRecord | null> {
  try {
    const result = await get(videoJobPath(videoId), { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return null;
    return JSON.parse(await new Response(result.stream).text()) as VideoJobRecord;
  } catch (err) {
    if (err instanceof BlobNotFoundError) return null;
    throw err;
  }
}

async function saveVideoJob(videoId: string, record: VideoJobRecord): Promise<void> {
  await put(videoJobPath(videoId), JSON.stringify(record), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

/** Refunds a failed video job's credits exactly once, even if /video-status is polled many times after the failure. */
export async function refundVideoJobOnce(videoId: string, amount: number): Promise<void> {
  const job = await getVideoJob(videoId);
  if (!job || job.refunded) return;
  await refundCredits(job.accountToken, amount);
  await saveVideoJob(videoId, { ...job, refunded: true });
}

export async function markVideoJobMirrored(videoId: string, mirroredUrl: string): Promise<void> {
  const job = await getVideoJob(videoId);
  if (!job) return;
  await saveVideoJob(videoId, { ...job, mirroredUrl });
}
