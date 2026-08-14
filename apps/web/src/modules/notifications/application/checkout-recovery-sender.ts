export type CheckoutRecoveryMessage = {
  checkoutUrl: string;
  idempotencyKey: string;
  recipient: string;
  step: number;
  unsubscribeUrl: string;
};

export interface CheckoutRecoverySender {
  send(message: CheckoutRecoveryMessage): Promise<string>;
}
