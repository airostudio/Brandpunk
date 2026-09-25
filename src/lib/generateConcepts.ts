import type { BrandAnalysis } from "./analyzeBrand";
import { contrastTextColor, parseCssColor } from "./colorUtils";

export type BrandConcept = {
  id: string;
  name: string;
  description: string;
  analysis: BrandAnalysis;
};

const WHITE = "#FFFFFF";
const INK = "#111114";

// Curated, designer-picked pairings — each a heading/body combination known
// to work well together, so a concept never ends up with two fonts that
// clash just because that's what the scrape happened to find.
const MODERN_PAIR = { heading: "Space Grotesk", body: "Work Sans" };
const HERITAGE_PAIR = { heading: "Playfair Display", body: "Source Sans 3" };
const PRECISION_FALLBACK_PAIR = { heading: "Archivo", body: "Inter" };

function withTextColor(analysis: BrandAnalysis): BrandAnalysis {
  const bg = parseCssColor(analysis.backgroundColor) ?? { r: 255, g: 255, b: 255 };
  return { ...analysis, textColor: contrastTextColor(bg) };
}

/**
 * Builds three distinct treatments of the SAME extracted palette — the
 * colours never change, only which role each one plays and the background —
 * so every concept still looks like it belongs to this business. Fonts are
 * curated per direction rather than reused as-is: "Precision" keeps the
 * business's own heading font when we found one (paired with a clean,
 * complementary body face), while "Modern Edge" and "Heritage" each apply a
 * deliberately different, proven pairing suited to that direction's mood.
 */
export function generateConcepts(base: BrandAnalysis): BrandConcept[] {
  const hasExtractedHeadingFont = base.source === "extracted" && base.headingFont !== base.bodyFont;

  const classic: BrandAnalysis = withTextColor({
    ...base,
    headingFont: hasExtractedHeadingFont ? base.headingFont : PRECISION_FALLBACK_PAIR.heading,
    bodyFont: PRECISION_FALLBACK_PAIR.body,
  });

  const bold: BrandAnalysis = withTextColor({
    ...base,
    backgroundColor: INK,
    accentColor: base.secondaryColor,
    secondaryColor: base.accentColor,
    headingFont: MODERN_PAIR.heading,
    bodyFont: MODERN_PAIR.body,
  });

  const premium: BrandAnalysis = withTextColor({
    ...base,
    backgroundColor: WHITE,
    primaryColor: base.secondaryColor,
    secondaryColor: base.primaryColor,
    headingFont: HERITAGE_PAIR.heading,
    bodyFont: HERITAGE_PAIR.body,
  });

  return [
    {
      id: "classic",
      name: "Precision",
      description: "Clean and true to your existing colours and type — the safe, professional direction.",
      analysis: classic,
    },
    {
      id: "bold",
      name: "Modern Edge",
      description: "Dark background, geometric type, your accent colour pushed forward — punchier and more contemporary.",
      analysis: bold,
    },
    {
      id: "premium",
      name: "Heritage",
      description: "Light and airy with an elegant serif heading — a calmer, more premium feel.",
      analysis: premium,
    },
  ];
}
