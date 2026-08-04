import { Container, getContainer } from "@cloudflare/containers";
import { env as runtimeBindings } from "cloudflare:workers";

interface WorkerEnv {
  VUELVE_AGENT: DurableObjectNamespace<VuelveAgentContainer>;
  AI: Ai;
  ENVIRONMENT?: string;
  FEATURE_GENERATION?: string;
  INTERNAL_SECRET?: string;
  PROVIDER_BACKFILL_SECRET?: string;
  GEMINI_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  GEMINI_MODEL?: string;
  EMBEDDING_MODEL?: string;
  EMBEDDING_DIMENSIONS?: string;
  WORKERS_AI_FALLBACK_URL?: string;
  WORKERS_AI_MODEL?: string;
  WORKERS_AI_EMBEDDING_URL?: string;
  WORKERS_AI_EMBEDDING_MODEL?: string;
  DAILY_RESPONSE_LIMIT?: string;
  MAX_OUTPUT_TOKENS?: string;
}

const bindings = runtimeBindings as unknown as WorkerEnv;

export class VuelveAgentContainer extends Container {
  defaultPort = 8080;
  requiredPorts = [8080];
  sleepAfter = "10m";
  pingEndpoint = "localhost/health";
  enableInternet = true;
  envVars = {
    ENVIRONMENT: bindings.ENVIRONMENT ?? "production",
    FEATURE_GENERATION: bindings.FEATURE_GENERATION ?? "false",
    INTERNAL_SECRET: bindings.INTERNAL_SECRET ?? "",
    GEMINI_API_KEY: bindings.GEMINI_API_KEY ?? "",
    SUPABASE_URL: bindings.SUPABASE_URL ?? "",
    SUPABASE_SECRET_KEY: bindings.SUPABASE_SECRET_KEY ?? "",
    GEMINI_MODEL: bindings.GEMINI_MODEL ?? "gemini-3.6-flash",
    EMBEDDING_MODEL: bindings.EMBEDDING_MODEL ?? "gemini-embedding-2",
    EMBEDDING_DIMENSIONS: bindings.EMBEDDING_DIMENSIONS ?? "768",
    WORKERS_AI_FALLBACK_URL: bindings.WORKERS_AI_FALLBACK_URL ?? "",
    WORKERS_AI_MODEL:
      bindings.WORKERS_AI_MODEL ?? "@cf/qwen/qwen3-30b-a3b-fp8",
    WORKERS_AI_EMBEDDING_URL: bindings.WORKERS_AI_EMBEDDING_URL ?? "",
    WORKERS_AI_EMBEDDING_MODEL:
      bindings.WORKERS_AI_EMBEDDING_MODEL ?? "@cf/baai/bge-m3",
    DAILY_RESPONSE_LIMIT: bindings.DAILY_RESPONSE_LIMIT ?? "5",
    MAX_OUTPUT_TOKENS: bindings.MAX_OUTPUT_TOKENS ?? "2048",
  };
}

async function digest(value: string): Promise<Uint8Array> {
  const bytes = new TextEncoder().encode(value);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}

async function hasValidCredential(
  request: Request,
  expected: string | undefined,
): Promise<boolean> {
  if (!expected) return false;

  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const [suppliedDigest, expectedDigest] = await Promise.all([
    digest(supplied),
    digest(expected),
  ]);

  let difference = 0;
  for (let index = 0; index < expectedDigest.length; index += 1) {
    difference |= suppliedDigest[index] ^ expectedDigest[index];
  }
  return difference === 0;
}

function json(code: string, status: number): Response {
  return Response.json(
    { code },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function generationEnabled(env: WorkerEnv): boolean {
  return env.FEATURE_GENERATION === "true";
}

interface WorkersAiRequest {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  response_schema: Record<string, unknown>;
  max_tokens: number;
}

interface WorkersAiEmbeddingRequest {
  texts: string[];
}

function isWorkersAiEmbeddingRequest(
  value: unknown,
): value is WorkersAiEmbeddingRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<WorkersAiEmbeddingRequest>;
  return (
    Array.isArray(request.texts) &&
    request.texts.length > 0 &&
    request.texts.length <= 16 &&
    request.texts.every(
      (text) =>
        typeof text === "string" && text.trim().length > 0 && text.length <= 20_000,
    )
  );
}

function isWorkersAiRequest(value: unknown): value is WorkersAiRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<WorkersAiRequest>;
  return (
    Array.isArray(request.messages) &&
    request.messages.length > 0 &&
    request.messages.length <= 32 &&
    request.messages.every(
      (message) =>
        message &&
        ["system", "user", "assistant"].includes(message.role) &&
        typeof message.content === "string" &&
        message.content.length > 0 &&
        message.content.length <= 40_000,
    ) &&
    !!request.response_schema &&
    typeof request.response_schema === "object" &&
    Number.isInteger(request.max_tokens) &&
    request.max_tokens! >= 256 &&
    request.max_tokens! <= 2_048
  );
}

