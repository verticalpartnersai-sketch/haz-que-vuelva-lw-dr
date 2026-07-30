import "server-only";

import { z } from "zod";

const booleanString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const environmentSchema = z
  .object({
    FEATURE_AUTH: booleanString,
    FEATURE_CONTENT: booleanString,
    FEATURE_PAYMENTS: booleanString,
    FEATURE_ADMIN: booleanString,
    FEATURE_VUELVE_IA: booleanString,
    NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
    SUPABASE_SECRET_KEY: z.string().min(1).optional(),
    PERFECT_PAY_WEBHOOK_TOKEN: z.string().min(16).optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_FROM: z.string().min(3).optional(),
    MEMBER_APP_URL: z.url().optional(),
    MARKETING_APP_URL: z.url().optional(),
    AGENT_INTERNAL_URL: z.url().optional(),
    AGENT_INTERNAL_SECRET: z.string().min(32).optional(),
    WORKER_INTERNAL_SECRET: z.string().min(32).optional(),
  })
  .superRefine((environment, context) => {
    const authConfigured =
      environment.NEXT_PUBLIC_SUPABASE_URL &&
      environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (
      (environment.FEATURE_AUTH ||
        environment.FEATURE_ADMIN ||
        environment.FEATURE_CONTENT ||
        environment.FEATURE_VUELVE_IA) &&
      !authConfigured
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Auth-backed features require NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      });
    }
    if (
      (environment.FEATURE_ADMIN ||
        environment.FEATURE_CONTENT ||
        environment.FEATURE_VUELVE_IA) &&
      !environment.FEATURE_AUTH
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Admin, content and VUELVE IA require FEATURE_AUTH=true",
      });
    }
    if (
      (environment.FEATURE_CONTENT ||
        environment.FEATURE_PAYMENTS ||
        environment.FEATURE_VUELVE_IA) &&
      !environment.SUPABASE_SECRET_KEY
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Content, payments and VUELVE IA require a server-only SUPABASE_SECRET_KEY",
      });
    }
    if (
      environment.FEATURE_VUELVE_IA &&
      (!environment.AGENT_INTERNAL_URL ||
        !environment.AGENT_INTERNAL_SECRET)
    ) {
      context.addIssue({
        code: "custom",
        message:
          "VUELVE IA requires AGENT_INTERNAL_URL and AGENT_INTERNAL_SECRET",
      });
    }
    if (
      environment.FEATURE_PAYMENTS &&
      (!environment.PERFECT_PAY_WEBHOOK_TOKEN ||
        !environment.NEXT_PUBLIC_SUPABASE_URL ||
        !environment.SUPABASE_SECRET_KEY)
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Payments require PERFECT_PAY_WEBHOOK_TOKEN, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY",
      });
    }
  });

export type Environment = z.infer<typeof environmentSchema>;

let cachedEnvironment: Environment | undefined;

export function environment() {
  cachedEnvironment ??= environmentSchema.parse(process.env);
  return cachedEnvironment;
}
