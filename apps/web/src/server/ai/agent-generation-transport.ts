export type AgentServiceBinding = {
  fetch(request: Request): Promise<Response>;
};

type GenerationRequest = {
  body: string;
  internalSecret: string;
  signal: AbortSignal;
};

function internalRequest(input: GenerationRequest) {
  return {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.internalSecret}`,
      "Content-Type": "application/json",
    },
    body: input.body,
    signal: input.signal,
  } satisfies RequestInit;
}

function requestFromBinding(
  binding: AgentServiceBinding | undefined,
  path: string,
  input: GenerationRequest,
) {
  if (!binding) throw new Error("agent_service_binding_missing");
  return binding.fetch(
    new Request(`https://vuelve-agent.internal${path}`, internalRequest(input)),
  );
}

function requestFromUrl(
  baseUrl: string | undefined,
  path: string,
  input: GenerationRequest,
) {
  if (!baseUrl) throw new Error("agent_internal_url_missing");
  return fetch(new URL(path, baseUrl), {
    ...internalRequest(input),
    cache: "no-store",
  });
}

export function requestGenerationFromBinding(
  binding: AgentServiceBinding | undefined,
  input: GenerationRequest,
) {
  return requestFromBinding(binding, "/v1/generations/stream", input);
}

export function requestGenerationFromUrl(
  baseUrl: string | undefined,
  input: GenerationRequest,
) {
  return requestFromUrl(baseUrl, "/v1/generations/stream", input);
}

export function requestDiagnosticFromBinding(
  binding: AgentServiceBinding | undefined,
  input: GenerationRequest,
) {
  return requestFromBinding(binding, "/v1/diagnostics", input);
}

export function requestDiagnosticFromUrl(
  baseUrl: string | undefined,
  input: GenerationRequest,
) {
  return requestFromUrl(baseUrl, "/v1/diagnostics", input);
}
