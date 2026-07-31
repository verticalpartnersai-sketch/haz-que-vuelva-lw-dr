import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  AuthenticationRequiredError,
  currentIdentity,
} from "@/modules/identity/application/current-identity";
import {
  requestGenerationFromBinding,
  requestGenerationFromUrl,
  type AgentServiceBinding,
} from "@/server/ai/agent-generation-transport";
import { environment } from "@/server/config/environment";
import { readBoundedJsonBody } from "@/server/http/read-bounded-json-body";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

const requestSchema = z.object({
  conversationId: z.uuid(),
  message: z.string().trim().min(1).max(30_000),
  requestId: z.uuid().optional(),
});

const MAX_BODY_BYTES = 128 * 1024;

type AgentRuntimeBindings = {
  VUELVE_AGENT_SERVICE?: AgentServiceBinding;
};

async function requestGeneration(
  config: ReturnType<typeof environment>,
  body: string,
  signal: AbortSignal,
) {
  const input = {
    body,
    internalSecret: config.AGENT_INTERNAL_SECRET!,
    signal,
  };

  if (config.AGENT_SERVICE_BINDING) {
    const context = await getCloudflareContext({ async: true });
    const bindings = context.env as unknown as AgentRuntimeBindings;
    return requestGenerationFromBinding(bindings.VUELVE_AGENT_SERVICE, input);
  }

  return requestGenerationFromUrl(config.AGENT_INTERNAL_URL, input);
}

export async function POST(request: Request) {
  const config = environment();
  if (
    !config.FEATURE_VUELVE_IA ||
    !config.AGENT_INTERNAL_SECRET
  ) {
    return NextResponse.json({ code: "feature_unavailable" }, { status: 503 });
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

  const input = await readBoundedJsonBody(request, MAX_BODY_BYTES);
  if (!input.ok && input.reason === "too_large") {
    return NextResponse.json({ code: "request_too_large" }, { status: 413 });
  }
  const parsed = requestSchema.safeParse(input.ok ? input.value : undefined);
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await requestGeneration(
      config,
      JSON.stringify({
        member_id: identity.id,
        conversation_id: parsed.data.conversationId,
        message: parsed.data.message,
        request_id: parsed.data.requestId ?? crypto.randomUUID(),
      }),
      request.signal,
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
