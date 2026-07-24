import Link from "next/link";
import { notFound } from "next/navigation";

import { Icon } from "@/components/icon";
import { ProductDetail } from "@/features/products/product-detail";
import { getProductBySlug, products } from "@/mocks/data";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  if (product.accessState === "locked") {
    return (
      <div className="page-frame">
        <div className="feedback-panel">
          <Icon name="lock" />
          <h1 data-route-heading tabIndex={-1}>
            Producto bloqueado
          </h1>
          <p>
            El detalle no se muestra sin acceso. Vuelve al catálogo para abrir
            la información simulada de este producto.
          </p>
          <Link className="button button--secondary" href="/productos">
            Volver a Productos
          </Link>
        </div>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}
