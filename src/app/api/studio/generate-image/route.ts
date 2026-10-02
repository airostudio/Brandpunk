import { NextResponse } from "next/server";
import { deductCredits, getAccountTokenFromRequest, getCustomerRecord, IMAGE_CREDIT_COST, isStorageConfigured, refundCredits } from "@/lib/billing";
import { generateAdImage } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ ok: false, reason: "openai-not-configured" }, { status: 503 });
  }
  if (!isStorageConfigured()) {
    return NextResponse.json({ ok: false, reason: "storage-not-configured" }, { status: 503 });
  }

  const token = getAccountTokenFromRequest(request);
  if (!token) return NextResponse.json({ ok: false, reason: "not-signed-in" }, { status: 401 });

  const record = await getCustomerRecord(token);
  if (!record) return NextResponse.json({ ok: false, reason: "not-signed-in" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { prompt?: string };
  const prompt = (body.prompt ?? "").trim().slice(0, 2000);
  if (!prompt) return NextResponse.json({ ok: false, reason: "missing-prompt" }, { status: 400 });

  if (record.creditsBalance < IMAGE_CREDIT_COST) {
    return NextResponse.json({ ok: false, reason: "insufficient-credits", creditsBalance: record.creditsBalance }, { status: 402 });
  }

  const afterDeduct = await deductCredits(token, IMAGE_CREDIT_COST);
  if (!afterDeduct) {
    return NextResponse.json({ ok: false, reason: "insufficient-credits", creditsBalance: record.creditsBalance }, { status: 402 });
  }

  try {
    const { base64 } = await generateAdImage(prompt);
    return NextResponse.json({ ok: true, imageBase64: base64, creditsBalance: afterDeduct.creditsBalance });
  } catch (err) {
    await refundCredits(token, IMAGE_CREDIT_COST);
    console.error("Ad Studio image generation failed", err);
    return NextResponse.json({ ok: false, reason: "generation-failed", creditsBalance: record.creditsBalance }, { status: 502 });
  }
}
