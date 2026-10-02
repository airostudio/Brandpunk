import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  PageOrientation,
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

/** Builds an editable Word #10 envelope template (9.5in x 4.125in, landscape). */
export async function buildEnvelopeDocx(intake: BrandIntake, analysis: BrandAnalysis, name: string): Promise<Blob> {
  const children: Paragraph[] = [];

  if (intake.logo) {
    const { bytes, width, height } = await rasterizeToPng(intake.logo.dataUrl, 400);
    const ratio = width / height;
    const logoHeight = 36;
    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            type: "png",
            data: bytes,
            transformation: { width: Math.round(logoHeight * ratio), height: logoHeight },
          }),
          new TextRun({ text: `   ${name}`, bold: true, size: 24, font: analysis.headingFont, color: analysis.primaryColor.replace("#", "") }),
        ],
      }),
    );
  } else {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: name, bold: true, size: 24, font: analysis.headingFont, color: analysis.primaryColor.replace("#", "") })],
      }),
    );
  }

  const returnAddress = [intake.business.address, intake.business.phone, intake.business.email]
    .filter(Boolean)
    .join("\n");
  returnAddress.split("\n").forEach((line) => {
    children.push(new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: line, size: 18, font: analysis.bodyFont, color: "666666" })] }));
  });

  // Blank space, then a placeholder recipient block positioned roughly center-right.
  for (let i = 0; i < 4; i++) children.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
  children.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: "[ Recipient Name ]\n[ Address Line 1 ]\n[ City, State  ZIP ]", size: 20, font: analysis.bodyFont })],
    }),
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 13680, height: 5940, orientation: PageOrientation.LANDSCAPE },
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

/** Builds an editable Word "with compliments" slip (roughly 1/3 A4). */
export async function buildComplimentsSlipDocx(intake: BrandIntake, analysis: BrandAnalysis, name: string): Promise<Blob> {
  const children: Paragraph[] = [];

  if (intake.logo) {
    const { bytes, width, height } = await rasterizeToPng(intake.logo.dataUrl, 400);
    const ratio = width / height;
    const logoHeight = 40;
    children.push(
      new Paragraph({
        children: [new ImageRun({ type: "png", data: bytes, transformation: { width: Math.round(logoHeight * ratio), height: logoHeight } })],
      }),
    );
  }

  children.push(
    new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: name, bold: true, size: 28, font: analysis.headingFont, color: analysis.primaryColor.replace("#", "") })],
    }),
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: analysis.accentColor.replace("#", "") } },
      spacing: { after: 300 },
      children: [new TextRun({ text: "With Compliments", italics: true, size: 22, font: analysis.bodyFont, color: "666666" })],
    }),
  );

  for (let i = 0; i < 4; i++) children.push(new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 200 } }));

  const contactLine = [intake.business.phone, intake.business.email, intake.business.websiteUrl].filter(Boolean).join("  |  ");
  children.push(
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" } },
      spacing: { before: 200 },
      children: [new TextRun({ text: contactLine, size: 16, font: analysis.bodyFont, color: "888888" })],
    }),
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11905, height: 5612 },
            margin: { top: 500, bottom: 500, left: 500, right: 500 },
          },
        },
        children,
      },
    ],
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
