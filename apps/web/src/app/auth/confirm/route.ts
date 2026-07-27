import { NextResponse } from "next/server";

import { environment } from "@/server/config/environment";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//")
    ? value
    : "/auth/definir-contrasena";
}

export async function GET(request: Request) {
  if (!environment().FEATURE_AUTH) {
    return NextResponse.json({ code: "feature_unavailable" }, { status: 503 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/auth/error", url.origin));
  }

  const client = await createSupabaseServerClient();
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/auth/error", url.origin));
  }

  return NextResponse.redirect(
    new URL(safeNext(url.searchParams.get("next")), url.origin),
  );
}
