import { createHmac } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ResendPasswordRecoverySender } from "@/modules/notifications/adapters/resend-password-recovery-sender";
import { SupabaseEmailSuppressionStore } from "@/modules/notifications/adapters/supabase-email-suppression-store";
import { SupabasePasswordRecoveryRateLimiter } from "@/modules/notifications/adapters/supabase-password-recovery-rate-limiter";
import { requestPasswordRecovery } from "@/modules/notifications/application/request-password-recovery";
import { environment } from "@/server/config/environment";
import { readBoundedJsonBody } from "@/server/http/read-bounded-json-body";
import { isSameOriginMutation } from "@/server/security/request-origin";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 2 * 1024;
const recoverySchema = z.object({
  email: z.string().trim().email().max(254),
});

function clientFingerprint(request: Request, secret: string) {
  const address =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    "local-client";

  return createHmac("sha256", secret).update(address).digest("hex");
}

export async function POST(request: NextRequest) {
  const config = environment();
  if (!config.FEATURE_AUTH) {
    return NextResponse.json({ accepted: false }, { status: 503 });
  }
  if (!isSameOriginMutation(request, config.MEMBER_APP_URL)) {
    return NextResponse.json({ accepted: false }, { status: 403 });
  }
  if (
    !config.SUPABASE_SECRET_KEY ||
    !config.RESEND_API_KEY ||
    !config.RESEND_FROM ||
    !config.MEMBER_APP_URL ||
    !config.WORKER_INTERNAL_SECRET
  ) {
    return NextResponse.json({ accepted: false }, { status: 503 });
  }

  const body = await readBoundedJsonBody(request, MAX_BODY_BYTES);
  if (!body.ok) {
    return NextResponse.json(
      { accepted: false },
      { status: body.reason === "too_large" ? 413 : 400 },
    );
  }
  const parsed = recoverySchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }

  const client = createSupabaseServiceClient();
  try {
    await requestPasswordRecovery(
      {
        clientHash: clientFingerprint(request, config.WORKER_INTERNAL_SECRET),
        email: parsed.data.email,
      },
      {
        auth: client.auth,
        callbackUrl: `${config.MEMBER_APP_URL}/auth/confirm`,
        rateLimiter: new SupabasePasswordRecoveryRateLimiter(client),
        sender: new ResendPasswordRecoverySender(
          config.RESEND_API_KEY,
          config.RESEND_FROM,
        ),
        suppressionStore: new SupabaseEmailSuppressionStore(client),
      },
    );
  } catch (error) {
    console.error(
      "password_recovery_request_failed",
      error instanceof Error ? error.message : "unknown_error",
    );
  }

  // This response intentionally does not disclose whether the account exists.
  return NextResponse.json({ accepted: true }, { status: 202 });
}
