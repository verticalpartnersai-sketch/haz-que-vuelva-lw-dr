"use client";

import {
  quizQuestions,
  type QuizAnswers,
  type QuizOption,
} from "@/features/quiz/quiz-data";

export type QuizStage = "intro" | "question" | "lead" | "loading" | "result";

export type Lead = {
  name: string;
  email: string;
  country: "mx" | "co" | "other";
  consent: boolean;
};

type AnalyticsPayload = Record<string, boolean | number | string | undefined>;

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
  questionIndex: number,
  answers: QuizAnswers,
): QuizOption | undefined {
  const question = quizQuestions[questionIndex];
  return question.options.find(
    (option) => option.value === answers[question.id],
  );
}

export function utmParameters() {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") ?? undefined,
    utm_campaign: params.get("utm_campaign") ?? undefined,
    utm_adset: params.get("utm_adset") ?? undefined,
    utm_ad: params.get("utm_ad") ?? undefined,
  };
}
