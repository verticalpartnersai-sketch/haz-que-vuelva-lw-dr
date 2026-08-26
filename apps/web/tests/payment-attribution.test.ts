import assert from "node:assert/strict";
import test from "node:test";

import { normalizePerfectPayPayload } from "../src/modules/payments/adapters/perfect-pay-normalizer.ts";
import { perfectPayPayloadSchema } from "../src/modules/payments/adapters/perfect-pay-schema.ts";
import { SupabasePaymentIngress } from "../src/modules/payments/adapters/supabase-payment-ingress.ts";

function perfectPayPayload(utmPerfect: string) {
  return perfectPayPayloadSchema.parse({
    token: "not-persisted",
    code: "SALE-ATTRIBUTION",
    sale_amount: 8.49,
    currency_enum: 2,
    sale_status_enum: 12,
    sale_status_detail: "precheckout",
    date_created: "2026-08-25 12:00:00",
    date_approved: null,
    product: {
      code: "PPPBF7CC",
      name: "Haz Que Vuelva",
      external_reference: null,
    },
    plan: { code: "PLAN-X", name: "Haz Que Vuelva", quantity: 1 },
    plan_itens: [],
    customer: { email: "buyer@example.invalid" },
    metadata: { utm_perfect: utmPerfect },
  });
}

test("normalizes the allowlisted CTA and route from PerfectPay metadata", () => {
  const event = normalizePerfectPayPayload(
    perfectPayPayload("hqv~hero~green"),
  );

  assert.deepEqual(event.checkoutAttribution, {
    ctaPosition: "hero",
    route: "green",
  });
});

test("normalizes every real quiz route from PerfectPay metadata", () => {
  for (const route of [
    "gray",
    "red",
    "yellow",
    "green",
    "logistics",
    "third_person",
  ]) {
    const event = normalizePerfectPayPayload(
      perfectPayPayload(`hqv~hero~${route}`),
    );

    assert.deepEqual(event.checkoutAttribution, {
      ctaPosition: "hero",
      route,
    });
  }
});

test("drops malformed or unrecognized PerfectPay attribution metadata", () => {
  const malformed = normalizePerfectPayPayload(
    perfectPayPayload("hqv~tampered~green"),
  );

  assert.equal(malformed.checkoutAttribution, undefined);
});

test("persists only normalized attribution in the redacted payment event", async () => {
  let inserted: Record<string, unknown> | undefined;
  const client = {
    from(table: string) {
      assert.equal(table, "incoming_events");
      return {
        insert(row: Record<string, unknown>) {
          inserted = row;
          return Promise.resolve({ error: null });
        },
      };
    },
  };
  const ingress = new SupabasePaymentIngress(client as never);
  const event = normalizePerfectPayPayload(
    perfectPayPayload("hqv~hero~green"),
  );

  await ingress.store(event);

  assert.deepEqual(inserted?.payload_redacted, {
    attribution: { cta_position: "hero", route: "green" },
    sale_code: "SALE-ATTRIBUTION",
    product_code: "PPPBF7CC",
    plan_code: "PLAN-X",
    status: "precheckout",
  });
});

test("normalizes v2 offer attribution with score band", () => {
  const event = normalizePerfectPayPayload(
    perfectPayPayload("hqv2~offer_primary~92_96"),
  );

  assert.deepEqual(event.checkoutAttribution, {
    version: "v2",
    ctaPosition: "offer_primary",
    scoreBand: "92_96",
  });
});

test("drops malformed v2 attribution", () => {
  const invalidPosition = normalizePerfectPayPayload(
    perfectPayPayload("hqv2~tampered~92_96"),
  );
  const invalidBand = normalizePerfectPayPayload(
    perfectPayPayload("hqv2~offer_primary~99_99"),
  );
  assert.equal(invalidPosition.checkoutAttribution, undefined);
  assert.equal(invalidBand.checkoutAttribution, undefined);
});

test("persists only redacted v2 offer attribution", async () => {
  let inserted: Record<string, unknown> | undefined;
  const client = {
    from(table: string) {
      assert.equal(table, "incoming_events");
      return {
        insert(row: Record<string, unknown>) {
          inserted = row;
          return Promise.resolve({ error: null });
        },
      };
    },
  };
  const ingress = new SupabasePaymentIngress(client as never);
  const event = normalizePerfectPayPayload(
    perfectPayPayload("hqv2~offer_repeat~87_91"),
  );

  await ingress.store(event);

  assert.deepEqual(inserted?.payload_redacted, {
    attribution: {
      cta_position: "offer_repeat",
      quiz_version: "hqv_quiz_v2",
      score_band: "87_91",
    },
    sale_code: "SALE-ATTRIBUTION",
    product_code: "PPPBF7CC",
    plan_code: "PLAN-X",
    status: "precheckout",
  });
});
