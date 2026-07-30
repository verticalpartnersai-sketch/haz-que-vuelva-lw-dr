import "server-only";

import { z } from "zod";

const booleanString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const runtimeMode = z.enum(["preview", "production"]).default("preview");

const environmentSchema = z
  .object({
    MEMBER_APP_MODE: runtimeMode,
    FEATURE_AUTH: booleanString,
    FEATURE_CONTENT: booleanString,
    FEATURE_PAYMENTS: booleanString,
    FEATURE_ADMIN: booleanString,
    FEATURE_VUELVE_IA: booleanString,
    NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: booleanString,
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
      (environment.FEATURE_ADMIN ||
        environment.FEATURE_CONTENT ||
        environment.FEATURE_PAYMENTS ||
        environment.FEATURE_VUELVE_IA) &&
      !environment.SUPABASE_SECRET_KEY
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Admin, content, payments and VUELVE IA require a server-only SUPABASE_SECRET_KEY",
      });
    }
    if (
      environment.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED &&
      (!environment.FEATURE_AUTH || !authConfigured)
    ) {
      context.addIssue({
        code: "custom",
        message: "Google OAuth requires FEATURE_AUTH and Supabase public keys",
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
    if (
      environment.MEMBER_APP_MODE === "production" &&
      (!environment.FEATURE_AUTH || !environment.FEATURE_CONTENT)
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Production mode requires FEATURE_AUTH=true and FEATURE_CONTENT=true; mock member data is forbidden",
      });
    }
  });

export type Environment = z.infer<typeof environmentSchema>;

export function supabaseBrowserConfiguration(config: Environment) {
  if (
    !config.NEXT_PUBLIC_SUPABASE_URL ||
    !config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    throw new Error("Supabase browser configuration is missing");
  }
  return {
    publishableKey: config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    url: config.NEXT_PUBLIC_SUPABASE_URL,
  };
}

export function parseEnvironment(
  input: Record<string, string | undefined>,
): Environment {
  return environmentSchema.parse(input);
}

let cachedEnvironment: Environment | undefined;

export function environment() {
  cachedEnvironment ??= parseEnvironment(process.env);
  return cachedEnvironment;
}
