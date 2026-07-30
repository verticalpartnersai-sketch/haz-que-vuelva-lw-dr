import type { ProductCode } from "@/modules/catalog/domain/product";
import { requireAdmin } from "@/modules/identity/application/current-identity";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

import {
  requireReauthenticationTokenHash,
  throwIfAdminReauthenticationError,
} from "./reauthenticated-operation";

export async function upsertExternalOffer(input: {
  active: boolean;
  checkoutUrl: string;
  externalPlanCode: string;
  externalProductCode: string;
  productCode: ProductCode;
  reauthenticationTokenHash: string;
}) {
  await requireAdmin();
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc(
    "upsert_external_offer_with_reauthentication",
    {
      p_active: input.active,
      p_checkout_url: input.checkoutUrl.trim(),
      p_external_plan_code: input.externalPlanCode.trim(),
      p_external_product_code: input.externalProductCode.trim(),
      p_product_code: input.productCode,
      p_reauth_token_hash: requireReauthenticationTokenHash(
        input.reauthenticationTokenHash,
      ),
    },
  );
  throwIfAdminReauthenticationError(error);
  if (error) throw new Error(`External offer upsert failed: ${error.code}`);
  return data as string;
}
