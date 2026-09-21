import { StickerBadge } from "./StickerBadge";

export function PunkFooter() {
  return (
    <footer className="relative mt-16 border-t-4 border-foreground bg-background px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <StickerBadge color="accent" rotate={-3}>
            No agency required
          </StickerBadge>
          <StickerBadge color="accent-2" rotate={2}>
            Print-ready exports
          </StickerBadge>
          <StickerBadge color="accent-3" rotate={-1}>
            Made in minutes
          </StickerBadge>
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-foreground/40">
          BrandPunk — trydesignounk.com — your entire business brand, designed at once.
        </p>
      </div>
    </footer>
  );
}
