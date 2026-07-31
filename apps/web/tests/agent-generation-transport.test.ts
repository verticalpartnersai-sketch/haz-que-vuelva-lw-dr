import assert from "node:assert/strict";
import test from "node:test";

import {
  requestGenerationFromBinding,
  requestGenerationFromUrl,
  type AgentServiceBinding,
} from "../src/server/ai/agent-generation-transport.ts";

const input = {
  body: JSON.stringify({ message: "hola" }),
  internalSecret: "s".repeat(32),
  signal: new AbortController().signal,
};

test("fails before dispatch when the private binding is absent", () => {
  assert.throws(
    () => requestGenerationFromBinding(undefined, input),
    /agent_service_binding_missing/,
  );
});

test("dispatches only the expected internal request and propagates cancellation", async () => {
  const controller = new AbortController();
  let forwarded: Request | undefined;
  const binding: AgentServiceBinding = {
    async fetch(request) {
      forwarded = request;
      return new Response("data: done\n\n", {
        headers: { "Content-Type": "text/event-stream" },
      });
    },
  };

  const response = await requestGenerationFromBinding(binding, {
    ...input,
    signal: controller.signal,
  });
  controller.abort();

  assert.equal(response.status, 200);
  assert.ok(forwarded);
  assert.equal(
    forwarded.url,
    "https://vuelve-agent.internal/v1/generations/stream",
  );
  assert.equal(forwarded.method, "POST");
  assert.equal(
    forwarded.headers.get("authorization"),
    `Bearer ${input.internalSecret}`,
  );
  assert.equal(forwarded.headers.get("content-type"), "application/json");
  assert.deepEqual(await forwarded.json(), { message: "hola" });
  assert.equal(forwarded.signal.aborted, true);
});

test("fails before public fetch when the fallback URL is absent", () => {
  assert.throws(
    () => requestGenerationFromUrl(undefined, input),
    /agent_internal_url_missing/,
  );
});
