"use client";

import { useState } from "react";

import { Icon } from "@/components/icon";
import { ProductCard } from "@/features/products/product-card";
import { ProductLockedDialog } from "@/features/products/product-locked-dialog";
import { products } from "@/mocks/data";
import type { Product } from "@/mocks/types";

type CatalogState = "ready" | "loading" | "empty" | "error";

export function ProductCatalog() {
  const [state, setState] = useState<CatalogState>("ready");
  const [lockedProduct, setLockedProduct] = useState<Product | null>(null);
  const [returnFocusTo, setReturnFocusTo] = useState<HTMLElement | null>(null);

  return (
    <>
      <div className="demo-toolbar">
        <span>
          <strong>Vista simulada</strong>
          <small>Estos controles no consultan datos.</small>
        </span>
        <label>
          <span className="sr-only">Estado del catálogo</span>
          <select
            onChange={(event) => setState(event.target.value as CatalogState)}
            value={state}
          >
            <option value="ready">Catálogo</option>
            <option value="loading">Cargando</option>
            <option value="empty">Vacío</option>
            <option value="error">Error</option>
          </select>
        </label>
      </div>

      {state === "ready" ? (
        <ul aria-label="Todos los productos" className="catalog-grid">
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
        <div aria-busy="true" aria-label="Cargando productos" className="catalog-grid">
          {Array.from({ length: 4 }, (_, index) => (
            <div aria-hidden="true" className="skeleton-card" key={index}>
              <span />
              <span />
            </div>
          ))}
        </div>
      ) : null}

      {state === "empty" ? (
        <div className="feedback-panel">
          <Icon name="library" />
          <h2>Aún no hay productos para mostrar</h2>
          <p>Esta es una vista vacía simulada para revisar el estado del catálogo.</p>
          <button className="button button--secondary" onClick={() => setState("ready")} type="button">
            Volver al catálogo
          </button>
        </div>
      ) : null}

      {state === "error" ? (
        <div className="feedback-panel feedback-panel--error" role="alert">
          <Icon name="close" />
          <h2>No pudimos mostrar los productos</h2>
          <p>Error simulado. No se realizó ninguna solicitud externa.</p>
          <button className="button button--secondary" onClick={() => setState("ready")} type="button">
            Intentar de nuevo
          </button>
        </div>
      ) : null}

      {lockedProduct ? (
        <ProductLockedDialog
          onClose={() => setLockedProduct(null)}
          product={lockedProduct}
          returnFocusTo={returnFocusTo}
        />
      ) : null}
    </>
  );
}
