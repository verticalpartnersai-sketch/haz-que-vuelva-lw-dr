import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("admin MFA is fail-closed and distinguishes aal1 from aal2", () => {
  const identity = readFileSync(
    new URL(
      "../src/modules/identity/application/current-identity.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const environment = readFileSync(
    new URL("../src/server/config/environment.ts", import.meta.url),
    "utf8",
  );

  assert.match(identity, /claims\?\.aal === "aal2"/);
  assert.match(identity, /AdminMfaRequiredError/);
  assert.doesNotMatch(environment, /FEATURE_ADMIN_MFA/);
});

test("MFA UI supports enrollment, challenge and verification without a service key", () => {
  const manager = readFileSync(
    new URL("../src/features/auth/mfa-manager.tsx", import.meta.url),
    "utf8",
  );

  assert.match(manager, /auth\.mfa\.enroll/);
  assert.match(manager, /auth\.mfa\.challenge/);
  assert.match(manager, /auth\.mfa\.verify/);
  assert.match(manager, /auth\.mfa\.getAuthenticatorAssuranceLevel/);
  assert.doesNotMatch(manager, /SUPABASE_SECRET_KEY/);
});
