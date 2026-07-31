import { Container, getContainer } from "@cloudflare/containers";
import { env as runtimeBindings } from "cloudflare:workers";

interface WorkerEnv {
  VUELVE_AGENT: DurableObjectNamespace<VuelveAgentContainer>;
  ENVIRONMENT?: string;
  FEATURE_GENERATION?: string;
  INTERNAL_SECRET?: string;
  GEMINI_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  GEMINI_MODEL?: string;
  EMBEDDING_MODEL?: string;
  EMBEDDING_DIMENSIONS?: string;
  DAILY_RESPONSE_LIMIT?: string;
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
    DAILY_RESPONSE_LIMIT: bindings.DAILY_RESPONSE_LIMIT ?? "5",
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

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);
    const isHealthRequest = request.method === "GET" && url.pathname === "/health";
    const isGenerationRequest =
      request.method === "POST" && url.pathname === "/v1/generations/stream";

    if (!isHealthRequest && !isGenerationRequest) {
      return json("not_found", 404);
    }
    if (!(await hasValidCredential(request, env.INTERNAL_SECRET))) {
      return env.INTERNAL_SECRET
        ? json("unauthorized", 401)
        : json("not_configured", 503);
    }
    if (isGenerationRequest && !generationEnabled(env)) {
      return json("generation_disabled", 503);
    }

    return getContainer(env.VUELVE_AGENT, "primary").fetch(request);
  },
} satisfies ExportedHandler<WorkerEnv>;
