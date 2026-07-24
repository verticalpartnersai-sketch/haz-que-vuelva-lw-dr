"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/icon";
import { ProductCard } from "@/features/products/product-card";
import { ProductLockedDialog } from "@/features/products/product-locked-dialog";
import type { Product } from "@/mocks/types";

export function ProductRail({
  title,
  products,
}: {
  title: string;
  products: readonly Product[];
}) {
  const railRef = useRef<HTMLUListElement>(null);
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [lockedProduct, setLockedProduct] = useState<Product | null>(null);
  const [returnFocusTo, setReturnFocusTo] = useState<HTMLElement | null>(null);

  function measure() {
    const rail = railRef.current;
    if (!rail) return;
    setHasOverflow(rail.scrollWidth > rail.clientWidth + 4);
    setCanBack(rail.scrollLeft > 4);
    setCanForward(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4);
  }

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    measure();
    return () => observer.disconnect();
  }, []);

  function move(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * rail.clientWidth * 0.82,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  return (
    <section aria-labelledby={`rail-${title.replaceAll(" ", "-")}`} className="product-rail">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Productos</span>
          <h2 id={`rail-${title.replaceAll(" ", "-")}`}>{title}</h2>
        </div>
        <div className="rail-controls">
          {hasOverflow ? (
            <button
              aria-disabled={!canBack}
              aria-label={`Ver productos anteriores en ${title}`}
              className="icon-button"
              onClick={() => {
                if (canBack) move(-1);
              }}
              type="button"
            >
              <Icon name="arrowLeft" />
            </button>
          ) : null}
          {hasOverflow ? (
            <button
              aria-disabled={!canForward}
              aria-label={`Ver más productos en ${title}`}
              className="icon-button"
              onClick={() => {
                if (canForward) move(1);
              }}
              type="button"
            >
              <Icon name="arrowRight" />
            </button>
          ) : null}
        </div>
      </div>
      {products.length === 0 ? (
        <div className="feedback-panel">
          <Icon name="library" />
          <h3>No hay productos en este carril</h3>
          <p>Cuando exista contenido de este grupo, aparecerá aquí.</p>
        </div>
      ) : (
        <ul className="product-rail__list" onScroll={measure} ref={railRef}>
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
      )}
      {lockedProduct ? (
        <ProductLockedDialog
          onClose={() => setLockedProduct(null)}
          product={lockedProduct}
          returnFocusTo={returnFocusTo}
        />
      ) : null}
    </section>
  );
}
