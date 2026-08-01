import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, test } from "node:test";

import { resolveUnicodePath } from "../scripts/resolve-unicode-path.mjs";

const script = new URL("../scripts/content-release-preflight.mjs", import.meta.url);
const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { force: true, recursive: true }),
    ),
  );
});

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

test("content release preflight resolves decomposed macOS paths from NFC manifests", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hqv-content-path-"));
  temporaryDirectories.push(root);
  const decomposedDirectory = "Operação".normalize("NFD");
  const actualDirectory = path.join(root, decomposedDirectory);
  await mkdir(actualDirectory);
  await writeFile(path.join(actualDirectory, "material.pdf"), "fixture");

  const resolved = await resolveUnicodePath(root, "Operação", "material.pdf");

  assert.equal(
    resolved.normalize("NFC"),
    path.join(actualDirectory, "material.pdf").normalize("NFC"),
  );
  assert.equal(await readFile(resolved, "utf8"), "fixture");
});
