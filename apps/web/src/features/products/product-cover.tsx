"use client";

import Image from "next/image";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import type { Product } from "@/mocks/types";

export function ProductCover({
  product,
  compact = false,
  showDetails = true,
}: {
  product: Product;
  compact?: boolean;
  showDetails?: boolean;
}) {
  const { t } = useLocale();

  return (
    <div
      aria-label={`Portada de ${product.name}`}
      className={`product-cover${
        showDetails ? "" : " product-cover--image-only"
      }`}
      role="img"
    >
      {product.coverImage ? (
        <Image
          alt=""
          className="product-cover__image"
          fill
          quality={90}
          sizes="(max-width: 639px) 82vw, (max-width: 1023px) 42vw, 340px"
          src={product.coverImage}
        />
      ) : (
        <span aria-hidden="true" className="product-cover__image-placeholder">
          <Icon name="image" weight="light" />
        </span>
      )}
      {showDetails ? (
        <span className="product-cover__content">
          <span className="product-cover__eyebrow">{product.eyebrow}</span>
          <strong className="product-cover__title">{product.name}</strong>
          <span
            className={`product-cover__status status-badge status-badge--${product.accessState}`}
          >
            <Icon name={product.accessState === "available" ? "check" : "lock"} />
            {product.accessState === "available"
              ? t("status.available")
              : product.accessState === "expired"
                ? t("status.expired")
                : t("status.locked")}
          </span>
          {compact ? null : (
            <span className="product-cover__mark">
              <Icon name="book" />
            </span>
          )}
        </span>
      ) : null}
    </div>
  );
}
