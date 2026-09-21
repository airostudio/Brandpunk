"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buildBrandAnalysis, type BrandAnalysis } from "@/lib/analyzeBrand";
import { ANALYSIS_STORAGE_KEY, INTAKE_STORAGE_KEY, type BrandIntake } from "@/lib/types";

function readStoredIntake(): BrandIntake | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(INTAKE_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as BrandIntake) : null;
}

function readStoredAnalysis(intake: BrandIntake | null): BrandAnalysis | null {
  if (typeof window === "undefined" || !intake) return null;
  const raw = window.sessionStorage.getItem(ANALYSIS_STORAGE_KEY);
  if (raw) return JSON.parse(raw) as BrandAnalysis;
  // Fallback for a direct visit to /brand without going through /analyzing.
  return buildBrandAnalysis(intake, { siteColors: [], siteFonts: [], logoColors: [] });
}

export default function BrandPage() {
  const router = useRouter();
  const [intake] = useState<BrandIntake | null>(readStoredIntake);
  const [analysis] = useState<BrandAnalysis | null>(() => readStoredAnalysis(intake));

  useEffect(() => {
    if (!intake) router.replace("/");
  }, [intake, router]);

  if (!intake || !analysis) return null;

  const { business, logo } = intake;
  const displayName = business.businessName || "Your Business";
  const websiteLabel = business.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 sm:py-24">
      <div className="mb-10 flex max-w-xl flex-col items-center text-center">
        <span className="mb-3 rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
          Step 2 of 4 — Your Brand Board
        </span>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Here&apos;s what we picked up
        </h1>
        <p className="mt-3 text-sm text-white/50">
          {analysis.source === "extracted" && websiteLabel
            ? `Colours and fonts pulled from ${websiteLabel} and your logo.`
            : analysis.source === "extracted"
              ? "Colours pulled from your logo."
              : "We couldn't read colours from your site or logo, so here's a starting palette — easy to swap."}
        </p>
      </div>

      {/* Palette + fonts summary */}
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
                alt={`${displayName} logo`}
                className="h-14 w-14 rounded-lg border border-black/10 bg-white object-contain p-1.5"
              />
            )}
            <div>
              <h2
                className="text-2xl font-extrabold uppercase tracking-wide"
                style={{ color: analysis.primaryColor, fontFamily: `"${analysis.headingFont}", sans-serif` }}
              >
                {displayName}
              </h2>
              <p
                className="text-sm"
                style={{ color: analysis.textColor, opacity: 0.7, fontFamily: `"${analysis.bodyFont}", sans-serif` }}
              >
                {analysis.toneSummary}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {[analysis.primaryColor, analysis.secondaryColor, analysis.accentColor].map((color) => (
              <div key={color} className="flex items-center gap-2 rounded-full bg-black/5 px-3 py-1.5">
                <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                <span className="font-mono text-xs" style={{ color: analysis.textColor }}>
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
                style={{ backgroundColor: analysis.primaryColor, color: analysis.backgroundColor }}
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="text-xs" style={{ color: analysis.textColor, opacity: 0.6 }}>
            Heading font: {analysis.headingFont} &nbsp;·&nbsp; Body font: {analysis.bodyFont}
          </p>
        </div>
      </section>

      {/* Mockup board */}
      <section className="mt-14 w-full max-w-5xl">
        <h3 className="mb-6 text-center text-xl font-bold text-white">
          What your brand pack will look like
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <BusinessCardMockup analysis={analysis} name={displayName} intake={intake} />
          <LetterheadMockup analysis={analysis} name={displayName} intake={intake} />
          <SocialPostMockup analysis={analysis} name={displayName} intake={intake} />
        </div>
      </section>

      <div className="mt-10 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
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
          Start Over
        </Link>
      </div>

      <p className="mt-4 max-w-md text-center text-xs text-white/30">
        Next up: three full brand-pack concepts with business cards,
        letterheads, and social mockups — coming in the next iteration.
      </p>
    </main>
  );
}

type MockupProps = {
  analysis: BrandAnalysis;
  name: string;
  intake: BrandIntake;
};

function MockupFrame({
  label,
  aspect,
  children,
}: {
  label: string;
  aspect: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`w-full overflow-hidden rounded-xl border border-white/10 shadow-lg ${aspect}`}>
        {children}
      </div>
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-white/50">{label}</p>
    </div>
  );
}

