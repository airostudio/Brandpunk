import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { SUBSCRIPTION_PLANS, type SubscriptionPlanId } from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { planId?: string; email?: string };
  const planId = body.planId as SubscriptionPlanId | undefined;
  if (!planId || !(planId in SUBSCRIPTION_PLANS)) {
    return NextResponse.json({ ok: false, reason: "invalid-plan" }, { status: 400 });
  }

  const priceId = process.env[SUBSCRIPTION_PLANS[planId].priceEnvVar];
  if (!priceId) {
    return NextResponse.json({ ok: false, reason: "stripe-not-configured" }, { status: 503 });
  }

  const origin = new URL(request.url).origin;

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: body.email || undefined,
      success_url: `${origin}/pack?subscription_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pack`,
      metadata: { planId },
      subscription_data: { metadata: { planId } },
    });
    return NextResponse.json({ ok: true, url: session.url });
  } catch {
    return NextResponse.json({ ok: false, reason: "stripe-error" }, { status: 502 });
  }
}
