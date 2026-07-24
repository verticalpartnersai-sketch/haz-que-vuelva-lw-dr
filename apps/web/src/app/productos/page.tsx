import type { Metadata } from "next";

import { ProductCatalog } from "@/features/products/product-catalog";

export const metadata: Metadata = {
  title: "Productos",
};

export default function ProductsPage() {
  return (
    <div className="page-frame page-frame--catalog">
      <header className="page-heading">
        <span className="eyebrow">Biblioteca completa</span>
        <h1 data-route-heading tabIndex={-1}>
          Productos
        </h1>
        <p>
          Reúne productos principales, complementos y productos adicionales.
          Todos los datos de esta vista son simulados.
        </p>
      </header>
      <ProductCatalog />
    </div>
  );
}
