import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOfferHandoffPath,
  canContinueMultiple,
  nextStageIndex,
  toggleMultipleAnswer,
} from "../src/features/quiz/quiz-flow-engine.ts";

test("advances one stage without passing the result", () => {
  assert.equal(nextStageIndex(0), 1);
  assert.equal(nextStageIndex(22), 23);
  assert.equal(nextStageIndex(23), 23);
});

test("requires at least one selection on multiple-choice screens", () => {
  assert.equal(canContinueMultiple([]), false);
  assert.equal(canContinueMultiple(["one"]), true);
});

test("toggles multi-select values without duplicates", () => {
  assert.deepEqual(toggleMultipleAnswer([], "one"), ["one"]);
  assert.deepEqual(toggleMultipleAnswer(["one"], "two"), ["one", "two"]);
  assert.deepEqual(toggleMultipleAnswer(["one", "two"], "one"), ["two"]);
});

test("forwards only allowlisted attribution to the offer", () => {
  assert.equal(
    buildOfferHandoffPath({
      utm_source: "meta",
      utm_campaign: "HQV-01",
      fbclid: "fb-123",
      email: "private@example.invalid",
      phone: "+5500000000000",
      token: "secret",
    }),
    "/off?fbclid=fb-123&utm_campaign=HQV-01&utm_source=meta",
  );
  assert.equal(buildOfferHandoffPath({ email: "private@example.invalid" }), "/off");
});
