import assert from "node:assert/strict";
import test from "node:test";

import { ResendCheckoutRecoverySender } from "../src/modules/notifications/adapters/resend-checkout-recovery-sender.ts";

test("Resend checkout recovery sender uses idempotency and one-click unsubscribe headers", async () => {
  const calls: Array<{ payload: Record<string, unknown>; options: Record<string, unknown> }> = [];
  const client = {
    emails: {
      send: async (
        payload: Record<string, unknown>,
        options: Record<string, unknown>,
      ) => {
        calls.push({ payload, options });
        return { data: { id: "email-id" }, error: null };
      },
    },
  };
  const sender = new ResendCheckoutRecoverySender(
    "api-key",
    "Haz Que Vuelva <equipo@mail.hazquevuelva.site>",
    client as never,
  );

  const providerMessageId = await sender.send({
    checkoutUrl: "https://checkout.example.test/?utm_content=email_1",
    idempotencyKey: "checkout-recovery/job-1",
    recipient: "buyer@example.test",
    step: 1,
    unsubscribeUrl: "https://members.example.test/unsubscribe?token=opaque",
  });

  assert.equal(providerMessageId, "email-id");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].payload.to, "buyer@example.test");
  assert.equal(calls[0].options.idempotencyKey, "checkout-recovery/job-1");
  assert.deepEqual(calls[0].payload.headers, {
    "List-Unsubscribe":
      "<https://members.example.test/unsubscribe?token=opaque>",
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  });
  assert.match(String(calls[0].payload.html), /RETOMAR MI ACCESO/);
  assert.match(String(calls[0].payload.text), /Darse de baja/);
});
