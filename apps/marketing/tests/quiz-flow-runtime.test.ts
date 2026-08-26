import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultQuizSession,
  parseQuizSession,
  quizSessionStorageKey,
  serializeQuizSession,
} from "../src/features/quiz/quiz-flow-runtime.ts";

test("uses the versioned v2 storage key", () => {
  assert.equal(quizSessionStorageKey, "hqv:quiz:v2");
});

test("uses a score of 92 for direct offer access", () => {
  assert.deepEqual(defaultQuizSession(), {
    completedAt: "",
    score: 92,
    scoreBand: "92_96",
    version: "hqv_quiz_v2",
  });
});

test("round-trips only the approved session fields", () => {
  const encoded = serializeQuizSession({
    completedAt: "2026-08-26T12:00:00.000Z",
    score: 89,
    scoreBand: "87_91",
    version: "hqv_quiz_v2",
  });
  assert.deepEqual(parseQuizSession(encoded), {
    completedAt: "2026-08-26T12:00:00.000Z",
    score: 89,
    scoreBand: "87_91",
    version: "hqv_quiz_v2",
  });
});

test("rejects malformed, legacy, or out-of-range sessions", () => {
  assert.equal(parseQuizSession("not-json"), null);
  assert.equal(
    parseQuizSession(JSON.stringify({
      completedAt: "x",
      score: 92,
      scoreBand: "92_96",
      version: "old",
    })),
    null,
  );
  assert.equal(
    parseQuizSession(JSON.stringify({
      completedAt: "x",
      score: 99,
      scoreBand: "92_96",
      version: "hqv_quiz_v2",
    })),
    null,
  );
});
