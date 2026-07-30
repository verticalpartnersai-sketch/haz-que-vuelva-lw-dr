"use client";

import { Icon } from "@/components/icon";
import { useLocale } from "@/features/i18n/locale";

export default function ProductsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { l } = useLocale();

  return (
    <div className="page-frame page-frame--catalog page-frame--top">
      <div className="feedback-panel feedback-panel--error" role="alert">
        <Icon name="close" />
        <h1 data-route-heading tabIndex={-1}>
          {l(
            "No pudimos cargar tus productos",
            "Não foi possível carregar seus produtos",
            "We could not load your products",
          )}
        </h1>
        <p>
          {l(
            "Tu acceso no cambió. Inténtalo de nuevo en unos instantes.",
            "Seu acesso não mudou. Tente novamente em alguns instantes.",
            "Your access has not changed. Try again in a moment.",
          )}
        </p>
        <button className="button button--secondary" onClick={reset} type="button">
          <Icon name="arrowRight" />
          {l("Intentar de nuevo", "Tentar novamente", "Try again")}
        </button>
      </div>
    </div>
  );
}
