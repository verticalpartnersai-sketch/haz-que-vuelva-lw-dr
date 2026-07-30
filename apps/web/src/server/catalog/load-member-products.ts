import "server-only";

import { presentMemberCatalog } from "@/features/products/product-presenter";
import { products as mockProducts } from "@/mocks/data";
import { SupabaseMemberCatalog } from "@/modules/catalog/adapters/supabase-member-catalog";
import { listMemberCatalog } from "@/modules/catalog/application/list-member-catalog";
import { currentIdentity } from "@/modules/identity/application/current-identity";
import { environment } from "@/server/config/environment";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

export async function loadMemberProducts() {
  if (!environment().FEATURE_CONTENT) {
    return {
      products: mockProducts,
      simulated: true,
    };
  }

  const [identity, client] = await Promise.all([
    currentIdentity(),
    createSupabaseServerClient(),
  ]);
  const items = await listMemberCatalog({
    gateway: new SupabaseMemberCatalog(client),
    memberId: identity.id,
  });

  return {
    products: presentMemberCatalog(items),
    simulated: false,
  };
}
