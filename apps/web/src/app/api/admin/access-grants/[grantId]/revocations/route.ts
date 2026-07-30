import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { revokeAccess } from "@/modules/admin/application/revoke-access";
import { environment } from "@/server/config/environment";
import {
  adminReauthenticationHash,
  adminReauthenticationRequired,
  clearAdminReauthentication,
  isAdminReauthenticationRequired,
} from "@/server/security/admin-reauthentication-request";
import { authorizeAdminMutation } from "@/server/security/admin-route";

const schema = z.object({
  reason: z.string().trim().min(8).max(500),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ grantId: string }> },
) {
  const config = environment();
  const unauthorized = await authorizeAdminMutation(request, config, 4096);
  if (unauthorized) return unauthorized;
  const grantId = z.uuid().safeParse((await context.params).grantId);
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!grantId.success || !body.success) {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  try {
    const revocationId = await revokeAccess({
      grantId: grantId.data,
      reason: body.data.reason,
      reauthenticationTokenHash:
        await adminReauthenticationHash(request),
    });
    return clearAdminReauthentication(
      NextResponse.json({ revocationId }, { status: 201 }),
      request,
    );
  } catch (error) {
    if (isAdminReauthenticationRequired(error)) {
      return adminReauthenticationRequired(request);
    }
    return clearAdminReauthentication(
      NextResponse.json({ code: "access_revocation_failed" }, { status: 500 }),
      request,
    );
  }
}
