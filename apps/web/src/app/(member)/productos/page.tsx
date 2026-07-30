import type { Metadata } from "next";

import { ProductCatalog } from "@/features/products/product-catalog";
import { ProductPageHeader } from "@/features/products/product-page-header";
import { loadMemberProducts } from "@/server/catalog/load-member-products";

export const metadata: Metadata = {
  title: "Productos",
};

export default async function ProductsPage() {
  const { products, simulated } = await loadMemberProducts();
  return (
    <div className="page-frame page-frame--catalog page-frame--top">
      <ProductPageHeader />
      <ProductCatalog products={products} simulated={simulated} />
    </div>
  );
}
