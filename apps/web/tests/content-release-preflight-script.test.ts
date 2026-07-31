import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

const script = new URL("../scripts/content-release-preflight.mjs", import.meta.url);

function run(arguments_: string[]) {
  return spawnSync(
    process.execPath,
    ["--experimental-strip-types", script.pathname, ...arguments_],
    {
      encoding: "utf8",
      env: { HOME: "/nonexistent", NODE_ENV: "test", PATH: process.env.PATH },
    },
  );
}

test("content release preflight exposes help without reading product files", () => {
  const result = run(["--help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: npm run content:preflight/);
});

test("content release preflight fails closed when an approved file is absent", () => {
  const result = run(["/nonexistent/content-release"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /haz_que_vuelva file is unavailable/);
});
