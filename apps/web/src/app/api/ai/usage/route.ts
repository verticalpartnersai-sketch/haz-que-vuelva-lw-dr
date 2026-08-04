import { NextResponse } from "next/server";

import {
  AuthenticationRequiredError,
  currentIdentity,
} from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";
import { memberAiProducts } from "@/server/ai/member-ai-access";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

export async function GET() {
  if (!environment().FEATURE_VUELVE_IA) {
    return NextResponse.json({ code: "feature_unavailable" }, { status: 503 });
  }
  try {
    const identity = await currentIdentity();
    const access = await memberAiProducts(identity.id);
    if (!access.hadAi) {
      return NextResponse.json({ code: "access_denied" }, { status: 403 });
    }
    const { data, error } = await createSupabaseServiceClient().rpc(
      "get_ai_usage_status",
      { p_member_id: identity.id, p_daily_limit: 10 },
    );
    if (error || !data) {
      return NextResponse.json({ code: "usage_unavailable" }, { status: 503 });
    }
    const visibleUsage = environment().FEATURE_AI_DIAGNOSTICS
      ? data
      : { ...data, diagnostic_available: false, diagnostic_next_at: null };
    return NextResponse.json(visibleUsage, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ code: "authentication_required" }, { status: 401 });
    }
    throw error;
  }
}
