import { NextResponse } from "next/server";

import { ResendCheckoutRecoverySender } from "@/modules/notifications/adapters/resend-checkout-recovery-sender";
import { SupabaseCheckoutRecoveryOutbox } from "@/modules/notifications/adapters/supabase-checkout-recovery-outbox";
import { runCheckoutRecoveryWorker } from "@/modules/notifications/application/run-checkout-recovery-worker";
import { environment } from "@/server/config/environment";
import { hasValidInternalCredential } from "@/server/security/internal-credential";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const config = environment();
  if (
    !config.FEATURE_CHECKOUT_RECOVERY ||
    !hasValidInternalCredential(request, config.WORKER_INTERNAL_SECRET)
  ) {
    return NextResponse.json({ accepted: false }, { status: 401 });
  }
  if (
    !config.SUPABASE_SECRET_KEY ||
    !config.RESEND_API_KEY ||
    !config.RESEND_FROM ||
    !config.MEMBER_APP_URL ||
    !config.CHECKOUT_RECOVERY_CHECKOUT_URL
  ) {
    return NextResponse.json({ accepted: false }, { status: 503 });
  }

  const client = createSupabaseServiceClient();
  const result = await runCheckoutRecoveryWorker({
    checkoutBaseUrl: config.CHECKOUT_RECOVERY_CHECKOUT_URL,
    memberAppUrl: config.MEMBER_APP_URL,
    outbox: new SupabaseCheckoutRecoveryOutbox(client),
    sender: new ResendCheckoutRecoverySender(
      config.RESEND_API_KEY,
      config.RESEND_FROM,
    ),
  });

  return NextResponse.json(result);
}
