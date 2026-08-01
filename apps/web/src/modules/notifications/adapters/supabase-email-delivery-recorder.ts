import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  EmailDeliveryRecord,
  EmailDeliveryRecorder,
} from "@/modules/notifications/application/email-delivery-recorder";

export class SupabaseEmailDeliveryRecorder implements EmailDeliveryRecorder {
  constructor(private readonly client: SupabaseClient) {}

  async record(input: EmailDeliveryRecord) {
    const { data, error } = await this.client.rpc("record_resend_email_event", {
      p_detail_code: input.detailCode ?? null,
      p_event_type: input.event.type,
      p_occurred_at: input.event.created_at,
      p_provider_event_id: input.providerEventId,
      p_provider_message_id: input.event.data.email_id,
      p_recipient_email: input.recipient,
    });
    if (error) throw new Error(`Resend event persistence failed: ${error.code}`);
    return data === true;
  }
}
