"use client";

import { useState } from "react";

import { Icon } from "@/components/icon";
import { SelectControl } from "@/components/select-control";
import { ProductCard } from "@/features/products/product-card";
import { ProductLockedDialog } from "@/features/products/product-locked-dialog";
import { useLocale } from "@/features/i18n/locale";
import type { Product } from "@/mocks/types";

type CatalogState = "ready" | "loading" | "empty" | "error";

export function ProductCatalog({
  products,
  simulated,
}: {
  products: readonly Product[];
  simulated: boolean;
}) {
  const { l } = useLocale();
  const [state, setState] = useState<CatalogState>("ready");
  const [lockedProduct, setLockedProduct] = useState<Product | null>(null);
  const [returnFocusTo, setReturnFocusTo] = useState<HTMLElement | null>(null);

  return (
    <>
      {simulated ? (
        <div className="demo-toolbar">
          <span>
            <strong>
              {l("Vista simulada", "Visualização simulada", "Simulated view")}
            </strong>
            <small>
              {l(
                "Estos controles no consultan datos.",
                "Estes controles não consultam dados.",
                "These controls do not query data.",
              )}
            </small>
          </span>
          <SelectControl
            ariaLabel={l(
              "Estado del catálogo",
              "Estado do catálogo",
              "Catalog state",
            )}
            className="select-control--compact"
            onChange={setState}
            options={[
              { label: l("Catálogo", "Catálogo", "Catalog"), value: "ready" },
              {
                label: l("Cargando", "Carregando", "Loading"),
                value: "loading",
              },
              { label: l("Vacío", "Vazio", "Empty"), value: "empty" },
              { label: l("Error", "Erro", "Error"), value: "error" },
            ]}
            value={state}
          />
        </div>
      ) : null}

      {state === "ready" && products.length > 0 ? (
        <ul
          aria-label={l(
            "Todos los productos",
            "Todos os produtos",
            "All products",
          )}
          className="catalog-grid"
        >
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard
                onLocked={(selected, trigger) => {
                  setReturnFocusTo(trigger);
                  setLockedProduct(selected);
                }}
                product={product}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {state === "loading" ? (
        <div
          aria-busy="true"
          aria-label={l(
            "Cargando productos",
            "Carregando produtos",
            "Loading products",
          )}
          className="catalog-grid"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <div aria-hidden="true" className="skeleton-card" key={index}>
              <span />
              <span />
            </div>
          ))}
        </div>
      ) : null}

      {state === "empty" || (state === "ready" && products.length === 0) ? (
        <div className="feedback-panel">
          <Icon name="library" />
          <h2>
            {l(
              "Aún no hay productos para mostrar",
              "Ainda não há produtos para mostrar",
              "There are no products to show yet",
            )}
          </h2>
          <p>
            {l(
              simulated
                ? "Esta es una vista vacía simulada para revisar el estado del catálogo."
                : "Los productos activos aparecerán aquí cuando estén disponibles para tu cuenta.",
              simulated
                ? "Esta é uma visualização vazia simulada para revisar o estado do catálogo."
                : "Os produtos ativos aparecerão aqui quando estiverem disponíveis para sua conta.",
              simulated
                ? "This is a simulated empty view for reviewing the catalog state."
                : "Active products will appear here when they are available for your account.",
            )}
          </p>
          {simulated ? (
            <button
              className="button button--secondary"
              onClick={() => setState("ready")}
              type="button"
            >
              <Icon name="arrowLeft" />
              {l("Volver al catálogo", "Voltar ao catálogo", "Back to catalog")}
            </button>
          ) : null}
        </div>
      ) : null}

      {state === "error" ? (
        <div className="feedback-panel feedback-panel--error" role="alert">
          <Icon name="close" />
          <h2>
            {l(
              "No pudimos mostrar los productos",
              "Não foi possível mostrar os produtos",
              "We could not display the products",
            )}
          </h2>
          <p>
            {l(
              "Error simulado. No se realizó ninguna solicitud externa.",
              "Erro simulado. Nenhuma solicitação externa foi realizada.",
              "Simulated error. No external request was made.",
            )}
          </p>
          <button className="button button--secondary" onClick={() => setState("ready")} type="button">
            <Icon name="arrowRight" />
            {l("Intentar de nuevo", "Tentar novamente", "Try again")}
          </button>
        </div>
      ) : null}

      {lockedProduct ? (
        <ProductLockedDialog
          onClose={() => setLockedProduct(null)}
          product={lockedProduct}
          returnFocusTo={returnFocusTo}
          simulated={simulated}
        />
      ) : null}
    </>
  );
}
