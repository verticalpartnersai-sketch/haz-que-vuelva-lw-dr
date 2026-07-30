"use client";

import type {
  QuizAnswers,
  QuizOption,
  QuizQuestion,
  QuizStage,
} from "@/features/quiz/quiz-contracts";
import type { Locale } from "@/features/i18n/locale";

type AnalyticsPayload = Record<string, boolean | number | string | undefined>;
const legacyQuizStateKey = "hazquevuelva:quiz:v2";
const quizSessionStateKey = "hazquevuelva:quiz:v3";

const quizStages: readonly QuizStage[] = [
  "intro",
  "question",
  "loader-one",
  "prediagnosis",
  "desire",
  "demonstration",
  "commitment",
  "loader-two",
  "result",
];

export type QuizSessionState = {
  answers: QuizAnswers;
  audioMuted: boolean;
  audioStarted: boolean;
  locale: Locale;
  questionIndex: number;
  stage: QuizStage;
};

export type RestoredQuizSessionState = {
  answers: QuizAnswers;
  audioMuted?: boolean;
  audioStarted?: boolean;
  locale?: Locale;
  questionIndex?: number;
  stage?: QuizStage;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function track(event: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;

  window.dataLayer?.push({ event, ...payload });
  window.dispatchEvent(
    new CustomEvent("hazquevuelva:analytics", {
      detail: { event, ...payload },
    }),
  );
}

export function selectedOption(
  question: QuizQuestion,
  answers: QuizAnswers,
): QuizOption | undefined {
  const value = answers[question.id];
  return question.options.find((option) => option.value === value);
}

export function persistQuizState(answers: QuizAnswers) {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(legacyQuizStateKey, JSON.stringify(answers));
}

export function persistQuizSessionState(state: QuizSessionState) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(quizSessionStateKey, JSON.stringify(state));
}

export function restoreQuizSessionState(): RestoredQuizSessionState | null {
  if (typeof window === "undefined") return null;

  try {
    const serialized = window.sessionStorage.getItem(quizSessionStateKey);
    if (serialized) {
      const parsed = JSON.parse(serialized) as Record<string, unknown>;
      const locale =
        parsed.locale === "es" ||
        parsed.locale === "pt" ||
        parsed.locale === "en"
          ? parsed.locale
          : undefined;
      const stage =
        typeof parsed.stage === "string" &&
        quizStages.includes(parsed.stage as QuizStage)
          ? (parsed.stage as QuizStage)
          : undefined;

      return {
        answers:
          parsed.answers &&
          typeof parsed.answers === "object" &&
          !Array.isArray(parsed.answers)
            ? (parsed.answers as QuizAnswers)
            : {},
        audioMuted:
          typeof parsed.audioMuted === "boolean"
            ? parsed.audioMuted
            : undefined,
        audioStarted:
          typeof parsed.audioStarted === "boolean"
            ? parsed.audioStarted
            : undefined,
        locale,
        questionIndex:
          typeof parsed.questionIndex === "number" &&
          Number.isFinite(parsed.questionIndex)
            ? Math.max(0, Math.floor(parsed.questionIndex))
            : undefined,
        stage,
      };
    }

    const legacyAnswers = window.sessionStorage.getItem(legacyQuizStateKey);
    if (!legacyAnswers) return null;
    const parsedLegacy = JSON.parse(legacyAnswers) as unknown;
    if (
      !parsedLegacy ||
      typeof parsedLegacy !== "object" ||
      Array.isArray(parsedLegacy)
    ) {
      return null;
    }

    return { answers: parsedLegacy as QuizAnswers };
  } catch {
    return null;
  }
}

export function clearQuizState() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(legacyQuizStateKey);
  window.sessionStorage.removeItem(quizSessionStateKey);
}

export function utmParameters() {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  return {
    creative_id: params.get("creative_id") ?? undefined,
    campaign_id: params.get("campaign_id") ?? undefined,
    utm_source: params.get("utm_source") ?? undefined,
    utm_campaign: params.get("utm_campaign") ?? undefined,
    utm_medium: params.get("utm_medium") ?? undefined,
    utm_content: params.get("utm_content") ?? undefined,
    utm_term: params.get("utm_term") ?? undefined,
    utm_adset: params.get("utm_adset") ?? undefined,
    utm_ad: params.get("utm_ad") ?? undefined,
  };
}
