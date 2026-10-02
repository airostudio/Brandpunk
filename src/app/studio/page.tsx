"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { CREDIT_PACKS, IMAGE_CREDIT_COST, VIDEO_CREDIT_COST } from "@/lib/plans";

type Mode = "image" | "video";
type VideoStatus = "queued" | "in_progress" | "completed" | "failed";

type AccountStatus = { signedIn: boolean; creditsBalance?: number };

const CREDIT_PACK = CREDIT_PACKS.starter;

export default function StudioPage() {
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [mode, setMode] = useState<Mode>("image");
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<VideoStatus | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [buyingCredits, setBuyingCredits] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const credits = accountStatus?.creditsBalance ?? 0;
  const cost = mode === "image" ? IMAGE_CREDIT_COST : VIDEO_CREDIT_COST;
  const canAfford = credits >= cost;

  async function refreshAccountStatus() {
    try {
      const res = await fetch("/api/account/status");
      const data = await res.json();
      if (data.ok) setAccountStatus(data);
    } catch {
      // Leave accountStatus as-is — the page just shows 0 credits if this can't be reached.
    }
  }

  useEffect(() => {
    (async () => {
      await refreshAccountStatus();
      const params = new URLSearchParams(window.location.search);
      const creditsSessionId = params.get("credits_session_id");
      if (!creditsSessionId) return;
      try {
        await fetch(`/api/checkout/verify?credits_session_id=${creditsSessionId}`);
        await refreshAccountStatus();
      } finally {
        window.history.replaceState(null, "", "/studio");
      }
    })();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
     
  }, []);

  async function buyCredits() {
    setBuyingCredits(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId: "starter" }),
      });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.assign(data.url);
      } else {
        setError("Payments aren't set up on this deployment yet.");
        setBuyingCredits(false);
      }
    } catch {
      setError("Something went wrong starting checkout — try again.");
      setBuyingCredits(false);
    }
  }

  async function generateImage() {
    const res = await fetch("/api/studio/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(
        data.reason === "insufficient-credits"
          ? "Not enough credits for an image — buy more below."
          : data.reason === "openai-not-configured"
            ? "Ad Studio isn't fully set up on this deployment yet."
            : "Image generation failed — try again.",
      );
      if (typeof data.creditsBalance === "number") setAccountStatus((prev) => ({ ...prev, signedIn: true, creditsBalance: data.creditsBalance }));
      return;
    }
    setResultImage(data.imageBase64);
    setAccountStatus((prev) => ({ ...prev, signedIn: true, creditsBalance: data.creditsBalance }));
  }

  async function generateVideo() {
    const res = await fetch("/api/studio/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(
        data.reason === "insufficient-credits"
          ? "Not enough credits for a video — buy more below."
          : data.reason === "openai-not-configured"
            ? "Ad Studio isn't fully set up on this deployment yet."
            : "Video generation failed — try again.",
      );
      if (typeof data.creditsBalance === "number") setAccountStatus((prev) => ({ ...prev, signedIn: true, creditsBalance: data.creditsBalance }));
      return;
    }
    setAccountStatus((prev) => ({ ...prev, signedIn: true, creditsBalance: data.creditsBalance }));
    setVideoStatus(data.status);
    setVideoProgress(0);

    pollRef.current = setInterval(async () => {
      try {
        const statusRes = await fetch(`/api/studio/video-status?id=${data.videoId}`);
        const statusData = await statusRes.json();
        if (!statusData.ok) return;
        setVideoStatus(statusData.status);
        if (typeof statusData.progress === "number") setVideoProgress(statusData.progress);
        if (statusData.status === "completed") {
          setResultVideoUrl(statusData.videoUrl);
          if (pollRef.current) clearInterval(pollRef.current);
          setGenerating(false);
        } else if (statusData.status === "failed") {
          setError(statusData.errorMessage || "Video generation failed — your credits were refunded.");
          await refreshAccountStatus();
          if (pollRef.current) clearInterval(pollRef.current);
          setGenerating(false);
        }
      } catch {
        // Transient network error — keep polling, the interval will try again.
      }
    }, 4000);
  }

  async function handleGenerate() {
    if (!prompt.trim() || generating || !canAfford) return;
    setGenerating(true);
    setError(null);
    setResultImage(null);
    setResultVideoUrl(null);
    setVideoStatus(null);
    try {
      if (mode === "image") {
        await generateImage();
        setGenerating(false);
      } else {
        await generateVideo();
        // generating stays true until polling resolves it
      }
    } catch {
      setError("Something went wrong — try again.");
      setGenerating(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 sm:py-24">
      <div className="mb-10 flex max-w-xl flex-col items-center text-center">
        <span className="mb-4 rounded-full border border-accent-2/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent-2">
          Ad Studio — Add-On
        </span>
        <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
          Adverts, built by <span className="text-accent-2">AI</span>.
        </h1>
        <p className="mt-4 max-w-xl text-balance text-white/60">
          Describe the ad you want. Ad Studio generates the image or video
          directly with OpenAI&apos;s latest models — credit-based, no
          subscription required.
        </p>
      </div>

      {/* Credits meter */}
      <div className="flex w-full max-w-xl items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">Credits</p>
          <p className="text-3xl font-black text-accent-2">
            <AnimatedCounter value={credits} />
          </p>
        </div>
        <button
          type="button"
          onClick={buyCredits}
          disabled={buyingCredits}
          className="rounded-lg bg-accent-2 px-5 py-3 text-xs font-extrabold uppercase tracking-widest text-black transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60"
        >
          {buyingCredits ? "Starting…" : `Buy ${CREDIT_PACK.credits.toLocaleString()} for ${CREDIT_PACK.priceDisplay}`}
        </button>
      </div>

      {/* Prompt screen */}
      <div className="mt-8 w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <div className="flex gap-2 rounded-lg border border-white/10 bg-black/30 p-1">
          <button
            type="button"
            onClick={() => setMode("image")}
            className={`flex-1 rounded-md py-2 text-xs font-bold uppercase tracking-widest transition ${
              mode === "image" ? "bg-accent-2 text-black" : "text-white/60 hover:text-white"
            }`}
          >
            Image ({IMAGE_CREDIT_COST.toLocaleString()} credits)
          </button>
          <button
            type="button"
            onClick={() => setMode("video")}
            className={`flex-1 rounded-md py-2 text-xs font-bold uppercase tracking-widest transition ${
              mode === "video" ? "bg-accent-2 text-black" : "text-white/60 hover:text-white"
            }`}
          >
            Video ({VIDEO_CREDIT_COST.toLocaleString()} credits)
          </button>
        </div>

        <label className="mt-6 block text-xs font-bold uppercase tracking-widest text-white/50">
          Describe the ad
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder={
            mode === "image"
              ? "A bold Instagram ad for a neon-lit plumbing van, graffiti-style lettering, high contrast…"
              : "A 4-second product reveal: a business card spinning on a neon desk, cinematic lighting…"
          }
          className="mt-2 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-accent-2 focus:outline-none"
        />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!prompt.trim() || generating || !canAfford}
          className="mt-4 w-full rounded-lg bg-accent-2 px-6 py-3 text-center text-sm font-extrabold uppercase tracking-widest text-black transition hover:brightness-95 disabled:cursor-wait disabled:opacity-50"
        >
          {generating
            ? mode === "video" && videoStatus
              ? `Generating… ${videoProgress}%`
              : "Generating…"
            : !canAfford
              ? "Not Enough Credits"
              : `Generate (${cost.toLocaleString()} credits)`}
        </button>

        {error && <p className="mt-3 text-sm text-accent-2">{error}</p>}

        {resultImage && (
          <div className="mt-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/png;base64,${resultImage}`} alt="Generated ad" className="w-full rounded-lg border border-white/10" />
            <a
              href={`data:image/png;base64,${resultImage}`}
              download="brandpunk-ad.png"
              className="mt-3 block w-full rounded-lg border border-white/15 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-widest text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Download Image
            </a>
          </div>
        )}

        {resultVideoUrl && (
          <div className="mt-6">
            { }
            <video src={resultVideoUrl} controls className="w-full rounded-lg border border-white/10" />
            <a
              href={resultVideoUrl}
              download="brandpunk-ad.mp4"
              className="mt-3 block w-full rounded-lg border border-white/15 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-widest text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Download Video
            </a>
          </div>
        )}
      </div>

      <Link
        href="/"
        className="mt-10 text-xs font-semibold uppercase tracking-widest text-white/40 transition hover:text-white"
      >
        ← Back to BrandPunk
      </Link>
    </main>
  );
}
