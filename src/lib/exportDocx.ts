import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { BrandAnalysis } from "./analyzeBrand";
import { rasterizeToPng } from "./imageUtils";
import type { BrandIntake } from "./types";

/** Builds an editable Word letterhead template branded with the chosen concept. */
export async function buildLetterheadDocx(intake: BrandIntake, analysis: BrandAnalysis, name: string): Promise<Blob> {
  const children: Paragraph[] = [];

  if (intake.logo) {
    const { bytes, width, height } = await rasterizeToPng(intake.logo.dataUrl, 600);
    const ratio = width / height;
    const logoHeight = 60;
    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            type: "png",
            data: bytes,
            transformation: { width: Math.round(logoHeight * ratio), height: logoHeight },
          }),
        ],
      }),
    );
  }

  children.push(
    new Paragraph({
      spacing: { before: 200, after: 0 },
      children: [
        new TextRun({
          text: name,
          bold: true,
          size: 36,
          font: analysis.headingFont,
          color: analysis.primaryColor.replace("#", ""),
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: analysis.accentColor.replace("#", "") } },
      children: [
        new TextRun({
          text: intake.business.tagline || "",
          italics: true,
          size: 20,
          font: analysis.bodyFont,
          color: "666666",
        }),
      ],
    }),
  );

  // Blank body space for the letter itself
  for (let i = 0; i < 10; i++) {
    children.push(new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 200 } }));
  }

  const contactLine = [intake.business.address, intake.business.phone, intake.business.email, intake.business.websiteUrl]
    .filter(Boolean)
    .join("  |  ");

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" } },
      spacing: { before: 400 },
      children: [new TextRun({ text: contactLine, size: 16, font: analysis.bodyFont, color: "888888" })],
    }),
  );

  const doc = new Document({
    sections: [{ properties: {}, children }],
    styles: { default: { heading1: { run: { font: analysis.headingFont } } } },
  });

  return Packer.toBlob(doc);
}

/** Builds a simple editable Word brand-guidelines summary. */
export async function buildBrandGuidelinesDocx(
  intake: BrandIntake,
  analysis: BrandAnalysis,
  conceptName: string,
  name: string,
): Promise<Blob> {
  const colorRow = (label: string, hex: string) =>
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: "■  ", color: hex.replace("#", ""), size: 28 }),
        new TextRun({ text: `${label} — ${hex}`, size: 22, font: analysis.bodyFont }),
      ],
    });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            children: [new TextRun({ text: `${name} — Brand Guidelines`, font: analysis.headingFont })],
          }),
          new Paragraph({
            spacing: { after: 300 },
            children: [new TextRun({ text: `Direction: ${conceptName}`, italics: true, size: 22 })],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200 },
            children: [new TextRun({ text: "Colours" })],
          }),
          colorRow("Primary", analysis.primaryColor),
          colorRow("Secondary", analysis.secondaryColor),
          colorRow("Accent", analysis.accentColor),
          colorRow("Background", analysis.backgroundColor),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300 },
            children: [new TextRun({ text: "Typography" })],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: `Heading font: ${analysis.headingFont}`, size: 22 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: `Body font: ${analysis.bodyFont}`, size: 22 })],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300 },
            children: [new TextRun({ text: "Contact" })],
          }),
          ...[intake.business.address, intake.business.phone, intake.business.email, intake.business.websiteUrl]
            .filter(Boolean)
            .map((line) => new Paragraph({ children: [new TextRun({ text: line, size: 22 })] })),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}
