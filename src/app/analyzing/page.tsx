"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buildBrandAnalysis, type BrandSignals } from "@/lib/analyzeBrand";
import { extractLogoColors } from "@/lib/extractLogoColors";
import { ANALYSIS_STORAGE_KEY, INTAKE_STORAGE_KEY, type BrandIntake } from "@/lib/types";

const STEPS = [
  "Scanning your website…",
  "Extracting colours & typography…",
  "Reading your logo's visual style…",
  "Sketching your brand board…",
];

async function fetchSiteSignals(websiteUrl: string): Promise<{ colors: string[]; fonts: string[] }> {
  if (!websiteUrl.trim()) return { colors: [], fonts: [] };
  try {
    const res = await fetch("/api/analyze-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: websiteUrl }),
    });
    if (!res.ok) return { colors: [], fonts: [] };
    const data = (await res.json()) as { ok: boolean; colors?: string[]; fonts?: string[] };
    return { colors: data.colors ?? [], fonts: data.fonts ?? [] };
  } catch {
    return { colors: [], fonts: [] };
  }
}

export default function AnalyzingPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(INTAKE_STORAGE_KEY);
    if (!raw) {
      router.replace("/");
      return;
    }
    const intake = JSON.parse(raw) as BrandIntake;

    const stepTimer = window.setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 700);

    let cancelled = false;

    (async () => {
      const minDuration = new Promise((resolve) => window.setTimeout(resolve, 1600));

      const [siteSignals, logoColors] = await Promise.all([
        fetchSiteSignals(intake.business.websiteUrl),
        intake.logo ? extractLogoColors(intake.logo.dataUrl).catch(() => []) : Promise.resolve([]),
      ]);

      await minDuration;
      if (cancelled) return;

      const signals: BrandSignals = {
        siteColors: siteSignals.colors,
        siteFonts: siteSignals.fonts,
        logoColors,
      };
      const analysis = buildBrandAnalysis(intake, signals);

      window.sessionStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(analysis));
      router.push("/brand");
    })();

    return () => {
      cancelled = true;
      window.clearInterval(stepTimer);
    };
  }, [router]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-24 text-center">
      <div className="h-2 w-64 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/2 animate-[loading_1.4s_ease-in-out_infinite] rounded-full bg-accent" />
      </div>
      <p className="text-lg font-medium text-white/80">{STEPS[stepIndex]}</p>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
    </main>
  );
}
