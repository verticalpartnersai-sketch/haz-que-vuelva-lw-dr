import {
  degrees,
  PDFDocument,
  rgb,
  StandardFonts,
} from "pdf-lib";

import {
  PermanentWatermarkError,
  type PdfWatermarkRenderer,
  type WatermarkRenderInput,
} from "../application/run-content-watermark-worker.ts";

const BRAND = "HAZ QUE VUELVA";

export class PdfLibWatermarkRenderer implements PdfWatermarkRenderer {
  async render(input: WatermarkRenderInput) {
    let document: PDFDocument;
    try {
      document = await PDFDocument.load(input.bytes, {
        updateMetadata: false,
      });
    } catch {
      throw new PermanentWatermarkError("invalid_source_pdf");
    }

    if (document.isEncrypted) {
      throw new PermanentWatermarkError("encrypted_source_pdf");
    }

    const pages = document.getPages();
    if (pages.length === 0 || pages.length > input.maxPages) {
      throw new PermanentWatermarkError("source_pdf_page_count_out_of_bounds");
    }

    const font = await document.embedFont(StandardFonts.Helvetica);
    const marker = input.auditMarker.toUpperCase();
    const diagonalLabel = `${BRAND} | COPIA INDIVIDUAL | ${marker}`;
    const footerLabel = `${BRAND} | ${marker}`;

    for (const page of pages) {
      const { height, width } = page.getSize();
      const diagonalSize = Math.max(16, Math.min(38, width / 18));
      const diagonalWidth = font.widthOfTextAtSize(
        diagonalLabel,
        diagonalSize,
      );
      page.drawText(diagonalLabel, {
        color: rgb(0.66, 0.08, 0.1),
        font,
        opacity: 0.13,
        rotate: degrees(32),
        size: diagonalSize,
        x: Math.max(12, (width - diagonalWidth * 0.72) / 2),
        y: Math.max(36, height * 0.42),
      });

      const footerSize = Math.max(6, Math.min(8, width / 70));
      const footerWidth = font.widthOfTextAtSize(footerLabel, footerSize);
      page.drawText(footerLabel, {
        color: rgb(0.23, 0.23, 0.23),
        font,
        opacity: 0.55,
        size: footerSize,
        x: Math.max(12, (width - footerWidth) / 2),
        y: 10,
      });
    }

    document.setProducer(BRAND);
    document.setSubject(`Copia individual ${marker}`);
    document.setKeywords([BRAND, "copia individual", marker]);
    return document.save({ useObjectStreams: true });
  }
}
