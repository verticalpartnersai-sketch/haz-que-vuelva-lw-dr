import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

import {
  AuthenticationRequiredError,
  currentIdentity,
} from "@/modules/identity/application/current-identity";
import {
  requestDiagnosticFromBinding,
  requestDiagnosticFromUrl,
  type AgentServiceBinding,
} from "@/server/ai/agent-generation-transport";
import { memberAiProducts } from "@/server/ai/member-ai-access";
import { environment } from "@/server/config/environment";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

const MAX_FILE_BYTES = 1_000_000;

type AgentRuntimeBindings = { VUELVE_AGENT_SERVICE?: AgentServiceBinding };

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 32_768) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32_768));
  }
  return btoa(binary);
}

async function forward(body: string, signal: AbortSignal) {
  const config = environment();
  const input = { body, internalSecret: config.AGENT_INTERNAL_SECRET!, signal };
  if (config.AGENT_SERVICE_BINDING) {
    const context = await getCloudflareContext({ async: true });
    const bindings = context.env as unknown as AgentRuntimeBindings;
    return requestDiagnosticFromBinding(bindings.VUELVE_AGENT_SERVICE, input);
  }
  return requestDiagnosticFromUrl(config.AGENT_INTERNAL_URL, input);
}

export async function POST(request: Request) {
  const config = environment();
  if (
    !config.FEATURE_VUELVE_IA ||
    !config.FEATURE_AI_DIAGNOSTICS ||
    !config.AGENT_INTERNAL_SECRET
  ) {
    return NextResponse.json({ code: "feature_unavailable" }, { status: 503 });
  }
  try {
    const identity = await currentIdentity();
    const access = await memberAiProducts(identity.id);
    if (!access.hasAi) {
      return NextResponse.json({ code: "access_denied" }, { status: 403 });
    }
    const { data: usage, error: usageError } =
      await createSupabaseServiceClient().rpc("get_ai_usage_status", {
        p_member_id: identity.id,
        p_daily_limit: 10,
      });
    if (usageError || !usage) {
      return NextResponse.json({ code: "usage_unavailable" }, { status: 503 });
    }
    if (usage.diagnostic_available !== true) {
      return NextResponse.json(
        {
          code: "diagnostic_monthly_limit_reached",
          diagnostic_next_at: usage.diagnostic_next_at ?? null,
        },
        { status: 429 },
      );
    }
    const form = await request.formData();
    const file = form.get("file");
    const conversationId = form.get("conversationId");
    if (!(file instanceof File) || typeof conversationId !== "string") {
      return NextResponse.json({ code: "invalid_request" }, { status: 400 });
    }
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["txt", "zip"].includes(extension)) {
      return NextResponse.json({ code: "unsupported_file" }, { status: 415 });
    }
    if (file.size < 1 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ code: "file_too_large" }, { status: 413 });
    }
    const upstream = await forward(
      JSON.stringify({
        diagnostic_id: crypto.randomUUID(),
        generation_id: crypto.randomUUID(),
        member_id: identity.id,
        conversation_id: conversationId,
        input_format: extension,
        payload_base64: toBase64(new Uint8Array(await file.arrayBuffer())),
        allowed_product_codes: access.allowedKnowledgeProducts,
      }),
      request.signal,
    );
    const payload = await upstream.text();
    if (!upstream.ok) {
      let code = "diagnostic_unavailable";
      try {
        const errorPayload = JSON.parse(payload) as {
          code?: string;
          detail?: string;
        };
        code = errorPayload.code ?? errorPayload.detail ?? code;
      } catch {
        // Keep a stable public error code without exposing the upstream body.
      }
      return NextResponse.json({ code }, { status: upstream.status });
    }
    return new Response(payload, {
      status: upstream.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ code: "authentication_required" }, { status: 401 });
    }
    return NextResponse.json({ code: "diagnostic_unavailable" }, { status: 503 });
  }
}
