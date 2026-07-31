import { NextResponse } from "next/server";

import { ResendInvitationSender } from "@/modules/notifications/adapters/resend-invitation-sender";
import { SupabaseInvitationOutbox } from "@/modules/notifications/adapters/supabase-invitation-outbox";
import { runInvitationWorker } from "@/modules/notifications/application/run-invitation-worker";
import { environment } from "@/server/config/environment";
import { hasValidInternalCredential } from "@/server/security/internal-credential";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

export async function POST(request: Request) {
  const config = environment();
  if (
    !config.FEATURE_AUTH ||
    !hasValidInternalCredential(request, config.WORKER_INTERNAL_SECRET)
  ) {
    return NextResponse.json({ accepted: false }, { status: 401 });
  }
  if (
    !config.SUPABASE_SECRET_KEY ||
    !config.RESEND_API_KEY ||
    !config.RESEND_FROM ||
    !config.MEMBER_APP_URL
  ) {
    return NextResponse.json({ accepted: false }, { status: 503 });
  }

  const client = createSupabaseServiceClient();
  const result = await runInvitationWorker({
    auth: client.auth,
    outbox: new SupabaseInvitationOutbox(client),
    sender: new ResendInvitationSender(config.RESEND_API_KEY, config.RESEND_FROM),
    redirectTo: `${config.MEMBER_APP_URL}/auth/confirm`,
  });
  return NextResponse.json(result);
}
