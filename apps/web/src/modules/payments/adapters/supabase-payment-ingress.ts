import type { SupabaseClient } from "@supabase/supabase-js";

import type { NormalizedPaymentEvent } from "@/modules/payments/domain/payment-event";
import type {
  PaymentEventRepository,
  StoreEventResult,
} from "@/modules/payments/application/payment-event-repository";
import type { PaymentWorkQueue } from "@/modules/payments/application/process-payment-event";

export class SupabasePaymentIngress
  implements PaymentEventRepository, PaymentWorkQueue
{
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async store(event: NormalizedPaymentEvent): Promise<StoreEventResult> {
    const { error } = await this.client.from("incoming_events").insert({
      provider: event.provider,
      event_key: event.eventKey,
      event_type: event.status,
      payload_hash: event.payloadHash,
      sale_code: event.saleCode,
      customer_email: event.customerEmail,
      external_product_code: event.productCode,
      external_plan_code: event.planCode,
      amount_minor: event.amountMinor,
      currency: event.currency,
      payload_redacted: {
        sale_code: event.saleCode,
        product_code: event.productCode,
        plan_code: event.planCode,
        status: event.status,
      },
      occurred_at: event.occurredAt.toISOString(),
      processed_at:
        event.effect === "ignore" ? new Date().toISOString() : null,
    });

    if (!error) return "stored";
    if (error.code === "23505") return "duplicate";
    throw new Error(`Unable to persist payment event: ${error.code}`);
  }

  async enqueue(event: NormalizedPaymentEvent) {
    const { error } = await this.client.from("outbox_jobs").insert({
      job_type: "project_payment_event",
      aggregate_type: "perfect_pay_sale",
      aggregate_id: event.saleCode,
      idempotency_key: `payment/${event.eventKey}`,
      payload: {
        event_key: event.eventKey,
      },
    });

    if (error && error.code !== "23505") {
      throw new Error(`Unable to enqueue payment event: ${error.code}`);
    }
  }
}
