import type { BrandAnalysis } from "./analyzeBrand";
import type { BrandIntake } from "./types";

/**
 * Table-based HTML email signature with inline styles — the format email
 * clients (Outlook, Gmail, Apple Mail) actually render reliably.
 */
export function buildEmailSignatureHtml(intake: BrandIntake, analysis: BrandAnalysis, name: string): string {
  const { business, logo } = intake;
  const logoCell = logo
    ? `<td style="padding-right:16px;border-right:2px solid ${analysis.accentColor};vertical-align:middle;">
         <img src="${logo.dataUrl}" width="56" height="56" alt="${name}" style="display:block;object-fit:contain;background:#ffffff;border-radius:6px;padding:4px;" />
       </td>`
    : "";

  const contactLines = [business.phone, business.email, business.websiteUrl]
    .filter(Boolean)
    .map(
      (line) =>
        `<div style="font-family:${analysis.bodyFont}, Arial, sans-serif;font-size:12px;color:#555555;line-height:1.6;">${line}</div>`,
    )
    .join("\n");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#ffffff;">
    <table cellpadding="0" cellspacing="0" style="font-family:${analysis.bodyFont}, Arial, sans-serif;">
      <tr>
        ${logoCell}
        <td style="padding-left:${logo ? "16px" : "0"};vertical-align:middle;">
          <div style="font-family:${analysis.headingFont}, Arial, sans-serif;font-size:16px;font-weight:bold;color:${analysis.primaryColor};text-transform:uppercase;letter-spacing:0.5px;">
            ${name}
          </div>
          ${business.tagline ? `<div style="font-size:12px;color:#888888;font-style:italic;margin:2px 0 6px;">${business.tagline}</div>` : ""}
          ${contactLines}
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}
