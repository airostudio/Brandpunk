/** Decodes a data URL's base64 payload into raw bytes. */
export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Re-renders any image (including SVG) onto a canvas and exports it as PNG
 * bytes — gives docx/xlsx a format they can always embed, regardless of
 * what the user originally uploaded.
 */
export function rasterizeToPng(
  dataUrl: string,
  maxSize = 512,
): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const pngDataUrl = canvas.toDataURL("image/png");
      resolve({ bytes: dataUrlToBytes(pngDataUrl), width, height });
    };
    img.onerror = () => reject(new Error("Could not load logo image"));
    img.src = dataUrl;
  });
}
