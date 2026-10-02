import { NextResponse } from "next/server";
import { getAccountTokenFromRequest, getCustomerRecord, hasPacksRemaining, incrementPacksUsed, isStorageConfigured } from "@/lib/billing";

export const runtime = "nodejs";

/** Called right before building a Pro pack for a signed-in subscriber — claims one pack from their period allowance. */
export async function POST(request: Request) {
  if (!isStorageConfigured()) {
    return NextResponse.json({ ok: false, reason: "storage-not-configured" }, { status: 503 });
  }

  const token = getAccountTokenFromRequest(request);

  if (!token) return NextResponse.json({ ok: false, reason: "not-signed-in" }, { status: 401 });

  const record = await getCustomerRecord(token);
  if (!record || record.status !== "active") {
    return NextResponse.json({ ok: false, reason: "no-active-subscription" }, { status: 403 });
  }
  if (!hasPacksRemaining(record)) {
    return NextResponse.json({ ok: false, reason: "limit-reached" }, { status: 403 });
  }

  const updated = await incrementPacksUsed(token);
  return NextResponse.json({ ok: true, packsUsedThisPeriod: updated?.packsUsedThisPeriod ?? record.packsUsedThisPeriod + 1 });
}
