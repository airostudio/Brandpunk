import type { BrandIntake } from "./types";

export type BrandAnalysis = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  headingFont: string;
  bodyFont: string;
  styleTags: string[];
  toneSummary: string;
};

const PALETTES: Array<[string, string, string, string]> = [
  ["#14324A", "#FF7919", "#F4F1EA", "#FFFFFF"],
  ["#0F172A", "#38BDF8", "#F8FAFC", "#FFFFFF"],
  ["#1B1B1F", "#D4FF3F", "#111114", "#FFFFFF"],
  ["#2D2A32", "#FF3FB4", "#F5F1F5", "#FFFFFF"],
  ["#123524", "#7CE38B", "#F0F7F2", "#FFFFFF"],
  ["#3A1F0F", "#E8A33D", "#FBF3E7", "#FFFFFF"],
];

const FONT_PAIRS: Array<[string, string]> = [
  ["Montserrat", "Inter"],
  ["Poppins", "Source Sans 3"],
  ["Playfair Display", "Karla"],
  ["Space Grotesk", "Work Sans"],
  ["Archivo", "Public Sans"],
];

const STYLE_TAG_POOL = [
  "Professional",
  "Modern",
  "Reliable",
  "Bold",
  "Minimal",
  "Premium",
  "Friendly",
  "Trade",
  "Corporate",
  "Playful",
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Deterministic placeholder for real website/logo scraping — picks a
 * palette, font pairing and style tags from the business name + URL so the
 * confirm-brand step has something concrete to react to.
 */
export function analyzeBrand(intake: BrandIntake): BrandAnalysis {
  const seed = `${intake.business.websiteUrl}|${intake.business.businessName}`;
  const hash = hashString(seed || "brandpunk");

  const [primaryColor, secondaryColor, backgroundColor, accentColor] =
    PALETTES[hash % PALETTES.length];
  const [headingFont, bodyFont] = FONT_PAIRS[hash % FONT_PAIRS.length];

  const styleTags = [
    STYLE_TAG_POOL[hash % STYLE_TAG_POOL.length],
    STYLE_TAG_POOL[(hash >> 3) % STYLE_TAG_POOL.length],
    STYLE_TAG_POOL[(hash >> 6) % STYLE_TAG_POOL.length],
  ].filter((tag, i, arr) => arr.indexOf(tag) === i);

  const name = intake.business.businessName || "your business";
  const toneSummary =
    intake.business.tagline ||
    `${name} comes across as ${styleTags.join(", ").toLowerCase()}.`;

  return {
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor,
    headingFont,
    bodyFont,
    styleTags,
    toneSummary,
  };
}
