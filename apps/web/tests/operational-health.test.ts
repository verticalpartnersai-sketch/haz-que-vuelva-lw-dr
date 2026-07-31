import assert from "node:assert/strict";
import test from "node:test";

import { evaluateOperationalHealth } from "../src/modules/audit/domain/operational-health.ts";
import { hasValidInternalCredential } from "../src/server/security/internal-credential.ts";

test("operational health accepts an empty and current queue", () => {
  const result = evaluateOperationalHealth({
    deadJobs: 0,
    overdueJobs: 0,
    staleLocks: 0,
    unprocessedEvents: 0,
  });
  assert.equal(result.healthy, true);
  assert.deepEqual(result.issues, []);
});
test("operational health reports every blocking queue condition", () => {
  const result = evaluateOperationalHealth({
    deadJobs: 2,
    overdueJobs: 1,
    staleLocks: 3,
    unprocessedEvents: 4,
  });
  assert.equal(result.healthy, false);
  assert.deepEqual(result.issues, [
    "deadJobs",
    "overdueJobs",
    "staleLocks",
    "unprocessedEvents",
  ]);
});

test("internal credential validation fails closed", () => {
  const expected = "a".repeat(32);
  assert.equal(
    hasValidInternalCredential(new Request("https://internal.invalid"), expected),
    false,
  );
  assert.equal(
    hasValidInternalCredential(
      new Request("https://internal.invalid", {
        headers: { Authorization: `Bearer ${"b".repeat(32)}` },
      }),
      expected,
    ),
    false,
  );
  assert.equal(
    hasValidInternalCredential(
      new Request("https://internal.invalid", {
        headers: { Authorization: `Bearer ${expected}` },
      }),
      expected,
    ),
    true,
  );
  assert.equal(
    hasValidInternalCredential(
      new Request("https://internal.invalid", {
        headers: { Authorization: `Bearer ${expected}` },
      }),
      undefined,
    ),
    false,
  );
});
