import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createAiPromptDraft } from "@/modules/admin/application/manage-ai-prompt";
import { environment } from "@/server/config/environment";
import {
  adminReauthenticationHash,
  adminReauthenticationRequired,
  clearAdminReauthentication,
  isAdminReauthenticationRequired,
} from "@/server/security/admin-reauthentication-request";
import { authorizeAdminMutation } from "@/server/security/admin-route";

const schema = z.object({
  prompt: z.string().trim().min(80).max(40_000),
});

export async function POST(request: NextRequest) {
  const config = environment();
  const unauthorized = await authorizeAdminMutation(request, config, 50_000);
  if (unauthorized) return unauthorized;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  try {
    const promptId = await createAiPromptDraft(
      parsed.data.prompt,
      await adminReauthenticationHash(request),
    );
    return clearAdminReauthentication(
      NextResponse.json({ promptId }, { status: 201 }),
      request,
    );
  } catch (error) {
    if (isAdminReauthenticationRequired(error)) {
      return adminReauthenticationRequired(request);
    }
    return clearAdminReauthentication(
      NextResponse.json({ code: "prompt_draft_failed" }, { status: 500 }),
      request,
    );
  }
}
