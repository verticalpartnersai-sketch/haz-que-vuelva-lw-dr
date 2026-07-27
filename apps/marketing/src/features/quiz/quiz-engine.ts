import type {
  CurrentState,
  DistanceBand,
  DistanceTime,
  LastAction,
  QuestionId,
  QuizAnswers,
  QuizRoute,
} from "@/features/quiz/quiz-contracts";

const stateScore: Record<Exclude<CurrentState, "explicit_stop">, number> = {
  green_contact: 22,
  cold_contact: 43,
  intermittent: 55,
  logistics: 58,
  third_person: 67,
  blocked: 75,
};

const timeScore: Record<DistanceTime, number> = {
  lt_7d: 0,
  "1_4w": 4,
  "1_3m": 8,
  gt_3m: 12,
};

const actionScore: Record<LastAction, number> = {
  pause: 0,
  blind_silence: 3,
  long_message: 6,
  intimacy: 7,
  jealousy: 8,
  insistence: 10,
};

export function resolveRoute(answers: QuizAnswers): QuizRoute {
  switch (answers.current_state) {
    case "explicit_stop":
      return "red";
    case "logistics":
      return "logistics";
    case "third_person":
      return "third_person";
    case "blocked":
      return "gray";
    case "green_contact":
      return "green";
    case "cold_contact":
    case "intermittent":
    default:
      return "yellow";
  }
}

export function calculateDistanceIndex(answers: QuizAnswers) {
  if (answers.current_state === "explicit_stop") return 95;

  const base = stateScore[answers.current_state ?? "cold_contact"];
  const time = timeScore[answers.distance_time ?? "lt_7d"];
  const action = actionScore[answers.last_action ?? "pause"];

  return Math.min(95, base + time + action);
}

export function distanceBandFor(index: number): DistanceBand {
  if (index <= 39) return "low";
  if (index <= 69) return "medium";
  return "high";
}

export function distanceBandLabel(
  band: DistanceBand,
  locale: "en" | "es" | "pt",
) {
  const labels = {
    en: { low: "LOW", medium: "MEDIUM", high: "HIGH" },
    es: { low: "BAJA", medium: "MEDIA", high: "ALTA" },
    pt: { low: "BAIXA", medium: "MÉDIA", high: "ALTA" },
  } as const;

  return labels[locale][band];
}

export function resolvedLastAction(answers: QuizAnswers): LastAction {
  return answers.last_action ?? "pause";
}

export function answerForQuestion(
  answers: QuizAnswers,
  questionId: QuestionId,
) {
  return answers[questionId];
}

export function channelStateForRoute(route: QuizRoute) {
  const states: Record<QuizRoute, string> = {
    red: "safety",
    gray: "closed",
    yellow: "fragile",
    green: "open",
    logistics: "functional",
    third_person: "third_person",
  };

  return states[route];
}

export function routeSoFar(answers: QuizAnswers) {
  return resolveRoute(answers);
}

export function isReconquista30Eligible(answers: QuizAnswers) {
  return resolveRoute(answers) === "green";
}
