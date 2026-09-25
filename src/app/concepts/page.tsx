"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { buildBrandAnalysis, type BrandAnalysis } from "@/lib/analyzeBrand";
import { contrastTextColor, parseCssColor } from "@/lib/colorUtils";
import { generateConcepts, type BrandConcept } from "@/lib/generateConcepts";
import {
  ANALYSIS_STORAGE_KEY,
  CONCEPT_STORAGE_KEY,
  INTAKE_STORAGE_KEY,
  type BrandIntake,
} from "@/lib/types";
import { DeskScene } from "@/components/DeskScene";

function readStoredIntake(): BrandIntake | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(INTAKE_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as BrandIntake) : null;
}

function readStoredAnalysis(intake: BrandIntake | null): BrandAnalysis | null {
  if (typeof window === "undefined" || !intake) return null;
  const raw = window.sessionStorage.getItem(ANALYSIS_STORAGE_KEY);
  if (raw) return JSON.parse(raw) as BrandAnalysis;
  return buildBrandAnalysis(intake, { siteColors: [], siteFonts: [], logoColors: [] });
}

export default function ConceptsPage() {
  const router = useRouter();
  const [intake] = useState<BrandIntake | null>(readStoredIntake);
  const [analysis] = useState<BrandAnalysis | null>(() => readStoredAnalysis(intake));
  const [concepts] = useState<BrandConcept[]>(() => (analysis ? generateConcepts(analysis) : []));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!intake) router.replace("/");
  }, [intake, router]);

  if (!intake || !analysis) return null;

  const displayName = intake.business.businessName || "Your Business";

  function chooseConcept(concept: BrandConcept) {
    setSelectedId(concept.id);
    window.sessionStorage.setItem(CONCEPT_STORAGE_KEY, JSON.stringify(concept));
    router.push("/pack");
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 sm:py-24">
      <div className="mb-12 flex max-w-xl flex-col items-center text-center">
        <span className="mb-3 rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
          Step 3 of 4 — Choose Your Direction
        </span>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Three ways to wear {displayName}&apos;s colours
        </h1>
        <p className="mt-3 text-sm text-white/50">
          Same palette, three different personalities. Pick the one that feels right — you can
          fine-tune it after.
        </p>
      </div>

      <div className="flex w-full max-w-6xl flex-col gap-16">
        {concepts.map((concept, i) => (
          <section key={concept.id} className="flex flex-col items-center">
            <div className="mb-6 flex flex-col items-center text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Concept 0{i + 1}
              </span>
              <h2 className="mt-1 text-2xl font-black text-white">{concept.name}</h2>
              <p className="mt-1 max-w-md text-sm text-white/50">{concept.description}</p>
            </div>

            <div className="w-full max-w-4xl">
              <DeskScene analysis={concept.analysis} name={displayName} intake={intake} />
            </div>

            <button
              type="button"
              onClick={() => chooseConcept(concept)}
              disabled={selectedId !== null}
              className="mt-6 rounded-lg px-8 py-3 text-center text-sm font-extrabold uppercase tracking-widest transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: concept.analysis.primaryColor,
                color: contrastTextColor(parseCssColor(concept.analysis.primaryColor) ?? { r: 0, g: 0, b: 0 }),
              }}
            >
              {selectedId === concept.id ? "Locking It In…" : `Choose ${concept.name}`}
            </button>
          </section>
        ))}
      </div>

      <Link
        href="/brand"
        className="mt-16 text-xs font-semibold uppercase tracking-widest text-white/40 hover:text-white/70"
      >
        ← Back to brand board
      </Link>
    </main>
  );
}
