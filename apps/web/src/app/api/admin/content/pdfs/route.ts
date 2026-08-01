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
  ADMIN_REAUTH_COOKIE,
  AdminReauthenticationError,
  AdminReauthenticationRequiredError,
  hashAdminReauthenticationToken,
} from "@/modules/identity/application/admin-reauthentication";
import {
  AuthenticationRequiredError,
  requireAdmin,
} from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";
import { isSameOriginMutation } from "@/server/security/request-origin";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

const MULTIPART_OVERHEAD_BYTES = 512 * 1024;

function validationStatus(error: ContentPdfValidationError) {
  if (error.message === "source_pdf_size_out_of_bounds") return 413;
  return 422;
}

function reauthenticationRequiredResponse(request: NextRequest) {
  const response = NextResponse.json(
    { code: "admin_reauthentication_required" },
    { status: 428 },
  );
  response.cookies.set(ADMIN_REAUTH_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/api/admin",
    sameSite: "strict",
    secure: request.nextUrl.protocol === "https:",
  });
  return response;
}

export async function POST(request: NextRequest) {
  const config = environment();
  if (!config.FEATURE_ADMIN || !config.FEATURE_CONTENT) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }
  if (!isSameOriginMutation(request, config.MEMBER_APP_URL)) {
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

  const reauthenticationToken = request.cookies.get(ADMIN_REAUTH_COOKIE)?.value;
  let reauthenticationTokenHash: string;
  try {
    reauthenticationTokenHash = await hashAdminReauthenticationToken(
      reauthenticationToken ?? "",
    );
  } catch (error) {
    if (error instanceof AdminReauthenticationError) {
      return reauthenticationRequiredResponse(request);
    }
    throw error;
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
    const metadataClient = await createSupabaseServerClient();
    const storageClient = createSupabaseServiceClient();
    const result = await publishContentPdf({
      bytes: new Uint8Array(await file.arrayBuffer()),
      contentType: file.type,
      inspector: new PdfLibContentInspector(),
      productCode,
      publisher: new SupabasePrivateContentPublisher(
        metadataClient,
        storageClient,
      ),
      reauthenticationTokenHash,
      title,
    });
    const response = NextResponse.json(result, { status: 201 });
    response.cookies.set(ADMIN_REAUTH_COOKIE, "", {
      httpOnly: true,
      maxAge: 0,
      path: "/api/admin",
      sameSite: "strict",
      secure: request.nextUrl.protocol === "https:",
    });
    return response;
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
    if (error instanceof AdminReauthenticationRequiredError) {
      return reauthenticationRequiredResponse(request);
    }
    return NextResponse.json(
      { code: "content_pdf_publish_failed" },
      { status: 500 },
    );
  }
}
