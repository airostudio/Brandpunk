import OpenAI from "openai";

let client: OpenAI | null = null;

/** Lazily constructed so builds without OPENAI_API_KEY set don't crash at import time. */
export function getOpenAI(): OpenAI {
  if (!client) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error("OPENAI_API_KEY is not set");
    client = new OpenAI({ apiKey: key });
  }
  return client;
}

/**
 * Model names are env-configurable rather than hardcoded so "best" can be
 * swapped in the moment OpenAI ships a better one, with no code change —
 * just update the env var. Defaults are the top-of-line model in each
 * family as of this writing.
 */
export function imageModel(): string {
  return process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
}

export function videoModel(): string {
  return process.env.OPENAI_VIDEO_MODEL || "sora-2-pro";
}

export async function generateAdImage(prompt: string): Promise<{ base64: string }> {
  const openai = getOpenAI();
  const result = await openai.images.generate({
    model: imageModel(),
    prompt,
    size: "1024x1024",
    n: 1,
  });
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI returned no image data");
  return { base64: b64 };
}

export type VideoJobStatus = "queued" | "in_progress" | "completed" | "failed";

export async function createAdVideoJob(prompt: string): Promise<{ videoId: string; status: VideoJobStatus }> {
  const openai = getOpenAI();
  const video = await openai.videos.create({
    model: videoModel(),
    prompt,
    seconds: "4",
    size: "1280x720",
  });
  return { videoId: video.id, status: video.status };
}

export async function getAdVideoStatus(
  videoId: string,
): Promise<{ status: VideoJobStatus; progress: number; errorMessage: string | null }> {
  const openai = getOpenAI();
  const video = await openai.videos.retrieve(videoId);
  return { status: video.status, progress: video.progress, errorMessage: video.error?.message ?? null };
}

export async function downloadAdVideo(videoId: string): Promise<{ bytes: Uint8Array; contentType: string }> {
  const openai = getOpenAI();
  const response = await openai.videos.downloadContent(videoId);
  const arrayBuffer = await response.arrayBuffer();
  return { bytes: new Uint8Array(arrayBuffer), contentType: response.headers.get("content-type") || "video/mp4" };
}
