import "server-only";

import { Resend, type WebhookEventPayload } from "resend";

export type ResendWebhookHeaders = {
  id: string;
  signature: string;
  timestamp: string;
};

export class ResendWebhookVerifier {
  private readonly resend = new Resend();

  constructor(private readonly webhookSecret: string) {}

  verify(payload: string, headers: ResendWebhookHeaders): WebhookEventPayload {
    return this.resend.webhooks.verify({
      headers,
      payload,
      webhookSecret: this.webhookSecret,
    });
  }
}
