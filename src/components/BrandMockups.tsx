import type { BrandAnalysis } from "@/lib/analyzeBrand";
import { contrastTextColor, parseCssColor } from "@/lib/colorUtils";
import type { BrandIntake } from "@/lib/types";

type MockupProps = {
  analysis: BrandAnalysis;
  name: string;
  intake: BrandIntake;
  /** When provided, the logo becomes draggable (used by the editor's live preview). */
  onLogoDragStart?: (event: React.PointerEvent<HTMLElement>) => void;
};

function MockupFrame({
  label,
  aspect,
  children,
}: {
  label: string;
  aspect: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`w-full overflow-hidden rounded-xl border border-white/10 shadow-lg ${aspect}`}>
        {children}
      </div>
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-white/50">{label}</p>
    </div>
  );
}

function LogoBadge({
  logo,
  name,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
  draggable = false,
  onDragStart,
}: {
  logo: BrandIntake["logo"];
  name: string;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  draggable?: boolean;
  onDragStart?: (event: React.PointerEvent<HTMLElement>) => void;
}) {
  const size = Math.round(32 * scale);
  const style: React.CSSProperties = {
    width: size,
    height: size,
    transform: offsetX || offsetY ? `translate(${offsetX}px, ${offsetY}px)` : undefined,
    cursor: draggable ? "grab" : undefined,
    touchAction: draggable ? "none" : undefined,
  };
  const dragProps = draggable ? { onPointerDown: onDragStart } : {};

  if (!logo) {
    return (
      <span
        className="flex items-center justify-center rounded bg-black/10 text-[10px] font-bold"
        style={style}
        {...dragProps}
      >
        {name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo.dataUrl}
      alt={`${name} logo`}
      className="rounded bg-white object-contain p-1"
      style={style}
      draggable={false}
      {...dragProps}
    />
  );
}

export function BusinessCardArt({ analysis, name, intake, onLogoDragStart }: MockupProps) {
  return (
    <div
      className="flex h-full w-full flex-col justify-between p-5"
      style={{ backgroundColor: analysis.backgroundColor, color: analysis.textColor }}
    >
      <div className={`flex items-center gap-2 ${analysis.logoAlign === "center" ? "justify-center text-center" : ""}`}>
        <LogoBadge
          logo={intake.logo}
          name={name}
          scale={analysis.logoScale}
          offsetX={analysis.logoOffsets.card.x}
          offsetY={analysis.logoOffsets.card.y}
          draggable={Boolean(onLogoDragStart)}
          onDragStart={onLogoDragStart}
        />
        <span
          className="text-sm font-bold uppercase tracking-wide"
          style={{ color: analysis.primaryColor, fontFamily: `"${analysis.headingFont}", sans-serif` }}
        >
          {name}
        </span>
      </div>
      <div className="h-0.5 w-10 rounded-full" style={{ backgroundColor: analysis.accentColor }} />
      <div className="text-[11px] leading-relaxed" style={{ fontFamily: `"${analysis.bodyFont}", sans-serif`, opacity: 0.85 }}>
        {intake.business.phone && <p>{intake.business.phone}</p>}
        {intake.business.email && <p>{intake.business.email}</p>}
        {intake.business.websiteUrl && <p>{intake.business.websiteUrl.replace(/^https?:\/\//, "")}</p>}
      </div>
    </div>
  );
}

export function LetterheadArt({ analysis, name, intake, onLogoDragStart }: MockupProps) {
  return (
    <div
      className="flex h-full w-full flex-col p-5"
      style={{ backgroundColor: analysis.backgroundColor, color: analysis.textColor }}
    >
      <div
        className={`flex items-center border-b pb-3 ${analysis.logoAlign === "center" ? "justify-center" : "justify-between"}`}
        style={{ borderColor: analysis.accentColor }}
      >
        <div className="flex items-center gap-2">
          <LogoBadge
            logo={intake.logo}
            name={name}
            scale={analysis.logoScale}
            offsetX={analysis.logoOffsets.letterhead.x}
            offsetY={analysis.logoOffsets.letterhead.y}
            draggable={Boolean(onLogoDragStart)}
            onDragStart={onLogoDragStart}
          />
          <span
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: analysis.primaryColor, fontFamily: `"${analysis.headingFont}", sans-serif` }}
          >
            {name}
          </span>
        </div>
      </div>
      <div className="mt-5 flex flex-1 flex-col gap-2 opacity-30">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-1.5 rounded-full" style={{ backgroundColor: analysis.textColor, width: `${90 - i * 6}%` }} />
        ))}
      </div>
      <p className="mt-3 text-[10px]" style={{ opacity: 0.6, fontFamily: `"${analysis.bodyFont}", sans-serif` }}>
        {intake.business.address || intake.business.email}
      </p>
    </div>
  );
}

