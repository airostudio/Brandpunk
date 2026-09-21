"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { analyzeBrand, type BrandAnalysis } from "@/lib/analyzeBrand";
import { INTAKE_STORAGE_KEY, type BrandIntake } from "@/lib/types";

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
    <main className="flex flex-1 flex-col items-center px-4 py-16 sm:py-24">
      <div className="mb-10 flex max-w-xl flex-col items-center text-center">
        <span className="mb-3 rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
          Step 2 of 4 — Confirm the brand
        </span>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Here&apos;s what we picked up
        </h1>
        <p className="mt-3 text-sm text-white/50">
          A first pass from your website and logo. Nothing&apos;s locked in yet.
        </p>
      </div>

      <section
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10"
        style={{ backgroundColor: analysis.backgroundColor }}
      >
        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo.dataUrl}
                alt={`${business.businessName} logo`}
                className="h-14 w-14 rounded-lg border border-black/10 bg-white object-contain p-1.5"
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
              <div key={color} className="flex items-center gap-2 rounded-full bg-black/5 px-3 py-1.5">
                <span
                  className="h-4 w-4 rounded-full border border-black/10"
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
                className="rounded-full px-3 py-1 text-xs font-semibold"
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
      </section>

      <div className="mt-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled
          title="Full concept generation is coming next"
          className="flex-1 cursor-not-allowed rounded-lg bg-accent px-6 py-3.5 text-center text-sm font-extrabold uppercase tracking-widest text-black opacity-50"
        >
          Looks Good → Continue
        </button>
        <Link
          href="/"
          className="flex-1 rounded-lg border border-white/15 px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-widest text-white/70 transition hover:border-white/40 hover:text-white"
        >
          Change Colours
        </Link>
      </div>

      <p className="mt-4 max-w-md text-center text-xs text-white/30">
        Next up: three full brand-pack concepts with business cards,
        letterheads, and social mockups — coming in the next iteration.
      </p>
    </main>
  );
}
