import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { ACCOUNT_COOKIE_NAME, getCustomerRecord } from "@/lib/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${ACCOUNT_COOKIE_NAME}=`))
    ?.slice(ACCOUNT_COOKIE_NAME.length + 1);

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
