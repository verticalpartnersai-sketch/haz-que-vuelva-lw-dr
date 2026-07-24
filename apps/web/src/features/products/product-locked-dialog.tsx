"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/icon";
import { ProductCover } from "@/features/products/product-cover";
import type { Product } from "@/mocks/types";

type ProductLockedDialogProps = {
  product: Product;
  returnFocusTo: HTMLElement | null;
  onClose: () => void;
};

const focusableSelector = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function ProductLockedDialog({
  product,
  returnFocusTo,
  onClose,
}: ProductLockedDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [mounted, setMounted] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const appRoot = document.getElementById("application-root");
    const previousOverflow = document.body.style.overflow;
    titleRef.current?.focus();
    appRoot?.setAttribute("inert", "");
    appRoot?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "hidden";

    return () => {
      appRoot?.removeAttribute("inert");
      appRoot?.removeAttribute("aria-hidden");
      document.body.style.overflow = previousOverflow;
      returnFocusTo?.focus();
    };
  }, [mounted, returnFocusTo]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        aria-labelledby="locked-product-title"
        aria-modal="true"
        className="product-dialog"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
            return;
          }
          if (event.key !== "Tab") return;

          const controls = dialogRef.current?.querySelectorAll<HTMLElement>(
            focusableSelector,
          );
          if (!controls?.length) {
            event.preventDefault();
            return;
          }

          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        ref={dialogRef}
        role="dialog"
      >
        <button
          aria-label="Cerrar información del producto"
          className="icon-button product-dialog__close"
          onClick={onClose}
          type="button"
        >
          <Icon name="close" />
        </button>
        <div className="product-dialog__cover">
          <ProductCover product={product} />
        </div>
        <div className="product-dialog__content">
          <span className="eyebrow">Producto bloqueado · simulación</span>
          <h2 id="locked-product-title" ref={titleRef} tabIndex={-1}>
            {product.name}
          </h2>
          <p>{product.description}</p>
          <div className="dialog-note">
            <Icon name="lock" />
            <span>
              En el producto real, una compra aprobada habilitará únicamente
              este acceso.
            </span>
          </div>
          <button
            className="button button--primary"
            onClick={() =>
              setNotice("Checkout no disponible en este prototipo estático.")
            }
            type="button"
          >
            Ver oferta simulada
            <Icon name="external" />
          </button>
          <p aria-live="polite" className="dialog-status">
            {notice}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
