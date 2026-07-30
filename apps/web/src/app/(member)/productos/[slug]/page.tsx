import Link from "next/link";
import { notFound } from "next/navigation";

import { Icon } from "@/components/icon";
import { ProductDetail } from "@/features/products/product-detail";
import { products as mockProducts } from "@/mocks/data";
import { loadMemberProducts } from "@/server/catalog/load-member-products";
import { environment } from "@/server/config/environment";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return mockProducts.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { products, simulated } = await loadMemberProducts();
  const product = products.find((candidate) => candidate.slug === slug);

  if (!product) notFound();
  const contentEnabled = environment().FEATURE_CONTENT;

  if (product.accessState === "locked") {
    return (
      <div className="page-frame">
        <div className="feedback-panel">
          <Icon name="lock" />
          <h1 data-route-heading tabIndex={-1}>
            Producto bloqueado
          </h1>
          <p>
            {simulated
              ? "El detalle no se muestra sin acceso. Vuelve al catálogo para abrir la información simulada de este producto."
              : "Tu cuenta no tiene acceso activo a este producto. Vuelve al catálogo para revisar tus productos disponibles."}
          </p>
          <Link className="button button--secondary" href="/productos">
            Volver a Productos
          </Link>
        </div>
      </div>
    );
  }

  let contentFileId: string | null = null;
  if (contentEnabled) {
    const client = await createSupabaseServerClient();
    const { data } = await client
      .from("content_files")
      .select("id,version,content_items!inner(product_code,active,kind)")
      .eq("content_items.product_code", product.id)
      .eq("content_items.active", true)
      .eq("content_items.kind", "pdf")
      .eq("mime_type", "application/pdf")
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    contentFileId = data?.id ?? null;
  }

  return (
    <ProductDetail
      contentEnabled={contentEnabled}
      contentFileId={contentFileId}
      product={product}
    />
  );
}
