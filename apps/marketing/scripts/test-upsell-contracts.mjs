import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import ts from "typescript";

import { OFFER_SOURCES, marketingRoot, offerSourceLabel } from "./upsell-copy-parser.mjs";

async function importTypeScriptModule(relativePath) {
  const source = await readFile(path.join(marketingRoot, relativePath), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const url = "data:text/javascript;base64," + Buffer.from(output).toString("base64");
  return import(url);
}

const links = await importTypeScriptModule("src/features/upsells/offer-links.ts");
const longValue = "x".repeat(513);
const internal = links.withPreservedQuery("/d1?fixed=yes#decision", {
  fixed: "no",
  email: ["ana@example.com", "ignored@example.com"],
  empty: "",
  long: longValue,
  utm_source: "quiz",
});
assert.equal(
  internal,
  "/d1?fixed=yes&email=ana%40example.com&utm_source=quiz#decision",
  "Internal decline must preserve valid query values without overwriting destination values",
);

const external = links.configuredOfferUrl("https://checkout.example/offer?sku=up1", {
  src: "postpurchase",
});
assert.equal(external, "https://checkout.example/offer?sku=up1&src=postpurchase");
assert.equal(links.configuredOfferUrl(undefined, {}), null);
assert.equal(links.configuredOfferUrl("http://%", {}), null);

const routeContracts = {
  up1: ["NEXT_PUBLIC_UPSELL_1_ACCEPT_URL", 'withPreservedQuery("/d1", query)'],
  d1: ["NEXT_PUBLIC_DOWNSELL_1_ACCEPT_URL", 'withPreservedQuery("/gracias", query)'],
  up2: ["NEXT_PUBLIC_UPSELL_2_ACCEPT_URL", 'withPreservedQuery("/d2", query)'],
  d2: ["NEXT_PUBLIC_DOWNSELL_2_ACCEPT_URL", 'withPreservedQuery("/gracias", query)'],
};

const wranglerSource = await readFile(path.join(marketingRoot, "wrangler.jsonc"), "utf8");
const { config: wranglerConfig, error: wranglerParseError } = ts.parseConfigFileTextToJson(
  "wrangler.jsonc",
  wranglerSource,
);
assert.equal(wranglerParseError, undefined, "wrangler.jsonc could not be parsed");
const downsellCheckoutContracts = {
  NEXT_PUBLIC_DOWNSELL_1_ACCEPT_URL: "https://go.centerpag.com/PPU38CQF53H",
  NEXT_PUBLIC_DOWNSELL_2_ACCEPT_URL: "https://go.centerpag.com/PPU38CQF54K",
};

for (const [environmentName, checkoutUrl] of Object.entries(downsellCheckoutContracts)) {
  assert.equal(
    wranglerConfig.vars?.[environmentName],
    checkoutUrl,
    environmentName + " is not configured with the approved checkout URL",
  );
}

for (const [route, [environmentName, declineCall]] of Object.entries(routeContracts)) {
  const source = await readFile(path.join(marketingRoot, "src/app", route, "page.tsx"), "utf8");
  assert.ok(source.includes(environmentName), route + " environment mapping changed");
  assert.ok(source.includes(declineCall), route + " decline route changed");
  assert.ok(source.includes('route="' + route + '"'), route + " copy mapping changed");
  assert.match(source, /robots:\s*\{ follow: false, index: false \}/);
}

const generated = JSON.parse(
  await readFile(
    path.join(marketingRoot, "src/features/upsells/generated/offer-copy.generated.json"),
    "utf8",
  ),
);
assert.deepEqual(Object.keys(generated), Object.keys(OFFER_SOURCES));

for (const route of Object.keys(OFFER_SOURCES)) {
  assert.equal(generated[route].source, offerSourceLabel(route));
  assert.ok(generated[route].blocks.length > 10, route + " generated too few copy blocks");
}

const visualAssets = [
  "public/images/upsells/generated/up1-second-loss-v1.webp",
  "public/images/upsells/generated/up1-message-reopens-v1.webp",
  "public/images/upsells/generated/up1-reciprocity-v1.webp",
  "public/images/upsells/generated/up2-new-message-v1.webp",
  "public/images/upsells/generated/up2-context-decision-v1.webp",
];

for (const relativePath of visualAssets) {
  const absolutePath = path.join(marketingRoot, relativePath);
  const [metadata, details] = await Promise.all([sharp(absolutePath).metadata(), stat(absolutePath)]);
  assert.equal(metadata.format, "webp", relativePath + " is not WebP");
  assert.ok((metadata.width ?? 0) >= 1100, relativePath + " is too narrow");
  assert.ok(details.size < 300_000, relativePath + " exceeds the image budget");
}

const componentSource = await readFile(
  path.join(marketingRoot, "src/features/upsells/postpurchase-offer-page.tsx"),
  "utf8",
);
assert.ok(componentSource.includes("splitOfferSections"));
assert.ok(componentSource.includes("MobileDecisionBar"));
assert.ok(componentSource.includes("OfferCopyBlocks"));

const stylesheet = await readFile(
  path.join(marketingRoot, "src/design-system/postpurchase-responsive.css"),
  "utf8",
);
assert.ok(stylesheet.includes("min-height: 44px"), "Mobile decline target is smaller than 44px");
assert.ok(stylesheet.includes("prefers-reduced-motion"), "Reduced-motion handling is missing");

console.log("Verified offer links, route wiring, generated copy, image budgets, sticky CTA, and accessibility guards.");
