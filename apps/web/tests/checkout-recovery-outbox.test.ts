import assert from "node:assert/strict";
import test from "node:test";

import type { SupabaseClient } from "@supabase/supabase-js";

import { SupabaseCheckoutRecoveryOutbox } from "../src/modules/notifications/adapters/supabase-checkout-recovery-outbox.ts";

test("checkout recovery outbox resolves recipient server-side instead of exposing it in job payload", async () => {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const updates: Array<Record<string, unknown>> = [];
  const client = {
    from: () => ({
      update: (value: Record<string, unknown>) => {
        updates.push(value);
        return {
          eq: async () => ({ data: null, error: null }),
        };
      },
    }),
    rpc: async (name: string, args: Record<string, unknown>) => {
      calls.push({ name, args });
      if (name === "claim_outbox_jobs") {
        return {
          data: [
            {
              attempts: 8,
              id: "job-1",
              payload: { sequence_id: "sequence-1", step: 1 },
            },
          ],
          error: null,
        };
      }
      if (name === "resolve_checkout_recovery_sequence") {
        return {
          data: {
            globally_suppressed: false,
            marketing_suppressed: false,
            purchase_status: "precheckout",
            recipient: "buyer@example.test",
            sequence_id: "sequence-1",
            unsubscribe_token: "opaque-token",
          },
          error: null,
        };
      }
      if (
        name === "reserve_checkout_recovery_job" ||
        name === "confirm_checkout_recovery_job"
      ) {
        return { data: true, error: null };
      }
      if (
        name === "complete_checkout_recovery_job" ||
        name === "retry_checkout_recovery_job"
      ) {
        return { data: null, error: null };
      }
      throw new Error(`Unexpected RPC ${name}`);
    },
  } as unknown as SupabaseClient;
  const outbox = new SupabaseCheckoutRecoveryOutbox(client);

  const jobs = await outbox.claim();
  const candidate = await outbox.resolve(jobs[0]);
  const reserved = await outbox.reserve(jobs[0]);
  const confirmed = await outbox.confirm(jobs[0]);
  await outbox.complete(jobs[0], "sent");
  await outbox.retry(jobs[0], new Error("transient"));

  assert.deepEqual(jobs[0].payload, { sequence_id: "sequence-1", step: 1 });
  assert.equal(candidate?.recipient, "buyer@example.test");
  assert.equal(candidate?.purchaseStatus, "precheckout");
  assert.equal(reserved, true);
  assert.equal(confirmed, true);
  assert.equal(updates.length, 0);
  const retryCall = calls.find((call) => call.name === "retry_checkout_recovery_job");
  assert.deepEqual(retryCall?.args, {
    p_available_at: retryCall?.args.p_available_at,
    p_error: "transient",
    p_job_id: "job-1",
    p_terminal: true,
  });
  assert.deepEqual(calls[0].args, {
    p_job_type: "send_checkout_recovery",
    p_limit: 25,
  });
  assert.deepEqual(
    calls.map((call) => call.name),
    [
      "claim_outbox_jobs",
      "resolve_checkout_recovery_sequence",
      "reserve_checkout_recovery_job",
      "confirm_checkout_recovery_job",
      "complete_checkout_recovery_job",
      "retry_checkout_recovery_job",
    ],
  );
});
