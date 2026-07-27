import type { NormalizedPaymentEvent } from "@/modules/payments/domain/payment-event";
import type {
  PaymentEventRepository,
  StoreEventResult,
} from "@/modules/payments/application/payment-event-repository";

export interface PaymentWorkQueue {
  enqueue(event: NormalizedPaymentEvent): Promise<void>;
}

type Dependencies = {
  events: PaymentEventRepository;
  queue: PaymentWorkQueue;
};

export async function processPaymentEvent(
  event: NormalizedPaymentEvent,
  dependencies: Dependencies,
): Promise<StoreEventResult> {
  const stored = await dependencies.events.store(event);
  if (event.effect === "ignore") return stored;

  await dependencies.queue.enqueue(event);

  return stored;
}
