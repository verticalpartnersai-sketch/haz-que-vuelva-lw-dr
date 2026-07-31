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

export function requestGenerationFromBinding(
  binding: AgentServiceBinding | undefined,
  input: GenerationRequest,
) {
  if (!binding) throw new Error("agent_service_binding_missing");

  return binding.fetch(
    new Request(
      "https://vuelve-agent.internal/v1/generations/stream",
      internalRequest(input),
    ),
  );
}

export function requestGenerationFromUrl(
  baseUrl: string | undefined,
  input: GenerationRequest,
) {
  if (!baseUrl) throw new Error("agent_internal_url_missing");

  return fetch(new URL("/v1/generations/stream", baseUrl), {
    ...internalRequest(input),
    cache: "no-store",
  });
}
