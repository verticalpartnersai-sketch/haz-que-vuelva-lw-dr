import { NextResponse, type NextRequest } from "next/server";

import { SupabaseContentAccess } from "@/modules/content/adapters/supabase-content-access";
import {
  ContentAccessDeniedError,
  ContentFileNotFoundError,
  requestFileAccess,
  WatermarkedFilePendingError,
  type ContentAccessPurpose,
} from "@/modules/content/application/request-file-access";
import {
  AuthenticationRequiredError,
  currentIdentity,
} from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";
import { readBoundedJsonBody } from "@/server/http/read-bounded-json-body";
import { isSameOriginMutation } from "@/server/security/request-origin";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

type RouteContext = {
  params: Promise<{ fileId: string }>;
};

function accessPurpose(payload: unknown): ContentAccessPurpose | null {
  if (!payload || typeof payload !== "object") return null;
  const purpose = (payload as { purpose?: unknown }).purpose;
  return purpose === "view" || purpose === "download" ? purpose : null;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const config = environment();
  if (!config.FEATURE_CONTENT) {
    return NextResponse.json({ code: "feature_unavailable" }, { status: 503 });
  }
  if (!isSameOriginMutation(request, config.MEMBER_APP_URL)) {
    return NextResponse.json({ code: "origin_not_allowed" }, { status: 403 });
  }

  const body = await readBoundedJsonBody(request, 256);
  if (!body.ok) {
    return NextResponse.json(
      { code: "invalid_request" },
      { status: body.reason === "too_large" ? 413 : 400 },
    );
  }
  const purpose = accessPurpose(body.value);
  if (!purpose) {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  try {
    const identity = await currentIdentity();
    const { fileId } = await context.params;
    const access = await requestFileAccess({
      fileId,
      gateway: new SupabaseContentAccess(createSupabaseServiceClient()),
      memberId: identity.id,
      purpose,
    });
    return NextResponse.json(access, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ code: "authentication_required" }, { status: 401 });
    }
    if (error instanceof ContentFileNotFoundError) {
      return NextResponse.json({ code: "file_not_found" }, { status: 404 });
    }
    if (error instanceof WatermarkedFilePendingError) {
      return NextResponse.json(
        { code: "watermark_pending", retryAfterSeconds: 3 },
        {
          headers: {
            "Cache-Control": "no-store",
            "Retry-After": "3",
          },
          status: 202,
        },
      );
    }
    if (error instanceof ContentAccessDeniedError) {
      return NextResponse.json({ code: "access_denied" }, { status: 403 });
    }
    throw error;
  }
}
