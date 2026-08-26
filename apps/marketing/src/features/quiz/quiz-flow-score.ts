import type {
  QuizFlowAnswers,
  ScoreBand,
} from "./quiz-flow-contracts.ts";

const BASE_SCORE = 90;
const MIN_SCORE = 82;
const MAX_SCORE = 96;

const separationWeights = {
  around_1m: 1,
  gt_6m: -3,
  lt_7d: 2,
  m2_6: -1,
} as const;

const initiatorWeights = {
  he_ended: -2,
  i_ended: 1,
  mutual: 0,
} as const;

const reasonWeights = {
  constant_fights: -1,
  different_goals: -1,
  external_pressure: 0,
  he_cheated: -2,
  he_stopped_loving: -2,
  i_cheated: -3,
  other_reason: 0,
} as const;

const emotionalityWeights = {
  emotion_1: -2,
  emotion_2: -1,
  emotion_3: 1,
  emotion_4: 2,
} as const;

const thirdPersonWeights = {
  no: 1,
  unknown: 0,
  yes: -3,
} as const;

const currentStateWeights = {
  blocked: -3,
  friends: 2,
  ignored: -2,
  no_contact: 0,
  occasional: 1,
  post_breakup_intimacy: 3,
  practical_only: -1,
} as const;

function weightFor<T extends string>(
  value: T | undefined,
  weights: Readonly<Record<T, number>>,
) {
  return value === undefined ? 0 : weights[value];
}

function breakupReasonScore(
  reasons: QuizFlowAnswers["breakup_reasons"],
) {
  if (!reasons?.length) return 0;
  const total = reasons.reduce(
    (sum, reason) => sum + reasonWeights[reason],
    0,
  );
  return Math.max(-3, Math.min(1, total));
}

export function reconquestProbability(answers: QuizFlowAnswers) {
  const raw =
    BASE_SCORE +
    weightFor(answers.separation_time, separationWeights) +
    weightFor(answers.breakup_initiator, initiatorWeights) +
    breakupReasonScore(answers.breakup_reasons) +
    weightFor(answers.ex_emotionality, emotionalityWeights) +
    weightFor(answers.third_person, thirdPersonWeights) +
    weightFor(answers.current_state, currentStateWeights);

  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, raw));
}

export function probabilityBand(score: number): ScoreBand {
  if (!Number.isInteger(score) || score < MIN_SCORE || score > MAX_SCORE) {
    throw new RangeError("Score must be an integer between 82 and 96");
  }
  if (score <= 86) return "82_86";
  if (score <= 91) return "87_91";
  return "92_96";
}
