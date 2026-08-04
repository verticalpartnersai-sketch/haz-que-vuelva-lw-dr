import "server-only";

import { presentMemberCatalog } from "@/features/products/product-presenter";
import { products as mockProducts } from "@/mocks/data";
import { SupabaseMemberCatalog } from "@/modules/catalog/adapters/supabase-member-catalog";
import { listMemberCatalog } from "@/modules/catalog/application/list-member-catalog";
import { currentIdentity } from "@/modules/identity/application/current-identity";
import { memberAiProducts } from "@/server/ai/member-ai-access";
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
  const aiAccess = environment().FEATURE_VUELVE_IA
    ? await memberAiProducts(identity.id)
    : null;
  const products = presentMemberCatalog(items).map((product) => {
    if (product.id !== "vuelve_ia" || !aiAccess) return product;
    return {
      ...product,
      accessState: aiAccess.hasAi
        ? "available" as const
        : aiAccess.hadAi
          ? "expired" as const
          : "locked" as const,
    };
  });

  return {
    products,
    simulated: false,
  };
}
