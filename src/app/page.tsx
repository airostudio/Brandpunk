import { IntakeForm } from "@/components/IntakeForm";

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
          business cards, letterheads, invoices, social kits and more.
        </p>
      </div>

      <IntakeForm />

      <ol className="mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-white/40">
        <li>website URL</li>
        <li className="text-white/20">•</li>
        <li>upload logo</li>
        <li className="text-white/20">•</li>
        <li>business details</li>
        <li className="text-white/20">→</li>
        <li className="text-accent/80">3 brand directions</li>
      </ol>
    </main>
  );
}
