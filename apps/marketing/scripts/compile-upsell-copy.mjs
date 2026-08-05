import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { compileOffers, marketingRoot } from "./upsell-copy-parser.mjs";

const outputPath = path.join(
  marketingRoot,
  "src/features/upsells/generated/offer-copy.generated.json",
);

const payload = JSON.stringify(await compileOffers(), null, 2) + "\n";

if (process.argv.includes("--check")) {
  const current = await readFile(outputPath, "utf8").catch(() => "");
  assert.equal(
    current,
    payload,
    "Generated upsell copy is stale. Run npm run generate:upsell-copy.",
  );
  console.log("Upsell copy artifact is current.");
} else {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, payload, "utf8");
  console.log("Generated " + path.relative(marketingRoot, outputPath));
}
