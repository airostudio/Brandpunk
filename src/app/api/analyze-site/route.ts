import { NextResponse } from "next/server";
import { isNearGray, luminance, parseCssColor, quantizeKey, toHex, type RGB } from "@/lib/colorUtils";

export const runtime = "nodejs";

const FETCH_TIMEOUT_MS = 6000;
const MAX_STYLESHEETS = 2;
const COLOR_PATTERN = /#[0-9a-f]{3,8}\b|rgba?\([^)]+\)/gi;
const FONT_FAMILY_PATTERN = /font-family\s*:\s*([^;}]+)/gi;
const GENERIC_FONT_NAMES = new Set([
  "sans-serif",
  "serif",
  "monospace",
  "system-ui",
  "-apple-system",
  "arial",
  "helvetica",
  "inherit",
  "initial",
  "unset",
]);

async function fetchWithTimeout(url: string, ms: number): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BrandPunkBot/1.0)" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function extractColors(css: string): Map<string, { rgb: RGB; count: number }> {
  const counts = new Map<string, { rgb: RGB; count: number }>();
  const matches = css.match(COLOR_PATTERN) ?? [];
  for (const raw of matches) {
    const rgb = parseCssColor(raw.trim());
    if (!rgb) continue;
    const key = quantizeKey(rgb);
    const existing = counts.get(key);
    if (existing) existing.count += 1;
    else counts.set(key, { rgb, count: 1 });
  }
  return counts;
}

function extractFonts(css: string): string[] {
  const found: string[] = [];
  for (const match of css.matchAll(FONT_FAMILY_PATTERN)) {
    const names = match[1]
      .split(",")
      .map((n) => n.trim().replace(/^["']|["']$/g, ""))
      .filter((n) => n && !GENERIC_FONT_NAMES.has(n.toLowerCase()));
    if (names[0]) found.push(names[0]);
  }
  return found;
}

export async function POST(request: Request) {
  let targetUrl: string;
  try {
    const body = (await request.json()) as { url?: string };
    if (!body.url) {
      return NextResponse.json({ ok: false, reason: "missing-url" }, { status: 400 });
    }
    targetUrl = body.url.startsWith("http") ? body.url : `https://${body.url}`;
    new URL(targetUrl);
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid-url" }, { status: 400 });
  }

  const html = await fetchWithTimeout(targetUrl, FETCH_TIMEOUT_MS);
  if (!html) {
    return NextResponse.json({ ok: false, reason: "unreachable" });
  }

  let combinedCss = html;

  const stylesheetHrefs = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)]
    .map((tag) => tag[0].match(/href=["']([^"']+)["']/i)?.[1])
    .filter((href): href is string => Boolean(href))
    .slice(0, MAX_STYLESHEETS);

  for (const href of stylesheetHrefs) {
    try {
      const absolute = new URL(href, targetUrl).toString();
      const css = await fetchWithTimeout(absolute, FETCH_TIMEOUT_MS);
      if (css) combinedCss += css;
    } catch {
      // skip unresolvable stylesheet URLs
    }
  }

  const colorCounts = extractColors(combinedCss);
  const ranked = [...colorCounts.values()].sort((a, b) => b.count - a.count);

  const vivid = ranked.filter((c) => !isNearGray(c.rgb) && luminance(c.rgb) > 0.05 && luminance(c.rgb) < 0.95);
  const palette = (vivid.length > 0 ? vivid : ranked).slice(0, 6).map((c) => toHex(c.rgb));

  const fontCounts = new Map<string, number>();
  for (const font of extractFonts(combinedCss)) {
    fontCounts.set(font, (fontCounts.get(font) ?? 0) + 1);
  }
  const fonts = [...fontCounts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);

  return NextResponse.json({
    ok: palette.length > 0 || fonts.length > 0,
    colors: palette,
    fonts: fonts.slice(0, 3),
  });
}
