import Image from "next/image";
import Link from "next/link";
import { PricingCards } from "@/components/PricingCards";

const HOW_IT_WORKS = [
  {
    src: "/screenshots/01-intake.png",
    step: "1. Tell us about the business",
    caption: "Website URL, logo, and the basics — name, tagline, contact details.",
  },
  {
    src: "/screenshots/02-brand.png",
    step: "2. We read your existing brand",
    caption: "Real colours and fonts pulled from your website and logo — not a random guess.",
  },
  {
    src: "/screenshots/03-concepts.png",
    step: "3. Choose a direction",
    caption: "Three treatments of the same palette — pick the personality that fits.",
  },
  {
    src: "/screenshots/05-editor.png",
    step: "4. Fine-tune it",
    caption: "Tweak text, colours, and logo placement — every mockup updates instantly.",
  },
  {
    src: "/screenshots/04-pack.png",
    step: "5. Get your pack",
    caption: "Business cards, letterheads, social posts, and more — ready to use.",
  },
];

const USE_CASES = [
  {
    title: "Starting a new business",
    body: "No logo, no website, no brand yet? Start from your business details alone and get a complete, professional identity before you take your first customer call.",
  },
  {
    title: "A full rebrand",
    body: "Point us at your current website and logo — we'll read your existing colours and fonts, then show you three fresh directions to modernise without starting from zero.",
  },
  {
    title: "Launching a new product",
    body: "Keep your core brand but need a distinct look for a new line or campaign? Generate a matching pack in minutes instead of briefing a designer for a one-off job.",
  },
];

const OUTPUT_FORMATS = [
  { name: "Business cards", detail: "300 DPI PNG, ready to print" },
  { name: "Letterheads", detail: "PNG & editable Word" },
  { name: "Invoices", detail: "Editable Excel template" },
  { name: "Email signatures", detail: "HTML, works in Outlook & Gmail" },
  { name: "Social posts", detail: "Instagram-ready PNG" },
  { name: "Brand guidelines", detail: "Word summary" },
];

const PRO_FORMATS = [
  "Envelope & compliments slip",
  "Quote templates + rate card",
  "Facebook / LinkedIn cover banners",
  "Brand guidelines PDF",
  "Print-ready bleed + crop marks",
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center overflow-hidden px-4 py-16 sm:py-24">
      {/* Hero */}
      <section className="relative flex w-full max-w-3xl flex-col items-center text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 right-0 h-2 w-40 -rotate-6 bg-accent-2/60 blur-sm sm:w-56"
        />

        <span className="relative mb-4 rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
          AI Brand Studio — No Designer Required
        </span>
        <h1 className="relative text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">
          Build a brand
          <br />
          that hits <span className="text-accent">back.</span>
        </h1>
        <p className="relative mt-6 max-w-xl text-balance text-white/60">
          Upload a logo, answer a few questions, and walk out with business
          cards, letterheads, invoices, social kits and more — a full identity
          in minutes, not a six-week agency retainer.
        </p>

        <div className="relative mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <Link
            href="/start"
            className="flex-1 rounded-lg bg-accent px-8 py-4 text-center text-sm font-extrabold uppercase tracking-widest text-black transition hover:brightness-95"
          >
            Start Building — It&apos;s Free
          </Link>
          <Link
            href="/account"
            className="flex-1 rounded-lg border border-white/15 px-8 py-4 text-center text-sm font-semibold uppercase tracking-widest text-white/70 transition hover:border-white/40 hover:text-white"
          >
            Log In
          </Link>
        </div>

        <p className="relative mt-6 text-xs uppercase tracking-widest text-white/30">
          No designer. No agency fees. No waiting around.
        </p>
      </section>

      {/* How it works */}
      <section className="mt-28 w-full max-w-6xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">How it works</h2>
          <p className="mt-2 max-w-lg text-sm text-white/50">
            Five steps, start to finish. Every screenshot below is the actual product.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.src} className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
              <Image
                src={step.src}
                alt={step.step}
                width={1280}
                height={800}
                className="w-full border-b border-white/10"
              />
              <div className="p-4">
                <p className="text-sm font-bold text-white">{step.step}</p>
                <p className="mt-1 text-xs text-white/50">{step.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="mt-28 w-full max-w-5xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Built for whatever stage you&apos;re at</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {USE_CASES.map((useCase) => (
            <div key={useCase.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="text-base font-bold text-accent">{useCase.title}</h3>
              <p className="mt-2 text-sm text-white/60">{useCase.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="mt-28 w-full max-w-4xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Everything a real brand pack needs</h2>
          <p className="mt-2 max-w-lg text-sm text-white/50">
            Not just pretty pictures — editable documents you can actually send, print, and use.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {OUTPUT_FORMATS.map((format) => (
            <div
              key={format.name}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
            >
              <span className="text-sm font-semibold text-white">{format.name}</span>
              <span className="text-xs text-white/40">{format.detail}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Pro unlocks even more</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/60">
            {PRO_FORMATS.map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Studio add-on */}
      <section className="mt-28 flex w-full max-w-4xl flex-col items-center rounded-2xl border border-accent-2/30 bg-accent-2/5 px-6 py-12 text-center">
        <span className="mb-3 rounded-full border border-accent-2/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent-2">
          New — Ad Studio Add-On
        </span>
        <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
          Turn your brand into <span className="text-accent-2">ads that move.</span>
        </h2>
        <p className="mt-4 max-w-xl text-balance text-white/60">
          A dedicated prompt screen that generates social ad images and video
          directly with OpenAI&apos;s latest models — credit-based, no
          subscription required. Start with 5,000 credits for $6.99.
        </p>
        <div className="mt-8 grid w-full max-w-lg grid-cols-3 gap-3">
          {[
            { src: "/studio-examples/voltline-electrical.webp", alt: "VoltLine Electrical ad example" },
            { src: "/studio-examples/ember-and-oak.webp", alt: "Ember & Oak ad example" },
            { src: "/studio-examples/tidehouse-retreat.webp", alt: "Tidehouse Retreat ad example" },
          ].map((example) => (
            <div key={example.src} className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/10">
              <Image src={example.src} alt={example.alt} fill className="object-cover" />
            </div>
          ))}
        </div>
        <Link
          href="/studio"
          className="mt-8 rounded-lg bg-accent-2 px-8 py-3.5 text-sm font-extrabold uppercase tracking-widest text-black transition hover:brightness-95"
        >
          Try Ad Studio
        </Link>
      </section>

      {/* Pricing */}
      <section className="mt-28 w-full max-w-5xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Pay once, or never stop shipping brands</h2>
          <p className="mt-2 max-w-lg text-sm text-white/50">
            The free pack covers one business end-to-end. Subscribe if you&apos;re building brands for a living.
          </p>
        </div>
        <PricingCards />
      </section>

      {/* Final CTA */}
      <section className="mt-28 flex w-full max-w-3xl flex-col items-center rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-14 text-center">
        <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
          Stop briefing designers.
          <br />
          <span className="text-accent">Start shipping brands.</span>
        </h2>
        <Link
          href="/start"
          className="mt-8 rounded-lg bg-accent px-10 py-4 text-sm font-extrabold uppercase tracking-widest text-black transition hover:brightness-95"
        >
          Start Building — It&apos;s Free
        </Link>
      </section>
    </main>
  );
}
