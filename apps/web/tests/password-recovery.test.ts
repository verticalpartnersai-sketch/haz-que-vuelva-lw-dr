import assert from "node:assert/strict";
import test from "node:test";

import { buildPasswordRecoveryEmail } from "../src/modules/notifications/application/password-recovery-email.ts";
import { requestPasswordRecovery } from "../src/modules/notifications/application/request-password-recovery.ts";

test("password recovery email is branded, Spanish and hides Supabase", () => {
  const email = buildPasswordRecoveryEmail(
    'https://miembros.hazquevuelva.site/auth/confirm?token_hash=<token>&type=recovery',
  );

  assert.equal(email.subject, "Restablece tu acceso a Haz Que Vuelva");
  assert.match(email.html, /alt="Haz Que Vuelva"/);
  assert.match(email.html, /RESTABLECER MI CONTRASEÑA/);
  assert.match(email.html, /token_hash=&lt;token&gt;&amp;type=recovery/);
  assert.doesNotMatch(email.html, /Supabase/i);
  assert.match(email.text, /enlace es personal, de un solo uso/i);
});

test("password recovery sends a server-verifiable recovery token", async () => {
  const sent: Array<{ actionUrl: string; recipient: string }> = [];
  const result = await requestPasswordRecovery(
    {
      clientHash: "a".repeat(64),
      email: "  Usuario@Example.com ",
    },
    {
      auth: {
        admin: {
          generateLink: async () => ({
            data: { properties: { hashed_token: "secure-token-hash" } },
            error: null,
          }),
        },
      } as never,
      callbackUrl: "https://miembros.hazquevuelva.site/auth/confirm",
      rateLimiter: { claim: async () => true },
      sender: {
        send: async (message) => {
          sent.push(message);
        },
      },
      suppressionStore: { isSuppressed: async () => false },
    },
  );

  assert.deepEqual(result, { accepted: true, sent: true });
  assert.equal(sent.length, 1);
  assert.equal(sent[0]?.recipient, "usuario@example.com");
  const action = new URL(sent[0]?.actionUrl ?? "");
  assert.equal(action.searchParams.get("token_hash"), "secure-token-hash");
  assert.equal(action.searchParams.get("type"), "recovery");
  assert.equal(action.searchParams.get("next"), "/auth/restablecer");
});

test("password recovery remains generic when rate limited or account is absent", async () => {
  let generateCalls = 0;
  let sendCalls = 0;
  const base = {
    auth: {
      admin: {
        generateLink: async () => {
          generateCalls += 1;
          return { data: { properties: null }, error: { code: "user_not_found" } };
        },
      },
    } as never,
    callbackUrl: "https://miembros.hazquevuelva.site/auth/confirm",
    sender: {
      send: async () => {
        sendCalls += 1;
      },
    },
    suppressionStore: { isSuppressed: async () => false },
  };

  const limited = await requestPasswordRecovery(
    { clientHash: "b".repeat(64), email: "user@example.com" },
    { ...base, rateLimiter: { claim: async () => false } },
  );
  const absent = await requestPasswordRecovery(
    { clientHash: "c".repeat(64), email: "missing@example.com" },
    { ...base, rateLimiter: { claim: async () => true } },
  );

  assert.deepEqual(limited, { accepted: true, sent: false });
  assert.deepEqual(absent, { accepted: true, sent: false });
  assert.equal(generateCalls, 1);
  assert.equal(sendCalls, 0);
});
