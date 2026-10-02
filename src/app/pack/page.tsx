"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { BrandConcept } from "@/lib/generateConcepts";
import { downloadBrandPack } from "@/lib/exportPack";
import { CONCEPT_STORAGE_KEY, INTAKE_STORAGE_KEY, PLAN_STORAGE_KEY, type BrandIntake, type PlanTier } from "@/lib/types";
import { DeskScene } from "@/components/DeskScene";
import { BusinessCardArt, CoverBannerArt, LetterheadArt, SocialPostArt } from "@/components/BrandMockups";
import { UpgradeModal } from "@/components/UpgradeModal";
import { CARD_SIZE, FB_COVER_SIZE, LETTERHEAD_SIZE, LINKEDIN_COVER_SIZE, SOCIAL_SIZE } from "@/lib/mockupSizes";

function readStored<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

const FREE_ASSETS = [
  "Business card (300 DPI PNG)",
  "Letterhead (300 DPI PNG + Word)",
  "Instagram post (PNG)",
  "Invoice template (Excel)",
  "Email signature (HTML)",
  "Brand guidelines (Word)",
];

const PRO_ASSETS = [
  "Envelope & compliments slip (Word)",
  "Quote template + rate card (Excel)",
  "Facebook / LinkedIn cover banners",
  "Brand guidelines (PDF)",
  "Print-ready exports (bleed + crop marks)",
];

export default function PackPage() {
  const router = useRouter();
  const [intake] = useState<BrandIntake | null>(() => readStored<BrandIntake>(INTAKE_STORAGE_KEY));
  const [concept] = useState<BrandConcept | null>(() => readStored<BrandConcept>(CONCEPT_STORAGE_KEY));
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [tier, setTier] = useState<PlanTier>(() => readStored<PlanTier>(PLAN_STORAGE_KEY) ?? "free");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const businessCardRef = useRef<HTMLDivElement>(null);
  const letterheadRef = useRef<HTMLDivElement>(null);
  const socialPostRef = useRef<HTMLDivElement>(null);
  const fbCoverRef = useRef<HTMLDivElement>(null);
  const linkedinCoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!intake || !concept) router.replace("/");
  }, [intake, concept, router]);

  if (!intake || !concept) return null;

  const displayName = intake.business.businessName || "Your Business";
  const isPro = tier === "pro";

  function unlockPro() {
    setTier("pro");
    window.sessionStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify("pro"));
    setShowUpgrade(false);
  }

  async function handleDownload() {
    if (!businessCardRef.current || !letterheadRef.current || !socialPostRef.current || !intake || !concept) return;
    setStatus("working");
    try {
      await downloadBrandPack({
        intake,
        analysis: concept.analysis,
        conceptName: concept.name,
        name: displayName,
        tier,
        nodes: {
          businessCard: businessCardRef.current,
          letterhead: letterheadRef.current,
          socialPost: socialPostRef.current,
          fbCover: isPro ? fbCoverRef.current ?? undefined : undefined,
          linkedinCover: isPro ? linkedinCoverRef.current ?? undefined : undefined,
        },
      });
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 sm:py-24">
      <div className="mb-12 flex max-w-xl flex-col items-center text-center">
        <span className="mb-3 rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
          Step 4 of 4 — {concept.name} Is Locked In
        </span>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {displayName}&apos;s brand pack
        </h1>
        <p className="mt-3 text-sm text-white/50">
          Here&apos;s your chosen direction, ready to download.
        </p>
      </div>

      <div className="w-full max-w-4xl">
        <DeskScene analysis={concept.analysis} name={displayName} intake={intake} />
      </div>

      {/* Hidden, un-rotated renders used only to capture clean export images */}
      <div className="pointer-events-none fixed left-[-9999px] top-0" aria-hidden="true">
        <div ref={businessCardRef} style={{ ...CARD_SIZE, overflow: "hidden" }}>
          <BusinessCardArt analysis={concept.analysis} name={displayName} intake={intake} />
        </div>
        <div ref={letterheadRef} style={{ ...LETTERHEAD_SIZE, overflow: "hidden" }}>
          <LetterheadArt analysis={concept.analysis} name={displayName} intake={intake} />
        </div>
        <div ref={socialPostRef} style={{ ...SOCIAL_SIZE, overflow: "hidden" }}>
          <SocialPostArt analysis={concept.analysis} name={displayName} intake={intake} />
        </div>
        <div ref={fbCoverRef} style={{ ...FB_COVER_SIZE, overflow: "hidden" }}>
          <CoverBannerArt analysis={concept.analysis} name={displayName} intake={intake} />
        </div>
        <div ref={linkedinCoverRef} style={{ ...LINKEDIN_COVER_SIZE, overflow: "hidden" }}>
          <CoverBannerArt analysis={concept.analysis} name={displayName} intake={intake} />
        </div>
      </div>

      <div className="mt-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleDownload}
          disabled={status === "working"}
          className="flex-1 rounded-lg bg-accent px-8 py-3 text-center text-sm font-extrabold uppercase tracking-widest text-black transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60"
        >
          {status === "working" ? "Building Your Pack…" : `Download Brand Pack (ZIP)${isPro ? " — Pro" : ""}`}
        </button>
        <Link
          href="/editor"
          className="flex-1 rounded-lg border border-white/15 px-8 py-3 text-center text-sm font-semibold uppercase tracking-widest text-white/70 transition hover:border-white/40 hover:text-white"
        >
          Edit This Design
        </Link>
      </div>
      {status === "error" && (
        <p className="mt-3 text-sm text-accent-2">
          Something went wrong building the pack — try again.
        </p>
      )}

      <section className="mt-10 w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/70">What&apos;s in the ZIP</h2>
        <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-white/60 sm:grid-cols-2">
          {FREE_ASSETS.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">
            {isPro ? "Pro assets — unlocked" : "Pro assets"}
          </h3>
          {!isPro && (
            <button
              type="button"
              onClick={() => setShowUpgrade(true)}
              className="rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent transition hover:bg-accent/10"
            >
              Unlock Pro
            </button>
          )}
        </div>
        <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {PRO_ASSETS.map((item) => (
            <li
              key={item}
              className={`flex items-center gap-2 ${isPro ? "text-white/60" : "text-white/40"}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isPro ? "bg-accent" : "bg-white/20"}`} />
              {!isPro && <span aria-hidden="true">🔒</span>}
              {item}
            </li>
          ))}
        </ul>
      </section>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} onUnlock={unlockPro} />}

      <Link
        href="/"
        className="mt-10 rounded-lg border border-white/15 px-6 py-3 text-center text-sm font-semibold uppercase tracking-widest text-white/70 transition hover:border-white/40 hover:text-white"
      >
        Start a New Brand Pack
      </Link>
    </main>
  );
}
