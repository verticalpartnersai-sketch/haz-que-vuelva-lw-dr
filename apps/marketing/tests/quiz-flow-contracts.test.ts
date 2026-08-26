import assert from "node:assert/strict";
import test from "node:test";

import {
  orderedQuizFlowStages,
  scoreQuestionIds,
} from "../src/features/quiz/quiz-flow-contracts.ts";

test("defines exactly 24 ordered quiz flow stages", () => {
  assert.equal(orderedQuizFlowStages.length, 24);
  assert.equal(new Set(orderedQuizFlowStages).size, 24);
  assert.deepEqual(orderedQuizFlowStages.slice(0, 3), [
    "desire_confirm",
    "age",
    "separation_time",
  ]);
  assert.deepEqual(orderedQuizFlowStages.slice(-6), [
    "analysis_loader",
    "expert_intro",
    "social_proof",
    "commitment",
    "plan_loader",
    "final_result",
  ]);
});

test("scores only the six approved question groups", () => {
  assert.deepEqual(scoreQuestionIds, [
    "separation_time",
    "breakup_initiator",
    "breakup_reasons",
    "ex_emotionality",
    "third_person",
    "current_state",
  ]);
});
