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

test("uses the approved single-option female-audience opening in Spanish", () => {
  const opening = quizFlowCopyEs.screens[0];
  assert.deepEqual(
    opening.options?.map((option) => option.label),
    ["Sí, quiero que vuelva"],
  );
});

test("matches the benchmark interstitial argument with male-target adaptation", () => {
  const mechanism = quizFlowCopyEs.screens[7];
  const urgency = quizFlowCopyEs.screens[11];
  const obsession = quizFlowCopyEs.screens[17];

  assert.equal(
    mechanism.title,
    "¿Cómo funciona esto en la vida real para reconquistarlo?",
  );
  assert.match(mechanism.body?.join(" ") ?? "", /dopamina \(deseo\) y oxitocina/);
  assert.match(mechanism.body?.join(" ") ?? "", /completamente obsesionado contigo/);
  assert.equal(urgency.title, "¡Necesitas actuar AHORA!");
  assert.equal(urgency.subtitle, "¡O él puede irse para siempre!");
  assert.equal(obsession.title, "Él quedará loco y obsesionado contigo 🔥");
  assert.match(obsession.body?.join(" ") ?? "", /terminar en tu cama/);
});

test("uses the benchmark authority copy with Lucía Herrera", () => {
  const authority = quizFlowCopyEs.screens[19];
  const body = authority.body?.join(" ") ?? "";

  assert.equal(authority.title, "¡Gracias por tus respuestas!");
  assert.equal(authority.subtitle, "¡Estoy aquí para ayudarte!");
  assert.match(body, /Lucía Herrera/);
  assert.match(body, /5 años de investigación y pruebas/);
  assert.match(body, /gatillos neurológicos/);
  assert.match(body, /plan comprobado de 21 días/);
  assert.match(body, /sin humillarte/);
});

test("keeps the current proof stories and adds the benchmark 93 percent claim", () => {
  const proof = quizFlowCopyEs.screens[20];

  assert.equal(proof.title, "93%");
  assert.match(proof.subtitle ?? "", /93% de mis alumnas/);
  assert.deepEqual(
    quizFlowCopyEs.proofs.map((item) => item.name),
    ["Camila", "Valentina", "Sofía"],
  );
});

test("keeps variable score with the benchmark 21-day result and eight promises", () => {
  assert.equal(
    quizFlowCopyEs.result.title,
    "¡Tu plan de 21 días para reconquistar a tu ex y hacer que se enamore de ti otra vez está listo!",
  );
  assert.deepEqual(
    quizFlowCopyEs.result.timeline.map((item) => item.label),
    ["AHORA", "DESPUÉS DE 2 DÍAS", "DESPUÉS DE 2 SEMANAS", "21 DÍAS"],
  );
  assert.equal(quizFlowCopyEs.result.outcomes.length, 8);
  assert.match(quizFlowCopyEs.result.outcomes.join(" "), /incapaz de controlarse/);
  assert.match(quizFlowCopyEs.result.outcomes.join(" "), /Volverá a tu cama/);
  assert.match(quizFlowCopyEs.result.outcomes.join(" "), /emocional y físicamente/);
  assert.equal(quizFlowCopyEs.result.scoreLabel, "Probabilidad de reconquistar a tu ex");
  assert.equal(quizFlowCopyPt.result.scoreLabel, "Probabilidade de reconquistar o seu ex");
});
