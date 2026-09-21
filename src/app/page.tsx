import { IntakeForm } from "@/components/IntakeForm";
import { RansomText } from "@/components/punk/RansomText";
import { StickerBadge } from "@/components/punk/StickerBadge";
import { Tape } from "@/components/punk/Tape";
import { TornDivider } from "@/components/punk/TornDivider";

const PACKS = [
  { name: "Corporate", items: "Business cards, letterheads, envelopes", color: "accent" as const },
  { name: "Digital", items: "Email signatures, favicon, Zoom bg", color: "accent-2" as const },
  { name: "Sales", items: "Quotes, invoices, proposals, decks", color: "accent-3" as const },
  { name: "Marketing", items: "Social banners, ad templates, flyers", color: "accent" as const },
  { name: "Brand", items: "Guidelines, palette, logo rules", color: "accent-2" as const },
  { name: "Signage", items: "Vehicle graphics, office & reception signs", color: "accent-3" as const },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="halftone relative overflow-hidden border-b-4 border-foreground px-4 pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <StickerBadge rotate={-3} color="accent-2" className="mb-6">
            ★ your entire brand, one sitting
          </StickerBadge>

          <RansomText
            as="h1"
            text="YOUR BRAND. RIPPED UP AND REBUILT."
            className="text-4xl sm:text-6xl md:text-7xl"
          />

          <p className="font-mono mt-6 max-w-xl text-balance text-sm text-foreground/60 sm:text-base">
            Upload your logo. Add your business. Get a complete{" "}
            <span className="marker-underline font-semibold text-foreground">brand pack</span> —
            business cards, letterheads, invoices, social kits and more —
            like an agency spent a week on it.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <StickerBadge rotate={-2} color="accent">no templates</StickerBadge>
            <StickerBadge rotate={2} color="accent-3">print-ready</StickerBadge>
            <StickerBadge rotate={-1} color="accent-2">60+ assets</StickerBadge>
          </div>

          <a
            href="#brand-pack-form"
            className="font-display sticker-shadow mt-10 inline-block -rotate-1 border-4 border-ink bg-accent px-8 py-4 text-lg uppercase tracking-wide text-ink transition hover:rotate-0 hover:brightness-95 sm:text-xl"
          >
            Hey Punk, Start My Brand →
          </a>
        </div>
      </section>

      <TornDivider color="var(--background)" />

      <section id="brand-pack-form" className="relative flex flex-col items-center px-4 py-16 sm:py-20">
        <Tape className="left-6 top-2 hidden sm:block" rotate={-8} />
        <Tape className="right-8 top-6 hidden sm:block" rotate={6} />

        <div className="mb-10 flex max-w-xl flex-col items-center text-center">
          <span className="font-marker text-xl text-accent-2 sm:text-2xl">step one</span>
          <h2 className="font-display mt-1 text-3xl uppercase sm:text-4xl">
            Feed Us The Basics
          </h2>
          <p className="font-mono mt-3 text-xs text-foreground/50 sm:text-sm">
            website · logo · a few business details. that&apos;s it.
          </p>
        </div>

        <IntakeForm />

        <ol className="font-mono mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[11px] uppercase tracking-widest text-foreground/40">
          <li>website URL</li>
          <li className="text-accent-2">{"//"}</li>
          <li>upload logo</li>
          <li className="text-accent-2">{"//"}</li>
          <li>business details</li>
          <li className="text-accent">→</li>
          <li className="text-accent">3 brand directions</li>
        </ol>
      </section>

      <TornDivider color="var(--paper)" />

      <section className="bg-paper px-4 py-16 text-ink sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex flex-col items-center text-center">
            <StickerBadge rotate={2} color="accent">the full pack</StickerBadge>
            <h2 className="font-display mt-4 text-3xl uppercase sm:text-4xl">
              Everything Your Business Needs To Look Legit
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PACKS.map((pack, i) => (
              <div
                key={pack.name}
                className="border-2 border-ink bg-background/95 p-5 text-foreground shadow-[5px_5px_0_0_var(--ink)] transition hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_var(--ink)]"
                style={{ transform: `rotate(${i % 2 === 0 ? -1 : 1}deg)` }}
              >
                <p className="font-display text-xl uppercase text-accent">{pack.name}</p>
                <p className="font-mono mt-2 text-xs text-foreground/60">{pack.items}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TornDivider color="var(--background)" flip />
    </main>
  );
}
