import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { environment } from "@/server/config/environment";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//")
    ? value
    : "/auth/definir-contrasena";
}

const emailOtpTypes = new Set([
  "email",
  "email_change",
  "invite",
  "magiclink",
  "recovery",
  "signup",
]);

function safeEmailOtpType(value: string | null): EmailOtpType | null {
  return value && emailOtpTypes.has(value) ? (value as EmailOtpType) : null;
}

export async function GET(request: Request) {
  if (!environment().FEATURE_AUTH) {
    return NextResponse.json({ code: "feature_unavailable" }, { status: 503 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const client = await createSupabaseServerClient();
  const tokenHash = url.searchParams.get("token_hash");
  const type = safeEmailOtpType(url.searchParams.get("type"));
  const { error } = code
    ? await client.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await client.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing_auth_confirmation") };
  if (error) {
    return NextResponse.redirect(new URL("/auth/error", url.origin));
  }

  return NextResponse.redirect(
    new URL(safeNext(url.searchParams.get("next")), url.origin),
  );
}
