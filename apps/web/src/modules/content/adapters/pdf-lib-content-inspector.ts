import { PDFDocument } from "pdf-lib";

import {
  ContentPdfValidationError,
  type ContentPdfInspector,
} from "../application/publish-content-pdf.ts";

export class PdfLibContentInspector implements ContentPdfInspector {
  async inspect(bytes: Uint8Array) {
    let document: PDFDocument;
    try {
      document = await PDFDocument.load(bytes, {
        updateMetadata: false,
      });
    } catch {
      throw new ContentPdfValidationError("invalid_source_pdf");
    }

    if (document.isEncrypted) {
      throw new ContentPdfValidationError("encrypted_source_pdf");
    }

    return { pageCount: document.getPageCount() };
  }
}
