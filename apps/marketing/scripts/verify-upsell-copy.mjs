import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  CANONICAL_HASHES,
  OFFER_SOURCES,
  compileOffers,
  marketingRoot,
  normalizeSnapshot,
  offerSourceLabel,
} from "./upsell-copy-parser.mjs";

const artifactPath = path.join(
  marketingRoot,
  "src/features/upsells/generated/offer-copy.generated.json",
);

const expectedCtas = Object.freeze({
  up1: {
    count: 3,
    positive: "SÍ, QUIERO PROTEGER ESTA SEGUNDA OPORTUNIDAD POR US$6,90",
    negative: "No, gracias. Voy a perder esta segunda oportunidad.",
  },
  d1: {
    count: 3,
    positive: "SÍ, QUIERO PROTEGER ESTA SEGUNDA OPORTUNIDAD POR US$4,90",
    negative: "No, gracias. Voy a perder esta segunda oportunidad.",
  },
  up2: {
    count: 4,
    positive: "SÍ, QUIERO VUELVE IA™ ACOMPAÑANDO MI CASO DURANTE 90 DÍAS POR US$20",
    negative: "No, gracias. Prefiero seguir interpretando cada mensaje sola.",
  },
  d2: {
    count: 4,
    positive: "SÍ, QUIERO VUELVE IA™ ACOMPAÑANDO MI CASO DURANTE 90 DÍAS POR US$15",
    negative: "No, gracias. Prefiero seguir interpretando cada mensaje sola.",
  },
});

function verifyOffer(route, offer) {
  assert.equal(
    offer.sourceHash,
    CANONICAL_HASHES[route],
    route + " snapshot differs from the approved Oracle copy",
  );

  const reconstructed = offer.blocks.map((block) => block.raw).join("\n\n");
  assert.equal(reconstructed, offer.raw, route + " blocks omit or reorder canonical copy");

  const cta = expectedCtas[route];
  const positiveBlocks = offer.blocks.filter((block) => block.type === "positive_cta");
  const negativeBlocks = offer.blocks.filter((block) => block.type === "negative_cta");
  assert.equal(positiveBlocks.length, cta.count, route + " positive CTA count changed");
  assert.equal(negativeBlocks.length, cta.count, route + " negative CTA count changed");

  for (const positive of positiveBlocks) {
    assert.equal(positive.text, cta.positive, route + " positive CTA text changed");
    const next = offer.blocks[positive.index + 1];
    assert.equal(next?.type, "negative_cta", route + " CTA pair is no longer adjacent");
    assert.equal(next?.text, cta.negative, route + " negative CTA text changed");
  }

  assert.ok(offer.raw.includes("Política de privacidad"), route + " lacks privacy link");
  assert.ok(offer.raw.includes("Términos de uso"), route + " lacks terms link");
}

const current = await compileOffers();
const generated = JSON.parse(await readFile(artifactPath, "utf8"));
assert.deepEqual(generated, current, "Generated copy does not match the snapshots");

for (const [route, offer] of Object.entries(current)) {
  assert.equal(offer.source, offerSourceLabel(route));
  verifyOffer(route, offer);
}

for (const route of ["up1", "d1"]) {
  assert.match(current[route].raw, /US\$(?:6,90|4,90)/, route + " price is missing");
  assert.match(current[route].raw, /30 días/i, route + " duration is missing");
}

for (const route of ["up2", "d2"]) {
  assert.match(current[route].raw, /90 días/i, route + " 90-day duration is missing");
  assert.doesNotMatch(
    current[route].raw,
    /(?:añade|acompañando mi caso|contexto continuo) durante 30 días/i,
    route + " contains the stale 30-day VUELVE IA promise",
  );
}

for (const sourcePath of Object.values(OFFER_SOURCES).flat()) {
  const raw = await readFile(path.join(marketingRoot, sourcePath), "utf8");
  assert.equal(raw, normalizeSnapshot(raw) + "\n", sourcePath + " must end with one newline");
}

console.log("Verified canonical copy, block order, CTA pairs, prices, duration, and legal text.");
