"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { BrandConcept } from "@/lib/generateConcepts";
import { CONCEPT_STORAGE_KEY, INTAKE_STORAGE_KEY, type BrandIntake } from "@/lib/types";
import { BusinessCardMockup, LetterheadMockup, SocialPostMockup } from "@/components/BrandMockups";

function readStored<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

const UPCOMING_ASSETS = [
  "Envelope & compliment slip",
  "Email signature (HTML)",
  "Quote & invoice templates",
  "Facebook / LinkedIn cover banners",
  "Brand guidelines PDF",
  "Print-ready (CMYK, bleed, crop marks) exports",
];

export default function PackPage() {
  const router = useRouter();
  const [intake] = useState<BrandIntake | null>(() => readStored<BrandIntake>(INTAKE_STORAGE_KEY));
  const [concept] = useState<BrandConcept | null>(() => readStored<BrandConcept>(CONCEPT_STORAGE_KEY));

  useEffect(() => {
    if (!intake || !concept) router.replace("/");
  }, [intake, concept, router]);

  if (!intake || !concept) return null;

  const displayName = intake.business.businessName || "Your Business";

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
          Here&apos;s your chosen direction, ready to become the full pack.
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        <BusinessCardMockup analysis={concept.analysis} name={displayName} intake={intake} />
        <LetterheadMockup analysis={concept.analysis} name={displayName} intake={intake} />
        <SocialPostMockup analysis={concept.analysis} name={displayName} intake={intake} />
      </div>

      <Link
        href="/editor"
        className="mt-8 rounded-lg bg-accent px-8 py-3 text-center text-sm font-extrabold uppercase tracking-widest text-black transition hover:brightness-95"
      >
        Edit This Design
      </Link>

      <section className="mt-10 w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/70">
          Coming next in the full pack
        </h2>
        <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-white/60 sm:grid-cols-2">
          {UPCOMING_ASSETS.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-white/30">
          This preview stops here for now — full asset generation and downloads are the next
          build milestone.
        </p>
      </section>

      <Link
        href="/"
        className="mt-10 rounded-lg border border-white/15 px-6 py-3 text-center text-sm font-semibold uppercase tracking-widest text-white/70 transition hover:border-white/40 hover:text-white"
      >
        Start a New Brand Pack
      </Link>
    </main>
  );
}
