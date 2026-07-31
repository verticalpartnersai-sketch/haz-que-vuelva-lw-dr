import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const script = new URL("../scripts/bootstrap-first-admin.mjs", import.meta.url);

function run(
  arguments_: string[],
  environment: Record<string, string | undefined> = {},
) {
  return spawnSync(process.execPath, [script.pathname, ...arguments_], {
    encoding: "utf8",
    env: {
      NODE_ENV: "test",
      PATH: process.env.PATH,
      ...environment,
    },
  });
}

test("first-admin bootstrap exposes help without provider access", () => {
  const result = run(["--help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: npm run admin:bootstrap/);
});

test("first-admin bootstrap rejects an invalid email", () => {
  const result = run(["not-an-email"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /valid email is required/);
});

test("first-admin bootstrap fails closed without exact execution confirmation", () => {
  const result = run(["admin@example.com", "--execute"], {
    HQV_ADMIN_BOOTSTRAP_CONFIRM: "BOOTSTRAP_ADMIN:someone-else@example.com",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /does not match the target/);
});

test("first-admin plan requires an explicit Supabase admin environment", () => {
  const result = run(["admin@example.com"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Supabase admin environment is unavailable/);
});
