import { NextResponse, type NextRequest } from "next/server";

import { SupabasePasswordVerifier } from "@/modules/identity/adapters/supabase-password-verifier";
import {
  ADMIN_REAUTH_COOKIE,
  ADMIN_REAUTH_TTL_SECONDS,
  AdminReauthenticationError,
  createAdminReauthenticationToken,
  hashAdminReauthenticationToken,
  verifyAdminPassword,
} from "@/modules/identity/application/admin-reauthentication";
import {
  AdminMfaRequiredError,
  AuthenticationRequiredError,
  requireAdmin,
} from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";
import { isSameOriginMutation } from "@/server/security/request-origin";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

const MAX_BODY_BYTES = 1024;

export async function POST(request: NextRequest) {
  const config = environment();
  if (!config.FEATURE_AUTH || !config.FEATURE_ADMIN) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }
  if (!isSameOriginMutation(request, config.MEMBER_APP_URL)) {
    return NextResponse.json({ code: "origin_not_allowed" }, { status: 403 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ code: "invalid_request" }, { status: 413 });
  }

  let identity;
  try {
    identity = await requireAdmin();
  } catch (error) {
    if (error instanceof AdminMfaRequiredError) {
      return NextResponse.json({ code: "mfa_required" }, { status: 403 });
    }
    const status = error instanceof AuthenticationRequiredError ? 403 : 500;
    return NextResponse.json(
      { code: status === 403 ? "admin_required" : "identity_unavailable" },
      { status },
    );
  }

  let password: string;
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  try {
    await verifyAdminPassword({
      email: identity.email,
      password,
      verifier: new SupabasePasswordVerifier(
        config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        config.NEXT_PUBLIC_SUPABASE_URL!,
      ),
    });

    const token = createAdminReauthenticationToken();
    const tokenHash = await hashAdminReauthenticationToken(token);
    const client = createSupabaseServiceClient();
    const { error } = await client.rpc("begin_admin_reauthentication", {
      p_actor_id: identity.id,
      p_token_hash: tokenHash,
    });
    if (error) throw new Error(`admin_reauthentication_persist_failed:${error.code}`);

    const response = NextResponse.json({
      expiresInSeconds: ADMIN_REAUTH_TTL_SECONDS,
    });
    response.cookies.set(ADMIN_REAUTH_COOKIE, token, {
      httpOnly: true,
      maxAge: ADMIN_REAUTH_TTL_SECONDS,
      path: "/api/admin",
      sameSite: "strict",
      secure: request.nextUrl.protocol === "https:",
    });
    return response;
  } catch (error) {
    if (error instanceof AdminReauthenticationError) {
      return NextResponse.json(
        { code: "admin_reauthentication_failed" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { code: "admin_reauthentication_unavailable" },
      { status: 503 },
    );
  }
}
