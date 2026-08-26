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

export type PaymentEffect = "grant" | "revoke" | "observe" | "ignore";

export type CheckoutAttribution = {
  ctaPosition:
    | "hero"
    | "timeline"
    | "value_stack"
    | "offer"
    | "after_faq"
    | "sticky_offer"
    | "sticky_education";
  route:
    | "gray"
    | "red"
    | "yellow"
    | "green"
    | "logistics"
    | "third_person";
};

export function paymentEffectForStatus(status: string): PaymentEffect {
  if (status === "precheckout") return "observe";
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
  checkoutAttribution?: CheckoutAttribution;
};
