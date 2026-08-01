import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

const script = new URL("../scripts/verify-perfectpay-sale.mjs", import.meta.url);

function run(arguments_: string[]) {
  return spawnSync(process.execPath, [script.pathname, ...arguments_], {
    encoding: "utf8",
    env: { NODE_ENV: "test", PATH: process.env.PATH },
  });
}

test("Perfect Pay sale verifier exposes help without provider access", () => {
  const result = run(["--help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: npm run payment:verify/);
});

test("Perfect Pay sale verifier rejects malformed sale codes before provider access", () => {
  const result = run(["--sale", "not valid", "--expect", "haz_que_vuelva"]);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Usage: npm run payment:verify/);
  assert.doesNotMatch(result.stderr, /Supabase/);
});

test("Perfect Pay sale verifier fails closed without an admin environment", () => {
  const result = run(["--sale", "TEST-SALE-1", "--expect", "haz_que_vuelva"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Supabase admin environment is unavailable/);
});

test("Perfect Pay sale verifier rejects unknown product expectations", () => {
  const result = run(["--sale", "TEST-SALE-1", "--expect", "unknown"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /invalid expected product list/);
});
