import { Icon } from "@/components/icon";
import type { Product } from "@/mocks/types";

export function ProductCover({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  return (
    <div
      aria-label={`Portada abstracta de ${product.name}`}
      className={`product-cover product-cover--${product.coverVariant}`}
      role="img"
    >
      <span aria-hidden="true" className="product-cover__orbit" />
      <span aria-hidden="true" className="product-cover__line" />
      <span className="product-cover__eyebrow">{product.eyebrow}</span>
      <strong className="product-cover__title">{product.name}</strong>
      <span
        className={`product-cover__status product-cover__status--${product.accessState}`}
      >
        <Icon name={product.accessState === "available" ? "check" : "lock"} />
        {product.accessState === "available" ? "Disponible" : "Bloqueado"}
      </span>
      {compact ? null : (
        <span className="product-cover__mark">
          <Icon name="book" />
        </span>
      )}
    </div>
  );
}
