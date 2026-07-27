"use client";

import { useLocale } from "@/features/i18n/locale";

export function ProductPageHeader() {
  const { t } = useLocale();

  return (
    <header className="page-heading">
      <h1 data-route-heading tabIndex={-1}>
        {t("products.title")}
      </h1>
      <p>{t("products.description")}</p>
    </header>
  );
}
