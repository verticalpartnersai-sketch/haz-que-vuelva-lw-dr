import assert from "node:assert/strict";
import test from "node:test";

import { readBoundedJsonBody } from "../src/server/http/read-bounded-json-body.ts";

test("reads valid JSON while staying inside the byte limit", async () => {
  const request = new Request("https://example.test", {
    method: "POST",
    body: JSON.stringify({ message: "hola" }),
  });

  const result = await readBoundedJsonBody(request, 64);

  assert.deepEqual(result, { ok: true, value: { message: "hola" } });
});

test("rejects a streamed body that exceeds the limit without Content-Length", async () => {
  const encoder = new TextEncoder();
  const request = new Request("https://example.test", {
    method: "POST",
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('{"message":"'));
        controller.enqueue(encoder.encode("x".repeat(128)));
        controller.enqueue(encoder.encode('"}'));
        controller.close();
      },
    }),
    duplex: "half",
  } as RequestInit);
  request.headers.delete("content-length");

  const result = await readBoundedJsonBody(request, 64);

  assert.deepEqual(result, { ok: false, reason: "too_large" });
});

test("distinguishes malformed JSON from an oversized body", async () => {
  const request = new Request("https://example.test", {
    method: "POST",
    body: "{not-json}",
  });

  const result = await readBoundedJsonBody(request, 64);

  assert.deepEqual(result, { ok: false, reason: "invalid_json" });
});
