import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { upsertExternalOffer } from "@/modules/admin/application/upsert-external-offer";
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
  active: z.boolean(),
  checkoutUrl: z.union([z.literal(""), z.url().startsWith("https://")]),
  externalPlanCode: z.string().trim().min(1).max(160),
  externalProductCode: z.string().trim().min(1).max(160),
  productCode: z.enum(PRODUCT_CODES),
});

export async function POST(request: NextRequest) {
  const config = environment();
  const unauthorized = await authorizeAdminMutation(request, config, 8192);
  if (unauthorized) return unauthorized;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  try {
    const offerId = await upsertExternalOffer({
      ...parsed.data,
      reauthenticationTokenHash:
        await adminReauthenticationHash(request),
    });
    return clearAdminReauthentication(
      NextResponse.json({ offerId }, { status: 201 }),
      request,
    );
  } catch (error) {
    if (isAdminReauthenticationRequired(error)) {
      return adminReauthenticationRequired(request);
    }
    return clearAdminReauthentication(
      NextResponse.json({ code: "offer_upsert_failed" }, { status: 500 }),
      request,
    );
  }
}
