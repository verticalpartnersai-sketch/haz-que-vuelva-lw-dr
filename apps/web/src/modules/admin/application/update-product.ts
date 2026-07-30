import type { ProductCode } from "@/modules/catalog/domain/product";
import { requireAdmin } from "@/modules/identity/application/current-identity";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

import {
  requireReauthenticationTokenHash,
  throwIfAdminReauthenticationError,
} from "./reauthenticated-operation";

export async function updateProduct(input: {
  active: boolean;
  description: string;
  name: string;
  productCode: ProductCode;
  reauthenticationTokenHash: string;
  sortOrder: number;
}) {
  await requireAdmin();
  const client = await createSupabaseServerClient();
  const { error } = await client.rpc(
    "update_product_with_reauthentication",
    {
      p_active: input.active,
      p_description: input.description.trim(),
      p_name: input.name.trim(),
      p_product_code: input.productCode,
      p_reauth_token_hash: requireReauthenticationTokenHash(
        input.reauthenticationTokenHash,
      ),
      p_sort_order: input.sortOrder,
    },
  );
  throwIfAdminReauthenticationError(error);
  if (error) throw new Error(`Product update failed: ${error.code}`);
}
