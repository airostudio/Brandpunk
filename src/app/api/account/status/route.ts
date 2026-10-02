import { NextResponse } from "next/server";
import { ACCOUNT_COOKIE_NAME, allowanceForPlan, getCustomerRecord, hasPacksRemaining } from "@/lib/billing";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${ACCOUNT_COOKIE_NAME}=`))
    ?.slice(ACCOUNT_COOKIE_NAME.length + 1);

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
  });
}
