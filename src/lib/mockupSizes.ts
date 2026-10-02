/**
 * Shared design-time pixel sizes for the business card, letterhead, and
 * social post previews — used by both the editor's live preview (so
 * dragging the logo is true WYSIWYG) and the hidden nodes captured for
 * export. Pixel ratios are picked so the captured PNGs land at real-world
 * 300 DPI for print pieces, not just an arbitrary upscale.
 */
export const CARD_SIZE = { width: 350, height: 200 };
export const LETTERHEAD_SIZE = { width: 350, height: 453 };
export const SOCIAL_SIZE = { width: 400, height: 400 };

export const EXPORT_PIXEL_RATIO = {
  // 350x200 * 3 = 1050x600px = 3.5in x 2in @ 300 DPI
  businessCard: 3,
  // 350x453 * 7.3 ≈ 2555x3307px ≈ US Letter (8.5x11in) @ 300 DPI
  letterhead: 7.3,
  // 400x400 * 4 = 1600x1600px — well above Instagram's 1080px minimum
  socialPost: 4,
};
