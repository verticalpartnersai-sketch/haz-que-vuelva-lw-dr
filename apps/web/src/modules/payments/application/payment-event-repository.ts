import type { NormalizedPaymentEvent } from "@/modules/payments/domain/payment-event";

export type StoreEventResult = "stored" | "duplicate";

export interface PaymentEventRepository {
  store(event: NormalizedPaymentEvent): Promise<StoreEventResult>;
}
