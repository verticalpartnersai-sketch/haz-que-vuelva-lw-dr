import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { grantManualAccess } from "@/modules/admin/application/grant-manual-access";
import { PRODUCT_CODES } from "@/modules/catalog/domain/product";
import { environment } from "@/server/config/environment";
import {
  adminReauthenticationHash,
  adminReauthenticationRequired,
  clearAdminReauthentication,
  isAdminReauthenticationRequired,
} from "@/server/security/admin-reauthentication-request";
import { authorizeAdminMutation } from "@/server/security/admin-route";

const schema = z.object({
  memberId: z.uuid(),
  productCode: z.enum(PRODUCT_CODES),
  reason: z.string().trim().min(8).max(500),
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
    const grantId = await grantManualAccess({
      ...parsed.data,
      reauthenticationTokenHash:
        await adminReauthenticationHash(request),
    });
    return clearAdminReauthentication(
      NextResponse.json({ grantId }, { status: 201 }),
      request,
    );
  } catch (error) {
    if (isAdminReauthenticationRequired(error)) {
      return adminReauthenticationRequired(request);
    }
    return clearAdminReauthentication(
      NextResponse.json({ code: "access_grant_failed" }, { status: 500 }),
      request,
    );
  }
}
