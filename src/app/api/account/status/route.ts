import { NextResponse } from "next/server";
import { allowanceForPlan, getAccountTokenFromRequest, getCustomerRecord, hasPacksRemaining, isStorageConfigured } from "@/lib/billing";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isStorageConfigured()) return NextResponse.json({ ok: true, signedIn: false });

  const token = getAccountTokenFromRequest(request);

  if (!token) return NextResponse.json({ ok: true, signedIn: false });

  const record = await getCustomerRecord(token);
  if (!record) return NextResponse.json({ ok: true, signedIn: false });

  return NextResponse.json({
    ok: true,
    signedIn: true,
    planId: record.planId,
    status: record.status,
    packsUsedThisPeriod: record.packsUsedThisPeriod,
    packsPerPeriod: allowanceForPlan(record.planId),
    packsRemaining: record.status === "active" && hasPacksRemaining(record),
    periodResetAt: record.periodResetAt,
    creditsBalance: record.creditsBalance,
  });
}
