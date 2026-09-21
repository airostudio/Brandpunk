"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { analyzeBrand, type BrandAnalysis } from "@/lib/analyzeBrand";
import { INTAKE_STORAGE_KEY, type BrandIntake } from "@/lib/types";
import { StickerBadge } from "@/components/punk/StickerBadge";
import { Tape } from "@/components/punk/Tape";

function readIntake(): BrandIntake | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(INTAKE_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as BrandIntake) : null;
}

export default function BrandPage() {
  const router = useRouter();
  const [intake] = useState<BrandIntake | null>(readIntake);

  useEffect(() => {
    if (!intake) {
      router.replace("/");
    }
  }, [intake, router]);

  const analysis: BrandAnalysis | null = useMemo(
    () => (intake ? analyzeBrand(intake) : null),
    [intake],
  );

  if (!intake || !analysis) {
    return null;
  }

  const { business, logo } = intake;

  return (
    <main className="halftone flex flex-1 flex-col items-center px-4 py-16 sm:py-24">
      <div className="mb-10 flex max-w-xl flex-col items-center text-center">
        <StickerBadge rotate={-3} color="accent-2">
          step 2 of 4 — confirm the brand
        </StickerBadge>
        <h1 className="font-display mt-4 text-3xl uppercase sm:text-4xl">
          Here&apos;s What We <span className="text-accent">Ripped Off</span> Your Site
        </h1>
        <p className="font-mono mt-3 text-xs text-foreground/50 sm:text-sm">
          a first pass from your website and logo. nothing&apos;s locked in yet.
        </p>
      </div>

      <section className="relative w-full max-w-2xl">
        <Tape className="left-8 -top-3 z-10 hidden sm:block" rotate={-6} />
        <Tape className="right-10 -top-3 z-10 hidden sm:block" rotate={5} />

        <div
          className="w-full overflow-hidden border-4 border-ink shadow-[8px_8px_0_0_var(--ink)]"
          style={{ backgroundColor: analysis.backgroundColor }}
        >
          <div className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="flex items-center gap-4">
              {logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo.dataUrl}
                  alt={`${business.businessName} logo`}
                  className="h-14 w-14 border-2 border-black/10 bg-white object-contain p-1.5"
                />
              )}
              <div>
                <h2
                  className="text-2xl font-extrabold uppercase tracking-wide"
                  style={{ color: analysis.primaryColor, fontFamily: `"${analysis.headingFont}", sans-serif` }}
                >
                  {business.businessName}
                </h2>
                <p className="text-sm" style={{ color: analysis.secondaryColor, fontFamily: `"${analysis.bodyFont}", sans-serif` }}>
                  {analysis.toneSummary}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {[analysis.primaryColor, analysis.secondaryColor, analysis.accentColor].map((color) => (
                <div key={color} className="flex items-center gap-2 border border-black/10 bg-black/5 px-3 py-1.5">
                  <span
                    className="h-4 w-4 border border-black/10"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-mono text-xs" style={{ color: analysis.primaryColor }}>
                    {color}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {analysis.styleTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: analysis.primaryColor,
                    color: analysis.backgroundColor,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <p
              className="text-xs"
              style={{ color: analysis.secondaryColor, fontFamily: `"${analysis.headingFont}", sans-serif` }}
            >
              Heading font: {analysis.headingFont} &nbsp;·&nbsp; Body font: {analysis.bodyFont}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-10 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled
          title="Full concept generation is coming next"
          className="font-display sticker-shadow flex-1 cursor-not-allowed border-4 border-ink bg-accent px-6 py-4 text-center text-base uppercase tracking-wide text-ink opacity-50"
        >
          Looks Good → Continue
        </button>
        <Link
          href="/"
          className="font-display flex-1 border-4 border-foreground/30 px-6 py-4 text-center text-base uppercase tracking-wide text-foreground/70 transition hover:border-accent-2 hover:text-foreground"
        >
          Change Colours
        </Link>
      </div>

      <p className="font-mono mt-6 max-w-md text-center text-xs text-foreground/30">
        Next up: three full brand-pack concepts with business cards,
        letterheads, and social mockups — coming in the next iteration.
      </p>
    </main>
  );
}
