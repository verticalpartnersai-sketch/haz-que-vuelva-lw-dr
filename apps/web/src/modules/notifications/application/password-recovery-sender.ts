export type PasswordRecoveryMessage = {
  actionUrl: string;
  idempotencyKey: string;
  recipient: string;
};

export interface PasswordRecoverySender {
  send(message: PasswordRecoveryMessage): Promise<void>;
}
