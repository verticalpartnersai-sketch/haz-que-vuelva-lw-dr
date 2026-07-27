import { timingSafeEqual, createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { SupabaseMemberDirectory } from "@/modules/identity/adapters/supabase-member-directory";
import { SupabasePaymentOutbox } from "@/modules/payments/adapters/supabase-payment-outbox";
import { SupabasePaymentProjector } from "@/modules/payments/adapters/supabase-payment-projector";
import { runPaymentWorker } from "@/modules/payments/application/run-payment-worker";
import { environment } from "@/server/config/environment";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

export const runtime = "nodejs";

function matches(received: string, expected: string) {
  const left = createHash("sha256").update(received).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  const config = environment();
  const supplied = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (
    !config.FEATURE_PAYMENTS ||
    !supplied ||
    !config.WORKER_INTERNAL_SECRET ||
    !matches(supplied, config.WORKER_INTERNAL_SECRET)
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
