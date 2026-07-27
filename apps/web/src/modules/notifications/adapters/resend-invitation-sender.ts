import "server-only";

import { Resend } from "resend";

import type {
  InvitationMessage,
  InvitationSender,
} from "@/modules/notifications/application/invitation-sender";

export class ResendInvitationSender implements InvitationSender {
  private readonly client: Resend;

  constructor(
    apiKey: string,
    private readonly from: string,
  ) {
    this.client = new Resend(apiKey);
  }

  async send(message: InvitationMessage) {
    const { error } = await this.client.emails.send(
      {
        from: this.from,
        to: message.recipient,
        subject: "Configura tu acceso a Haz Que Vuelva",
        text: [
          "Tu compra fue aprobada.",
          "Usa este enlace único para verificar tu correo y crear tu contraseña:",
          message.actionUrl,
          "Si no reconoces esta compra, contacta al soporte.",
        ].join("\n\n"),
      },
      { idempotencyKey: message.idempotencyKey },
    );
    if (error) throw new Error(`Invitation delivery failed: ${error.name}`);
  }
}
