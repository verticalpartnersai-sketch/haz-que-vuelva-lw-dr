import { z } from "zod";
import { NextResponse, type NextRequest } from "next/server";

import { SupabasePasswordVerifier } from "@/modules/identity/adapters/supabase-password-verifier";
import {
  AuthenticationRequiredError,
  currentIdentity,
} from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";
import { isSameOriginMutation } from "@/server/security/request-origin";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

const MAX_BODY_BYTES = 2048;
const requestSchema = z.object({
  email: z.email().max(254).transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1).max(256),
});

async function readRequest(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
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

export async function POST(request: NextRequest) {
  const config = environment();
  if (!config.FEATURE_AUTH) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }
  if (!isSameOriginMutation(request, config.MEMBER_APP_URL)) {
    return NextResponse.json({ code: "origin_not_allowed" }, { status: 403 });
  }

  const parsed = await readRequest(request);
  if (!parsed?.success) {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  let identity;
  try {
    identity = await currentIdentity();
  } catch (error) {
    const status = error instanceof AuthenticationRequiredError ? 401 : 503;
    return NextResponse.json(
      { code: status === 401 ? "authentication_required" : "identity_unavailable" },
      { status },
    );
  }

  if (parsed.data.email === identity.email.toLowerCase()) {
    return NextResponse.json({ code: "email_unchanged" }, { status: 400 });
  }

  const verifier = new SupabasePasswordVerifier(
    config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    config.NEXT_PUBLIC_SUPABASE_URL!,
  );
  let passwordAccepted = false;
  try {
    passwordAccepted = await verifier.verify(
      identity.email,
      parsed.data.password,
    );
  } catch {
    return NextResponse.json(
      { code: "email_change_unavailable" },
      { status: 503 },
    );
  }
  if (!passwordAccepted) {
    return NextResponse.json({ code: "invalid_password" }, { status: 401 });
  }

  const redirectBase = config.MEMBER_APP_URL ?? request.nextUrl.origin;
  const redirectTo = new URL("/auth/confirm", redirectBase);
  redirectTo.searchParams.set("next", "/perfil?email=confirmed");

  const client = await createSupabaseServerClient();
  const { error } = await client.auth.updateUser(
    { email: parsed.data.email },
    { emailRedirectTo: redirectTo.toString() },
  );
  if (error) {
    const status = error.status === 429 ? 429 : 400;
    return NextResponse.json(
      { code: status === 429 ? "rate_limited" : "email_change_failed" },
      { status },
    );
  }

  return NextResponse.json(
    { status: "confirmation_required" },
    { status: 202 },
  );
}
