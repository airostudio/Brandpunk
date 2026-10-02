import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-black uppercase tracking-tight">
          Brand<span className="text-accent">Punk</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/studio"
            className="hidden whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-widest text-accent-2 transition hover:brightness-125 sm:inline-block sm:text-sm"
          >
            Ad Studio
          </Link>
          <Link
            href="/account"
            className="whitespace-nowrap rounded-lg px-2 py-2 text-xs font-semibold uppercase tracking-widest text-white/60 transition hover:text-white sm:px-3 sm:text-sm"
          >
            Log In
          </Link>
          <Link
            href="/start"
            className="whitespace-nowrap rounded-lg bg-accent px-3 py-2 text-xs font-extrabold uppercase tracking-widest text-black transition hover:brightness-95 sm:px-4 sm:text-sm"
          >
            Start Building
          </Link>
        </nav>
      </div>
    </header>
  );
}
