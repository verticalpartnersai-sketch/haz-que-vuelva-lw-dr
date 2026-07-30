import { NextResponse } from "next/server";

import { SupabaseContentAccess } from "@/modules/content/adapters/supabase-content-access";
import {
  ContentAccessDeniedError,
  ContentFileNotFoundError,
  requestFileAccess,
  WatermarkedFilePendingError,
} from "@/modules/content/application/request-file-access";
import {
  AuthenticationRequiredError,
  currentIdentity,
} from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

type RouteContext = {
  params: Promise<{ fileId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  if (!environment().FEATURE_CONTENT) {
    return NextResponse.json({ code: "feature_unavailable" }, { status: 503 });
  }

  try {
    const identity = await currentIdentity();
    const { fileId } = await context.params;
    const access = await requestFileAccess({
      fileId,
      gateway: new SupabaseContentAccess(createSupabaseServiceClient()),
      memberId: identity.id,
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
