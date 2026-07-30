import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { publishAiPrompt } from "@/modules/admin/application/manage-ai-prompt";
import { environment } from "@/server/config/environment";
import {
  adminReauthenticationHash,
  adminReauthenticationRequired,
  clearAdminReauthentication,
  isAdminReauthenticationRequired,
} from "@/server/security/admin-reauthentication-request";
import { authorizeAdminMutation } from "@/server/security/admin-route";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ promptId: string }> },
) {
  const config = environment();
  const unauthorized = await authorizeAdminMutation(request, config, 1024);
  if (unauthorized) return unauthorized;
  const promptId = z.uuid().safeParse((await context.params).promptId);
  if (!promptId.success) {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  try {
    await publishAiPrompt(
      promptId.data,
      await adminReauthenticationHash(request),
    );
    return clearAdminReauthentication(
      NextResponse.json({ published: true }),
      request,
    );
  } catch (error) {
    if (isAdminReauthenticationRequired(error)) {
      return adminReauthenticationRequired(request);
    }
    return clearAdminReauthentication(
      NextResponse.json({ code: "prompt_publish_failed" }, { status: 500 }),
      request,
    );
  }
}
