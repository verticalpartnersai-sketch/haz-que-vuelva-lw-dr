import type { QuizSessionV2, ScoreBand } from "./quiz-flow-contracts.ts";
import { probabilityBand } from "./quiz-flow-score.ts";

export const quizSessionStorageKey = "hqv:quiz:v2";

export function defaultQuizSession(): QuizSessionV2 {
  return {
    completedAt: "",
    score: 92,
    scoreBand: "92_96",
    version: "hqv_quiz_v2",
  };
}

function isScoreBand(value: unknown): value is ScoreBand {
  return value === "82_86" || value === "87_91" || value === "92_96";
}

export function parseQuizSession(value: string | null): QuizSessionV2 | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<QuizSessionV2>;
    if (
      parsed.version !== "hqv_quiz_v2" ||
      typeof parsed.completedAt !== "string" ||
      typeof parsed.score !== "number" ||
      !Number.isInteger(parsed.score) ||
      !isScoreBand(parsed.scoreBand) ||
      probabilityBand(parsed.score) !== parsed.scoreBand
    ) {
      return null;
    }
    return {
      completedAt: parsed.completedAt,
      score: parsed.score,
      scoreBand: parsed.scoreBand,
      version: "hqv_quiz_v2",
    };
  } catch {
    return null;
  }
}

export function serializeQuizSession(session: QuizSessionV2) {
  if (probabilityBand(session.score) !== session.scoreBand) {
    throw new RangeError("Score and score band do not match");
  }
  return JSON.stringify({
    completedAt: session.completedAt,
    score: session.score,
    scoreBand: session.scoreBand,
    version: "hqv_quiz_v2",
  } satisfies QuizSessionV2);
}

export function readQuizSession(storage: Pick<Storage, "getItem">) {
  return parseQuizSession(storage.getItem(quizSessionStorageKey));
}

export function writeQuizSession(
  storage: Pick<Storage, "setItem">,
  session: QuizSessionV2,
) {
  storage.setItem(quizSessionStorageKey, serializeQuizSession(session));
}
