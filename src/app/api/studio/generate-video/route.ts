import { NextResponse } from "next/server";
import {
  deductCredits,
  getAccountTokenFromRequest,
  getCustomerRecord,
  isStorageConfigured,
  recordVideoJob,
  refundCredits,
  VIDEO_CREDIT_COST,
} from "@/lib/billing";
import { createAdVideoJob } from "@/lib/openai";

export const runtime = "nodejs";

/**
 * Only creates the video generation job and returns its ID — Sora-class
 * video jobs can take well over a minute, longer than a serverless
 * function should hold a request open. The client polls
 * /api/studio/video-status with the returned videoId instead.
 */
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

  if (record.creditsBalance < VIDEO_CREDIT_COST) {
    return NextResponse.json({ ok: false, reason: "insufficient-credits", creditsBalance: record.creditsBalance }, { status: 402 });
  }

  const afterDeduct = await deductCredits(token, VIDEO_CREDIT_COST);
  if (!afterDeduct) {
    return NextResponse.json({ ok: false, reason: "insufficient-credits", creditsBalance: record.creditsBalance }, { status: 402 });
  }

  try {
    const job = await createAdVideoJob(prompt);
    await recordVideoJob(job.videoId, token);
    return NextResponse.json({ ok: true, videoId: job.videoId, status: job.status, creditsBalance: afterDeduct.creditsBalance });
  } catch (err) {
    await refundCredits(token, VIDEO_CREDIT_COST);
    console.error("Ad Studio video job creation failed", err);
    return NextResponse.json({ ok: false, reason: "generation-failed", creditsBalance: record.creditsBalance }, { status: 502 });
  }
}
