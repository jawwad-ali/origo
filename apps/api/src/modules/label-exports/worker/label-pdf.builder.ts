import { type Writable } from "node:stream";
import { finished } from "node:stream/promises";
import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { QrSigningService } from "../../qr-signing/qr-signing.service";
import { COLORS, FONTS, LABEL, LABELS_PER_SHEET, labelOrigin, SHEET } from "./label-sheet.layout";

export interface LabelSheetInfo {
  maker: string;
  productName: string;
  strength: string;
  packSize: string;
  batchNumber: string;
  expiry: string;
  totalLabels: number;
}

type Doc = InstanceType<typeof PDFDocument>;

/**
 * Writes a print-ready PDF of signed QR labels. QR codes are drawn as vector rectangles
 * (crisp at any print resolution), one run per row of dark modules to keep the file small.
 */
@Injectable()
export class LabelPdfBuilder {
  constructor(private readonly qr: QrSigningService) {}

  async build(
    info: LabelSheetInfo,
    publicIdPages: AsyncIterable<string[]>,
    out: Writable,
    onProgress: (done: number) => Promise<void>,
  ): Promise<void> {
    const doc = new PDFDocument({ size: [SHEET.width, SHEET.height], margin: 0, autoFirstPage: false });
    doc.info.Title = `Origo labels · ${info.productName} · Batch ${info.batchNumber}`;
    doc.info.Creator = "Origo";
    doc.pipe(out);

    const sheets = Math.ceil(info.totalLabels / LABELS_PER_SHEET);
    let index = 0;
    for await (const page of publicIdPages) {
      for (const publicId of page) {
        if (index % LABELS_PER_SHEET === 0) this.startSheet(doc, info, index / LABELS_PER_SHEET + 1, sheets);
        this.drawLabel(doc, info, publicId, index);
        index += 1;
      }
      await onProgress(index);
    }

    doc.end();
    await finished(out);
  }

  private startSheet(doc: Doc, info: LabelSheetInfo, sheet: number, sheets: number): void {
    doc.addPage();
    doc
      .font(FONTS.regular)
      .fontSize(6)
      .fillColor(COLORS.muted)
      .text(
        `Origo · ${info.productName} ${info.strength} · Batch ${info.batchNumber} · Sheet ${sheet} of ${sheets}`,
        SHEET.marginLeft,
        SHEET.height - 9 * 2.8346,
        { lineBreak: false },
      );
  }

  private drawLabel(doc: Doc, info: LabelSheetInfo, publicId: string, index: number): void {
    const { x, y } = labelOrigin(index);
    const qrX = x + LABEL.padding;
    const qrY = y + (SHEET.labelHeight - LABEL.qrSize) / 2;
    this.drawQr(doc, this.qr.verifyUrlFor(publicId), qrX, qrY, LABEL.qrSize);

    const textX = qrX + LABEL.qrSize + LABEL.gap;
    const textWidth = x + SHEET.labelWidth - LABEL.padding - textX;
    // Text block spans exactly the QR's height: product details top-aligned, print data bottom-aligned.
    const top = qrY;
    const bottom = qrY + LABEL.qrSize;
    const line = (text: string, font: string, size: number, color: string, at: number): void => {
      doc.font(font).fontSize(size).fillColor(color).text(text, textX, at, {
        width: textWidth,
        lineBreak: false,
        ellipsis: true,
      });
    };

    line(info.maker.toUpperCase(), FONTS.bold, 4.8, COLORS.brand, top);
    line(info.productName, FONTS.bold, 8.5, COLORS.ink, top + 8);
    line(`${info.strength} · ${info.packSize}`, FONTS.regular, 6, COLORS.ink, top + 19);
    line(`BATCH ${info.batchNumber}`, FONTS.mono, 5.6, COLORS.muted, bottom - 25);
    line(`EXP   ${info.expiry}`, FONTS.mono, 5.6, COLORS.muted, bottom - 18);
    line(publicId, FONTS.monoBold, 6.6, COLORS.ink, bottom - 7);
  }

  private drawQr(doc: Doc, text: string, x: number, y: number, size: number): void {
    const { modules } = QRCode.create(text, { errorCorrectionLevel: "M" });
    const cell = size / modules.size;
    for (let row = 0; row < modules.size; row += 1) {
      let runStart = -1;
      for (let col = 0; col <= modules.size; col += 1) {
        const dark = col < modules.size && Boolean(modules.get(row, col));
        if (dark && runStart < 0) runStart = col;
        if (!dark && runStart >= 0) {
          // A hair of overlap avoids white seams between rows in some PDF viewers.
          doc.rect(x + runStart * cell, y + row * cell, (col - runStart) * cell, cell + 0.05);
          runStart = -1;
        }
      }
    }
    doc.fillColor(COLORS.ink).fill();
  }
}
