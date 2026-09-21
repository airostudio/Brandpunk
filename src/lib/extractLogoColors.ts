import { isNearGray, quantizeKey, toHex, type RGB } from "./colorUtils";

/**
 * Samples pixels from the uploaded logo on a downscaled canvas and returns
 * the most common non-transparent, non-background colors — background
 * pixels (near-white/near-black corners) are excluded so the logo's actual
 * ink colors surface instead of its canvas.
 */
export async function extractLogoColors(dataUrl: string, maxColors = 4): Promise<string[]> {
  const img = await loadImage(dataUrl);

  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  const counts = new Map<string, { rgb: RGB; count: number }>();

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 200) continue;

    const rgb: RGB = { r: data[i], g: data[i + 1], b: data[i + 2] };
    const isNearWhite = rgb.r > 240 && rgb.g > 240 && rgb.b > 240;
    const isNearBlack = rgb.r < 15 && rgb.g < 15 && rgb.b < 15;
    if (isNearWhite || isNearBlack) continue;

    const key = quantizeKey(rgb);
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { rgb, count: 1 });
    }
  }

  const ranked = [...counts.values()].sort((a, b) => b.count - a.count);

  const vivid = ranked.filter((c) => !isNearGray(c.rgb));
  const chosen = (vivid.length > 0 ? vivid : ranked).slice(0, maxColors);

  return chosen.map((c) => toHex(c.rgb));
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load logo image"));
    img.src = dataUrl;
  });
}
