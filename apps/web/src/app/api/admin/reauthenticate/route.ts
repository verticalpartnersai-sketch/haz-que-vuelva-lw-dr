import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { SupabaseAdminReauthenticationAttemptLimiter } from "@/modules/identity/adapters/supabase-admin-reauthentication-attempt-limiter";
import { SupabasePasswordVerifier } from "@/modules/identity/adapters/supabase-password-verifier";
import {
  ADMIN_REAUTH_COOKIE,
  ADMIN_REAUTH_TTL_SECONDS,
  AdminReauthenticationError,
  AdminReauthenticationRateLimitedError,
  createAdminReauthenticationToken,
  hashAdminReauthenticationToken,
  reserveAdminReauthenticationAttempt,
  verifyAdminPassword,
} from "@/modules/identity/application/admin-reauthentication";
import {
  AuthenticationRequiredError,
  requireAdmin,
} from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";
import { readBoundedJsonBody } from "@/server/http/read-bounded-json-body";
import { isSameOriginMutation } from "@/server/security/request-origin";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

const MAX_BODY_BYTES = 1024;
const schema = z.object({
  password: z.string().min(1).max(256),
});

export async function POST(request: NextRequest) {
  const config = environment();
  if (!config.FEATURE_AUTH || !config.FEATURE_ADMIN) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }
  if (!isSameOriginMutation(request, config.MEMBER_APP_URL)) {
    return NextResponse.json({ code: "origin_not_allowed" }, { status: 403 });
  }
  let identity;
  try {
    identity = await requireAdmin();
  } catch (error) {
    const status = error instanceof AuthenticationRequiredError ? 403 : 500;
    return NextResponse.json(
      { code: status === 403 ? "admin_required" : "identity_unavailable" },
      { status },
    );
  }

  const body = await readBoundedJsonBody(request, MAX_BODY_BYTES);
  if (!body.ok) {
    return NextResponse.json(
      { code: "invalid_request" },
      { status: body.reason === "too_large" ? 413 : 400 },
    );
  }
  const parsed = schema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  try {
    const client = createSupabaseServiceClient();
    await reserveAdminReauthenticationAttempt({
      actorId: identity.id,
      limiter: new SupabaseAdminReauthenticationAttemptLimiter(client),
    });
    await verifyAdminPassword({
      email: identity.email,
      password: parsed.data.password,
      verifier: new SupabasePasswordVerifier(
        config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        config.NEXT_PUBLIC_SUPABASE_URL!,
      ),
    });

    const token = createAdminReauthenticationToken();
    const tokenHash = await hashAdminReauthenticationToken(token);
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
    if (error instanceof AdminReauthenticationRateLimitedError) {
      return NextResponse.json(
        { code: "admin_reauthentication_rate_limited" },
        {
          headers: { "Retry-After": String(error.retryAfterSeconds) },
          status: 429,
        },
      );
    }
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
