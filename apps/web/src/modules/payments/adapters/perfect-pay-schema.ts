import { z } from "zod";

const nullableText = z.string().nullable().optional();

export const perfectPayPayloadSchema = z.object({
  token: z.string().min(1).max(256),
  code: z.string().min(1).max(255),
  sale_amount: z.coerce.number().nonnegative().finite(),
  currency_enum: z.coerce.number().int(),
  sale_status_enum: z.coerce.number().int(),
  sale_status_detail: nullableText,
  date_created: z.string().min(1).max(64),
  date_approved: nullableText,
  product: z.object({
    code: z.string().min(1).max(255),
    name: z.string().max(255).optional(),
    external_reference: nullableText,
  }),
  plan: z.object({
    code: z.string().min(1).max(255),
    name: z.string().max(255).optional(),
    quantity: z.coerce.number().int().positive().optional(),
  }),
  plan_itens: z
    .array(
      z.object({
        code: z.string().min(1).max(255).optional(),
        item_code: z.string().min(1).max(255),
        name: z.string().min(1).max(255).optional(),
        price: z.coerce.number().nonnegative().finite().optional(),
        quantity: z.coerce.number().int().positive().optional(),
      }),
    )
    .default([]),
  customer: z.object({
    email: z.email(),
  }),
});

export type PerfectPayPayload = z.infer<typeof perfectPayPayloadSchema>;
