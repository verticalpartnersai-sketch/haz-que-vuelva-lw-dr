"use client";

import type {
  QuizAnswers,
  QuizOption,
  QuizQuestion,
} from "@/features/quiz/quiz-contracts";

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
  question: QuizQuestion,
  answers: QuizAnswers,
): QuizOption | undefined {
  const value = answers[question.id];
  return question.options.find((option) => option.value === value);
}

export function persistQuizState(answers: QuizAnswers) {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(
    "hazquevuelva:quiz:v2",
    JSON.stringify(answers),
  );
}

export function clearQuizState() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem("hazquevuelva:quiz:v2");
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
