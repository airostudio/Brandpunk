import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { CREDIT_PACKS, type CreditPackId } from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { packId?: string };
  const packId = (body.packId ?? "starter") as CreditPackId;
  if (!(packId in CREDIT_PACKS)) {
    return NextResponse.json({ ok: false, reason: "invalid-pack" }, { status: 400 });
  }

  const pack = CREDIT_PACKS[packId];
  const priceId = process.env[pack.priceEnvVar];
  if (!priceId) {
    return NextResponse.json({ ok: false, reason: "stripe-not-configured" }, { status: 503 });
  }

  const origin = new URL(request.url).origin;

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/studio?credits_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/studio`,
      metadata: { kind: "credits", packId, credits: String(pack.credits) },
    });
    return NextResponse.json({ ok: true, url: session.url });
  } catch {
    return NextResponse.json({ ok: false, reason: "stripe-error" }, { status: 502 });
  }
}
