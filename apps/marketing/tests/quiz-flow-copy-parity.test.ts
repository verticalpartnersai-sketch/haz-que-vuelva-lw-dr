import assert from "node:assert/strict";
import test from "node:test";

import { quizFlowCopyEs } from "../src/features/quiz/quiz-flow-copy-es.ts";
import { quizFlowCopyPt } from "../src/features/quiz/quiz-flow-copy-pt.ts";
import { orderedQuizFlowStages } from "../src/features/quiz/quiz-flow-contracts.ts";

function shape(copy: typeof quizFlowCopyEs) {
  return copy.screens.map((screen) => ({
    id: screen.id,
    optionCount: screen.options?.length ?? 0,
    values: screen.options?.map((option) => option.value) ?? [],
  }));
}

test("keeps all 24 screens in the canonical order", () => {
  assert.deepEqual(
    quizFlowCopyEs.screens.map((screen) => screen.id),
    orderedQuizFlowStages,
  );
  assert.deepEqual(
    quizFlowCopyPt.screens.map((screen) => screen.id),
    orderedQuizFlowStages,
  );
});

test("keeps Spanish and Portuguese option IDs structurally identical", () => {
  assert.deepEqual(shape(quizFlowCopyEs), shape(quizFlowCopyPt));
});

test("uses the approved female-audience opening in Spanish", () => {
  const opening = quizFlowCopyEs.screens[0];
  assert.deepEqual(
    opening.options?.map((option) => option.label),
    ["Sí, quiero que vuelva", "Todavía no estoy segura"],
  );
});

test("keeps the approved authority and result labels", () => {
  assert.match(quizFlowCopyEs.screens[19].body?.join(" ") ?? "", /Lucía Herrera/);
  assert.equal(
    quizFlowCopyEs.result.scoreLabel,
    "Probabilidad de reconquistar a tu ex",
  );
  assert.equal(quizFlowCopyPt.result.scoreLabel, "Probabilidade de reconquistar o seu ex");
});
