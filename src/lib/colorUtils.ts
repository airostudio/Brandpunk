export type RGB = { r: number; g: number; b: number };

export function toHex({ r, g, b }: RGB): string {
  const c = (n: number) => n.toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

export function parseCssColor(input: string): RGB | null {
  const hex = input.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1];
    if (h.length === 3) {
      const [r, g, b] = h.split("").map((c) => parseInt(c + c, 16));
      return { r, g, b };
    }
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  const rgb = input.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) {
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
  }
  return null;
}

export function luminance({ r, g, b }: RGB): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export function saturation({ r, g, b }: RGB): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

export function isNearGray(rgb: RGB, threshold = 0.08): boolean {
  return saturation(rgb) < threshold;
}

/** Buckets close colors together so near-duplicates don't crowd out the palette. */
export function quantizeKey({ r, g, b }: RGB, step = 24): string {
  const q = (n: number) => Math.round(n / step) * step;
  return `${q(r)}-${q(g)}-${q(b)}`;
}

export function contrastTextColor(rgb: RGB): "#0A0A0A" | "#FFFFFF" {
  return luminance(rgb) > 0.55 ? "#0A0A0A" : "#FFFFFF";
}
