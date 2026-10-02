"use client";

const PRO_FEATURES = [
  "Envelope & \"with compliments\" slip (Word)",
  "Quote template + rate/pricing card (Excel)",
  "Facebook & LinkedIn cover banners",
  "Brand guidelines — shareable PDF",
  "Print-ready exports (bleed + crop marks)",
];

const FREE_FEATURES = [
  "Business card, letterhead, Instagram post",
  "Invoice template (Excel)",
  "Email signature (HTML)",
  "Brand guidelines (Word)",
  "Drag-to-reposition logo editor",
];

export function UpgradeModal({
  onClose,
  onUnlock,
}: {
  onClose: () => void;
  onUnlock: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#111114] p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
              BrandPunk Pro
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight">Everything else Canva, Looka & co. charge extra for</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/60 hover:border-white/40 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50">Free</h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-white/70">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-accent/40 bg-accent/5 p-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-accent">Pro — adds</h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-white">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-white/40">
          Payment isn&apos;t wired up yet — this unlocks the Pro assets for this session so you can
          see and download exactly what you&apos;d get, before we connect real billing.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onUnlock}
            className="flex-1 rounded-lg bg-accent px-6 py-3 text-center text-sm font-extrabold uppercase tracking-widest text-black transition hover:brightness-95"
          >
            Unlock Pro (Demo — No Payment Yet)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-6 py-3 text-center text-sm font-semibold uppercase tracking-widest text-white/70 transition hover:border-white/40 hover:text-white"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
