import { z } from "zod";

export const RESEND_DELIVERY_EVENT_TYPES = [
  "email.delivered",
  "email.delivery_delayed",
  "email.bounced",
  "email.complained",
  "email.failed",
  "email.suppressed",
] as const;

const detailSchema = z.object({
  message: z.string().optional(),
  reason: z.string().optional(),
  subType: z.string().optional(),
  type: z.string().optional(),
});

export const resendDeliveryEventSchema = z.object({
  type: z.enum(RESEND_DELIVERY_EVENT_TYPES),
  created_at: z.iso.datetime({ offset: true }),
  data: z.object({
    email_id: z.string().trim().min(1).max(200),
    to: z.array(z.email().max(254)).min(1).max(10),
    bounce: detailSchema.optional(),
    failed: detailSchema.optional(),
    suppressed: detailSchema.optional(),
  }),
});

export type ResendDeliveryEvent = z.infer<typeof resendDeliveryEventSchema>;

export function resendEventDetail(event: ResendDeliveryEvent) {
  const detail = event.data.bounce ?? event.data.failed ?? event.data.suppressed;
  return detail?.subType ?? detail?.type ?? detail?.reason ?? detail?.message;
}
