import Image from "next/image";
import { IntakeForm } from "@/components/IntakeForm";

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
  { name: "Business cards", detail: "Print-ready, double-sided" },
  { name: "Letterheads", detail: "Word & PDF" },
  { name: "Invoices & quotes", detail: "Excel & Word templates" },
  { name: "Email signatures", detail: "HTML, works in Outlook & Gmail" },
  { name: "Social posts", detail: "Instagram, Facebook, LinkedIn" },
  { name: "Brand guidelines", detail: "PDF" },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 sm:py-24">
      <div className="mb-12 flex max-w-2xl flex-col items-center text-center">
        <span className="mb-4 rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
          BrandPunk
        </span>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          Your entire business brand.
          <br />
          <span className="text-accent">Designed at once.</span>
        </h1>
        <p className="mt-4 max-w-xl text-balance text-white/60">
          Upload your logo. Add your business. Get your entire brand pack —
          business cards, letterheads, Word &amp; Excel templates, email
          signatures, social kits and more.
        </p>
      </div>

      <IntakeForm />

      <ol className="mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-white/40">
        <li>website URL</li>
        <li className="text-white/20">{"•"}</li>
        <li>upload logo</li>
        <li className="text-white/20">{"•"}</li>
        <li>business details</li>
        <li className="text-white/20">{"→"}</li>
        <li className="text-accent/80">3 brand directions</li>
      </ol>

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
      </section>
    </main>
  );
}
