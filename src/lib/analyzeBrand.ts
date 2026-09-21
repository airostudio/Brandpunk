import type { BrandIntake } from "./types";
import { contrastTextColor, luminance, parseCssColor, saturation } from "./colorUtils";

export type BrandAnalysis = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  styleTags: string[];
  toneSummary: string;
  source: "extracted" | "guessed";
};

export type BrandSignals = {
  siteColors: string[];
  siteFonts: string[];
  logoColors: string[];
};

const FALLBACK_PALETTES: Array<[string, string, string]> = [
  ["#14324A", "#FF7919", "#F4F1EA"],
  ["#0F172A", "#38BDF8", "#F8FAFC"],
  ["#1B1B1F", "#D4FF3F", "#F5F5F5"],
  ["#2D2A32", "#FF3FB4", "#F5F1F5"],
  ["#123524", "#7CE38B", "#F0F7F2"],
  ["#3A1F0F", "#E8A33D", "#FBF3E7"],
];

const FALLBACK_FONT_PAIRS: Array<[string, string]> = [
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

function dedupeColors(colors: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const color of colors) {
    const key = color.toUpperCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(key);
    }
  }
  return result;
}

function styleTagsForColor(hex: string, seedHash: number): string[] {
  const rgb = parseCssColor(hex);
  if (!rgb) {
    return [STYLE_TAG_POOL[seedHash % STYLE_TAG_POOL.length]];
  }
  const dark = luminance(rgb) < 0.35;
  const vivid = saturation(rgb) > 0.45;

  const tags: string[] = [];
  if (dark && vivid) tags.push("Bold", "Modern");
  else if (dark) tags.push("Professional", "Corporate");
  else if (vivid) tags.push("Playful", "Friendly");
  else tags.push("Minimal", "Premium");
  tags.push(STYLE_TAG_POOL[(seedHash >> 4) % STYLE_TAG_POOL.length]);

  return [...new Set(tags)].slice(0, 3);
}

/**
 * Builds the brand board from real signals when we have them (logo pixel
 * colors, colors/fonts scraped from the business's own website) and falls
 * back to a deterministic guessed palette only for whatever's missing.
 */
export function buildBrandAnalysis(intake: BrandIntake, signals: BrandSignals): BrandAnalysis {
  const seed = `${intake.business.websiteUrl}|${intake.business.businessName}`;
  const hash = hashString(seed || "brandpunk");

  const combinedColors = dedupeColors([...signals.logoColors, ...signals.siteColors]);
  const hasRealColors = combinedColors.length > 0;
  const hasRealFonts = signals.siteFonts.length > 0;

  const [fallbackPrimary, fallbackSecondary, fallbackBackground] =
    FALLBACK_PALETTES[hash % FALLBACK_PALETTES.length];

  const primaryColor = combinedColors[0] ?? fallbackPrimary;
  const secondaryColor = combinedColors[1] ?? (combinedColors[0] ? fallbackSecondary : fallbackSecondary);
  const accentColor = combinedColors[2] ?? combinedColors[1] ?? fallbackSecondary;

  const primaryRgb = parseCssColor(primaryColor);
  const backgroundColor =
    primaryRgb && luminance(primaryRgb) > 0.75 ? "#111114" : hasRealColors ? "#FFFFFF" : fallbackBackground;
  const textColor = contrastTextColor(parseCssColor(backgroundColor) ?? { r: 255, g: 255, b: 255 });

  const [fallbackHeading, fallbackBody] = FALLBACK_FONT_PAIRS[hash % FALLBACK_FONT_PAIRS.length];
  const headingFont = signals.siteFonts[0] ?? fallbackHeading;
  const bodyFont = signals.siteFonts[1] ?? signals.siteFonts[0] ?? fallbackBody;

  const styleTags = styleTagsForColor(primaryColor, hash);

  const name = intake.business.businessName || "your business";
  const toneSummary =
    intake.business.tagline ||
    `${name} comes across as ${styleTags.join(", ").toLowerCase()}.`;

  return {
    primaryColor,
    secondaryColor,
    accentColor,
    backgroundColor,
    textColor,
    headingFont,
    bodyFont,
    styleTags,
    toneSummary,
    source: hasRealColors || hasRealFonts ? "extracted" : "guessed",
  };
}
