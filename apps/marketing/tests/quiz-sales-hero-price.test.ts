import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { salesCopyEs } from "../src/features/quiz/quiz-sales-copy-es.ts";

test("keeps the exact public price anchor used in the post-quiz hero", () => {
  assert.deepEqual(salesCopyEs.heroPrice, {
    compareAt: "De US$97",
    price: "Hoy por US$8,49",
  });
  assert.equal(salesCopyEs.checkout.compareAt, "Valor real US$97");
});

test("renders the price block in the first sales section before its CTA", () => {
  const source = readFileSync(
    new URL("../src/features/quiz/quiz-sales-page.tsx", import.meta.url),
    "utf8",
  );
  const heroStart = source.indexOf('<header className="quiz-sales-hero">');
  const heroEnd = source.indexOf("</header>", heroStart);
  const heroSource = source.slice(heroStart, heroEnd);
  const priceIndex = heroSource.indexOf("quiz-sales-hero__price");
  const ctaIndex = heroSource.indexOf("<SalesCta");

  assert.notEqual(heroStart, -1);
  assert.notEqual(heroEnd, -1);
  assert.notEqual(priceIndex, -1);
  assert.notEqual(ctaIndex, -1);
  assert.ok(priceIndex < ctaIndex);
});
