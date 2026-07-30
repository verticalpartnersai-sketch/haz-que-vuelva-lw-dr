import type { ProductCode } from "@/modules/catalog/domain/product";
import { requireAdmin } from "@/modules/identity/application/current-identity";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

import { requireReauthenticationTokenHash } from "./reauthenticated-operation";

export async function grantManualAccess(input: {
  memberId: string;
  productCode: ProductCode;
  reason: string;
  reauthenticationTokenHash: string;
}) {
  await requireAdmin();
  if (input.reason.trim().length < 8) {
    throw new Error("A reason with at least 8 characters is required");
  }

  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc(
    "grant_manual_access_with_reauthentication",
    {
      p_member_id: input.memberId,
      p_product_code: input.productCode,
      p_reason: input.reason.trim(),
      p_reauth_token_hash: requireReauthenticationTokenHash(
        input.reauthenticationTokenHash,
      ),
    },
  );
  if (error) throw new Error(`Manual grant failed: ${error.code}`);
  return data as string;
}
