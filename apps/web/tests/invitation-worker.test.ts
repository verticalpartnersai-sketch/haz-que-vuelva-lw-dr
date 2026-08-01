import assert from "node:assert/strict";
import test from "node:test";

import type { SupabaseClient } from "@supabase/supabase-js";

import { runInvitationWorker } from "../src/modules/notifications/application/run-invitation-worker.ts";

function dependencies(generateLink: SupabaseClient["auth"]["admin"]["generateLink"]) {
  const sent: Array<{ actionUrl: string }> = [];
  let completed = 0;
  return {
    completed: () => completed,
    input: {
      auth: { admin: { generateLink } } as SupabaseClient["auth"],
      outbox: {
        claim: async () => [
          {
            attempts: 1,
            id: "invitation-job-id",
            payload: { email: "member@example.com", member_id: "member-id" },
          },
        ],
        complete: async () => {
          completed += 1;
        },
        retry: async () => assert.fail("invitation should not be retried"),
      },
      redirectTo: "https://miembros.hazquevuelva.site/auth/confirm",
      sender: {
        send: async (message: { actionUrl: string }) => {
          sent.push(message);
        },
      },
    },
    sent,
  };
}

test("invitation worker sends a server-verifiable token hash callback", async () => {
  const fixture = dependencies(async () =>
    ({
      data: {
        properties: {
          action_link: "https://provider.invalid/implicit-link",
          email_otp: "123456",
          hashed_token: "hashed-invite-token",
          redirect_to: "https://miembros.hazquevuelva.site/auth/confirm",
          verification_type: "invite",
        },
        user: {},
      },
      error: null,
    }) as never,
  );

  const result = await runInvitationWorker(fixture.input as never);
  const callback = new URL(fixture.sent[0].actionUrl);
  assert.equal(result.completed, 1);
  assert.equal(fixture.completed(), 1);
  assert.equal(callback.origin, "https://miembros.hazquevuelva.site");
  assert.equal(callback.pathname, "/auth/confirm");
  assert.equal(callback.searchParams.get("token_hash"), "hashed-invite-token");
  assert.equal(callback.searchParams.get("type"), "invite");
  assert.equal(callback.searchParams.get("next"), "/auth/definir-contrasena");
  assert.equal(callback.hash, "");
});

test("invitation worker falls back to recovery for an already confirmed account", async () => {
  const calls: string[] = [];
  const fixture = dependencies(async (input) => {
    calls.push(input.type);
    if (input.type === "invite") {
      return { data: { properties: null, user: null }, error: { code: "email_exists" } } as never;
    }
    return {
      data: {
        properties: {
          action_link: "https://provider.invalid/implicit-recovery",
          email_otp: "654321",
          hashed_token: "hashed-recovery-token",
          redirect_to: "https://miembros.hazquevuelva.site/auth/confirm",
          verification_type: "recovery",
        },
        user: {},
      },
      error: null,
    } as never;
  });

  const result = await runInvitationWorker(fixture.input as never);
  const callback = new URL(fixture.sent[0].actionUrl);
  assert.deepEqual(calls, ["invite", "recovery"]);
  assert.equal(result.completed, 1);
  assert.equal(callback.searchParams.get("token_hash"), "hashed-recovery-token");
  assert.equal(callback.searchParams.get("type"), "recovery");
});
