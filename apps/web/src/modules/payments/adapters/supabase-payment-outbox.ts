import type { SupabaseClient } from "@supabase/supabase-js";

import {
  paymentEffectForStatus,
  type NormalizedPaymentEvent,
} from "@/modules/payments/domain/payment-event";

type OutboxRow = {
  id: string;
  payload: { event_key?: string };
  attempts: number;
};

export class SupabasePaymentOutbox {
  constructor(private readonly client: SupabaseClient) {}

  async claim(limit = 10): Promise<OutboxRow[]> {
    const { data, error } = await this.client.rpc("claim_outbox_jobs", {
      p_job_type: "project_payment_event",
      p_limit: limit,
    });
    if (error) throw new Error(`Outbox claim failed: ${error.code}`);
    return (data ?? []) as OutboxRow[];
  }

  async event(eventKey: string): Promise<NormalizedPaymentEvent> {
    const { data, error } = await this.client
      .from("incoming_events")
      .select(
        "event_key,event_type,payload_hash,sale_code,customer_email,external_product_code,external_plan_code,amount_minor,currency,occurred_at",
      )
      .eq("provider", "perfect_pay")
      .eq("event_key", eventKey)
      .single();
    if (error || !data) throw new Error("Payment event unavailable");

    return {
      provider: "perfect_pay",
      eventKey: data.event_key,
      saleCode: data.sale_code,
      status: data.event_type,
      effect: paymentEffectForStatus(data.event_type),
      customerEmail: data.customer_email,
      productCode: data.external_product_code,
      planCode: data.external_plan_code,
      amountMinor: data.amount_minor,
      currency: data.currency,
      occurredAt: new Date(data.occurred_at),
      payloadHash: data.payload_hash,
    };
  }

  async complete(jobId: string) {
    const { error } = await this.client
      .from("outbox_jobs")
      .update({ completed_at: new Date().toISOString(), locked_at: null })
      .eq("id", jobId);
    if (error) throw new Error(`Outbox completion failed: ${error.code}`);
  }

  async retry(job: OutboxRow, errorCode: string) {
    const terminal = job.attempts >= 8;
    const delayMinutes = Math.min(2 ** job.attempts, 360);
    const { error } = await this.client
      .from("outbox_jobs")
      .update({
        locked_at: null,
        last_error: errorCode.slice(0, 160),
        available_at: new Date(Date.now() + delayMinutes * 60_000).toISOString(),
        failed_at: terminal ? new Date().toISOString() : null,
      })
      .eq("id", job.id);
    if (error) throw new Error(`Outbox retry failed: ${error.code}`);
  }
}
