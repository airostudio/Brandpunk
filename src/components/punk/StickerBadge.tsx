type StickerBadgeProps = {
  children: React.ReactNode;
  rotate?: number;
  color?: "accent" | "accent-2" | "accent-3" | "paper";
  className?: string;
};

const COLOR_MAP: Record<NonNullable<StickerBadgeProps["color"]>, string> = {
  accent: "bg-accent text-ink",
  "accent-2": "bg-accent-2 text-paper",
  "accent-3": "bg-accent-3 text-ink",
  paper: "bg-paper text-ink",
};

/** A stamped, rotated badge — like a sticker slapped on a flyer. */
export function StickerBadge({ children, rotate = -4, color = "accent", className = "" }: StickerBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest shadow-[3px_3px_0_0_var(--ink)] ${COLOR_MAP[color]} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}
