import type { Metadata } from "next";

import { ProductCatalog } from "@/features/products/product-catalog";
import { ProductPageHeader } from "@/features/products/product-page-header";

export const metadata: Metadata = {
  title: "Productos",
};

export default function ProductsPage() {
  return (
    <div className="page-frame page-frame--catalog page-frame--top">
      <ProductPageHeader />
      <ProductCatalog />
    </div>
  );
}
