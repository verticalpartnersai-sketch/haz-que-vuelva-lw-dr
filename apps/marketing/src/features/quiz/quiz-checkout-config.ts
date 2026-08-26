import { attributionParameterKeys } from "../analytics/attribution-redirect.ts";
import type { QuizRoute } from "@/features/quiz/quiz-contracts";

export const QUIZ_CHECKOUT_URL =
  "https://go.centerpag.com/PPU38CQER3J?upsell=true&lang=es";

const checkoutCtaPositions = new Set([
  "hero",
  "timeline",
  "value_stack",
  "offer",
  "after_faq",
  "sticky_offer",
  "sticky_education",
]);

export function perfectPayAttributionValue(
  ctaPosition: string,
  route: QuizRoute,
) {
  if (!checkoutCtaPositions.has(ctaPosition)) return null;
  return `hqv~${ctaPosition}~${route}`;
}

export function buildQuizCheckoutUrl(input: {
  attribution: Record<string, string | undefined>;
  channelState: string;
  ctaPosition: string;
  distanceBand: string;
  route: QuizRoute;
}) {
  const destination = new URL(QUIZ_CHECKOUT_URL);
  const reconciliation = perfectPayAttributionValue(
    input.ctaPosition,
    input.route,
  );
  attributionParameterKeys.forEach((key) => {
    const value = input.attribution[key];
    if (value) destination.searchParams.set(key, value);
  });

  const reconciliationParameters = {
    route: input.route,
    channel_state: input.channelState,
    distance_band: input.distanceBand,
    cta_position: input.ctaPosition,
    utm_perfect: reconciliation ?? undefined,
  };

  Object.entries(reconciliationParameters).forEach(([key, value]) => {
    if (value) destination.searchParams.set(key, value);
  });
  return destination;
}
