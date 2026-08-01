import type { ResendDeliveryEvent } from "@/modules/notifications/domain/resend-delivery-event";

export type EmailDeliveryRecord = {
  detailCode?: string;
  event: ResendDeliveryEvent;
  providerEventId: string;
  recipient: string;
};

export interface EmailDeliveryRecorder {
  record(input: EmailDeliveryRecord): Promise<boolean>;
}
