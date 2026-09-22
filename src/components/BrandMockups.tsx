import type { BrandAnalysis } from "@/lib/analyzeBrand";
import type { BrandIntake } from "@/lib/types";

type MockupProps = {
  analysis: BrandAnalysis;
  name: string;
  intake: BrandIntake;
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
}: {
  logo: BrandIntake["logo"];
  name: string;
  scale?: number;
}) {
  const size = Math.round(32 * scale);
  const style = { width: size, height: size };
  if (!logo) {
    return (
      <span
        className="flex items-center justify-center rounded bg-black/10 text-[10px] font-bold"
        style={style}
      >
        {name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logo.dataUrl} alt={`${name} logo`} className="rounded bg-white object-contain p-1" style={style} />
  );
}

export function BusinessCardMockup({ analysis, name, intake }: MockupProps) {
  return (
    <MockupFrame label="Business Card" aspect="aspect-[1.75/1]">
      <div
        className="flex h-full w-full flex-col justify-between p-5"
        style={{ backgroundColor: analysis.backgroundColor, color: analysis.textColor }}
      >
        <div className={`flex items-center gap-2 ${analysis.logoAlign === "center" ? "justify-center text-center" : ""}`}>
          <LogoBadge logo={intake.logo} name={name} scale={analysis.logoScale} />
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
    </MockupFrame>
  );
}

export function LetterheadMockup({ analysis, name, intake }: MockupProps) {
  return (
    <MockupFrame label="Letterhead" aspect="aspect-[3/4]">
      <div
        className="flex h-full w-full flex-col p-5"
        style={{ backgroundColor: analysis.backgroundColor, color: analysis.textColor }}
      >
        <div
          className={`flex items-center border-b pb-3 ${analysis.logoAlign === "center" ? "justify-center" : "justify-between"}`}
          style={{ borderColor: analysis.accentColor }}
        >
          <div className="flex items-center gap-2">
            <LogoBadge logo={intake.logo} name={name} scale={analysis.logoScale} />
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
    </MockupFrame>
  );
}

export function SocialPostMockup({ analysis, name, intake }: MockupProps) {
  return (
    <MockupFrame label="Instagram Post" aspect="aspect-square">
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center"
        style={{ backgroundColor: analysis.primaryColor }}
      >
        <div className="rounded-full bg-white/95 p-2">
          <LogoBadge logo={intake.logo} name={name} scale={analysis.logoScale} />
        </div>
        <p
          className="text-base font-extrabold uppercase leading-tight"
          style={{ color: analysis.backgroundColor, fontFamily: `"${analysis.headingFont}", sans-serif` }}
        >
          {intake.business.tagline || name}
        </p>
        <span
          className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
          style={{ backgroundColor: analysis.accentColor, color: analysis.primaryColor }}
        >
          {name}
        </span>
      </div>
    </MockupFrame>
  );
}
