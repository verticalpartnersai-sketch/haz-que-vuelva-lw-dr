"use client";

import Link from "next/link";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import { ProductCover } from "@/features/products/product-cover";
import type { Product } from "@/mocks/types";

type ProductCardProps = {
  product: Product;
  onLocked: (product: Product, trigger: HTMLButtonElement) => void;
  showCoverDetails?: boolean;
};

function CardContents({
  product,
  showCoverDetails,
}: {
  product: Product;
  showCoverDetails: boolean;
}) {
  const { l, t } = useLocale();

  return (
    <>
      <ProductCover product={product} showDetails={showCoverDetails} />
      <span className="product-card__body">
        <span className="product-card__meta">{product.eyebrow}</span>
        <strong>{product.name}</strong>
        <span
          className={`status-badge status-badge--${product.accessState}`}
        >
          <Icon name={product.accessState === "available" ? "check" : "lock"} />
          {product.accessState === "available"
            ? t("status.available")
            : t("status.locked")}
        </span>
        {typeof product.progress === "number" ? (
          <span className="progress-block">
            <span className="progress-block__label">
              <span>
                {l(
                  "Progreso simulado",
                  "Progresso simulado",
                  "Simulated progress",
                )}
              </span>
              <span>{product.progress}%</span>
            </span>
            <span
              aria-label={`${l(
                "Progreso simulado",
                "Progresso simulado",
                "Simulated progress",
              )}: ${product.progress}%`}
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

export function ProductCard({
  product,
  onLocked,
  showCoverDetails = false,
}: ProductCardProps) {
  const { l, t } = useLocale();

  if (product.accessState === "unknown") {
    return (
      <div
        aria-busy="true"
        aria-label={`${l(
          "Resolviendo acceso a",
          "Resolvendo acesso a",
          "Resolving access to",
        )} ${product.name}`}
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
        aria-label={`${product.name} — ${t("status.available")}`}
        className="product-card"
        href={`/productos/${product.slug}`}
      >
        <CardContents product={product} showCoverDetails={showCoverDetails} />
      </Link>
    );
  }

  return (
    <button
      aria-haspopup="dialog"
      aria-label={`${product.name} — ${t("status.locked")}. ${l(
        "Ver información",
        "Ver informações",
        "View information",
      )}`}
      className="product-card product-card--locked"
      onClick={(event) => onLocked(product, event.currentTarget)}
      type="button"
    >
      <CardContents product={product} showCoverDetails={showCoverDetails} />
    </button>
  );
}
