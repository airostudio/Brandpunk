import { toBlob } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { BrandAnalysis } from "./analyzeBrand";
import {
  buildBrandGuidelinesDocx,
  buildComplimentsSlipDocx,
  buildEnvelopeDocx,
  buildLetterheadDocx,
} from "./exportDocx";
import { buildEmailSignatureHtml } from "./exportEmailSignature";
import { buildBrandGuidelinesPdf } from "./exportPdf";
import { addBleedAndCropMarks } from "./exportPrintReady";
import { buildInvoiceXlsx, buildQuoteXlsx, buildRateCardXlsx } from "./exportXlsx";
import { CARD_SIZE, EXPORT_PIXEL_RATIO, LETTERHEAD_SIZE } from "./mockupSizes";
import type { BrandIntake, PlanTier } from "./types";

async function captureNodePng(node: HTMLElement, pixelRatio: number): Promise<Blob> {
  const blob = await toBlob(node, { pixelRatio, cacheBust: true });
  if (!blob) throw new Error("Could not render image");
  return blob;
}

export type PackNodes = {
  businessCard: HTMLElement;
  letterhead: HTMLElement;
  socialPost: HTMLElement;
  fbCover?: HTMLElement;
  linkedinCover?: HTMLElement;
};

export async function downloadBrandPack({
  intake,
  analysis,
  conceptName,
  name,
  nodes,
  tier,
}: {
  intake: BrandIntake;
  analysis: BrandAnalysis;
  conceptName: string;
  name: string;
  nodes: PackNodes;
  tier: PlanTier;
}): Promise<void> {
  const zip = new JSZip();
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "brandpunk";
  const isPro = tier === "pro";

  const [cardPng, letterheadPng, socialPng, letterheadDocx, invoiceXlsx, guidelinesDocx] = await Promise.all([
    captureNodePng(nodes.businessCard, EXPORT_PIXEL_RATIO.businessCard),
    captureNodePng(nodes.letterhead, EXPORT_PIXEL_RATIO.letterhead),
    captureNodePng(nodes.socialPost, EXPORT_PIXEL_RATIO.socialPost),
    buildLetterheadDocx(intake, analysis, name),
    buildInvoiceXlsx(intake, analysis, name),
    buildBrandGuidelinesDocx(intake, analysis, conceptName, name),
  ]);

  zip.folder("Business Cards")?.file(`${slug}-business-card.png`, cardPng);
  zip.folder("Letterheads")?.file(`${slug}-letterhead.png`, letterheadPng);
  zip.folder("Letterheads")?.file(`${slug}-letterhead.docx`, letterheadDocx);
  zip.folder("Social Media")?.file(`${slug}-instagram-post.png`, socialPng);
  zip.folder("Sales")?.file(`${slug}-invoice-template.xlsx`, invoiceXlsx);
  zip.folder("Digital")?.file(`${slug}-email-signature.html`, buildEmailSignatureHtml(intake, analysis, name));
  zip.folder("Brand")?.file(`${slug}-brand-guidelines.docx`, guidelinesDocx);

  const proLines: string[] = [];

  if (isPro) {
    const [envelopeDocx, complimentsDocx, quoteXlsx, rateCardXlsx, guidelinesPdf] = await Promise.all([
      buildEnvelopeDocx(intake, analysis, name),
      buildComplimentsSlipDocx(intake, analysis, name),
      buildQuoteXlsx(intake, analysis, name),
      buildRateCardXlsx(intake, analysis, name),
      buildBrandGuidelinesPdf(intake, analysis, conceptName, name),
    ]);

    zip.folder("Stationery")?.file(`${slug}-envelope.docx`, envelopeDocx);
    zip.folder("Stationery")?.file(`${slug}-compliments-slip.docx`, complimentsDocx);
    zip.folder("Sales")?.file(`${slug}-quote-template.xlsx`, quoteXlsx);
    zip.folder("Sales")?.file(`${slug}-rate-card.xlsx`, rateCardXlsx);
    zip.folder("Brand")?.file(`${slug}-brand-guidelines.pdf`, guidelinesPdf);
    proLines.push(
      "/Stationery       — editable Word envelope (#10) + \"with compliments\" slip",
      "/Sales            — quote template (Excel) + a rate card / pricing sheet (Excel)",
      "/Brand            — brand guidelines as a shareable PDF, alongside the editable Word copy",
    );

    if (nodes.fbCover) {
      const fbCoverPng = await captureNodePng(nodes.fbCover, EXPORT_PIXEL_RATIO.fbCover);
      zip.folder("Social Media")?.file(`${slug}-facebook-cover.png`, fbCoverPng);
      proLines.push("/Social Media     — Facebook cover banner (820x312)");
    }
    if (nodes.linkedinCover) {
      const linkedinCoverPng = await captureNodePng(nodes.linkedinCover, EXPORT_PIXEL_RATIO.linkedinCover);
      zip.folder("Social Media")?.file(`${slug}-linkedin-cover.png`, linkedinCoverPng);
      proLines.push("/Social Media     — LinkedIn cover banner (1584x396)");
    }

    const [printReadyCard, printReadyLetterhead] = await Promise.all([
      addBleedAndCropMarks(cardPng, CARD_SIZE.width * EXPORT_PIXEL_RATIO.businessCard, CARD_SIZE.height * EXPORT_PIXEL_RATIO.businessCard),
      addBleedAndCropMarks(
        letterheadPng,
        LETTERHEAD_SIZE.width * EXPORT_PIXEL_RATIO.letterhead,
        LETTERHEAD_SIZE.height * EXPORT_PIXEL_RATIO.letterhead,
      ),
    ]);
    zip.folder("Print-Ready")?.file(`${slug}-business-card-print-ready.png`, printReadyCard);
    zip.folder("Print-Ready")?.file(`${slug}-letterhead-print-ready.png`, printReadyLetterhead);
    proLines.push(
      "/Print-Ready      — business card + letterhead with bleed and crop marks, 300 DPI RGB",
      "                    (ask your print shop if they need a CMYK-converted file — most digital",
      "                    print shops accept high-res RGB and convert it on their end)",
    );
  }

  const readme = `${name} — Brand Pack (${conceptName})
Generated by BrandPunk

/Business Cards   — 300 DPI PNG, ready to print
/Letterheads      — 300 DPI PNG + an editable Word (.docx) template
/Social Media     — Instagram-ready PNG
/Sales            — editable Excel (.xlsx) invoice template
/Digital          — HTML email signature (paste into your email client's signature settings)
/Brand            — a short Word (.docx) brand guidelines summary
${proLines.length ? proLines.join("\n") : ""}

Colours: ${analysis.primaryColor}, ${analysis.secondaryColor}, ${analysis.accentColor}
Heading font: ${analysis.headingFont}
Body font: ${analysis.bodyFont}
`;
  zip.file("README.txt", readme);

  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, `${slug}-brand-pack${isPro ? "-pro" : ""}.zip`);
}
