import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { updateProduct } from "@/modules/admin/application/update-product";
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
  description: z.string().trim().max(1200).default(""),
  name: z.string().trim().min(3).max(160),
  sortOrder: z.number().int().min(0).max(10_000),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ productCode: string }> },
) {
  const config = environment();
  const unauthorized = await authorizeAdminMutation(request, config, 8192);
  if (unauthorized) return unauthorized;
  const productCode = z.enum(PRODUCT_CODES).safeParse(
    (await context.params).productCode,
  );
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!productCode.success || !body.success) {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  try {
    await updateProduct({
      ...body.data,
      productCode: productCode.data,
      reauthenticationTokenHash:
        await adminReauthenticationHash(request),
    });
    return clearAdminReauthentication(
      NextResponse.json({ updated: true }),
      request,
    );
  } catch (error) {
    if (isAdminReauthenticationRequired(error)) {
      return adminReauthenticationRequired(request);
    }
    return clearAdminReauthentication(
      NextResponse.json({ code: "product_update_failed" }, { status: 500 }),
      request,
    );
  }
}
