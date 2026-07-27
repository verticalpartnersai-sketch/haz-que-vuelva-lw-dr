import { NextResponse } from "next/server";

import { environment } from "@/server/config/environment";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

export async function POST() {
  if (!environment().FEATURE_AUTH) {
    return NextResponse.json({ code: "feature_unavailable" }, { status: 503 });
  }

  const client = await createSupabaseServerClient();
  const { error } = await client.auth.signOut();
  if (error) {
    return NextResponse.json({ code: "sign_out_failed" }, { status: 503 });
  }
  return new NextResponse(null, { status: 204 });
}
