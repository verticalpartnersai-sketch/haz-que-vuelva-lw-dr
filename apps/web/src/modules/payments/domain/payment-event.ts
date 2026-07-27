export const PERFECT_PAY_GRANT_STATUSES = [
  "approved",
  "authorized",
  "completed",
] as const;

export const PERFECT_PAY_REVOKE_STATUSES = [
  "cancelled",
  "refunded",
  "charged_back",
] as const;

export type PaymentEffect = "grant" | "revoke" | "ignore";

export function paymentEffectForStatus(status: string): PaymentEffect {
  if (PERFECT_PAY_GRANT_STATUSES.some((candidate) => candidate === status)) {
    return "grant";
  }
  if (PERFECT_PAY_REVOKE_STATUSES.some((candidate) => candidate === status)) {
    return "revoke";
  }
  return "ignore";
}

export type NormalizedPaymentEvent = {
  provider: "perfect_pay";
  eventKey: string;
  saleCode: string;
  status: string;
  effect: PaymentEffect;
  customerEmail: string;
  productCode: string;
  planCode: string;
  amountMinor: number;
  currency: string;
  occurredAt: Date;
  payloadHash: string;
};
