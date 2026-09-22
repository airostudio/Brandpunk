"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import type { BrandAnalysis } from "@/lib/analyzeBrand";
import { contrastTextColor, parseCssColor } from "@/lib/colorUtils";
import type { BrandConcept } from "@/lib/generateConcepts";
import { CONCEPT_STORAGE_KEY, INTAKE_STORAGE_KEY, type BrandIntake } from "@/lib/types";
import { BusinessCardMockup, LetterheadMockup, SocialPostMockup } from "@/components/BrandMockups";

function readStored<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

type EditableFields = {
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  logoScale: number;
  logoAlign: "left" | "center";
};

function fieldsFrom(intake: BrandIntake, concept: BrandConcept): EditableFields {
  return {
    businessName: intake.business.businessName,
    tagline: intake.business.tagline,
    phone: intake.business.phone,
    email: intake.business.email,
    primaryColor: concept.analysis.primaryColor,
    secondaryColor: concept.analysis.secondaryColor,
    accentColor: concept.analysis.accentColor,
    backgroundColor: concept.analysis.backgroundColor,
    logoScale: concept.analysis.logoScale,
    logoAlign: concept.analysis.logoAlign,
  };
}

export default function EditorPage() {
  const router = useRouter();
  const [intake] = useState<BrandIntake | null>(() => readStored<BrandIntake>(INTAKE_STORAGE_KEY));
  const [concept] = useState<BrandConcept | null>(() => readStored<BrandConcept>(CONCEPT_STORAGE_KEY));
  const [fields, setFields] = useState<EditableFields | null>(() =>
    intake && concept ? fieldsFrom(intake, concept) : null,
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!intake || !concept) router.replace("/");
  }, [intake, concept, router]);

  if (!intake || !concept || !fields) return null;

  function update<K extends keyof EditableFields>(key: K, value: EditableFields[K]) {
    setFields((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  const previewIntake: BrandIntake = {
    ...intake,
    business: {
      ...intake.business,
      businessName: fields.businessName,
      tagline: fields.tagline,
      phone: fields.phone,
      email: fields.email,
    },
  };

  const previewAnalysis: BrandAnalysis = {
    ...concept.analysis,
    primaryColor: fields.primaryColor,
    secondaryColor: fields.secondaryColor,
    accentColor: fields.accentColor,
    backgroundColor: fields.backgroundColor,
    textColor: contrastTextColor(parseCssColor(fields.backgroundColor) ?? { r: 255, g: 255, b: 255 }),
    logoScale: fields.logoScale,
    logoAlign: fields.logoAlign,
  };

  const displayName = fields.businessName || "Your Business";

  function handleSave() {
    if (!intake || !concept) return;
    window.sessionStorage.setItem(INTAKE_STORAGE_KEY, JSON.stringify(previewIntake));
    window.sessionStorage.setItem(
      CONCEPT_STORAGE_KEY,
      JSON.stringify({ ...concept, analysis: previewAnalysis } satisfies BrandConcept),
    );
    setSaved(true);
  }

  return (
    <main className="flex flex-1 flex-col px-4 py-16 sm:py-20">
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="mb-3 rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
          Brand Studio — {concept.name}
        </span>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Fine-tune your design</h1>
        <p className="mt-3 max-w-md text-sm text-white/50">
          Change anything below — every mockup updates instantly.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:flex-row">
        {/* Controls */}
        <aside className="w-full shrink-0 space-y-8 lg:w-72">
          <ControlSection title="Text">
            <TextField label="Business name" value={fields.businessName} onChange={(v) => update("businessName", v)} />
            <TextField label="Tagline" value={fields.tagline} onChange={(v) => update("tagline", v)} />
            <TextField label="Phone" value={fields.phone} onChange={(v) => update("phone", v)} />
            <TextField label="Email" value={fields.email} onChange={(v) => update("email", v)} />
          </ControlSection>

          <ControlSection title="Colours">
            <ColorField label="Primary" value={fields.primaryColor} onChange={(v) => update("primaryColor", v)} />
            <ColorField label="Secondary" value={fields.secondaryColor} onChange={(v) => update("secondaryColor", v)} />
            <ColorField label="Accent" value={fields.accentColor} onChange={(v) => update("accentColor", v)} />
            <div>
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">Background</span>
              <div className="flex gap-2">
                <SegButton active={fields.backgroundColor === "#FFFFFF"} onClick={() => update("backgroundColor", "#FFFFFF")}>
                  Light
                </SegButton>
                <SegButton active={fields.backgroundColor === "#111114"} onClick={() => update("backgroundColor", "#111114")}>
                  Dark
                </SegButton>
              </div>
            </div>
          </ControlSection>

          <ControlSection title="Logo">
            <div>
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">
                Size — {Math.round(fields.logoScale * 100)}%
              </span>
              <input
                type="range"
                min={0.6}
                max={1.8}
                step={0.1}
                value={fields.logoScale}
                onChange={(e) => update("logoScale", Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">Position</span>
              <div className="flex gap-2">
                <SegButton active={fields.logoAlign === "left"} onClick={() => update("logoAlign", "left")}>
                  Left
                </SegButton>
                <SegButton active={fields.logoAlign === "center"} onClick={() => update("logoAlign", "center")}>
                  Centre
                </SegButton>
              </div>
            </div>
          </ControlSection>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-accent px-6 py-3 text-center text-sm font-extrabold uppercase tracking-widest text-black transition hover:brightness-95"
            >
              {saved ? "Saved ✓" : "Save Changes"}
            </button>
            <Link
              href="/pack"
              className="rounded-lg border border-white/15 px-6 py-3 text-center text-sm font-semibold uppercase tracking-widest text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Back to Pack
            </Link>
          </div>
        </aside>

        {/* Live preview */}
        <div className="grid flex-1 grid-cols-1 gap-6 self-start sm:grid-cols-2 xl:grid-cols-3">
          <BusinessCardMockup analysis={previewAnalysis} name={displayName} intake={previewIntake} />
          <LetterheadMockup analysis={previewAnalysis} name={displayName} intake={previewIntake} />
          <SocialPostMockup analysis={previewAnalysis} name={displayName} intake={previewIntake} />
        </div>
      </div>
    </main>
  );
}

function ControlSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 border-t border-white/10 pt-5 first:border-t-0 first:pt-0">
      <h2 className="text-xs font-bold uppercase tracking-widest text-white/70">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/50">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-accent"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-white/50">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-white/50">{value}</span>
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-7 w-7 cursor-pointer rounded border border-white/20 bg-transparent p-0"
        />
      </div>
    </div>
  );
}

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
        active
          ? "border-accent bg-accent text-black"
          : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