export function SocialPostArt({ analysis, name, intake, onLogoDragStart }: MockupProps) {
  const onPrimary = contrastTextColor(parseCssColor(analysis.primaryColor) ?? { r: 0, g: 0, b: 0 });
  const onAccent = contrastTextColor(parseCssColor(analysis.accentColor) ?? { r: 0, g: 0, b: 0 });
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center"
      style={{ backgroundColor: analysis.primaryColor }}
    >
      <div className="rounded-full bg-white/95 p-2">
        <LogoBadge
          logo={intake.logo}
          name={name}
          scale={analysis.logoScale}
          offsetX={analysis.logoOffsets.social.x}
          offsetY={analysis.logoOffsets.social.y}
          draggable={Boolean(onLogoDragStart)}
          onDragStart={onLogoDragStart}
        />
      </div>
      <p
        className="text-base font-extrabold uppercase leading-tight"
        style={{ color: onPrimary, fontFamily: `"${analysis.headingFont}", sans-serif` }}
      >
        {intake.business.tagline || name}
      </p>
      <span
        className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
        style={{ backgroundColor: analysis.accentColor, color: onAccent }}
      >
        {name}
      </span>
    </div>
  );
}

export function InvoiceArt({ analysis, name, intake, onLogoDragStart }: MockupProps) {
  const onPrimary = contrastTextColor(parseCssColor(analysis.primaryColor) ?? { r: 0, g: 0, b: 0 });
  const rows = [
    { desc: "Service / item", qty: "1", rate: "$0.00" },
    { desc: "Service / item", qty: "1", rate: "$0.00" },
  ];
  return (
    <div
      className="flex h-full w-full flex-col p-5"
      style={{ backgroundColor: analysis.backgroundColor, color: analysis.textColor }}
    >
      <div className={`flex items-center gap-2 ${analysis.logoAlign === "center" ? "justify-center text-center" : ""}`}>
        <LogoBadge
          logo={intake.logo}
          name={name}
          scale={analysis.logoScale}
          offsetX={analysis.logoOffsets.invoice.x}
          offsetY={analysis.logoOffsets.invoice.y}
          draggable={Boolean(onLogoDragStart)}
          onDragStart={onLogoDragStart}
        />
        <span
          className="text-xs font-bold uppercase tracking-wide"
          style={{ color: analysis.primaryColor, fontFamily: `"${analysis.headingFont}", sans-serif` }}
        >
          {name}
        </span>
      </div>

      <p
        className="mt-4 text-lg font-black uppercase tracking-wide"
        style={{ color: analysis.primaryColor, fontFamily: `"${analysis.headingFont}", sans-serif` }}
      >
        Invoice
      </p>

      <div className="mt-3 overflow-hidden rounded text-[10px]" style={{ fontFamily: `"${analysis.bodyFont}", sans-serif` }}>
        <div
          className="grid grid-cols-[1fr_auto_auto] gap-2 px-2 py-1.5 font-semibold"
          style={{ backgroundColor: analysis.primaryColor, color: onPrimary }}
        >
          <span>Description</span>
          <span>Qty</span>
          <span>Rate</span>
        </div>
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-black/5 px-2 py-1.5 opacity-60">
            <span>{row.desc}</span>
            <span>{row.qty}</span>
            <span>{row.rate}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-end text-xs font-bold" style={{ color: analysis.primaryColor }}>
        Total: $0.00
      </div>

      <p className="mt-auto text-[9px]" style={{ opacity: 0.6 }}>
        {intake.business.email || intake.business.phone}
      </p>
    </div>
  );
}

export function CoverBannerArt({ analysis, name, intake }: MockupProps) {
  const onPrimary = contrastTextColor(parseCssColor(analysis.primaryColor) ?? { r: 0, g: 0, b: 0 });
  return (
    <div
      className="flex h-full w-full items-center gap-4 px-8"
      style={{ backgroundColor: analysis.primaryColor }}
    >
      <LogoBadge logo={intake.logo} name={name} scale={analysis.logoScale * 1.4} />
      <div className="flex flex-col gap-1">
        <span
          className="text-xl font-black uppercase tracking-wide"
          style={{ color: onPrimary, fontFamily: `"${analysis.headingFont}", sans-serif` }}
        >
          {name}
        </span>
        {intake.business.tagline && (
          <span
            className="text-xs font-medium"
            style={{ color: onPrimary, opacity: 0.8, fontFamily: `"${analysis.bodyFont}", sans-serif` }}
          >
            {intake.business.tagline}
          </span>
        )}
      </div>
      <span className="ml-auto h-10 w-1 rounded-full" style={{ backgroundColor: analysis.accentColor }} />
    </div>
  );
}

export function BusinessCardMockup(props: MockupProps) {
  return (
    <MockupFrame label="Business Card" aspect="aspect-[1.75/1]">
      <BusinessCardArt {...props} />
    </MockupFrame>
  );
}

export function LetterheadMockup(props: MockupProps) {
  return (
    <MockupFrame label="Letterhead" aspect="aspect-[3/4]">
      <LetterheadArt {...props} />
    </MockupFrame>
  );
}

export function SocialPostMockup(props: MockupProps) {
  return (
    <MockupFrame label="Instagram Post" aspect="aspect-square">
      <SocialPostArt {...props} />
    </MockupFrame>
  );
}

export function InvoiceMockup(props: MockupProps) {
  return (
    <MockupFrame label="Invoice" aspect="aspect-[3/4]">
      <InvoiceArt {...props} />
    </MockupFrame>
  );
}
