import ExcelJS from "exceljs";
import type { BrandAnalysis } from "./analyzeBrand";
import { rasterizeToPng } from "./imageUtils";
import type { BrandIntake } from "./types";

function hex(color: string): string {
  return `FF${color.replace("#", "").toUpperCase()}`;
}

/** Shared builder for the invoice and quote templates — same layout, different title/fields. */
async function buildDocumentXlsx(
  intake: BrandIntake,
  analysis: BrandAnalysis,
  name: string,
  opts: { sheetName: string; title: string; numberLabel: string; numberValue: string; extraLabel: string },
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = name;
  const sheet = workbook.addWorksheet(opts.sheetName, {
    pageSetup: { paperSize: 9, orientation: "portrait" },
  });

  sheet.columns = [
    { width: 4 },
    { width: 34 },
    { width: 10 },
    { width: 14 },
    { width: 16 },
  ];

  if (intake.logo) {
    const { bytes, width, height } = await rasterizeToPng(intake.logo.dataUrl, 500);
    const imageId = workbook.addImage({ buffer: bytes as unknown as ExcelJS.Buffer, extension: "png" });
    const ratio = width / height;
    const h = 50;
    sheet.addImage(imageId, {
      tl: { col: 1, row: 0.3 },
      ext: { width: h * ratio, height: h },
    });
  }

  sheet.mergeCells("B1:E1");
  sheet.getCell("B1").value = intake.logo ? "" : name;
  sheet.getRow(1).height = 40;

  sheet.mergeCells("B3:E3");
  const titleCell = sheet.getCell("B3");
  titleCell.value = opts.title;
  titleCell.font = { bold: true, size: 20, color: { argb: hex(analysis.primaryColor) } };

  sheet.getCell("B5").value = opts.numberLabel;
  sheet.getCell("C5").value = opts.numberValue;
  sheet.getCell("B6").value = "Date";
  sheet.getCell("C6").value = new Date().toLocaleDateString();
  sheet.getCell("B7").value = opts.extraLabel;
  sheet.getCell("C7").value = "";
  [5, 6, 7].forEach((row) => {
    sheet.getCell(`B${row}`).font = { bold: true, size: 10, color: { argb: "FF666666" } };
  });

  const headerRow = sheet.getRow(9);
  headerRow.values = ["", "Description", "Qty", "Rate", "Amount"];
  headerRow.eachCell((cell, col) => {
    if (col === 1) return;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: hex(analysis.primaryColor) } };
    cell.font = { bold: true, color: { argb: hex(analysis.backgroundColor) } };
    cell.alignment = { vertical: "middle" };
  });
  headerRow.height = 22;

  const firstItemRow = 10;
  const itemRows = 6;
  for (let i = 0; i < itemRows; i++) {
    const row = sheet.getRow(firstItemRow + i);
    row.getCell(2).value = "";
    row.getCell(3).value = "";
    row.getCell(4).value = "";
    row.getCell(5).value = {
      formula: `IF(AND(C${firstItemRow + i}<>"",D${firstItemRow + i}<>""),C${firstItemRow + i}*D${firstItemRow + i},"")`,
    };
    for (let col = 2; col <= 5; col++) {
      row.getCell(col).border = { bottom: { style: "thin", color: { argb: "FFE5E5E5" } } };
    }
  }

  const totalRow = firstItemRow + itemRows + 1;
  sheet.getCell(`D${totalRow}`).value = "Total";
  sheet.getCell(`D${totalRow}`).font = { bold: true };
  sheet.getCell(`D${totalRow}`).alignment = { horizontal: "right" };
  sheet.getCell(`E${totalRow}`).value = {
    formula: `SUM(E${firstItemRow}:E${firstItemRow + itemRows - 1})`,
  };
  sheet.getCell(`E${totalRow}`).font = { bold: true, color: { argb: hex(analysis.primaryColor) } };
  sheet.getCell(`E${totalRow}`).numFmt = '"$"#,##0.00';
  sheet.getCell(`E${totalRow}`).border = { top: { style: "medium", color: { argb: hex(analysis.accentColor) } } };

  const footerRow = totalRow + 3;
  const contact = [intake.business.phone, intake.business.email, intake.business.websiteUrl].filter(Boolean).join("   •   ");
  sheet.mergeCells(`B${footerRow}:E${footerRow}`);
  sheet.getCell(`B${footerRow}`).value = contact;
  sheet.getCell(`B${footerRow}`).font = { size: 9, color: { argb: "FF999999" } };

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

/** Builds an editable Excel invoice template branded with the chosen concept. */
export function buildInvoiceXlsx(intake: BrandIntake, analysis: BrandAnalysis, name: string): Promise<Blob> {
  return buildDocumentXlsx(intake, analysis, name, {
    sheetName: "Invoice",
    title: "INVOICE",
    numberLabel: "Invoice #",
    numberValue: "INV-0001",
    extraLabel: "Bill To",
  });
}

/** Builds an editable Excel quote template branded with the chosen concept (Pro). */
export function buildQuoteXlsx(intake: BrandIntake, analysis: BrandAnalysis, name: string): Promise<Blob> {
  return buildDocumentXlsx(intake, analysis, name, {
    sheetName: "Quote",
    title: "QUOTE",
    numberLabel: "Quote #",
    numberValue: "Q-0001",
    extraLabel: "Prepared For",
  });
}

/** Builds an editable Excel rate card / pricing sheet (Pro) — a differentiator no mainstream brand-kit tool offers. */
export async function buildRateCardXlsx(intake: BrandIntake, analysis: BrandAnalysis, name: string): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = name;
  const sheet = workbook.addWorksheet("Rate Card", { pageSetup: { paperSize: 9, orientation: "portrait" } });

  sheet.columns = [{ width: 4 }, { width: 34 }, { width: 16 }, { width: 24 }];

  sheet.mergeCells("B2:D2");
  const titleCell = sheet.getCell("B2");
  titleCell.value = `${name} — Rate Card`;
  titleCell.font = { bold: true, size: 20, color: { argb: hex(analysis.primaryColor) } };
  sheet.getRow(2).height = 32;

  sheet.mergeCells("B3:D3");
  sheet.getCell("B3").value = `Effective ${new Date().toLocaleDateString()}`;
  sheet.getCell("B3").font = { italic: true, size: 10, color: { argb: "FF888888" } };

  const headerRow = sheet.getRow(5);
  headerRow.values = ["", "Service / Package", "Rate", "Notes"];
  headerRow.eachCell((cell, col) => {
    if (col === 1) return;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: hex(analysis.primaryColor) } };
    cell.font = { bold: true, color: { argb: hex(analysis.backgroundColor) } };
    cell.alignment = { vertical: "middle" };
  });
  headerRow.height = 22;

  const firstRow = 6;
  const rowCount = 10;
  for (let i = 0; i < rowCount; i++) {
    const row = sheet.getRow(firstRow + i);
    row.getCell(2).value = "";
    row.getCell(3).value = "";
    row.getCell(3).numFmt = '"$"#,##0.00';
    row.getCell(4).value = "";
    for (let col = 2; col <= 4; col++) {
      row.getCell(col).border = { bottom: { style: "thin", color: { argb: "FFE5E5E5" } } };
    }
  }

  const footerRow = firstRow + rowCount + 2;
  const contact = [intake.business.phone, intake.business.email, intake.business.websiteUrl].filter(Boolean).join("   •   ");
  sheet.mergeCells(`B${footerRow}:D${footerRow}`);
  sheet.getCell(`B${footerRow}`).value = contact;
  sheet.getCell(`B${footerRow}`).font = { size: 9, color: { argb: "FF999999" } };

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
