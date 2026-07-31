import { createHash, timingSafeEqual } from "node:crypto";

import {
  paymentEffectForStatus,
  type NormalizedPaymentEvent,
} from "../domain/payment-event.ts";
import type { PerfectPayPayload } from "./perfect-pay-schema";

const statusByEnum: Record<number, string> = {
  0: "none",
  1: "pending",
  2: "approved",
  3: "in_process",
  4: "in_mediation",
  5: "rejected",
  6: "cancelled",
  7: "refunded",
  8: "authorized",
  9: "charged_back",
  10: "completed",
  11: "checkout_error",
  12: "precheckout",
  13: "expired",
  16: "in_review",
};

const currencyByEnum: Record<number, string> = {
  1: "BRL",
  2: "USD",
  3: "EUR",
};

export function secureTokenMatches(received: string, expected: string) {
  const receivedDigest = createHash("sha256").update(received).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();
  return timingSafeEqual(receivedDigest, expectedDigest);
}

function parsePerfectPayDate(value: string) {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.valueOf())) throw new Error("Invalid Perfect Pay date");
  return parsed;
}

function normalizePerfectPayLine(
  payload: PerfectPayPayload,
  planCode: string,
): NormalizedPaymentEvent {
  const status = statusByEnum[payload.sale_status_enum] ?? "unknown";
  const currency = currencyByEnum[payload.currency_enum] ?? "UNK";
  const amountMinor = Math.round(payload.sale_amount * 100);
  const canonical = JSON.stringify({
    amountMinor,
    currency,
    customerEmail: payload.customer.email.toLowerCase(),
    planCode,
    productCode: payload.product.code,
    saleCode: payload.code,
    status,
  });
  const payloadHash = createHash("sha256").update(canonical).digest("hex");

  return {
    provider: "perfect_pay",
    eventKey: `${payload.code}:${status}:${payloadHash.slice(0, 16)}`,
    saleCode: payload.code,
    status,
    effect: paymentEffectForStatus(status),
    customerEmail: payload.customer.email.toLowerCase(),
    productCode: payload.product.code,
    planCode,
    amountMinor,
    currency,
    occurredAt: parsePerfectPayDate(
      payload.date_approved ?? payload.date_created,
    ),
    payloadHash,
  };
}

export function normalizePerfectPayPayload(
  payload: PerfectPayPayload,
): NormalizedPaymentEvent {
  return normalizePerfectPayLine(payload, payload.plan.code);
}

export function normalizePerfectPayPayloads(
  payload: PerfectPayPayload,
): NormalizedPaymentEvent[] {
  const events = [normalizePerfectPayPayload(payload)];
  const seenItemCodes = new Set<string>();

  for (const item of payload.plan_itens) {
    if (seenItemCodes.has(item.item_code)) continue;
    seenItemCodes.add(item.item_code);
    events.push(normalizePerfectPayLine(payload, `item:${item.item_code}`));
  }

  return events;
}
