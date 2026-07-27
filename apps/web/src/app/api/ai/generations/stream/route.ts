import { NextResponse } from "next/server";
import { z } from "zod";

import {
  AuthenticationRequiredError,
  currentIdentity,
} from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

const requestSchema = z.object({
  conversationId: z.uuid(),
  message: z.string().trim().min(1).max(30_000),
  requestId: z.uuid().optional(),
});

export async function POST(request: Request) {
  const config = environment();
  if (
    !config.FEATURE_VUELVE_IA ||
    !config.AGENT_INTERNAL_URL ||
    !config.AGENT_INTERNAL_SECRET
  ) {
    return NextResponse.json({ code: "feature_unavailable" }, { status: 503 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  let identity: Awaited<ReturnType<typeof currentIdentity>>;
  try {
    identity = await currentIdentity();
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json(
        { code: "authentication_required" },
        { status: 401 },
      );
    }
    throw error;
  }
  const client = await createSupabaseServerClient();
  const { data: entitlement } = await client
    .from("effective_entitlements")
    .select("product_code")
    .eq("member_id", identity.id)
    .eq("product_code", "vuelve_ia")
    .maybeSingle();
  if (!entitlement) {
    return NextResponse.json({ code: "access_denied" }, { status: 403 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      new URL("/v1/generations/stream", config.AGENT_INTERNAL_URL),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.AGENT_INTERNAL_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          member_id: identity.id,
          conversation_id: parsed.data.conversationId,
          message: parsed.data.message,
          request_id: parsed.data.requestId ?? crypto.randomUUID(),
        }),
        signal: request.signal,
        cache: "no-store",
      },
    );
  } catch {
    return NextResponse.json(
      { code: "generation_unavailable" },
      { status: 503 },
    );
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { code: "generation_unavailable" },
      { status: upstream.status >= 500 ? 503 : upstream.status },
    );
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "text/event-stream",
      "X-Accel-Buffering": "no",
    },
  });
}
