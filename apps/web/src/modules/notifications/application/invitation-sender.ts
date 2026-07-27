export type InvitationMessage = {
  recipient: string;
  actionUrl: string;
  idempotencyKey: string;
};

export interface InvitationSender {
  send(message: InvitationMessage): Promise<void>;
}
