import assert from "node:assert/strict";
import test from "node:test";

import type { SupabaseClient } from "@supabase/supabase-js";

import { SupabasePaymentProjector } from "../src/modules/payments/adapters/supabase-payment-projector.ts";

type OfferResponse = {
  data: { product_code: string } | null;
  error: { code: string } | null;
};

class OfferQuery {
  readonly filters = new Map<string, unknown>();
  private readonly response: OfferResponse;

  constructor(response: OfferResponse) {
    this.response = response;
  }

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.set(field, value);
    return this;
  }

  maybeSingle() {
    return Promise.resolve(this.response);
  }
}

function projectorWithResponses(responses: OfferResponse[]) {
  const queries: OfferQuery[] = [];
  const client = {
    from() {
      const response = responses.shift();
      assert.ok(response, "unexpected offer lookup");
      const query = new OfferQuery(response);
      queries.push(query);
      return query;
    },
  } as unknown as SupabaseClient;

  return {
    projector: new SupabasePaymentProjector(client),
    queries,
  };
}

test("an exact order-bump mapping never falls through to the product wildcard", async () => {
  const { projector, queries } = projectorWithResponses([
    { data: null, error: null },
  ]);

  const product = await projector.productForOffer({
    provider: "perfect_pay",
    productCode: "PPPBF7CC",
    planCode: "item:UNKNOWN",
  });

  assert.equal(product, null);
  assert.equal(queries.length, 1);
  assert.equal(queries[0].filters.get("external_plan_code"), "item:UNKNOWN");
});

test("a top-level product may use its explicitly configured wildcard", async () => {
  const { projector, queries } = projectorWithResponses([
    { data: null, error: null },
    { data: { product_code: "haz_que_vuelva" }, error: null },
  ]);

  const product = await projector.productForOffer({
    provider: "perfect_pay",
    productCode: "PPPBF7CC",
    planCode: "PLAN-NEW",
  });

  assert.equal(product, "haz_que_vuelva");
  assert.equal(queries.length, 2);
  assert.equal(queries[1].filters.get("external_plan_code"), "*");
});
