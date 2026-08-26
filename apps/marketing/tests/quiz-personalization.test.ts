import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  commitmentLoaderTitle,
  desireProofLead,
  fearMirror,
  personalizeProofStories,
} from "../src/features/quiz/quiz-personalization.ts";

const stories = [
  { id: "camila" as const },
  { id: "valentina" as const },
  { id: "sofia" as const },
];

test("the desire choice changes the first proof story without dropping any proof", () => {
  const missing = personalizeProofStories(stories, "desire_missing");
  const control = personalizeProofStories(stories, "desire_control");

  assert.deepEqual(
    missing.map((story) => story.id),
    ["camila", "valentina", "sofia"],
  );
  assert.deepEqual(
    control.map((story) => story.id),
    ["sofia", "camila", "valentina"],
  );
  assert.equal(new Set(missing.map((story) => story.id)).size, 3);
  assert.equal(new Set(control.map((story) => story.id)).size, 3);
});

test("the desire choice produces visibly different aggressive proof framing", () => {
  assert.match(desireProofLead("desire_missing", "es"), /ausencia/i);
  assert.match(desireProofLead("desire_control", "es"), /exactamente qué hacer/i);
  assert.notEqual(
    desireProofLead("desire_missing", "es"),
    desireProofLead("desire_control", "es"),
  );
});

test("the commitment choice changes the second loader promise", () => {
  assert.match(commitmentLoaderTitle("commit_route", "es") ?? "", /ruta de 7 días/i);
  assert.match(commitmentLoaderTitle("commit_simple", "es") ?? "", /exactamente qué hacer/i);
  assert.equal(commitmentLoaderTitle(undefined, "es"), undefined);
});

test("every dominant fear changes the visible prediagnosis mirror", () => {
  const forgotten = fearMirror("forgotten", "es");
  const otherWoman = fearMirror("other_woman", "es");
  const closedWindow = fearMirror("closed_window", "es");
  const repeatCycle = fearMirror("repeat_cycle", "es");

  assert.match(forgotten, /te olvide/i);
  assert.match(otherWoman, /otra/i);
  assert.match(closedWindow, /ventana/i);
  assert.match(repeatCycle, /desaparezca otra vez/i);
  assert.equal(new Set([forgotten, otherWoman, closedWindow, repeatCycle]).size, 4);
});

test("the active quiz renders both personalization decisions", () => {
  const demonstration = readFileSync(
    new URL("../src/features/quiz/quiz-middle.tsx", import.meta.url),
    "utf8",
  );
  const router = readFileSync(
    new URL("../src/features/quiz/quiz-stage-router.tsx", import.meta.url),
    "utf8",
  );

  assert.match(demonstration, /personalizeProofStories/);
  assert.match(demonstration, /desireProofLead/);
  assert.match(demonstration, /fearMirror/);
  assert.match(router, /commitmentLoaderTitle/);
});
