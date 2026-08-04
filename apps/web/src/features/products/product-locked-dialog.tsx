"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";
import { ProductCover } from "@/features/products/product-cover";
import type { Product } from "@/mocks/types";

type ProductLockedDialogProps = {
  product: Product;
  returnFocusTo: HTMLElement | null;
  onClose: () => void;
  simulated: boolean;
};

const checkoutUrls: Partial<Record<Product["id"], string>> = {
  vuelve_ia: "https://go.centerpag.com/PPU38CQERFF",
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
  simulated,
}: ProductLockedDialogProps) {
  const { l } = useLocale();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [mounted, setMounted] = useState(false);
  const [notice, setNotice] = useState("");
  const checkoutUrl = checkoutUrls[product.id];
  const productTitle =
    product.id === "vuelve_ia"
      ? l(
          "DIAGNÓSTICO VUELVE IA",
          "DIAGNÓSTICO VUELVE IA",
          "VUELVE AI DIAGNOSTIC",
        )
      : product.name;

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
          aria-label={l(
            "Cerrar información del producto",
            "Fechar informações do produto",
            "Close product information",
          )}
          className="icon-button product-dialog__close"
          onClick={onClose}
          type="button"
        >
          <Icon name="close" />
        </button>
        <div className="product-dialog__cover">
          <ProductCover product={product} showDetails={false} />
        </div>
        <div className="product-dialog__content">
          <h2 id="locked-product-title" ref={titleRef} tabIndex={-1}>
            {productTitle}
          </h2>
          <p>{product.description}</p>
          <div className="dialog-note">
            <Icon name="lock" />
            <span>
              {l(
                simulated && !checkoutUrl
                  ? "En el producto real, una compra aprobada habilitará únicamente este acceso."
                  : "Este producto no está activo en tu cuenta. Una compra aprobada habilita únicamente el producto correspondiente.",
                simulated && !checkoutUrl
                  ? "No produto real, uma compra aprovada liberará apenas este acesso."
                  : "Este produto não está ativo na sua conta. Uma compra aprovada libera apenas o produto correspondente.",
                simulated && !checkoutUrl
                  ? "In the real product, an approved purchase will unlock only this access."
                  : "This product is not active on your account. An approved purchase unlocks only the corresponding product.",
              )}
            </span>
          </div>
          {checkoutUrl ? (
            <a
              className="button button--primary"
              href={checkoutUrl}
              rel="noreferrer"
              target="_blank"
            >
              {l(
                "Quiero desbloquear VUELVE IA",
                "Quero desbloquear a VUELVE IA",
                "I want to unlock VUELVE IA",
              )}
              <Icon name="external" />
            </a>
          ) : simulated ? (
            <button
              className="button button--primary"
              onClick={() =>
                setNotice(
                  l(
                    "Checkout no disponible en este prototipo estático.",
                    "Checkout indisponível neste protótipo estático.",
                    "Checkout is unavailable in this static prototype.",
                  ),
                )
              }
              type="button"
            >
              {l(
                "Ver oferta simulada",
                "Ver oferta simulada",
                "View simulated offer",
              )}
              <Icon name="external" />
            </button>
          ) : null}
          <p aria-live="polite" className="dialog-status">
            {notice}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
