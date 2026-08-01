import "server-only";

import { Resend } from "resend";

import { buildPasswordRecoveryEmail } from "@/modules/notifications/application/password-recovery-email";
import type {
  PasswordRecoveryMessage,
  PasswordRecoverySender,
} from "@/modules/notifications/application/password-recovery-sender";

export class ResendPasswordRecoverySender implements PasswordRecoverySender {
  private readonly client: Resend;

  constructor(
    apiKey: string,
    private readonly from: string,
  ) {
    this.client = new Resend(apiKey);
  }

  async send(message: PasswordRecoveryMessage) {
    const email = buildPasswordRecoveryEmail(message.actionUrl);
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

    if (error) {
      throw new Error(`Password recovery delivery failed: ${error.name}`);
    }
  }
}
