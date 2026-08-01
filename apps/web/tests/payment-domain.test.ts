import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  normalizePerfectPayPayload,
  normalizePerfectPayPayloads,
  secureTokenMatches,
} from "../src/modules/payments/adapters/perfect-pay-normalizer.ts";
import { perfectPayPayloadSchema } from "../src/modules/payments/adapters/perfect-pay-schema.ts";
import { SupabasePaymentIngress } from "../src/modules/payments/adapters/supabase-payment-ingress.ts";
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

test("official Perfect Pay webhook reference remains compatible", () => {
  const fixture = JSON.parse(
    readFileSync(
      new URL(
        "./fixtures/perfectpay/webhook-official-reference.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const payload = perfectPayPayloadSchema.parse(fixture);
  const event = normalizePerfectPayPayload(payload);

  assert.equal(event.saleCode, "PPCONTRACTREFERENCE");
  assert.equal(event.productCode, "PPPBF7CC");
  assert.equal(event.planCode, "PLAN-CONTRACT-REFERENCE");
  assert.equal(event.customerEmail, "buyer@example.invalid");
  assert.equal(event.amountMinor, 38_500);
  assert.equal(event.effect, "grant");
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

test("normalizer emits one isolated event per order bump and supports USD", () => {
  const events = normalizePerfectPayPayloads({
    token: "not-persisted",
    code: "SALE-WITH-BUMPS",
    sale_amount: 27,
    currency_enum: 2,
    sale_status_enum: 2,
    sale_status_detail: "approved",
    date_created: "2026-07-30 10:00:00",
    date_approved: "2026-07-30 10:01:00",
    product: {
      code: "PPPBF7CC",
      name: "Haz que Vuelva",
      external_reference: null,
    },
    plan: { code: "MAIN-PLAN", name: "Haz que Vuelva", quantity: 1 },
    plan_itens: [
      {
        item_code: "PPPBF7EK",
      },
      {
        code: "MAIN-PLAN",
        item_code: "PPPBF7EL",
        name: "La Otra",
        price: 10,
        quantity: 1,
      },
      {
        code: "MAIN-PLAN",
        item_code: "PPPBF7EK",
        name: "21 Mensajes duplicate",
        price: 10,
        quantity: 1,
      },
    ],
    customer: { email: "member@example.com" },
  });

  assert.equal(events.length, 3);
  assert.deepEqual(
    events.map((event) => event.planCode),
    ["MAIN-PLAN", "item:PPPBF7EK", "item:PPPBF7EL"],
  );
  assert.equal(events.every((event) => event.currency === "USD"), true);
  assert.equal(events.every((event) => event.amountMinor === 2_700), true);
  assert.equal(new Set(events.map((event) => event.eventKey)).size, 3);
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

test("ignored payment events are archived as processed without queue work", async () => {
  const inserted: Record<string, unknown>[] = [];
  const client = {
    from(table: string) {
      assert.equal(table, "incoming_events");
      return {
        insert(row: Record<string, unknown>) {
          inserted.push(row);
          return Promise.resolve({ error: null });
        },
      };
    },
  };
  const ingress = new SupabasePaymentIngress(client as never);
  const pending = normalizePerfectPayPayload({
    token: "not-persisted",
    code: "SALE-PENDING",
    sale_amount: 7,
    currency_enum: 1,
    sale_status_enum: 1,
    sale_status_detail: "pending",
    date_created: "2026-08-01 00:00:00",
    date_approved: null,
    product: {
      code: "PPPBF7CC",
      name: "Haz Que Vuelva",
      external_reference: null,
    },
    plan: { code: "PLAN-X", name: "Haz Que Vuelva", quantity: 1 },
    plan_itens: [],
    customer: { email: "member@example.com" },
  });

  await ingress.store(pending);

  assert.equal(inserted.length, 1);
  assert.equal(typeof inserted[0]?.processed_at, "string");
});

test("terminal payment states cannot be reopened by a late grant event", () => {
  const migration = readFileSync(
    new URL(
      "../../../supabase/migrations/202608010028_payment_terminal_state_guards.sql",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    migration,
    /purchase_row\.status in \('cancelled', 'refunded', 'charged_back'\)/,
  );
  assert.match(migration, /and p_effect = 'grant'/);
  assert.ok(
    migration.indexOf("purchase_row.status in") <
      migration.indexOf("revoked_at = null"),
  );
});
