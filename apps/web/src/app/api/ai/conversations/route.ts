import { NextResponse } from "next/server";

import {
  AuthenticationRequiredError,
  currentIdentity,
} from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";

export async function GET() {
  if (!environment().FEATURE_VUELVE_IA) {
    return NextResponse.json({ code: "feature_unavailable" }, { status: 503 });
  }

  try {
    const identity = await currentIdentity();
    const client = createSupabaseServiceClient();
    const { data: memberCase, error: caseError } = await client
      .from("ai_cases")
      .select("id")
      .eq("member_id", identity.id)
      .maybeSingle();
    if (caseError) throw caseError;
    if (!memberCase) {
      return NextResponse.json(
        { conversationId: null, messages: [] },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const { data: conversation, error: conversationError } = await client
      .from("ai_conversations")
      .select("id")
      .eq("case_id", memberCase.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (conversationError) throw conversationError;
    if (!conversation) {
      return NextResponse.json(
        { conversationId: null, messages: [] },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const { data: messages, error: messagesError } = await client.rpc(
      "recent_ai_messages",
      {
        p_member_id: identity.id,
        p_conversation_id: conversation.id,
        p_limit: 20,
      },
    );
    if (messagesError) throw messagesError;

    return NextResponse.json(
      {
        conversationId: conversation.id,
        messages: (messages ?? []).map((message: {
          content: string;
          created_at: string;
          role: "assistant" | "member";
        }, index: number) => ({
          content: message.content,
          id: `history-${message.created_at}-${index}`,
          role: message.role === "member" ? "user" : "assistant",
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ code: "authentication_required" }, { status: 401 });
    }
    return NextResponse.json({ code: "conversation_unavailable" }, { status: 503 });
  }
}

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
