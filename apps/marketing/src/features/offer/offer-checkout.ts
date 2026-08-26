import { attributionParameterKeys } from "../analytics/attribution-redirect.ts";
import { QUIZ_CHECKOUT_URL } from "../quiz/quiz-checkout-config.ts";
import type { ScoreBand } from "../quiz/quiz-flow-contracts.ts";

export const offerCtaPositions = new Set([
  "guarantee",
  "offer_primary",
  "offer_repeat",
  "rating",
]);

const scoreBands = new Set<ScoreBand>(["82_86", "87_91", "92_96"]);

export function offerPerfectPayAttributionValue(
  ctaPosition: string,
  scoreBand: string,
) {
  if (!offerCtaPositions.has(ctaPosition)) return null;
  if (!scoreBands.has(scoreBand as ScoreBand)) return null;
  return `hqv2~${ctaPosition}~${scoreBand}`;
}

export function buildOfferCheckoutUrl(input: {
  attribution: Record<string, string | undefined>;
  ctaPosition: string;
  scoreBand: ScoreBand;
}) {
  const destination = new URL(QUIZ_CHECKOUT_URL);
  const reconciliation = offerPerfectPayAttributionValue(
    input.ctaPosition,
    input.scoreBand,
  );
  if (!reconciliation) throw new Error("Invalid offer checkout attribution");

  attributionParameterKeys.forEach((key) => {
    const value = input.attribution[key];
    if (value) destination.searchParams.set(key, value);
  });

  destination.searchParams.set("cta_position", input.ctaPosition);
  destination.searchParams.set("score_band", input.scoreBand);
  destination.searchParams.set("quiz_version", "hqv_quiz_v2");
  destination.searchParams.set("utm_perfect", reconciliation);
  return destination;
}
