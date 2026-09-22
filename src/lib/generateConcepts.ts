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

function withTextColor(analysis: BrandAnalysis): BrandAnalysis {
  const bg = parseCssColor(analysis.backgroundColor) ?? { r: 255, g: 255, b: 255 };
  return { ...analysis, textColor: contrastTextColor(bg) };
}

/**
 * Builds three distinct treatments of the SAME extracted palette — the
 * colours never change, only which role each one plays and the background,
 * so every concept still looks like it belongs to this business.
 */
export function generateConcepts(base: BrandAnalysis): BrandConcept[] {
  const classic: BrandAnalysis = withTextColor({
    ...base,
  });

  const bold: BrandAnalysis = withTextColor({
    ...base,
    backgroundColor: INK,
    accentColor: base.secondaryColor,
    secondaryColor: base.accentColor,
  });

  const premium: BrandAnalysis = withTextColor({
    ...base,
    backgroundColor: WHITE,
    primaryColor: base.secondaryColor,
    secondaryColor: base.primaryColor,
    headingFont: base.bodyFont,
    bodyFont: base.headingFont,
  });

  return [
    {
      id: "classic",
      name: "Precision",
      description: "Clean and true to your existing colours — the safe, professional direction.",
      analysis: classic,
    },
    {
      id: "bold",
      name: "Modern Edge",
      description: "Dark background, your accent colour pushed forward — punchier and more contemporary.",
      analysis: bold,
    },
    {
      id: "premium",
      name: "Heritage",
      description: "Light and airy with swapped colour roles — a calmer, more premium feel.",
      analysis: premium,
    },
  ];
}
