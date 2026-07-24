import Link from "next/link";

import { Icon } from "@/components/icon";
import { ProductCover } from "@/features/products/product-cover";
import type { Product } from "@/mocks/types";

type ProductCardProps = {
  product: Product;
  onLocked: (product: Product, trigger: HTMLButtonElement) => void;
};

function CardContents({ product }: { product: Product }) {
  return (
    <>
      <ProductCover product={product} />
      <span className="product-card__body">
        <span className="product-card__meta">{product.eyebrow}</span>
        <strong>{product.name}</strong>
        <span
          className={`status-badge status-badge--${product.accessState}`}
        >
          <Icon name={product.accessState === "available" ? "check" : "lock"} />
          {product.accessState === "available" ? "Disponible" : "Bloqueado"}
        </span>
        {typeof product.progress === "number" ? (
          <span className="progress-block">
            <span className="progress-block__label">
              <span>Progreso simulado</span>
              <span>{product.progress}%</span>
            </span>
            <span
              aria-label={`Progreso simulado: ${product.progress}%`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={product.progress}
              className="progress-track"
              role="progressbar"
            >
              <span style={{ width: `${product.progress}%` }} />
            </span>
          </span>
        ) : null}
      </span>
    </>
  );
}

export function ProductCard({ product, onLocked }: ProductCardProps) {
  if (product.accessState === "unknown") {
    return (
      <div
        aria-busy="true"
        aria-label={`Resolviendo acceso a ${product.name}`}
        className="product-card product-card--unknown"
      >
        <span aria-hidden="true" className="product-card__skeleton-cover" />
        <span aria-hidden="true" className="product-card__skeleton-body">
          <span />
          <span />
        </span>
      </div>
    );
  }

  if (product.accessState === "available") {
    return (
      <Link
        aria-label={`${product.name} — Disponible`}
        className="product-card"
        href={`/productos/${product.slug}`}
      >
        <CardContents product={product} />
      </Link>
    );
  }

  return (
    <button
      aria-haspopup="dialog"
      aria-label={`${product.name} — Bloqueado. Ver información`}
      className="product-card product-card--locked"
      onClick={(event) => onLocked(product, event.currentTarget)}
      type="button"
    >
      <CardContents product={product} />
    </button>
  );
}
