import { NextResponse, type NextRequest } from "next/server";

import {
  AuthenticationRequiredError,
  requireAdmin,
} from "@/modules/identity/application/current-identity";
import type { Environment } from "@/server/config/environment";
import { isSameOriginMutation } from "@/server/security/request-origin";

export async function authorizeAdminMutation(
  request: NextRequest,
  config: Environment,
  maxBodyBytes: number,
) {
  if (!config.FEATURE_AUTH || !config.FEATURE_ADMIN) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }
  if (!isSameOriginMutation(request, config.MEMBER_APP_URL)) {
    return NextResponse.json({ code: "origin_not_allowed" }, { status: 403 });
  }
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > maxBodyBytes
  ) {
    return NextResponse.json({ code: "invalid_request" }, { status: 413 });
  }
  try {
    await requireAdmin();
    return null;
  } catch (error) {
    const status = error instanceof AuthenticationRequiredError ? 403 : 500;
    return NextResponse.json(
      { code: status === 403 ? "admin_required" : "identity_unavailable" },
      { status },
    );
  }
}
