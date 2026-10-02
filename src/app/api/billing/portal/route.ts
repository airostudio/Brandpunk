import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getAccountTokenFromRequest, getCustomerRecord, isStorageConfigured } from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStorageConfigured()) {
    return NextResponse.json({ ok: false, reason: "storage-not-configured" }, { status: 503 });
  }

  const token = getAccountTokenFromRequest(request);

  if (!token) return NextResponse.json({ ok: false, reason: "not-signed-in" }, { status: 401 });

  const record = await getCustomerRecord(token);
  if (!record) return NextResponse.json({ ok: false, reason: "not-signed-in" }, { status: 401 });

  const origin = new URL(request.url).origin;
  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: record.stripeCustomerId,
      return_url: `${origin}/pack`,
    });
    return NextResponse.json({ ok: true, url: session.url });
  } catch {
    return NextResponse.json({ ok: false, reason: "stripe-error" }, { status: 502 });
  }
}
