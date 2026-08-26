import { attributionParameterKeys } from "../analytics/attribution-redirect.ts";
import { orderedQuizFlowStages } from "./quiz-flow-contracts.ts";

export function nextStageIndex(currentIndex: number) {
  return Math.min(currentIndex + 1, orderedQuizFlowStages.length - 1);
}

export function buildOfferHandoffPath(
  attribution: Record<string, string | undefined>,
) {
  const approved = new URLSearchParams();
  attributionParameterKeys.forEach((key) => {
    const value = attribution[key];
    if (value) approved.set(key, value);
  });
  const query = approved.toString();
  return query ? `/off?${query}` : "/off";
}

export function canContinueMultiple(values: readonly string[]) {
  return values.length > 0;
}

export function toggleMultipleAnswer(
  current: readonly string[],
  value: string,
) {
  return current.includes(value)
    ? current.filter((candidate) => candidate !== value)
    : [...current, value];
}
