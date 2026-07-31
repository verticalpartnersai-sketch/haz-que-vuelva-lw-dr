import { NextResponse } from "next/server";

import { SupabaseMemberDirectory } from "@/modules/identity/adapters/supabase-member-directory";
import { SupabasePaymentOutbox } from "@/modules/payments/adapters/supabase-payment-outbox";
import { SupabasePaymentProjector } from "@/modules/payments/adapters/supabase-payment-projector";
import { runPaymentWorker } from "@/modules/payments/application/run-payment-worker";
import { environment } from "@/server/config/environment";
import { hasValidInternalCredential } from "@/server/security/internal-credential";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const config = environment();
  if (
    !config.FEATURE_PAYMENTS ||
    !hasValidInternalCredential(request, config.WORKER_INTERNAL_SECRET)
  ) {
    return NextResponse.json({ accepted: false }, { status: 401 });
  }
  const client = createSupabaseServiceClient();
  const outbox = new SupabasePaymentOutbox(client);
  const projector = new SupabasePaymentProjector(client);
  const members = new SupabaseMemberDirectory(client);
  const result = await runPaymentWorker({
    outbox,
    members,
    offers: projector,
    projection: projector,
  });
  return NextResponse.json(result);
}
