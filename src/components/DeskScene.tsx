import type { BrandAnalysis } from "@/lib/analyzeBrand";
import type { BrandIntake } from "@/lib/types";
import { BusinessCardArt, LetterheadArt, SocialPostArt } from "./BrandMockups";

type DeskSceneProps = {
  analysis: BrandAnalysis;
  name: string;
  intake: BrandIntake;
};

/**
 * A "flatlay photo" style composition — the letterhead, business card, and
 * a phone showing the social post, arranged and tilted as if photographed
 * on a desk, rather than presented as flat spec sheets. Pure CSS (no
 * external photography), so it never depends on a network image request.
 */
export function DeskScene({ analysis, name, intake }: DeskSceneProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10">
      {/* Desk surface */}
      <div
        className="relative aspect-[16/11] w-full sm:aspect-[16/9]"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 30% 0%, rgba(255,255,255,0.05), transparent 55%), linear-gradient(150deg, #302a24 0%, #221d19 55%, #18140f 100%)",
        }}
      >
        {/* subtle desk-mat texture */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 5px)",
          }}
        />
        {/* vignette */}
        <div
          className="absolute inset-0"
          style={{ boxShadow: "inset 0 0 120px 30px rgba(0,0,0,0.55)" }}
        />

        {/* Letterhead — back-left, slightly tilted, like a printed sheet set down */}
        <div
          className="absolute left-[4%] top-[8%] w-[34%] origin-bottom-left rounded-sm shadow-[0_30px_50px_-15px_rgba(0,0,0,0.7)]"
          style={{ transform: "rotate(-6deg)" }}
        >
          <div className="aspect-[3/4] w-full overflow-hidden rounded-sm ring-1 ring-black/20">
            <LetterheadArt analysis={analysis} name={name} intake={intake} />
          </div>
        </div>

        {/* Business card — tossed on top, overlapping the letterhead */}
        <div
          className="absolute left-[24%] top-[52%] w-[26%] origin-top-left rounded shadow-[0_18px_30px_-10px_rgba(0,0,0,0.75)]"
          style={{ transform: "rotate(8deg)" }}
        >
          <div className="aspect-[1.75/1] w-full overflow-hidden rounded ring-1 ring-black/20">
            <BusinessCardArt analysis={analysis} name={name} intake={intake} />
          </div>
        </div>

        {/* Phone showing the social post, propped up on the right */}
        <div
          className="absolute right-[5%] top-[7%] w-[24%] origin-bottom drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)]"
          style={{ transform: "rotate(4deg)" }}
        >
          <div className="rounded-[1.4rem] border-[6px] border-neutral-900 bg-neutral-900 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <div className="relative aspect-square w-full overflow-hidden rounded-[0.9rem]">
              <SocialPostArt analysis={analysis} name={name} intake={intake} />
              <div className="pointer-events-none absolute left-1/2 top-1 h-1.5 w-8 -translate-x-1/2 rounded-full bg-black/60" />
            </div>
          </div>
        </div>

        {/* A pen prop, for the "sitting on a real desk" feel */}
        <div
          className="absolute bottom-[10%] left-[45%] h-[3px] w-[16%] rounded-full opacity-70"
          style={{
            background: "linear-gradient(90deg, #d8d2c4 0%, #d8d2c4 85%, #b08d57 85%, #b08d57 100%)",
            transform: "rotate(-14deg)",
            boxShadow: "0 3px 6px rgba(0,0,0,0.5)",
          }}
        />
      </div>
    </div>
  );
}
