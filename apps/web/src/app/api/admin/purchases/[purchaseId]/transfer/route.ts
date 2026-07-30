import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { transferPurchase } from "@/modules/admin/application/transfer-purchase";
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
  targetMemberId: z.uuid(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ purchaseId: string }> },
) {
  const config = environment();
  const unauthorized = await authorizeAdminMutation(request, config, 4096);
  if (unauthorized) return unauthorized;

  const purchaseId = z.uuid().safeParse((await context.params).purchaseId);
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!purchaseId.success || !body.success) {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  try {
    await transferPurchase({
      purchaseId: purchaseId.data,
      ...body.data,
      reauthenticationTokenHash: await adminReauthenticationHash(request),
    });
    return clearAdminReauthentication(
      NextResponse.json({ transferred: true }),
      request,
    );
  } catch (error) {
    if (isAdminReauthenticationRequired(error)) {
      return adminReauthenticationRequired(request);
    }
    return clearAdminReauthentication(
      NextResponse.json({ code: "purchase_transfer_failed" }, { status: 500 }),
      request,
    );
  }
}
