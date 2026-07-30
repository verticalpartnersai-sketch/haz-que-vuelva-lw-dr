import { isProductCode } from "../../catalog/domain/product.ts";
import {
  MAX_SOURCE_PDF_BYTES,
  MAX_SOURCE_PDF_PAGES,
} from "./run-content-watermark-worker.ts";

const PDF_MIME_TYPE = "application/pdf";
const PDF_HEADER = "%PDF-";
const SOURCE_BUCKET = "product-content";

export class ContentPdfValidationError extends Error {}
export class ContentPdfCleanupError extends Error {}

export type ContentPdfInspection = {
  pageCount: number;
};

export type PublishedContentPdf = {
  contentFileId: string;
  contentItemId: string;
  version: number;
};

export interface ContentPdfInspector {
  inspect(bytes: Uint8Array): Promise<ContentPdfInspection>;
}

export interface PrivateContentPublisher {
  upload(input: {
    bucket: string;
    bytes: Uint8Array;
    contentType: string;
    path: string;
  }): Promise<void>;
  persist(input: {
    bucket: string;
    contentType: string;
    path: string;
    productCode: string;
    sha256: string;
    sizeBytes: number;
    title: string;
  }): Promise<PublishedContentPdf>;
  remove(bucket: string, path: string): Promise<void>;
}

function validatePdfHeader(bytes: Uint8Array) {
  const header = new TextDecoder("latin1").decode(bytes.slice(0, 1024));
  if (!header.includes(PDF_HEADER)) {
    throw new ContentPdfValidationError("invalid_pdf_signature");
  }
}

async function sha256(bytes: Uint8Array) {
  const body = bytes.slice().buffer as ArrayBuffer;
  const digest = await crypto.subtle.digest("SHA-256", body);
  return Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
}

export async function publishContentPdf({
  bytes,
  contentType,
  inspector,
  productCode,
  publisher,
  title,
}: {
  bytes: Uint8Array;
  contentType: string;
  inspector: ContentPdfInspector;
  productCode: string;
  publisher: PrivateContentPublisher;
  title: string;
}) {
  const normalizedTitle = title.trim();
  if (!isProductCode(productCode)) {
    throw new ContentPdfValidationError("invalid_product_code");
  }
  if (normalizedTitle.length < 3 || normalizedTitle.length > 160) {
    throw new ContentPdfValidationError("invalid_content_title");
  }
  if (contentType.toLowerCase() !== PDF_MIME_TYPE) {
    throw new ContentPdfValidationError("invalid_pdf_mime_type");
  }
  if (bytes.byteLength <= 0 || bytes.byteLength > MAX_SOURCE_PDF_BYTES) {
    throw new ContentPdfValidationError("source_pdf_size_out_of_bounds");
  }

  validatePdfHeader(bytes);
  const inspection = await inspector.inspect(bytes);
  if (
    inspection.pageCount <= 0 ||
    inspection.pageCount > MAX_SOURCE_PDF_PAGES
  ) {
    throw new ContentPdfValidationError(
      "source_pdf_page_count_out_of_bounds",
    );
  }

  const path = `products/${productCode}/${crypto.randomUUID()}.pdf`;
  const hash = await sha256(bytes);
  await publisher.upload({
    bucket: SOURCE_BUCKET,
    bytes,
    contentType: PDF_MIME_TYPE,
    path,
  });

  try {
    const published = await publisher.persist({
      bucket: SOURCE_BUCKET,
      contentType: PDF_MIME_TYPE,
      path,
      productCode,
      sha256: hash,
      sizeBytes: bytes.byteLength,
      title: normalizedTitle,
    });
    return { ...published, pageCount: inspection.pageCount };
  } catch (error) {
    try {
      await publisher.remove(SOURCE_BUCKET, path);
    } catch {
      throw new ContentPdfCleanupError(
        "content_pdf_persist_failed_cleanup_required",
        { cause: error },
      );
    }
    throw error;
  }
}
