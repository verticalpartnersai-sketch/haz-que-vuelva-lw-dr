import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { SupabaseReadingProgress } from "@/modules/content/adapters/supabase-reading-progress";
import {
  ReadingProgressAccessDeniedError,
  ReadingProgressValidationError,
  saveReadingProgress,
} from "@/modules/content/application/save-reading-progress";
import {
  AuthenticationRequiredError,
  currentIdentity,
} from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";
import { isSameOriginMutation } from "@/server/security/request-origin";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

const MAX_BODY_BYTES = 1024;
const requestSchema = z.object({
  progressPercent: z.number().int().min(0).max(100),
});

type RouteContext = {
  params: Promise<{ productCode: string }>;
};

async function readRequest(request: NextRequest) {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return null;
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return null;
  try {
    return requestSchema.safeParse(JSON.parse(text));
  } catch {
    return requestSchema.safeParse(null);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const config = environment();
  if (!config.FEATURE_CONTENT) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }
  if (!isSameOriginMutation(request, config.MEMBER_APP_URL)) {
    return NextResponse.json({ code: "origin_not_allowed" }, { status: 403 });
  }

  const parsed = await readRequest(request);
  if (!parsed?.success) {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  try {
    await currentIdentity();
    const { productCode } = await context.params;
    const progress = await saveReadingProgress({
      gateway: new SupabaseReadingProgress(
        await createSupabaseServerClient(),
      ),
      productCode,
      progressPercent: parsed.data.progressPercent,
    });
    return NextResponse.json(progress, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json(
        { code: "authentication_required" },
        { status: 401 },
      );
    }
    if (error instanceof ReadingProgressValidationError) {
      return NextResponse.json({ code: "invalid_request" }, { status: 400 });
    }
    if (error instanceof ReadingProgressAccessDeniedError) {
      return NextResponse.json({ code: "access_denied" }, { status: 403 });
    }
    throw error;
  }
}
