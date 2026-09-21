import Link from "next/link";

const TICKER_ITEMS = [
  "NO TEMPLATES",
  "HAND-CUT BRAND SYSTEMS",
  "ZERO DESIGN AGENCY BS",
  "60+ ASSETS PER PACK",
  "READY IN MINUTES",
];

export function PunkHeader() {
  const ticker = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <header className="sticky top-0 z-50 border-b-4 border-foreground bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link href="/" className="group flex items-center gap-2">
          <span
            className="font-display inline-block -rotate-2 bg-accent px-2 py-0.5 text-xl text-ink transition group-hover:rotate-0 sm:text-2xl"
          >
            BRAND
          </span>
          <span className="font-marker text-xl text-accent-2 sm:text-2xl">punk</span>
        </Link>
        <span className="font-mono hidden text-xs uppercase tracking-widest text-foreground/50 sm:block">
          issue no. 001 — trydesignounk.com
        </span>
      </div>
      <div className="overflow-hidden border-t-2 border-foreground bg-accent-2 py-1">
        <div className="marquee-track flex w-max gap-8 whitespace-nowrap">
          {[...ticker, ...ticker].map((item, i) => (
            <span key={i} className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink">
              {item} <span className="mx-2">★</span>
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
