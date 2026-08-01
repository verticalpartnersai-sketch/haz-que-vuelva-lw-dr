import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("admin authorization is owner-role-gated without MFA state", () => {
  const identity = readFileSync(
    new URL(
      "../src/modules/identity/application/current-identity.ts",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(identity, /identity\.role !== "admin"/);
  assert.doesNotMatch(identity, /AdminMfaRequiredError/);
  assert.doesNotMatch(identity, /assuranceLevel/);
});

test("member profile does not expose MFA enrollment", () => {
  const profile = readFileSync(
    new URL("../src/features/profile/profile-page.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(profile, /\/auth\/mfa/);
  assert.doesNotMatch(profile, /Autenticación en dos pasos/);
});
