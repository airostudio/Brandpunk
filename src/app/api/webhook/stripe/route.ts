import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import {
  activateSubscription,
  grantCreditsOnce,
  planIdForPriceId,
  renewSubscriptionPeriod,
  updateSubscriptionStatus,
  type SubscriptionPlanId,
} from "@/lib/billing";

export const runtime = "nodejs";

function mapStripeStatus(status: Stripe.Subscription.Status): "active" | "past_due" | "canceled" | "incomplete" {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid") return "past_due";
  if (status === "canceled" || status === "incomplete_expired") return "canceled";
  return "incomplete";
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, reason: "webhook-not-configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();
  if (!signature) {
    return NextResponse.json({ ok: false, reason: "missing-signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid-signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId, { expand: ["items.data.price"] });
          const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
          const email = session.customer_details?.email ?? "";
          const metaPlanId = subscription.metadata?.planId as SubscriptionPlanId | undefined;
          const planId = metaPlanId ?? planIdForPriceId(subscription.items.data[0]?.price?.id);
          if (customerId && planId) {
            await activateSubscription({ stripeCustomerId: customerId, email, stripeSubscriptionId: subscription.id, planId });
          }
        } else if (session.mode === "payment" && session.metadata?.kind === "credits") {
          const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
          const email = session.customer_details?.email ?? "";
          const credits = Number(session.metadata?.credits ?? 0);
          if (customerId && credits) {
            await grantCreditsOnce({ checkoutSessionId: session.id, stripeCustomerId: customerId, email, credits });
          }
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (customerId) await renewSubscriptionPeriod(customerId);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        const metaPlanId = subscription.metadata?.planId as SubscriptionPlanId | undefined;
        await updateSubscriptionStatus(customerId, mapStripeStatus(subscription.status), metaPlanId);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
        await updateSubscriptionStatus(customerId, "canceled");
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler error", err);
    return NextResponse.json({ ok: false, reason: "handler-error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
