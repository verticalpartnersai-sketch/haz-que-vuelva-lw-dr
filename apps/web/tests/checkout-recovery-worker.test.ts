import assert from "node:assert/strict";
import test from "node:test";

import { runCheckoutRecoveryWorker } from "../src/modules/notifications/application/run-checkout-recovery-worker.ts";

function fixture(
  status = "precheckout",
  suppression: { global?: boolean; marketing?: boolean } = {},
  missing = false,
) {
  const sent: Array<Record<string, unknown>> = [];
  const outcomes: string[] = [];
  const reserved: string[] = [];
  const retried: string[] = [];
  const job = {
    attempts: 1,
    id: "job-1",
    payload: { sequence_id: "sequence-1", step: 2 },
  };

  return {
    outcomes,
    reserved,
    retried,
    sent,
    dependencies: {
      checkoutBaseUrl:
        "https://go.centerpag.com/PPU38CQER3J?upsell=true&lang=es",
      memberAppUrl: "https://miembros.hazquevuelva.site",
      outbox: {
        claim: async () => [job],
        confirm: async () => true,
        complete: async (_job: unknown, outcome: string) => {
          outcomes.push(outcome);
        },
        reserve: async () => {
          reserved.push("reserved");
          return true;
        },
        resolve: async () =>
          missing
            ? null
            : {
                globallySuppressed: suppression.global ?? false,
                marketingSuppressed: suppression.marketing ?? false,
                purchaseStatus: status,
                recipient: "buyer@example.test",
                sequenceId: "sequence-1",
                unsubscribeToken: "opaque-token",
              },
        retry: async (_job: unknown, code: string) => {
          retried.push(code);
        },
      },
      sender: {
        send: async (message: Record<string, unknown>) => {
          sent.push(message);
          return "provider-message-id";
        },
      },
    },
  };
}

test("checkout recovery worker sends an eligible step with attribution and opaque unsubscribe", async () => {
  const current = fixture();

  const result = await runCheckoutRecoveryWorker(current.dependencies);

  assert.deepEqual(result, {
    claimed: 1,
    converted: 0,
    sent: 1,
    suppressed: 0,
  });
  assert.deepEqual(current.outcomes, ["sent"]);
  assert.equal(current.retried.length, 0);
  assert.equal(current.sent.length, 1);
  assert.equal(current.sent[0].recipient, "buyer@example.test");
  assert.equal(current.sent[0].step, 2);
  assert.equal(current.sent[0].idempotencyKey, "checkout-recovery/job-1");

  const checkoutUrl = new URL(String(current.sent[0].checkoutUrl));
  assert.equal(checkoutUrl.searchParams.get("lang"), "es");
  assert.equal(checkoutUrl.searchParams.get("utm_source"), "resend");
  assert.equal(checkoutUrl.searchParams.get("utm_medium"), "email");
  assert.equal(checkoutUrl.searchParams.get("utm_campaign"), "abandoned_checkout");
  assert.equal(checkoutUrl.searchParams.get("utm_content"), "email_2");
  assert.equal(checkoutUrl.searchParams.get("recovery_id"), "sequence-1");
  assert.doesNotMatch(checkoutUrl.toString(), /buyer%40|buyer@/);

  const unsubscribeUrl = new URL(String(current.sent[0].unsubscribeUrl));
  assert.equal(unsubscribeUrl.searchParams.get("token"), "opaque-token");
  assert.doesNotMatch(unsubscribeUrl.toString(), /buyer%40|buyer@/);
});

test("checkout recovery worker suppresses marketing opt-outs without sending", async () => {
  const current = fixture("precheckout", { marketing: true });

  const result = await runCheckoutRecoveryWorker(current.dependencies);

  assert.deepEqual(result, {
    claimed: 1,
    converted: 0,
    sent: 0,
    suppressed: 1,
  });
  assert.deepEqual(current.outcomes, ["suppressed"]);
  assert.equal(current.sent.length, 0);
  assert.equal(current.retried.length, 0);
});

test("checkout recovery worker completes an unresolved sequence as ineligible", async () => {
  const current = fixture("precheckout", {}, true);

  const result = await runCheckoutRecoveryWorker(current.dependencies);

  assert.deepEqual(result, {
    claimed: 1,
    converted: 0,
    sent: 0,
    suppressed: 0,
  });
  assert.deepEqual(current.outcomes, ["ineligible"]);
  assert.equal(current.sent.length, 0);
  assert.equal(current.retried.length, 0);
});

test("checkout recovery worker skips a sequence that converted before delivery", async () => {
  const current = fixture("approved");

  const result = await runCheckoutRecoveryWorker(current.dependencies);

  assert.equal(result.sent, 0);
  assert.deepEqual(current.outcomes, ["converted"]);
});

test("checkout recovery worker stops non-converted purchase states as ineligible", async () => {
  const current = fixture("cancelled");

  const result = await runCheckoutRecoveryWorker(current.dependencies);

  assert.equal(result.sent, 0);
  assert.deepEqual(current.outcomes, ["ineligible"]);
});

test("checkout recovery worker does not send when final atomic reservation loses eligibility", async () => {
  const current = fixture();
  current.dependencies.outbox.reserve = async () => false;

  const result = await runCheckoutRecoveryWorker(current.dependencies);

  assert.equal(result.sent, 0);
  assert.equal(current.sent.length, 0);
  assert.deepEqual(current.outcomes, ["ineligible"]);
});

test("checkout recovery worker aborts when purchase changes after reservation", async () => {
  const current = fixture();
  current.dependencies.outbox.confirm = async () => false;

  const result = await runCheckoutRecoveryWorker(current.dependencies);

  assert.equal(result.sent, 0);
  assert.equal(current.sent.length, 0);
  assert.deepEqual(current.outcomes, ["ineligible"]);
});

test("checkout recovery worker retries provider-accepted delivery with the same idempotency key", async () => {
  const current = fixture();
  let completionFails = true;
  current.dependencies.outbox.complete = async (_job: unknown, outcome: string) => {
    if (outcome === "sent" && completionFails) {
      completionFails = false;
      throw new Error("completion_outage");
    }
    current.outcomes.push(outcome);
  };

  const first = await runCheckoutRecoveryWorker(current.dependencies);
  const second = await runCheckoutRecoveryWorker(current.dependencies);

  assert.equal(first.sent, 0);
  assert.equal(second.sent, 1);
  assert.equal(current.sent.length, 2);
  assert.equal(current.sent[0].idempotencyKey, "checkout-recovery/job-1");
  assert.equal(current.sent[1].idempotencyKey, "checkout-recovery/job-1");
  assert.deepEqual(current.retried, ["completion_outage"]);
  assert.deepEqual(current.outcomes, ["sent"]);
});
