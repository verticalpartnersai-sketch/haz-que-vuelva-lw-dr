import { createHash, timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { ResendInvitationSender } from "@/modules/notifications/adapters/resend-invitation-sender";
import { SupabaseInvitationOutbox } from "@/modules/notifications/adapters/supabase-invitation-outbox";
import { runInvitationWorker } from "@/modules/notifications/application/run-invitation-worker";
import { environment } from "@/server/config/environment";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

function matches(received: string, expected: string) {
  return timingSafeEqual(
    createHash("sha256").update(received).digest(),
    createHash("sha256").update(expected).digest(),
  );
}

export async function POST(request: Request) {
  const config = environment();
  const supplied = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (
    !config.FEATURE_AUTH ||
    !supplied ||
    !config.WORKER_INTERNAL_SECRET ||
    !matches(supplied, config.WORKER_INTERNAL_SECRET)
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
