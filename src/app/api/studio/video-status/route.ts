import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getVideoJob, isStorageConfigured, markVideoJobMirrored, refundVideoJobOnce, VIDEO_CREDIT_COST } from "@/lib/billing";
import { downloadAdVideo, getAdVideoStatus } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isStorageConfigured()) {
    return NextResponse.json({ ok: false, reason: "storage-not-configured" }, { status: 503 });
  }

  const videoId = new URL(request.url).searchParams.get("id");
  if (!videoId) return NextResponse.json({ ok: false, reason: "missing-id" }, { status: 400 });

  try {
    const job = await getVideoJob(videoId);
    if (!job) return NextResponse.json({ ok: false, reason: "unknown-job" }, { status: 404 });

    const status = await getAdVideoStatus(videoId);

    if (status.status === "failed") {
      await refundVideoJobOnce(videoId, VIDEO_CREDIT_COST);
      return NextResponse.json({ ok: true, status: "failed", errorMessage: status.errorMessage });
    }

    if (status.status !== "completed") {
      return NextResponse.json({ ok: true, status: status.status, progress: status.progress });
    }

    if (job.mirroredUrl) {
      return NextResponse.json({ ok: true, status: "completed", videoUrl: job.mirroredUrl });
    }

    // Mirror into our own storage so the result survives past OpenAI's own
    // retention window and doesn't need another OpenAI call to re-download.
    const { bytes, contentType } = await downloadAdVideo(videoId);
    const blob = await put(`studio-videos/${videoId}.mp4`, Buffer.from(bytes), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
    });
    await markVideoJobMirrored(videoId, blob.url);

    return NextResponse.json({ ok: true, status: "completed", videoUrl: blob.url });
  } catch (err) {
    console.error("Ad Studio video status check failed", err);
    return NextResponse.json({ ok: false, reason: "status-check-failed" }, { status: 502 });
  }
}
