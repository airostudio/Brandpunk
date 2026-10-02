import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
  ACCOUNT_COOKIE_NAME,
  ACCOUNT_COOKIE_MAX_AGE_SECONDS,
  activateSubscription,
  allowanceForPlan,
  planIdForPriceId,
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from "@/lib/billing";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const oneTimeSessionId = url.searchParams.get("session_id");
  const subscriptionSessionId = url.searchParams.get("subscription_session_id");

  if (oneTimeSessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(oneTimeSessionId);
      return NextResponse.json({ ok: true, kind: "one-time", paid: session.payment_status === "paid" });
    } catch {
      return NextResponse.json({ ok: false, reason: "stripe-error" }, { status: 502 });
    }
  }

  if (subscriptionSessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(subscriptionSessionId, {
        expand: ["subscription", "subscription.items.data.price", "customer"],
      });
      if (session.status !== "complete" || !session.subscription || typeof session.subscription === "string") {
        return NextResponse.json({ ok: true, kind: "subscription", active: false });
      }
      const subscription = session.subscription;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      const email = session.customer_details?.email ?? "";
      if (!customerId) {
        return NextResponse.json({ ok: false, reason: "missing-customer" }, { status: 502 });
      }

      const metaPlanId = subscription.metadata?.planId as SubscriptionPlanId | undefined;
      const priceId = subscription.items.data[0]?.price?.id;
      const planId = (metaPlanId && metaPlanId in SUBSCRIPTION_PLANS ? metaPlanId : planIdForPriceId(priceId)) ?? null;
      if (!planId) {
        return NextResponse.json({ ok: false, reason: "unknown-plan" }, { status: 502 });
      }

      const record = await activateSubscription({
        stripeCustomerId: customerId,
        email,
        stripeSubscriptionId: subscription.id,
        planId,
      });

      const response = NextResponse.json({
        ok: true,
        kind: "subscription",
        active: true,
        planId: record.planId,
        packsUsedThisPeriod: record.packsUsedThisPeriod,
        packsPerPeriod: allowanceForPlan(record.planId),
      });
      response.cookies.set(ACCOUNT_COOKIE_NAME, record.accountToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: ACCOUNT_COOKIE_MAX_AGE_SECONDS,
        path: "/",
      });
      return response;
    } catch {
      return NextResponse.json({ ok: false, reason: "stripe-error" }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: false, reason: "missing-session-id" }, { status: 400 });
}
