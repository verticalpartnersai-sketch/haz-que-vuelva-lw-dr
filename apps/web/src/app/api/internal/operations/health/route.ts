import { NextResponse } from "next/server";

import { SupabaseOperationalHealth } from "@/modules/audit/adapters/supabase-operational-health";
import { evaluateOperationalHealth } from "@/modules/audit/domain/operational-health";
import { environment } from "@/server/config/environment";
import { hasValidInternalCredential } from "@/server/security/internal-credential";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const config = environment();
  if (
    !hasValidInternalCredential(request, config.WORKER_INTERNAL_SECRET) ||
    !config.SUPABASE_SECRET_KEY
  ) {
    return NextResponse.json({ accepted: false }, { status: 401 });
  }

  const snapshot = await new SupabaseOperationalHealth(
    createSupabaseServiceClient(),
  ).snapshot();
  const evaluation = evaluateOperationalHealth(snapshot);
  return NextResponse.json(evaluation, {
    headers: { "Cache-Control": "no-store" },
    status: evaluation.healthy ? 200 : 503,
  });
}
