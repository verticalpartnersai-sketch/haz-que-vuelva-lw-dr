import { NextResponse } from "next/server";

import {
  AuthenticationRequiredError,
  currentIdentity,
} from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

export async function POST() {
  if (!environment().FEATURE_VUELVE_IA) {
    return NextResponse.json({ code: "feature_unavailable" }, { status: 503 });
  }

  try {
    const identity = await currentIdentity();
    const { data, error } = await createSupabaseServiceClient().rpc(
      "start_ai_conversation",
      { p_member_id: identity.id },
    );
    if (error || typeof data !== "string") {
      return NextResponse.json({ code: "conversation_denied" }, { status: 403 });
    }
    return NextResponse.json({ conversationId: data });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ code: "authentication_required" }, { status: 401 });
    }
    throw error;
  }
}
