"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { INTAKE_STORAGE_KEY } from "@/lib/types";

const STEPS = [
  "Scanning your website…",
  "Extracting colours & typography…",
  "Reading your logo's visual style…",
  "Sketching three brand directions…",
];

export default function AnalyzingPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(INTAKE_STORAGE_KEY);
    if (!raw) {
      router.replace("/");
      return;
    }

    const stepTimer = window.setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 500);

    const redirectTimer = window.setTimeout(() => {
      router.push("/brand");
    }, 2200);

    return () => {
      window.clearInterval(stepTimer);
      window.clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <main className="halftone flex flex-1 flex-col items-center justify-center gap-8 px-4 py-24 text-center">
      <span className="font-marker flicker -rotate-2 text-2xl text-accent-2 sm:text-3xl">
        cutting it up…
      </span>
      <div className="h-3 w-64 border-2 border-foreground bg-black/40">
        <div className="h-full w-1/2 animate-[loading_1.4s_ease-in-out_infinite] bg-accent" />
      </div>
      <p className="font-mono text-sm uppercase tracking-widest text-foreground/70">{STEPS[stepIndex]}</p>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
    </main>
  );
}
