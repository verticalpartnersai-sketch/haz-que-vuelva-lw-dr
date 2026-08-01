import assert from "node:assert/strict";
import test from "node:test";

import { readBoundedTextBody } from "../src/server/http/read-bounded-text-body.ts";

test("reads a UTF-8 webhook payload within the byte limit", async () => {
  const request = new Request("https://example.test", {
    body: JSON.stringify({ value: "corazón" }),
    method: "POST",
  });

  const result = await readBoundedTextBody(request, 1024);
  assert.deepEqual(result, { ok: true, value: '{"value":"corazón"}' });
});

test("rejects a streamed webhook body that crosses the byte limit", async () => {
  const request = new Request("https://example.test", {
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("1234"));
        controller.enqueue(new TextEncoder().encode("5678"));
        controller.close();
      },
    }),
    duplex: "half",
    method: "POST",
  } as RequestInit & { duplex: "half" });

  const result = await readBoundedTextBody(request, 7);
  assert.deepEqual(result, { ok: false, reason: "too_large" });
});