function LogoBadge({ logo, name }: { logo: BrandIntake["logo"]; name: string }) {
  if (!logo) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded bg-black/10 text-[10px] font-bold">
        {name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logo.dataUrl} alt={`${name} logo`} className="h-8 w-8 rounded bg-white object-contain p-1" />
  );
}

function BusinessCardMockup({ analysis, name, intake }: MockupProps) {
  return (
    <MockupFrame label="Business Card" aspect="aspect-[1.75/1]">
      <div
        className="flex h-full w-full flex-col justify-between p-5"
        style={{ backgroundColor: analysis.backgroundColor, color: analysis.textColor }}
      >
        <div className="flex items-center gap-2">
          <LogoBadge logo={intake.logo} name={name} />
          <span
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: analysis.primaryColor, fontFamily: `"${analysis.headingFont}", sans-serif` }}
          >
            {name}
          </span>
        </div>
        <div
          className="h-0.5 w-10 rounded-full"
          style={{ backgroundColor: analysis.accentColor }}
        />
        <div className="text-[11px] leading-relaxed" style={{ fontFamily: `"${analysis.bodyFont}", sans-serif`, opacity: 0.85 }}>
          {intake.business.phone && <p>{intake.business.phone}</p>}
          {intake.business.email && <p>{intake.business.email}</p>}
          {intake.business.websiteUrl && <p>{intake.business.websiteUrl.replace(/^https?:\/\//, "")}</p>}
        </div>
      </div>
    </MockupFrame>
  );
}

function LetterheadMockup({ analysis, name, intake }: MockupProps) {
  return (
    <MockupFrame label="Letterhead" aspect="aspect-[3/4]">
      <div
        className="flex h-full w-full flex-col p-5"
        style={{ backgroundColor: analysis.backgroundColor, color: analysis.textColor }}
      >
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: analysis.accentColor }}>
          <div className="flex items-center gap-2">
            <LogoBadge logo={intake.logo} name={name} />
            <span
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: analysis.primaryColor, fontFamily: `"${analysis.headingFont}", sans-serif` }}
            >
              {name}
            </span>
          </div>
        </div>
        <div className="mt-5 flex flex-1 flex-col gap-2 opacity-30">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-1.5 rounded-full" style={{ backgroundColor: analysis.textColor, width: `${90 - i * 6}%` }} />
          ))}
        </div>
        <p className="mt-3 text-[10px]" style={{ opacity: 0.6, fontFamily: `"${analysis.bodyFont}", sans-serif` }}>
          {intake.business.address || intake.business.email}
        </p>
      </div>
    </MockupFrame>
  );
}

function SocialPostMockup({ analysis, name, intake }: MockupProps) {
  return (
    <MockupFrame label="Instagram Post" aspect="aspect-square">
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center"
        style={{ backgroundColor: analysis.primaryColor }}
      >
        <div className="rounded-full bg-white/95 p-2">
          <LogoBadge logo={intake.logo} name={name} />
        </div>
        <p
          className="text-base font-extrabold uppercase leading-tight"
          style={{ color: analysis.backgroundColor, fontFamily: `"${analysis.headingFont}", sans-serif` }}
        >
          {intake.business.tagline || name}
        </p>
        <span
          className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
          style={{ backgroundColor: analysis.accentColor, color: analysis.primaryColor }}
        >
          {name}
        </span>
      </div>
    </MockupFrame>
  );
}
