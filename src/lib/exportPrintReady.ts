import { PRINT_BLEED_INCHES, PRINT_CROP_MARGIN_INCHES, PRINT_DPI } from "./mockupSizes";

/**
 * Wraps an already-captured 300 DPI PNG with commercial bleed + crop marks.
 *
 * Honesty note: this produces an RGB PNG, not a true CMYK file — browsers
 * can't do ICC-managed CMYK colour conversion or emit CMYK-encoded PNGs.
 * Most digital print shops accept high-res RGB and convert on their end;
 * anyone who specifically requires a pre-converted CMYK file should flatten
 * this in their print software. That caveat is spelled out in the pack's
 * README rather than silently claiming CMYK.
 */
export async function addBleedAndCropMarks(sourcePng: Blob, trimWidthPx: number, trimHeightPx: number): Promise<Blob> {
  const bleedPx = Math.round(PRINT_BLEED_INCHES * PRINT_DPI);
  const outerMarginPx = Math.round(PRINT_CROP_MARGIN_INCHES * PRINT_DPI);

  const bleedWidth = trimWidthPx + bleedPx * 2;
  const bleedHeight = trimHeightPx + bleedPx * 2;
  const canvasWidth = bleedWidth + outerMarginPx * 2;
  const canvasHeight = bleedHeight + outerMarginPx * 2;

  const img = await blobToImage(sourcePng);
  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Slightly oversize the design so it extends into the bleed area (no new
  // artwork is invented — the existing background/edges simply stretch a
  // few percent to cover the bleed, which is the standard print convention).
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, outerMarginPx, outerMarginPx, bleedWidth, bleedHeight);

  const trimX = outerMarginPx + bleedPx;
  const trimY = outerMarginPx + bleedPx;
  const trimRight = trimX + trimWidthPx;
  const trimBottom = trimY + trimHeightPx;
  const markLen = Math.round(0.1875 * PRINT_DPI); // 3/16in crop mark, industry standard
  const gap = Math.round(0.0625 * PRINT_DPI); // 1/16in gap between trim edge and mark

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  const corners: Array<[number, number, number, number]> = [
    [trimX, trimY, -1, -1],
    [trimRight, trimY, 1, -1],
    [trimX, trimBottom, -1, 1],
    [trimRight, trimBottom, 1, 1],
  ];
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x + dx * gap, y);
    ctx.lineTo(x + dx * (gap + markLen), y);
    ctx.moveTo(x, y + dy * gap);
    ctx.lineTo(x, y + dy * (gap + markLen));
    ctx.stroke();
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not render print-ready PNG"))), "image/png");
  });
}

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load captured PNG"));
    };
    img.src = url;
  });
}
