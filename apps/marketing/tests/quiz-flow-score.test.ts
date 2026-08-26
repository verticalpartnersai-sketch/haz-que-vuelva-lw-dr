import assert from "node:assert/strict";
import test from "node:test";

import {
  probabilityBand,
  reconquestProbability,
} from "../src/features/quiz/quiz-flow-score.ts";
import type { QuizFlowAnswers } from "../src/features/quiz/quiz-flow-contracts.ts";

const lowScenario: QuizFlowAnswers = {
  separation_time: "gt_6m",
  breakup_initiator: "he_ended",
  breakup_reasons: ["i_cheated", "constant_fights"],
  ex_emotionality: "emotion_1",
  third_person: "yes",
  current_state: "blocked",
};

const highScenario: QuizFlowAnswers = {
  separation_time: "lt_7d",
  breakup_initiator: "i_ended",
  breakup_reasons: ["external_pressure"],
  ex_emotionality: "emotion_4",
  third_person: "no",
  current_state: "post_breakup_intimacy",
};

test("clamps the lowest scenario to 82", () => {
  assert.equal(reconquestProbability(lowScenario), 82);
});

test("clamps the highest scenario to 96", () => {
  assert.equal(reconquestProbability(highScenario), 96);
});

test("returns the same score for the same answers", () => {
  assert.equal(
    reconquestProbability(highScenario),
    reconquestProbability({ ...highScenario }),
  );
});

test("caps multi-select breakup reasons between minus three and plus one", () => {
  const withOnePenalty = reconquestProbability({
    breakup_reasons: ["i_cheated"],
  });
  const withManyPenalties = reconquestProbability({
    breakup_reasons: ["i_cheated", "he_cheated", "constant_fights"],
  });
  assert.equal(withOnePenalty, withManyPenalties);
});

test("maps score ranges to the approved bands", () => {
  assert.equal(probabilityBand(82), "82_86");
  assert.equal(probabilityBand(86), "82_86");
  assert.equal(probabilityBand(87), "87_91");
  assert.equal(probabilityBand(91), "87_91");
  assert.equal(probabilityBand(92), "92_96");
  assert.equal(probabilityBand(96), "92_96");
});

test("rejects scores outside the public range", () => {
  assert.throws(() => probabilityBand(81));
  assert.throws(() => probabilityBand(97));
});
