import { NextResponse, type NextRequest } from "next/server";

import { PdfLibContentInspector } from "@/modules/content/adapters/pdf-lib-content-inspector";
import { SupabasePrivateContentPublisher } from "@/modules/content/adapters/supabase-private-content-publisher";
import {
  ContentPdfCleanupError,
  ContentPdfValidationError,
  publishContentPdf,
} from "@/modules/content/application/publish-content-pdf";
import { MAX_SOURCE_PDF_BYTES } from "@/modules/content/application/run-content-watermark-worker";
import {
  AuthenticationRequiredError,
  requireAdmin,
} from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

const MULTIPART_OVERHEAD_BYTES = 512 * 1024;

function requestOriginAllowed(request: NextRequest) {
  const configuredUrl = environment().MEMBER_APP_URL;
  const expectedOrigin = configuredUrl
    ? new URL(configuredUrl).origin
    : request.nextUrl.origin;
  return request.headers.get("origin") === expectedOrigin;
}

function validationStatus(error: ContentPdfValidationError) {
  if (error.message === "source_pdf_size_out_of_bounds") return 413;
  return 422;
}

export async function POST(request: NextRequest) {
  const config = environment();
  if (!config.FEATURE_ADMIN || !config.FEATURE_CONTENT) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }
  if (!requestOriginAllowed(request)) {
    return NextResponse.json({ code: "origin_not_allowed" }, { status: 403 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_SOURCE_PDF_BYTES + MULTIPART_OVERHEAD_BYTES
  ) {
    return NextResponse.json(
      { code: "source_pdf_size_out_of_bounds" },
      { status: 413 },
    );
  }

  try {
    await requireAdmin();
  } catch (error) {
    const status = error instanceof AuthenticationRequiredError ? 403 : 500;
    return NextResponse.json(
      { code: status === 403 ? "admin_required" : "identity_unavailable" },
      { status },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { code: "invalid_multipart_body" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  const productCode = form.get("productCode");
  const title = form.get("title");
  if (
    !(file instanceof File) ||
    typeof productCode !== "string" ||
    typeof title !== "string"
  ) {
    return NextResponse.json(
      { code: "invalid_upload_fields" },
      { status: 400 },
    );
  }

  try {
    const client = await createSupabaseServerClient();
    const result = await publishContentPdf({
      bytes: new Uint8Array(await file.arrayBuffer()),
      contentType: file.type,
      inspector: new PdfLibContentInspector(),
      productCode,
      publisher: new SupabasePrivateContentPublisher(client),
      title,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ContentPdfValidationError) {
      return NextResponse.json(
        { code: error.message },
        { status: validationStatus(error) },
      );
    }
    if (error instanceof ContentPdfCleanupError) {
      return NextResponse.json(
        { code: "content_pdf_cleanup_required" },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { code: "content_pdf_publish_failed" },
      { status: 500 },
    );
  }
}
