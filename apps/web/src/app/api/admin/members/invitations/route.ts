import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { SupabaseAdminMemberInvitations } from "@/modules/identity/adapters/supabase-admin-member-invitations";
import { inviteMember } from "@/modules/identity/application/invite-member";
import { environment } from "@/server/config/environment";
import {
  adminReauthenticationHash,
  adminReauthenticationRequired,
  clearAdminReauthentication,
  isAdminReauthenticationRequired,
} from "@/server/security/admin-reauthentication-request";
import { authorizeAdminMutation } from "@/server/security/admin-route";
import { createSupabaseServiceClient } from "@/server/supabase/service-client";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

const schema = z.object({
  displayName: z.string().trim().max(120).default(""),
  email: z.email().max(254),
  requestId: z.uuid(),
});

export async function POST(request: NextRequest) {
  const config = environment();
  const unauthorized = await authorizeAdminMutation(request, config, 4096);
  if (unauthorized) return unauthorized;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  try {
    const reauthenticationTokenHash =
      await adminReauthenticationHash(request);
    const result = await inviteMember(
      { ...parsed.data, reauthenticationTokenHash },
      new SupabaseAdminMemberInvitations(
        await createSupabaseServerClient(),
        createSupabaseServiceClient(),
      ),
    );
    return clearAdminReauthentication(
      NextResponse.json(result, { status: result.created ? 201 : 202 }),
      request,
    );
  } catch (error) {
    if (isAdminReauthenticationRequired(error)) {
      return adminReauthenticationRequired(request);
    }
    return clearAdminReauthentication(
      NextResponse.json(
        { code: "member_invitation_failed" },
        { status: 500 },
      ),
      request,
    );
  }
}
