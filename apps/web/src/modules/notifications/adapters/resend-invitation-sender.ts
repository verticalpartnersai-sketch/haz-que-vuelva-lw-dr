import "server-only";

import { Resend } from "resend";

import type {
  InvitationMessage,
  InvitationSender,
} from "@/modules/notifications/application/invitation-sender";
import { buildInvitationEmail } from "@/modules/notifications/application/invitation-email";

export class ResendInvitationSender implements InvitationSender {
  private readonly client: Resend;

  constructor(
    apiKey: string,
    private readonly from: string,
  ) {
    this.client = new Resend(apiKey);
  }

  async send(message: InvitationMessage) {
    const email = buildInvitationEmail(message.actionUrl);
    const { error } = await this.client.emails.send(
      {
        from: this.from,
        to: message.recipient,
        subject: email.subject,
        html: email.html,
        text: email.text,
      },
      { idempotencyKey: message.idempotencyKey },
    );
    if (error) throw new Error(`Invitation delivery failed: ${error.name}`);
  }
}