async function runWorkersAi(request: Request, env: WorkerEnv): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json("invalid_provider_request", 400);
  }
  if (!isWorkersAiRequest(payload)) {
    return json("invalid_provider_request", 400);
  }

  try {
    const result = await env.AI.run(
      env.WORKERS_AI_MODEL ?? "@cf/qwen/qwen3-30b-a3b-fp8",
      {
        messages: payload.messages,
        max_tokens: payload.max_tokens,
        response_format: {
          type: "json_schema",
          json_schema: payload.response_schema,
        },
      },
    );
    const raw = result as {
      response?: string | Record<string, unknown>;
      usage?: Record<string, number>;
    };
    const response =
      typeof raw.response === "string"
        ? raw.response
        : JSON.stringify(raw.response ?? {});
    return Response.json(
      { response, usage: raw.usage ?? {} },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Workers AI provider failed", error);
    return json("provider_unavailable", 503);
  }
}

async function runWorkersAiEmbeddings(
  request: Request,
  env: WorkerEnv,
): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json("invalid_embedding_request", 400);
  }
  if (!isWorkersAiEmbeddingRequest(payload)) {
    return json("invalid_embedding_request", 400);
  }

  try {
    const result = (await env.AI.run(
      env.WORKERS_AI_EMBEDDING_MODEL ?? "@cf/baai/bge-m3",
      { text: payload.texts },
    )) as { data?: number[][]; shape?: number[] };
    const vectors = result.data;
    if (
      !Array.isArray(vectors) ||
      vectors.length !== payload.texts.length ||
      vectors.some(
        (vector) =>
          !Array.isArray(vector) ||
          vector.length !== 1_024 ||
          vector.some((value) => !Number.isFinite(value)),
      )
    ) {
      console.error("Workers AI returned invalid embedding dimensions", {
        shape: result.shape,
      });
      return json("invalid_embedding_response", 502);
    }
    return Response.json(
      {
        model: env.WORKERS_AI_EMBEDDING_MODEL ?? "@cf/baai/bge-m3",
        dimensions: 1_024,
        vectors,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Workers AI embedding provider failed", error);
    return json("embedding_provider_unavailable", 503);
  }
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);
    const isHealthRequest = request.method === "GET" && url.pathname === "/health";
    const isGenerationRequest =
      request.method === "POST" && url.pathname === "/v1/generations/stream";
    const isDiagnosticRequest =
      request.method === "POST" && url.pathname === "/v1/diagnostics";
    const isProviderRequest =
      request.method === "POST" &&
      url.pathname === "/v1/providers/workers-ai/generate";
    const isEmbeddingProviderRequest =
      request.method === "POST" &&
      url.pathname === "/v1/providers/workers-ai/embed";

    if (
      !isHealthRequest &&
      !isGenerationRequest &&
      !isDiagnosticRequest &&
      !isProviderRequest &&
      !isEmbeddingProviderRequest
    ) {
      return json("not_found", 404);
    }
    const hasInternalCredential = await hasValidCredential(
      request,
      env.INTERNAL_SECRET,
    );
    const hasBackfillCredential =
      isEmbeddingProviderRequest &&
      (await hasValidCredential(request, env.PROVIDER_BACKFILL_SECRET));
    if (!hasInternalCredential && !hasBackfillCredential) {
      return env.INTERNAL_SECRET || env.PROVIDER_BACKFILL_SECRET
        ? json("unauthorized", 401)
        : json("not_configured", 503);
    }
    if ((isGenerationRequest || isDiagnosticRequest) && !generationEnabled(env)) {
      return json("generation_disabled", 503);
    }
    if (isProviderRequest) {
      return runWorkersAi(request, env);
    }
    if (isEmbeddingProviderRequest) {
      return runWorkersAiEmbeddings(request, env);
    }

    return getContainer(env.VUELVE_AGENT, "primary").fetch(request);
  },
} satisfies ExportedHandler<WorkerEnv>;
