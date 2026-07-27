import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizePerfectPayPayload,
  secureTokenMatches,
} from "../src/modules/payments/adapters/perfect-pay-normalizer.ts";
import { processPaymentEvent } from "../src/modules/payments/application/process-payment-event.ts";
import { paymentEffectForStatus } from "../src/modules/payments/domain/payment-event.ts";

test("Perfect Pay statuses map to deterministic access effects", () => {
  assert.equal(paymentEffectForStatus("approved"), "grant");
  assert.equal(paymentEffectForStatus("authorized"), "grant");
  assert.equal(paymentEffectForStatus("completed"), "grant");
  assert.equal(paymentEffectForStatus("cancelled"), "revoke");
  assert.equal(paymentEffectForStatus("refunded"), "revoke");
  assert.equal(paymentEffectForStatus("charged_back"), "revoke");
  assert.equal(paymentEffectForStatus("pending"), "ignore");
});

test("webhook token comparison accepts only the exact token", () => {
  assert.equal(secureTokenMatches("expected-token", "expected-token"), true);
  assert.equal(secureTokenMatches("wrong-token", "expected-token"), false);
});

test("normalizer redacts payload and stores money in minor units", () => {
  const event = normalizePerfectPayPayload({
    token: "not-persisted",
    code: "SALE-1",
    sale_amount: 149.9,
    currency_enum: 1,
    sale_status_enum: 2,
    sale_status_detail: "approved",
    date_created: "2026-07-27 10:00:00",
    date_approved: "2026-07-27 10:01:00",
    product: {
      code: "PRODUCT-X",
      name: "External product",
      external_reference: null,
    },
    plan: { code: "PLAN-X", name: "External plan", quantity: 1 },
    plan_itens: [],
    customer: { email: "Member@Example.com" },
  });

  assert.equal(event.amountMinor, 14_990);
  assert.equal(event.currency, "BRL");
  assert.equal(event.effect, "grant");
  assert.equal(event.customerEmail, "member@example.com");
  assert.equal(event.eventKey.startsWith("SALE-1:approved:"), true);
  assert.equal("token" in event, false);
});

test("duplicate events still repair a missing outbox job", async () => {
  const event = normalizePerfectPayPayload({
    token: "not-persisted",
    code: "SALE-1",
    sale_amount: 149.9,
    currency_enum: 1,
    sale_status_enum: 2,
    sale_status_detail: "approved",
    date_created: "2026-07-27 10:00:00",
    date_approved: "2026-07-27 10:01:00",
    product: {
      code: "PRODUCT-X",
      name: "External product",
      external_reference: null,
    },
    plan: { code: "PLAN-X", name: "External plan", quantity: 1 },
    plan_itens: [],
    customer: { email: "member@example.com" },
  });
  let enqueued = 0;

  const result = await processPaymentEvent(event, {
    events: { store: async () => "duplicate" },
    queue: { enqueue: async () => void (enqueued += 1) },
  });

  assert.equal(result, "duplicate");
  assert.equal(enqueued, 1);
});
