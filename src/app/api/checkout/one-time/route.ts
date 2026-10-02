import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { ONE_TIME_PRICE_ENV_VAR } from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const priceId = process.env[ONE_TIME_PRICE_ENV_VAR];
  if (!priceId) {
    return NextResponse.json({ ok: false, reason: "stripe-not-configured" }, { status: 503 });
  }

  const origin = new URL(request.url).origin;
  const body = (await request.json().catch(() => ({}))) as { businessName?: string };

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pack?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pack`,
      metadata: { businessName: body.businessName ?? "" },
    });
    return NextResponse.json({ ok: true, url: session.url });
  } catch {
    return NextResponse.json({ ok: false, reason: "stripe-error" }, { status: 502 });
  }
}
