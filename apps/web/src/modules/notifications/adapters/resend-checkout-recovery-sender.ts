import { Resend } from "resend";

import { buildCheckoutRecoveryEmail } from "../application/checkout-recovery-email.ts";
import type {
  CheckoutRecoveryMessage,
  CheckoutRecoverySender,
} from "../application/checkout-recovery-sender.ts";

type ResendLike = {
  emails: {
    send(
      payload: Record<string, unknown>,
      options: { idempotencyKey: string },
    ): Promise<{
      data: { id: string } | null;
      error: { name: string } | null;
    }>;
  };
};

export class ResendCheckoutRecoverySender implements CheckoutRecoverySender {
  private readonly client: ResendLike;
  private readonly from: string;

  constructor(credential: string, from: string, client?: ResendLike) {
    this.client = client ?? (new Resend(credential) as unknown as ResendLike);
    this.from = from;
  }

  async send(message: CheckoutRecoveryMessage) {
    const email = buildCheckoutRecoveryEmail(message);
    const { data, error } = await this.client.emails.send(
      {
        from: this.from,
        headers: {
          "List-Unsubscribe": `<${message.unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        html: email.html,
        subject: email.subject,
        text: email.text,
        to: message.recipient,
      },
      { idempotencyKey: message.idempotencyKey },
    );
    if (error || !data?.id) {
      throw new Error(
        `Checkout recovery delivery failed: ${error?.name ?? "missing_message_id"}`,
      );
    }
    return data.id;
  }
}
